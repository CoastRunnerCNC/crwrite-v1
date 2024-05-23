#pragma once

#include "Common/CommonHeaders.h"
#include <Common/Models/Measurement.h>
#include <Mill/GRBL/Settings/SoftLimits.h>
#include <Common/Logger.h>

class MillSettings
{
	enum Indices : uint8_t
	{
		REPORT_INCHES = 13,
		SOFT_LIMITS_ENABLED = 20,
		X_MAX_TRAVEL = 130,
		Y_MAX_TRAVEL = 131,
		Z_MAX_TRAVEL = 132
	};
public:
	bool IsEmpty() const noexcept { return m_settings.empty(); }

	void UpdateSetting(const uint8_t setting, const float val)
	{
		CR_LOG_F("Updating %d to %f", (int)setting, val);
		m_settings[setting] = val;
	}

	Measurement::Unit GetUnit() const noexcept
	{
		if (m_settings.count(REPORT_INCHES) > 0)
		{
			return ((int)m_settings.at(REPORT_INCHES) == 1) ? Measurement::Unit::INCH : Measurement::Unit::MM;
		}
		
		return Measurement::Unit::MM;
	}

	tl::optional<SoftLimits> GetSoftLimits() const
	{
		if (m_settings.count(X_MAX_TRAVEL) > 0
			&& m_settings.count(Y_MAX_TRAVEL) > 0
			&& m_settings.count(Z_MAX_TRAVEL) > 0)
		{
			return SoftLimits{
				((int)m_settings.at(SOFT_LIMITS_ENABLED) == 1),
				m_settings.at(X_MAX_TRAVEL),
				m_settings.at(Y_MAX_TRAVEL),
				m_settings.at(Z_MAX_TRAVEL)
			};
		}

		return tl::nullopt;
	}

private:
	std::unordered_map<uint8_t, float> m_settings;
};