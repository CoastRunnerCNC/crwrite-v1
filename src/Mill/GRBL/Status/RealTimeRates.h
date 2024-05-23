#pragma once

#include "Common/CommonHeaders.h"
#include <Common/Util/StringUtil.h>
#include <json/json.h>

// Representation of feedrate & spindle speed as well as parsing & reporting
class RealTimeRates
{
public:
	RealTimeRates(const uint32_t feedRate, const uint32_t spindleSpeed) noexcept
		: m_feedRate(feedRate), m_spindleSpeed(spindleSpeed)
	{

	}

	static RealTimeRates Parse(const std::string& ratesStr)
	{
		std::pair<std::string, std::string> rates = StringUtil::SplitOnce(ratesStr, ":");
		if (rates.first == "FS")
		{
			rates = StringUtil::SplitOnce(rates.second, ",");
			return RealTimeRates(std::stoul(rates.first), std::stoul(rates.second));
		}
		else if (rates.first == "F")
		{
			return RealTimeRates(std::stoul(rates.second), 0);
		}
		else
		{
			throw std::exception{ };
		}
	}

	inline Json::Value ToJSON() const
	{
		Json::Value json;
		json["feedrate"] = m_feedRate;
		json["spindle_speed"] = m_spindleSpeed;
		return json;
	}

	inline uint32_t GetFeedRate() const { return m_feedRate; }
	inline uint32_t GetSpindleSpeed() const { return m_spindleSpeed; }

private:
	uint32_t m_feedRate;
	uint32_t m_spindleSpeed;
};