#pragma once

#include "Common/CommonHeaders.h"
#include <Common/Util/CommonTypes.h>

struct Comparand
{
    float num;
    std::string targetRegister;
    bool getX = false, getY = false, getZ = false;
    float x, y, z;
};

struct Comparands
{
    std::string left;
    std::string right;
};


void M106(const std::string& args);
bool compareOneToOne(Comparand& leftComp, const std::string& compOperator, Comparand& rightComp);
bool compareLikeToLike(Comparand& leftComp, const std::string& compOperator, Comparand& rightComp);
bool compareOneToMany(Comparand& leftComp, const std::string& compOperator, Comparand& rightComp);
bool checkLikeForLike(Comparand& leftComp, Comparand& rightComp);
float getAxisValue(Comparand& comp);
std::vector<std::pair<std::string, Point3>> fetchAxesValues();
Comparands getComparands(const std::string& compareStatement);
Comparand parseComparand(const std::string& comparand);
int countAxes(Comparand& comp);
std::string getRegister(const std::string& comparand);
bool checkForAxis(const std::string& comparand, const std::string& axis);
bool runComparison(Comparand& leftComp, const std::string& compOperator, Comparand& rightComp);
std::string getCompOperator(const std::string& compareStatement);
std::string getCompareStatement(const std::string& args);
std::string getErrorMessage(const std::string& str);
void throwException(const std::string& errorMessage);
void sendSuccessMessage();
