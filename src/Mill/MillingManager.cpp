#include "MillingManager.h"
#include <Common/Defs.h>
#include <Common/Logger.h>
#include <Common/ThreadManager.h>
#include <Mill/MillErrorHandler.h>
#include <Mill/MillException.h>
#include <Settings/SettingManager.h>
#include <Mill/GRBL/Commands/ContourMapping.h>
#include <Mill/Display/MillDisplayManager.h>
using namespace MillLogger;

MillingManager::~MillingManager()
{
    if (m_thread.joinable()) {
        m_thread.join();
    }

    CR_LOG_SYNC("MillingManager stopped");
}

bool MillingManager::MillOperationAsync(MillConnection::Ptr pConnection, const CRFile::Ptr& pCRFile, const Job* pJob, const int stepIndex) {
    CR_LOG_F("Sending GCodeFile for operation with index: %d", stepIndex);
    if (BusyOrDisconnected(pConnection)) { return false; }

    if (!pJob) {
        MILL_LOG("Error: Job not found.");
        return false;
    }

    Operation::Ptr pOperation = pJob->GetOperation(stepIndex);
    if (pOperation == nullptr || !pOperation->Load(pCRFile)) {
        CR_LOG_F("Failed to load operation at index %d!", stepIndex);
        return false;
    }

    if (m_thread.joinable()) { m_thread.join(); }
    m_inProgress.store(true, std::memory_order_release);
    m_ManualOperation.store(false, std::memory_order_release);
    m_thread = std::thread(&MillingManager::Thread_MillOperation, this, pConnection, pOperation);

    return true;
}

bool MillingManager::RunAsyncGCodeBatch(MillConnection::Ptr pConnection, std::vector<GCodeLine>&& gcodes) noexcept {
    MILL_LOG("Executing manual GCode Batch.");
    if (BusyOrDisconnected(pConnection)) { return false; }

    if (m_thread.joinable()) { m_thread.join(); }
    m_inProgress.store(true, std::memory_order_release);
    m_ManualOperation.store(true, std::memory_order_release);

    m_thread = std::thread(&MillingManager::Thread_MillCodeBlock, this, pConnection, std::move(gcodes), false, true);

    return true;
}

bool MillingManager::BusyOrDisconnected(const MillConnection::Ptr pConnection) const noexcept {
    if (InProgress()) {
        MILL_LOG("Milling is already in progress!");
        return true;
    }

    if (pConnection == nullptr) {
        MILL_LOG("No connection available!");
        return true;
    }
    return false;
}

void MillingManager::Thread_MillOperation( MillConnection::Ptr pConnection, Operation::Ptr pOperation) {
    RunGCode(pConnection, pOperation->GetGCodeFile().getLines(), pOperation->GetReset());
}

void MillingManager::Thread_MillCodeBlock(MillConnection::Ptr pConnection, std::vector<GCodeLine> gcodes, const bool shouldResetOnCompletion, const bool isManualProgram) noexcept {
    RunGCode(pConnection, gcodes, shouldResetOnCompletion, isManualProgram);
}

void MillingManager::RunGCode(const MillConnection::Ptr& pConnection, const std::vector<GCodeLine>& gcodes, const bool shouldResetOnCompletion, const bool isManualProgram) noexcept {
    ThreadManager::SetCurrentThreadName("MILLING_THREAD");
    MILL_LOG("MILLING THREAD - Start");
    {
        std::lock_guard<std::mutex> lock{ m_ErrorMutex };
        m_error.reset();
    }

    auto optionalError = tl::optional<MillingError>{ tl::nullopt };
    try {
        // Execute
        pConnection->ExecuteProgram(gcodes, isManualProgram);

        if (pConnection->IsTimedOut()) {
            MILL_LOG("Timeout exceeded.");
            throw MillException(MillException::TIMEOUT);
        }
        else if (shouldResetOnCompletion) {
            MILL_LOG("Calling reset().");
            pConnection->Reset();
        }
    }
    catch (const MillException& e) {
        CR_LOG_F("MillException thrown during ReadWriteCycle: %s", e.what());

        auto cncExcept = MillException{ e.getType(), e.GetRawDetailMessage() };

        if (!pConnection->GetError().has_value()) {
            MillingError error = MillErrorHandler::GetError(pConnection, cncExcept);
            if (cncExcept.getType() != MillException::SOFTWARE_ESTOP) {
                optionalError = error;
                std::lock_guard<std::mutex> lock{ m_ErrorMutex };
                m_error = error;
                M113();
                MillDisplayManager::AddLine(ELineType::WRITE, e.what());
            }
        }
    }

    if (optionalError.has_value()) {
        MILL_LOG("Error message: " + m_error.value().description);
    }

    m_inProgress.store(false, std::memory_order_release);
    MILL_LOG("MILLING THREAD - End");
}

void MillingManager::CheckForError(MillConnection::Ptr pConnection) noexcept
{
    if (pConnection == nullptr) {
        return;
    }

    try {
        pConnection->ReadResponse(false);
    }
    catch (...) {}

    auto error = pConnection->GetError();
    if (error.has_value()) {
        m_error = error;
        if (m_error.value().IsProbeFailure()) {
            pConnection->ProbeReset();
            return;
        }

        if (m_ManualOperation.load(std::memory_order_acquire)) { return; }  // Ignore E-stop in manual entry mode

        MILL_LOG("Resetting connection");
        try {
            pConnection->Reset(!m_ManualOperation.load(std::memory_order_acquire));  // Disable automatic soft reset while in manual operation mode
        }
        catch (...) {
            m_error = ErrorCodes::GetAlarm(ALARM_CODE_MACHINE_LOCKED);
        }

        if (pConnection->GetState().GetAlarm() == ALARM_CODE_ESTOP) {
            MILL_LOG("E-stop depressed");
            m_error = ErrorCodes::GetAlarm(ALARM_CODE_ESTOP);
        }
    }

    if (m_error.has_value()) {
        pConnection->GetProgress().Reset();
    }
}

MillingStatus MillingManager::GetMillingStatus(MillConnection::Ptr pConnection, const bool clearError)
{
    std::lock_guard<std::mutex> lock{ m_ErrorMutex };

    if (!InProgress()) {
        CheckForError(pConnection);
    }

    if (m_error.has_value()) {
        MillingError retError = m_error.value();
        if (clearError) {
            MILL_LOG("Milling error cleared");
            m_error.reset();
        }

        m_inProgress.store(false, std::memory_order_release);
        return MillingStatus::Failed(retError);
    }

    if (InProgress()) {
        if (pConnection != nullptr) {
            return MillingStatus::InProgress(pConnection->GetProgress());
        }

        MILL_LOG("Lost connection to Coast Runner");
        MillingError disconnected_error{ MillingError::Error, -1, "Connection Error", "Lost Connection to Coast Runner" };
        return MillingStatus::Failed(disconnected_error);
    }

    return MillingStatus::Completed();
}
