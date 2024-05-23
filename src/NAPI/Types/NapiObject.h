#pragma once

#include <NAPI/NapiUtil.h>
#include <NAPI/Types/NapiValue.h>

class NapiObject
{
public:
	napi_value napi;

	NapiObject(napi_env env, napi_value napiValue) : m_env(env), napi(napiValue) { }

	static NapiObject Create(napi_env env)
	{
		napi_value value;
		ASSERT_OK(napi_create_object(env, &value));
		return NapiObject(env, value);
	}

	NapiValue ToValue() const
	{
		return NapiValue(m_env, napi);
	}

	bool HasProperty(const std::string& key)
	{
		bool hasProperty = false;
		ASSERT_OK(napi_has_named_property(m_env, napi, key.c_str(), &hasProperty));
		return hasProperty;
	}

	void SetString(const std::string& key, const std::string& value) { SetProperty(key, NapiString::Create(m_env, value).napi); }
	void SetBool(const std::string& key, const bool value) { SetProperty(key, NapiBool::Create(m_env, value).napi); }
	void SetInt32(const std::string& key, const int32_t value) { SetProperty(key, NapiInt32::Create(m_env, value).napi); }
	void SetUInt32(const std::string& key, const uint32_t value) { SetProperty(key, NapiUInt32::Create(m_env, value).napi); }
	void SetDouble(const std::string& key, const double value) { SetProperty(key, NapiDouble::Create(m_env, value).napi); }
	void Set(const std::string& key, napi_value value) { SetProperty(key, value); }

	NapiString GetString(const std::string& key) const { return GetProperty(key).ToString(); }
	NapiBool GetBool(const std::string& key) const { return GetProperty(key).ToBool(); }
	NapiInt32 GetInt32(const std::string& key) const { return GetProperty(key).ToInt32(); }
	NapiUInt32 GetUInt32(const std::string& key) const { return GetProperty(key).ToUInt32(); }
	NapiDouble GetDouble(const std::string& key) const { return GetProperty(key).ToDouble(); }
	NapiValue Get(const std::string& key) const { return NapiValue(m_env, GetProperty(key).napi); }

private:
	void SetProperty(const std::string& key, napi_value value)
	{
		ASSERT_OK(napi_set_named_property(m_env, napi, key.c_str(), value));
	}

	NapiValue GetProperty(const std::string& key) const
	{
		napi_value value;
		ASSERT_OK(napi_get_named_property(m_env, napi, key.c_str(), &value));
		return NapiValue(m_env, value);
	}

	napi_env m_env;
};