#pragma once

#include "Common/CommonHeaders.h"
#include <node_api.h>

// Exception implementation for top-level Electron assess errors
class NapiException : public std::exception
{
public:
	NapiException(const std::string& function, const size_t line, napi_status status)
		: m_status(status),
		m_what(function + ":" + std::to_string(line) + " - Node-API error occurred.")
	{
		
	}

	const char* what() const noexcept
	{
		return m_what.c_str();
	}

private:
	std::string m_what;
	napi_status m_status;
};
