#include "FirmwareVersion.h"
#include "Services/Models/AvailableFirmware.h"

#include <Common/Util/StringUtil.h>

FirmwareVersion FirmwareVersion::Parse(const std::string& buffer)
{
	assert(!buffer.empty());
	assert(buffer[0] == '<' && buffer[buffer.size() - 1] == '>');

	std::string line = buffer.substr(1, buffer.size() - 2);
	if (line.find(',') != std::string::npos) {
		std::vector<std::string> parts = StringUtil::Split(line, ",");
		assert(parts.size() == 2);

		const std::string grblVersion = parts[0].substr(4);
		const std::string crVersion = StringUtil::Trim(parts[1]).substr(3);

		return FirmwareVersion(grblVersion, crVersion);
	} else {
		// [grbl:1.1h CR:3A PCB:3B VFD:3A YMD:20200101]
		std::vector<std::string> parts = StringUtil::Split(line, " ");
		std::string grbl;
		std::string cr;
		std::string pcb;
		std::string vfd{ "3A" };
		std::string ymd;

		for (const std::string& part : parts) {
			auto keyValue = StringUtil::SplitOnce(part, ":");
			if (keyValue.first == "grbl") {
				grbl = keyValue.second;
			} else if (keyValue.first == "CR") {
				cr = keyValue.second;
			} else if (keyValue.first == "PCB") {
				pcb = keyValue.second;
			} else if (keyValue.first == "VFD") {
				vfd = keyValue.second;
			} else if (keyValue.first == "YMD") {
				ymd = keyValue.second;
			}
		}

		return FirmwareVersion(grbl, ymd, cr, pcb, vfd);
	}
}

bool FirmwareVersion::operator>(const FirmwareVersion& rhs) const noexcept
{
	return m_ymd > rhs.m_ymd;
}

bool FirmwareVersion::operator<(const FirmwareVersion& rhs) const noexcept
{
    return m_ymd < rhs.m_ymd;
}

bool FirmwareVersion::operator>(const AvailableFirmware& rhs) const noexcept
{
	return *this > Parse(rhs.VERSION);
}

bool FirmwareVersion::operator<(const AvailableFirmware& rhs) const noexcept
{
    return *this < Parse(rhs.VERSION);
}
