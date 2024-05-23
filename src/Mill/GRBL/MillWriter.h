#pragma once

#include "Common/CommonHeaders.h"
#include <Mill/GRBL/ConnectionState.h>
#include <Mill/GRBL/SerialConnection.h>
#include <Mill/GRBL/Settings/FeedRate.h>
#include <Files/GCodeLine.h>

// Intermediary that does some pre-processing on commands sent to GRBL controller
// This is where custom commands are intercepted and transformed into the appropriate interanal operations
class MillWriter
{
public:
    using UPtr = std::unique_ptr<MillWriter>;

    MillWriter(
        const ConnectionState::Ptr& pState,
        const SerialConnection::Ptr& pSerial,
        const FeedRate::Ptr& pFeedRate
    )   : m_pState(pState), m_pSerial(pSerial), m_pFeedRate(pFeedRate) { }

    void Write(const GCodeLine& line);

private:
    void UpdateConnectionState(const GCodeLine& line);
    void WriteGRBLLine(const GCodeLine& line);
    void WriteMCodeLine(const GCodeLine& line);
    void WriteLine(const GCodeLine& line);

    ConnectionState::Ptr m_pState;
    SerialConnection::Ptr m_pSerial;
    FeedRate::Ptr m_pFeedRate;
};