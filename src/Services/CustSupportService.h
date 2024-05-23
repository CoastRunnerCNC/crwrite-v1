#pragma once

#include "Common/CommonHeaders.h"
#include <json/json.h>

/// <summary>
/// Web service for submitting customer support requests.
/// </summary>
class CustSupportService
{
public:
	struct Request
	{
		std::string name;
		std::string email;
		std::string description;
		std::string cr_version;
		std::string log_text;
		Json::Value firmware;

		std::string ToJsonStr() const;
	};

	struct Response
	{
		bool success;
		std::map<std::string, std::string> errors;
	};

	static Response Invoke(const Request& req);
};
