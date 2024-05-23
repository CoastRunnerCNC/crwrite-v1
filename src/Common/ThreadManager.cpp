#include "ThreadManager.h"

using std::lock_guard;
using std::string;

string ThreadManager::GetCurrentThreadName() {
	auto threadId = std::this_thread::get_id();

	auto lock = lock_guard{ m_MapLock };
	auto it = m_threadNamesById.find(threadId);
	if (it != m_threadNamesById.end()) {
		return it->second;
	}

	std::ostringstream ss;
	ss << threadId;

	return ss.str();
}

void ThreadManager::SetThreadName(const std::thread::id& threadId, const string& threadName) {
	auto lock = lock_guard{ m_MapLock };
	m_threadNamesById[threadId] = threadName;
}

void ThreadManager::SetCurrentThreadName(const string& threadName) {
	auto lock = lock_guard{ m_MapLock };
	m_threadNamesById[std::this_thread::get_id()] = threadName;
}