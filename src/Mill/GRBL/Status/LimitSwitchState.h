#pragma once

#include "Common/CommonHeaders.h"
#include <json/json.h>

// Utility to track GRBL limit switches
class LimitSwitchState
{
public:
    LimitSwitchState() noexcept = default;
    LimitSwitchState(const bool probe, const bool x, const bool y, const bool z) noexcept
        : m_probe(probe), m_x(x), m_y(y), m_z(z)
    {

    }

    /* PARSERS */
    static LimitSwitchState Parse(const std::string& buffer)
    {
        if (buffer.size() != 4) {
            throw std::exception();
        }

        const auto probe = buffer[0] == 'P';

        return LimitSwitchState(probe, buffer[1] == 'X', buffer[2] == 'Y', buffer[3] == 'Z');
    }

    /* JSON */
    Json::Value ToJSON() const
    {
        Json::Value json;

        if (Tripped()) {
            Json::Value tripped(Json::arrayValue);
            Json::ArrayIndex index = 0;

            if (m_probe) {
                tripped[index++] = "PROBE";
            }

            if (m_x) {
                tripped[index++] = "X";
            }

            if (m_y) {
                tripped[index++] = "Y";
            }

            if (m_z) {
                tripped[index++] = "Z";
            }

            json["tripped"] = tripped;
        }

        return json;
    }

    /* GETTERS */
    bool ProbeTripped() const noexcept { return m_probe; }
    bool XTripped() const noexcept { return m_x; }
    bool YTripped() const noexcept { return m_y; }
    bool ZTripped() const noexcept { return m_z; }

    // Returns true if any of the limit switches have been tripped
    bool Tripped() const noexcept { return m_probe || m_x || m_y || m_z; }

private:
    bool m_probe;
    bool m_x;
    bool m_y;
    bool m_z;
};
