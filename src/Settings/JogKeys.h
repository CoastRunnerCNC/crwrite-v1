#pragma once

#include "Common/CommonHeaders.h"

class JogKeys
{
public:
	JogKeys()
		: m_gantryLeft("ArrowLeft"),
		m_gantryRight("ArrowRight"),
		m_raiseTable("ArrowUp"),
		m_lowerTable("ArrowDown"),
		m_retract("a"),
		m_plunge("z"),
		m_focus_manual_entry("Control"),
		m_focus_max_distance("NumLock"),
		m_switch_units("*"),
		m_switch_jog_mode("/"),
		m_increase_units("PageUp"),
		m_decrease_units("PageDown"),
		m_escape_textbox("Escape"),
		m_home_preset("F1"),
		m_preset_1("F2"),
		m_preset_2("F3"),
		m_preset_3("F4"),
		m_preset_4("F5")
	{

	}

	std::string m_gantryLeft;
	std::string m_gantryRight;
	std::string m_raiseTable;
	std::string m_lowerTable;
	std::string m_retract;
	std::string m_plunge;
	std::string m_focus_manual_entry;
	std::string m_focus_max_distance;
	std::string m_switch_units;
	std::string m_switch_jog_mode;
	std::string m_increase_units;
	std::string m_decrease_units;
	std::string m_escape_textbox;
	std::string m_home_preset;
	std::string m_preset_1;
	std::string m_preset_2;
	std::string m_preset_3;
	std::string m_preset_4;
};
