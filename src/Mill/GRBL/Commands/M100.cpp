#include "M100.h"
#include <Common/Util/OSUtil.h>
#include <Common/Logger.h>
#include <Mill/MillException.h>
#include <Mill/GRBL/Regex.h>
#include <Mill/GRBL/MillConnection.h>
#include <MillDaemon.h>
#include <Mill/Display/MillDisplayManager.h>
using namespace MillLogger;
using std::string;
using std::to_string;

float CalcCenterValue(const float x, const float y);
int DeterminePCode(const string& gCode);
std::vector<Point3> LoadPoints(const string& gIn1, const string& gIn2 );
void VerifyRange(const float fval0, const float fval1, const string& gOut, const char axisOut);

// Command: M100 Gaa U Gbb V Gcc W
// Example : M100 G55 X G56 X G59 X
// Name : Find midpoint and store to WCS
// Summary : (Supported in CRWrite Only) Find the midpoint between WCS Gaa's U axis and WCS Gbb's V axis, then store result in WCS Gcc's W axis.
//
// Changes an axis value of a coordinate system to the midpoint of 2 other coordinate systems.
// The example would set the G59 coordinate system's X axis value to be equal to the midpoint of G55's X axis and G56's X axis.
// Example command that would be sent to mill to update the coordinate system's axis value: G10 L2 P1 X3.5 Y17.2
void M100(const string& args) {
	MillDisplayManager::AddLine(ELineType::WRITE, "M100 In Progress...");
	MILL_LOG("BEGIN - args: " + args);

	// Arg format: G55 X G56 Y G57 Z
	const string gIn1 = args.substr(0, 3);
	const char axisIn = args[3];
	const string gIn2 = args.substr(4, 3);
	const string gOut = args.substr(8, 3);
	const char axisOut = args[11];
	MILL_LOG("gIn1: " + gIn1 + " " + axisIn + " gIn2: " + gIn2 + " " + axisIn + " gOut: " + gOut + " " + axisOut);

	// Set the pcode for the corresponding G value
	const int pCode = DeterminePCode(gOut);
	MILL_LOG("pCode: " + to_string(pCode));

	// Get the 2 points
	const std::vector<Point3> m100points = LoadPoints(gIn1, gIn2);
	MILL_LOG("Points size: " + to_string(m100points.size()));
	if (m100points.empty()) { 
		MillDisplayManager::AddLine(ELineType::ERR, "M100 Failed");
		throw MillException(MillException::M100_OUTOFRANGE);
	}

	const float val1 = GetAxisValue(m100points.at(0), axisIn);
	const float val2 = GetAxisValue(m100points.at(1), axisIn);
	auto msg = string{ axisIn };
	MILL_LOG(msg + " axis - " + gIn1 + ":" + to_string(val1) + " <--> " + gIn2 + ":" + to_string(val2));
	MILL_LOG("Axis values: " + to_string(val1) + ", " + to_string(val2));

	// Calculate center value
	char buf[50];
	snprintf(buf, 50, "%.3f", CalcCenterValue(val1, val2));
	const string centerValueStr = buf;
	MILL_LOG("Center value: " + centerValueStr);

	// Update the output G value
	const string output = "G10 L2 P" + to_string(pCode) + " " + axisOut + centerValueStr;

	MILL_LOG(output);
	MillDaemon::GetInstance().ExecuteCommand(output);

	// Check that new point system has correct values.
	VerifyRange(val1, val2, gOut, axisOut);

	MILL_LOG("END");
	MillDisplayManager::AddLine(ELineType::READ, "M100 Complete");
}

float CalcCenterValue(const float x, const float y) {
	const float x1 = x > y ? x : y;
	const float x2 = x > y ? y : x;

	const float axisCenter = x2 + ((x1 - x2) / 2);

	MILL_LOG("x: " + to_string(x) + " y: " + to_string(y) + " center: " + to_string(axisCenter));

	//std::cout << x2 << " + " << "((" << x1 << " - " << x2 << ") div 2) = " << axisCenter << std::endl;

	return axisCenter;
}

int DeterminePCode(const string& gCode) {
	if (gCode.size() < 3) { return -1; }
	return gCode[2] - '3';	// '4' - '9' yield 1 - 6
}

std::vector<Point3> LoadPoints(const string& gIn1, const string& gIn2) {
	auto machine = MillDaemon::GetInstance().GetConnection();
	auto offsets = machine->GetOffsets();
	auto FindIn1 = [ gIn1 ] (auto& offset) { return offset.first == gIn1; };
	auto it = std::find_if(offsets.begin(), offsets.end(), FindIn1);
	std::vector<Point3> m100Points{};

	if (it != offsets.end()) {
		const Point3 point1 = it->second;
		MILL_LOG("gIn1 found: " + gIn1 + ": " + to_string(point1.x) + ", " + to_string(point1.y) + ", " + to_string(point1.z));
		m100Points.push_back(point1);
	}

	auto FindIn2 = [ gIn2 ] (auto& offset) { return offset.first == gIn2; };
	it = std::find_if(offsets.begin(), offsets.end(), FindIn2);
	if (it != offsets.end()) {
		const Point3 point2 = it->second;
		MILL_LOG("gIn2 found: " + gIn2 + ": " + to_string(point2.x) + ", " + to_string(point2.y) + ", " + to_string(point2.z));
		m100Points.push_back(point2);
	}

	return m100Points;
}

void VerifyRange(const float fval0, const float fval1, const string& gOut, const char axisOut) {
	auto machine = MillDaemon::GetInstance().GetConnection();
	auto offsets = machine->GetOffsets();
	
	auto FindOut = [ gOut ] (auto& offset) { return offset.first == gOut; };
	auto it = std::find_if(offsets.begin(), offsets.end(), FindOut);
	if (it != offsets.end()) {
		const Point3 point = it->second;
		MILL_LOG("gOut found -" + gOut + ": " + to_string(point.x) + ", " + to_string(point.y) + ", " + to_string(point.z));

		const float axisValue{ GetAxisValue(point, axisOut) };
		const float v1 = fval1 > axisValue ? fval1 - axisValue : axisValue - fval1;
		const float v2 = fval1 > fval0 ? fval1 - fval0 : fval0 - fval1;

		if (v1 > v2) {
			MILL_LOG("Value not in range. Value: " + to_string(point.x) + " - Range: " + to_string(fval0) + "-" + to_string(fval1));
			MillDisplayManager::AddLine(ELineType::ERR, "M100 Failed");
			throw MillException(MillException::M100_OUTOFRANGE);
		}
	}
	else {
		MILL_LOG(gOut + " NOT FOUND.");
	}
}
