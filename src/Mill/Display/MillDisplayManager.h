#pragma once

#include "Common/CommonHeaders.h"
#include "LineType.h"

// Utility that manages text output directly displayed to GUI log window as opposed to logs on disk
class MillDisplayManager
{
public:
	static void AddLine(const ELineType lineType, const std::string& line);
	static std::vector<std::pair<ELineType, std::string>> GetLines();
	static void Clear();

	static void Pause() noexcept { GetInstance().m_paused = true; }
	static void Resume() noexcept { GetInstance().m_paused = false; }

private:
	static MillDisplayManager& GetInstance();
	MillDisplayManager() : m_paused(false) { }

	std::mutex m_mutex;
	std::vector<std::pair<ELineType, std::string>> m_lines;
	std::atomic_bool m_paused;
};
