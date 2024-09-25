#include "MillFinder.h"
#include <winioctl.h>
#include "MillException.h"
#include <Common/Util/StringUtil.h>
#include <Common/Logger.h>

class DeviceInfo
{
public:
	static DeviceInfo GetDeviceInfo()
	{
		HDEVINFO info = SetupDiGetClassDevs(&GUID_DEVINTERFACE_SERENUM_BUS_ENUMERATOR, NULL, NULL, DIGCF_PRESENT);
		return DeviceInfo(info);
	}

	~DeviceInfo()
	{
		if (devInfo != INVALID_HANDLE_VALUE)
		{
			SetupDiDestroyDeviceInfoList(devInfo);
		}
	}

	explicit DeviceInfo(HDEVINFO info) : devInfo(info) { }
	DeviceInfo(const DeviceInfo&) = delete;

	HDEVINFO devInfo;
};

#define USE_MOCK_GRBL

#ifdef USE_MOCK_GRBL

std::list<CNCMill> MillFinder::GetAvailableCNCMills() const { 
	std::list<CNCMill> availableCNCMills;
	availableCNCMills.push_back(CNCMill("\\MockCNCMill\\", "#12345"));
	return availableCNCMills;
}

#else

std::list<CNCMill> MillFinder::GetAvailableCNCMills() const
{
	std::list<CNCMill> availableCNCMills;

	DeviceInfo hdi = DeviceInfo::GetDeviceInfo();
	if (hdi.devInfo != INVALID_HANDLE_VALUE)
	{
		SP_DEVINFO_DATA spdid;
		spdid.cbSize = sizeof(SP_DEVINFO_DATA);

		int i = 0;
		while (true)
		{
			if (!SetupDiEnumDeviceInfo(hdi.devInfo, i, &spdid))
			{
				const DWORD err = GetLastError();
				if (err == ERROR_NO_MORE_ITEMS)
				{
					break;
				}
				else
				{
					throw MillException(MillException::NO_ACCESS, std::to_string(err));
				}
			}
			else
			{
				CHAR nameBuf[MAX_PATH];
				CHAR serialBuf[MAX_PATH];
				DWORD valueType;
				DWORD valueSize;
				if (SetupDiGetDeviceRegistryProperty(hdi.devInfo, &spdid, SPDRP_FRIENDLYNAME, &valueType, (PBYTE)nameBuf, MAX_PATH, &valueSize)
					&& SetupDiGetDeviceInstanceId(hdi.devInfo, &spdid, serialBuf, MAX_PATH, &valueSize))
				{
					const std::string nameStr = nameBuf;
					const std::string serialNumber = serialBuf;
					const std::string formattedSerialNumber = serialNumber.substr(serialNumber.find_last_of('\\') + 1);

					std::smatch sm;
					const std::regex RXARDUINO("^Arduino Uno \\((.*)\\)$");
					if (std::regex_match(nameStr, sm, RXARDUINO))
					{
						const std::string path = "\\\\.\\" + sm[1].str();
						availableCNCMills.push_back(CNCMill(path, formattedSerialNumber));
					}

					// TODO: RegisterDeviceNotifications - Will need to create a fake window to handle message loop
				}
				else
				{
					const DWORD err = GetLastError();
					throw MillException(MillException::NO_ACCESS, std::to_string(err));
				}
			}

			++i;
		}
	}

	return availableCNCMills;
}

#endif	// USE_MOCK_GRBL
