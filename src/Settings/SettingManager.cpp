#include "SettingManager.h"
#include <Common/Util/OSUtil.h>
#include <Common/Logger.h>
using namespace MillLogger;

static const std::string CONFIG_FILE_NAME = "cncmill.conf";

SettingManager& SettingManager::GetInstance()
{
	static SettingManager instance;
	return instance;
}

SettingManager::SettingManager()
{
	std::list<Setting> settings = ReadSettingsFromFile();
	if (settings.empty())
	{
		MILL_LOG("Config file path does not yet exist. Creating it now.");

		UpdateSettings(std::list<Setting>{{"CNCMill", "5.0"}});
	}
	else
	{
		for (auto settingIter = settings.cbegin(); settingIter != settings.cend(); settingIter++)
		{
			Setting setting = *settingIter;
			m_settingsByKey[setting.GetName()] = setting.GetValue();
		}
	}
}

std::list<Setting> SettingManager::ReadSettingsFromFile() const
{
    std::list<Setting> settings;

	const fs::path configFilePath = OSUtility::GetDataDirectory() / CONFIG_FILE_NAME;

	FILE* pFile = fopen(configFilePath.u8string().c_str(), "r");
	if (pFile != nullptr)
	{
		char cstr[1000];
		while (fgets(cstr, 1000, pFile) != NULL)
		{
			std::string line(cstr);
			if (StringUtil::EndsWith(line, "\n"))
			{
				line = line.substr(0, line.size() - 1);
			}
			if (StringUtil::EndsWith(line, "\r"))
			{
				line = line.substr(0, line.size() - 1);
			}

			const int index = line.find("=");
			const std::string key = line.substr(0, index);
			const std::string value = line.substr(index + 1, line.size() - (index + 1));

			const Setting setting(key, value);
			settings.push_back(setting);
			MILL_LOG(line);
		}

		fclose(pFile);
	}

    return settings;
}

JogKeys SettingManager::GetJogKeys() const
{
	JogKeys jogKeys;

	if (m_settingsByKey.find("gantry_left") != m_settingsByKey.cend())
	{
		jogKeys.m_gantryLeft = m_settingsByKey.at("gantry_left");
	}

	if (m_settingsByKey.find("gantry_right") != m_settingsByKey.cend())
	{
		jogKeys.m_gantryRight = m_settingsByKey.at("gantry_right");
	}

	if (m_settingsByKey.find("raise_table") != m_settingsByKey.cend())
	{
		jogKeys.m_raiseTable = m_settingsByKey.at("raise_table");
	}

	if (m_settingsByKey.find("lower_table") != m_settingsByKey.cend())
	{
		jogKeys.m_lowerTable = m_settingsByKey.at("lower_table");
	}

	if (m_settingsByKey.find("plunge") != m_settingsByKey.cend())
	{
		jogKeys.m_plunge = m_settingsByKey.at("plunge");
	}

	if (m_settingsByKey.find("retract") != m_settingsByKey.cend())
	{
		jogKeys.m_retract = m_settingsByKey.at("retract");
	}

  if (m_settingsByKey.find("focus_manual_entry") != m_settingsByKey.cend())
	{
		jogKeys.m_focus_manual_entry = m_settingsByKey.at("focus_manual_entry");
	}

  if (m_settingsByKey.find("focus_max_distance") != m_settingsByKey.cend())
	{
		jogKeys.m_focus_max_distance = m_settingsByKey.at("focus_max_distance");
	}

  if (m_settingsByKey.find("switch_units") != m_settingsByKey.cend())
	{
		jogKeys.m_switch_units = m_settingsByKey.at("switch_units");
	}

  if (m_settingsByKey.find("switch_jog_mode") != m_settingsByKey.cend())
	{
		jogKeys.m_switch_jog_mode = m_settingsByKey.at("switch_jog_mode");
	}

  if (m_settingsByKey.find("increase_units") != m_settingsByKey.cend())
	{
		jogKeys.m_increase_units = m_settingsByKey.at("increase_units");
	}

  if (m_settingsByKey.find("decrease_units") != m_settingsByKey.cend())
	{
		jogKeys.m_decrease_units = m_settingsByKey.at("decrease_units");
	}

	if (m_settingsByKey.find("escape_textbox") != m_settingsByKey.cend())
	{
		jogKeys.m_escape_textbox = m_settingsByKey.at("escape_textbox");
	}

  if (m_settingsByKey.find("home_preset") != m_settingsByKey.cend())
	{
		jogKeys.m_home_preset = m_settingsByKey.at("home_preset");
	}

  if (m_settingsByKey.find("preset_1") != m_settingsByKey.cend())
	{
		jogKeys.m_preset_1 = m_settingsByKey.at("preset_1");
	}

  if (m_settingsByKey.find("preset_2") != m_settingsByKey.cend())
	{
		jogKeys.m_preset_2 = m_settingsByKey.at("preset_2");
	}

  if (m_settingsByKey.find("preset_3") != m_settingsByKey.cend())
	{
		jogKeys.m_preset_3 = m_settingsByKey.at("preset_3");
	}

  if (m_settingsByKey.find("preset_4") != m_settingsByKey.cend())
	{
		jogKeys.m_preset_4 = m_settingsByKey.at("preset_4");
	}

	return jogKeys;
}

void SettingManager::SetJogKeys(const JogKeys& jogKeys)
{
	const std::list<Setting> settings = {
		{"gantry_left", jogKeys.m_gantryLeft},
		{"gantry_right", jogKeys.m_gantryRight},
		{"raise_table", jogKeys.m_raiseTable},
		{"lower_table", jogKeys.m_lowerTable},
		{"plunge", jogKeys.m_plunge},
		{"retract", jogKeys.m_retract},
		{"focus_manual_entry", jogKeys.m_focus_manual_entry},
		{"focus_max_distance", jogKeys.m_focus_max_distance},
		{"switch_units", jogKeys.m_switch_units},
		{"switch_jog_mode", jogKeys.m_switch_jog_mode},
		{"increase_units", jogKeys.m_increase_units},
		{"decrease_units", jogKeys.m_decrease_units},
		{"escape_textbox", jogKeys.m_escape_textbox},
		{"home_preset", jogKeys.m_home_preset},
		{"preset_1", jogKeys.m_preset_1},
		{"preset_2", jogKeys.m_preset_2},
		{"preset_3", jogKeys.m_preset_3},
		{"preset_4", jogKeys.m_preset_4}
	};
	UpdateSettings(settings);
}

bool SettingManager::UpdateSettings(const std::list<Setting>& settings)
{
	for (auto& setting : settings)
	{
		m_settingsByKey[setting.GetName()] = setting.GetValue();
	}

	const fs::path configFilePath = OSUtility::GetDataDirectory() / CONFIG_FILE_NAME;

	MILL_LOG(std::to_string(m_settingsByKey.size()));
	FILE* pFile = fopen(configFilePath.u8string().c_str(), "w");
	if (pFile != nullptr)
	{
		for (auto iter = m_settingsByKey.cbegin(); iter != m_settingsByKey.cend(); iter++)
		{
			fprintf(pFile, "%s=%s\n", iter->first.c_str(), iter->second.c_str());
		}

		fclose(pFile);
	}

	return true;
}
