#pragma once

#include "Common/CommonHeaders.h"

class FirmwareVersion;

struct AvailableFirmware
{
	std::string VERSION;
	std::string DESCRIPTION;
	std::string FILE_328P;
	std::string FILE_32M1;

	bool operator<(const AvailableFirmware& rhs) const noexcept;
	bool operator>(const AvailableFirmware& rhs) const noexcept;

	bool operator<(const FirmwareVersion& rhs) const noexcept;
	bool operator>(const FirmwareVersion& rhs) const noexcept;

	auto GetGRBL() const noexcept -> std::string;
	auto GetChassis() const noexcept -> std::string;
	auto GetElectronics() const noexcept -> std::string;
	auto GetVFD() const noexcept -> std::string;
	auto GetYMD() const noexcept -> std::string;
};
