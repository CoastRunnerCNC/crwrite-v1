#pragma once

#include "Common/CommonHeaders.h"
#include <Files/CRFile.h>
#include <Files/job.h>
#include <Files/operation.h>
#include <Mill/MillConnector.h>
#include <Mill/GRBL/MillConnection.h>
#include <Mill/Status/MillingStatus.h>
#include <Mill/Status/MillingError.h>

// This class manages milling operations where a collection of GCode is processed as a single unit
// This spins up the GCode program and manages progress & error tracking
// Handling is slightly different based upon how the program is launched (Is it a .crproj file or through the manaul entry window?)
class MillingManager
{
public:
	MillingManager() = default;
	~MillingManager();

	bool MillOperationAsync(MillConnection::Ptr pConnection, const CRFile::Ptr& pCRFile, const Job* pJob, const int stepIndex);
	bool RunAsyncGCodeBatch(MillConnection::Ptr pConnection, std::vector<GCodeLine>&& gcodes) noexcept;

	bool InProgress() const noexcept { return m_inProgress.load(std::memory_order_acquire); }
	MillingStatus GetMillingStatus(MillConnection::Ptr pConnection, const bool clearError);
	void ClearError() noexcept {
		std::lock_guard<std::mutex> lock{ m_ErrorMutex };
		m_error.reset();
	}
	void SetManualOperationFlag(const bool isManualOperationMode) { m_ManualOperation.store(isManualOperationMode, std::memory_order_release); }
	bool GetManualOperationFlag() { return m_ManualOperation.load(std::memory_order_acquire); }

private:
	mutable std::mutex m_ErrorMutex;
	std::thread m_thread;
	tl::optional<MillingError> m_error{ tl::nullopt };
	std::atomic_bool m_inProgress{ false };
	std::atomic_bool m_ManualOperation{ false };

	void Thread_MillOperation(MillConnection::Ptr pConnection, Operation::Ptr pOperation );
	void Thread_MillCodeBlock(MillConnection::Ptr pConnection, std::vector<GCodeLine> gcodes, const bool shouldResetOnCompletion = false, const bool isManualProgram = false) noexcept;

	void RunGCode(const MillConnection::Ptr& pConnection, const std::vector<GCodeLine>& gcodes, const bool shouldResetOnCompletion = false, const bool isManualProgram = false) noexcept;
	void RunOperation(const MillConnection::Ptr& pConnection, const Operation::Ptr& pOperation) noexcept;
	void CheckForError(MillConnection::Ptr pConnection) noexcept;
	bool BusyOrDisconnected(const MillConnection::Ptr pConnection) const noexcept;
};
