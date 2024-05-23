#pragma once

#include "Common/CommonHeaders.h"
#include <json/json.h>

struct AvailableFirmware;

// Utility for analyzing a firmware version string
class FirmwareVersion
{
public:
	static FirmwareVersion Parse(const std::string& buffer);

	bool operator>(const FirmwareVersion& rhs) const noexcept;
	bool operator<(const FirmwareVersion& rhs) const noexcept;

	bool operator>(const AvailableFirmware& rhs) const noexcept;
	bool operator<(const AvailableFirmware& rhs) const noexcept;

	const std::string& GetGRBL() const noexcept { return m_grblVersion; }
	const std::string& GetChassis() const noexcept { return m_crVersion; }
	const std::string& GetElectronics() const noexcept { return m_pcbVersion; }
	const std::string& GetVFD() const noexcept { return m_vfdVersion; }
	const std::string& GetYMD() const noexcept { return m_ymd; }

	Json::Value ToJSON() const
	{
		Json::Value json;
		json["grbl"] = m_grblVersion;
		json["ymd"] = m_ymd;
		json["cr"] = m_crVersion;
		json["pcb"] = m_pcbVersion;
		json["vfd"] = m_vfdVersion;
		return json;
	}

private:
	FirmwareVersion(const std::string& grbl, const std::string& ymd, const std::string& cr = "2A", const std::string& pcb = "2A", const std::string& vfd = "00")
		: m_grblVersion(grbl), m_ymd(ymd), m_crVersion(cr), m_pcbVersion(pcb), m_vfdVersion(vfd) { }

	std::string m_grblVersion;
	std::string m_ymd;
	std::string m_crVersion;
	std::string m_pcbVersion;
	std::string m_vfdVersion;
};
