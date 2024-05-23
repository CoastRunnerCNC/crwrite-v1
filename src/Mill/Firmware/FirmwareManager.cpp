#include "FirmwareManager.h"
#include <ghc/filesystem.h>
#include <Mill/MillFinder.h>
#include <Mill/GRBL/MillConnection.h>
#include <Mill/GRBL/SerialConnection.h>
#include <Mill/CNCMill.h>
#include <Common/FileDownloader.h>
#include <Common/Logger.h>
#include <Common/Util/FileUtil.h>
#include <Common/Defs.h>
#include <Common/Util/OSUtil.h>
#include <Mill/Display/MillDisplayManager.h>

#ifdef _WIN32
#include <Windows.h>
#endif

#define INFO_BUFFER_SIZE 32767

FirmwareManager& FirmwareManager::GetInstance()
{
	static FirmwareManager instance;
	return instance;
}

FirmwareVersion FirmwareManager::GetFirmwareVersion(
	const CNCMill& cncMill,
	SerialConnection& connection) const
{
	// Check the cache to see if firmware version was already loaded.
	auto iter = m_versionCache.find(cncMill.GetSerialNumber());
	if (iter != m_versionCache.end()) {
		return iter->second;
	}

	auto lock = connection.LockConnection();

	// Ask mill for Firmware Version
	connection.WriteLine("$I", 300);
	auto pResponse = connection.ReadLine();
	if (pResponse == nullptr) {
		throw MillException(MillException::ESTOP_PUSHED);
	}

	MILL_LOG("Firmware Version returned: " + *pResponse);
	connection.FlushReads();

	// Parse mill's Response
	const FirmwareVersion version = FirmwareVersion::Parse(*pResponse);

	// Cache mill's Firmware Version
	m_versionCache.insert({ cncMill.GetSerialNumber(), version });

	return version;
}

void FirmwareManager::UploadFirmware(
	const MillConnection::Ptr& pConnection,
	const tl::optional<URL>& firmware32m1URLOpt,
	const URL& firmware328pURL) noexcept
{
	try
	{
		Update(pConnection, firmware32m1URLOpt, firmware328pURL);
	}
	catch (std::exception& e)
	{
		SetStatus(-1);
		CR_LOG_F("Exception thrown: %s", e.what());
	}
}

void FirmwareManager::UploadCustomFirmware(
	const MillConnection::Ptr& pConnection,
	const std::string& firmware32m1,
	const std::string& firmware328p) noexcept {
	try {
		UpdateCustom(pConnection, firmware32m1, firmware328p);
	}
	catch (std::exception& e) {
		SetStatus(-1);
		CR_LOG_F("Exception thrown: %s", e.what());
	}
}

void FirmwareManager::Update(
	const MillConnection::Ptr& pConnection,
	const tl::optional<URL>& firmware32m1URLOpt,
	const URL& firmware328pURL)
{
	// We already know the firmware version, but we're just calling this to make sure E-stop is not pressed in
	auto version = GetFirmwareVersion(pConnection->GetCNCMill(), *pConnection->GetSerial());
	auto iter = m_versionCache.find(pConnection->GetCNCMill().GetSerialNumber());
	if (iter != m_versionCache.end())
	{
		m_versionCache.erase(iter);
	}

	SetStatus(5);

	Download(firmware32m1URLOpt, firmware328pURL);

	// Disconnect
	if (pConnection->IsConnected())
	{
		pConnection->Reset();
		pConnection->Disconnect();
	}

	try
	{
		if (firmware32m1URLOpt.has_value() && version.GetVFD() != "00")
		{
			SetStatus(25);
			AVRDude::Execute328p(pConnection, AVRDude::GetDriversPath() / "328p" / "ArduinoAsSPI.hex");
			SetStatus(50);
			AVRDude::Execute32m1(pConnection, GetFirmwarePath() / firmware32m1URLOpt.value().GetFileName());
			SetStatus(75);
		}
		else
		{
			SetStatus(40);
		}
	}
	catch (const std::exception&)
	{
		MILL_LOG("Failed while updating 32m1. Attempting to install 328p firmware.");
		MillDisplayManager::AddLine(ELineType::READ, "Failed while updating 32m1. Attempting to install 328p firmware.");
		AVRDude::Execute328p(pConnection, GetFirmwarePath() / firmware328pURL.GetFileName());
		throw;
	}

	AVRDude::Execute328p(pConnection, GetFirmwarePath() / firmware328pURL.GetFileName());
	SetStatus(100);
}

void FirmwareManager::UpdateCustom(
	const MillConnection::Ptr& pConnection,
	const std::string& firmware32m1URLOpt,
	const std::string& firmware328pURL) {
	// We already know the firmware version, but we're just calling this to make sure E-stop is not pressed in
	auto version = GetFirmwareVersion(pConnection->GetCNCMill(), *pConnection->GetSerial());
	auto iter = m_versionCache.find(pConnection->GetCNCMill().GetSerialNumber());
	if (iter != m_versionCache.end()) {
		m_versionCache.erase(iter);
	}

	SetStatus(5);

	// Disconnect
	if (pConnection->IsConnected()) {
		pConnection->Reset();
		pConnection->Disconnect();
	}

	MILL_LOG("reconnected");

	try {
		if (!firmware32m1URLOpt.empty() && version.GetVFD() != "00") {
			SetStatus(25);
			MILL_LOG("25");
			AVRDude::Execute328p(pConnection, AVRDude::GetDriversPath() / "328p" / "ArduinoAsSPI.hex");
			SetStatus(50);
			MILL_LOG("50");
			AVRDude::Execute32m1(pConnection, fs::path{ firmware32m1URLOpt });
			SetStatus(75);
			MILL_LOG("75");
		}
		else {
			SetStatus(40);
		}
	}
	catch (const std::exception&) {
		MILL_LOG("Failed while updating 32m1. Attempting to install 328p firmware.");
		AVRDude::Execute328p(pConnection, fs::path{ firmware32m1URLOpt });
		throw;
	}

	MillDisplayManager::AddLine(ELineType::READ, "Upload status: 99%");
	AVRDude::Execute328p(pConnection, fs::path{ firmware328pURL });
	SetStatus(100);
	MillDisplayManager::AddLine(ELineType::READ, "Upload status: 100%");
}

void FirmwareManager::Download(const tl::optional<URL>& firmware32m1URLOpt, const URL& firmware328pURL) const
{
	fs::path firmware328pPath = GetFirmwarePath() / firmware328pURL.GetFileName();
	FileDownloader().DownloadFile(firmware328pURL, firmware328pPath);

	if (firmware32m1URLOpt.has_value())
	{
		fs::path firmware32m1Path = GetFirmwarePath() / firmware32m1URLOpt.value().GetFileName();
		FileDownloader().DownloadFile(firmware32m1URLOpt.value(), firmware32m1Path);
	}
}
