#ifndef MOCK_GRBL_FRAMEWORK_CLASS

#include "Common/CommonHeaders.h"
#include "Mock_GRBL_Status.h"

// This is a software representation of an actual machine for use in testing
// Commands are sent by placing them on a thread-safe queue for processing
// There should be a preprocessor macro in Serial Connection and Coast Runner Finder that enables this mock controller
// These classes vary based upon OS, so only the Windows version has been hooked up so far
class MOCK_GRBL {
public:
	void Connect() noexcept;
	void Disconnect() noexcept;
	MOCK_GRBL() { m_ProcessThread = std::thread{ &MOCK_GRBL::DoGRBLThings, this }; }

	~MOCK_GRBL() {
		m_KeepRunning.store(false, std::memory_order_release);
		if (m_ProcessThread.joinable()) {
			m_ProcessThread.join();
		}
	}

	void Write(const std::string& msg) noexcept;

	std::string Read() {
		auto msg = m_OutputQ.load_and_pop();
		if (!msg) { return ""; }
		return *msg;
	}

	bool HasOutput() const noexcept { return !m_OutputQ.empty(); }

private:
	// Internal Processing
	std::thread m_ProcessThread;
	std::atomic<bool> m_KeepRunning{ true };

	// Buffer State
	QUEUE_THREADSAFE<std::string> m_InputQ{ };
	QUEUE_THREADSAFE<std::string> m_OutputQ{ };

	// Position
	Point m_Position{ };
	Point m_WCS{ };

	// Motion
	std::optional<float> m_xTarget{ std::nullopt };
	std::optional<float> m_yTarget{ std::nullopt };
	std::optional<float> m_zTarget{ std::nullopt };
	std::chrono::time_point<std::chrono::system_clock> m_MostRecentUpdateTime{ };

	MOCK_GRBL_STATUS m_Status{ };

	std::string m_Firmware{ "[grbl:1.1h CR:3B PCB:3B VFD:3A YMD:20201212]" };

	bool m_IsMoving{ false };
	bool m_IsDwelling{ false };
	bool m_IsLocked{ false };
	bool m_HasFeedHold{ false };

	void DoGRBLThings() noexcept;
};

#endif // MOCK_GRBL_FRAMEWORK_CLASS
