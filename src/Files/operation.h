#pragma once

#include "Common/CommonHeaders.h"
#include "GCodeFile.h"
#include <Common/Logger.h>

// Forward Declarations
class Archive;
class YAMLObject;
class CRFile;

typedef void* HANDLE;

/*
 * Represents an operation from a YAML manifest
 * Lazily loads image data and GCodeFile from zip file.
 */
class Operation
{
public:
	using Ptr = std::shared_ptr<Operation>;

private:
	bool m_pause = false;
	bool m_reset = false;
	bool m_loaded = false;
	bool m_gCodeEdited = false;
	unsigned int m_timeout = 0;
	unsigned int m_popupWaitTime = 0;
	std::string m_popupNoStep = "";
	std::string m_popupYesStep = "";
	std::string m_stepGoTo = "";

	std::string m_manifest;
	std::string m_title;
	std::string m_prompt;
	std::string m_markdown;
	std::string m_image;
	std::string m_file;
	std::string m_unskippable;
	std::string m_popupText;
	std::string m_popupTitle;
	std::string m_rawGCode;

	std::map<std::string, int> m_hashtable; // TODO: Determine better name

	std::vector<unsigned char> m_imageBytes;

	GCodeFile m_gcode;

public:
	bool Load(const std::shared_ptr<CRFile>& pCRFile);

	Operation() = default;
	explicit Operation(const YAMLObject& operationYAML, std::string manifest);
	Operation(const std::string manifest);
	void Verify(const Archive& archive) const;

	std::string sha256(const std::string& str) const;
	// GETTERS
	bool GetPause() const { return m_pause; }
	bool GetReset() const { return m_reset; }
	bool IsLoaded() const { return m_loaded; }
	bool IsGCodeEdited() const { return m_gCodeEdited; }
	unsigned int GetTimeout() const { return m_timeout; }
	unsigned int GetPopupWaitTime() const { return m_popupWaitTime; }
	const std::string GetPopupYesStep() const { return m_popupYesStep; }
	const std::string GetPopupNoStep() const { return m_popupNoStep; }
	const std::string GetGoTo() const { return m_stepGoTo; }

	const std::string& GetManifest() const { return m_manifest; };
	const std::string& GetTitle() const { return m_title; }
	const std::string& GetPrompt() const { return m_prompt; }
	const std::string& GetMarkdown() const { return m_markdown; }
	const std::string& GetImage() const { return m_image; }
	const std::string& GetFile() const { return m_file; }
	const std::string& GetUnskippable() const { return m_unskippable; }
	const std::string& GetPopupText() const { return m_popupText; }
	const std::string& GetPopupTitle() const { return m_popupTitle; }
	const std::string& GetRawGCode() const { return m_rawGCode; }

	const std::map<std::string, int>& GetHashtable() const { return m_hashtable; }

	const std::vector<unsigned char>& GetImageBytes() const { return m_imageBytes; }
	std::string GetImageBase64() const;

	bool HasGCodes() const { return !m_file.empty(); }
	const GCodeFile& GetGCodeFile() const { return m_gcode; }

	// SETTERS
	void SetManifest(const std::string& manifest) { m_manifest = manifest; }
	void SetTitle(const std::string& title) { m_title = title; }
	void SetPrompt(const std::string& prompt) { m_prompt = prompt; }
	void SetMarkdown(const std::string& markdown) { m_markdown = markdown; }
	void SetImage(const std::string& image) { m_image = image; MILL_LOG("SetImage: " + m_image); }
	void SetRawGCode(const std::string& rawGCode) { m_rawGCode = rawGCode; }
	void setGCodePath(const std::string& path) { m_file = path; }
	void SetLoaded(const bool loaded) { m_loaded = loaded; }
	void SetGCodeEdited(const bool gCodeEdited) { m_gCodeEdited = gCodeEdited; }

	static std::regex RXBMP;
	static std::regex RXJPEG;
};
