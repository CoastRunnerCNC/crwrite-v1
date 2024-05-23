#pragma once

#include <NAPI/NapiService.h>
#include <NAPI/Types/NapiObject.h>
#include <MillDaemon.h>

void Teardown(void* arg)
{
	CR_LOG_SYNC("Teardown called from InitalizeService");
	MillDaemon::GetInstance().Shutdown();
}

// Asynchronous call to initialize and shutdown application
// REQUEST:
// 0. call_back - fn()
class InitializeService final : public NapiAsyncService
{
protected:
	virtual void Execute(napi_env env, NAPIContext* data) override final
	{
		MillDaemon::GetInstance().Initialize();
	}

	virtual std::vector<NapiValue> Complete(napi_env env, NAPIContext* data) override final
	{
		napi_add_env_cleanup_hook(env, Teardown, nullptr);

		return std::vector<NapiValue>();
	}

	std::string GetResourceName() const final { return "INITIALIZE"; }
	NapiValue GetCallbackFunction(const std::vector<NapiValue>& args) const final { return args[0]; }
	NAPIContext* CreateContext(napi_env env, const std::vector<NapiValue>& args) const final { return new NAPIContext(); }
};
