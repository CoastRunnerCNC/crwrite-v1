#pragma once

#include "Common/CommonHeaders.h"

// Type of log message (Reading response, Writing GCode, Error/Alarm received)
enum class ELineType
{
	READ,
	WRITE,
	ERR
};

namespace LineType
{
	static std::string ToString(const ELineType type)
	{
		switch (type)
		{
			case ELineType::READ:
				return "READ";
			case ELineType::WRITE:
				return "WRITE";
			case ELineType::ERR:
				return "ERROR";
			default:
				return "UNKNOWN";
		}
	}
}