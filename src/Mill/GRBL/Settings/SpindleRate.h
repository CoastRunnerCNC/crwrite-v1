#pragma once

#include "Common/CommonHeaders.h"
#include <Common/Logger.h>
using namespace MillLogger;

class SpindleRate
{
public:
	using Ptr = std::shared_ptr<SpindleRate>;

	void SetSlider(const int slider) noexcept
	{
		std::lock_guard<std::mutex> write(m_mutex);

		const int value = std::max(30, slider);
		if (m_slider != value)
		{
			CR_LOG_F("Updating spindle slider to %d", value);

			m_updateRequired = true;
			m_slider = value;
		}
	}

	int GetSlider() const noexcept
	{
		std::lock_guard<std::mutex> read(m_mutex);

		return m_slider;
	}

	int UpdateSpindleRate(const int spindleRate) noexcept
	{
		std::lock_guard<std::mutex> lock(m_mutex);

		const int calculatedSpindleRate = ((spindleRate * m_slider) / 100);
		CR_LOG_F("Updating spindlerate. Input: %d. Slider: %d. Output: %d", spindleRate, m_slider, calculatedSpindleRate);
		m_spindleRate = spindleRate;
		m_updateRequired = false;
		MILL_LOG("Spindlerate updated.");
		MillLogger::Flush();

		return calculatedSpindleRate;
	}

	bool IsUpdateRequired() const noexcept
	{
		std::lock_guard<std::mutex> read(m_mutex);

		return m_updateRequired;
	}

	int GetSpindleRate(const bool sendToGRBL) noexcept
	{
		std::lock_guard<std::mutex> write(m_mutex);
		const int calculatedSpindleRate = ((m_spindleRate * m_slider) / 100);
		if (sendToGRBL)
		{
			m_updateRequired = false;
		}
		CR_LOG_F("Spindlerate requested: %d", calculatedSpindleRate);

		return calculatedSpindleRate;
	}

private:
	mutable std::mutex m_mutex;

	bool m_updateRequired{false};
	int m_slider{100};
	int m_spindleRate{100};
};