#pragma once

#include "Common/CommonHeaders.h"
#include <Files/GCodeLine.h>

static const int ALARM_CODE_ESTOP = 50;
static const int ALARM_CODE_TIMEOUT = 51;
static const int ALARM_CODE_SOFT_ESTOP = 52;
static const int ALARM_CODE_MACHINE_LOCKED = 53;

struct MillingError
{
	enum Type
	{
		Alarm,
		Error
	};

	Type type;
	int error_id;
	std::string title;
	std::string description;

	bool AllowRetry() const noexcept
	{
		return IsProbeFailure();
	}

	bool IsProbeFailure() const noexcept
	{
		return type == Alarm && (error_id == 4 || error_id == 5);
	}

	bool IsNotIdle() const noexcept
	{
		return type == Error && error_id == 8;
	}

	bool IsHomingFail() const noexcept
	{
		return type == Alarm && error_id >= 6 && error_id <= 9;
	}

	bool IsSoftLimitAlarm() const noexcept
	{
		return type == Alarm && error_id == 2;
	}

	bool IsEStop() const noexcept
	{
		return type == Alarm && error_id == ALARM_CODE_ESTOP;
	}
};

class ErrorCodes
{
public:
	static MillingError GetError(const int error, const tl::optional<GCodeLine>& last_command) noexcept;
	static MillingError GetAlarm(const int alarm) noexcept;
};
