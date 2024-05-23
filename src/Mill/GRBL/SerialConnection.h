#pragma once

#include "Common/CommonHeaders.h"
#include "ConnectionState.h"
#include <Common/Defs.h>

// This class represents the low-level communication with the GRBL controller
// This is implementation dependent, so it varies between OS's
// This is also a place where the Mock GRBL can be substituted for testing purposes
class SerialConnection {
public:
	using Ptr = std::shared_ptr<SerialConnection>;

	SerialConnection(
		const std::string& path,
		std::shared_ptr<ConnectionState> pState);
	~SerialConnection();

	void Connect();
	bool IsPluggedIn() const;
	void Disconnect();

	void WriteChar(const char c, const int timeout = 0);
	void WriteLine(const std::string& line, const int timeout = 0); // Appends a `\n` to the line

	std::unique_ptr<std::string> ReadLine();
	void FlushReads();

	// Acquire lock to do high-level operations atomically
	// Further calls can be made into SerialConnection by same thread since it's a recursive mutex
	// RAII ensures that lock is released when it goes out of scope
	std::lock_guard<std::recursive_mutex> LockConnection();
private:
	struct Imp;
	std::unique_ptr<Imp> m_imp;
};
