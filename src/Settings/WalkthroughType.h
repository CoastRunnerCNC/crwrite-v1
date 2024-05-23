#pragma once

#include "Common/CommonHeaders.h"

enum class EWalkthroughType
{
	dashboard,
	milling
};

namespace WalkthroughType
{
	static EWalkthroughType FromString(const std::string& value)
	{
		if (value == "Dashboard")
		{
			return EWalkthroughType::dashboard;
		}
		else if (value == "Milling")
		{
			return EWalkthroughType::milling;
		}

		throw std::exception();
	}

	static std::string GetSettingName(const EWalkthroughType type)
	{
		if (type == EWalkthroughType::dashboard)
		{
			return "show_dashboard_walkthrough";
		}
		else if (type == EWalkthroughType::milling)
		{
			return "show_milling_walkthrough";
		}

		throw std::exception();
	}
}