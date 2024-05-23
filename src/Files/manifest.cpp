#include "manifest.h"
#include "yaml.h"
#include "CRException.h"
#include "Common/Logger.h"

using std::string;
using std::vector;

void Manifest::LoadManifest(Archive& archive)
{
	auto ls = vector<string>{ };
	archive.Open();
	archive.ReadFile("manifest.yml", ls);
	const std::vector<YAMLObject> files = YAMLObject::parseFile(ls);
	if (files.empty()) { throw CRException(CRException::BAD_MANIFEST, "empty manifest"); }

	const std::vector<YAMLObject>& children = files[0].getChildren();
	for (auto& child: children) {
		Job j(child, archive);
		m_jobIndex[j.GetTitle()] = m_jobs.size();
		m_jobs.push_back(j);
	}

	auto verify = [ &archive ] (Job& j) { j.Verify(archive); };
	std::for_each(m_jobs.begin(), m_jobs.end(), verify);  
	archive.Close();
}

void Manifest::Verify(const Archive& archive) const
{
	for (size_t i = 0; i < m_jobs.size(); ++i)
	{
		m_jobs[i].Verify(archive);
	}
}

void Manifest::AddNewJob(const std::string& jobName, const std::string& jobDescription, const int& jobIndex, Archive& archive)
{
	auto ls = vector<string>{ };
	ls.emplace_back("- job_name: " + jobName);
	ls.emplace_back("  job_text: " + jobDescription);
	ls.emplace_back("  job_steps:");
	ls.emplace_back("    - step_name: Step Name");
	ls.emplace_back("      step_markdown: |");
	ls.emplace_back("Step Text");
	ls.emplace_back("      step_text: Please download the latest version of CRWrite at coastrunner.net/downloads");

	const std::vector<YAMLObject> files = YAMLObject::parseFile(ls);
	const std::vector<YAMLObject>& children = files[0].getChildren();

	Job newJob(children[0], archive);
	m_jobIndex[newJob.GetTitle()] = jobIndex;
	m_jobs.insert(m_jobs.begin() + jobIndex, newJob);
}
