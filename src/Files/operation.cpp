#include "operation.h"

#include "yaml.h"
#include "archive.h"
#include "CRException.h"
#include "CRFile.h"

#include <Common/Logger.h>
#include <Mill/GRBL/Regex.h>




#include <iostream>
#include <string>
#include <sstream>
#include <iomanip>
#include <openssl/sha.h>


Operation::Operation(const std::string manifest)
{
	m_manifest = manifest;
	m_title = "Step Name";
	m_markdown = "\nStep Text";
	m_prompt = "Please download the latest version of CRWrite at coastrunner.net/downloads";
}

Operation::Operation(const YAMLObject& operationYAML, const std::string manifest)
{
	m_manifest = manifest;

    if (operationYAML.getType() != YAMLObject::TYPELST)
	{
        throw CRException(CRException::BAD_MANIFEST, "not a list of operations | line " + std::to_string(operationYAML.getLine()));
    }

    const std::vector<YAMLObject>& operationYAMLChildren = operationYAML.getChildren();
    if (operationYAMLChildren.size() == 0)
	{
        throw CRException(CRException::BAD_MANIFEST, "operation is empty | line " + std::to_string(operationYAML.getLine()));
    }

    if (operationYAMLChildren[0].getType() != YAMLObject::TYPERRY)
	{
       throw CRException(CRException::BAD_MANIFEST, "operation children must be type array | line " + std::to_string(operationYAML.getLine()));
    }

    for (size_t i = 0; i < operationYAMLChildren.size(); ++i)
	{
        if(operationYAMLChildren[i].getChildren().size() == 0)
		{
            throw CRException(CRException::BAD_MANIFEST, "operation child has no value | line " + std::to_string(operationYAMLChildren[i].getLine()));
        }

        const YAMLObject& child = operationYAMLChildren[i].getChildren()[0];
        if (child.getType() != YAMLObject::TYPESTR)
		{
            throw CRException(CRException::BAD_MANIFEST, "operation values must be type string | line " + std::to_string(child.getLine()));
        }

		const std::string& value = operationYAMLChildren[i].getValue();
        if (value == "pause")
		{
            if (std::regex_match(child.getValue(), GRBL::RXTRUE))
			{
                m_pause = true;
            }
        }
		else if (value == "reset")
		{
            if (std::regex_match(child.getValue(), GRBL::RXTRUE))
			{
				m_reset = true;
            }
        }
		else if (value == "timeout")
		{
			m_timeout = stoul(child.getValue());
        }
		else if (value == "step_name")
		{
			m_title = child.getValue();
        }
		else if (value == "step_text")
		{
			m_prompt = child.getValue();
        }
		else if (value == "step_markdown")
		{
			m_markdown = child.getValue();
		}
		else if (value == "step_image")
		{
            std::smatch sm;
            std::regex_match(child.getValue(), sm, GRBL::RXSTRIP);
			m_image = sm[1].str();
        }
		else if (value == "step_gcode")
		{
            std::smatch sm;
            std::regex_match(child.getValue(), sm, GRBL::RXSTRIP);
			m_file = sm[1].str();
        }
		else if (value == "if")
		{
			// added if condition to yaml file
			m_hashtable.clear();
            const std::string val = child.getValue();
            std::size_t found = val.find("==");

            if (found != std::string::npos)
			{
				m_hashtable[val.substr(0, found)] = atoi(val.substr(found + 2).c_str());
            }
        }
		else if (value == "unskippable")
		{
			m_unskippable = child.getValue();
		}
		else if (value == "popup_text") {
			m_unskippable = "true";
			m_popupText = child.getValue();
		}
		else if (value == "popup_title")
		{
			m_popupTitle = child.getValue();
		}
		else if (value == "popup_wait_time")
		{
			m_popupWaitTime = std::stoi(child.getValue());
		}
		else if (value == "popup_yes_step")
		{
			m_popupYesStep = child.getValue();
		}
		else if (value == "popup_no_step")
		{
			m_popupNoStep = child.getValue();
		}
		else if (value == "step_goto")
		{
			m_stepGoTo = child.getValue();
		}
    }
}

std::string Operation::sha256(const std::string& str) const {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256_CTX sha256;
    SHA256_Init(&sha256);
    SHA256_Update(&sha256, str.c_str(), str.size());
    SHA256_Final(hash, &sha256);
    std::stringstream ss;
    for (int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)hash[i];
    }
    return ss.str();
}

void Operation::Verify(const Archive& archive) const
{
    if (m_file.size() > 0)
	{
		archive.CheckFile(m_file);
    }

    if (m_image.size() > 0)
	{
		archive.CheckFile(m_image);
    }
}

bool Operation::Load(const std::shared_ptr<CRFile>& pCRFile)
{
	// Should we seperate this into two different loaded checks? One for image the other for GCode?
	if (!m_loaded)
	{
		if (pCRFile == nullptr)
		{
			MILL_LOG("Selected file is null.");
			return false;
		}

		if (!GetFile().empty())
		{
			std::vector<std::string> vs;
			std::string RawGCodeString;
			try {
				pCRFile->ReadFile(GetFile(), vs);
			}
			catch (const std::exception& exception)
			{
				MILL_LOG("Failed to read gcode file!");
				MILL_LOG(exception.what());
			}


			for (const auto& line : vs)
			{
				RawGCodeString += line + "\n";
			}

			m_rawGCode = RawGCodeString;

			m_gcode.Load(vs);
		}

		if (!GetImage().empty())
		{
			m_imageBytes.clear();
			m_imageBytes.shrink_to_fit();
			pCRFile->ReadFile(GetImage(), m_imageBytes);
		}

		m_loaded = true;
	}

	return true;
}


static const std::string base64_chars =
             "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
             "abcdefghijklmnopqrstuvwxyz"
             "0123456789+/";

std::string Operation::GetImageBase64() const
{
	unsigned char const* bytes_to_encode = &m_imageBytes[0];
	unsigned int in_len = m_imageBytes.size();

	std::string ret{};
	int i{0};
	unsigned char char_array_3[3]{};
	unsigned char char_array_4[4]{};

	while (in_len--) {
	char_array_3[i++] = *(bytes_to_encode++);
	if (i == 3) {
	  char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
	  char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
	  char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
	  char_array_4[3] = char_array_3[2] & 0x3f;

	  for(i = 0; (i <4) ; i++)
	    ret += base64_chars[char_array_4[i]];
	  i = 0;
	}
	}

	if (i)
	{
	for(auto j = i; j < 3; j++)
	  char_array_3[j] = '\0';

	char_array_4[0] = (char_array_3[0] & 0xfc) >> 2;
	char_array_4[1] = ((char_array_3[0] & 0x03) << 4) + ((char_array_3[1] & 0xf0) >> 4);
	char_array_4[2] = ((char_array_3[1] & 0x0f) << 2) + ((char_array_3[2] & 0xc0) >> 6);
	char_array_4[3] = char_array_3[2] & 0x3f;

	for (auto j = 0; (j < i + 1); j++)
	  ret += base64_chars[char_array_4[j]];

	while((i++ < 3))
	  ret += '=';

	}
	const std::string tempStr = ret;
	MILL_LOG("Sha256 HASH: " + sha256(tempStr));
	return ret;
}
