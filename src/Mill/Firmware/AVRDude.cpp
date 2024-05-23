#include "AVRDude.h"

#include "Common/CommonHeaders.h"
#include <process.hpp>
#include <Common/Logger.h>
#include <Common/Util/OSUtil.h>

using namespace MillLogger;

void AVRDude::Execute32m1(const MillConnection::Ptr& pConnection, const fs::path& hexFile)
{
	int status = -1;
	for (int i = 0; i < 2; i++) {
		status = AVRDude().Execute(
			pConnection,
			hexFile,
			19200,
			"atmega32m1",
			"stk500v1"
		);

		if (status == 0) {
			break;
		}
	}



	if (status != 0) {
		throw std::exception();
	}
}

void AVRDude::Execute328p(const MillConnection::Ptr& pConnection, const fs::path& hexFile)
{
	int status = -1;
	for (int i = 0; i < 2; i++) {
		status = AVRDude().Execute(pConnection, hexFile, 115200, "ATMEGA328P", "stk500v1");
		if (status == 0) {
			break;
		}
	}

	if (status != 0) {
		throw std::exception();
	}
}

fs::path AVRDude::GetDriversPath()
{
#ifdef _WIN32
	return OSUtility::GetExecPath() / "Drivers";
#else
	return OSUtility::GetExecPath().parent_path().parent_path() / "Drivers";
#endif
}

fs::path AVRDude::GetAVRDudePath()
{
	return GetDriversPath() / "AVRdude";
}

int AVRDude::Execute(const MillConnection::Ptr& pConnection,
	const fs::path& hexFilePath,
	const int baudrate,
	const std::string& device,
	const std::string& programmer) const
{
#ifdef _WIN32
	// Determine directory of hexFile
	const fs::path newDirectory = hexFilePath.parent_path();

	// Determine hexFileName
	const std::string hexFileName = hexFilePath.filename().u8string();

	// Determine path
	const fs::path avrdudePath = GetAVRDudePath();

	const fs::path avrdudeFile = avrdudePath / "avrdude.exe";
	const fs::path avrdudeConf = avrdudePath / "avrdude.conf";

	// Build command

	const std::string command = "\"" + avrdudeFile.u8string() + "\""
		+ " -C \"" + avrdudeConf.u8string() + "\""
		+ " -v"
		+ " -p " + device
		+ " -b " + std::to_string(baudrate)
		+ " -c stk500"
		+ " -U flash:w:\"" + hexFilePath.u8string() + "\":i"
		+ " -P " + pConnection->GetPath();
		
#else
	// Determine directory of hexFile
	const fs::path newDirectory = hexFilePath.parent_path();

	// Determine hexFileName
	const std::string hexFileName = hexFilePath.filename().u8string();

	// Determine path
	const fs::path avrdudePath = GetAVRDudePath();

	const fs::path avrdudeFile = avrdudePath / "mac" / "avrdude";
	const fs::path avrdudeConf = avrdudePath / "mac" / "avrdude.conf";

	// Build command
	std::vector<std::string> args({
		"-C ", "\"" + avrdudeConf.u8string() + "\"",
		"-v",
		"-p", device,
		"-b", std::to_string(baudrate),
		"-c", programmer.empty() ? "arduino" : programmer,
		//"-D",
		"-U", "flash:w:\"" + hexFilePath.u8string() + "\":i"
		});


	args.push_back("-P");
	args.push_back(pConnection->GetPath());
	//args.push_back("-u");

	auto combined = std::ostringstream{};
	std::copy(args.begin(), args.end(), std::ostream_iterator<std::string>(combined, " "));
	const auto command = "\"" + avrdudeFile.u8string() + "\" " + combined.str();
	MILL_LOG("Executing Command: " + command);
#endif

	std::string output;
	int exit_status = TinyProcessLib::Process(command, "", [&output](const char* bytes, size_t n) {
		try {
			output += std::string(bytes, n);
			std::cout << std::string(bytes, n);
		}
		catch (...) {}
		}, [&output](const char* bytes, size_t n) {
			try {
				output += std::string(bytes, n);
				std::cout << std::string(bytes, n);
			}
			catch (...) {}
	}).get_exit_status();

	MILL_LOG(std::regex_replace(output, std::regex("\n"), "\r\n"));

	if (exit_status != 0) {
		CR_LOG_F("Command failed: %d", exit_status);
	}

	return exit_status;
}