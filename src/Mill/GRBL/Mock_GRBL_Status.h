#ifndef MOCK_GRBL_SETTINGS_CLASS
#include "Common/CommonHeaders.h"
#include "Common/Util/Queue_Threadsafe.h"

// Internal representation of Mock GRBL status
// Some items here may be duplicated elsewhere and not yet fully consolidated

struct Point {
	float x{ 0.0f };
	float y{ 0.0f };
	float z{ 0.0f };
};

enum class MACHINE_STATE {
	IDLE,
	RUN,
	HOLD,
	HOME,
	ALARM,
	CHECK,
	LOCKED_WITH_ALARM
};

// Remove '.' from 38.x
enum class MOTION_MODE {
	RAPID = 0,
	LINEAR = 1,
	CW_ARC = 2,
	CCW_ARC = 3,
	PROBE_UNTIL_CONTACT_WITH_ALARM = 382,
	PROBE_UNTIL_CONTACT_NO_ALARM = 383,
	PROBE_UNTIL_CLEAR_WITH_ALARM = 384,
	PROBE_UNTIL_CLEAR_WITH_NO_ALARM = 385,
	BLOCK = 80
};

enum class COORDINATE_SYSTEM {
	G54 = 54,
	G55 = 55,
	G56 = 56,
	G57 = 57,
	G58 = 58,
	G59 = 59
};

enum class PLANE_SELECT {
	XY = 17,
	XZ = 18,
	YZ = 19
};

enum class UNIT_MODE {
	INCHES = 20,
	MILLIMETERS = 21
};

enum class DISTANCE_MODE {
	ABSOLUTE_MOTION = 90,
	RELATIVE_MOTION = 91
};

enum class FEEDRATE_MODE {
	MINUTES_PER_UNIT = 93,
	UNITS_PER_MINUTE = 94
};

enum class SPINDLE_STATE {
	CW = 3,
	CCW = 4,
	DISABLED = 5
};

template<typename ScopedEnum>
std::underlying_type_t<ScopedEnum> GetEnum(ScopedEnum val) {
	return static_cast<std::underlying_type_t<ScopedEnum>>(val);
}

template<typename ScopedEnum>
std::string EnumVal(ScopedEnum val) {
	return std::to_string(GetEnum(val));
}

struct MOCK_GRBL_STATUS {
	int m_BufferStatus{ 14 };
	int m_BufferSpace{ 127 };
	int m_LineNumber{ 0 };
	mutable int m_CountStatusRequests{ 1 };

	std::vector<std::pair<std::string, Point>> m_Offsets{
	{ "G54", { 0, 0, 0 } },
	{ "G55", { 0, 0, 0 } },
	{ "G56", { 0, 0, 0 } },
	{ "G57", { 0, 0, 0 } },
	{ "G58", { 0, 0, 0 } },
	{ "G59", { 0, 0, 0 } },
	{ "G28", { 0, 0, 0 } },
	{ "G30", { 0, 0, 0 } },
	{ "G92", { 0, 0, 0 } },
	{ "TLO", { 0, 0, 0 } },
	{ "PRB", { 0, 0, 0 } }
	};

	// Modal State
	MOTION_MODE m_MotionMode{ MOTION_MODE::RAPID };
	COORDINATE_SYSTEM m_CoordinateSystem{ COORDINATE_SYSTEM::G54 };
	PLANE_SELECT m_PlaneSelect{ PLANE_SELECT::XY };
	UNIT_MODE m_UnitMode{ UNIT_MODE::MILLIMETERS };
	DISTANCE_MODE m_DistanceMode{ DISTANCE_MODE::ABSOLUTE_MOTION };
	FEEDRATE_MODE m_FeedRateMode{ FEEDRATE_MODE::UNITS_PER_MINUTE };
	SPINDLE_STATE m_SpindleState{ SPINDLE_STATE::DISABLED };
	float m_FeedRate{ 0.0f };
	int m_SpindleSpeed{ 0 };

	MACHINE_STATE m_State{ MACHINE_STATE::ALARM };
	bool m_ProbeAlarm{ false };
	bool m_xLimit{ false };
	bool m_yLimit{ false };
	bool m_zLimit{ false };

	const std::string m_Firmware{ "[grbl:1.1h CR:3B PCB:3B VFD:3A YMD:20201212]" };

	std::string Status(const Point position, const Point wcs) const noexcept;
	std::string ModalState() const noexcept;
	void PrintOffsets(QUEUE_THREADSAFE<std::string>& outputQ) noexcept;
	std::pair<std::string, Point>& GetWCS(const std::string&) noexcept;
};

#endif // !MOCK_GRBL_SETTINGS_CLASS
