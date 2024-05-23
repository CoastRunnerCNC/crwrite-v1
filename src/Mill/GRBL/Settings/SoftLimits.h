#pragma once

#include <Common/Util/JsonUtil.h>
#include <Common/Models/Range.h>
#include <Common/Models/Axis.h>

class SoftLimits
{
public:
	SoftLimits(const bool enabled, const double x_travel, const double y_travel, const double z_travel)
		: m_enabled(enabled),
		m_travel_x{ x_travel, Measurement::Unit::MM },
		m_travel_y{ y_travel, Measurement::Unit::MM },
		m_travel_z{ z_travel, Measurement::Unit::MM } { }

	bool IsEnabled() const noexcept { return m_enabled; }

	Range GetXRange() const noexcept { 
		return Range{
			Measurement{-1 * (m_travel_x.millimeters() - 0.5), Measurement::Unit::MM },
			Measurement{-0.5, Measurement::Unit::MM }
		};
	}

	Range GetYRange() const noexcept {
		return Range{
			Measurement{-1 * m_travel_y.millimeters(), Measurement::Unit::MM},
			Measurement{-0.5, Measurement::Unit::MM}
		};
	}

	Range GetZRange() const noexcept {
		return Range{
			Measurement{-1 * m_travel_z.millimeters(), Measurement::Unit::MM},
			Measurement{-0.5, Measurement::Unit::MM}
		};
	}

	Range GetRange(const EAxis axis) const
	{
		switch (axis)
		{
			case EAxis::X: return GetXRange();
			case EAxis::Y: return GetYRange();
			case EAxis::Z: return GetZRange();
		}

		throw std::exception();
	}

	Json::Value ToJSON() const
	{
		Json::Value json;
		json["enabled"] = IsEnabled();
		json["x"] = GetXRange().ToJSON();
		json["y"] = GetYRange().ToJSON();
		json["z"] = GetZRange().ToJSON();
		return json;
	}

private:
	bool m_enabled;
	Measurement m_travel_x;
	Measurement m_travel_y;
	Measurement m_travel_z;
};