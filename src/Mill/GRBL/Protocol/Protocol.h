#pragma once

#include "Common/CommonHeaders.h"
#include <Mill/GRBL/ConnectionState.h>
#include <Mill/GRBL/SerialConnection.h>
#include <Files/GCodeLine.h>
using namespace MillLogger;

enum class GRBLVersion
{
	GRBL1_0,
	GRBL1_1
};

// Utility class that processes response data from GRBL and updates the internal machine state representation
class Protocol
{
public:
	Protocol(const SerialConnection::Ptr& pSerial, const ConnectionState::Ptr& pState)
		: m_pSerial(pSerial), m_pState(pState), m_version(GRBLVersion::GRBL1_1) { }

	void SetVersion(const std::string& version) noexcept
	{
		MILL_LOG("GRBL Version: " + version);
		m_version = StringUtil::StartsWith(version, "1.1") ? GRBLVersion::GRBL1_1 : GRBLVersion::GRBL1_0;
	}

	/// <summary>
	/// Determines whether the G-code can be sent with a non-empty buffer.
	/// </summary>
	/// <param name="gcode">The G-code line to check</param>
	/// <returns>True if buffer must be empty (all expected 'ok's must be read before writing the line). Otherwise false</returns>
	bool RequiresEmptyBuffer(const GCodeLine& gcode) const noexcept;

	/// <summary>
	/// Parses a line received from the mill, updating the machine state.
	/// </summary>
	/// <param name="line">The full line received from the mill, without the ending newline char.</param>
	/// <throws>MillException if the machine is no longer in a usable state (error, alarm, timeout, etc.)</throws>
	void ProcessResponse(const std::string& line);

	/// <summary>
	/// Returns the latest real-time status, updating it first if not recent.
	/// </summary>
	/// <param name="mutex">The connection mutex</param>
	/// <returns>The latest real-time status. This may be null. Will always be null for GRBL 1.0</returns>
	RealTimeStatusPtr QueryStatus();

private:
	SerialConnection::Ptr m_pSerial;
	ConnectionState::Ptr m_pState;
	GRBLVersion m_version;
};