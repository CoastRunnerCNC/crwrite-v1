#pragma once

#include "Common/CommonHeaders.h"

// Utility that associates a name with a thread for logging purposes
class ThreadManager {
public:
	// Future: Implement a CreateThread method that takes the name, function, and parameters.
	static std::string GetCurrentThreadName();
	static void SetThreadName(const std::thread::id& threadId, const std::string& threadName);
	static void SetCurrentThreadName(const std::string& threadName);

private:
	inline static std::map<std::thread::id, std::string> m_threadNamesById{ };
	inline static std::mutex m_MapLock;
};