#pragma once

#include "Common/CommonHeaders.h"
#include "RealTimePosition.h"
#include "RealTimeCoordinates.h"
#include "RealTimeRates.h"
#include "BufferState.h"
#include "LimitSwitchState.h"
#include <Common/Defs.h>
#include <Common/Util/StringUtil.h>
#include <Common/Logger.h>
#include <json/json.h>
using namespace MillLogger;

// This class decomposes ? responses into meaningful sub-elements and collects their various internal representations
class RealTimeStatus
{
public:
    /* PARSERS */
    static RealTimeStatus Parse(const std::string& input, const uint8_t wcs, const Measurement::Unit unit, const uint8_t parserUnits, const uint8_t movementType)
    {
        if (input.size() < 2 || input[0] != '<' || input[input.size() - 1] != '>') {
            throw std::exception();
        }

        const std::string cleaned = input.substr(1, input.size() - 2); // Strip chevrons(<>)
        const std::vector<std::string> fields = StringUtil::Split(cleaned, "|");
        if (fields.size() < 4) {
            throw std::exception();
        }

        const std::pair<std::string, std::string> machineState = StringUtil::SplitOnce(fields[0], ":");
        const int machineSubState = machineState.second.empty() ? -1 : std::stoi(machineState.second);
        RealTimePosition position = RealTimePosition::Parse(fields[1], unit);
        BufferState buffer = BufferState::Parse(fields[2]);
        
        uint32_t lineNumber = 0;
        LimitSwitchState limits;
        if (StringUtil::StartsWith(fields[3], "L")) {
            const std::string lineNumberStr = StringUtil::SplitOnce(fields[3], ":").second;
            lineNumber = lineNumberStr.empty() ? 0 : std::stoul(lineNumberStr);
            limits = LimitSwitchState::Parse(fields[4]);
        } else {
            limits = LimitSwitchState::Parse(fields[3]);
        }

        RealTimeStatus status(
            input,
            machineState.first,
            machineSubState,
            std::move(position),
            std::move(buffer),
            lineNumber,
            std::move(limits),
            parserUnits,
            movementType
        );

        for (size_t i = 5; i < fields.size(); i++) {
            const std::pair<std::string, std::string> field = StringUtil::SplitOnce(fields[i], ":");
            if (field.first == "W") {
                MILL_LOG("Adding work coordinates");
                status.AddWorkCoordinates(
                    wcs,
                    std::make_shared<RealTimeCoordinates>(RealTimeCoordinates::Parse(field.second, unit))
                );
            } else if (field.first == "FS" || field.first == "F") {
                status.AddRates(RealTimeRates::Parse(fields[i]));
            }
        }

        return status;
    }

    static RealTimeStatus ParseV0(const std::string& input, const uint8_t wcs, const Measurement::Unit unit, const uint8_t parserUnits, const uint8_t movementType)
    {
        if (input.size() < 2 || input[0] != '<' || input[input.size() - 1] != '>') {
            throw std::exception();
        }

        const std::string cleaned = input.substr(1, input.size() - 2); // Strip chevrons(<>)
        std::pair<std::string, std::string> statusAndCoords = StringUtil::SplitOnce(cleaned, ",");
        MILL_LOG("Status: " + statusAndCoords.first);
        MILL_LOG("Coords: " + statusAndCoords.second);

        const std::pair<std::string, std::string> machineState = StringUtil::SplitOnce(statusAndCoords.first, ":");
        const int machineSubState = machineState.second.empty() ? -1 : std::stoi(machineState.second);

        // Coords should look like: MPos:0.000,0.000,0.000,WPos:0.000,0.000,0.000
        const std::string coords = statusAndCoords.second;

        std::string::size_type pos = 0;

        // Find third comma
        pos = coords.find_first_of(",", pos + 1);
        pos = coords.find_first_of(",", pos + 1);
        pos = coords.find_first_of(",", pos + 1);
        std::string machinePositionStr = coords.substr(0, pos);
        MILL_LOG("Machine position str: " + machinePositionStr);

        RealTimePosition machinePosition = RealTimePosition::Parse(machinePositionStr, unit);

        // Find third comma
        std::string::size_type pos2 = pos;
        pos2 = coords.find_first_of(",", pos2 + 1);
        pos2 = coords.find_first_of(",", pos2 + 1);
        pos2 = coords.find_first_of(",", pos2 + 1);
        std::string workPositionStr = coords.substr(pos + 1, pos2);
        MILL_LOG("Work position str: " + workPositionStr);
        std::string workCoordinatesStr = StringUtil::SplitOnce(workPositionStr, ":").second;
        MILL_LOG("Work coordinates str: " + workCoordinatesStr);
        std::shared_ptr<RealTimeCoordinates> pWorkPosition =
            std::make_shared<RealTimeCoordinates>(RealTimeCoordinates::Parse(workCoordinatesStr, unit));

        RealTimeStatus status(
            input,
            machineState.first,
            machineSubState,
            std::move(machinePosition),
            BufferState(0, 0),
            0,
            LimitSwitchState(false, 0, 0, 0),
            parserUnits, 
            movementType
        );
        status.AddWorkCoordinates(wcs, pWorkPosition);

        return status;
    }

    Json::Value ToJSON() const
    {
        Json::Value json;

        json["raw"] = m_rawStatus;
        json["state"] = m_machineState;
        json["substate"] = m_machineSubState;
        json["machine_pos"] = m_position.ToJSON(EPositionType::MACHINE, m_workCoordinates);
        json["buffer"] = m_buffer.ToJSON();
        json["limits"] = m_limits.ToJSON();
        json["line"] = m_lineNumber;
        json["parserUnits"] = m_parserUnits == 21 ? "mm" : "inch";
        json["movementType"] = m_movementType == 90 ? "absolute" : "relative";

        if (m_workCoordinates != nullptr) {
            Json::Value workCoords;
            workCoords["wcs"] = "G" + std::to_string(m_wcs);
            workCoords["work_pos"] = m_position.ToJSON(EPositionType::WORK, m_workCoordinates);
            json["work_coordinates"] = workCoords;
        }

        if (m_pRates != nullptr) {
            json["rates"] = m_pRates->ToJSON();
        }

        return json;
    }

    /* GETTERS */
    const RealTimePosition& GetPosition() const noexcept { return m_position; }
    const BufferState& GetBuffer() const noexcept { return m_buffer; }
    const LimitSwitchState& GetLimits() const noexcept { return m_limits; }
    uint32_t GetLineNumber() const noexcept { return m_lineNumber; }
    const std::unique_ptr<RealTimeRates>& GetRates() const noexcept { return m_pRates; }
    std::shared_ptr<RealTimeCoordinates> GetWorkCoordinates() const noexcept { return m_workCoordinates; }
    const std::string& GetState() const noexcept { return m_machineState; }

    /* SETTERS */
    void AddWorkCoordinates(const uint8_t wcs, const RealTimeCoordinates::Ptr& pCoords) noexcept
    {
        m_wcs = wcs;
        m_workCoordinates = pCoords;
    }
    void AddRates(RealTimeRates&& rates) noexcept { m_pRates = unique::make_unique<RealTimeRates>(std::move(rates)); }
    void SetState(const std::string& state) noexcept { m_machineState = state; }

private:
    RealTimeStatus(
        const std::string& rawStatus,
        const std::string& machineState,
        const int machineSubState,
        RealTimePosition&& position,
        BufferState&& buffer,
        const uint32_t lineNumber,
        LimitSwitchState&& limits,
        const uint8_t parserUnits,
        const uint8_t movementType) noexcept
        : m_rawStatus(rawStatus),
        m_machineState(machineState),
        m_machineSubState(machineSubState),
        m_position(std::move(position)),
        m_buffer(std::move(buffer)),
        m_lineNumber(lineNumber),
        m_limits(std::move(limits)),
        m_wcs(54),
        m_parserUnits(parserUnits),
        m_movementType(movementType)
    {

    }

    std::string m_rawStatus;
    std::string m_machineState;
    int m_machineSubState;
    RealTimePosition m_position;
    BufferState m_buffer;
    uint32_t m_lineNumber;
    LimitSwitchState m_limits;

    uint8_t m_wcs;
    uint8_t m_parserUnits;
    uint8_t m_movementType;
    RealTimeCoordinates::Ptr m_workCoordinates;
    std::unique_ptr<RealTimeRates> m_pRates;
};

typedef std::shared_ptr<RealTimeStatus> RealTimeStatusPtr;
