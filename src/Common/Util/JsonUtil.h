#pragma once

#include <json/json.h>

class JsonUtil
{
public:
	static std::string ToString(const Json::Value& json)
	{
		Json::StreamWriterBuilder builder;
		builder["indentation"] = ""; // Removes whitespaces
		return Json::writeString(builder, json);
	}
};