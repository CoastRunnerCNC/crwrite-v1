#pragma once

#include "Common/CommonHeaders.h"

/*
Exception class for CR file specific things
NOT_FOUND for when a CR file isn't found
NOT_FOUND_INZ for when a requested file isn't found in the CR file
NOT_OPEN for when a CR file isn't open and an operation is attempted
BAD_MANIFEST for when the manifest is improperly written
*/
class CRException : public std::exception
{
public:
	enum EExceptionType
	{
		NOT_FOUND,
		NOT_FOUND_INZ,
		NOT_OPEN,
		BAD_MANIFEST
	};

public:
	explicit CRException(const EExceptionType t);
	CRException(const EExceptionType t, const std::string& s);
	~CRException() = default;

	const char* what() const noexcept;
	EExceptionType GetType();

private:
	EExceptionType m_type;
	std::string m_buffer;
};
