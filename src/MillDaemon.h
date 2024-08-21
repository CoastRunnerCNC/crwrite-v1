#pragma once
#include "Common/CommonHeaders.h"
#include <Settings/Setting.h>
#include <Settings/WalkthroughType.h>
#include <Settings/JogKeys.h>
#include <Files/CRFile.h>
#include <Files/job.h>
#include <Mill/Firmware/FirmwareUpdater.h>
#include <Mill/Firmware/FirmwareVersion.h>
#include <Mill/MillFinder.h>
#include <Mill/Display/LineType.h>
#include <Mill/GRBL/Status/RealTimeStatus.h>
#include <Mill/GRBL/Jogging/JogDirection.h>
#include <Mill/Status/ConnectionStatus.h>
#include <Mill/MillConnector.h>
#include <Mill/GRBL/Settings/MillSettings.h>
#include <Mill/Status/MillingStatus.h>
#include <Mill/MillingManager.h>
#include <Services/FirmwareUpdateService.h>
#include <Services/CustSupportService.h>

/*
* Daemon that runs in the background and provides an API for the front-end electron application to communicate with.
*/
class MillDaemon
{
public:
	//////////////////////////////////////////////////////
	// Daemon
	//////////////////////////////////////////////////////

	// Gets the singleton instance of the daemon.
	static MillDaemon& GetInstance();
	~MillDaemon();

	void Initialize();

	void Shutdown();



	//////////////////////////////////////////////////////
	// CRFile
	//////////////////////////////////////////////////////

	// Gets the currently selected .crproj file.
	std::shared_ptr<CRFile> GetCRFile() const noexcept { return m_pCRFile; }

	// Sets the currently selected .crproj file to the given path. Returns error if unsuccessful.
	tl::optional<std::string> SetCRFile(const std::string& crFilePath);
	bool CreateNewCRFile(const std::string& fileName, const std::string& path);
	bool AddNewFileToCRFile(const std::string& filepath, const std::string& fileType);
	bool ExtractAdditionalCRContentsIntoDirectory(const std::string& destination) const noexcept;
	bool HasAdditionalContent() const noexcept;
	void ExportMachineOutput(std::string filepath, std::string output);

	// Returns true if the .crproj file has at least one job.
	bool IsValidCRFile(const std::string& crFilePath) const;

	// Creates blank operation from UI edit mode and writes to disk
	void AddNewOperation(const int stepIndex);

	// Used to set new user inputed operations values to memory and disk.
	void SetNewOperationsValues(const std::map<std::string, std::string> newOperationValues, int stepIndex);
	
	void DeleteOperation(const int stepIndex);

	void MoveOperation(const int prevStepIndex, const int nextStepIndex);

	//////////////////////////////////////////////////////
	// Coast Runner
	//////////////////////////////////////////////////////

	// Gets the status of the connection to the CNCMill.
	ECNCMillStatus GetCNCMillStatus() const noexcept { return m_pConnector->GetStatus(); }

	// Searches for CNCMills connected through USB.
	std::list<CNCMill> GetAvailableCNCMills() const noexcept { return m_pConnector->GetAvailableCNCMills(); }

	// Sets the selected CNCMill. Returns true if successful.
	bool SetSelectedCNCMill(const CNCMill& cncMill) noexcept;

	// Determines if the given CNCMill is the selected one.
	bool IsSelectedCNCMill(const CNCMill& cncMill) const noexcept { return m_pConnector->IsSelectedCNCMill(cncMill); }

	MillConnection::Ptr GetConnection() noexcept { return m_pConnector->GetConnection(); }

	tl::optional<SoftLimits> GetSoftLimits(const MillConnection::Ptr& pConnection) const;

	bool EstopEngaged() {
		auto cncmill = GetConnection();		// Null reference implies disconnected machine, not E-Stop
		return cncmill ? cncmill->EstopEngaged() : false;
	}

	//////////////////////////////////////////////////////
	// Jobs
	//////////////////////////////////////////////////////

	// Get all jobs
	// std::vector<Job> GetJobs() const { return m_pCRFile != nullptr ? m_pCRFile->GetJobs() : std::vector<Job>(); }
	std::vector<Job> GetJobs() const;
	// Get currently selected job
	Job* GetSelectedJob() const noexcept { return m_pJob; }

	// Set job selection
	void SelectJob(const size_t jobIndex);
	bool IsSubmanifestUsed();
	void AddNewJob(const std::string& jobName, const std::string& jobDescription, const int& jobIndex);
	bool GetWriteStatus();

	//////////////////////////////////////////////////////
	// FeedRate
	//////////////////////////////////////////////////////

	int GetFeedRate() const;

	bool SetFeedRate(const int feedRate);

	//////////////////////////////////////////////////////
	// Firmware
	//////////////////////////////////////////////////////

	// Begins uploading firmware to the CNCMill asynchronously.
	bool UploadFirmware(const AvailableFirmware& firmware);

	bool UploadCustomFirmware(const std::string& path328P, const std::string& path32M1);

	// The status of the firmware upload. 0-100 indicates the percentage completed. -1 indicates a failure during upload.
	int GetFirmwareUploadStatus() const;

	// Returns the firmware version of the currently connected CNCMill.
	tl::optional<FirmwareVersion> GetFirmwareVersion() const;

	// Checks for firmware updates, and returns all available updates for the user to choose.
	std::vector<AvailableFirmware> GetAvailableFirmwareUpdates() const;

	// Returns true if the newest published firmware version is better than what is installed on the selected machine
	bool FirmwareUpdateAvailable() const noexcept;

	// Returns false if and only if a minimum firmware version is specified and the machine does not meet that value
	bool FirmwareMeetsMinimumVersion() const noexcept;

	// Returns false if and only if a minimum CRWrite version is specified and the application does not meet that value
	bool CRWriteMeetsMinimumVersion(const std::string& version) const noexcept;

	//////////////////////////////////////////////////////
	// Settings
	//////////////////////////////////////////////////////

	bool GetEnableSlider() const;
	bool GetPauseAfterGCode() const;
	int GetMinFeedRate() const;
	int GetMaxFeedRate() const;
	bool GetDisableLimitCatch() const;
	bool GetShowEditButtonSetting() const;
	bool GetEnableEditButton() const;
	std::string GetPositionButton(const int buttonNumber) const;
	
	bool SetPositionButton(const int buttonNumber);

	// Replaces the currently saved settings with the ones passed in.
	bool UpdateSettings(const std::list<Setting>& settings) const;

	// Any errors result in a report of "false" 
	bool HasNonzeroWCS() const noexcept;

	// Returns false if manifest specifies skipping check to clear WCS registers
	bool AllowWcsClearPrompt() const noexcept;

	// Clear G54 - G58
	// G59 is considered a special register to transfer WCS offsets between jobs, so this may be desirable to keep
	// Other offsets may also be kept for certain projects for GCode compatibility mode (Ex. G28)
	// In other words, we may want to reset G54 - G58 without clearing ALL offsets with "RST=#" or "RST=*"
	void ClearG54ThroughG58(const bool allowRetry = true) const noexcept;

	// Check values stored in WCS registers against values specified the manifest file
	// An empty string indicates either a successful check or a failure to collect the necessary data
	// A non-empty string indicates failure with a message intended to be forwarded to the user
	// G59 is always ignored and is considered a special purpose register for carrying values across jobs
	std::string WcsValueCheck() const noexcept;

	//////////////////////////////////////////////////////
	// Navigation
	//////////////////////////////////////////////////////

	std::vector<Operation::Ptr> GetAllSteps() const;

	Operation::Ptr GetStep(const int stepIndex) const;

	bool StartMilling(const int stepIndex);
	bool RunManualGCodeFile(const std::string& filePath);
	bool RunManualGCodeString(const std::string& lines);
	std::vector<std::string> GetManualGCodeFileLines(const std::string& filePath);

	// Gets the status of the milling for the given step. 0-100 indicates the percentage completed. -1 indicates a failure during upload.
	MillingStatus GetMillingStatus(const bool clearError = false);

	std::vector<std::pair<ELineType, std::string>> GetReadWrites() const;

	// Software emergency stop; sends | command to GRBL controller
	bool EmergencyStop() const;

	//////////////////////////////////////////////////////
	// Walkthroughs
	//////////////////////////////////////////////////////

	// Determines if the given walkthrough should display. For example, if WalkthroughType == editor, this will return true if this is the first time using the editor.
	bool ShouldWalkthroughDisplay(const EWalkthroughType& walkthroughType) const;

	// Sets the given walkthrough as displayed, so it is not automatically displayed the next time the user takes the same action.
	void SetShowWalkthrough(const EWalkthroughType& walkthroughType, const bool show);



	//////////////////////////////////////////////////////
	// Miscellaneous
	//////////////////////////////////////////////////////

	// Sends a customer support request with the given message.
	CustSupportService::Response SendCustomerSupportRequest(
		const std::string& name,
		const std::string& email,
		const std::string& message,
		const std::string& version,
		const bool includeLogs
	) const;

	// Path to Log files
	std::string GetLogPath() const;

	// Get up-to-date machine status data
	RealTimeStatusPtr GetStatus();

	// Jog the machine
	void Jog(const EJogDirection direction, const bool continuous, const double distance_mm) noexcept;

	// Send cancel jog command to GRBL
	void CancelJog() noexcept;

	// Manage hotkeys for jogging
	JogKeys GetJogKeys() const;
	void SetJogKeys(const JogKeys& jogKeys);

	// Send a command to GRBL controller
	// Locking is done internally, so you shouldn't need to worry about coordinating threads
	void ExecuteCommand(const std::string& command) noexcept;

	// Send a real-time command to GRBL controller (?, ~, !, |)
	// Locking is done internally, so you shouldn't need to worry about coordinating threads
	void ExecuteRealtime(const uint8_t command);

	bool InstallDrivers() const;

	bool MillingInProgress() const noexcept { return m_pMillingManager->InProgress(); }
	void SetManualOperationFlag(const bool isInManualMode) { m_pMillingManager->SetManualOperationFlag(isInManualMode); }
	bool GetManualOperationFlag() { return m_pMillingManager->GetManualOperationFlag(); }

	std::unique_ptr<FirmwareUpdater>& GetFirmwareUpdaterRef() { return m_pFirmwareUpdater; }
private:
	using Clock = std::chrono::system_clock;
	using Time = Clock::time_point;
	using Lock = std::unique_lock<std::mutex>;

	MillDaemon();

	bool need_to_set_eeprom_versions(const AvailableFirmware& upgrade) noexcept(false);

	std::atomic_bool m_shutdown;
	std::shared_ptr<MillConnector> m_pConnector;
	std::unique_ptr<MillingManager> m_pMillingManager;
	std::unique_ptr<FirmwareUpdater> m_pFirmwareUpdater;

	int m_nextFirmwareUpdateId;
	CRFile::Ptr m_pCRFile;
	Job* m_pJob = nullptr;
	mutable std::mutex m_mutex;
};
