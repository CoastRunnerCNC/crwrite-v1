#ifndef POSITION_ACCUMULATOR_H_
#define POSITION_ACCUMULATOR_H_

#include "Common/CommonHeaders.h"
#include <Common/Util/CommonTypes.h>
#include <Files/GCodeLine.h>

// Utility to track the expected machine position after a given GCode block is executed
// Successive lines of GCode can be accumulated to project out future moves indefinitely
class POSITION_ACCUMULATOR {
public:
	void SetPosition(const Point3 position) noexcept { m_Position = position; }
	void SetWCS(const Vector3 wcs) noexcept { m_WCS = wcs; }
	void SetWCS(const Point3 wcs) noexcept { m_WCS = Vector3{ wcs }; }
	void ApplyGCode(const GCodeLine& line);
	Point3 GetAbsolutePosition() { return m_Position; }
	Point3 GetWorkPosition() { return m_Position - m_WCS; }
	DISTANCE_MODE GetDistanceMode() { return m_DistanceMode; }
	void Clear() {
		m_Position = Point3{};
		m_WCS = Vector3{};
		m_PlaneSelect = PLANE_SELECT::XY;
		m_UnitMode = UNIT_MODE::MILLIMETERS;
		m_DistanceMode = DISTANCE_MODE::ABSOLUTE_MOTION;
	}
private:
	Point3 m_Position{};
	Vector3 m_WCS{ };
	//COORDINATE_SYSTEM m_CoordinateSystem{ COORDINATE_SYSTEM::G54 };
	PLANE_SELECT m_PlaneSelect{ PLANE_SELECT::XY };
	UNIT_MODE m_UnitMode{ UNIT_MODE::MILLIMETERS };
	DISTANCE_MODE m_DistanceMode{ DISTANCE_MODE::ABSOLUTE_MOTION };
};

#endif
