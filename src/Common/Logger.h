#pragma once

#include "Common/CommonHeaders.h"
#include <Common/Util/StringUtil.h>

// Logging utilities
namespace MillLogger {

void Log(const std::string& function, const size_t line, const std::string& message);
std::string GetLogPath();
std::string ReadLog();
void Flush();
void Shutdown();
inline void LogCout(const std::string& text) { std::cout << text << std::endl; }

#define MILL_LOG(message) MillLogger::Log(__FUNCTION__, __LINE__, message);  MillLogger::Flush()
#define CR_LOG_F(message, ...) MillLogger::Log(__FUNCTION__, __LINE__, StringUtil::Format(message, __VA_ARGS__))
#define CR_LOG_SYNC(message) MillLogger::Log(__FUNCTION__, __LINE__, message); MillLogger::Flush()
};