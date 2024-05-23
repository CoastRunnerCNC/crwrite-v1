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
		m_plunge("z")
	{

	}

	std::string m_gantryLeft;
	std::string m_gantryRight;
	std::string m_raiseTable;
	std::string m_lowerTable;
	std::string m_retract;
	std::string m_plunge;
};