#include "MillingError.h"

struct ErrorCode
{
	std::string message;
	std::string description;
};

static const std::unordered_map<int, ErrorCode> ERROR_CODES_CSV = {
	{1,{"Expected command letter","G-code words consist of a letter and a value. Letter was not found."}},
	{2,{"Bad number format","Missing the expected G-code word value or numeric value format is not valid."}},
	{3,{"Invalid statement","Grbl '$' system command was not recognized or supported."}},
	{4,{"Value < 0","Negative value received for an expected positive value."}},
	{5,{"Setting disabled","Homing cycle failure. Homing is not enabled via settings."}},
	{6,{"Value < 3 usec","Minimum step pulse time must be greater than 3usec."}},
	{7,{"EEPROM read fail. Using defaults","An EEPROM read failed. Auto-restoring affected EEPROM to default values."}},
	{8,{"Not idle","Grbl '$' command cannot be used unless Grbl is IDLE. Ensures smooth operation during a job."}},
	{9,{"G-code lock","G-code commands are locked out during alarm or jog state."}},
	{10,{"Homing not enabled","Soft limits cannot be enabled without homing also enabled."}},
	{11,{"Line overflow","Max characters per line exceeded. Received command line was not executed."}},
	{12,{"Step rate > 30kHz","Grbl '$' setting value cause the step rate to exceed the maximum supported."}},
	{13,{"Check Door","Safety door detected as opened and door state initiated."}},
	{14,{"Line length exceeded","Build info or startup line exceeded EEPROM line length limit. Line not stored."}},
	{15,{"Travel exceeded","Jog target exceeds machine travel. Jog command has been ignored."}},
	{16,{"Invalid jog command","Jog command has no '=' or contains prohibited g-code."}},
	{17,{"Setting disabled","Laser mode requires PWM output."}},
	{20,{"Unsupported command","Unsupported or invalid g-code command found in block."}},
	{21,{"Modal group violation","More than one g-code command from same modal group found in block."}},
	{22,{"Undefined feed rate","Feed rate has not yet been set or is undefined."}},
	{23,{"Invalid gcode ID:23","G-code command in block requires an integer value."}},
	{24,{"Invalid gcode ID:24","More than one g-code command that requires axis words found in block."}},
	{25,{"Invalid gcode ID:25","Repeated g-code word found in block."}},
	{26,{"Invalid gcode ID:26","No axis words found in block for g-code command or current modal state which requires them."}},
	{27,{"Invalid gcode ID:27","Line number value is invalid."}},
	{28,{"Invalid gcode ID:28","G-code command is missing a required value word."}},
	{29,{"Invalid gcode ID:29","G59.x work coordinate systems are not supported."}},
	{30,{"Invalid gcode ID:30","G53 only allowed with G0 and G1 motion modes."}},
	{31,{"Invalid gcode ID:31","Axis words found in block when no command or current modal state uses them."}},
	{32,{"Invalid gcode ID:32","G2 and G3 arcs require at least one in-plane axis word."}},
	{33,{"Invalid gcode ID:33","Motion command target is invalid."}},
	{34,{"Invalid gcode ID:34","Arc radius value is invalid."}},
	{35,{"Invalid gcode ID:35","G2 and G3 arcs require at least one in-plane offset word."}},
	{36,{"Invalid gcode ID:36","Unused value words found in block."}},
	{37,{"Invalid gcode ID:37","G43.1 dynamic tool length offset is not assigned to configured tool length axis."}},
	{38,{"Invalid gcode ID:38","Tool number greater than max supported value." }}
};

struct AlarmCode
{
	std::string message;
};

static const std::unordered_map<int, AlarmCode> ALARM_CODES_CSV = {
	{1,{"Hard limit triggered. Machine position is likely lost due to sudden and immediate halt. Re-homing is highly recommended."}},
	{2,{"G-code motion target exceeds machine travel. Machine position safely retained. Alarm may be unlocked."}},
	{3,{"Reset while in motion. Grbl cannot guarantee position. Lost steps are likely. Re-homing is highly recommended."}},
	{4,{"Probe fail. The probe is not in the expected initial state before starting probe cycle, where G38.2 and G38.3 is not triggered and G38.4 and G38.5 is triggered."}},
	{5,{"Probe fail. Probe did not contact the workpiece within the programmed travel for G38.2 and G38.4."}},
	{6,{"Homing fail. Reset during active homing cycle."}},
	{7,{"Homing fail. Safety door was opened during active homing cycle."}},
	{8,{"Homing fail. Cycle failed to clear limit switch when pulling off. Try increasing pull-off setting or check wiring."}},
	{9,{"Homing fail. Could not find limit switch within search distance. Defined as 1.5 * max_travel on search and 5 * pulloff on locate phases."}},
	{ALARM_CODE_ESTOP,{"Job was aborted due to pressing the emergency stop button. To reconnect, please twist the red emergency stop switch clockwise until it pops out. After resetting the button, press 'OK' to start program from the very beginning."}},
	{ALARM_CODE_TIMEOUT,{"Operation timed out.\n\nUnfortunately CRWrite cannot continue. Please try again."}},
	{ALARM_CODE_SOFT_ESTOP,{"Job was aborted due to pressing the software emergency stop button."}},
	{ALARM_CODE_MACHINE_LOCKED,{"Machine is locked. Reset to continue."}}
};

MillingError ErrorCodes::GetError(const int error, const tl::optional<GCodeLine>& last_command) noexcept
{
	assert(error != 0);

	ErrorCode error_code{ "Error", "Unknown error occurred." };

	auto iter = ERROR_CODES_CSV.find(error);
	if (iter != ERROR_CODES_CSV.end()) {
		error_code = iter->second;
	}

	std::string command = "Command";
	if (last_command.has_value()) {
		command = "Command \"" + last_command.value().GetCleaned() + "\"";
	}

	std::string description = command + " returned error " + std::to_string(error) + ": " + error_code.message + ": " + error_code.description +
		"\n\nIf this is a known good .crproj file, then a data transmission error occurred. If this is development code, try enabling check code mode to verify all g-code syntax is valid."
		"\n\nUnfortunately g-code behavior after experiencing an error is undefined, so CRWrite cannot continue. Please try again.";

	return MillingError{
		MillingError::Error,
		error,
		error_code.message,
		description
	};
}

MillingError ErrorCodes::GetAlarm(const int alarm) noexcept
{
	assert(alarm != 0);

	std::string description = "Unknown alarm occurred";

	auto iter = ALARM_CODES_CSV.find(alarm);
	if (iter != ALARM_CODES_CSV.end()) {
		description = iter->second.message;
	}

	if (alarm < 50) {
		if (alarm == 4 || alarm == 5) {
			description = "Coast Runner encountered ALARM:" + std::to_string(alarm) + " " + description + "\n\nPre-probing position and state has been preserved. You may try again. Ensure probe wire is plugged in and that workpiece is free of chips and debris.";
		} else {
			description = "Coast Runner encountered ALARM:" + std::to_string(alarm) + " " + description + "\n\nUnfortunately CRWrite cannot continue. Please try again.";	
		}
	}

	return MillingError{
		MillingError::Alarm,
		alarm,
		"Alarm",
		description
	};
}
