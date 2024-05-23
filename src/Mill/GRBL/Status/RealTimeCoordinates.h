#pragma once

#include "Common/CommonHeaders.h"
#include <Common/Util/StringUtil.h>
#include <Common/Models/Axis.h>
#include <Common/Models/Measurement.h>
#include <json/json.h>

// Parse GRBL status reports and represent position data for machine
class RealTimeCoordinates
{
public:
    using Ptr = std::shared_ptr<RealTimeCoordinates>;

    RealTimeCoordinates(const Measurement& x, const Measurement& y, const Measurement& z) noexcept
        : m_x(x), m_y(y), m_z(z)
    {

    }

    /* PARSERS */
    static RealTimeCoordinates Parse(const std::string& coordinate, const Measurement::Unit unit)
    {
        const std::vector<std::string> coordinateValues = StringUtil::Split(coordinate, ",");
        const float x = std::stof(coordinateValues[0]);
        const float y = std::stof(coordinateValues[1]);
        const float z = std::stof(coordinateValues[2]);
        return RealTimeCoordinates({ x, unit }, { y, unit }, { z, unit });
    }

    /* JSON */
    Json::Value ToJSON() const
    {
        Json::Value json;
        json["x"] = m_x.ToJSON();
        json["y"] = m_y.ToJSON();
        json["z"] = m_z.ToJSON();
        return json;
    }

    /* GETTERS */
    const Measurement& GetX() const noexcept { return m_x; }
    const Measurement& GetY() const noexcept { return m_y; }
    const Measurement& GetZ() const noexcept { return m_z; }
    const float GetX(Measurement::Unit unit) const noexcept {
        return unit == Measurement::Unit::MM ? m_x.millimeters() : m_x.inches();
    }
    const float GetY(Measurement::Unit unit) const noexcept {
        return unit == Measurement::Unit::MM ? m_y.millimeters() : m_y.inches();
    }
    const float GetZ(Measurement::Unit unit) const noexcept {
        return unit == Measurement::Unit::MM ? m_z.millimeters() : m_z.inches();
    }
    const Measurement& Get(const EAxis axis) const
    {
        switch (axis)
        {
            case EAxis::X: return GetX();
            case EAxis::Y: return GetY();
            case EAxis::Z: return GetZ();
        }

        throw std::exception();
    }

    /* OPERATORS */
    RealTimeCoordinates operator+(const RealTimeCoordinates& rhs) const
    {
        const Measurement x = m_x + rhs.GetX();
        const Measurement y = m_y + rhs.GetY();
        const Measurement z = m_z + rhs.GetZ();
        return RealTimeCoordinates(x, y, z);
    }

    RealTimeCoordinates operator-(const RealTimeCoordinates& rhs) const
    {
        const Measurement x = m_x - rhs.GetX();
        const Measurement y = m_y - rhs.GetY();
        const Measurement z = m_z - rhs.GetZ();
        return RealTimeCoordinates(x, y, z);
    }

private:
    const Measurement m_x;
    const Measurement m_y;
    const Measurement m_z;
};