#include "MillDaemon.h"

#include <Common/Defs.h>
#include "Settings/SettingManager.h"
#include "Mill/MillingManager.h"
#include "Mill/Display/MillDisplayManager.h"
#include "Mill/MillFinder.h"
#include "Mill/Firmware/FirmwareManager.h"
#include "Files/CRFile.h"
#include "Common/Util/FileUtil.h"
#include "Files/CRException.h"
#include <Common/Logger.h>
#include "Common/ThreadManager.h"
#include <Common/FileDownloader.h>
#include <tl/optional.hpp>
#include <Mill/GRBL/MillConnection.h>
#include <Mill/GRBL/Jogging/JogManager.h>
#include <Mill/Drivers/drivers.h>
#include <json/json.h>
#include "Common/Util/FileUtil.h"

#include <ghc/filesystem.h>

using namespace std;
using namespace MillLogger;

// TODO: This should always fail gracefully.

//////////////////////////////////////////////////////
// Daemon
//////////////////////////////////////////////////////

MillDaemon::MillDaemon()
	: m_shutdown(false),
	m_pConnector(nullptr),
	m_pFirmwareUpdater(nullptr),
	m_nextFirmwareUpdateId(1),
	m_pCRFile(),
	m_pJob(),
	m_mutex()
{
}

MillDaemon::~MillDaemon()
{
	Shutdown();
}

MillDaemon& MillDaemon::GetInstance()
{
	static MillDaemon instance;
	return instance;
}

void MillDaemon::Initialize()
{
	ThreadManager::SetCurrentThreadName("MAIN_THREAD");
	CR_LOG_SYNC("-------------------------------------");
	CR_LOG_F("INITIALIZING CRWRITE %s", MILL_SOFTWARE_VERSION);

	// 1. Initialize Setting Manager (this will read and cache preferences)
	SettingManager::GetInstance();
	m_pConnector = MillConnector::Initialize();
	m_pMillingManager = unique::make_unique<MillingManager>();
	m_pFirmwareUpdater = FirmwareUpdater::Initialize(m_pConnector);




}

void MillDaemon::Shutdown()
{
	Lock lock(m_mutex);
	if (!m_shutdown)
	{
		MILL_LOG("SHUTTING DOWN");
		m_shutdown = true;

		m_pFirmwareUpdater.reset();
		m_pMillingManager.reset();
		m_pConnector.reset();
		CR_LOG_SYNC("FINISHED SHUTDOWN");
		CR_LOG_SYNC("-------------------------------------");
		MillLogger::Flush();
		MillLogger::Shutdown();
	}
}

//////////////////////////////////////////////////////
// CRFile
//////////////////////////////////////////////////////

tl::optional<std::string> MillDaemon::SetCRFile(const std::string& crFilePath)
{
	MILL_LOG("File path: " + crFilePath);
	SetPositionButton(4);
	std::string testString = GetPositionButton(4);
	cout << testString << endl;
	try
	{
		std::shared_ptr<CRFile> pCRFile = std::make_shared<CRFile>(crFilePath);
		if (pCRFile->GetJobs().empty())
		{
			return "No jobs found in archive";
		}
		else
		{
			m_pMillingManager->SetManualOperationFlag(false);	// Clear manual operation flag to allow for automatic soft resets if needed
			m_pCRFile = pCRFile;
			return tl::nullopt;
		}
	}
	catch (const std::exception& exception)
	{
		MILL_LOG("Exception thrown: " + std::string(exception.what()));
		return tl::make_optional(std::string(exception.what()));
	}
}

bool MillDaemon::CreateNewCRFile(const std::string& fileName, const std::string& path)
{
	std::string filepath = path + "\\" + fileName + ".crproj";
	std::shared_ptr<CRFile> pCRFile = std::make_shared<CRFile>();
	pCRFile->CreateNewCRFile(fileName, path);
	SetCRFile(filepath);
}

bool MillDaemon::AddNewFileToCRFile(const std::string& filepath, const std::string& fileType)
{
	try 
	{
		m_pCRFile->AddFile(filepath, fileType);
		return true;
	}
	catch (const std::exception& exception)
	{
		return false;
	}
}

bool MillDaemon::ExtractAdditionalCRContentsIntoDirectory(const std::string& destination) const noexcept {
	MILL_LOG("Extracting additional crproj contents into directory: " + destination);

	try {
		auto fileList = m_pCRFile->ListFiles();

		// Remove-Erase idiom: https://infogalactic.com/info/Erase%E2%80%93remove_idiom
		fileList.erase(
			remove_if(fileList.begin(), fileList.end(),
				[ ] (auto& path) { return path.find("Additional Files/") == string::npos; })
			, fileList.end());

		auto unzippedContent = vector<unsigned char>{ };
		for (auto& path : fileList) {
			if (path.empty()) { continue; }
			unzippedContent.clear();
			m_pCRFile->ReadFile(path, unzippedContent);
			path.erase(0, path.find_first_of('/') + 1);
			if (path.back() == '/') {
				FileUtility::MakeDirectory(destination, path);
				continue;
			}
		#ifdef WIN32
			constexpr auto delimiter = '\\';
		#else
			constexpr auto delimiter = '/';
		#endif // WIN32
			auto copyFile = ofstream{ destination + delimiter + path, std::ios_base::out | std::ios_base::binary | std::ios::trunc };
			for (auto& line : unzippedContent) { copyFile << line; }
		}

		return true;
	}
	catch (const std::exception& exception) {
		MILL_LOG("Exception thrown: " + std::string(exception.what()));
		return false;
	}
}

bool MillDaemon::HasAdditionalContent() const noexcept {
	MILL_LOG("Checking for additional .crproj content.");
	try {
		if (!m_pCRFile) { MILL_LOG("No crproj file."); return false; }
		MILL_LOG("Path: " + m_pCRFile->GetPath());
		auto fileList = m_pCRFile->ListFiles();
		
		// ListFiles() was inconsistent here in development with showing directories as their own item
		// Check for both "Additional Files/" by itself and "Additional Files/*" as first item
		auto checkFirstFile = fileList[0].find("Additional Files/");
		auto index = find(fileList.begin(), fileList.end(), "Additional Files/");
		return checkFirstFile != string::npos || index != fileList.end();
	}
	catch (const std::exception& exception) {
		MILL_LOG("Exception thrown: " + std::string(exception.what()));
		return false;
	}
}

void MillDaemon::ExportMachineOutput(std::string filepath, std::string output)
{
	// Open a file for writing
    std::ofstream outfile(filepath);

    // Check if the file is open
    if (!outfile.is_open()) {
        std::cerr << "Failed to open the file for writing." << std::endl;
        return;  // Exit with an error code
    }

    // Write to the file
    outfile << output << std::endl;

    // Close the file
    outfile.close();
}

bool MillDaemon::IsValidCRFile(const std::string& crFilePath) const
{
	try
	{
		CRFile CRFile(crFilePath);

		return !CRFile.GetJobs().empty();
	}
	catch (const std::exception& exception)
	{
		MILL_LOG("Exception thrown: " + std::string(exception.what()));
		return false;
	}
}

//////////////////////////////////////////////////////
// Coast Runner
//////////////////////////////////////////////////////

bool MillDaemon::SetSelectedCNCMill(const CNCMill& cncMill) noexcept
{
	m_pFirmwareUpdater->ResetFirmware();

	return m_pConnector->SetSelectedCNCMill(cncMill);
}

tl::optional<SoftLimits> MillDaemon::GetSoftLimits(const MillConnection::Ptr& pConnection) const
{
	assert(pConnection != nullptr);

	try
	{
		return pConnection->GetSettings(false).GetSoftLimits();
	}
	catch (std::exception& e)
	{
		MILL_LOG("Exception thrown: " + std::string(e.what()));
		return tl::nullopt;
	}
}



//////////////////////////////////////////////////////
// Jobs
//////////////////////////////////////////////////////

void MillDaemon::SelectJob(const size_t jobIndex)
{
	CR_LOG_F("jobIndex: %lu", jobIndex);

	if (m_pCRFile != nullptr)
	{
		const std::vector<Job>& jobs = m_pCRFile->GetJobs();
		if (jobs.size() > jobIndex)
		{
			m_pMillingManager->ClearError();
			std::string jobName = jobs[jobIndex].GetTitle();
			// if (state.grbl_version.compare(jobs[0].getMinFirmwareVersion()) < 0) // TODO: Check minimum firmware version.
			m_pJob = &m_pCRFile->GetJob(jobName);
		}
	}
}

bool MillDaemon::IsSubmanifestUsed() {
	bool submanifestUsed = m_pJob->IsSubmanifestUsed();
	return submanifestUsed;
}

void MillDaemon::AddNewOperation(const int stepIndex)
{
	std::string jobName = m_pJob -> GetTitle();
	MILL_LOG("AddNewOperation - jobName: " + jobName);
	MILL_LOG("AddNewOperation - stepIndex: " + to_string(stepIndex));
	m_pCRFile->AddNewOperation(jobName, stepIndex);
	std::vector<Operation::Ptr> operations = m_pJob->GetOperations();

	MILL_LOG("Looping operations");
	for (auto step : operations)
	{
		MILL_LOG(step->GetTitle());
	}
	MILL_LOG("Done looping operations");
	m_pCRFile->WriteUserChangesToDisk(); 
}

void MillDaemon::SetNewOperationsValues(const std::map<std::string, std::string> newOperationsValues, int stepIndex) 
{
	m_pCRFile->SetChangesToOperations(newOperationsValues, m_pJob->GetTitle(), stepIndex);
	m_pCRFile->WriteUserChangesToDisk();
}

void MillDaemon::DeleteOperation(const int stepIndex)
{
	m_pJob->DeleteOperation(stepIndex);
	m_pCRFile->WriteUserChangesToDisk();
}

void MillDaemon::MoveOperation(const int prevStepIndex, const int nextStepIndex)
{
	MILL_LOG("MoveOperation fired!");
	MILL_LOG("prevStepIndex: " + to_string(prevStepIndex));
	MILL_LOG("nextStepIndex: " + to_string(nextStepIndex));
	m_pJob->MoveOperation(prevStepIndex, nextStepIndex);
	m_pCRFile->WriteUserChangesToDisk();
}

void MillDaemon::AddNewJob(const std::string& jobName, const std::string& jobDescription, const int& jobIndex)
{
	m_pCRFile->AddNewJob(jobName, jobDescription, jobIndex);
	m_pCRFile->WriteUserChangesToDisk();
}

bool MillDaemon::GetWriteStatus()
{
	bool writeInProgress = m_pCRFile->GetWriteStatus();
	return writeInProgress;
}

std::vector<Job> MillDaemon::GetJobs() const { return m_pCRFile != nullptr ? m_pCRFile->GetJobs() : std::vector<Job>(); }
//////////////////////////////////////////////////////
// FeedRate
//////////////////////////////////////////////////////

int MillDaemon::GetFeedRate() const
{
	int feedRate = -1;

	auto pConnection = m_pConnector->GetNoLockConnection();
	if (pConnection != nullptr)
	{
		feedRate = pConnection->GetFeedRateSlider();
	}

	return feedRate;
}

bool MillDaemon::SetFeedRate(const int feedRate)
{
	auto pConnection = m_pConnector->GetNoLockConnection();
	if (pConnection != nullptr)
	{
		CR_LOG_F("FeedRate slider changed from %d to %d", pConnection->GetFeedRateSlider(), feedRate);
		pConnection->SetFeedRateSlider(feedRate);
		return true;
	}

	return false;
}



//////////////////////////////////////////////////////
// Settings
//////////////////////////////////////////////////////

bool MillDaemon::GetEnableSlider() const
{
	return SettingManager::GetInstance().GetEnableSlider();
}

bool MillDaemon::GetPauseAfterGCode() const
{
	return SettingManager::GetInstance().GetPauseAfterGCode();
}

int MillDaemon::GetMinFeedRate() const
{
	return SettingManager::GetInstance().GetMinFeedRate();
}

int MillDaemon::GetMaxFeedRate() const
{
	return SettingManager::GetInstance().GetMaxFeedRate();
}

bool MillDaemon::GetDisableLimitCatch() const
{
	return SettingManager::GetInstance().GetDisableLimitCatch();
}

bool MillDaemon::GetShowEditButtonSetting() const
{
	return SettingManager::GetInstance().GetShowEditButtonSetting();
}

bool MillDaemon::GetEnableEditButton() const
{
	return SettingManager::GetInstance().GetEnableEditButton();
}

bool MillDaemon::UpdateSettings(const std::list<Setting>& settings) const
{
	SettingManager::GetInstance().UpdateSettings(settings);
	return true;
}

std::string MillDaemon::GetPositionButton(const int buttonNumber) const
{
	return SettingManager::GetInstance().GetPositionButton(buttonNumber);
}

bool MillDaemon::SetPositionButton(const int buttonNumber)
{
	// get current machine position in mm
	RealTimeCoordinates currentCoords = GetStatus()->GetPosition().GetMachinePosition();
	// convert to json
	Json::Value jsonCoords = currentCoords.ToJSON();
	// set in settings
	SettingManager::GetInstance().SetPositionButton(buttonNumber, jsonCoords);
	return true;
}

bool MillDaemon::HasNonzeroWCS() const noexcept {
	auto machine = m_pConnector->GetNoLockConnection();
	if (!machine) { return false; }
	
	auto offsets = machine->GetOffsets();
	if (offsets.size() == 0) { return false; }
	for (auto& offset: offsets) {
		if ((offset.first[0] != 'G' || offset.first[1] != '5')) { continue; }
		else if (offset.first == "G59") { continue; }	// Treat G59 as special register for intentional carry-over between jobs
		if (offset.second.x != 0.0f) { return true; }
		if (offset.second.y != 0.0f) { return true; }
		if (offset.second.z != 0.0f) { return true; }
	}

	return false;
}

bool MillDaemon::AllowWcsClearPrompt() const noexcept {
	if (!m_pJob) { return true; }
	return m_pJob->AllowWcsClearPrompt();
}

void MillDaemon::ClearG54ThroughG58(const bool allowRetry) const noexcept {
	auto machine = m_pConnector->GetNoLockConnection();
	if (!machine) { MILL_LOG("Offset clearing failed."); return; }

	auto lock = machine->GetLock();
	try {
		auto offsets = machine->GetOffsets();
		if (offsets.size() == 0) { MILL_LOG("Offset clearing failed."); return; }

		// Iterate over G54 - G58 and clear each register individually if it's non-zero
		for (auto& offset : offsets) {
			if ((offset.first[0] != 'G' || offset.first[1] != '5')
				|| offset.first == "G59"	// Treat G59 as special register for intentional carry-over between jobs
				|| offset.second == Point3{}) {
				continue;
			}
			else {
				auto zeroOutWcsCommand = "G10 L2 P"s;
				zeroOutWcsCommand += offset.first[2] - 3;	// G54 through G59 correspond to P1 through P6
				zeroOutWcsCommand += " X0 Y0 Z0";
				machine->ExecuteCommand(GCodeLine{ zeroOutWcsCommand });
			}
		}
	}
	catch (std::exception e) {
		MILL_LOG("Exception thrown while clearing WCS values: "s + e.what());
		if (allowRetry) {
			machine->ExecuteCommand(GCodeLine{ "$X"s });
			ClearG54ThroughG58(false);
		}
	}

}

string MillDaemon::WcsValueCheck() const noexcept {
	if (!m_pJob) { return ""; }

	auto valueChecks = m_pJob->WcsValueChecks();
	if (valueChecks.size() == 0) { return ""; }

	auto machine = m_pConnector->GetNoLockConnection();
	if (!machine) { return ""; }

	auto offsets = machine->GetOffsets();
	if (offsets.size() == 0) { return ""; }

	for (auto& check: valueChecks) {
		auto it = find_if(offsets.begin(), offsets.end(), [ check ] (auto& offPair) { return stoi(offPair.first.substr(1)) == check.first; });
		if (it == offsets.end()) { continue; }

		auto& point = it->second;
		auto diff = point - check.second;
		auto reportingPrecision = 0.001f;	// Give latitude for floating point imprecision
		if (abs(diff.x) > reportingPrecision || abs(diff.y) > reportingPrecision || abs(diff.z) > reportingPrecision) {
			return m_pJob->WcsCheckFailedMessage();
		}
	}
	return "";
}

//////////////////////////////////////////////////////
// Firmware
//////////////////////////////////////////////////////

bool MillDaemon::need_to_set_eeprom_versions(const AvailableFirmware& upgrade) noexcept(false)
{
	tl::optional<FirmwareVersion> installed_firmware = m_pFirmwareUpdater->GetInstalledFirmware();
	if (!installed_firmware.has_value()) {
		throw std::runtime_error("Missing installed firmware version");
	}

	const auto EEPROMNotSet = installed_firmware.value().GetYMD() <= "20200307";
	const auto firmwareHasNewLogic = upgrade.GetYMD() >= "20200512";
	const auto setEEPROM = EEPROMNotSet && firmwareHasNewLogic;

	return setEEPROM;
}

bool MillDaemon::UploadFirmware(const AvailableFirmware& firmware)
{
	MILL_LOG("Uploading firmware " + firmware.VERSION);

	try {
		if (!firmware.FILE_328P.empty())
		{
			std::thread uploadThread(
				[this, firmware]() {
					try {
						auto pConnection = m_pConnector->GetConnection();
						FirmwareManager::GetInstance().UploadFirmware(
							pConnection,
							firmware.FILE_32M1.empty() ? tl::nullopt : tl::make_optional(URL(firmware.FILE_32M1)),
							URL(firmware.FILE_328P)
						);

						m_pFirmwareUpdater->ResetFirmware();

						pConnection->Reconnect();

						auto lock = pConnection->GetLock();

						// Clears and restores all of the EEPROM data used by Grbl.
						// This includes $$ settings, $# parameters, $N startup lines, and $I build info string.
						// Note that this doesn't wipe the entire EEPROM, only the data areas Grbl uses.
						pConnection->ExecuteCommand(GCodeLine("$RST=*"));

						if (need_to_set_eeprom_versions(firmware)) {
							if (pConnection->IsConnected()) {
								pConnection->ExecuteCommand(GCodeLine{ "$90=96" });
								pConnection->ExecuteCommand(GCodeLine{ "$92=97" });
							}
						}

					} catch (std::exception&) { }
				}
			);
			uploadThread.detach();

			return true;
		}
    } catch (...) {
	}

	return false;
}

bool MillDaemon::UploadCustomFirmware(const string& path328P, const string& path32M1) {
	MILL_LOG("Uploading custom firmware.");

	try {
		if (!path328P.empty()) {
			std::thread uploadThread(
				[ this, path32M1, path328P ] () {
				try {
					auto pConnection = m_pConnector->GetConnection();
					FirmwareManager::GetInstance().UploadCustomFirmware(pConnection, path32M1, path328P);

					m_pFirmwareUpdater->ResetFirmware();

					pConnection->Reconnect();

					auto lock = pConnection->GetLock();

					// Clears and restores all of the EEPROM data used by Grbl.
					// This includes $$ settings, $# parameters, $N startup lines, and $I build info string.
					// Note that this doesn't wipe the entire EEPROM, only the data areas Grbl uses.
					pConnection->ExecuteCommand(GCodeLine("$RST=*"));

					if (pConnection->IsConnected()) {
						pConnection->ExecuteCommand(GCodeLine{ "$90=96" });
						pConnection->ExecuteCommand(GCodeLine{ "$92=97" });
					}
				}
				catch (std::exception&) { return false; }
			}
			);
			uploadThread.detach();

			return true;
		}
	}
	catch (...) { return false; }
}

int MillDaemon::GetFirmwareUploadStatus() const
{
	return FirmwareManager::GetInstance().GetFirmwareUploadStatus();
}

tl::optional<FirmwareVersion> MillDaemon::GetFirmwareVersion() const
{
    return m_pFirmwareUpdater->GetInstalledFirmware();
}

std::vector<AvailableFirmware> MillDaemon::GetAvailableFirmwareUpdates() const
{
    return m_pFirmwareUpdater->GetAvailableFirmware();
}

bool MillDaemon::FirmwareUpdateAvailable() const noexcept
{
    return m_pFirmwareUpdater->IsUpdateAvailable();
}

bool MillDaemon::FirmwareMeetsMinimumVersion() const noexcept {
	if (!m_pJob) { return true; }
	const auto& minVersion = m_pJob->GetMinFirmwareVersion();

	tl::optional<FirmwareVersion> installed_firmware = m_pFirmwareUpdater->GetInstalledFirmware();
	if (!installed_firmware.has_value()) {
		return true;
	}

	return minVersion <= installed_firmware.value().GetYMD();
}

bool MillDaemon::CRWriteMeetsMinimumVersion(const string& version) const noexcept {
	if (!m_pJob) { return true; }

	try {
		auto currentVersion = StringUtil::Split(version, ".");
		auto targetVersion = StringUtil::Split(m_pJob->GetMinimumCRWriteVersion(), ".");

		for (auto i = 0; i < currentVersion.size() && i < targetVersion.size(); ++i) {
			if (stoi(currentVersion[i]) < stoi(targetVersion[i])) { return false; }
		}
		return true;
	}
	catch (std::exception e) {
		MILL_LOG("Error processing CRWrite Minimum version check.");
		return false;
	}
}

//////////////////////////////////////////////////////
// Walkthroughs
//////////////////////////////////////////////////////

bool MillDaemon::ShouldWalkthroughDisplay(const EWalkthroughType& walkthroughType) const
{
	return SettingManager::GetInstance().GetShowWalkthrough(walkthroughType);
}

void MillDaemon::SetShowWalkthrough(const EWalkthroughType& walkthroughType, const bool show)
{
	SettingManager::GetInstance().SetShowWalkthrough(walkthroughType, show);
}


//////////////////////////////////////////////////////
// Miscellaneous
//////////////////////////////////////////////////////

CustSupportService::Response MillDaemon::SendCustomerSupportRequest(
	const std::string& name,
	const std::string& email,
	const std::string& message,
	const std::string& version,
	const bool includeLogs) const
{

	CustSupportService::Response response;
	response.success = false;

	if (name.empty()) {
		response.errors.insert({ "name", "Name field is required." });
		return response;
	}
	else if (email.empty()) {
		response.errors.insert({ "email", "E-mail address field is required." });
		return response;
	}

	try
	{
		CustSupportService::Request request;
		request.name = name;
		request.email = email;
		request.description = message;
		request.cr_version = version;

		auto firmware = Json::Value{ };
		auto machine = m_pConnector->GetNoLockConnection();
		if (!machine) {
			firmware = "No machine connected."s;
		}
		else {
			auto& firmManager = FirmwareManager::GetInstance();
			auto firmVersion = firmManager.GetFirmwareVersion(machine->GetCNCMill(), *machine->GetSerial());
			firmware = firmVersion.ToJSON();
		}
		request.firmware = firmware;

		if (includeLogs) {
			request.log_text = MillLogger::ReadLog();
		} else {
			request.log_text = "<NO LOGS INCLUDED>";
		}

		return CustSupportService::Invoke(request);
	}
	catch(...)
	{
		CustSupportService::Response response;
		response.success = false;
		response.errors.insert({ "NET_ERROR", "Unable to connect." });
		return response;
	}
}

std::string MillDaemon::GetLogPath() const
{
	MillLogger::Flush();
	return MillLogger::GetLogPath();
}

RealTimeStatusPtr MillDaemon::GetStatus()
{
	auto pConnection = m_pConnector->GetConnection();
	if (pConnection != nullptr)
	{
		try
		{
			return pConnection->QueryStatus();
		}
		catch (MillException& e)
		{
			CR_LOG_F("GetStatus error: %s", e.what());
		}
		catch (...)
		{
			MILL_LOG("GetStatus error: Unknown error");
		}
	}

	return nullptr;
}

void MillDaemon::Jog(const EJogDirection direction, const bool continuous, const double distance_mm) noexcept
{
	auto pConnection = m_pConnector->GetConnection();
	if (pConnection != nullptr)
	{
		::Jog(pConnection, direction, continuous, distance_mm);
	}
}

void MillDaemon::CancelJog() noexcept
{
	auto pConnection = m_pConnector->GetConnection();
	if (pConnection != nullptr)
	{
		StopJogging(pConnection);
	}
	else {
		MILL_LOG("Failed to stop jogging. Connection unavailable.");
	}
}

JogKeys MillDaemon::GetJogKeys() const
{
	return SettingManager::GetInstance().GetJogKeys();
}

void MillDaemon::SetJogKeys(const JogKeys& jogKeys)
{
	SettingManager::GetInstance().SetJogKeys(jogKeys);
}

void MillDaemon::ExecuteCommand(const std::string& command) noexcept
{
	try
	{
		if (command == "!"s || command == "~"s || command == "|"s) {
			auto cnc = m_pConnector->GetNoLockConnection();
			if (!cnc) { return; }
			cnc->ExecuteRealtime(command[0]);
			return;
		}
		else {
			auto pConnection = m_pConnector->GetConnection();
			if (pConnection == nullptr) { return; }
			pConnection->ExecuteCommand(GCodeLine{ command }, true);
		}
			
	}
	catch (std::exception& e)
	{
		MillDisplayManager::AddLine(ELineType::ERR, StringUtil::Format("ExecuteCommand error: %s", e.what()));
		CR_LOG_F("ExecuteCommand error: %s", e.what());
	}
	catch (...)
	{
		MILL_LOG("ExecuteCommand error: Unknown error");
	}
}

void MillDaemon::ExecuteRealtime(const uint8_t command)
{
	auto pConnection = m_pConnector->GetConnection();
	if (pConnection != nullptr)
	{
		try
		{
			pConnection->ExecuteRealtime(command);
		}
		catch (MillException & e)
		{
			CR_LOG_F("ExecuteRealtime error: %s", e.what());
		}
		catch (...)
		{
			MILL_LOG("ExecuteRealtime error: Unknown error");
		}
	}
}

//////////////////////////////////////////////////////
// Navigation
//////////////////////////////////////////////////////

std::vector<Operation::Ptr> MillDaemon::GetAllSteps() const
{
	if (m_pJob != nullptr)
	{
		return m_pJob->GetOperations();
	}

	return std::vector<Operation::Ptr>();
}

Operation::Ptr MillDaemon::GetStep(const int stepIndex) const
{
	if (m_pJob != nullptr)
	{
		return m_pJob->GetOperation(stepIndex);
	}

	return nullptr;
}

bool MillDaemon::StartMilling(const int stepIndex)
{
	MillDisplayManager::Clear();
	auto machine = m_pConnector->GetNoLockConnection();
	return m_pMillingManager->MillOperationAsync(machine, m_pCRFile, m_pJob, stepIndex);
}

bool MillDaemon::RunManualGCodeFile(const string& filePath)
{ 
	if (m_pMillingManager->InProgress()) { return false; }
	MillDisplayManager::Clear();
	auto codeFile = FilePathToGCode(filePath);
	auto machine = m_pConnector->GetNoLockConnection();
	return m_pMillingManager->RunAsyncGCodeBatch(machine, codeFile.DestructivelyExtractFile());
}

std::vector<std::string> MillDaemon::GetManualGCodeFileLines(const std::string& filePath)
{
	return FilePathToLineSegments(filePath);
}

MillingStatus MillDaemon::GetMillingStatus(const bool clearError)
{
	auto machine = m_pConnector->GetNoLockConnection();
	return m_pMillingManager->GetMillingStatus(machine, clearError);
}

std::vector<std::pair<ELineType, std::string>> MillDaemon::GetReadWrites() const
{
	return MillDisplayManager::GetLines();
}

bool MillDaemon::EmergencyStop() const
{
	MILL_LOG("Emergency Stop pressed!");

	auto pConnection = m_pConnector->GetNoLockConnection();
	if (pConnection != nullptr && pConnection->IsConnected())
	{
		pConnection->EmergencyStop();
		return true;
	}

	return false;
}

bool MillDaemon::InstallDrivers() const
{
    return Drivers::InstallDrivers();
}
