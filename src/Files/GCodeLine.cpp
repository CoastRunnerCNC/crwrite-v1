#include "GCodeLine.h"

#include <Mill/GRBL/Regex.h>
#include <Common/Util/StringUtil.h>
using std::string;
using std::vector;

GCodeLine::GCodeLine(const std::string& line, const bool injected)
	: m_injectedCommand(injected)
{
	std::string s = line;
	if (s.find("(") == 0)
	{
		if (s.find(")") != 0)
		{
			s.append(sizeof(char), ')');
		}
	}


	// Replaces prohibited characters with single whitespace
	for (unsigned int i = 0; i < s.length(); ++i)
	{
		if (s[i] == '%')
		{
			s[i] = ' ';
		}
	}



	m_orig = s;

	bool comment = false;
	for (unsigned int i = 0; i < s.length(); ++i)
	{
		if (s[i] == ';' || s[i] == '\r' || s[i] == '\n')
		{
			break;
		}
		else if (s[i] == '(')
		{
			comment = true;
		}
		else if (s[i] == ')')
		{
			comment = false;
		}
		else if (!comment && s[i] != ' ' && s[i] != '\t')
		{
			m_clean.push_back(s[i]);
		}
	}

	m_block = TYPE_NOT_BLOCKING;
	std::smatch sm;
	
	if (m_clean.length() == 0)
	{
		m_type = TYPE_GRBL;
		m_group = GROUP_GRBL_EMPTY;
	}
	else if (std::regex_match(m_clean, sm, GRBL::RXAFS))
	{
		m_type = TYPE_AXIS_FEED_SPINDLE;
		m_group = GROUP_G_MOTION;
	}
	else if (std::regex_match(m_clean, sm, GRBL::RXGCODE))
	{
		m_type = TYPE_GCODE;
		m_value = std::stoi(sm[1]);

		if (sm[1] == "4" || sm[1] == "10" || sm[1] == "28" || sm[1] == "30" || sm[1] == "53" || sm[1] == "92")
		{
			m_group = GROUP_G_NON_MODAL;
			m_block = TYPE_BLOCKING;
		}
		else if (sm[1] == "0" || sm[1] == "1" || sm[1] == "2" || sm[1] == "3" || sm[1] == "38" || sm[1] == "80")
		{
			if (sm[1] == "38")
			{
				m_probe = TYPE_PROBE;
			}

			m_group = GROUP_G_MOTION;
		}
		else if (sm[1] == "17" || sm[1] == "18" || sm[1] == "19")
		{
			m_group = GROUP_G_PLANE_SELECTION;
		}
		else if (sm[1] == "90" || sm[1] == "91")
		{
			m_group = GROUP_G_DISTANCE;
			m_movementType = sm[1] == "90" ? 90 : 91;
		}
		else if (sm[1] == "93" || sm[1] == "94")
		{
			m_group = GROUP_G_FEED_RATE;
		}
		else if (sm[1] == "20" || sm[1] == "21")
		{
			m_group = GROUP_G_UNITS;
			m_units = tl::make_optional((uint8_t)std::stoul(sm[1]));
		}
		else if (sm[1] == "43" || sm[1] == "49")
		{
			m_group = GROUP_G_TOOL_LENGTH_OFFSET;
		}
		else if (sm[1] == "54" || sm[1] == "55" || sm[1] == "56" || sm[1] == "57" || sm[1] == "58" || sm[1] == "59")
		{
			m_group = GROUP_G_COORDINATE_SYSTEM;
			m_block = TYPE_BLOCKING;
			m_wcs = tl::make_optional((uint8_t)std::stoul(sm[1]));
		}
	}
	else if (std::regex_match(m_clean, sm, GRBL::RXMCODE))
	{
		m_type = TYPE_MCODE;
		m_value = std::stoi(sm[1]);

		m_MCodeInfo = tl::make_optional(MCodeInfo(std::stoi(sm[1]), sm[2].str()));

		if (sm[1] == "0" || sm[1] == "1" || sm[1] == "2" || sm[1] == "30")
		{
			m_group = GROUP_M_STOPPING;
		}
		else if (sm[1] == "3" || sm[1] == "4" || sm[1] == "5")
		{
			m_group = GROUP_M_SPINDLE;
		}
		else if (sm[1] == "7" || sm[1] == "8" || sm[1] == "9")
		{
			m_group = GROUP_M_COOLANT;
		}
		else if (sm[1] == "100" || sm[1] == "101" || sm[1] == "102" || sm[1] == "106" || sm[1] == "111"
			|| sm[1] == "112" || sm[1] == "113" || sm[1] == "114")
		{
			m_group = GROUP_M_USER_DEFINED;
		}
	}
	else if (IsGRBL(m_clean))
	{
		m_type = TYPE_GRBL;

		if (m_clean[0] == '$')
		{
			m_block = TYPE_BLOCKING;
			if (m_clean.size() == 1)
			{
				m_group = GROUP_GRBL_COMMAND;
				return;
			}

			if (m_clean[1] == 'H')
			{
				m_group = GROUP_GRBL_HOME;
			}
			else if (m_clean[1] == 'X')
			{
				m_group = GROUP_GRBL_UNLOCK;
			}
			else if (m_clean[1] == '?')
			{
				m_group = GROUP_GRBL_STATUS;
			}
			else if (m_clean[1] == '#')
			{
				m_group = GROUP_GRBL_WCS_INFO;
			}
			else if (m_clean[1] == 'C')
			{
				m_group = GROUP_GRBL_CHK_MODE;
			}
			else if (m_clean[1] == 'J')
			{
				m_group = GROUP_GRBL_JOG;
			}
			else if (m_clean[1] == 'L')
			{
				m_group = GROUP_GRBL_LEVEL;
			}
			else
			{
				m_group = GROUP_GRBL_COMMAND;
			}
		}
		else
		{
			m_group = GROUP_GRBL_SPECIAL;
		}
	}
}

bool GCodeLine::IsGRBL(const std::string& line) const
{
	assert(!line.empty());
	if (line[0] == '$') {
		return true;
	}

	if (line.length() == 1) {
		return line[0] == '~'|| line[0] == '?' || line[0] == '|'; // TODO: Support '!'
	}

	return false;
}

vector<string> ChunkGCodeLine(const string& line) {
	auto n = -1;
	auto temp = string{};
	auto result = vector<string>{ };
	while (++n < line.size()) {
		if (!temp.empty() && isalpha(line[n]) && (line[n] != 'P' && line[n] != 'L')) {
			result.push_back(temp);
			temp.clear();
		}
		temp.push_back(line[n]);
	}
	result.push_back(temp);
	assert(!result.empty());
	return result;
}
