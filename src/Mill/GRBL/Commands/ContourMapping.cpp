#include "ContourMapping.h"
#include "MillDaemon.h"
#include <Mill/Display/MillDisplayManager.h>
using namespace std;
using std::this_thread::sleep_for;
using namespace std::chrono_literals;

auto g_ContourMap = vector<Point3>{};	// Probe result stores absolute machine coordinates

Plane3 GetOffsetPlane(const Point3 point);
float GetZOnPlane(const Plane3 plane, const Point3 point);
string ReplaceZValue(const string& line, const float z);
void RoundFloatString(string& line, const int digits);
string To_Rounded_String(const float input, const int digits);

void PrintContourMap() {
	auto msg = ""s;
	for (auto&& p : g_ContourMap) {
		msg = "M111: {" + To_Rounded_String(p.x, 3) + ", " + To_Rounded_String(p.y, 3) + ", " + To_Rounded_String(p.z, 3) + '}';
		MILL_LOG(msg);
	}
}

void PrintPointsUsed(const Point3 p1, const Point3 p2, const Point3 p3) {
	auto msg = ""s;
	msg = "Points Used:"
		+  " Point1: {"s + To_Rounded_String(p1.x, 3) + ", " + To_Rounded_String(p1.y, 3) + ", " + To_Rounded_String(p1.z, 3)
		+ "}, Point2: {"s + To_Rounded_String(p2.x, 3) + ", " + To_Rounded_String(p2.y, 3) + ", " + To_Rounded_String(p2.z, 3)
		+ "}, Point3: {"s + To_Rounded_String(p3.x, 3) + ", " + To_Rounded_String(p3.y, 3) + ", " + To_Rounded_String(p3.z, 3) + '}';
	MILL_LOG(msg);
}

void PrintZTransformation(const Point3 original, const float transformedZ) {
	auto msg = ""s;
	msg = "Result: {" + To_Rounded_String(original.x, 3) + ", " + To_Rounded_String(original.y, 3) + ", " + To_Rounded_String(original.z, 3)
		+ "} ==> {"s + To_Rounded_String(original.x, 3) + ", " + To_Rounded_String(original.y, 3) + ", " + To_Rounded_String(transformedZ, 3) + '}';
	MILL_LOG(msg);
}

void M111(const SerialConnection::Ptr& pSerial, const string& params) {
	MillDisplayManager::AddLine(ELineType::WRITE, "Initiating M111");
	auto cncmill = MillDaemon::GetInstance().GetConnection();
	if (!cncmill) { 
		throw MillException{ MillException::NO_ACCESS, "Connection failed."};
	}
	auto prevPoint = cncmill->GetLastProbedPoint();
	auto point = prevPoint;
	pSerial->WriteLine("G38.2" + params);
	while (point == prevPoint) {
		sleep_for(10ms);
		cncmill->ReadResponse(true);
		point = cncmill->GetLastProbedPoint();
	}

	auto it = find_if(g_ContourMap.begin(), g_ContourMap.end(), [ point ] (auto p) { return p.x == point.x && p.y == point.y; });
	if (it != g_ContourMap.end()) {
		auto& p = point;
		auto msg = "M111 point rejected: " + to_string(p.x) + ", " + to_string(p.y) + ", " + to_string(p.z);
		MILL_LOG(msg);

		pSerial->FlushReads();
		MillDisplayManager::AddLine(ELineType::READ, "M111 Failed. Duplicate X & Y values.");
	}
	else {
		g_ContourMap.emplace_back(point);
		PrintContourMap();
		pSerial->FlushReads();
		MillDisplayManager::AddLine(ELineType::READ, "M111 Complete");
	}
}

void M112() {
	if (g_ContourMap.size() < 3) {
		throw MillException{ MillException::M112_FAIL, "M112 Failed. Contour map needs at least 3 points." };
	}
	MILL_LOG("Contour map enabled.");
	PrintContourMap();
	MillDisplayManager::AddLine(ELineType::WRITE, "M112: Contour Adjustment Enabled");
	g_useContourMap.store(true, std::memory_order_release);
}

void M113() {
	MILL_LOG("Contour map disabled.");
	MillDisplayManager::AddLine(ELineType::WRITE, "M113: Contour Adjustment Disabled");
	g_useContourMap.store(false, std::memory_order_release);
}

void M114() {
	g_ContourMap.clear();
	MILL_LOG("Contour map cleared.");
	MillDisplayManager::AddLine(ELineType::WRITE, "M114: Contour Map Cleared");
	M113();		// Disable contour map since it's now empty
}

Plane3 GetOffsetPlane(const Point3 point) {
	auto map = vector<pair<int, float>>{};	// Index of contour map & distance from target to that point
	for (auto i = 0; i < static_cast<int>(g_ContourMap.size()); ++i) {
		map.emplace_back(i, Distance(point, g_ContourMap[i]));
	}

	// Use three closest points to build a plane that represents the surface
	auto sortByDistance = [ ] (const auto& lhs, const auto& rhs) { return lhs.second < rhs.second; };
	//std::partial_sort(map.begin(), map.begin() + 3, map.end(), sortByDistance);	// Sort first 3 values
	std::sort(map.begin(), map.end(), sortByDistance);	// Sort all points in case first three are colinear
	const auto& point1 = g_ContourMap[map[0].first];
	const auto& point2 = g_ContourMap[map[1].first];
	//const auto& point3 = g_ContourMap[map[2].first];

	// GetPlane will throw if all three points are colinear. While we may advise operators to use non-colinear points,
	// the developers of the GCode project file may not know apriori which M111 points will be selected.
	// This retry mechanism allows CRWrite to retry if there is potentially another valid set of points.
	// First try by preferentially selecting a set of points that surrounds the point to be adjusted.
	// Failing that, try again with the three closest points
	auto counter = 2;
	auto preferSurroundingPoints = true;
	while (counter < static_cast<int>(map.size())) {
		const auto& point3 = g_ContourMap[map[counter].first];
		try {
			// Only calculate offset plane if all three points surround our offset point or we've failed the first full pass
			if (!preferSurroundingPoints || PointIsSurrounded(point, point1, point2, point3)) {
				const auto aero = GetPlane(point1, point2, point3);
				if (aero.normal.z == 0.0) { ++counter; }		// Sanity check. Tool axis lies on plane as opposed to being roughly orthagonal to plane.
				else {
					PrintPointsUsed(point1, point2, point3);
					return aero;
				}
			}
		}
		catch (...) { }

		++counter;	// Try again with a new third point
		if (preferSurroundingPoints && counter == map.size()) {
			counter = 2;
			preferSurroundingPoints = false;
		}	// Retry the whole thing
	}

	throw std::runtime_error{ "No unique plane found. You must have at least three **non-colinear** points stored with M111 for CRWrite to perform slope adjustment." };
	//return GetPlane(point1, point2, point3);
}

// Assume that WCS zero point is on the surface of the workpiece
string TransformAbsoluteZ(const GCodeLine& line, const Point3 origPt, const Vector3 wcs) {
	const auto offsetPlane = GetOffsetPlane(origPt);

	// Get adjusted Z value in current WCS
	const auto zWorkCoords = (GetZOnPlane(offsetPlane, origPt) - wcs.z) + (origPt.z - wcs.z);
	PrintZTransformation(origPt, zWorkCoords);
	auto result = line.GetOriginal();
	return ReplaceZValue(result, zWorkCoords);
}

string TransformRelativeZ(const GCodeLine& line, const Point3 previousPt, const Point3 nextPt) {
	const auto offsetPlane = GetOffsetPlane(previousPt);
	const auto prevZOnPlane = GetZOnPlane(offsetPlane, previousPt);
	const auto nextDepth = nextPt.z - previousPt.z;
	const auto nextZOnPlane = GetZOnPlane(offsetPlane, nextPt);
	const auto planeChangeOfDepth = nextZOnPlane - prevZOnPlane;
	const auto adjustedChangeInDepth = nextDepth + planeChangeOfDepth;
	PrintZTransformation(nextPt, adjustedChangeInDepth);
	auto result = line.GetOriginal();
	return ReplaceZValue(result, adjustedChangeInDepth);
}

float GetZOnPlane(const Plane3 plane, const Point3 point) {
	return (plane.intercept - plane.normal.x * point.x - plane.normal.y * point.y) / plane.normal.z;
}

// Adjust string with new Z value
string ReplaceZValue(const string& line, const float z) {
	auto chunks = ChunkGCodeLine(line);
	auto result = string{};
	auto needToAddZ = true;

	auto AddZ = [ z, &result ] () {
		auto subLine = to_string(z);
		RoundFloatString(subLine, 3);
		result += " Z" + subLine;
	};

	bool hasX = false;
	bool hasY = false;
	for (auto chunk : chunks) {
		if (chunk[0] == 'Z') {
			AddZ();
			needToAddZ = false;
		}
		else if (chunk[0] == 'X') {
			if (!hasX) {
				hasX = true;
				result += chunk;
			}
			else { continue; }	// Fix occasional error where X & Y chunks are added twice
		}
		else if (chunk[0] == 'Y') {
			if (!hasY) {
				hasY = true;
				result += chunk;
			}
			else { continue; }	// Fix occasional error where X & Y chunks are added twice
		}
		else { result += chunk; }
	}
	if (needToAddZ) { AddZ(); }	// Always add Z value in case it changes from slope alone

	return result;
}

void RoundFloatString(string& line, const int digits) {
	auto n = line.find('.');
	line.erase(n + digits + 1);
}

string To_Rounded_String(const float input, const int digits) {
	auto output = to_string(input);
	RoundFloatString(output, digits);
	return output;
}
