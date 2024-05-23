#pragma once

#include "Common/CommonHeaders.h"
#include <Files/GCodeLine.h>
#include <Common/Defs.h>

constexpr size_t BUFFER_SIZE = 127;

// This class represents all of the outstanding messages sent to GRBL that have not yet received a response
// This allows us to track specific lines as well as determine when new data can be sent to GRBL
// Thread-safety is handled internally as a class invariant, so no further thread coordination need be done
class Buffer {
public:
	tl::optional<GCodeLine> pop() {
		std::lock_guard<std::recursive_mutex> lock{ m_lock };
		if (!m_lines.empty()) {
			GCodeLine line = m_lines.front();
			m_bufferUsed -= (line.GetCleaned().size() + 1);
			m_lines.pop_front();

			return tl::make_optional<GCodeLine>(std::move(line));
		}

		return tl::nullopt;
	}

	void push(const GCodeLine& line) {
		std::lock_guard<std::recursive_mutex> lock{ m_lock };
		m_bufferUsed += (line.GetCleaned().size() + 1);
		m_lines.push_back(line);
	}

	void clear() {
		std::lock_guard<std::recursive_mutex> lock{ m_lock };
		m_lines.clear();
		m_bufferUsed = 0;
	}

	GCodeLine front() const noexcept {
		std::lock_guard<std::recursive_mutex> lock{ m_lock };
		return m_lines.front();
	}

	GCodeLine back() const noexcept {
		std::lock_guard<std::recursive_mutex> lock{ m_lock };
		return m_lines.back();
	}

	size_t num_lines() const {
		std::lock_guard<std::recursive_mutex> lock{ m_lock };
		return m_lines.size();
	}

	bool empty() const {
		std::lock_guard<std::recursive_mutex> lock{ m_lock };
		return m_lines.empty();
	}

	bool fits(const GCodeLine& line) const noexcept {
		std::lock_guard<std::recursive_mutex> lock{ m_lock };
		return remaining() >= (line.GetCleaned().size() + 1);
	}
	size_t used() const { return m_bufferUsed; }
	size_t remaining() const noexcept { return BUFFER_SIZE < m_bufferUsed ? 0 : BUFFER_SIZE - m_bufferUsed; }

private:
	mutable std::recursive_mutex m_lock;
	std::deque<GCodeLine> m_lines;
	std::atomic<size_t> m_bufferUsed{ 0 };
};
