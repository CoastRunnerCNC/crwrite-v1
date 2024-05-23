#pragma once

#include "Common/CommonHeaders.h"
#include "Setting.h"
#include "WalkthroughType.h"
#include "JogKeys.h"
#include <Common/Logger.h>
#include <json/json.h>


// A class that manages several simple global settings
class SettingManager
{
public:
	static SettingManager& GetInstance();

    bool UpdateSettings(const std::list<Setting>& settings);

	bool GetEnableSlider() const { return GetValue("enable_slider", false); }
	void SetEnableSlider(const bool enableSlider) { SetValue("enable_slider", enableSlider); }

	bool GetPauseAfterGCode() const { return GetValue("pauseAfterGCode", false); }
	void SetPauseAfterGCode(const bool pauseAfterGCode) { SetValue("pauseAfterGCode", pauseAfterGCode); }

	int GetMinFeedRate() const { return GetValue("minFeedRate", 30); }
	void SetMinFeedRate(const int minFeedRate) { SetValue("minFeedRate", minFeedRate); }

	int GetMaxFeedRate() const { return GetValue("maxFeedRate", 100); }
	void SetMaxFeedRate(const int maxFeedRate) { SetValue("maxFeedRate", maxFeedRate); }

	bool GetDisableLimitCatch() const { return GetValue("disableLimitCatch", false); }
	void SetDisableLimitCatch(const bool disableLimitCatch) { SetValue("disableLimitCatch", disableLimitCatch); }

	bool GetShowEditButtonSetting() const { return GetValue("showEditButtonSetting", false); }

	bool GetEnableEditButton() const { return GetValue("enableEditButton", false); }

	const std::string GetPositionButton(const int buttonNumber) const { return GetValue("position_button_" + std::to_string(buttonNumber), std::string{"none"}); }
	void SetPositionButton(const int buttonNumber, Json::Value position) 
	{ 
		Json::StreamWriterBuilder writer;
		writer.settings_["indentation"] = "";
		std::string positionString = Json::writeString(writer, position);
		SetValue("position_button_" + std::to_string(buttonNumber), positionString); 
	}

	bool GetShowWalkthrough(const EWalkthroughType& type) const { return GetValue(WalkthroughType::GetSettingName(type), true); }
	void SetShowWalkthrough(const EWalkthroughType& type, const bool show) { SetValue(WalkthroughType::GetSettingName(type), show); }

	bool GetEnableLS() const { return GetValue("enable_ls", false); }
	std::string GetExplicitFirmwareVersion() const { return GetValue("firmware_update_explicit_version", std::string{ "" }); }

	JogKeys GetJogKeys() const;
	void SetJogKeys(const JogKeys& jogKeys);

private:
	SettingManager();
	std::list<Setting> ReadSettingsFromFile() const;

	template<typename T>
	T GetValue(const std::string& name, const T defaultValue) const
	{
		auto iter = m_settingsByKey.find(name);
		if (iter != m_settingsByKey.cend())
		{
			if constexpr (std::is_same_v<T, bool>)
			{
				return iter->second == "true";
			}
			else if constexpr (std::is_arithmetic_v<T>)
			{
				return (T)std::stod(iter->second);
			}
			else
			{
				return iter->second;
			}
		}

		return defaultValue;
	}

	template<typename T>
	void SetValue(const std::string& name, const T value)
	{
		if constexpr (std::is_same_v<T, bool>)
		{
			UpdateSettings(std::list<Setting>({ {name, value ? "true" : "false"} }));
		}
		else if constexpr (std::is_arithmetic_v<T>)
		{
			UpdateSettings(std::list<Setting>({ {name, std::to_string(value)} }));
		}
		else
		{
			UpdateSettings(std::list<Setting>({ {name, value} }));
		}
	}

	std::map<std::string, std::string> m_settingsByKey;
};