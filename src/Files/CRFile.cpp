#include "CRFile.h"
#include"Common/Logger.h"
#include <Common/Util/FileUtil.h>
using namespace std;

CRFile::CRFile()
{
}

CRFile::CRFile(const std::string& path) 
	: m_archive(path)
{
	m_manifest.LoadManifest(m_archive);
}

CRFile::~CRFile()
{
    if (m_thread.joinable())
    {
        m_thread.join();
    }
}

Job& CRFile::GetJob(const std::string& jobName)
{
    return m_manifest.GetJob(jobName);
}

const std::vector<Job>& CRFile::GetJobs()
{
	return m_manifest.GetJobs();
}

void CRFile::ReadFile(const std::string& path, std::vector<unsigned char>& vuc)
{
    m_archive.Open();
    m_archive.ReadFile(path, vuc);
    m_archive.Close();
}

void CRFile::ReadFile(const std::string& path, std::vector<std::string>& vs)
{
    m_archive.Open();
    m_archive.ReadFile(path, vs);
    m_archive.Close();
}

void CRFile::AddNewOperation(std::string jobName, int stepIndex)
{
    Job &currentJob = m_manifest.GetJob(jobName);
    MILL_LOG("AddNewOperation - currentJob: " + currentJob.GetTitle());
    currentJob.AddOperation(stepIndex);
}

void CRFile::SetChangesToOperations(const std::map<std::string, std::string> newOperationsValues, std::string jobName, int stepIndex)
{
    Job currentJob = m_manifest.GetJob(jobName);
    Operation::Ptr operation = currentJob.GetOperation(stepIndex);

    for (const auto& pair : newOperationsValues)
    {
        if (pair.first == "title")
        {
            operation->SetTitle(pair.second);
        }
        else if (pair.first == "prompt")
        {
            operation->SetPrompt(pair.second);
        }
        else if (pair.first == "markdown")
        {
            std::string newMarkdown = pair.second;
            if (newMarkdown[0] != '\n')
            {
                newMarkdown = '\n' + newMarkdown;
            }
            operation->SetMarkdown(newMarkdown);
            
            // operation->SetMarkdown(pair.second);
        }
        // need to check if set_image has changed. Only reload if different
        else if (pair.first == "set_image")
        {
            operation->SetLoaded(false);
            operation->SetImage(pair.second);
        }
        else if (pair.first == "set_gcode")
        {
            operation->SetLoaded(false);
            operation->SetRawGCode(pair.second);
            operation->SetGCodeEdited(true);
        }
        else if (pair.first == "set_gcode_path")
        {
            operation->SetLoaded(false);
            operation->setGCodePath(pair.second);
        }
    }
}

void CRFile::AddNewJob(const std::string& jobName, const std::string& jobDescription, const int& jobIndex)
{
    m_manifest.AddNewJob(jobName, jobDescription, jobIndex, m_archive);
}

void CRFile::CreateNewCRFile(const std::string& fileName, const std::string& path)
{
    m_archive.CreateNewCRFile(fileName, path);
    m_manifest.LoadManifest(m_archive);
}

void CRFile::AddFile(const std::string& filePath, const std::string& fileType)
{
    m_archive.AddFileToZip(filePath, fileType);
}

void CRFile::WriteUserChangesToDisk()
{
    m_writesInProgress.store(true, std::memory_order_release);
    try {
        if (m_thread.joinable()) { m_thread.join(); }
        m_thread = std::thread(&CRFile::Thread_WriteUserChangesToDisk, this);
    }
    catch (const std::system_error& se)
    {
        MILL_LOG("System error: " + std::string(se.what()) + " Error code: ");
    }
    catch (const std::exception& exception)
    {
        MILL_LOG(exception.what());
    }
    catch (...)
    {
        MILL_LOG("Unknown Exception caught");
    }
}

void CRFile::Thread_WriteUserChangesToDisk()
{
    try {
        MILL_LOG("Begin Write out thread");
        std::map<std::string, std::string> changedFilesContent;
        const std::vector<Job>& jobs = GetJobs();

        MILL_LOG("looping jobs!");
        bool firstJob = true;
        for (auto& job : jobs)
        {
            std::string wcsValueChecks;
            MILL_LOG("job title: " + job.GetTitle());
            for (auto& wcs : job.WcsValueChecks())
            {
                wcsValueChecks = "G" + to_string(wcs.first);
                wcsValueChecks += " X" + to_string(wcs.second.x);
                wcsValueChecks += " Y" + to_string(wcs.second.y);
                wcsValueChecks += " Z" + to_string(wcs.second.z);
            }

            if (!firstJob) {
                changedFilesContent["manifest.yml"] += '\n';
            }
        

            changedFilesContent["manifest.yml"] += "- job_name: " + job.GetTitle() + "\n";
            changedFilesContent["manifest.yml"] += "  job_text: " + job.GetPrompt() + "\n";
            changedFilesContent["manifest.yml"] += "\n";
            if (!job.GetMinFirmwareVersion().empty())
            {
                changedFilesContent["manifest.yml"] += "  min_fw_version" + job.GetMinFirmwareVersion() + "\n";
            }
            if (!job.GetMinimumCRWriteVersion().empty())
            {
                changedFilesContent["manifest.yml"] += "  min_crwrite_version" + job.GetMinimumCRWriteVersion() + "\n";
            }
            if (!job.AllowWcsClearPrompt())
            {
                changedFilesContent["manifest.yml"] += "  disable_wcs_clear_prompt: false\n";
            }
            if (!wcsValueChecks.empty())
            {
                changedFilesContent["manifest.yml"] += "  wcs_value_check: " + wcsValueChecks + "\n";
            }
            if (!job.WcsCheckFailedMessage().empty())
            {
                changedFilesContent["manifest.yml"] += "  wcs_check_failed_message: " + job.WcsCheckFailedMessage() + "\n";
            }
            // changedFilesContent["manifest.yml"] += job.GetModels() + "\n";
            // Should this be GetGuide or GetGuides?
            // changedFilesContent["manifest.yml"] += "  guide_files: " + job.GetGuides() + "\n"; 
            changedFilesContent["manifest.yml"] += "  job_steps:\n";


            std::string prevManifest = "manifest.yml";
            bool firstOperation = true;
            bool skipOperation = false;
            for (const auto& operationPtr : job.GetOperations())
            {
                MILL_LOG("Step Title: " + operationPtr->GetTitle());

                if (operationPtr->IsGCodeEdited())
                {
                    changedFilesContent[operationPtr->GetFile()] = operationPtr->GetRawGCode();
                    operationPtr->SetGCodeEdited(false);
                }

                std::string operationsString;
                std::string currentManifest = operationPtr->GetManifest();

                if (currentManifest != prevManifest)
                {
                    skipOperation = false;
                }

                if (currentManifest != prevManifest && currentManifest != "manifest.yml")
                {
                    changedFilesContent["manifest.yml"] += "\n    - manifest_file: " + currentManifest + "\n";
                    if (changedFilesContent.count(currentManifest) > 0)
                    {
                        skipOperation = true;
                    }
                }

                // Still need to add "if" value from manifest in here
                if (!skipOperation)
                {
                    if (!firstOperation) 
                    {
                        operationsString += "\n";
                    }

                    if (!operationPtr->GetTitle().empty())
                    {
                        operationsString += "    - step_name: " + operationPtr->GetTitle() + "\n";
                    }
                    
                    if (!operationPtr->GetMarkdown().empty())
                    {
                        operationsString += "      step_markdown: |" + operationPtr->GetMarkdown() + "\n";
                    }

                    if (!operationPtr->GetPrompt().empty())
                    {
                        operationsString += "      step_text: " + operationPtr->GetPrompt() + "\n";
                    }
                    
                    if (!operationPtr->GetImage().empty())
                    {
                        operationsString += "      step_image: " + operationPtr->GetImage() + "\n";
                    }
                    
                    if (!operationPtr->GetFile().empty())
                    {
                        operationsString += "      step_gcode: " + operationPtr->GetFile() + "\n";
                    }

                    if (!operationPtr->GetUnskippable().empty())
                    {
                        operationsString += "      unskippable: " + operationPtr->GetUnskippable() + "\n";
                    }
                    
                    if (!operationPtr->GetPopupText().empty())
                    {
                        operationsString += "      popup_text: " + operationPtr->GetPopupText() + "\n";
                    }
                    
                    if (!operationPtr->GetPopupTitle().empty())
                    {
                        operationsString += "      popup_title: " + operationPtr->GetPopupTitle() + "\n";
                    }
                    
                    if (operationPtr->GetPopupWaitTime() > 0)
                    {
                        operationsString += "      popup_wait_time: " + std::to_string(operationPtr->GetPopupWaitTime()) + "\n";
                    }
                    
                    if (operationPtr->GetPause())
                    {
                        operationsString += "      pause: true\n";
                    }
                    
                    if (operationPtr->GetReset())
                    {
                        operationsString += "      reset: true\n";
                    }
                    
                    if (operationPtr->GetTimeout() > 0)
                    {
                        operationsString += "      timeout: " + std::to_string(operationPtr->GetTimeout()) + "\n";
                    }
                    
                    changedFilesContent[currentManifest] += operationsString;
                }
                prevManifest = currentManifest;
                firstOperation = false;
            }
            firstJob = false;
        }
        
        m_archive.Open();
        m_archive.WriteZipFile(m_archive.GetPath(), changedFilesContent);
        m_archive.Close();
        m_writesInProgress.store(false, std::memory_order_release);
        MILL_LOG("Write out thread complete");
    }
    catch (const std::exception& exception)
    {
        MILL_LOG(exception.what());
    }
}

bool CRFile::GetWriteStatus()
{
    return m_writesInProgress.load();
}

void CRFile::SaveFileInternal(const std::string& file, const std::string& path)
{
	std::vector<unsigned char> vuc;
    m_archive.ReadFile(file, vuc);

    if (FileUtility::MakeDirectory(path, file))
	{
		FileUtility::WriteFile(path + file, vuc);
    }
}

void CRFile::SaveFiles(const std::vector<std::string>& files, const std::string& path)
{
	m_archive.Open();

	for (size_t i = 0; i < files.size(); ++i)
	{
        SaveFileInternal(files[i], path);
	}

	m_archive.Close();
}

std::vector<std::string> CRFile::ListFiles()
{
    m_archive.Open();
	const std::vector<std::string> files = m_archive.ListFiles();
    m_archive.Close();

    return files;
}
