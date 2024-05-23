#pragma once

#include "Common/CommonHeaders.h"
#include "GCodeLine.h"

/*
 * Reads in a G-Code file and stores it as an vector of GCodeLines.
 * Can be read in from a file or from a vector of strings so that it can work with zip files.
 */
class GCodeFile
{
public:
	GCodeFile() = default;
	explicit GCodeFile(const std::vector<std::string>& ls);

	void Load(const std::vector<std::string>& ls);

	inline const std::vector<GCodeLine>& getLines() const { return m_gcodeLines; }

	// Moves container out of object to eliminate costly copy. Remainder is left in a valid, but unspecified state.
	std::vector<GCodeLine>&& DestructivelyExtractFile() { return std::move(m_gcodeLines); }

private:
	std::vector<GCodeLine> m_gcodeLines;
	int LookAhead(const std::string& s, const int start, const int numlines, const std::vector<std::string>& ls) const;
};
