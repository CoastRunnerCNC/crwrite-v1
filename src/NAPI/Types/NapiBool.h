#pragma once

#include <NAPI/NapiUtil.h>

class NapiBool
{
public:
	napi_value napi;

	NapiBool(napi_env env, napi_value value) : m_env(env), napi(value) { }

	static NapiBool Create(napi_env env, const bool value)
	{
		napi_value napiValue;
		ASSERT_OK(napi_get_boolean(env, value, &napiValue));
		return NapiBool(env, napiValue);
	}

	bool Get()
	{
		bool value;
		ASSERT_OK(napi_get_value_bool(m_env, napi, &value));
		return value;
	}

private:
	napi_env m_env;
};