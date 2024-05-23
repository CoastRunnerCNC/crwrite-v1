#pragma once

#include "NapiUtil.h"
#include <NAPI/Types/NapiValue.h>
#include <Common/Logger.h>
using namespace MillLogger;

// Wrapper class to run asynchronous "services" directly from the top level of Electron access
// This wraps a few operations, consolidates arguments & environment data, and does some error handling
class INapiService
{
public:
	virtual ~INapiService() = default;

	napi_value Invoke(napi_env env, napi_callback_info info)
	{
		try
		{
			return Call(env, info);
		}
		catch (std::exception & e)
		{
			MILL_LOG("Error thrown: " + std::string(e.what()));
			napi_throw_error(env, "EINVAL", "Invalid Value");
		}

		return nullptr;
	}

protected:
	virtual napi_value Call(napi_env env, napi_callback_info info) = 0;

	std::vector<NapiValue> GetArgs(napi_env env, napi_callback_info info) const
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

class NapiAsyncService : public INapiService, public std::enable_shared_from_this<NapiAsyncService>
{
	class ServiceContext
	{
	public:
		ServiceContext(std::shared_ptr<NapiAsyncService> pService, NAPIContext* pContext) : m_pService(pService), m_pContext(pContext) {}
		virtual ~ServiceContext() { delete m_pContext; }

		std::shared_ptr<NapiAsyncService> m_pService;
		NAPIContext* m_pContext;
	};

public:
	virtual ~NapiAsyncService() = default;

protected:
	virtual napi_value Call(napi_env env, napi_callback_info info) override final
	{
		std::vector<NapiValue> args = GetArgs(env, info);

		NAPIContext* pContext = CreateContext(env, args);

		ASSERT_OK(napi_create_reference(env, GetCallbackFunction(args).napi, 1, &pContext->m_callback));
		ASSERT_OK(napi_create_async_work(
			env,
			NULL,
			NapiString::Create(env, GetResourceName()).napi,
			NapiAsyncService::Execute,
			NapiAsyncService::Complete,
			new ServiceContext(shared_from_this(), pContext),
			&pContext->m_asyncWork)
		);
		ASSERT_OK(napi_queue_async_work(env, pContext->m_asyncWork));

		return nullptr;
	}

	virtual void Execute(napi_env env, NAPIContext* data) = 0;
	virtual std::vector<NapiValue> Complete(napi_env env, NAPIContext* pContext) = 0;

	virtual std::string GetResourceName() const = 0;
	virtual NapiValue GetCallbackFunction(const std::vector<NapiValue>& args) const = 0;
	virtual NAPIContext* CreateContext(napi_env env, const std::vector<NapiValue>& args) const = 0;

private:
	static void Execute(napi_env env, void* data)
	{
		auto pContext = static_cast<ServiceContext*>(data);
		pContext->m_pService->Execute(env, pContext->m_pContext);
	}

	static void Complete(napi_env env, napi_status status, void* data)
	{
		auto pContext = static_cast<ServiceContext*>(data);

		napi_value callback;
		napi_get_reference_value(env, pContext->m_pContext->m_callback, &callback);

		napi_value global;
		napi_get_global(env, &global);

		const auto cb_args = pContext->m_pService->Complete(env, pContext->m_pContext);
		auto napi_cb_args = std::vector<napi_value>{};
		std::transform(std::begin(cb_args), std::end(cb_args), std::back_inserter(napi_cb_args), [](const NapiValue& in){ return in.napi; });
		auto result = napi_value{};
		napi_call_function(env, global, callback, napi_cb_args.size(), napi_cb_args.data(), &result);

		napi_delete_reference(env, pContext->m_pContext->m_callback);
		napi_delete_async_work(env, pContext->m_pContext->m_asyncWork);

		delete pContext;
	}
};
