#include "M101.h"
#include <Common/Logger.h>
#include <Mill/MillException.h>
#include <Mill/GRBL/Regex.h>
#include <Mill/GRBL/MillConnection.h>
#include <MillDaemon.h>
#include <Common/Util/CommonTypes.h>
#include <Mill/Display/MillDisplayManager.h>
using namespace MillLogger;
using std::string;
using std::to_string;

std::vector<float> LoadAxisValues(
	const string& gIn1,
	const string& gIn2,
	const string& gIn3,
	const string& axis
);

bool CheckTolerance(
	const std::vector<float>& pointValues,
	const string& axis,
	const float maxTolerance
);
/*
[G54:0.000,0.000,0.000]
[G55:-32.013,-71.345,-42.408]
[G56:0.000,0.000,0.000]
[G57:0.000,0.000,0.000]
[G58:0.000,0.000,0.000]
[G59:0.000,0.000,0.000]
[G28:0.000,0.000,0.000]
[G30:0.000,0.000,0.000]
[G92:0.000,0.000,0.000]
[TLO:0.000]
[PRB:-32.013,-74.548,-49.408:1]
*/
// TODO: Document args format.
void M101(const string& args) {
	MILL_LOG("BEGIN - args:" + args);
	MillDisplayManager::AddLine(ELineType::WRITE, "M101 Initiated");

	// Unpack args.
	const string gIn1 = args.substr(0, 3);
	const string gIn2 = args.substr(3, 3);
	const string gIn3 = args.substr(6, 3);
	const string axis = args.substr(9, 1);
	const float maxTolerance = std::stof(args.substr(10));

	// Get points.
	const std::vector<float> m101PointAxisValues = LoadAxisValues(gIn1, gIn2, gIn3, axis);

	// Check tolerance.
	if (!CheckTolerance(m101PointAxisValues, axis, maxTolerance)) {
		MillDisplayManager::AddLine(ELineType::ERR, "M101 Check Failed");
		throw MillException(MillException::M101_FAIL, axis);
	}

	MillDisplayManager::AddLine(ELineType::READ, "M101 Check Succeeded");
	MILL_LOG("END");
}

std::vector<float> LoadAxisValues(
	const string& gIn1,
	const string& gIn2,
	const string& gIn3,
	const string& axis)
{
	std::vector<float> m101PointAxisValues{};
	auto machine = MillDaemon::GetInstance().GetConnection();
	auto offsets = machine->GetOffsets();
	auto FindIn1 = [ gIn1 ] (auto& offset) { return offset.first == gIn1; };
	auto it = std::find_if(offsets.begin(), offsets.end(), FindIn1);

	if (it != offsets.end()) {
		const Point3 point1 = it->second;
		MILL_LOG("gIn1 found -" + gIn1 + ": " + to_string(point1.x) + ", " + to_string(point1.y) + ", " + to_string(point1.z));

		m101PointAxisValues.push_back(GetAxisValue(point1, axis[0]));
	}

	auto FindIn2 = [ gIn2 ] (auto& offset) { return offset.first == gIn2; };
	it = std::find_if(offsets.begin(), offsets.end(), FindIn2);
	if (it != offsets.end()) {
		const Point3 point2 = it->second;
		MILL_LOG("gIn2 found -" + gIn2 + ": " + to_string(point2.x) + ", " + to_string(point2.y) + ", " + to_string(point2.z));

		m101PointAxisValues.push_back(GetAxisValue(point2, axis[0]));
	}

	auto FindIn3 = [ gIn3 ] (auto& offset) { return offset.first == gIn3; };
	it = std::find_if(offsets.begin(), offsets.end(), FindIn3);
	if (it != offsets.end()) {
		const Point3 point3 = it->second;
		MILL_LOG("gIn3 found -" + gIn3 + ": " + to_string(point3.x) + ", " + to_string(point3.y) + ", " + to_string(point3.z));

		m101PointAxisValues.push_back(GetAxisValue(point3, axis[0]));
	}

	return m101PointAxisValues;
}

bool CheckTolerance(const std::vector<float>& pointValues, const string& axis, const float maxTolerance) {
	auto mmax = max_element(std::begin(pointValues), std::end(pointValues));
	auto mmin = min_element(std::begin(pointValues), std::end(pointValues));
	MILL_LOG(axis + " - Max:" + to_string(*mmax) + " Min:" + to_string(*mmin) + " Diff:" + to_string((std::fabs)(*mmax - *mmin)));

	if ((std::fabs)(*mmax - *mmin) >= maxTolerance)
	{
		return false;
	}

	return true;
}
