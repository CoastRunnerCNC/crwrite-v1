#include "Mill/Firmware/FirmwareVersion.h"
#include "AvailableFirmware.h"

bool AvailableFirmware::operator<(const AvailableFirmware& rhs) const noexcept
{
    return FirmwareVersion::Parse(VERSION) < FirmwareVersion::Parse(rhs.VERSION);
}

bool AvailableFirmware::operator>(const AvailableFirmware& rhs) const noexcept
{
    return FirmwareVersion::Parse(VERSION) > FirmwareVersion::Parse(rhs.VERSION);
}

bool AvailableFirmware::operator<(const FirmwareVersion& rhs) const noexcept
{
    return FirmwareVersion::Parse(VERSION) < rhs;
}

bool AvailableFirmware::operator>(const FirmwareVersion& rhs) const noexcept
{
    return FirmwareVersion::Parse(VERSION) > rhs;
}

std::string AvailableFirmware::GetGRBL() const noexcept
{
    return FirmwareVersion::Parse(VERSION).GetGRBL();
}

std::string AvailableFirmware::GetChassis() const noexcept
{
    return FirmwareVersion::Parse(VERSION).GetChassis();
}

std::string AvailableFirmware::GetElectronics() const noexcept
{
    return FirmwareVersion::Parse(VERSION).GetElectronics();
}

std::string AvailableFirmware::GetVFD() const noexcept
{
    return FirmwareVersion::Parse(VERSION).GetVFD();
}

std::string AvailableFirmware::GetYMD() const noexcept
{
    auto ymd = FirmwareVersion::Parse(VERSION).GetYMD();

    if (ymd.empty()) {
        try {
            auto match = std::smatch{};
            auto pattern = std::regex{"20[0-9][0-9][0-9][0-9][0-9][0-9]"};

            if (std::regex_search(VERSION, match, pattern)) {
                ymd = match.str();
            }
        } catch (...) {
        }
    }

    return ymd;
}
