#pragma once

#include <Common/Util/JsonUtil.h>
#include <Common/Models/Measurement.h>

// Utility that represents the extents of a measurement range (I.e. axis bounds of machine)
class Range
{
public:
    Range(const Measurement& min, const Measurement& max)
        : m_min(min), m_max(max) { }

    const Measurement& minimum() const noexcept { return m_min; }
    const Measurement& maximum() const noexcept { return m_max; }

    Json::Value ToJSON() const
    {
		Json::Value json;
		json["min"] = m_min.ToJSON();
		json["max"] = m_max.ToJSON();
		return json;
    }

private:
    Measurement m_min;
    Measurement m_max;
};