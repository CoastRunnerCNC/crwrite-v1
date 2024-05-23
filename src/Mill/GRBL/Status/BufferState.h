#pragma once

#include "Common/CommonHeaders.h"
#include <Common/Util/StringUtil.h>
#include <json/json.h>

// Utility to track GRBL buffer
class BufferState
{
public:
    BufferState(const int plannerBlocks, const int rxBytes) noexcept
        : m_plannerBlocks(plannerBlocks), m_rxBytes(rxBytes)
    {
    
    }

    /* PARSERS */
    static BufferState Parse(const std::string& buffer)
    {
        const std::vector<std::string> parts = StringUtil::Split(buffer, ":");
        if (parts.size() != 2 || parts[0] != "B")
        {
            throw std::exception();
        }

        const std::vector<std::string> values = StringUtil::Split(parts[1], ",");
        if (values.size() != 2)
        {
            throw std::exception();
        }

        return BufferState(std::stoi(values[0]), std::stoi(values[1]));
    }

    /* JSON */
    Json::Value ToJSON() const
    {
        Json::Value json;
        json["free_planner_blocks"] = m_plannerBlocks;
        json["free_rx_bytes"] = m_rxBytes;
        return json;
    }

    /* GETTERS */
    // The number of free blocks in the planner buffer
    int GetFreePlannerBlocks() const noexcept { return m_plannerBlocks; }

    // The number of free bytes in the serial RX buffer
    int GetFreeRxBytes() const noexcept { return m_rxBytes; }

private:
    int m_plannerBlocks;
    int m_rxBytes;
};