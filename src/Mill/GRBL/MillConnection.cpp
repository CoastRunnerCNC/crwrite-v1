#include "MillConnection.h"
#include "MillDaemon.h"
#include <Common/Util/OSUtil.h>
#include <Common/Util/StringUtil.h>
#include <Common/Models/Measurement.h>
#include <Common/Logger.h>

#include <Mill/Firmware/FirmwareManager.h>
#include <Mill/Display/MillDisplayManager.h>
#include <Mill/Status/MillingError.h>
#include <Mill/GRBL/Regex.h>
#include <Mill/GRBL/Commands/M100.h>
#include <Mill/GRBL/Commands/M101.h>
#include <Mill/GRBL/Commands/M102.h>
#include <Settings/SettingManager.h>
#include <Mill/GRBL/Commands/ContourMapping.h>

using namespace MillLogger;
using std::string;
using std::operator""s;
using std::vector;
using std::pair;
using std::getline;
using namespace std::chrono_literals;
using std::this_thread::sleep_for;
using std::lock_guard;

constexpr auto softReset = char{ 24 };

MillConnection::MillConnection(
    const CNCMill& cncMill,
    const ConnectionState::Ptr& pState,
    const SerialConnection::Ptr& pSerial)
    : m_progress(),
    m_pFeedRate(std::make_shared<FeedRate>()),
    m_mutex(),
    m_pSerialConnection(pSerial),
    m_cncMill(cncMill),
    m_pState(pState),
    m_protocol(pSerial, pState),
    m_pWriter(std::make_unique<MillWriter>(pState, pSerial, m_pFeedRate)),
    m_emergencyStop(false)
{
}

MillConnection::~MillConnection()
{
    if (IsConnected()) {
        try {
            Reset(false);
            Disconnect();
        }
        catch (std::exception& e) {
            MILL_LOG(std::string("Exception thrown: ") + e.what());
        }
    }
}

MillConnection::Ptr MillConnection::Connect(const CNCMill& cncMill)
{
    MILL_LOG("Connecting to CNC...");
    if (cncMill.GetPath().length() == 0) {
        throw MillException(MillException::FAILED_OPEN, "Path Empty");
    }

    auto pState = std::make_shared<ConnectionState>();
    auto pConnection = std::shared_ptr<MillConnection>(new MillConnection(
        cncMill,
        pState,
        std::make_shared<SerialConnection>(cncMill.GetPath(), pState)
    ));

    pConnection->Connect();

    return pConnection;
}

void MillConnection::Connect() {
    auto lock = lock_guard{ m_mutex };

    m_pSerialConnection->Connect();
    m_pState->SetConnected(true);
    m_pState->SetStartup(true);

    m_pSerialConnection->FlushReads();

    bool started = false;

    // Wait for startup
    while (true) {
        std::unique_ptr<std::string> pLine = m_pSerialConnection->ReadLine();
        if (pLine != nullptr) {
            MILL_LOG("Line read: " + *pLine);

            std::smatch sm;
            if (std::regex_match(*pLine, sm, GRBL::RXSTART)) {
                m_protocol.SetVersion(sm[1].str());
                started = true;
            }

            continue;
        }

        const ConnectionState& state = GetState();
        if (started && !state.IsStartup()) {
            break;
        }

        if (state.IsTimedOut()) {
            MILL_LOG("Connection timeout");
            if (!Reset(false)) {
                throw MillException(MillException::ESTOP_PUSHED);
            }
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(50));
    }

    m_pSerialConnection->FlushReads();

    ExecuteCommand(GCodeLine::Injected("$$"));
}

void MillConnection::Disconnect()
{
    VerifyConnected();

    m_progress.Reset();
    m_pState->Reset();
    m_pSerialConnection->Disconnect();
}

bool MillConnection::Reset(bool sendSoftResetToGRBL)
{
    VerifyConnected();

    sleep_for(500ms);
    auto pLine = m_pSerialConnection->ReadLine();
    if (pLine) {
        m_protocol.ProcessResponse(*pLine); // Check for errors/alarms before moving on. Throw exceptions up the call stack for proper handling.
    }
    m_pSerialConnection->FlushReads();
    if (sendSoftResetToGRBL) { m_pSerialConnection->WriteChar(softReset, 1000); }
    else { m_pSerialConnection->WriteChar('?', 1000); }
    auto lock = lock_guard{ m_mutex };
    sleep_for(5ms);
    pLine = m_pSerialConnection->ReadLine();
    if (pLine == nullptr) {
        return false;
    }

    while (pLine != nullptr) {
        try {
            m_protocol.ProcessResponse(*pLine);
        } catch(...) {}
        pLine = m_pSerialConnection->ReadLine();
    }

    MILL_LOG("Connection reset");

    m_progress.Reset();
    m_pState->Reset();
    m_pState->SetConnected(true);

    return true;
}

void MillConnection::ProbeReset()
{
    VerifyConnected();

    MILL_LOG("Performing Probe Reset");
    sleep_for(500ms);
    auto lock = lock_guard{ m_mutex };
    m_pSerialConnection->FlushReads();
    m_pSerialConnection->WriteChar(softReset, 500);//"|");
    m_pSerialConnection->WriteLine("$X", 500);
    m_pSerialConnection->FlushReads();

    m_progress.Reset();
    m_pState->Reset();
    m_pState->SetConnected(true);
    m_pState->SetRetryProbe(true);

    if (m_SavedPreprobeState) { RestorePreprobeState(); }
}

void MillConnection::Reconnect()
{
    if (m_pState->IsConnected()) {
        Disconnect();
    }

    Connect();
}

void MillConnection::VerifyConnected() const
{
    if (!m_pState->IsConnected()) {
        throw MillException(MillException::NOT_OPEN);
    }
}

void MillConnection::EmergencyStop()
{
    m_emergencyStop.store(true, std::memory_order_release);
    ExecuteRealtime(softReset);   // Immediately stop machine
    m_progress.SetCompleted(0); // Promptly reset to 0 so that UI doesn't get confused reading a stale state
    try { 
        Reset(false);    // We very likely triggered an alarm, so this will throw
    }
    catch (...) {
        // No action. Alarm is expected.
    }
    m_emergencyStop.store(false, std::memory_order_release);
    sleep_for(200ms);       // Wait for machine to be ready to be reset. Accomodating change in firmware.
    ExecuteRealtime(softReset);
}

void MillConnection::ExecuteCommand(const GCodeLine& gcode, const bool isManualEntry) {
    VerifyConnected();
    CR_LOG_SYNC("Executing: " + gcode.GetOriginal() + " => " + gcode.GetCleaned());
    auto lock = lock_guard{ m_mutex };

    m_pState->ResetIdleTime();
    m_pState->ClearError();

    // STATUS: Need more robust status checking.
    if (!m_pState->IsLocked() && !m_pState->IsTimedOut() && !m_pState->IsAlarm()) {
        MILL_LOG("Not locked, timed out, or alarm");
        ExecuteLine(gcode, false, true);
    } else if (gcode.IsUnlock() || gcode.IsHome()) {
        Reset(!isManualEntry);  // Manually entered commands should not automatically send a soft-reset to GRBL
        ExecuteLine(gcode, false, true);
    } else if (gcode.GetCleaned() == "|") {
        Reset(true);
    } else {
        CR_LOG_SYNC("Failed to write: " + gcode.GetCleaned());
        CR_LOG_F("Locked: %d - TimedOut: %d - Alarm: %d", m_pState->IsLocked(), m_pState->IsTimedOut(), m_pState->GetAlarm());
        if (!gcode.GetInjectedCommand()) {
            MillDisplayManager::AddLine(ELineType::ERR, "Failed to write \"" + gcode.GetOriginal() + "\"! The machine may be locked or the emergency stop may be engaged.");
        }
    }
}

void MillConnection::ExecuteProgram(const std::vector<GCodeLine>& gcodes, const bool isManualEntry)
{
    auto lock = lock_guard{ m_mutex };
    MILL_LOG("BEGIN");
    VerifyConnected();
    M113();     // Disable contour map. This should be explicitly re-enabled on each run.

    if (GetError().has_value()) {
        if (!Reset(!isManualEntry)) {   // Manually entered programs should not automatically send a soft-reset to GRBL
            return;
        }
    }

    m_pState->ResetIdleTime();
    if (m_pState->GetRetryProbe()) {
        m_pSerialConnection->WriteLine("$X", 1000);
        m_pState->SetRetryProbe(false);
    }

    RefreshStatus();
    m_pSerialConnection->FlushReads();

    m_progress.SetCompleted(0);
    m_progress.SetTotal(gcodes.size());
    m_accumulatedPosition.Clear();

    // Get WCS and initialize accumulator
    const auto wcs = GetCurrentWCS();
    m_accumulatedPosition.SetWCS(wcs);

    // Get position
    const auto pos = GetCurrentPosition();
    m_accumulatedPosition.SetPosition(pos);

    size_t numLines = gcodes.size();
    for (size_t i = 0; i < numLines; i++) {
        const GCodeLine& gcode = gcodes[i];
        ExecuteLine(gcode, true, isManualEntry);

        if (m_pFeedRate->IsUpdateRequired()) {
            MILL_LOG("FeedRate Update Required");
            ExecuteLine(GCodeLine(StringUtil::Format("F%d", m_pFeedRate->GetFeedRate()), true), true, isManualEntry);
        }

        m_progress.SetCompleted(i + 1);
    }

    ExecuteLine(GCodeLine("G4 P0"), false, false);

    MILL_LOG("END");
}

void MillConnection::ExecuteRealtime(const char command)
{
    VerifyConnected();

    MILL_LOG("Executing: " + std::to_string(command));

    m_pSerialConnection->WriteChar(command);
    if (command == '|') {
        // Any changes to the parser state during a reset can/should? be updating to the ConnectionState herein m_pState
        std::string str = "G54";
        GCodeLine line = GCodeLine{ str };
        m_pState->SetWCS(line.GetWCS().value());
        m_pState->SetUnits(21);
    }
}

void MillConnection::ExecuteLine(const GCodeLine& line, const bool useBuffer, const bool manualEntry)
{
    MILL_LOG("original: " + line.GetOriginal());
    if (line.GetCleaned().empty()) {
        return;
    }

    if (!m_pState->GetBuffer().empty()) {
        if (!useBuffer || m_protocol.RequiresEmptyBuffer(line)) {
            ReadResponse(true);
        }

        while (!m_pState->GetBuffer().fits(line)) {
            ReadResponse(false);
        }
    }

    if (!manualEntry && line.GetCleaned() == "$LS" && !SettingManager::GetInstance().GetEnableLS()) {
        throw MillException(MillException::UNKNOWN_COMMAND, line.GetOriginal());
    }

    // STATUS: Modify this to wait for appropriate status.
    if (line.GetType() == GCodeLine::TYPE_GRBL) {
        std::string status = "Run";
        while (status == "Run") {
            RefreshStatus();
            auto pStatus = m_pState->GetRealTimeStatus();
            if (pStatus != nullptr) {
                status = pStatus->GetState();
            }
        }
    }

    if (!manualEntry && line.GetCleaned().find("G38") != string::npos) {
        TryProbeOperation(line);
        return;
    }
    else { 
        // Only movement commands with X, Y, Z, I, J, or K are valid for contour map adjustment
        auto isAdjustableMovementCmd = false;
        if (line.GetCleaned().find("G53") != string::npos) { isAdjustableMovementCmd = false; }
        else if (line.GetCleaned().find_first_of("XYZIJK") != string::npos) { isAdjustableMovementCmd = true; }

        if (g_useContourMap.load(std::memory_order_acquire) && isAdjustableMovementCmd) { MILL_LOG("transform"); TransformZAndWriteLine(line); }
        else {
            m_accumulatedPosition.ApplyGCode(line);
            m_pWriter->Write(line);
        }

        if (!useBuffer || line.IsBlocking()) {
            ReadResponse(true);
        }
        return;
    }
}

bool MillConnection::TryProbeOperation(const GCodeLine& line) {
    m_SavedPreprobeState.reset();
    RefreshStatus();

    // Save position
    auto point = Point3{ -86.0f, -0.5f, -0.5f };    // Default to home position
    auto pStatus = m_pState->GetRealTimeStatus();
    if (pStatus) {
        auto savedPosition = m_pState->GetRealTimeStatus()->GetPosition().GetMachinePosition();
        point.x = savedPosition.GetX().millimeters();
        point.y = savedPosition.GetY().millimeters();
        point.z = savedPosition.GetZ().millimeters();
    }
    else {
        MILL_LOG("Realtime status unavailable.");
    }

    // Request machine state.
    m_pSerialConnection->WriteLine("$G");

    // Get & clean response
    auto restoreStateCommand = ReadResponseWithoutProcessing();
    restoreStateCommand = restoreStateCommand.substr(4);
    restoreStateCommand.pop_back();

    try {
        // Try probe operation. 
        m_pState->GetBuffer().push(line);
        m_pWriter->Write(line);
        ReadResponse(true);
    }
    catch (MillException e) {
        // Probing failed. Stash the saved state until after alarm is read, acknowledged, and cleared.
        auto restoreState = SAVED_PREPROBE_STATE{ };
        restoreState.position = point;
        auto temp = ""s;
        auto commandStream = std::stringstream{ restoreStateCommand };

        while (std::getline(commandStream, temp, ' ')) {
            if (temp == "M9"s) { restoreState.coolantState = temp; }
            else if (temp[0] == 'M') { restoreState.spindleState = temp; }
            else if (temp[0] == 'T') { restoreState.toolNumber = temp; }
            else if (temp[0] == 'F') { restoreState.feedRate = temp; }
            else if (temp[0] == 'S') { restoreState.spindleRPM = temp; }
            else { restoreState.gStates.push_back(temp); }
        }

        m_SavedPreprobeState = std::make_unique<SAVED_PREPROBE_STATE>(std::move(restoreState));
        throw e;
    }

    return true;
}

void MillConnection::RestorePreprobeState() {
    try {
        MILL_LOG("Restoring probe state...");

        // Restore Modal States
        m_pSerialConnection->WriteLine(m_SavedPreprobeState->coolantState);
        m_pSerialConnection->WriteLine(m_SavedPreprobeState->spindleState);
        m_pSerialConnection->WriteLine(m_SavedPreprobeState->toolNumber);
        m_pSerialConnection->WriteLine(m_SavedPreprobeState->feedRate);     // Set feedrate before possible G1 command
        m_pSerialConnection->WriteLine(m_SavedPreprobeState->spindleRPM);

        // Restore Position
        auto resetPositionCommand = "G53 G0"s;
        resetPositionCommand += " X"s + std::to_string(m_SavedPreprobeState->position.x);
        resetPositionCommand += " Y"s + std::to_string(m_SavedPreprobeState->position.y);
        resetPositionCommand += " Z"s + std::to_string(m_SavedPreprobeState->position.z);

        m_pState->GetBuffer().push(GCodeLine{ resetPositionCommand, false });
        m_pSerialConnection->WriteLine(resetPositionCommand);
        ReadResponse(true);

        // Restore movement mode after moving into place (so that we don't overwrite our restored movement mode)
        for (auto& state : m_SavedPreprobeState->gStates) {
            if (state.find("G38.") != string::npos) { state = "G0"; }
            m_pSerialConnection->WriteLine(state);
        }

        m_pSerialConnection->FlushReads();
        m_pSerialConnection->WriteLine("$G");

        // Read all responses until GRBL responds back with it's current state, ex: [GC:G0 G54 G17 G21 G90 G94 M5 M9 T0 F0 S0]
        auto response = "ok"s;
        while (response[0] != '[') {
            sleep_for(10ms);
            auto pLine = m_pSerialConnection->ReadLine();
            if (pLine) { response = *pLine; }
        }

        MILL_LOG(response);
        m_SavedPreprobeState.reset();
    }
    catch (...) {
        MILL_LOG("Error occurred while restoring probe state.");
    }
}

const MillSettings& MillConnection::GetSettings(const bool updateFirst)
{
    if (updateFirst || m_pState->GetSettings().IsEmpty()) {
        ExecuteCommand(GCodeLine("$$", true));
    }

    return m_pState->GetSettings();
}

void MillConnection::ReadResponse(const bool blocking)
{
    while (true) {
        VerifyConnected();
        sleep_for(5ms);

        auto pLine = m_pSerialConnection->ReadLine();
        if (pLine != nullptr) {
            auto line = *pLine;
            m_protocol.ProcessResponse(line);
            continue;
        } else if (m_emergencyStop.load(std::memory_order_acquire)) {
            MILL_LOG("E-Stop Triggered");
            throw MillException(MillException::SOFTWARE_ESTOP);
        }

        m_pState->UpdateState();
        // For now, we'll assume all timeouts are E-Stops since they're difficult to differentiate
        // A real timeout should acknowledge "disengaging" the E-stop once further responses are recieved
        if (m_pState->IsTimedOut() /*&& !m_pState->IsLocked()*/) {  // E-Stop is pressed if machine is non-responsive and it's not in a locked state.
            if (MillDaemon::GetInstance().GetManualOperationFlag()) {
                MILL_LOG("Ignore timeout in manual operation mode.");
                return;
            }
            MILL_LOG("Hardware E-Stop Triggered");
            m_pSerialConnection->WriteChar('?');
            /*m_pState->SetAlarm(ALARM_CODE_ESTOP);
            throw MillException(MillException::ESTOP_PUSHED);*/
            //TEMP
        } else if (m_pState->IsTimedOut()) {
            MILL_LOG("Timed out");
            m_pSerialConnection->WriteChar('?');
            /*m_pState->SetAlarm(ALARM_CODE_TIMEOUT);
            throw MillException(MillException::TIMEOUT);*/
        } else if (m_pState->ShouldRequestStatus()) {
            //MILL_LOG("Sending ? before timeout");
            m_pSerialConnection->WriteChar('?');
        }

        if (!blocking || m_pState->GetBuffer().empty()) {
            break;
        }
    }

    m_pState->SetHoming(false);
}

string MillConnection::ReadResponseWithoutProcessing() {
    sleep_for(5ms);
    auto pLine = m_pSerialConnection->ReadLine();
    constexpr auto maximumTries = 200;
    auto numTries = 0;
    while (pLine == nullptr && numTries++ < maximumTries) {
        sleep_for(5ms);
        pLine = m_pSerialConnection->ReadLine();
        m_pState->ResetIdleTime();
    }
    if (pLine == nullptr) {
        // Something is wrong if we still cannot get a response
        MILL_LOG("Timed out");
        //m_pState->SetAlarm(ALARM_CODE_TIMEOUT);
        throw MillException(MillException::ALARM);
    }
    else { 
        return *pLine;
    }
}

vector<pair<string, Point3>> MillConnection::GetOffsets() noexcept {
    auto result = vector<pair<string, Point3>>{ };
    try {
        auto lock = lock_guard{ m_mutex };
        auto serialLock = m_pSerialConnection->LockConnection();
        VerifyConnected();

        // Get current WCS#
        // Iterate through all WCS values and check for non-zero values
        // Reset to the previously selected WCS value
        m_pSerialConnection->WriteLine("$#");
        auto response = ""s;
        auto offsetName = ""s;
        auto offsetValue = ""s;
        while (response != "ok") {
            response = ReadResponseWithoutProcessing();
            MILL_LOG("Read line: " + response);
            if (response[0] != '[') { continue; }
            response.pop_back();
            response.erase(0, 1);
            auto parseMe = std::stringstream{ response };
            getline(parseMe, offsetName, ':');
            auto offset = Point3{ };
            getline(parseMe, offsetValue, ',');
            offset.x = std::stof(offsetValue);

            if (offsetName == "TLO") {
                offset.y = offset.x;
                offset.z = offset.x;
            }
            else {
                getline(parseMe, offsetValue, ',');
                offset.y = std::stof(offsetValue);
                getline(parseMe, offsetValue, ':');
                offset.z = std::stof(offsetValue);
            }
            result.push_back(std::make_pair(offsetName, offset));
        }
    }
    catch (...) { }

    return result;
}

Point3 MillConnection::GetLastProbedPoint() {
    lock_guard lock{ m_probePointLock };
    return m_lastProbedPoint;
}

void MillConnection::SaveProbeResult(const std::string& resultStr) {
    // Ex: [PRB:-86.000,-0.500,-1.350:1]
    try {
        auto response = resultStr;
        response.erase(response.size() - 3);
        response = response.substr(5);
        auto n = response.find(',');
        auto segment = response.substr(0, n - 1);
        auto point = Point3{};
        point.x = std::stof(segment);

        response = response.substr(n + 1);
        n = response.find(',');
        segment = response.substr(0, n - 1);
        point.y = std::stof(segment);

        segment = response.substr(n + 1);
        point.z = std::stof(segment);
        {
            lock_guard lock{ m_probePointLock };
            m_lastProbedPoint = point;
        }
    }
    catch (...) {
        // Do nothing
    }
}

Point3 MillConnection::GetCurrentPosition() {
    auto pos = Point3{};
    auto pStatus = m_pState->GetRealTimeStatus();
    if (!pStatus) { MILL_LOG("Realtime status unavailable."); return pos; }
    const auto& pPos = pStatus->GetPosition();
    const auto unit = m_pState->GetSettings().GetUnit();
    auto coord = pPos.GetMachinePosition();
    pos.x = coord.GetX(unit);
    pos.y = coord.GetY(unit);
    pos.z = coord.GetZ(unit);
    return pos;
}

Vector3 MillConnection::GetCurrentWCS() {
    auto wcs = Vector3{};
    auto pStatus = m_pState->GetRealTimeStatus();
    if (!pStatus) { MILL_LOG("Realtime status unavailable.");  return wcs; }
    auto pWCS = pStatus->GetWorkCoordinates();
    if (!pWCS) { MILL_LOG("Realtime status unavailable.");  return wcs; }
    const auto unit = m_pState->GetSettings().GetUnit();
    wcs.x = pWCS->GetX(unit);
    wcs.y = pWCS->GetY(unit);
    wcs.z = pWCS->GetZ(unit);
    return wcs;
}

void MillConnection::TransformZAndWriteLine(const GCodeLine& line) {
    const auto previousPt = m_accumulatedPosition.GetAbsolutePosition();
    auto tempAccum = m_accumulatedPosition;
    tempAccum.ApplyGCode(line);

    const auto pos = tempAccum.GetAbsolutePosition();
    const auto wcs = GetCurrentWCS();

    auto transLine = string{ };
    if (tempAccum.GetDistanceMode() == DISTANCE_MODE::ABSOLUTE_MOTION) {
        // maybe store prior Z coordinate and re-add it lest we drift in Z by compensating a compensated value
        static auto previousZ = ""s;
        auto chunks = ChunkGCodeLine(line.GetOriginal());
        auto foundZ = false;
        for (auto chunk : chunks) {
            if (chunk[0] == 'Z') {
                previousZ = chunk;
                foundZ = true;
            }
        }

        if (foundZ) {
            transLine = TransformAbsoluteZ(line, pos, wcs);
        }
        else {
            chunks.push_back(previousZ);
            auto lineWithZ = ""s;
            for (auto chunk : chunks) {
                lineWithZ += chunk;
            }
            const auto GCodeWithZ = GCodeLine{ lineWithZ };

            // Redo position based upon adjusted line to avoid accumulating Z adjustments
            auto accum = m_accumulatedPosition;
            accum.ApplyGCode(GCodeWithZ);
            const auto pt = accum.GetAbsolutePosition();

            transLine = TransformAbsoluteZ(GCodeWithZ, pt, wcs);
        }
    }
    else {
        transLine = TransformRelativeZ(line, previousPt, pos);
    }
    const auto transGCode = GCodeLine{ transLine };

    m_pWriter->Write(transGCode);
    m_accumulatedPosition.ApplyGCode(transGCode);
    MILL_LOG("Line: " + line.GetOriginal() + " ==> " + transLine);
}
