#pragma once

#include <json/json.h>

// This class provides a uniform measurement value that can then be expressed in either in or mm
class Measurement
{
public:
    enum class Unit
    {
        MM,
        INCH
    };

    Measurement() : m_value(0), m_unit(Unit::MM) { }
    Measurement(const double value, const Unit unit)
        : m_value(value), m_unit(unit) { }

    double millimeters() const noexcept { return m_unit == Unit::MM ? m_value : (m_value * 25.4); }
    double inches() const noexcept { return m_unit == Unit::INCH ? m_value : (m_value / 25.4); }


    Measurement operator+(const Measurement& m) const noexcept
    {
        return Measurement(millimeters() + m.millimeters(), Unit::MM);
    }

    Measurement operator-(const Measurement& m) const noexcept
    {
        return Measurement(millimeters() - m.millimeters(), Unit::MM);
    }

    Json::Value ToJSON() const
    {
        Json::Value json;
        json["mm"] = millimeters();
        json["inch"] = inches();
        return json;
    }

private:
    double m_value;
    Unit m_unit;
};