#include <Mill/GRBL/Protocol/Protocol.h>
#include <Mill/MillException.h>
#include <Mill/GRBL/Regex.h>
#include <MillDaemon.h>

void Protocol::ProcessResponse(const std::string& line)
{
	if (StringUtil::Trim(line).empty()) {
		return;
	}

	if (line == "ok" || line == "0k" || line == "1k" || line == "2k" || line == "3k" || std::regex_match(line, GRBL::RXOK)) {
		m_pState->GetBuffer().pop();
		return;
	}

	if (line.size() != 0 && StringUtil::StartsWith(line, "[PRB:")) {
		auto conn = MillDaemon::GetInstance().GetConnection();
		if (conn != nullptr) {
			conn->SaveProbeResult(line);
		}
	}

	MILL_LOG("READ: " + line);
	if (StringUtil::StartsWith(line, "error:")) {
		auto gcode_line = m_pState->GetBuffer().pop();
		
		int error_num = -1;
		if (m_version == GRBLVersion::GRBL1_1) {
			error_num = std::stoi(line.substr(6));
		}

		std::string error_message = "";
		if (m_version == GRBLVersion::GRBL1_0) {
			error_message = line.substr(6);
		}

		m_pState->SetError(error_num, error_message, gcode_line);
		throw MillException(MillException::GRBL_ERROR, error_message);
	}

	// TODO: We should probably actually honor this (RXENABLED should set check mode = true)
	if (std::regex_match(line, GRBL::RXENABLED) || std::regex_match(line, GRBL::RXDISABLED)) {
		m_pState->SetCheckMode(false);
		return;
	}

	if (std::regex_match(line, GRBL::RXLOCKED) || line.find("[MSG:Reset") != std::string::npos) {
		MILL_LOG("Machine locked.");
		m_pState->SetLocked(true);
		throw MillException(MillException::MACHINE_LOCKED, "Machine locked. Reset to continue.");
	}

	std::smatch sm;
	if (std::regex_match(line, sm, GRBL::RXSETTINGS)) {
		m_pState->UpdateSetting(
			(uint8_t)std::stoi(sm[1].str()),
			std::stof(sm[2].str())
		);
		return;
	}

	if (StringUtil::StartsWith(line, "<")) {
		const auto unit = m_pState->GetSettings().GetUnit();
		const auto wcs = m_pState->GetWCS();
		const auto parserUnits = m_pState->GetUnits();
		const auto movementType = m_pState->GetMovementType();

		try {
			RealTimeStatus status = m_version == GRBLVersion::GRBL1_0 ?
				RealTimeStatus::ParseV0(line, wcs, unit, parserUnits, movementType) :
				RealTimeStatus::Parse(line, wcs, unit, parserUnits, movementType);

			if (status.GetWorkCoordinates() == nullptr) {
				auto pCurrentStatus = m_pState->GetRealTimeStatus();
				if (pCurrentStatus != nullptr) {
					status.AddWorkCoordinates(m_pState->GetWCS(), pCurrentStatus->GetWorkCoordinates());
				}
			}

			m_pState->SetRealTimeStatus(std::make_shared<RealTimeStatus>(std::move(status)));
		}
		catch (std::exception& e) {
			CR_LOG_F("Failed to parse RealTimeStatus: %s", e.what());
		}

		return;
	}

	if (StringUtil::StartsWith(line, "ALARM:")) {
		int alarm_num = -1;
		if (m_version == GRBLVersion::GRBL1_1) {
			alarm_num = std::stoi(line.substr(6));
		}

		std::string description = "";
		if (m_version == GRBLVersion::GRBL1_0) {
			description = line.substr(6);
		}

		m_pState->SetAlarm(alarm_num);

		if (alarm_num == 4 || alarm_num == 5 || description == "Probe fail") {
			throw MillException(MillException::ALARM_PROBE);
		} else if (alarm_num == 2 || description == "Hard/soft limit") {
			throw MillException(MillException::ALARM_LIMIT);
		} else {
			throw MillException(MillException::ALARM, description);
		}
	}

	if (line == "[MSG:Reset to cont]" || line == "[MSG:Reset to continue]") {
		// TODO: Determine alarm type. SetAlarm?
		m_pState->SetLocked(true);
		throw MillException(MillException::MACHINE_LOCKED, "Machine locked. Reset to continue.");
	}
}

// If true, all expected 'ok's must be read before writing line.
bool Protocol::RequiresEmptyBuffer(const GCodeLine& gcode) const noexcept
{
	if (gcode.GetCleaned().empty()) {
		return false;
	}

	if (gcode.GetType() == GCodeLine::TYPE_GRBL || gcode.GetType() == GCodeLine::TYPE_MCODE) {
		return true;
	} else if (gcode.GetType() == GCodeLine::TYPE_GCODE) {
		return (m_pState->GetLastGCodeGroup() != GCodeLine::GROUP_G_MOTION || gcode.GetGroup() != GCodeLine::GROUP_G_MOTION);
	} else if (gcode.GetType() == GCodeLine::TYPE_AXIS_FEED_SPINDLE) {
		return m_pState->GetLastGCodeGroup() != GCodeLine::GROUP_G_MOTION;
	}

	return true;
}

//
// ? : Status Report Query
//
// Immediately generates and sends back runtime data with a status report.
// Accepts and executes this command at any time, except during a homing cycle and when critical alarm (hard/soft limit error) is thrown.
//
RealTimeStatusPtr Protocol::QueryStatus() {

	if (m_pState->IsRealTimeStatusRecent()) {
		return m_pState->GetRealTimeStatus();
	}

	try {
		if (!m_pState->IsLocked() && !m_pState->IsTimedOut()) {
			m_pSerial->WriteChar('?');

			for (int attempts = 0; attempts < 5; attempts++) {
				auto pLine = m_pSerial->ReadLine();
				if (pLine != nullptr) {
					ProcessResponse(*pLine);
					if (m_pState->IsRealTimeStatusRecent()) {
						return m_pState->GetRealTimeStatus();
					}
				}
				else {
					Sleep(5);
				}
			}
		}

	}
	catch (...) { }

	return m_pState->GetRealTimeStatus();
}