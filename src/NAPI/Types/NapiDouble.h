#pragma once

#include <NAPI/NapiUtil.h>

class NapiDouble
{
public:
	napi_value napi;

	NapiDouble(napi_env env, napi_value value) : m_env(env), napi(value) { }

	static NapiDouble Create(napi_env env, const double value)
	{
		napi_value napiValue;
		ASSERT_OK(napi_create_double(env, value, &napiValue));
		return NapiDouble(env, napiValue);
	}

	double Get() const
	{
		double value;
		ASSERT_OK(napi_get_value_double(m_env, napi, &value));
		return value;
	}

private:
	napi_env m_env;
};