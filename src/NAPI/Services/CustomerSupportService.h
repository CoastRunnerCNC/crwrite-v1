#pragma once

#include <NAPI/NapiService.h>
#include <NAPI/Types/NapiObject.h>
#include <Services/CustSupportService.h>
#include <MillDaemon.h>

// Asynchronous request to send customer support communications
struct CustomerSupportContext : public NAPIContext
{
	std::string m_name;
	std::string m_email;
	std::string m_description;
	std::string m_version;
	bool m_includeLogs;
	CustSupportService::Response m_response;
};

// REQUEST:
// 0. name - str
// 1. email - str
// 2. description - str
// 3. version - str
// 4. include_logs - bool
// 5. call_back - fn(error_obj)
class CustomerSupportService final : public NapiAsyncService
{
protected:
	virtual void Execute(napi_env env, NAPIContext* data) override final
	{
		auto pContext = static_cast<CustomerSupportContext*>(data);
		pContext->m_response = MillDaemon::GetInstance().SendCustomerSupportRequest(
			pContext->m_name,
			pContext->m_email,
			pContext->m_description,
			pContext->m_version,
			pContext->m_includeLogs
		);
	}

	virtual std::vector<NapiValue> Complete(napi_env env, NAPIContext* data) override final
	{
		auto pContext = static_cast<CustomerSupportContext*>(data);
		if (!pContext->m_response.success)
		{
			NapiObject errorObj = NapiObject::Create(env);

			const auto& errors = pContext->m_response.errors;
			for (auto iter = errors.cbegin(); iter != errors.cend(); iter++)
			{
				errorObj.SetString(iter->first, iter->second);
			}

			return std::vector<NapiValue>({ errorObj.ToValue() });
		}

		return std::vector<NapiValue>({ NapiValue::CreateNull(env) });
	}

	std::string GetResourceName() const final { return "CUSTOMER_SUPPORT"; }
	NapiValue GetCallbackFunction(const std::vector<NapiValue>& args) const final { return args[5]; }
	NAPIContext* CreateContext(napi_env env, const std::vector<NapiValue>& args) const final
	{
		CustomerSupportContext* pContext = new CustomerSupportContext();
		pContext->m_name = args[0].ToString().Get();
		pContext->m_email = args[1].ToString().Get();
		pContext->m_description = args[2].ToString().Get();
		pContext->m_version = args[3].ToString().Get();
		pContext->m_includeLogs = args[4].ToBool().Get();
		return pContext;
	}
};
