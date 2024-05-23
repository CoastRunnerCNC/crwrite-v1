#include "MillDisplayManager.h"

MillDisplayManager& MillDisplayManager::GetInstance()
{
	static MillDisplayManager instance;
	return instance;
}

void MillDisplayManager::AddLine(const ELineType lineType, const std::string& line)
{
	MillDisplayManager& instance = GetInstance();
	auto lock = std::unique_lock<std::mutex>{ instance.m_mutex };

	if (!instance.m_paused)
	{
		instance.m_lines.push_back(std::make_pair(lineType, std::string{ line }));
	}
}

std::vector<std::pair<ELineType, std::string>> MillDisplayManager::GetLines()
{
	MillDisplayManager& instance = GetInstance();
	auto lock = std::unique_lock<std::mutex>{ instance.m_mutex };

	std::vector<std::pair<ELineType, std::string>> lines = instance.m_lines;
	instance.m_lines.clear();

	return lines;
}

void MillDisplayManager::Clear()
{
	MillDisplayManager& instance = GetInstance();
	auto lock = std::unique_lock<std::mutex>{ instance.m_mutex };

	instance.m_lines.clear();
}
