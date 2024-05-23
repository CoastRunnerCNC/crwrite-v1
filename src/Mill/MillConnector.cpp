#include <Mill/MillConnector.h>

#include <Common/ThreadManager.h>
#include <Common/Logger.h>
#include <Mill/MillFinder.h>
#include <Mill/GRBL/MillConnection.h>

std::shared_ptr<MillConnector> MillConnector::Initialize()
{
	std::shared_ptr<MillConnector> pConnector(new MillConnector());
	pConnector->m_initializeThread = std::thread(MillConnector::Thread_Connect, pConnector.get());
	return pConnector;
}

MillConnector::~MillConnector()
{
	m_shutdown = true;
	if (m_initializeThread.joinable()) {
		m_initializeThread.join();
	}

	try {
		if (m_pCNC != nullptr && m_pCNC->IsConnected()) {
			m_pCNC->Reset(false);
			MILL_LOG("reset() complete.");
			m_pCNC->Disconnect();
			MILL_LOG("Disconnected.");
		}
	}
	catch (...) {
		MILL_LOG("Exception thrown.");
	}

	CR_LOG_SYNC("MillConnector stopped.");
}

// Auto-detect and connect to Coast Runner
void MillConnector::Thread_Connect(MillConnector* pConnector)
{
	ThreadManager::SetCurrentThreadName("CONNECT_THREAD");

	bool previouslyFailed = false;
	while (!pConnector->m_shutdown) {
		try {
			// If not connected, look for a compatible device and connect to it.
			if (pConnector->m_status != connected) {
				pConnector->TryConnect();
			}

			// If connected to a device, make sure it hasn't been unplugged.
			if (pConnector->m_status == connected) {
				pConnector->CheckUnplugged();
			}
		}
		catch (std::exception& e) {
			if (!previouslyFailed) {
				previouslyFailed = true;
				MILL_LOG(std::string("Failed to connect: ") + e.what());
			}
		}

		std::this_thread::sleep_for(std::chrono::milliseconds(200));
	}
}

void MillConnector::TryConnect()
{
	assert(m_status != connected);

	std::list<CNCMill> availableCNCMills = MillFinder().GetAvailableCNCMills();
	if (!availableCNCMills.empty()) {
		if (!IsSelectedCNCMill(availableCNCMills.front())) {
			SetSelectedCNCMill(availableCNCMills.front());
		}
	}
}

void MillConnector::CheckUnplugged()
{
	assert(m_status == connected);
	assert(m_pCNC != nullptr);

	std::list<CNCMill> pluggedInCNCMills = MillFinder().GetAvailableCNCMills();
	for (auto iter = pluggedInCNCMills.cbegin(); iter != pluggedInCNCMills.cend(); iter++) {
		if (iter->GetPath() == m_pCNC->GetPath()) {
			// Device still plugged in. No need to disconnect.
			return;
		}
	}

	CR_LOG_F("Coast Runner %s unplugged", m_pCNC->GetPath().c_str());

	m_status = notConnected;
	m_pCNC->Disconnect();
	m_pCNC = nullptr;
}

bool MillConnector::SetSelectedCNCMill(const CNCMill& cncMill) noexcept
{
	if (!IsSelectedCNCMill(cncMill)) {
		CR_LOG_F("Selecting Coast Runner: %s", cncMill.GetPath().c_str());

		try {
			if (m_status != connectionFailed) {
				m_status = connecting;
			}

			m_pCNC = MillConnection::Connect(cncMill);
			m_status = connected;
			CR_LOG_F("Selected Coast Runner: %s", cncMill.GetPath().c_str());
			MillLogger::Flush();
			return true;
		}
		catch (std::exception& e) {
			CR_LOG_F("Failed to select Coast Runner (%s): %s", cncMill.GetPath().c_str(), e.what());

			ECNCMillStatus new_status = connectionFailed;
			if (MillException* cncmill_exception = dynamic_cast<MillException*>(&e)) {
				// When device is first plugged in, OS may fail to open handle to it.
				// If this occurs, keep it in connecting status and it should succeed next time.
				if (cncmill_exception->getType() == MillException::FAILED_OPEN) {
					new_status = connecting;
				}
			}

			m_status = new_status;
		}
	}

	return false;
}

bool MillConnector::IsSelectedCNCMill(const CNCMill& cncMill) const noexcept
{
	if (m_pCNC != nullptr) {
		return m_pCNC->GetCNCMill() == cncMill;
	}

	return false;
}

std::list<CNCMill> MillConnector::GetAvailableCNCMills() const noexcept
{
	try {
		return MillFinder().GetAvailableCNCMills();
	} catch (std::exception& e) {
		MILL_LOG(e.what());
	}

	return {};
}
