#include "Common/CommonHeaders.h"
#include <Common/Logger.h>
#include "M106.h"
#include <MillDaemon.h>
#include <Mill/Display/MillDisplayManager.h>
#include <Mill/MillException.h>
#include <regex>
#include <Common/Util/CommonTypes.h>
#include <iomanip>
#include <string>


// There is a known issue where a number cannot be the left comparand, ever

void M106(const std::string& args) 
{
    //process args for use
    std::string compareStatement;
    std::string compOperator;
    std::string errorMessage;
    Comparands comparands;
    bool result;

    std::string str = args;
    str = std::regex_replace(str, std::regex("M106\\s"), "");
    str = std::regex_replace(str, std::regex("m106\\s"), "");

    compareStatement = getCompareStatement(str);
    errorMessage = getErrorMessage(str);    
    comparands = getComparands(compareStatement);
    compOperator = getCompOperator(compareStatement);
    Comparand leftComp = parseComparand(comparands.left);
    Comparand rightComp = parseComparand(comparands.right);
    result = runComparison(leftComp, compOperator, rightComp);
    //if false, throw exception/Alarm
    if (!result) {
        throwException(errorMessage);
    } else {
        sendSuccessMessage();
    }
    //if true, continue

}

Comparands getComparands(const std::string& compareStatement)
{
    Comparands comparands;

    // get left comparand
    std::regex regLeft ("G5[4-9][xyz]{1,3}\\s?(?=[!<>=])", std::regex_constants::icase);
    std::smatch matchLeft;
    std::regex_search(compareStatement, matchLeft, regLeft);

    // Currently not able to have number as left comparand
    // if (matchLeft.empty()) {
    //     std::regex regLeft ("-?\\d+\\.?\\d?(?=[!<>=]");
    //     std::regex_search(compareStatement, matchLeft, regLeft);
    // }

    if (matchLeft.empty()) {
        throw MillException(MillException::M106_MALFORMED_TEST);
    }

    comparands.left = matchLeft[0];

    // get right comparand
    std::string str = compareStatement;
    std::reverse(str.begin(), str.end());
    std::regex regRight ("[xyz]{1,3}[4-9]5G\\s?(?=[<>=])", std::regex_constants::icase);
    std::smatch matchRight;
    std::regex_search(str, matchRight, regRight);

    if (matchRight.empty()) {
        std::regex regNumRight ("\\d+\\.?\\d?-?\\s?(?=[<>=])");
        std::smatch matchNumRight;
        std::regex_search(str, matchNumRight, regNumRight);
        matchRight = matchNumRight;
    }
    if (matchRight.empty()) {
        throw MillException(MillException::M106_MALFORMED_TEST);
    }

    comparands.right = matchRight[0];
    std::reverse(comparands.right.begin(), comparands.right.end());

    return comparands;
}

bool runComparison(Comparand& leftComp, const std::string& compOperator, Comparand& rightComp)
{
    bool result;
    int leftAxisCount = countAxes(leftComp);
    int rightAxisCount = countAxes(rightComp);
    auto wcsResponse = fetchAxesValues();
    // get xyz for each comparand
    for (auto i : wcsResponse) {
        if (i.first == leftComp.targetRegister) {
            leftComp.x = i.second.x;
            leftComp.y = i.second.y;
            leftComp.z = i.second.z;
        }
        if (i.first == rightComp.targetRegister) {
            rightComp.x = i.second.x;
            rightComp.y = i.second.y;
            rightComp.z = i.second.z;
        }
    }
    // find type of comparison (one to one, kind to kind, one to many)
    
    if (leftAxisCount <= 1 && rightAxisCount <= 1) {
        result = compareOneToOne(leftComp, compOperator, rightComp);
    }
    else if (leftAxisCount == rightAxisCount) {
        result = compareLikeToLike(leftComp, compOperator, rightComp);
    }
    else if ((leftAxisCount <= 1 || rightAxisCount <= 1) && (leftAxisCount > 1 || rightAxisCount > 1)) {
        result = compareOneToMany(leftComp, compOperator, rightComp);
    } 
    else {
        throw MillException(MillException::M106_MALFORMED_TEST);
    }
    
    // do comparisons
    //result = true;
    return result;
}

int countAxes(Comparand& comp)
{
    int count = 0;
    if (comp.getX) {
        ++count;
    }
    if (comp.getY) {
        ++count;
    }
    if (comp.getZ) {
        ++count;
    }
    return count;
}

float getAxisValue(Comparand& comp)
{
    int axisCount = countAxes(comp);
    float value;

    if (axisCount == 0) {
        value = comp.num;
    } 
    else if (axisCount == 1) {
        if (comp.getX){
            value = comp.x;
        }
        if (comp.getY){
            value = comp.y;
        }
        if (comp.getZ){
            value = comp.z;
        }
    }
    return value;
}

bool compareOneToOne(Comparand& leftComp, const std::string& compOperator, Comparand& rightComp)
{
    bool result;
    int leftAxisCount = countAxes(leftComp);
    int rightAxisCount = countAxes(rightComp);
    float leftValue, rightValue;

    leftValue = getAxisValue(leftComp);
    rightValue = getAxisValue(rightComp);

    // adding 1 to each value to fix the problem of comparing -0 and +0, which are not equal
    // ?confirm that this wont cause a bug due to float math results?
    ++leftValue;
    ++rightValue;

    if (compOperator == "<") {
        result = leftValue < rightValue;
    }
    else if (compOperator == "<=") {
        result = leftValue <= rightValue;
    }
    else if (compOperator == ">") {
        result = leftValue > rightValue;
        std::string resultStr = result ? "true" : "false";
    }
    else if (compOperator == ">=") {
        result = leftValue >= rightValue;
    }
    else if (compOperator == "==") {
        result = leftValue == rightValue;
    }
    else if (compOperator == "!=") {
        result = leftValue != rightValue;
    }
    else { 
        throw MillException(MillException::M106_MALFORMED_TEST);
    }
    return result;
}

bool compareLikeToLike(Comparand& leftComp, const std::string& compOperator, Comparand& rightComp)
{
    bool isLikeForLike = true;
    bool compareIsTrue = true;
    Comparand tempLeftComp, tempRightComp;
    //check to make sure like for like
    
    isLikeForLike = checkLikeForLike(leftComp, rightComp);

    if (!isLikeForLike) {
        throw MillException(MillException::M106_MALFORMED_TEST);
    }

    tempLeftComp.targetRegister = leftComp.targetRegister;
    tempRightComp.targetRegister = rightComp.targetRegister;

    if (leftComp.getX) {
        tempLeftComp.getX = true;
        tempLeftComp.x = leftComp.x;
        tempRightComp.getX = true;
        tempRightComp.x = rightComp.x;
        compareIsTrue = compareOneToOne(tempLeftComp, compOperator, tempRightComp);
        tempLeftComp.getX = false;
        tempRightComp.getX = false;
    }

    if (compareIsTrue && leftComp.getY) {
        tempLeftComp.getY = true;
        tempLeftComp.y = leftComp.y;
        tempRightComp.getY = true;
        tempRightComp.y = rightComp.y;
        compareIsTrue = compareOneToOne(tempLeftComp, compOperator, tempRightComp);
        tempLeftComp.getY = false;
        tempRightComp.getY = false;
    }

    if (compareIsTrue && leftComp.getZ) {
        tempLeftComp.getZ = true;
        tempLeftComp.z = leftComp.z;
        tempRightComp.getZ = true;
        tempRightComp.z = rightComp.z;
        compareIsTrue = compareOneToOne(tempLeftComp, compOperator, tempRightComp);
        tempLeftComp.getZ = false;
        tempRightComp.getZ = false;  
    }
    //run one to one for each like

    return compareIsTrue;
}

bool compareOneToMany(Comparand& leftComp, const std::string& compOperator, Comparand& rightComp)
{
    bool compareIsTrue;
    Comparand tempLeftComp, tempRightComp;
    int leftCompAxisCount = countAxes(leftComp);
    int rightCompAxisCount = countAxes(rightComp);


    if (leftCompAxisCount <= 1) {
        if (rightComp.getX) {
            tempRightComp.targetRegister = rightComp.targetRegister;
            tempRightComp.getX = true;
            tempRightComp.x = rightComp.x;
            compareIsTrue = compareOneToOne(leftComp, compOperator, tempRightComp);
            tempRightComp.getX = false;

            if (compareIsTrue && rightComp.getY) {
                tempRightComp.getY = true;
                tempRightComp.y = rightComp.y;
                compareIsTrue = compareOneToOne(leftComp, compOperator, tempRightComp);
                tempRightComp.getY = false;

                if (compareIsTrue && rightComp.getZ) {
                    tempRightComp.getZ = true;
                    tempRightComp.z = rightComp.z;
                    compareIsTrue = compareOneToOne(leftComp, compOperator, tempRightComp);
                }
            }
        }
    } 
    else {
        if (leftComp.getX) {
            tempLeftComp.targetRegister = leftComp.targetRegister;
            tempLeftComp.getX = true;
            tempLeftComp.x = leftComp.x;
            compareIsTrue = compareOneToOne(tempLeftComp, compOperator, rightComp);
            tempLeftComp.getX = false;

            if (compareIsTrue && leftComp.getY) {
                tempLeftComp.getY = true;
                tempLeftComp.y = leftComp.y;
                compareIsTrue = compareOneToOne(tempLeftComp, compOperator, rightComp);
                tempLeftComp.getY = false;

                if (compareIsTrue && leftComp.getZ) {
                    tempLeftComp.getZ = true;
                    tempLeftComp.z = leftComp.z;
                    compareIsTrue = compareOneToOne(tempLeftComp, compOperator, rightComp);
                }
            }
        }
    }

    return compareIsTrue;
}

bool checkLikeForLike(Comparand& leftComp, Comparand& rightComp)
{
    if (leftComp.getX) {
        if (!rightComp.getX) {
            return false;
        }
    }
    if (leftComp.getY) {
        if (!rightComp.getY) {
            return false;
        }
    }
    if (leftComp.getZ) {
        if (!rightComp.getZ) {
            return false;
        }
    }
    return true;
}

Comparand parseComparand(const std::string& comparand)
{
    Comparand result;

    //check if comparand is a number

    std::regex reg ("[^\\s\\.\\-\\d]", std::regex_constants::icase);
    std::smatch match;
    std::regex_search(comparand, match, reg);
    if (match.empty()) {
        // it is a number!
        result.num = std::stof(comparand);

    } else {
        // initialize Comparand
        // asign register
        result.targetRegister = getRegister(comparand);
        transform(result.targetRegister.begin(), result.targetRegister.end(), result.targetRegister.begin(), ::toupper);
        //asign x
        result.getX = checkForAxis(comparand, "x");
        //asign y
        result.getY = checkForAxis(comparand, "y");
        //asign z
        result.getZ = checkForAxis(comparand, "z");
    }
    return result;
}

std::vector<std::pair<std::string, Point3>> fetchAxesValues()
{
    auto machine = MillDaemon::GetInstance().GetConnection();
    auto offsets = machine->GetOffsets();
    return offsets;
}

std::string getCompOperator(const std::string& compareStatement)
{
    std::string returnStr;
    std::regex reg ("[!<>=][=]?");
    std::smatch match;
    std::regex_search(compareStatement, match, reg);
    returnStr = match[0];
    if (match.empty()) {
        throw MillException(MillException::M106_MALFORMED_TEST);
    }
    return returnStr;
}

std::string getCompareStatement(const std::string& args)
{
    std::string result;
    
    std::regex reg (".*(?=error)", std::regex_constants::icase);
    std::smatch match;
    std::regex_search(args, match, reg);
    result = match[0];
    if (match.empty()) {
        throw MillException(MillException::M106_MALFORMED_TEST);
    }
    return result;
}

std::string getRegister(const std::string& comparand)
{
    std::string returnStr;

    std::regex reg ("g5[4-9]", std::regex_constants::icase);
    std::smatch match;
    std::regex_search(comparand, match, reg);
    returnStr = match[0];
    return returnStr;
}

bool checkForAxis(const std::string& comparand, const std::string& axis)
{
    std::regex reg (axis, std::regex_constants::icase);
    std::smatch match;
    std::regex_search(comparand, match, reg);
    bool hasAxis = !match.empty();
    return hasAxis;
}

std::string getErrorMessage(const std::string& str)
{
    std::string returnStr;
    std::string strCopy= str;
    std::reverse(strCopy.begin(), strCopy.end());
    std::regex reg (".*(?=:rorre)", std::regex_constants::icase);
    std::smatch match;
    std::regex_search(strCopy, match, reg);
    returnStr = match[0];
    std::reverse(returnStr.begin(), returnStr.end());
    return returnStr;
}

void throwException(const std::string& errorMessage)
{
    MILL_LOG("M106 - Test Failed");
    throw MillException(MillException::M106_BOOL_TEST_FAIL, errorMessage);
} 

void sendSuccessMessage()
{
    // Dont show success message for release version
    //    MillDisplayManager::AddLine(ELineType::READ, "M106 Check Passed");

    MILL_LOG("M106 - Success!");
}