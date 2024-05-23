#include "OSUtil.h"
#include "FileUtil.h"

#include <Common/Logger.h>
using namespace MillLogger;

#ifdef _WIN32
#include <windows.h>
#include <shlobj.h>
#elif __APPLE__
#include <mach-o/dyld.h>
#include <CoreFoundation/CoreFoundation.h>
#else
#include <stdlib.h>
#include <sys/param.h>
#include <sys/stat.h>
#include <unistd.h>
#endif

fs::path OSUtility::GetDataDirectory()
{
#if defined __APPLE__ || defined __linux__

    const char* homeDir = getenv("HOME");

    if (nullptr != homeDir)
    {
        return fs::path(std::string(homeDir)) / fs::path(".cncmill");
    }
#elif defined _WIN32
    char homeDir[MAX_PATH];
    if (SHGetFolderPathA(NULL, CSIDL_PROFILE, NULL, 0, homeDir) == S_OK)
    {
        return fs::path(std::string(homeDir)) / fs::path(".cncmill");
    }
#else
    return fs::current_path();
#endif

    return {};
}

fs::path OSUtility::GetExecPath()
{
#ifdef __APPLE__
    unsigned int size = MAXPATHLEN;
    char *pathBuffer = new char[size];
    int result = _NSGetExecutablePath(pathBuffer, &size);
    if (result == -1)
    {
        delete[] pathBuffer;
        pathBuffer = new char[size];
        result = _NSGetExecutablePath(pathBuffer, &size);
        if (result == -1)
        {
            throw std::exception();
        }
    }

    // resolve symlinks (who cares .. ?)
    char *realPathBuffer = realpath(pathBuffer, NULL);
    if (realPathBuffer == NULL)
    {
        throw std::exception();
    }

    std::string appPath = realPathBuffer;
    delete[] pathBuffer;
    free(realPathBuffer);

    // _NSGetExecutablePath actually returns the path to and including the
    // currently running executable, but we just want the path containing the
    // executable.
    std::string::size_type pos = appPath.find_last_of('/');
    appPath = appPath.substr(0, pos);

    pos = appPath.find_last_of('/');

    return fs::path(appPath.substr(0, pos) + "/Resources/app");
#else
	return fs::current_path();
#endif
}

bool OSUtility::WriteToFile(const OS_FILE file, const char* pc, const int num)
{
#ifdef _WIN32
	DWORD writeSize;
	WriteFile(file, pc, num, &writeSize, NULL);
	if (num != writeSize)
	{
		return false;
	}
#else
	int writeSize = write(file, pc, num);
	if (num != writeSize)
	{
		return false;
	}
#endif

	return true;
}

int OSUtility::ReadFromFile(const OS_FILE file, char* pc, const int num)
{
#ifdef _WIN32
	DWORD readSize;
	ReadFile(file, pc, num, &readSize, NULL);
	return readSize;
#else
	return read(file, pc, num);
#endif
}

bool OSUtility::ExecuteCommandInNewProcess(const fs::path& directory, const std::string& command, const std::vector<std::string>& args)
{
#ifdef _WIN32
    // 1. Store the old working directory
    fs::path oldDirectory = FileUtility::GetWorkingDirectory();

    // 2. Set the new working directory
    FileUtility::SetWorkingDirectory(directory);

    // 3. Allocate STARTUPINFO and PROCESS_INFORMATION objects
    STARTUPINFO si;
    ZeroMemory(&si, sizeof(si));
    si.cb = sizeof(si);

    PROCESS_INFORMATION pi;
    ZeroMemory(&pi, sizeof(pi));

    // 4. Create the process
    MILL_LOG("Command: " + command);
    if (!CreateProcess(NULL, (LPSTR)command.c_str(), NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi))
    {
		wchar_t buf[256];
		FormatMessageW(FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS,
			NULL, GetLastError(), MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT),
			buf, (sizeof(buf) / sizeof(wchar_t)), NULL);
		std::wstring lastError(buf);
		std::string lastErrorStr(lastError.begin(), lastError.end());
        MILL_LOG("CreateProcess failed : " + lastErrorStr);
        FileUtility::SetWorkingDirectory(oldDirectory);
        return false;
    }

    // 5. Wait for the process to finish
    WaitForSingleObject(pi.hProcess, INFINITE);
    CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);

    // 6. Restore original working directory
    FileUtility::SetWorkingDirectory(oldDirectory);
#elif __APPLE__
//    MillLogger::Flush();
    pid_t child_pid;
    child_pid = fork();

    if (child_pid == 0) {
        std::string app = command;//directory + "/" + command;
        char* appArray = new char[app.size() + 1];
        std::copy(app.begin(), app.end(), appArray);
        appArray[app.size()] = '\0';

        std::vector<char*> argv;
        argv.push_back(appArray);
        for (const std::string& arg : args)
        {
            char* argArray = new char[arg.size() + 1];
            std::copy(arg.begin(), arg.end(), argArray);
            argArray[arg.size()] = '\0';
            argv.push_back(argArray);
        }

        argv.push_back(nullptr);

        if (execv(argv[0], argv.data()) < 0)
        {
            perror("execv error");
            MILL_LOG(std::string(strerror(errno)));
            MILL_LOG(app);
        }

        for (char* const arg : argv)
        {
            delete[] arg;
        }

        exit(0);
    }
    else
    {
        auto child_status = int{};
        wait(&child_status);
        if (child_status != 0)
        {
            return false;
        }
    }
#endif

    return true;
}
