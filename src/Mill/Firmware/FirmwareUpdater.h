#pragma once

#include "Common/CommonHeaders.h"
#include <Mill/MillConnector.h>
#include <Mill/Firmware/FirmwareVersion.h>
#include <Services/Models/AvailableFirmware.h>

// Forward Declarations
class MillConnection;

// Manages firmware updates if needed
// Involves internet connectivity to verify latest firmware version
class FirmwareUpdater
{
	using Clock = std::chrono::system_clock;
	using Time = Clock::time_point;
	using Lock = std::unique_lock<std::mutex>;

public:
	static std::unique_ptr<FirmwareUpdater> Initialize(const MillConnector::Ptr& pConnector);
	~FirmwareUpdater();

	void CheckFirmwareLoop() noexcept;
	void ResetFirmware() noexcept;

	tl::optional<FirmwareVersion> GetInstalledFirmware() const noexcept;
	std::vector<AvailableFirmware> GetAvailableFirmware() const noexcept;
	bool IsUpdateAvailable() const noexcept;

private:
	FirmwareUpdater(const MillConnector::Ptr& pConnector)
		: m_pConnector(pConnector), m_shutdown(false) { }

	void get_installed_firmware(const Lock&) const noexcept;
	void get_available_firmware(const Lock&, const FirmwareVersion& installed) noexcept;
	bool eeprom_versions_not_set(const FirmwareVersion& version) const noexcept;

private:
	MillConnector::Ptr m_pConnector;
	std::atomic_bool m_shutdown;

	std::thread m_thread;
	mutable std::mutex m_mutex;

	mutable tl::optional<FirmwareVersion> m_installedFirmware;
	std::vector<AvailableFirmware> m_availableFirmware;
	Time m_lastFirmwareUpdate;
	std::atomic_bool m_firmwareFetchSuccessful;
};