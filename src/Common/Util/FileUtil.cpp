#include "FileUtil.h"

#include <Common/Logger.h>

#include <exception>
#include <iostream>
#include <fstream>

using namespace MillLogger;
using std::ifstream;
using std::string;
using std::vector;
using std::operator""s;

#ifdef _WIN32
#include <windows.h>
#define FILE_SEPARATOR "\\"
#else
#define FILE_SEPARATOR "/"
#endif

void FileUtility::WriteFile(const std::string &path, const std::vector<uint8_t> &vuc)
{
    std::ofstream of(path, std::ios::out | std::ios::trunc | std::ios::binary);
    of.write((char *)(vuc.data()), vuc.size());
    of.close();
}

bool FileUtility::MakeDirectory(const std::string &path, const std::string &dir)
{
    std::error_code errorCode;
    const std::string newDir = path + FILE_SEPARATOR + dir;
    if (fs::is_directory(newDir))
    {
        return true;
    }

    return fs::create_directories(newDir, errorCode);
}

fs::path FileUtility::GetWorkingDirectory()
{
#ifdef _WIN32
    // TODO: Use fs
    const int bufferSize = MAX_PATH;
    char oldDir[bufferSize];
    if (GetCurrentDirectory(bufferSize, oldDir))
    {
        return fs::path(oldDir);
    }

    MILL_LOG("Error getting current directory: #" + std::to_string(GetLastError()));
#endif

    throw std::exception();
}

void FileUtility::SetWorkingDirectory(const fs::path &newDirectory)
{
    MILL_LOG("Setting working directory: " + newDirectory.string());
#ifdef _WIN32
    if (!SetCurrentDirectory(newDirectory.u8string().c_str()))
    {
        MILL_LOG("Error setting current directory: #" + std::to_string(GetLastError()));
        throw std::exception();
    }
#endif
}

vector<string> FilePathToLineSegments(const string &filePath)
{
    auto segmentedLines = vector<string>{};
    auto file = ifstream{filePath};
    auto temp = string{};

    if (file.is_open())
    {
        while (getline(file, temp))
        {
            segmentedLines.push_back(temp);
            temp.clear();
        }

        if (!file.eof() && file.fail())
        {
            auto msg = "File read failed.Failbit set."s;
            MILL_LOG(msg);
            throw std::runtime_error{msg};
        }
    }

    return segmentedLines;
}

std::vector<std::string> StringToLineSegments(const std::string &commands)
{
    std::vector<std::string> segmentedLines = std::vector<std::string>{};
    std::string currentLine;

    for (size_t i = 0; i < commands.length(); ++i)
    {
        if (commands[i] == '\n')
        {
            if (!currentLine.empty())
            {
                segmentedLines.push_back(currentLine);
                currentLine.clear();
            }
        }
        else
        {
            currentLine += commands[i];
        }
        
    }
    if (!currentLine.empty()) {
        segmentedLines.push_back(currentLine);
    }
    return segmentedLines;
}

GCodeFile FilePathToGCode(const string &filePath)
{
    return GCodeFile{FilePathToLineSegments(filePath)};
}
