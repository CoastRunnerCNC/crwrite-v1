#include "FirmwareUpdater.h"
#include "FirmwareManager.h"

#include <Common/Logger.h>
#include <Mill/MillException.h>
#include <Services/FirmwareUpdateService.h>
#include <Settings/SettingManager.h>

std::unique_ptr<FirmwareUpdater> FirmwareUpdater::Initialize(const MillConnector::Ptr& pConnector)
{
	std::unique_ptr<FirmwareUpdater> pUpdater(new FirmwareUpdater(pConnector));
	pUpdater->m_thread = std::thread{ &FirmwareUpdater::CheckFirmwareLoop, pUpdater.get() };
	return pUpdater;
}

FirmwareUpdater::~FirmwareUpdater()
{
	m_shutdown = true;
	if (m_thread.joinable()) {
		m_thread.join();
	}

	CR_LOG_SYNC("FirmwareUpdater stopped");
}

void FirmwareUpdater::CheckFirmwareLoop() noexcept
{
	constexpr auto normal_timeout = std::chrono::minutes(60);
	constexpr auto error_timeout = std::chrono::minutes(15);

	while (!m_shutdown) {
		std::this_thread::sleep_for(std::chrono::seconds(1));

		Lock lock(m_mutex);
		if (!m_installedFirmware.has_value()) {
			get_installed_firmware(lock);
		}

		if (m_installedFirmware.has_value()) {
			const FirmwareVersion& installed_firmware = m_installedFirmware.value();

			if (m_firmwareFetchSuccessful) {
				if ((Clock::now() - m_lastFirmwareUpdate) > normal_timeout || m_availableFirmware.empty()) {
					get_available_firmware(lock, installed_firmware);
				}
			} else if ((Clock::now() - m_lastFirmwareUpdate) > error_timeout && m_availableFirmware.empty()) {
				get_available_firmware(lock, installed_firmware);
			}
		}
	}
}

tl::optional<FirmwareVersion> FirmwareUpdater::GetInstalledFirmware() const noexcept
{
	Lock lock(m_mutex);
	if (m_installedFirmware.has_value()) {
		return m_installedFirmware;
	}

	get_installed_firmware(lock);
	return m_installedFirmware;
}

std::vector<AvailableFirmware> FirmwareUpdater::GetAvailableFirmware() const noexcept
{
	Lock lock(m_mutex);
	return m_availableFirmware;
}

void FirmwareUpdater::get_installed_firmware(const Lock&) const noexcept
{
	auto pConnection = m_pConnector->GetNoLockConnection();
	if (m_pConnector->IsConnected() && pConnection != nullptr) {
		try {
			m_installedFirmware = FirmwareManager::GetInstance().GetFirmwareVersion(
				pConnection->GetCNCMill(),
				*pConnection->GetSerial()
			);

			if (m_installedFirmware.has_value() && eeprom_versions_not_set(m_installedFirmware.value())) {
				MILL_LOG("Correcting invalid firmware version");

				const auto lock = pConnection->GetLock();
				pConnection->ExecuteCommand(GCodeLine{ "$90=96" });
				pConnection->ExecuteCommand(GCodeLine{ "$92=97" });
				m_installedFirmware = tl::nullopt;
			}
		}
		catch (MillException& e) {
			CR_LOG_F("GetFirmwareVersion error: %s", e.what());
		}
		catch (...) {
			MILL_LOG("GetFirmwareVersion error: Unknown error");
		}
	}
}

void FirmwareUpdater::get_available_firmware(const Lock&, const FirmwareVersion& installed) noexcept
{
	MILL_LOG("Checking for updates.");

	m_lastFirmwareUpdate = Clock::now();

	try {
		FirmwareUpdateService::Request req{
			MILL_SOFTWARE_VERSION,
			SettingManager::GetInstance().GetExplicitFirmwareVersion(),
			installed
		};

		MILL_LOG("Current firmware version: " + installed.GetYMD());
		m_availableFirmware = FirmwareUpdateService::Invoke(req).available;

		if (!m_availableFirmware.empty()) {
			m_firmwareFetchSuccessful = true;
		} else {
			m_firmwareFetchSuccessful = false;
		}
	}
	catch (...) {
		m_firmwareFetchSuccessful = false;
	}
}

bool FirmwareUpdater::IsUpdateAvailable() const noexcept
{
	Lock lock(m_mutex);

	if (m_availableFirmware.empty() || !m_installedFirmware.has_value()) {
		return false;
	}

	const auto& best = *std::max_element(m_availableFirmware.begin(), m_availableFirmware.end());
	if (best > m_installedFirmware.value()) {
		CR_LOG_F(
			"Installed firmware version: %s is older than best available: %s",
			m_installedFirmware.value().GetYMD().c_str(),
			best.GetYMD().c_str()
		);
		return true;
	}

	return false;
}

void FirmwareUpdater::ResetFirmware() noexcept
{
	Lock lock(m_mutex);
	m_installedFirmware = tl::nullopt;
	m_availableFirmware = {};
	m_lastFirmwareUpdate = {};
}

bool FirmwareUpdater::eeprom_versions_not_set(const FirmwareVersion& version) const noexcept
{
	constexpr auto nullVersion{ "7`" };

	return (version.GetChassis() == nullVersion) || (version.GetElectronics() == nullVersion);
}
