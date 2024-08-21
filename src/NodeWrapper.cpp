#include <NAPI/Services/CustomerSupportService.h>
#include <NAPI/Services/InitializeService.h>
#include <NAPI/Services/FirmwareUpdates.h>
#include <NAPI/NapiArgs.h>

// CRWrite Headers
#include "MillDaemon.h"
#include <Common/Logger.h>

#include <Common/Util/JsonUtil.h>
using namespace MillLogger;

// Adaptor that translates calls from Electron front-end to MillDaemon API
napi_value InitializeDaemon(napi_env env, napi_callback_info info)
{
	return std::make_shared<InitializeService>()->Invoke(env, info);
}

napi_value GetCRFile(napi_env env, napi_callback_info info)
{
	std::shared_ptr<CRFile> crFile = MillDaemon::GetInstance().GetCRFile();
	std::string path = crFile != nullptr ? crFile->GetPath() : "";

	return NapiString::Create(env, path).napi;
}

napi_value SetCRFile(napi_env env, napi_callback_info info)
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	tl::optional<std::string> error = MillDaemon::GetInstance().SetCRFile(args[0].ToString().Get());
	return NapiString::Create(env, error.value_or("")).napi;
}

napi_value CreateNewCRFile(napi_env env, napi_callback_info info)
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	std::string fileName = args[0].ToString().Get();
	std::string path = args[1].ToString().Get();
	MillDaemon::GetInstance().CreateNewCRFile(fileName, path);
	return NapiBool::Create(env, true).napi;
}

napi_value AddNewFileToCRFile(napi_env env, napi_callback_info info)
{
	bool result;
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	const std::string filepath = args[0].ToString().Get();
	const std::string fileType = args[1].ToString().Get();
	try
	{
		result = MillDaemon::GetInstance().AddNewFileToCRFile(filepath, fileType);
	}
	catch (const std::exception& expection)
	{
		result = false;
	}

	return NapiBool::Create(env, result).napi;
}

napi_value ExtractAdditionalCRContentsIntoDirectory(napi_env env, napi_callback_info info) {
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);

	std::string directory = args[0].ToString().Get();
	MILL_LOG("Node: " + directory);
	const bool valid = MillDaemon::GetInstance().ExtractAdditionalCRContentsIntoDirectory(directory);

	return NapiBool::Create(env, valid).napi;
}

napi_value HasAdditionalContent(napi_env env, napi_callback_info info) {
	try {
		return NapiBool::Create(env, MillDaemon::GetInstance().HasAdditionalContent()).napi;
	}
	catch (...) {
		return NapiBool::Create(env, false).napi;
	}
}

napi_value IsValidCRFile(napi_env env, napi_callback_info info)
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);

	std::string crFile = args[0].ToString().Get();
	const bool valid = MillDaemon::GetInstance().IsValidCRFile(crFile);

	return NapiBool::Create(env, valid).napi;
}

napi_value ExportMachineOutput(napi_env env, napi_callback_info info) {
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	const std::string filepath = args[0].ToString().Get();
	const std::string output = args[1].ToString().Get();

	MillDaemon::GetInstance().ExportMachineOutput(filepath, output);
	return NapiBool::Create(env, true).napi;
}

napi_value GetCNCMillStatus(napi_env env, napi_callback_info info)
{
	NapiObject result = NapiObject::Create(env);

	const MillingStatus millingStatus = MillDaemon::GetInstance().GetMillingStatus(false);
	result.SetBool("milling", millingStatus.GetStatus() == EMillingStatus::inProgress);
	
	ECNCMillStatus connection_status = MillDaemon::GetInstance().GetCNCMillStatus();
	if (millingStatus.GetError().has_value() && millingStatus.GetError().value().IsEStop() 
		&& MillDaemon::GetInstance().EstopEngaged()) {	// Cross-check E-stop since our logic is a bit wonky
		connection_status = ECNCMillStatus::connectionFailed;
	}

	result.SetInt32("connection_status", connection_status);

	if (millingStatus.GetProgress().has_value()) {
		const Progress& progress = millingStatus.GetProgress().value();

		NapiObject progressObj = NapiObject::Create(env);
		progressObj.SetUInt32("percentage", progress.GetPercentage());
		progressObj.SetUInt32("completed", progress.GetCompleted());
		progressObj.SetUInt32("total", progress.GetTotal());
		result.Set("progress", progressObj.napi);
	}

	if (millingStatus.GetError().has_value()) {
		MillingError error = millingStatus.GetError().value();

		NapiObject errorObj = NapiObject::Create(env);
		errorObj.SetString("title", error.title);
		errorObj.SetString("description", error.description);
		errorObj.SetBool("retry_step", error.AllowRetry());
		result.Set("error", errorObj.napi);
	}

	return result.napi;
}

napi_value GetAvailableCNCMills(napi_env env, napi_callback_info info)
{
	const auto& daemon = MillDaemon::GetInstance();
	const std::list<CNCMill> availableCNCMills = daemon.GetAvailableCNCMills();

	NapiArray cncMillsArray = NapiArray::Create(env, availableCNCMills.size());

	int i = 0;
	for (auto iter = availableCNCMills.cbegin(); iter != availableCNCMills.cend(); iter++) {
		const CNCMill cncMill = *iter;

		NapiObject cncMillObj = NapiObject::Create(env);
		cncMillObj.SetString("serial_number", cncMill.GetSerialNumber());
		cncMillObj.SetString("path", cncMill.GetPath());
		cncMillObj.SetBool("selected", daemon.IsSelectedCNCMill(cncMill));
		cncMillsArray.Set(i++, cncMillObj.napi);
	}

	return cncMillsArray.napi;
}

// REQUEST:
// 0. path - str
// 1. serialNumber - str
napi_value SelectCNCMill(napi_env env, napi_callback_info info)
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);

	const CNCMill cnc(
		args[0].ToString().Get(),
		args[1].ToString().Get()
	);

	const bool selected = MillDaemon::GetInstance().SetSelectedCNCMill(cnc);

	return NapiBool::Create(env, selected).napi;
}

napi_value GetMachineConfig(napi_env env, napi_callback_info info)
{
	auto& daemon = MillDaemon::GetInstance();

	auto pConnection = daemon.GetConnection();
	if (pConnection != nullptr)
	{
		NapiObject config = NapiObject::Create(env);

		MillSettings settings = pConnection->GetSettings(false);
		std::string unit = settings.GetUnit() == Measurement::Unit::MM ? "mm" : "inch";
		config.SetString("units", unit);

		auto softLimitsOpt = settings.GetSoftLimits();
		if (softLimitsOpt.has_value())
		{
			config.SetString("soft_limits", JsonUtil::ToString(softLimitsOpt.value().ToJSON()));
		}

		return config.napi;
	}

	return nullptr;
}

napi_value GetJobs(napi_env env, napi_callback_info info)
{
	const std::vector<Job> jobs = MillDaemon::GetInstance().GetJobs();

	NapiArray jobsArray = NapiArray::Create(env, jobs.size());

	for (size_t i = 0; i < jobs.size(); i++)
	{
		NapiObject jobObj = NapiObject::Create(env);
		jobObj.SetString("title", jobs[i].GetTitle());
		jobObj.SetString("prompt", jobs[i].GetPrompt());
		jobsArray.Set(i, jobObj.napi);
	}

	return jobsArray.napi;
}

napi_value SelectJob(napi_env env, napi_callback_info info)
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);

	MillDaemon::GetInstance().SelectJob(
		args[0].ToInt32().Get()
	);

	return NapiBool::Create(env, true).napi;
}

napi_value IsSubmanifestUsed(napi_env env, napi_callback_info info)
{
	return NapiBool::Create(env, MillDaemon::GetInstance().IsSubmanifestUsed()).napi;
}

napi_value GetAllSteps(napi_env env, napi_callback_info info)
{
	const std::vector<Operation::Ptr> steps = MillDaemon::GetInstance().GetAllSteps();

	NapiArray stepsArray = NapiArray::Create(env, steps.size());

	for (size_t i = 0; i < steps.size(); i++)
	{
		NapiObject stepObj = NapiObject::Create(env);
		stepObj.SetString("Title", steps[i]->GetTitle());
		MILL_LOG("Return title: " + steps[i]->GetTitle());
		stepsArray.Set(i, stepObj.napi);
	}

	return stepsArray.napi;
}

napi_value GetStep(napi_env env, napi_callback_info info)
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	const int32_t stepIndex = args[0].ToInt32().Get();

	const auto& daemon = MillDaemon::GetInstance();
	Operation::Ptr pOperation = daemon.GetStep(stepIndex);
	if (pOperation != nullptr)
	{
		NapiObject stepObj = NapiObject::Create(env);
		stepObj.SetString("Title", pOperation->GetTitle());
		stepObj.SetString("Prompt", pOperation->GetPrompt());
		stepObj.SetString("Markdown", pOperation->GetMarkdown());
		stepObj.SetString("PopupText", pOperation->GetPopupText());
		stepObj.SetString("PopupTitle", pOperation->GetPopupTitle());
		stepObj.SetString("Unskippable", pOperation->GetUnskippable());
		stepObj.SetUInt32("PopupWaitTime", pOperation->GetPopupWaitTime());
		stepObj.SetString("GoToStep", pOperation->GetGoTo());
		stepObj.SetString("PopupYesStep", pOperation->GetPopupYesStep());
		stepObj.SetString("PopupNoStep", pOperation->GetPopupNoStep());

		try {
			if (pOperation->Load(daemon.GetCRFile()))
			{
				if (pOperation->HasGCodes())
				{
					//const GCodeFile& gcodeFile = pOperation->GetGCodeFile();

					NapiArray gCodeArr = NapiArray::Create(env, 0);

					//for (size_t i = 0; i < gcodeFile.getLines().size(); i++)
					//{
					//	NapiString gCodeStr = NapiString::Create(env, gcodeFile.getLines()[i].GetOriginal());
					//	gCodeArr.Set(i, gCodeStr.napi);
					//}

					stepObj.Set("GCode", gCodeArr.napi);

					// After looking at the above code inside the if (pOperation->HasGCodes()), I think it can be removed. Not sure.

					stepObj.SetString("RawGCode", pOperation->GetRawGCode());
					stepObj.SetString("GCodePath", pOperation->GetFile());
				}
				else
				{
					std::vector<Operation::Ptr> steps = daemon.GetAllSteps();
					bool unskippableFound = false;
					for (size_t i = stepIndex + 1; i < steps.size(); i++)
					{
						Operation::Ptr pStep = steps[i];
						if (pStep->Load(daemon.GetCRFile()))
						{
							MILL_LOG(pStep->GetTitle() + " " + pStep->GetUnskippable());
							if (pStep->GetUnskippable() == "true" && !unskippableFound)
							{
								unskippableFound = true;
								stepObj.SetUInt32("next_unskippable_step", i);
							}
							if (pStep->HasGCodes())
							{
								stepObj.SetUInt32("next_milling_step", i);
								break;
							}
						}
					}
				}

				if (pOperation->GetImage().size() > 0)
				{
					stepObj.SetString("ImagePath", pOperation->GetImage());
					stepObj.SetString("Image", pOperation->GetImageBase64());
				}
			}
		}
		catch (const std::exception& expection)
		{
			stepObj.SetString("Error", "CRWrite failed to load image from file path.");
		}
		return stepObj.napi;
	}
	else
	{
		return NapiValue::CreateNull(env).napi;
	}
}

napi_value SetStepValues(napi_env env, napi_callback_info info) 
{
	MillDaemon& daemon = MillDaemon::GetInstance();
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	NapiObject napiObj(env, args[0].napi);
	NapiArray napiKeyArray(env, args[1].napi);
	NapiInt32 stepIndex(env, args[2].napi);
	std::map<std::string, std::string> newOperationsValues;

	size_t keyArrayLength = napiKeyArray.GetLength();
	for (int x = 0; x < keyArrayLength; ++x)
	{
		std::string currentKey = napiKeyArray.Get(x).ToString().Get();
		newOperationsValues.insert(std::make_pair(currentKey, napiObj.GetString(currentKey).Get()));
	}
	daemon.SetNewOperationsValues(newOperationsValues, stepIndex.Get());
	
	return NapiBool::Create(env, true).napi;
}

napi_value AddNewOperation(napi_env env, napi_callback_info info)
{
	MillDaemon& daemon = MillDaemon::GetInstance();
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	NapiInt32 stepIndex(env, args[0].napi);	
	MILL_LOG("running AddNewOperation");
	daemon.AddNewOperation(stepIndex.Get());
	MILL_LOG("Finished AddNewOperation");
	return NapiBool::Create(env, true).napi;
}

napi_value DeleteOperation(napi_env env, napi_callback_info info)
{
	MillDaemon& daemon = MillDaemon::GetInstance();
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	const int32_t stepIndex = args[0].ToInt32().Get();
	daemon.DeleteOperation(stepIndex);
	return NapiBool::Create(env, true).napi;
}

napi_value MoveOperation(napi_env env, napi_callback_info info)
{
	MillDaemon& daemon = MillDaemon::GetInstance();
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	const int32_t prevStepIndex = args[0].ToInt32().Get();
	const int32_t nextStepIndex = args[1].ToInt32().Get();
	daemon.MoveOperation(prevStepIndex, nextStepIndex);
	return NapiBool::Create(env, true).napi;
}

napi_value AddNewJob(napi_env env, napi_callback_info info)
{
	MillDaemon& daemon = MillDaemon::GetInstance();
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	const std::string jobName = args[0].ToString().Get();
	const std::string jobDescription = args[1].ToString().Get();
	const int32_t jobIndex = args[2].ToInt32().Get();

	daemon.AddNewJob(jobName, jobDescription, jobIndex);
	return NapiBool::Create(env, true).napi;
}

napi_value GetWriteStatus(napi_env env, napi_callback_info info)
{
	bool writeInProgress = MillDaemon::GetInstance().GetWriteStatus();
	return NapiBool::Create(env, writeInProgress).napi;
}

napi_value StartMilling(napi_env env, napi_callback_info info)
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);

	const int32_t stepIndex = args[0].ToInt32().Get();
	const bool millingStarted = MillDaemon::GetInstance().StartMilling(stepIndex);

	return NapiBool::Create(env, millingStarted).napi;
}

napi_value RunManualGCodeFile(napi_env env, napi_callback_info info)
{ 
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	std::string filePath = args[0].ToString().Get();
	const bool millingStarted = MillDaemon::GetInstance().RunManualGCodeFile(filePath);
	return NapiBool::Create(env, millingStarted).napi;
}

napi_value RunManualGCodeString(napi_env env, napi_callback_info info)
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	std::string gcodeString = args[0].ToString().Get();
	const bool millingStarted = MillDaemon::GetInstance().RunManualGCodeString(gcodeString);
	return NapiBool::Create(env, millingStarted).napi;
}

napi_value GetManualGCodeFileLines(napi_env env, napi_callback_info info) 
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	std::string filePath = args[0].ToString().Get();

	std::vector<std::string> GCodeLines = MillDaemon::GetInstance().GetManualGCodeFileLines(filePath);
	NapiArray returnArray = NapiArray::Create(env, GCodeLines.size());

	for (size_t x = 0; x < GCodeLines.size(); ++x)
	{
		NapiString line = NapiString::Create(env, GCodeLines[x]);
		returnArray.Set(x, line.napi);
	}

	return returnArray.napi;
}

napi_value GetMillingStatus(napi_env env, napi_callback_info info)
{
	const MillingStatus millingStatus = MillDaemon::GetInstance().GetMillingStatus(true);

	NapiObject result = NapiObject::Create(env);
	result.SetBool("milling", millingStatus.GetStatus() == EMillingStatus::inProgress);

	if (millingStatus.GetProgress().has_value()) {
		const Progress& progress = millingStatus.GetProgress().value();

		NapiObject progressObj = NapiObject::Create(env);
		progressObj.SetUInt32("percentage", progress.GetPercentage());
		progressObj.SetUInt32("completed", progress.GetCompleted());
		progressObj.SetUInt32("total", progress.GetTotal());
		result.Set("progress", progressObj.napi);
	}

	if (millingStatus.GetError().has_value()) {
		MillingError error = millingStatus.GetError().value();

		NapiObject errorObj = NapiObject::Create(env);
		errorObj.SetString("title", error.title);
		errorObj.SetString("description", error.description);
		errorObj.SetBool("retry_step", error.AllowRetry());
		result.Set("error", errorObj.napi);
	}

	return result.napi;
}

napi_value EmergencyStop(napi_env env, napi_callback_info info)
{
	MillDaemon::GetInstance().EmergencyStop();
	return nullptr;
}

napi_value GetReadWrites(napi_env env, napi_callback_info info)
{
	const std::vector<std::pair<ELineType, std::string>> readWrites = MillDaemon::GetInstance().GetReadWrites();

	NapiArray readWriteArr = NapiArray::Create(env, readWrites.size());
	for (size_t i = 0; i < readWrites.size(); i++)
	{
		const std::string lineType = LineType::ToString(readWrites[i].first);

		NapiObject readWriteObj = NapiObject::Create(env);
		readWriteObj.SetString("TYPE", lineType);
		readWriteObj.SetString("VALUE", readWrites[i].second);

		readWriteArr.Set(i, readWriteObj.napi);
	}

	return readWriteArr.napi;
}

napi_value GetSettings(napi_env env, napi_callback_info info)
{
	const auto& daemon = MillDaemon::GetInstance();

	NapiObject settingsObj = NapiObject::Create(env);
	settingsObj.SetBool("pauseAfterGCode", daemon.GetPauseAfterGCode());
	settingsObj.SetBool("enable_slider", daemon.GetEnableSlider());
	settingsObj.SetUInt32("maxFeedRate", daemon.GetMaxFeedRate());
	settingsObj.SetBool("disableLimitCatch", daemon.GetDisableLimitCatch());
	settingsObj.SetBool("showEditButtonSetting", daemon.GetShowEditButtonSetting());
	settingsObj.SetBool("enableEditButton", daemon.GetEnableEditButton());
	return settingsObj.napi;
}

napi_value GetJogKeys(napi_env env, napi_callback_info info)
{
	const auto& daemon = MillDaemon::GetInstance();
	const JogKeys jogKeys = daemon.GetJogKeys();

	NapiObject settingsObj = NapiObject::Create(env);
	settingsObj.SetString("gantry_left", jogKeys.m_gantryLeft);
	settingsObj.SetString("gantry_right", jogKeys.m_gantryRight);
	settingsObj.SetString("raise_table", jogKeys.m_raiseTable);
	settingsObj.SetString("lower_table", jogKeys.m_lowerTable);
	settingsObj.SetString("retract", jogKeys.m_retract);
	settingsObj.SetString("plunge", jogKeys.m_plunge);
	settingsObj.SetString("focus_manual_entry", jogKeys.m_focus_manual_entry);
	settingsObj.SetString("focus_max_distance", jogKeys.m_focus_max_distance);
	settingsObj.SetString("switch_units", jogKeys.m_switch_units);
	settingsObj.SetString("switch_jog_mode", jogKeys.m_switch_jog_mode);
	settingsObj.SetString("increase_units", jogKeys.m_increase_units);
	settingsObj.SetString("decrease_units", jogKeys.m_decrease_units);
	settingsObj.SetString("escape_textbox", jogKeys.m_escape_textbox);
	settingsObj.SetString("home_preset", jogKeys.m_home_preset);
	settingsObj.SetString("preset_1", jogKeys.m_preset_1);
	settingsObj.SetString("preset_2", jogKeys.m_preset_2);
	settingsObj.SetString("preset_3", jogKeys.m_preset_3);
	settingsObj.SetString("preset_4", jogKeys.m_preset_4);

	return settingsObj.napi;
}

napi_value SetJogKeys(napi_env env, napi_callback_info info)
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	NapiObject napiObj(env, args[0].napi);

	JogKeys jogKeys;
	jogKeys.m_gantryLeft = napiObj.GetString("gantry_left").Get();
	jogKeys.m_gantryRight = napiObj.GetString("gantry_right").Get();
	jogKeys.m_raiseTable = napiObj.GetString("raise_table").Get();
	jogKeys.m_lowerTable = napiObj.GetString("lower_table").Get();
	jogKeys.m_retract = napiObj.GetString("retract").Get();
	jogKeys.m_plunge = napiObj.GetString("plunge").Get();
	jogKeys.m_focus_manual_entry = napiObj.GetString("focus_manual_entry").Get();
	jogKeys.m_focus_max_distance = napiObj.GetString("focus_max_distance").Get();
	jogKeys.m_switch_units = napiObj.GetString("switch_units").Get();
	jogKeys.m_switch_jog_mode = napiObj.GetString("switch_jog_mode").Get();
	jogKeys.m_increase_units = napiObj.GetString("increase_units").Get();
	jogKeys.m_decrease_units = napiObj.GetString("decrease_units").Get();
	jogKeys.m_escape_textbox = napiObj.GetString("escape_textbox").Get();
	jogKeys.m_home_preset = napiObj.GetString("home_preset").Get();
	jogKeys.m_preset_1 = napiObj.GetString("preset_1").Get();
	jogKeys.m_preset_2 = napiObj.GetString("preset_2").Get();
	jogKeys.m_preset_3 = napiObj.GetString("preset_3").Get();
	jogKeys.m_preset_4 = napiObj.GetString("preset_4").Get();

	MillDaemon::GetInstance().SetJogKeys(jogKeys);

	return nullptr;
}

napi_value GetEnableSlider(napi_env env, napi_callback_info info)
{
	return NapiBool::Create(env, MillDaemon::GetInstance().GetEnableSlider()).napi;
}

napi_value GetPauseAfterGCode(napi_env env, napi_callback_info info)
{
	return NapiBool::Create(env, MillDaemon::GetInstance().GetPauseAfterGCode()).napi;
}

napi_value GetMinFeedRate(napi_env env, napi_callback_info info)
{
	return NapiUInt32::Create(env, MillDaemon::GetInstance().GetMinFeedRate()).napi;
}

napi_value GetMaxFeedRate(napi_env env, napi_callback_info info)
{
	return NapiUInt32::Create(env, MillDaemon::GetInstance().GetMaxFeedRate()).napi;
}

napi_value GetFeedRate(napi_env env, napi_callback_info info)
{
	return NapiUInt32::Create(env, MillDaemon::GetInstance().GetFeedRate()).napi;
}

napi_value GetDisableLimitCatch(napi_env env, napi_callback_info info)
{
	return NapiBool::Create(env, MillDaemon::GetInstance().GetDisableLimitCatch()).napi;
}

napi_value UpdateSettings(napi_env env, napi_callback_info info)
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);

	std::list<Setting> settings;

	NapiObject napiObj(env, args[0].napi);

	// Pause After GCode
	NapiValue pauseProp = napiObj.Get("pauseAfterGCode");
	if (pauseProp.IsBool())
	{
		Setting pauseSetting = { "pauseAfterGCode", NapiBool(env, pauseProp.napi).Get() ? "true" : "false" };
		settings.push_back(pauseSetting);
	}

	// Enable Slider
	NapiValue enableSliderProp = napiObj.Get("enable_slider");
	if (enableSliderProp.IsBool())
	{
		Setting enableSliderSetting = { "enable_slider", NapiBool(env, enableSliderProp.napi).Get() ? "true" : "false" };
		settings.push_back(enableSliderSetting);
	}

	// Max FeedRate
	NapiValue maxFeedRateProp = napiObj.Get("maxFeedRate");
	if (maxFeedRateProp.IsNumber())
	{
		Setting maxFeedRateSetting = { "maxFeedRate", std::to_string(maxFeedRateProp.ToUInt32().Get()) };
		settings.push_back(maxFeedRateSetting);
	}

	// Disable Soft Limit Catch Alert
	NapiValue disableLimitCatchProp = napiObj.Get("disableLimitCatch");
	if (disableLimitCatchProp.IsBool())
	{
		Setting disableLimitCatch = { "disableLimitCatch", NapiBool(env, disableLimitCatchProp.napi).Get() ? "true" : "false" };
		settings.push_back(disableLimitCatch);
	}

	NapiValue enableEditButtonProp = napiObj.Get("enableEditButton");
	if (enableEditButtonProp.IsBool())
	{
		Setting enableEditButton = { "enableEditButton", NapiBool(env, enableEditButtonProp.napi).Get() ? "true" : "false" };
		settings.push_back(enableEditButton);
	}

	MillDaemon::GetInstance().UpdateSettings(settings);

	return nullptr;
}

napi_value HasNonzeroWCS(napi_env env, napi_callback_info info) {
	return NapiBool::Create(env, MillDaemon::GetInstance().HasNonzeroWCS()).napi;
}

napi_value AllowWcsClearPrompt(napi_env env, napi_callback_info info) {
	return NapiBool::Create(env, MillDaemon::GetInstance().AllowWcsClearPrompt()).napi;
}

napi_value ClearG54ThroughG58(napi_env env, napi_callback_info info) {
	MillDaemon::GetInstance().ClearG54ThroughG58();
	return nullptr;
}

napi_value WcsValueCheck(napi_env env, napi_callback_info info) {
	return NapiString::Create(env, MillDaemon::GetInstance().WcsValueCheck()).napi;
}

napi_value FirmwareMeetsMinimumVersion(napi_env env, napi_callback_info info) {
	return NapiBool::Create(env, MillDaemon::GetInstance().FirmwareMeetsMinimumVersion()).napi;
}

napi_value CRWriteMeetsMinimumVersion(napi_env env, napi_callback_info info) {
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	std::string input = args[0].ToString().Get();

	return NapiBool::Create(env, MillDaemon::GetInstance().CRWriteMeetsMinimumVersion(input)).napi;
}

napi_value SetFeedRate(napi_env env, napi_callback_info info)
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	MillDaemon::GetInstance().SetFeedRate(args[0].ToInt32().Get());
	return nullptr;
}

napi_value GetPositionButton(napi_env env, napi_callback_info info) {
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	int buttonNumber = args[0].ToInt32().Get();
	std::string coords = MillDaemon::GetInstance().GetPositionButton(buttonNumber);
	return NapiString::Create(env, coords).napi;
}

napi_value SetPositionButton(napi_env env, napi_callback_info info) {
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
	int buttonNumber = args[0].ToInt32().Get();
	
	MillDaemon::GetInstance().SetPositionButton(buttonNumber);
	return NapiBool::Create(env, true).napi;
}

napi_value UploadFirmware(napi_env env, napi_callback_info info)
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);

	NapiObject napiObj(env, args[0].napi);

	AvailableFirmware firmware;
	firmware.VERSION = napiObj.GetString("version").Get();
	firmware.DESCRIPTION = napiObj.GetString("description").Get();

	firmware.FILE_328P = napiObj.GetString("file_328p").Get();

	if (napiObj.HasProperty("file_32m1"))
	{
		firmware.FILE_32M1 = napiObj.GetString("file_32m1").Get();
	}

	const bool uploaded = MillDaemon::GetInstance().UploadFirmware(firmware);

	return NapiBool::Create(env, uploaded).napi;
}

napi_value UploadCustomFirmware(napi_env env, napi_callback_info info) {
	MILL_LOG("Loading custom firmware...");
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);

	auto path328p = args[0].ToString().Get();
	MILL_LOG("path328p: " + path328p);
	auto path32m1 = std::string{ };
	try {
		path32m1 = args[1].ToString().Get();
		MILL_LOG("path32m1: " + path32m1);
	}
	catch (...) {
		MILL_LOG("Error parsing file path.");
	}
	
	const bool uploaded = MillDaemon::GetInstance().UploadCustomFirmware(path328p, path32m1);

	return NapiBool::Create(env, uploaded).napi;
}

napi_value GetFirmwareUploadStatus(napi_env env, napi_callback_info info)
{
	return NapiInt32::Create(env, MillDaemon::GetInstance().GetFirmwareUploadStatus()).napi;
}

auto FirmwareUpdateAvailable(napi_env env, napi_callback_info info) -> napi_value
{
	return NapiBool::Create(env, MillDaemon::GetInstance().FirmwareUpdateAvailable()).napi;
}

napi_value GetFirmwareVersion(napi_env env, napi_callback_info info)
{
	Json::Value json;
	auto version = MillDaemon::GetInstance().GetFirmwareVersion();
	if (version.has_value()) {
		json = version.value().ToJSON();
	}

	return NapiString::Create(env, JsonUtil::ToString(json)).napi;
}

napi_value GetAvailableFirmwareUpdates(napi_env env, napi_callback_info info)
{
	return std::make_shared<FirmwareUpdatesService>()->Invoke(env, info);
}

napi_value SendCustomerSupportRequest(napi_env env, napi_callback_info info)
{
	return std::make_shared<CustomerSupportService>()->Invoke(env, info);
}

napi_value ShouldShowWalkthrough(napi_env env, napi_callback_info info)
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);

	const bool show = MillDaemon::GetInstance().ShouldWalkthroughDisplay(
		WalkthroughType::FromString(args[0].ToString().Get())
	);

	return NapiBool::Create(env, show).napi;
}

// REQUEST:
// 0. WalkthroughType - str
// 1. Show - bool
napi_value SetShowWalkthrough(napi_env env, napi_callback_info info)
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);

	MillDaemon::GetInstance().SetShowWalkthrough(
		WalkthroughType::FromString(args[0].ToString().Get()),
		args[1].ToBool().Get()
	);

	return nullptr;
}

napi_value GetLogPath(napi_env env, napi_callback_info info)
{
	return NapiString::Create(env, MillDaemon::GetInstance().GetLogPath()).napi;
}

napi_value LogString(napi_env env, napi_callback_info info) {
	try {
		MILL_LOG("Writing front-end log string...");
		std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);
		for (auto&& s : args) {
			MILL_LOG(s.ToString().Get());
		}
	}
	catch (...) { }
	return nullptr;
}

napi_value GetStatus(napi_env env, napi_callback_info info)
{
	auto status = MillDaemon::GetInstance().GetStatus();
	auto json = Json::Value{ };
	if (status != nullptr) {
		json["status"] = status->ToJSON();
	}
	else {
		json["error"] = "NO_STATUS"; // TODO: Determine error
	}
	return NapiString::Create(env, JsonUtil::ToString(json)).napi;
}

// REQUEST:
// 0. direction - str
// 1. distance - float
napi_value Jog(napi_env env, napi_callback_info info)
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);

	NapiObject criteria(env, args[0].napi);

	EJogDirection jogDirection = JogDirection::FromString(criteria.GetString("direction").Get());
	const bool continuous = criteria.GetBool("continuous").Get();
	const double distance_mm = criteria.GetDouble("distance_mm").Get();

	MillDaemon::GetInstance().Jog(jogDirection, continuous, distance_mm);

	return nullptr;
}

napi_value CancelJog(napi_env env, napi_callback_info info)
{
	MillDaemon::GetInstance().CancelJog();

	return nullptr;
}

napi_value ExecuteCommand(napi_env env, napi_callback_info info)
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);

	MillDaemon::GetInstance().ExecuteCommand(args[0].ToString().Get());

	return nullptr;
}

napi_value ExecuteRealtime(napi_env env, napi_callback_info info)
{
	std::vector<NapiValue> args = NapiArgs::GetArgs(env, info);

	MillDaemon::GetInstance().ExecuteRealtime((uint8_t)args[0].ToUInt32().Get());

	return nullptr;
}

napi_value SetManualEntryMode(napi_env env, napi_callback_info info)
{
	auto manualEntryMode = NapiArgs::GetArgs(env, info)[0].ToBool().Get();
	MillDaemon::GetInstance().SetManualOperationFlag(manualEntryMode);

	return nullptr;
}

auto InstallDrivers(napi_env env, napi_callback_info info) -> napi_value
{
	return NapiBool::Create(env, MillDaemon::GetInstance().InstallDrivers()).napi;
}

napi_value Shutdown(napi_env env, napi_callback_info info)
{
	CR_LOG_SYNC("Shutdown API called from node");
	MillDaemon::GetInstance().Shutdown();
	return nullptr;
}

#define DECLARE_NAPI_METHOD(name, func)                          \
  { name, 0, func, 0, 0, 0, napi_default, 0 }

napi_value Init(napi_env env, napi_value exports)
{
	//MillDaemon::GetInstance();

	napi_status status;

	std::vector<napi_property_descriptor> descriptors{
		DECLARE_NAPI_METHOD("Initialize", InitializeDaemon),
		DECLARE_NAPI_METHOD("Shutdown", Shutdown),

		DECLARE_NAPI_METHOD("GetCRFile", GetCRFile),
		DECLARE_NAPI_METHOD("SetCRFile", SetCRFile),
		DECLARE_NAPI_METHOD("CreateNewCRFile", CreateNewCRFile),
		DECLARE_NAPI_METHOD("AddNewFileToCRFile", AddNewFileToCRFile),
		DECLARE_NAPI_METHOD("ExtractAdditionalContentsInto", ExtractAdditionalCRContentsIntoDirectory),
		DECLARE_NAPI_METHOD("HasAdditionalContent", HasAdditionalContent),
		DECLARE_NAPI_METHOD("IsValidCRFile", IsValidCRFile),
		DECLARE_NAPI_METHOD("ExportMachineOutput", ExportMachineOutput),

		DECLARE_NAPI_METHOD("GetCNCMillStatus", GetCNCMillStatus),
		DECLARE_NAPI_METHOD("GetAvailableCNCMills", GetAvailableCNCMills),
		DECLARE_NAPI_METHOD("SelectCNCMill", SelectCNCMill),
		DECLARE_NAPI_METHOD("GetMachineConfig", GetMachineConfig),

		DECLARE_NAPI_METHOD("GetFeedRate", GetFeedRate),
		DECLARE_NAPI_METHOD("SetFeedRate", SetFeedRate),

		DECLARE_NAPI_METHOD("GetPositionButton", GetPositionButton),
		DECLARE_NAPI_METHOD("SetPositionButton", SetPositionButton),

		// Jobs & Operations
		DECLARE_NAPI_METHOD("GetJobs", GetJobs),
		DECLARE_NAPI_METHOD("SetSelectedJob", SelectJob),
		DECLARE_NAPI_METHOD("IsSubmanifestUsed", IsSubmanifestUsed),
		DECLARE_NAPI_METHOD("GetAllSteps", GetAllSteps),
		DECLARE_NAPI_METHOD("GetStep", GetStep),
		DECLARE_NAPI_METHOD("StartMilling", StartMilling),
		DECLARE_NAPI_METHOD("RunManualGCodeFile", RunManualGCodeFile),
		DECLARE_NAPI_METHOD("RunManualGCodeString", RunManualGCodeString),
		DECLARE_NAPI_METHOD("GetManualGCodeFileLines", GetManualGCodeFileLines),
		DECLARE_NAPI_METHOD("GetMillingStatus", GetMillingStatus),
		DECLARE_NAPI_METHOD("EmergencyStop", EmergencyStop),
		DECLARE_NAPI_METHOD("GetReadWrites", GetReadWrites),
		DECLARE_NAPI_METHOD("AddNewOperation", AddNewOperation),
		DECLARE_NAPI_METHOD("DeleteOperation", DeleteOperation),
		DECLARE_NAPI_METHOD("MoveOperation", MoveOperation),
		DECLARE_NAPI_METHOD("AddNewJob", AddNewJob),
		DECLARE_NAPI_METHOD("SetStepValues", SetStepValues),
		DECLARE_NAPI_METHOD("GetWriteStatus", GetWriteStatus),

		// Settings
		DECLARE_NAPI_METHOD("GetEnableSlider", GetEnableSlider),
		DECLARE_NAPI_METHOD("GetPauseAfterGCode", GetPauseAfterGCode),
		DECLARE_NAPI_METHOD("GetMinFeedRate", GetMinFeedRate),
		DECLARE_NAPI_METHOD("GetMaxFeedRate", GetMaxFeedRate),
		DECLARE_NAPI_METHOD("GetSettings", GetSettings),
		DECLARE_NAPI_METHOD("DisableLimitCatch", GetDisableLimitCatch),
		DECLARE_NAPI_METHOD("UpdateSettings", UpdateSettings),
		DECLARE_NAPI_METHOD("HasNonzeroWCS", HasNonzeroWCS),
		DECLARE_NAPI_METHOD("AllowWcsClearPrompt", AllowWcsClearPrompt),
		DECLARE_NAPI_METHOD("ClearG54ThroughG58", ClearG54ThroughG58),
		DECLARE_NAPI_METHOD("WcsValueCheck", WcsValueCheck),
		DECLARE_NAPI_METHOD("FirmwareMeetsMinimumVersion", FirmwareMeetsMinimumVersion),
		DECLARE_NAPI_METHOD("CRWriteMeetsMinimumVersion", CRWriteMeetsMinimumVersion),

		// Firmware
		DECLARE_NAPI_METHOD("UploadFirmware", UploadFirmware),
		DECLARE_NAPI_METHOD("UploadCustomFirmware", UploadCustomFirmware),
		DECLARE_NAPI_METHOD("GetFirmwareUploadStatus", GetFirmwareUploadStatus),
		DECLARE_NAPI_METHOD("FirmwareUpdateAvailable", FirmwareUpdateAvailable),
		DECLARE_NAPI_METHOD("GetFirmwareVersion", GetFirmwareVersion),
		DECLARE_NAPI_METHOD("GetAvailableFirmwareUpdates", GetAvailableFirmwareUpdates),

		// Support Center
		DECLARE_NAPI_METHOD("SendCustomerSupportRequest", SendCustomerSupportRequest),

		// Walkthroughs
		DECLARE_NAPI_METHOD("ShouldShowWalkthrough", ShouldShowWalkthrough),
		DECLARE_NAPI_METHOD("SetShowWalkthrough", SetShowWalkthrough),

		// Logs
		DECLARE_NAPI_METHOD("GetLogPath", GetLogPath),
		DECLARE_NAPI_METHOD("LogString", LogString),

		// Realtime Status
		DECLARE_NAPI_METHOD("GetStatus", GetStatus),

		// Jogging
		DECLARE_NAPI_METHOD("Jog", Jog),
		DECLARE_NAPI_METHOD("CancelJog", CancelJog),
		DECLARE_NAPI_METHOD("GetJogKeys", GetJogKeys),
		DECLARE_NAPI_METHOD("SetJogKeys", SetJogKeys),

		// Commands
		DECLARE_NAPI_METHOD("ExecuteCommand", ExecuteCommand),
		DECLARE_NAPI_METHOD("ExecuteRealtime", ExecuteRealtime),
		DECLARE_NAPI_METHOD("SetManualEntryMode", SetManualEntryMode),

		// Other
		DECLARE_NAPI_METHOD("InstallDrivers", InstallDrivers)
	};

	status = napi_define_properties(env, exports, descriptors.size(), descriptors.data());
	ASSERT_STATUS(status);

	return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
