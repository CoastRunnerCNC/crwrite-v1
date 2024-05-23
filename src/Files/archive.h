#pragma once

#include "Common/CommonHeaders.h"
#include "minizip/unzip.h"
#include "minizip/zip.h"
#include <filesystem>

#ifdef _WIN32
	#include "minizip/iowin32.h"
	#define USEWIN32IOAPI
#endif

/*
 * Thin wrapper on minizip's unzip library to give simple object oriented access to a zip file
 */
class Archive
{
private:

	std::string m_path;
	unzFile m_unzFile;

public:
	Archive();
	explicit Archive(const std::string& path);

	void Open();
	void Close();

	void ReadFile(const std::string& path, std::vector<std::string>& vs);//reads the file of path p contained in a zip file as a vector of strings where each string is a line
	void ReadFile(const std::string& path, std::vector<unsigned char>& vuc);//reads the file of path p contained in a zip file as a vector of bytes
	bool AddFileToZip(zipFile zf, const std::string& filename, const std::string& content);
	void CopyFileFromUnzToZip(unzFile uzf, zipFile zf, const char *filename_in_zip, unz_file_info *file_info);
	void WriteZipFile(const std::string& path, const std::map<std::string, std::string> manifestsContents);
	void AddFileToZip(const std::string& filePathOnDisk, const std::string& fileType);
	void CreateNewCRFile(const std::string& fileName, const std::string& path);
	void CheckFile(const std::string& path) const;
	std::vector<std::string> ListFiles();

	inline const std::string& GetPath() const { return m_path; }
};
