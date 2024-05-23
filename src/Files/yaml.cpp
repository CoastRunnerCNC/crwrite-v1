#include "yaml.h"

int YAMLObject::TYPEOBJ=0;
int YAMLObject::TYPEFIL=1;
int YAMLObject::TYPERRY=2;
int YAMLObject::TYPELST=3;
int YAMLObject::TYPESTR=4;

std::regex YAMLObject::RXBOF("^---\\s*(#.*)?$");
std::regex YAMLObject::RXEOF("^...\\s*(#.*)?$");
std::regex YAMLObject::RXINDENT("^( *)(.*)$");
std::regex YAMLObject::RXARRAY("^( *)(\\w+):(\\s+(.*))?\\s*$");
std::regex YAMLObject::RXLIST("^( *)- \\s*(.*)\\s*$");
std::regex YAMLObject::RXCOMMENT("^ *(#.*)?\\s*$");
std::regex YAMLObject::RXNEWLINE("\\\\n");
static std::regex RX_NEWLINE_BRACKETS("<NEWLINE>");


YAMLObject::YAMLObject(const int t, const std::string& s, const size_t l)
	:type(t), value(s), line(l + 1)
{
}

void YAMLObject::addChild(YAMLObject y)
{
	chldrn.push_back(y);
}

YAMLObject& YAMLObject::lastChild()
{
	return chldrn.back();
}

int YAMLObject::getType() const
{
	return type;
}

const std::string& YAMLObject::getValue() const
{
	return value;
}

size_t YAMLObject::getLine() const
{
    return line;
}

const std::vector<YAMLObject>& YAMLObject::getChildren() const
{
	return chldrn;
}

std::vector<YAMLObject> YAMLObject::parseFile(const std::vector<std::string>& vs)
{
    size_t i = 0;
    int parseState = 0;
	std::vector<YAMLObject> ret;
	ret.push_back(YAMLObject(TYPEFIL, "", i));

	std::vector<std::string> combined_lines;
	bool multiline = false;
	for (const std::string& s : vs) {
		std::smatch sm;
		bool array_line = std::regex_match(s, sm, RXARRAY);
		if (multiline) {
			if (array_line) {
				multiline = false;
			} else {
				combined_lines.back() += ("<NEWLINE>" + s);
				continue;
			}
		}

		if (array_line && sm[4].str() == "|") {
			multiline = true;
			combined_lines.push_back(sm[1].str() + sm[2].str() + ": ");
		} else {
			combined_lines.push_back(s);
		}
	}


	// Strip comments
	bool multiline_markdown = false;
	std::vector<std::string> lines;
	for (const std::string& s : combined_lines) {
		std::smatch sm;
		if (std::regex_match(s, sm, RXARRAY) && sm[2].str() == "step_markdown") {
			lines.push_back(s);
			continue;
		}

		std::string line;
		for (const char c : s) {
			if (c == '#') {
				break;
			}

			line += c;
		}
		
		lines.push_back(line);
	}

	for(; i< lines.size(); ++i)
	{
		const std::string& line = lines[i];
        if (std::regex_match(line, RXCOMMENT))
		{
			continue;
		}

		if (std::regex_match(line, RXBOF))
		{
            if (parseState>0)
			{
                ret.push_back(YAMLObject(TYPEFIL,"",i));
            }
            parseState=1;
            continue;
		}

		if (parseState==2)
		{
			throw YAMLException(YAMLException::PARSE,i);
		}

		if (std::regex_match(line,RXEOF))
		{
            parseState=2;
            continue;
        }

		parse(lines,i,ret.back(),-1);
	}

	return ret;
}

void YAMLObject::parse(const std::vector<std::string>& vs, size_t& i, YAMLObject& parent, int l)
{
	std::smatch sm;
	int type = TYPEOBJ;
	int indent;
	for(; i < vs.size(); ++i)
	{
		std::string line = vs[i];

        if (std::regex_match(line, RXCOMMENT))
		{
			continue;
		}
        if (std::regex_match(line, RXBOF))
		{
			break;
		}
        if (std::regex_match(line, RXEOF))
		{
			break;
		}

		std::regex_match(line, sm, RXINDENT);
		indent = (int)sm[1].length();
        if (indent <= l)
		{
			break;
		}

        if (std::regex_match(line, sm, RXARRAY))
		{
            if (type == TYPEOBJ)
			{
				type = TYPERRY;
			}

            if (type != TYPERRY)
			{
				throw YAMLException(YAMLException::TYPE, i);
			}

            parent.addChild(parseArray(line, i));
            parse(vs, ++i, parent.lastChild(), indent);
            --i;
        }
		else if (std::regex_match(line, sm, RXLIST))
		{
            if (type == TYPEOBJ)
			{
				type = TYPELST;
			}

            if (type != TYPELST)
			{
				throw YAMLException(YAMLException::TYPE, i);
			}

            parent.addChild(parseList(line, i));
            parse(vs, ++i, parent.lastChild(), indent);
            --i;
        }
		else
		{
            throw YAMLException(YAMLException::PARSE,i);
        }
	}
}

YAMLObject YAMLObject::parseArray(const std::string& s,size_t i)
{
	std::smatch sm;
	if (std::regex_match(s, sm, RXARRAY))
	{
		YAMLObject t(TYPERRY, sm[2], i);
		if (sm[4].length() > 0)
		{
			if (!std::regex_match(sm[4].str(), RXCOMMENT))
			{
				t.addChild(parseString(sm[4], i));
			}
		}
		return t;
	}
	else
	{
		throw YAMLException(YAMLException::PARSE, i);
	}
}

YAMLObject YAMLObject::parseList(const std::string& s,size_t i)
{
	std::smatch sm;
	if (std::regex_match(s,sm,RXLIST))
	{
		YAMLObject t(TYPELST, "", i);
		if (sm[2].length() > 0)
		{
			if (std::regex_match(sm[2].str(), RXARRAY))
			{
				t.addChild(parseArray(sm[2], i));
			}
			else if (!std::regex_match(sm[2].str(), RXCOMMENT))
			{
				t.addChild(parseString(sm[2], i));
			}
		}

		return t;
	}
	else
	{
		throw YAMLException(YAMLException::PARSE, i);
	}
}

YAMLObject YAMLObject::parseString(const std::string &s, size_t i)
{
#ifdef _WIN32
	std::string replaced = std::regex_replace(s, RXNEWLINE, "\r\n");
    return YAMLObject(TYPESTR, std::regex_replace(replaced, RX_NEWLINE_BRACKETS,"\r\n"),i);
#else

	std::string replaced = std::regex_replace(s, RXNEWLINE, "\n");
	return YAMLObject(TYPESTR, std::regex_replace(replaced, RX_NEWLINE_BRACKETS, "\n"), i);
#endif
}

int YAMLException::PARSE=1;
int YAMLException::TYPE=2;

YAMLException::YAMLException(int t, size_t l)
    : m_buffer()
{
	if (t == YAMLException::PARSE)
	{
        m_buffer = "YAML parse error: line " + std::to_string(l + 1);
	}
	else if (t == YAMLException::TYPE)
	{
        m_buffer = "YAML parse error: type mismatch line " + std::to_string(l + 1);
	}
	else
	{
        m_buffer = "YAML error";
	}
}

const char* YAMLException::what() const noexcept
{
	return m_buffer.c_str();
}
