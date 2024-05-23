#include "Logger.h"

#include <Common/Util/OSUtil.h>
#include <Common/Util/FileUtil.h>
#include <Common/ThreadManager.h>
#include <spdlog/spdlog.h>
#include <spdlog/sinks/rotating_file_sink.h>
#include <spdlog/async.h>

namespace MillLogger {

std::shared_ptr<spdlog::logger> logger;

std::string GetLogPath() {
	fs::path path = OSUtility::GetDataDirectory() / "logs" / "mill.log";
	return path.u8string();
}

void CheckLogOpen() {
	if (!logger) {
		const bool success = FileUtility::MakeDirectory(OSUtility::GetDataDirectory().string(), "logs");
		if (success) {
			logger = spdlog::create<spdlog::sinks::rotating_file_sink_mt>("LOGGER", GetLogPath(), 3 * 1024 * 1024, 1);
		}
	}
}

void Log(const std::string& function, const size_t line, const std::string& message) {
	CheckLogOpen();
	std::string formatted = function + "(" + std::to_string(line) + ") - " + message;
	while (formatted.find("\n") != std::string::npos) {
		formatted.erase(formatted.find("\n"), 2);
	}

	const std::string threadName = ThreadManager::GetCurrentThreadName();
	if (!threadName.empty()) {
		formatted = threadName + " => " + formatted;
	}

	logger->log(spdlog::level::level_enum::info, formatted);
}

std::string ReadLog() {
	CheckLogOpen();

	std::string logs;
	FILE* pFile = fopen(GetLogPath().c_str(), "r");
	if (pFile != nullptr) {
		char cstr[100];
		while (fgets(cstr, 100, pFile) != NULL) {
			logs += std::string(cstr);
		}

		fclose(pFile);
	}
	else {
		logs = "<ERROR READING LOGS>";
	}

	return logs;
}

void Flush() {
	CheckLogOpen();
	logger->flush();
}

void Shutdown() {
	if (logger) { spdlog::drop("LOGGER"); }
}

} //End namespace MillLogger
