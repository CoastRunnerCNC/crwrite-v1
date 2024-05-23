#pragma once

#include "Common/CommonHeaders.h"
#include <Common/Defs.h>
#include <Mill/Status/ConnectionStatus.h>
#include <Mill/GRBL/MillConnection.h>

// This class manages the initialization, selection, and connection of a Coast Runner machine
// Use this to get access to the current machine and it's functionallity
class MillConnector
{
public:
	using Ptr = std::shared_ptr<MillConnector>;

	static MillConnector::Ptr Initialize();
	~MillConnector();

	ECNCMillStatus GetStatus() const noexcept { return m_status; }
	bool IsConnected() const noexcept { return m_status == ECNCMillStatus::connected; }

	std::shared_ptr<MillConnection> GetConnection() noexcept { return m_pCNC; }
	std::shared_ptr<MillConnection> GetNoLockConnection() noexcept { return m_pCNC; }
	bool IsSelectedCNCMill(const CNCMill& cncMill) const noexcept;
	bool SetSelectedCNCMill(const CNCMill& cncMill) noexcept;
	std::list<CNCMill> GetAvailableCNCMills() const noexcept;

private:
	MillConnector() : m_shutdown(false), m_status(notConnected) { }

	static void Thread_Connect(MillConnector* pConnector);

	// Checks for plugged-in devices and tries connecting to the first one.
	void TryConnect();

	// Checks the connected device, and disconnects if it's been unplugged.
	void CheckUnplugged();

	MillConnection::Ptr m_pCNC = nullptr;
	std::atomic_bool m_shutdown;
	std::atomic<ECNCMillStatus> m_status;

	std::thread m_initializeThread;
};
