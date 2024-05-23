#pragma once

#include <NAPI/NapiUtil.h>
#include <NAPI/Types/NapiBool.h>
#include <NAPI/Types/NapiString.h>
#include <NAPI/Types/NapiInt32.h>
#include <NAPI/Types/NapiUInt32.h>
#include <NAPI/Types/NapiDouble.h>

class NapiValue
{
public:
	napi_value napi;

	NapiValue(napi_env env, napi_value napiValue) : m_env(env), napi(napiValue) { }
	~NapiValue()
	{

	}

	static NapiValue CreateNull(napi_env env)
	{
		napi_value value;
		ASSERT_OK(napi_get_null(env, &value));
		return NapiValue(env, value);
	}

	NapiBool ToBool() const { return NapiBool(m_env, napi); }
	NapiString ToString() const { return NapiString(m_env, napi); }
	NapiInt32 ToInt32() const { return NapiInt32(m_env, napi); }
	NapiUInt32 ToUInt32() const { return NapiUInt32(m_env, napi); }
	NapiDouble ToDouble() const { return NapiDouble(m_env, napi); }

	bool IsBool()
	{
		napi_valuetype napiType;
		ASSERT_OK(napi_typeof(m_env, napi, &napiType));
		return napiType == napi_boolean;
	}

	bool IsNumber()
	{
		napi_valuetype napiType;
		ASSERT_OK(napi_typeof(m_env, napi, &napiType));
		return napiType == napi_number;
	}

private:
	napi_env m_env;
};