#pragma once

#include "Common/CommonHeaders.h"
#include <Common/Models/URL.h>
#include <ghc/filesystem.h>

// Utility that assists with downloading files
class FileDownloader
{
public:
	static void DownloadFile(const URL& url, const fs::path& location);

private:
	static void GetFile(const std::string& serverName, const std::string& getCommand, std::ofstream& outFile);
};