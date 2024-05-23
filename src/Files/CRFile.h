#pragma once

#include "Common/CommonHeaders.h"
#include "archive.h"
#include "manifest.h"

/*
 * Wraps Manifest and Archive to give a simple way of working with CR files
 */
class CRFile
{
	Archive m_archive;
	Manifest m_manifest;
	std::thread m_thread;
	std::atomic_bool m_writesInProgress{false};

	void SaveFileInternal(const std::string& file, const std::string& path);

public:
	using Ptr = std::shared_ptr<CRFile>;

	CRFile();
	~CRFile();
	explicit CRFile(const std::string& path);

	Job& GetJob(const std::string& jobName);
	const std::vector<Job>& GetJobs();//gets the full list of jobs contained in the CR file

	void ReadFile(const std::string& path, std::vector<unsigned char>& vuc);
	void ReadFile(const std::string& path, std::vector<std::string>& vs);
	void AddNewOperation(std::string jobName, int index);
	void SetChangesToOperations(const std::map<std::string, std::string> newOperationsValues, std::string jobName, int stepIndex);
	void AddNewJob(const std::string& jobName, const std::string& jobDescription, const int& jobIndex);
	void CreateNewCRFile(const std::string& fileName, const std::string& path);
	void AddFile(const std::string& filePath, const std::string& fileType);
	void WriteUserChangesToDisk();
	void Thread_WriteUserChangesToDisk();
	bool GetWriteStatus();

	void SaveFiles(const std::vector<std::string>& files, const std::string& path);
	std::vector<std::string> ListFiles();

	inline const std::string& GetPath() const { return m_archive.GetPath(); }
};
