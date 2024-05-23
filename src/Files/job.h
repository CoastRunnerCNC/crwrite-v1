#pragma once

#include "Common/CommonHeaders.h"
#include "yaml.h"
#include "operation.h"
#include "archive.h"
#include "Common/Util/CommonTypes.h"

// TODO: Create a JobFactory, and make this a trivial data object?

/*
 * This class handles a job from the manifest.
 * A job consists of information acquired from the manifest yaml file.
 * This includes a title, a prompt, a vector of Operations, a vector of strings that are filenames of guides, a vector of strings that are filenames of models, and a minimum firmware version.
 */
class Job
{
	void SetGuides(const YAMLObject& y);
	void SetModels(const YAMLObject& y);
	void SpliceInSubYMAL(const std::string& path, Archive& fileContext);

	std::string m_title;
	std::string m_prompt;
	std::string m_minimumFirmwareVersion{""};
	std::string m_minimumCRWriteVersion{""};
	std::string m_wcs_check_failed_message{""};
	std::vector<std::string> m_guides;
	std::vector<std::string> m_models;
	std::vector<Operation::Ptr> m_operations;
	std::vector<std::pair<int, Point3>> m_wcsChecks{};
	bool m_allow_wcs_clear_prompt{ true };
	bool m_wcs_value_check{ false };

public:
	using Ptr = std::shared_ptr<Job>;

    Job() = default;
	explicit Job(const YAMLObject& jobYAML, Archive& fileContext);// Constructor that takes a YAMLObject and parses it

	void Verify(const Archive& archive) const;
	void AddOperation(const int index);
	void SetOperations(const YAMLObject& y, Archive& fileContext);
	bool IsSubmanifestUsed();
	void DeleteOperation(const int stepIndex);
	void MoveOperation(const int prevStepIndex, const int newStepIndex);

	// GETTERS
	const std::string& GetTitle() const { return m_title; }
	const std::string& GetPrompt() const { return m_prompt; }
	const std::string& GetMinFirmwareVersion() const { return m_minimumFirmwareVersion; }
	const std::string& GetMinimumCRWriteVersion() const { return m_minimumCRWriteVersion; }
	bool AllowWcsClearPrompt() const { return m_allow_wcs_clear_prompt; }
	const std::vector<std::pair<int, Point3>>& WcsValueChecks() const { return m_wcsChecks; }
	const std::string& WcsCheckFailedMessage() const { return m_wcs_check_failed_message; }

	const std::vector<Operation::Ptr>& GetOperations() const { return m_operations; }
	Operation::Ptr GetOperation(const size_t index) const {
		if (index < m_operations.size())
		{
			return m_operations[index];
		}
		else
		{
			return nullptr;
		}
	}

	const std::vector<std::string>& GetGuides() const { return m_guides; }
	const std::string& GetGuide(const size_t index) const { return m_guides[index]; }
	const std::vector<std::string>& GetModels() const { return m_models; }
	const std::string& GetModel(const size_t index) const { return m_models[index]; }
};
