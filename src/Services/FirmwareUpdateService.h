#pragma once

#include "Common/CommonHeaders.h"
#include "Models/AvailableFirmware.h"
#include <Mill/Firmware/FirmwareVersion.h>

/// <summary>
/// Web service to check for firmware updates.
/// </summary>
class FirmwareUpdateService
{
public:
    struct Request
    {
        std::string cr_version;
        std::string explicit_version;
        FirmwareVersion current_firmware;
    };

    struct Response
    {
        std::vector<AvailableFirmware> available;
    };

    static Response Invoke(const Request& req);
};
