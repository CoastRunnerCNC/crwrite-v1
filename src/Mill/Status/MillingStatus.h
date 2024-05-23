#pragma once

#include "Common/CommonHeaders.h"
#include <Common/Models/Progress.h>
#include <Mill/Status/MillingError.h>

enum class EMillingStatus
{
	failed,
	inProgress,
	completed
};

class MillingStatus
{
public:
	MillingStatus()
		: m_status(EMillingStatus::completed), m_progress(tl::nullopt), m_error(tl::nullopt) { }

	static MillingStatus Completed() { return MillingStatus(EMillingStatus::completed, tl::nullopt, tl::nullopt); }
	static MillingStatus InProgress(const Progress& progress) { return MillingStatus(EMillingStatus::inProgress, tl::make_optional(progress), tl::nullopt); }
	static MillingStatus Failed(const MillingError& error) { return MillingStatus(EMillingStatus::failed, tl::nullopt, tl::make_optional(error)); }

	bool IsCompleted() const noexcept { return m_status == EMillingStatus::completed; }
	bool IsInProgress() const noexcept { return m_status == EMillingStatus::inProgress; }
	bool IsFailed() const noexcept { return m_status == EMillingStatus::failed; }

	EMillingStatus GetStatus() const noexcept { return m_status; }
	const tl::optional<Progress>& GetProgress() const noexcept { return m_progress; }
	const tl::optional<MillingError>& GetError() const noexcept { return m_error; }

private:
	MillingStatus(const EMillingStatus status, const tl::optional<Progress>& progress, const tl::optional<MillingError>& error)
		: m_status(status), m_progress(progress), m_error(error) { }

	const EMillingStatus m_status;
	const tl::optional<Progress> m_progress;
	const tl::optional<MillingError> m_error;
};