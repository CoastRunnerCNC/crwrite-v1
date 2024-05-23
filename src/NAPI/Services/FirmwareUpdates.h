#pragma once

#include <NAPI/NapiService.h>
#include <NAPI/Types/NapiObject.h>
#include <NAPI/Types/NapiArray.h>
#include <MillDaemon.h>

// Asynchronous operation for updating firmware if needed
struct GetFirmwareUpdatesContext : public NAPIContext
{
	std::vector<AvailableFirmware> m_availableFirmware;
};

// REQUEST:
// 0. call_back - fn(array)
class FirmwareUpdatesService final : public NapiAsyncService
{
protected:
	virtual void Execute(napi_env env, NAPIContext* data) override final
	{
		auto pContext = static_cast<GetFirmwareUpdatesContext*>(data);
		pContext->m_availableFirmware = MillDaemon::GetInstance().GetAvailableFirmwareUpdates();
	}

	virtual std::vector<NapiValue> Complete(napi_env env, NAPIContext* data) override final
	{
		auto pContext = static_cast<GetFirmwareUpdatesContext*>(data);
		std::vector<AvailableFirmware> available = pContext->m_availableFirmware;

		NapiArray availableArray = NapiArray::Create(env, available.size());

		for (size_t i = 0; i < available.size(); i++)
		{
			const AvailableFirmware& availableFirmware = available[i];

			NapiObject firmwareObj = NapiObject::Create(env);
			firmwareObj.SetString("version", availableFirmware.VERSION);
			firmwareObj.SetString("description", availableFirmware.DESCRIPTION);
			firmwareObj.Set("file_328p", NapiString::Create(env, availableFirmware.FILE_328P).napi);

			if (!availableFirmware.FILE_32M1.empty())
			{
				firmwareObj.Set("file_32m1", NapiString::Create(env, availableFirmware.FILE_32M1).napi);
			}

			availableArray.Set(i, firmwareObj.napi);
		}

		return std::vector<NapiValue>({ NapiValue(env, availableArray.napi) });
	}

	std::string GetResourceName() const final { return "GET_AVAILABLE_FIRMWARE"; }
	NapiValue GetCallbackFunction(const std::vector<NapiValue>& args) const final { return args[0]; }
	NAPIContext* CreateContext(napi_env env, const std::vector<NapiValue>& args) const noexcept final { return new GetFirmwareUpdatesContext(); }
};
