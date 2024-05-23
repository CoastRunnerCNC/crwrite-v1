#include "Common/CommonHeaders.h"
#include "drivers.h"
#include <Common/Util/FileUtil.h>
#include <Common/Util/OSUtil.h>

#ifdef _WIN32
#include <Common/Logger.h>
using namespace MillLogger;
#endif

bool Drivers::InstallDrivers() noexcept
{
#ifndef _WIN32
    return false;
#else
    try {
        const auto path = OSUtility::GetExecPath() / "Drivers" / "Arduino";;
        std::cout << "Installing drivers from: " << path << std::endl;
        const auto installer = path / "install.bat";
        ShellExecuteW(
            NULL,
            L"open",
            installer.c_str(),
            NULL,
            path.c_str(),
            SW_SHOWNORMAL);

        std::cout << "Finished Installing drivers" << std::endl;
        return true;
    } catch (const std::exception& e) {
        MILL_LOG("Install driver error  " + std::string(e.what()));

        return false;
    }
#endif
}