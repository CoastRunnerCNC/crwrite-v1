#pragma once

#include <NAPI/NapiUtil.h>

class NapiInt32
{
public:
	napi_value napi;

	NapiInt32(napi_env env, napi_value value) : m_env(env), napi(value) { }

	static NapiInt32 Create(napi_env env, const int32_t value)
	{
		napi_value napiValue;
		ASSERT_OK(napi_create_int32(env, value, &napiValue));
		return NapiInt32(env, napiValue);
	}

	int32_t Get()
	{
		int32_t value;
		ASSERT_OK(napi_get_value_int32(m_env, napi, &value));
		return value;
	}

private:
	napi_env m_env;
};