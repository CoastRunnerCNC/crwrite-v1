#pragma once

#include "Common/CommonHeaders.h"

std::vector<std::string> ChunkGCodeLine(const std::string& line);

struct MCodeInfo
{
    MCodeInfo(const int _code, const std::string& _options)
        : code(_code), options(_options)
    {

    }

    int code;
    std::string options;
};

/*
 * Takes a line of text and parses it for minimal G-Code representation
 * Also determines group and type of code for dealing with some limitations of GRBL
 */
class GCodeLine
{
private:
    enum blockingType {
        TYPE_NOT_BLOCKING = 0,
        TYPE_BLOCKING = 1
    };

public:
    enum commandGroup{
        GROUP_UNKNOWN=-1,

        GROUP_G_NON_MODAL=0,
        GROUP_G_MOTION=1,
        GROUP_G_PLANE_SELECTION=2,
        GROUP_G_DISTANCE=3,
        GROUP_G_ARC_DISTANCE=4,
        GROUP_G_FEED_RATE=5,
        GROUP_G_UNITS=6,
        GROUP_G_CUTTER_DIAMETER=7,
        GROUP_G_TOOL_LENGTH_OFFSET=8,
        GROUP_G_CANNED_CYCLES=10,
        GROUP_G_COORDINATE_SYSTEM=12,
        GROUP_G_CONTROL=13,
        GROUP_G_SPINDLE_SPEED=14,
        GROUP_G_LATHE_DIAMETER=15,

        GROUP_M_STOPPING=4,
        GROUP_M_IO=5,
        GROUP_M_TOOL_CHANGE=6,
        GROUP_M_SPINDLE=7,
        GROUP_M_COOLANT=8,
        GROUP_M_OVERRIDE=9,
        GROUP_M_USER_DEFINED=10,

        GROUP_GRBL_EMPTY=0,
        GROUP_GRBL_COMMAND=1,
        GROUP_GRBL_HOME=2,
        GROUP_GRBL_UNLOCK=3,
        GROUP_GRBL_SPECIAL=4,
        GROUP_GRBL_STATUS=5,
        GROUP_GRBL_CHK_MODE=6,
        GROUP_GRBL_WCS_INFO=7,
		GROUP_GRBL_JOG=8,
        GROUP_GRBL_LEVEL=9
    };

    enum commandType{
        TYPE_UNKNOWN=-1,
        TYPE_AXIS_FEED_SPINDLE=0,
        TYPE_GCODE=1,
        TYPE_MCODE=2,
        TYPE_GRBL=3
    };

    enum probeType{
        TYPE_NOT_PROBE=-1,
        TYPE_PROBE=0
    };

private:
	std::string m_orig;
	std::string m_clean;
	commandGroup m_group = GROUP_UNKNOWN;
	commandType m_type = TYPE_UNKNOWN;
	probeType m_probe = TYPE_NOT_PROBE;
	blockingType m_block = TYPE_NOT_BLOCKING;
	bool m_injectedCommand;
    int m_value = 0;
    tl::optional<MCodeInfo> m_MCodeInfo;
    tl::optional<uint8_t> m_wcs;
    tl::optional<uint8_t> m_units;
    tl::optional<uint8_t> m_movementType;

    bool IsGRBL(const std::string& line) const;

public:
	explicit GCodeLine(const std::string& s, const bool injected = false);

    static GCodeLine Injected(const std::string& s) { return GCodeLine(s, true); }

	// GETTERS
	const std::string& GetOriginal() const noexcept { return m_orig; } // Returns the original line
	const std::string& GetCleaned() const noexcept { return m_clean; } // Returns the minimal representation
	commandGroup GetGroup() const noexcept { return m_group; } // Gets the GCode or MCode modal group
	commandType GetType() const noexcept { return m_type; } // Gets the type: Axis Feed Spindle (Axis movement, Feed rate or Spindle speed), GCode, MCode, or GRBL command
	bool IsBlocking() const noexcept { return m_block == GCodeLine::TYPE_BLOCKING; }
	bool GetInjectedCommand() const noexcept { return m_injectedCommand; }

    bool IsGCode() const noexcept { return m_type == GCodeLine::TYPE_GCODE; }
    bool IsMCode() const noexcept { return m_type == GCodeLine::TYPE_MCODE; }
    bool IsGRBL() const noexcept { return m_type == GCodeLine::TYPE_GRBL; }
    int GetValue() const noexcept { return m_value; }

    bool IsHome() const noexcept { return m_group == GCodeLine::GROUP_GRBL_HOME; }
    bool IsUnlock() const noexcept { return m_group == GCodeLine::GROUP_GRBL_UNLOCK; }
    bool IsLevel() const noexcept { return m_group == GCodeLine::GROUP_GRBL_LEVEL; }

    tl::optional<MCodeInfo> GetMCodeInfo() const { return m_MCodeInfo; }
    tl::optional<uint8_t> GetWCS() const { return m_wcs; }
    tl::optional<uint8_t> GetUnits() const { return m_units; }
    tl::optional<uint8_t> GetMovementType() const { return m_movementType; }
};
