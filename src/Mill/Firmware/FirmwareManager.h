#pragma once

#include "Common/CommonHeaders.h"
#include <ghc/filesystem.h>
#include <Common/Models/URL.h>
#include <Common/Util/OSUtil.h>
#include <Mill/GRBL/MillConnection.h>
#include <Mill/Firmware/AVRDude.h>
#include <Mill/Firmware/FirmwareVersion.h>

// Forward Declarations
class CNCMill;
class SerialConnection;

// Manages firmware; ties together other related services
class FirmwareManager
{
public:
	static FirmwareManager& GetInstance();

	FirmwareVersion GetFirmwareVersion(const CNCMill& cncMill, SerialConnection& connection) const;

	void UploadFirmware(
		const MillConnection::Ptr& pConnection,
		const tl::optional<URL>& firmware32m1URLOpt,
		const URL& firmware328pURL
	) noexcept;

	void UploadCustomFirmware(
		const MillConnection::Ptr& pConnection,
		const std::string& firmware32m1URLOpt,
		const std::string& firmware328pURL) noexcept;

	int GetFirmwareUploadStatus() const { return m_uploadStatus.load(); }

private:
	void Update(
		const MillConnection::Ptr& pConnection,
		const tl::optional<URL>& firmware32m1URLOpt,
		const URL& firmware328pURL
	);

	void UpdateCustom(
		const MillConnection::Ptr& pConnection,
		const std::string& firmware32m1URLOpt,
		const std::string& firmware328pURL);

	void Download(
		const tl::optional<URL>& firmware32m1URLOpt,
		const URL& firmware328pURL
	) const;

	fs::path GetFirmwarePath() const
	{
		auto path = OSUtility::GetDataDirectory() / "firmware";
		fs::create_directories(path);
		return path;
	}

	void SetStatus(const int status)
	{
		if (status < m_uploadStatus)
		{
			m_uploadStatus = status;
			return;
		}

		while (m_uploadStatus < status)
		{
			m_uploadStatus++;
			Sleep(25);
		}
	}

	mutable std::map<std::string, FirmwareVersion> m_versionCache;
	std::atomic_int m_uploadStatus;

	FirmwareManager() = default;
};
