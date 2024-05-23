#pragma once

#include "Common/CommonHeaders.h"
#include <ghc/filesystem.h>

#ifdef _WIN32
#include <windows.h>

typedef HANDLE OS_FILE;
#else
typedef int OS_FILE;
#endif

class OSUtility
{
public:
	static fs::path GetDataDirectory();
	static fs::path GetExecPath();

	// File access
	static bool WriteToFile(const OS_FILE file, const char* pc, const int num);
	static int ReadFromFile(const OS_FILE file, char* pc, const int num);
    
    static bool ExecuteCommandInNewProcess(
		const fs::path& directory,
		const std::string& command,
		const std::vector<std::string>& args
	);
};
