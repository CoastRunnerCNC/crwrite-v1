#include "archive.h"
#include <Common/Logger.h>
#include "CRException.h"
#include <boost/filesystem.hpp>

// Open the zip file

// add new file

// existing add file function


Archive::Archive()
	: m_path(""), m_unzFile(NULL)
{
}

Archive::Archive(const std::string& path) 
	: m_path(path), m_unzFile(NULL)
{
}

void Archive::Open()
{
	m_unzFile = unzOpen(m_path.c_str());
	if (m_unzFile == NULL)
	{
		throw CRException(CRException::NOT_FOUND, m_path);
	}
}

void Archive::Close()
{
	unzClose(m_unzFile);
	m_unzFile = NULL;
}

void Archive::ReadFile(const std::string& path, std::vector<std::string>& vs)
{
	MILL_LOG("String version - path: " + path);
	if (m_unzFile == NULL)
	{
		throw CRException(CRException::NOT_OPEN);
	}

	if (unzLocateFile(m_unzFile, path.c_str(), 0) != UNZ_OK)
	{
		throw CRException(CRException::NOT_FOUND_INZ, path);
	}

	if (unzOpenCurrentFile(m_unzFile) != UNZ_OK)
	{
		throw CRException(CRException::NOT_FOUND_INZ, path);
	}

	char buffer[256];
	int readSize;
	std::string line;
	while ((readSize = unzReadCurrentFile(m_unzFile, buffer, 256)) > 0)
	{
		for (int i = 0; i < readSize; ++i)
		{
			if (buffer[i] == '\n')
			{
                vs.push_back(line);
				line.clear();
			}
			else if (buffer[i] != '\r')
			{
				line.push_back(buffer[i]);
			}
		}
	}

	if (line.length() > 0)
	{
		vs.push_back(line);
		line.clear();
	}

	unzCloseCurrentFile(m_unzFile);
}

void Archive::ReadFile(const std::string& path, std::vector<unsigned char>& vuc)
{
	MILL_LOG("char version - path: " + path);
	if (m_unzFile == NULL)
	{
		throw CRException(CRException::NOT_OPEN);
	}

	if (unzLocateFile(m_unzFile, path.c_str(), 0) != UNZ_OK)
	{
		throw CRException(CRException::NOT_FOUND_INZ, path);
	}

	if (unzOpenCurrentFile(m_unzFile) != UNZ_OK)
	{
		throw CRException(CRException::NOT_FOUND_INZ, path);
	}

	unsigned char buffer[256];
	int readSize;
	while ((readSize = unzReadCurrentFile(m_unzFile, &buffer, 256)) > 0)
	{
		for (int i=0; i < readSize; ++i)
		{
            vuc.push_back(buffer[i]);
		}
	}

	unzCloseCurrentFile(m_unzFile);
}

void Archive::CopyFileFromUnzToZip(unzFile uzf, zipFile zf, const char *filename_in_zip, unz_file_info *file_info) {
    // Open the file in the source zip for reading
    unzOpenCurrentFile(uzf);

    // Prepare the destination zip file for writing
    zip_fileinfo zi;
    memset(&zi, 0, sizeof(zi));
    zi.tmz_date.tm_sec = file_info->tmu_date.tm_sec;
    zi.tmz_date.tm_min = file_info->tmu_date.tm_min;
    zi.tmz_date.tm_hour = file_info->tmu_date.tm_hour;
    zi.tmz_date.tm_mday = file_info->tmu_date.tm_mday;
    zi.tmz_date.tm_mon = file_info->tmu_date.tm_mon;
    zi.tmz_date.tm_year = file_info->tmu_date.tm_year;
    zi.internal_fa = file_info->internal_fa;
    zi.external_fa = file_info->external_fa;

    zipOpenNewFileInZip(zf, filename_in_zip, &zi, NULL, 0, NULL, 0, NULL, Z_DEFLATED, Z_DEFAULT_COMPRESSION);

    // Read the file data from the source zip and write it to the destination zip
    std::vector<char> buffer(file_info->uncompressed_size);
    unzReadCurrentFile(uzf, buffer.data(), file_info->uncompressed_size);
    zipWriteInFileInZip(zf, buffer.data(), file_info->uncompressed_size);

    // Close the file in both the source and destination zips
    unzCloseCurrentFile(uzf);
    zipCloseFileInZip(zf);
}


bool Archive::AddFileToZip(zipFile zf, const std::string& filename, const std::string& content) {
    // Prepare the file info for the new content
    zip_fileinfo fileInfo = {0};
	MILL_LOG("fileInfo S");

    // Add the new content to the zip file
    if (zipOpenNewFileInZip(zf, filename.c_str(), &fileInfo, NULL, 0, NULL, 0, NULL, Z_DEFLATED, Z_DEFAULT_COMPRESSION) != ZIP_OK) {
        return false;
    }
	MILL_LOG("zipOpenNewFileInZip S");
    // Write the new content to the zip file
    if (zipWriteInFileInZip(zf, content.data(), content.size()) != ZIP_OK) {
        return false;
    }
	MILL_LOG("ZipWriteInFileInZip S");
    // Close the file in the zip
    if (zipCloseFileInZip(zf) != ZIP_OK) {
        return false;
    }
	MILL_LOG("ZipCloseFileInZip S");
    return true;
}

void Archive::WriteZipFile(const std::string& path, const std::map<std::string, std::string> filesContents)
{
	boost::filesystem::path p(path);
	std::string tempPathString = p.parent_path().string() + "/tempZip.crproj";
	MILL_LOG("tempPathString: ");
	MILL_LOG(tempPathString.c_str());
	zipFile newFile = zipOpen(tempPathString.c_str(), APPEND_STATUS_CREATE);

	unzGoToFirstFile(m_unzFile);

	int status;

	do {
		unz_file_info file_info;
		char filename_in_zip[256];
		std::string filename_in_zip_str(filename_in_zip);
		unzGetCurrentFileInfo(m_unzFile, &file_info, filename_in_zip, sizeof(filename_in_zip), NULL, 0, NULL, 0);
		std::string foundFileName;
		std::string foundFileContent;

		for (const auto& editedFile : filesContents)
		{
			std::string s(filename_in_zip);
			MILL_LOG("editedFile.first: " + editedFile.first);
			MILL_LOG("filename_in_zip: " + s);
			if (strcmp(filename_in_zip, editedFile.first.c_str()) == 0)
			{
				foundFileName = editedFile.first;
				foundFileContent = editedFile.second;
			}
		}
		if (foundFileName.empty())
		{
			MILL_LOG("Not found: copying file");
			CopyFileFromUnzToZip(m_unzFile, newFile, filename_in_zip, &file_info);
		}
		else
		{
			MILL_LOG("File found: adding new file");
			AddFileToZip(newFile, foundFileName, foundFileContent);
		}
		/*
		UNZ_OK                          (0)
		UNZ_END_OF_LIST_OF_FILE         (-100)
		UNZ_ERRNO                       (Z_ERRNO)
		UNZ_EOF                         (0)
		UNZ_PARAMERROR                  (-102)
		UNZ_BADZIPFILE                  (-103)
		UNZ_INTERNALERROR               (-104)
		UNZ_CRCERROR                    (-105)
		*/
		status = unzGoToNextFile(m_unzFile);
	} while (status != UNZ_END_OF_LIST_OF_FILE);

	if (unzClose(m_unzFile) == UNZ_OK)
	{
		MILL_LOG("unzClose Successful");
	}
	else
	{
		MILL_LOG("unzClose failed!");
	}

	zipClose(newFile, NULL);
    if (remove(path.c_str()) == 0)
	{
		MILL_LOG("DELETED!");
	}
	else
	{
		MILL_LOG("Failed To DELETE");
	}

    // Rename the temporary zip file to the original zip file's name
    rename(tempPathString.c_str(), path.c_str());
	MILL_LOG("Reopening Orig Zip");
	m_unzFile = unzOpen(path.c_str());
	MILL_LOG("Returning from WriteZipFile");
	return;
}

void Archive::CreateNewCRFile(const std::string& fileName, const std::string& path)
{
	m_path = path + "\\" + fileName + ".crproj";
	int status;
	boost::filesystem::path p(path);
	std::string tempString = p.string() + "/" + fileName + ".crproj";
    zipFile zipf = zipOpen(tempString.c_str(), APPEND_STATUS_CREATE);
    
    if (zipf != NULL) {
        // Add files
        std::vector<std::string> filesToAdd = {"manifest.yml", "/Image", "/Code"};
        
        for(const std::string &file : filesToAdd) {
            status = zipOpenNewFileInZip(zipf, file.c_str(), NULL, NULL, 0, NULL, 0, NULL, Z_DEFLATED, Z_DEFAULT_COMPRESSION);
            
            if (status != ZIP_OK) {
                std::cerr << "Could not open " << file << " in zip file." << std::endl;
                continue;
            }

            
            // Write to file in zip here, usually from an existing file
            // If you want empty directories, you could skip this, but it may not work on all extraction tools
            
			if (file == "manifest.yml") 
			{
				std::string manifestPlaceHolderText;
				manifestPlaceHolderText += "- job_name: New Job\n"; 
				manifestPlaceHolderText += "  job_text: Job Text\n"; 
				manifestPlaceHolderText += "  job_steps:\n"; 
				manifestPlaceHolderText += "    - step_name: Step Name\n";
				manifestPlaceHolderText += "      step_markdown: |\nLorem ipsum\n";
				manifestPlaceHolderText += "      step_text: Please download the latest version of CRWRITE at coastrunner.net"; 

				status = zipWriteInFileInZip(zipf, manifestPlaceHolderText.c_str(), manifestPlaceHolderText.size()); // Writing no data, replace "" and 0 with your data
			} 
			else
			{
				status = zipWriteInFileInZip(zipf, "", 0); // Writing no data, replace "" and 0 with your data
			}
            
            
            if (status != ZIP_OK) {
                std::cerr << "Could not write to " << file << " in zip file." << std::endl;
            }

            status = zipCloseFileInZip(zipf);
            
            if (status != ZIP_OK) {
                std::cerr << "Could not close " << file << " in zip file." << std::endl;
            }
        }
        
        zipClose(zipf, NULL);
    } else {
        std::cerr << "Could not create zip file " << fileName << std::endl;
    }
}

void Archive::AddFileToZip(const std::string& filePathOnDisk, const std::string& fileType)
{
    // Extract filename with extension from filePathOnDisk
    boost::filesystem::path filepath(filePathOnDisk);
    std::string filename = filepath.filename().string();
	std::string subDirectory;

	if (fileType == "image")
	{
		subDirectory = "Image";
	}
	else
	{
		subDirectory = "Code";
	}

	// read image into variable
    std::ifstream file(filePathOnDisk, std::ios::binary);
    std::vector<unsigned char> buffer(std::istreambuf_iterator<char>{file}, {});

	// open archive
	zipFile zipfile = zipOpen(m_path.c_str(), APPEND_STATUS_ADDINZIP);

	// add file to archive
	std::string content(buffer.begin(), buffer.end());
	bool success = AddFileToZip(zipfile, subDirectory + "/" + filename, content);
	std::cout << "success? " + std::to_string(success) << std::endl;
	std::cout << "filename: " + filename << std::endl;

	// close archive
	zipClose(zipfile, NULL);
}

void Archive::CheckFile(const std::string& path) const
{
    if (m_unzFile == NULL)
	{
        throw CRException(CRException::NOT_OPEN);
    }

    if (unzLocateFile(m_unzFile, path.c_str(), 0) != UNZ_OK)
	{
        throw CRException(CRException::NOT_FOUND_INZ, path);
    }
}

std::vector<std::string> Archive::ListFiles()
{
    if (m_unzFile == NULL)
	{
        throw CRException(CRException::NOT_OPEN);
    }

	std::vector<std::string> ret;
    if (unzGoToFirstFile(m_unzFile) == UNZ_OK)
	{
        char buffer[256];
        do
		{
            unzGetCurrentFileInfo(m_unzFile, NULL, buffer, 256, NULL, 0, NULL, 0);
            ret.push_back(buffer);
        } while (unzGoToNextFile(m_unzFile) == UNZ_OK);
    }

    return ret;
}
