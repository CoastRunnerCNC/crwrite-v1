#pragma once

#include <NAPI/NapiUtil.h>

class NapiUInt32
{
public:
	napi_value napi;

	NapiUInt32(napi_env env, napi_value value) : m_env(env), napi(value) { }

	static NapiUInt32 Create(napi_env env, const uint32_t value)
	{
		napi_value napiValue;
		ASSERT_OK(napi_create_uint32(env, value, &napiValue));
		return NapiUInt32(env, napiValue);
	}

	uint32_t Get()
	{
		uint32_t value;
		ASSERT_OK(napi_get_value_uint32(m_env, napi, &value));
		return value;
	}

private:
	napi_env m_env;
};