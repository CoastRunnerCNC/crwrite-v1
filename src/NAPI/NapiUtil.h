#pragma once

#include "NapiException.h"

struct NAPIContext
{
	NAPIContext() = default;
	virtual ~NAPIContext() = default;

	napi_ref m_callback;
	napi_async_work m_asyncWork;
};

#define ASSERT_STATUS(status) \
	if (status != napi_ok) 	{ \
		napi_throw_error(env, "EINVAL", "Invalid Value"); \
		return nullptr; \
	}

#define ASSERT_OK(status) if (status != napi_ok) { throw NapiException(__FUNCTION__, __LINE__, status); }

// Wrapper class to help interface with Electron front-end
class NapiUtil
{
public:
	static napi_status GetString(napi_env env, napi_value value, std::string& result)
	{
		char cstr[1024];
		size_t cstrLength;
		const napi_status status = napi_get_value_string_utf8(env, value, cstr, 1024, &cstrLength);
		if (status == napi_ok)
		{
			result = std::string(cstr, cstrLength);
		}

		return status;
	}

	static std::string GetString(napi_env env, napi_value value)
	{
		char cstr[1024];
		size_t cstrLength;
		ASSERT_OK(napi_get_value_string_utf8(env, value, cstr, 1024, &cstrLength));

		return std::string(cstr, cstrLength);
	}

	static napi_value CreateString(napi_env env, const std::string& value)
	{
		napi_value napiValue;
		ASSERT_OK(napi_create_string_utf8(env, value.c_str(), value.size(), &napiValue));
		return napiValue;
	}

	static bool GetBool(napi_env env, napi_value value)
	{
		bool result;
		ASSERT_OK(napi_get_value_bool(env, value, &result));
		return result;
	}

	static napi_value CreateBool(napi_env env, const bool value)
	{
		napi_value napiValue;
		ASSERT_OK(napi_get_boolean(env, value, &napiValue));
		return napiValue;
	}

	static int32_t GetInt32(napi_env env, napi_value value)
	{
		int32_t result;
		ASSERT_OK(napi_get_value_int32(env, value, &result));
		return result;
	}

	static napi_value CreateInt32(napi_env env, const int32_t value)
	{
		napi_value napiValue;
		ASSERT_OK(napi_create_int32(env, value, &napiValue));
		return napiValue;
	}

	static uint32_t GetUInt32(napi_env env, napi_value value)
	{
		uint32_t result;
		ASSERT_OK(napi_get_value_uint32(env, value, &result));
		return result;
	}

	static napi_value CreateUInt32(napi_env env, const uint32_t value)
	{
		napi_value napiValue;
		ASSERT_OK(napi_create_uint32(env, value, &napiValue));
		return napiValue;
	}

	static napi_value GetNull(napi_env env)
	{
		napi_value value;
		ASSERT_OK(napi_get_null(env, &value));
		return value;
	}

	static napi_value CreateObject(napi_env env)
	{
		napi_value value;
		ASSERT_OK(napi_create_object(env, &value));
		return value;
	}
};

#define NAPI_GET_STRING(env, value, result) ASSERT_STATUS(NapiUtil::GetString(env, value, result))
