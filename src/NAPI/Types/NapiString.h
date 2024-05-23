#pragma once

#include <NAPI/NapiUtil.h>

class NapiString
{
public:
	napi_value napi;

	NapiString(napi_env env, napi_value value) : m_env(env), napi(value) { }

	static NapiString Create(napi_env env, const std::string& value)
	{
		napi_value napiValue;
		ASSERT_OK(napi_create_string_utf8(env, value.c_str(), value.size(), &napiValue));
		return NapiString(env, napiValue);
	}

	std::string Get()
	{
		size_t cstrLength;
		ASSERT_OK(napi_get_value_string_utf8(m_env, napi, nullptr, 0, &cstrLength));

		std::vector<char> cstr(cstrLength + 1);

		ASSERT_OK(napi_get_value_string_utf8(m_env, napi, cstr.data(), cstrLength + 1, nullptr));
		return std::string(cstr.data(), cstrLength);
	}

private:
	napi_env m_env;
};