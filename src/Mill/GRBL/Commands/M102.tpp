#include <Mill/GRBL/exprtk.hpp>
#include <Common/Util/OSUtil.h>
#include <Common/Logger.h>
#include <Mill/MillException.h>
#include <Mill/GRBL/Regex.h>
#include <Mill/GRBL/MillConnection.h>
#include <MillDaemon.h>
#include <Mill/Display/MillDisplayManager.h>
#include <list>

using namespace MillLogger;
using std::string;
using std::to_string;

// Command: M102 GaaU [exprtk expression]
// Example : M102 G556X G54X + (2 * G55X)
// Name : Perform arbitrary math on WCS registers
// Summary : (Supported in CRWrite Only) Evaluate the exprtk expression at time of execution, pulling variable values from the WCS registers,
//           and write the result to the specified output register.
//
// Both the output register (first argument) and the input registers (variables within the second argument) must be formatted as G5[4-9][X,Y,Z].
// Theoretically this is case-insensitive, but we recommend you capitalize both the G and the X,Y,Z.
// Everything after the first argument is treated as an exprtk expression. If this is well-formed, then it will compile and the result will be
// written to the output register.
// Exprtk allows for very complicated expressions. We have not thoroughly tested this beyond simple expressions.
// Note that exprtk does allow for assignment in its expressions, e.g. G56X := G54X + G55X or G57X += 10. CRWrite will not actually execute
// these assignments, i.e. the registers being "assigned" here will not actually be written. Only the first argument output register will be
// written to, and only with the result of exprtk's value() function run on the full exprtk expression.
//
// Exprtk reference: http://www.partow.net/programming/exprtk/
//
// The code quality here is likely quite poor and would benefit from a cleanup pass.

template <typename T>
void M102(const string& args) {
	MILL_LOG("START M102");

  //Get the command without whitespace or the preceding "M102"
  //There is code meant to perform this elsewhere which we use in other M-commands, e.g. M100, but that code also strips items in parens, which we want
  //to preserve here since they could be part of the exprtk expression.
	std::string line = args;
  line = std::regex_replace(line, std::regex("M102"), "");
  line = std::regex_replace(line, std::regex("m102"), "");
  line = std::regex_replace(line, std::regex("\\s+"), "");

  //Extract the destination register
  std::string dest_register = line.substr(0,4);
  std::regex dest_reg_regex("[Gg]5[4-9][X-Zx-z]");
  if(!std::regex_match(dest_register, dest_reg_regex))
  {
		MillDisplayManager::AddLine(ELineType::ERR, "M102 Syntax Error - Invalid destination register. Must be G54-59(X,Y,Z)");
		throw MillException(MillException::M102_INVALID_DEST_REGISTER);
  }
  line.erase(0,4);

  //http://www.partow.net/programming/exprtk/
	typedef exprtk::symbol_table<T> symbol_table_t;
	typedef exprtk::expression<T>   expression_t;
	typedef exprtk::parser<T>       parser_t;
	const std::string expression_string = line;
 
	auto machine = MillDaemon::GetInstance().GetConnection();
	auto offsets = machine->GetOffsets();
  if (offsets.size() == 0) 
  { 
		MillDisplayManager::AddLine(ELineType::ERR, "M102 Failed - Could not get offsets");
		throw MillException(MillException::M102_OFFSETS_FAIL);
  }

  //Assign variable from offsets
  symbol_table_t symbol_table;
  //Identify the variables (WCS variables like G54X, G55Y, G56Z)
  std::regex var_regex("[Gg]5[4-9][X-Zx-z]");
  std::smatch var_matches;
  string::const_iterator varStart(line.cbegin());

  T* var_list = new T[18]; //If we don't store the variables somewhere they go out of scope. Setting to 18 as the max number of possible variables
  string* var_names = new string[18]; //Holds all possible variable names
  int iterator = 0;
  string new_line = line;
  while(std::regex_search(varStart, line.cend(), var_matches, var_regex))
  {
    varStart = var_matches.suffix().first;

    string var_name = var_matches[0];
    string old_var_name = var_matches[0];
    //Transform var_name to all uppercase
    for (auto & c: var_name) c = toupper(c);
    //Replace old var name with the uppercase version
    new_line = std::regex_replace(new_line, std::regex(old_var_name), var_name);

    //If we already found this variable, exit early.
    bool found_match = false;
    for(int x = 0; x < 18; x++)
    {
      if(var_names[x] == var_name) 
      {
        found_match = true;
      }
    }

    if(found_match)
    {
      continue;
    }

    int offset = (var_name.at(2) - '0') - 4;
    int coord = tolower(var_name.at(3));
    //x: 120, y: 121, z:  122
    if(coord == 120)
    {
      var_list[iterator] = T(offsets[offset].second.x);
    }
    else if(coord == 121)
    {
      var_list[iterator] = T(offsets[offset].second.y);
    }
    else if(coord == 122)
    {
      var_list[iterator] = T(offsets[offset].second.z);
    }

    MILL_LOG("Input: " + var_name + " => " + to_string(var_list[iterator]));
    var_names[iterator] = var_name;
    symbol_table.add_variable(var_name, var_list[iterator]);

    iterator++;
  }

  line = new_line;
  MILL_LOG("Parsed exprtk expression: " + line);

	expression_t expression;
	expression.register_symbol_table(symbol_table);

	parser_t parser;
  if (!parser.compile(expression_string, expression))
  {
		MillDisplayManager::AddLine(ELineType::ERR, "M102 Syntax Error - Invalid exprtk expression");
		throw MillException(MillException::M102_INVALID_EXPRTK_EXPRESSION);
  }

  T result = expression.value();
  MILL_LOG("Evaluated result: " + to_string(result));

  // Update the destination register
  int dest_offset = (dest_register.at(2) - '0') - 3;
  string dest_coord = dest_register.substr(3,1);
	const string output = "G10 L2 P" + to_string(dest_offset) + " " + dest_coord + to_string(result);
	MillDaemon::GetInstance().ExecuteCommand(output);

	MILL_LOG("END M102");
	MillDisplayManager::AddLine(ELineType::READ, "M102 Complete");
}
