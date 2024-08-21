#pragma once

#include "Common/CommonHeaders.h"

#include <ghc/filesystem.h>
#include "Files/GCodeFile.h"

/*
 * Utility functions so that reading/writing files & directories is abstracted.
 */
class FileUtility
{
public:
	static void WriteFile(const std::string& path, const std::vector<uint8_t>& vuc); // writes the file at path p based on the vector of bytes
	static bool MakeDirectory(const std::string& path, const std::string& dir);
    
    static fs::path GetWorkingDirectory();
    static void SetWorkingDirectory(const fs::path& newDirectory);
};

std::vector<std::string> FilePathToLineSegments(const std::string& filePath);
std::vector<std::string> StringToLineSegments(const std::string& commands);
GCodeFile FilePathToGCode(const std::string& filePath);
