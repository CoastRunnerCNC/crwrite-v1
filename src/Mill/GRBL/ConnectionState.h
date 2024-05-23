#pragma once

#include "Common/CommonHeaders.h"
#include <Mill/GRBL/Status/RealTimeStatus.h>
#include <Mill/GRBL/Buffer.h>
#include <Mill/GRBL/Settings/MillSettings.h>
using namespace MillLogger;
typedef std::chrono::time_point<std::chrono::system_clock> DateTime;
constexpr auto release = std::memory_order_release;
constexpr auto acquire = std::memory_order_acquire;
constexpr auto acq_rel = std::memory_order_acq_rel;

// This class models the GRBL controller, with particular emphasis on the state of the connection
// A variety of state is collected here such as error/alarm state, position data, and buffer tracking
class ConnectionState {
	enum State {
		GS_CONNECTED = 1,
		GS_STARTUP = 2,
		GS_ERROR = 8,
		GS_LOCKED = 16,
		GS_SPINDLE = 32,
		GS_TIMEOUT = 64,
		GS_HOMING = 128,
		GS_STATUS = 256,
		GS_CHK_MODE = 512,
		GS_FD_UPDATE = 1024,
		GS_STATUS_IGNORE = 2048,
		GS_WCS_M101 = 4096
	};

public:
	using Ptr = std::shared_ptr<ConnectionState>;

	ConnectionState() { Reset(); }

	void Reset() noexcept {
		m_state.store(0, release);
		m_alarm.store(0, release);
		m_error.store(0, release);
		m_lastReadTime.store(std::chrono::system_clock::now(), release);
		m_buffer.clear();
		m_lastGCodeGroup.store(GCodeLine::GROUP_UNKNOWN, release);
		m_statusRequested.store(false, release);
		m_retryProbe.store(false, release);
		m_wcs.store(54, release);
		m_units.store(21, release);
		m_movementType.store(90, release);
		std::lock_guard<std::mutex> lock{ m_statusMutex };
		m_status = std::make_pair(std::chrono::system_clock::from_time_t(0), nullptr);
		m_errorMessage = "";
		m_errorSource = tl::nullopt;
	}

	const Buffer& GetBuffer() const noexcept { return m_buffer; }
	Buffer& GetBuffer() noexcept { return m_buffer; }
	int GetError() const noexcept { return m_error.load(acquire); }
	const tl::optional<GCodeLine> GetErrorSource() const noexcept { std::lock_guard<std::mutex> lock{ m_statusMutex }; return m_errorSource; }
	int GetAlarm() const noexcept { return m_alarm.load(acquire); }
	GCodeLine::commandGroup GetLastGCodeGroup() const noexcept { return m_lastGCodeGroup.load(acquire); }
	void SetLastGCodeGroup(const GCodeLine::commandGroup& group) noexcept { m_lastGCodeGroup.store(group, release); }
	const DateTime GetLastReadTime() const noexcept { return m_lastReadTime.load(acquire); }
	void SetRetryProbe(const bool value) noexcept { m_retryProbe.store(value, release); }
	bool GetRetryProbe() const noexcept { return m_retryProbe.load(acquire); }
	void SetWCS(const uint8_t wcs) noexcept { m_wcs.store(wcs, release); }
	uint8_t GetWCS() const noexcept { return m_wcs.load(acquire); }
	void SetUnits(const uint8_t units) noexcept { m_units.store(units, release); }
	uint8_t GetUnits() const noexcept { return m_units.load(acquire); }
	void SetMovementType(const uint8_t movementType) noexcept { m_movementType.store(movementType, release); }
	uint8_t GetMovementType() const noexcept { return m_movementType.load(acquire); }

	void SetConnected(const bool value) noexcept { value ? SetFlag(State::GS_CONNECTED) : UnsetFlag(State::GS_CONNECTED); }
	void SetStartup(const bool value) noexcept { value ? SetFlag(State::GS_STARTUP) : UnsetFlag(State::GS_STARTUP); }
	void SetLocked(const bool value) noexcept { value ? SetFlag(State::GS_LOCKED) : UnsetFlag(State::GS_LOCKED); }
	void SetHoming(const bool value) noexcept { value ? SetFlag(State::GS_HOMING) : UnsetFlag(State::GS_HOMING); }
	void SetCheckMode(const bool value) noexcept { value ? SetFlag(State::GS_CHK_MODE) : UnsetFlag(State::GS_CHK_MODE); }
	void SetTimedOut(const bool value) noexcept { value ? SetFlag(State::GS_TIMEOUT) : UnsetFlag(State::GS_TIMEOUT); }

	bool IsAlarm() const noexcept { return GetAlarm() != 0; }
	bool IsConnected() const noexcept { return IsSet(State::GS_CONNECTED); }
	bool IsStartup() const noexcept { return IsSet(State::GS_STARTUP); }
	bool IsLocked() const noexcept { return IsSet(State::GS_LOCKED); }
	bool IsError() const noexcept { return IsSet(State::GS_ERROR); }
	bool IsHoming() const noexcept { return IsSet(State::GS_HOMING); }
	bool IsTimedOut() const noexcept { return IsSet(State::GS_TIMEOUT); }
	bool IsCheckMode() const noexcept { return IsSet(State::GS_CHK_MODE); }

	void UpdateState() noexcept {
		const auto delta = std::chrono::system_clock::now() - m_lastReadTime.load(acquire);
		if (IsSet(State::GS_STARTUP) && delta > STARTDELAY) {
			UnsetFlag(State::GS_STARTUP);
		}

		const auto timeout = std::chrono::seconds(IsHoming() ? 25 : 2);
		if (delta > timeout) {
			// if (IsLocked()) { return; }		// Skip excessive log printouts
			MILL_LOG("Timeout while updating state.");
			SetFlag(State::GS_TIMEOUT);
		}
	}

	bool ShouldRequestStatus() noexcept {
		if (!m_statusRequested.load(acquire)) {
			const auto timeout = std::chrono::seconds(IsHoming() ? 25 : 2);
			if ((m_lastReadTime.load(acquire) + timeout) < (std::chrono::system_clock::now() + std::chrono::seconds(1))) {
				m_statusRequested.store(true, release);
				return true;
			}
		}

		return false;
	}
	
	void ResetIdleTime() noexcept {
		m_lastReadTime.store(std::chrono::system_clock::now(), release);
		UnsetFlag(State::GS_TIMEOUT);
		m_statusRequested.store(false, release);
	}

	void ClearAlarm() noexcept {
		m_alarm.store(0, release);
		UnsetFlag(State::GS_LOCKED);
		UnsetFlag(State::GS_ERROR);
	}

	void SetAlarm(const int alarm) noexcept {
		m_alarm.store(alarm, release);
		SetFlag(State::GS_LOCKED);
		SetFlag(State::GS_ERROR);

		std::lock_guard<std::mutex> lock{ m_statusMutex };
		if (m_status.second != nullptr) {
			m_status.second->SetState("Alarm");
		}
	}

	void ClearError() noexcept {
		m_error.store(0, release);
		UnsetFlag(State::GS_ERROR);
		std::lock_guard<std::mutex> lock{ m_statusMutex };
		m_errorMessage = "";
		m_errorSource = tl::nullopt;
	}

	void SetError(const int error, const std::string& error_message = "", const tl::optional<GCodeLine>& error_source = tl::nullopt) noexcept {
		m_error.store(error, release);
		SetFlag(State::GS_ERROR);
		std::lock_guard<std::mutex> lock{ m_statusMutex };
		m_errorMessage = error_message;
		m_errorSource = error_source;
	}

	bool IsRealTimeStatusRecent() const {
		std::lock_guard<std::mutex> lock{ m_statusMutex };
		DateTime currentTime = std::chrono::system_clock::now() - std::chrono::milliseconds(200);
		return m_status.first >= currentTime;
	}

	RealTimeStatusPtr GetRealTimeStatus() const {
		std::lock_guard<std::mutex> lock{ m_statusMutex };
		return m_status.second;
	}

	void SetRealTimeStatus(RealTimeStatusPtr pStatus) {
		std::lock_guard<std::mutex> lock{ m_statusMutex };
		m_status = std::make_pair(std::chrono::system_clock::now(), pStatus);
	}

	// Not yet thread-safe
	const MillSettings& GetSettings() const noexcept { return m_settings; }
	void UpdateSetting(const uint8_t setting, const float val) { m_settings.UpdateSetting(setting, val); }

private:
	bool IsSet(const State stateFlag) const noexcept {
		return (m_state.load(acquire) & stateFlag) == stateFlag;
	}
	void SetFlag(const State stateFlag) noexcept { m_state.fetch_or(stateFlag, acq_rel); }
	void UnsetFlag(const State stateFlag) noexcept { m_state.fetch_and(~stateFlag, acq_rel); }

	std::atomic<int> m_state{0};
	std::atomic<int> m_alarm{0};
	std::atomic<int> m_error{0};
	std::string m_errorMessage{ "" };
	tl::optional<GCodeLine> m_errorSource{ tl::nullopt };

	std::atomic<DateTime> m_lastReadTime{ std::chrono::system_clock::now() };
	std::chrono::seconds STARTDELAY = std::chrono::seconds(10);
	Buffer m_buffer;
	std::atomic<GCodeLine::commandGroup> m_lastGCodeGroup{ GCodeLine::GROUP_UNKNOWN };
	std::atomic<bool> m_statusRequested{ false };
	std::atomic<bool> m_retryProbe { false };
	std::atomic <uint8_t> m_wcs{ 54 };
	std::atomic <uint8_t> m_units{ 21 };
	std::atomic <uint8_t> m_movementType{ 90 };
	MillSettings m_settings;	// Not yet thread-safe

	mutable std::mutex m_statusMutex;
	std::pair<DateTime, RealTimeStatusPtr> m_status;
};