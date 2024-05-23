#include "job.h"
#include "CRException.h"
#include "Common/Util/FileUtil.h"
#include <Mill/GRBL/Regex.h>
#include "Common/Logger.h"

using namespace MillLogger;
using std::vector;
using std::string;
using std::operator""s;
using std::copy;
using std::back_inserter;
using std::stof;

Job::Job(const YAMLObject& jobYAML, Archive& fileContext)
{
	if (jobYAML.getType() != YAMLObject::TYPELST)
	{
        throw CRException(CRException::BAD_MANIFEST, "not a list of jobs | line " + std::to_string(jobYAML.getLine()));
	}

    const std::vector<YAMLObject>& children = jobYAML.getChildren();

    if (children.size() == 0)
	{
        throw CRException(CRException::BAD_MANIFEST, "job list entry is empty | line " + std::to_string(jobYAML.getLine()));
    }

    if (children[0].getType() != YAMLObject::TYPERRY)
	{
        throw CRException(CRException::BAD_MANIFEST, "job values must be type array | line " + std::to_string(jobYAML.getLine()));
    }

    for (size_t i=0; i < children.size(); ++i)
	{
        if (children[i].getChildren().size() > 0)
		{
            const YAMLObject& child = children[i].getChildren()[0];
			const std::string& value = children[i].getValue();
            if (value == "job_name")
			{
				m_title = child.getValue();
            }
			else if (value == "job_text")
			{
				m_prompt = child.getValue();
            }
			else if (value == "job_steps")
			{
                SetOperations(children[i], fileContext);
            }
			else if (value == "manifest_file") {
				SpliceInSubYMAL(child.getValue(), fileContext);
			}
			else if (value == "guide_files")
			{
                SetGuides(children[i]);
            }
			else if (value == "model_files")
			{
                SetModels(children[i]);
            }
			else if (value == "min_fw_version")
			{
				m_minimumFirmwareVersion = child.getValue();
            }
			else if (value == "min_crwrite_version") {
				m_minimumCRWriteVersion = child.getValue();
			}
			else if (value == "disable_wcs_clear_prompt") {
				auto param = child.getValue();
				std::transform(param.begin(), param.end(), param.begin(), [ ] (char c) { return tolower(c); });
				if (param == "true") { m_allow_wcs_clear_prompt = false; }
			}
			else if (value == "wcs_value_check") {
				auto param = child.getValue();

				// Chunk line
				auto n = -1;
				auto temp = ""s;
				auto chunks = vector<string>{ };
				while (++n < param.size()) {
					if (!temp.empty() && isalpha(param[n])) {
						chunks.push_back(temp);
						temp.clear();
					}
					temp.push_back(param[n]);
				}
				chunks.push_back(temp);

				// Parse chunks into 
				auto point = Point3{};
				auto wcs = -1;
				for (auto& chunk: chunks) {
					try {
						switch (chunk[0]) {
							case 'G': { wcs = stof(chunk.substr(1)); } break;
							case 'X': { point.x = stof(chunk.substr(1)); } break;
							case 'Y': { point.y = stof(chunk.substr(1)); } break;
							case 'Z': { point.z = stof(chunk.substr(1)); } break;
						}
					}
					catch (...) {
						MILL_LOG("Error parsing manifest file with chunk: " + chunk);
					}
				}
				m_wcsChecks.emplace_back(wcs, point);
				m_wcs_value_check = true;
			}
			else if (value == "wcs_check_failed_message") { 
				m_wcs_check_failed_message = child.getValue();
			}
        }
    }
}

void Job::Verify(const Archive& a) const
{
    for (size_t i=0; i < m_operations.size(); ++i)
	{
		m_operations[i]->Verify(a);
    }
}

void Job::AddOperation(const int stepIndex)
{
    std::string prevStepManifest = m_operations[stepIndex - 1] -> GetManifest();
    MILL_LOG("AddNewOperation - prevStepManifest: " + prevStepManifest);

    m_operations.insert(m_operations.begin() + stepIndex, std::make_shared<Operation>(prevStepManifest));

    MILL_LOG("Looping operations");
	for (auto step : m_operations)
	{
		MILL_LOG(step->GetTitle());
	}
	MILL_LOG("Done looping operations");
}

void Job::DeleteOperation(const int stepIndex)
{
	m_operations.erase(m_operations.begin() + stepIndex);
	return;
}

void Job::MoveOperation(const int prevStepIndex, const int newStepIndex)
{
	std::swap(m_operations[prevStepIndex], m_operations[newStepIndex]);
}

void Job::SetOperations(const YAMLObject& y, Archive& fileContext)
{
	std::vector<YAMLObject> t = y.getChildren();

	for(unsigned int i = 0; i < t.size(); ++i)
	{
		auto& firstElement = t[i].getChildren()[0];
		auto& stepsWithinFirstElement = firstElement.getChildren()[0].getValue();
		if (firstElement.getValue() == "manifest_file") { SpliceInSubYMAL(stepsWithinFirstElement, fileContext); }
		else { m_operations.push_back(std::make_shared<Operation>(t[i], "manifest.yml")); }
	}
}

bool Job::IsSubmanifestUsed()
{
	for (int x = 0; x < m_operations.size(); ++x)
	{
		if (m_operations[x]->GetManifest() != "manifest.yml")
		{
			return true;
		}
	}
	return false;
}

void Job::SpliceInSubYMAL(const string& path, Archive& fileContext) {
	auto msg = "Splicing in YML file at: "s;
	msg += path;
	MILL_LOG(msg);

	auto lines = vector<string>{ };
	fileContext.ReadFile(path, lines);
	auto subManifest = YAMLObject::parseFile(lines);
	auto loadedOperations = vector<Operation::Ptr>{ };
	for (auto& line : subManifest[0].getChildren()) {
		loadedOperations.emplace_back(std::make_shared<Operation>(line, path));
	}
	copy(loadedOperations.begin(), loadedOperations.end(), back_inserter(m_operations));

}

void Job::SetGuides(const YAMLObject& y)
{
	std::vector<YAMLObject> t = y.getChildren();
	std::smatch sm;

	for (size_t i = 0; i < t.size(); ++i)
	{
		if (t[i].getType() == YAMLObject::TYPELST)
		{
            std::regex_match(t[i].lastChild().getValue(), sm, GRBL::RXSTRIP);
			m_guides.push_back(sm[1].str());
		}
	}
}

void Job::SetModels(const YAMLObject& y)
{
	std::vector<YAMLObject> t = y.getChildren();
	std::smatch sm;
	for (size_t i = 0; i < t.size(); ++i)
	{
		if (t[i].getType() == YAMLObject::TYPELST)
		{
            std::regex_match(t[i].lastChild().getValue(), sm, GRBL::RXSTRIP);
			m_models.push_back(sm[1].str());
		}
	}
}
