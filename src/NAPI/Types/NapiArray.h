#pragma once

#include <NAPI/NapiUtil.h>
#include <NAPI/Types/NapiValue.h>

class NapiArray
{
public:
	napi_value napi;

	NapiArray(napi_env env, napi_value value) : m_env(env), napi(value) { }

	static NapiArray Create(napi_env env, const size_t size)
	{
		napi_value napiArray;
		ASSERT_OK(napi_create_array_with_length(env, size, &napiArray));
		return NapiArray(env, napiArray);
	}

	NapiValue Get(const size_t index)
	{
		napi_value result;
		ASSERT_OK(napi_get_element(m_env, napi, index, &result));
		return NapiValue(m_env, result);
	}

	void Set(const size_t index, napi_value value)
	{
		ASSERT_OK(napi_set_element(m_env, napi, index, value));
	}

	size_t GetLength()
	{
		uint32_t length;
		ASSERT_OK(napi_get_array_length(m_env, napi, &length));
		return length;
	}

private:
	napi_env m_env;
};