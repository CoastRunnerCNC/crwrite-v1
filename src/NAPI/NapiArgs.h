#pragma once

#include "Common/CommonHeaders.h"
#include <NAPI/Types/NapiValue.h>

// Wrapper class to help handle arguments sent in from Electron front-end
class NapiArgs
{
public:
	static std::vector<NapiValue> GetArgs(napi_env env, napi_callback_info info)
	{
		size_t argc = 20;
		napi_value args[20];
		ASSERT_OK(napi_get_cb_info(env, info, &argc, args, nullptr, nullptr));

		std::vector<NapiValue> vArgs;
		for (size_t i = 0; i < argc; i++)
		{
			vArgs.push_back(NapiValue(env, args[i]));
		}

		return vArgs;
	}
};