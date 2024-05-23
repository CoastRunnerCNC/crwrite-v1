#pragma once

#include "Common/CommonHeaders.h"

/*
exception class for handling CoastRunner specific errors
NO_ACCESS
NO_DEVICE,
FAILED_OPEN
FAILED_GET
FAILED_SET
FAILED_WRITE,
NOT_TTY
NOT_OPEN,
GRBL_ERROR
ALARM
ALARM_LIMIT
ALARM_PROBE,
UNKNOWN_COMMAND
TIMEOUT
*/
class MillException : public std::exception
{
public:
	enum EMillException
	{
		NO_ACCESS,
		NO_DEVICE,
		FAILED_OPEN,
		FAILED_GET,
		FAILED_SET,
		FAILED_WRITE,
		NOT_TTY,
		NOT_OPEN,
		GRBL_ERROR,
		ALARM,
		ALARM_LIMIT,
		ALARM_PROBE,
		UNKNOWN_COMMAND,
		M100_OUTOFRANGE,
		M101_FAIL,
    M102_INVALID_EXPRTK_EXPRESSION,
    M102_OFFSETS_FAIL,
    M102_INVALID_DEST_REGISTER,
	M106_BOOL_TEST_FAIL,
	M106_MALFORMED_TEST,
		M112_FAIL,
		TIMEOUT,
		NO_PROBE_COORD,
		INVALID_MODE,
		SOFTWARE_ESTOP,
		ESTOP_PUSHED,
		MACHINE_LOCKED
	};
private:
	EMillException m_type;

	std::string m_errorDetail;
	std::string m_combinedMessage;
	std::string GetTypeMessage() const;

public:
	explicit MillException(const EMillException t);
	MillException(const EMillException t, const std::string& s);
	const char* what() const noexcept;
	EMillException getType() const;
	std::string GetRawDetailMessage() const;
};
