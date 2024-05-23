#include "PositionAccumulator.h"
#include <Common/Logger.h>
using std::string;
using std::optional;

void POSITION_ACCUMULATOR::ApplyGCode(const GCodeLine& line) {
	try {
		auto chunks = ChunkGCodeLine(line.GetCleaned());
		// Use optionals because there may or may not be a target and there is no sensible default for no target
		// (Any position is potentially valid)
		auto xTarget = optional<float>{ std::nullopt };
		auto yTarget = optional<float>{ std::nullopt };
		auto zTarget = optional<float>{ std::nullopt };
		auto useWCS = true;

		if (line.GetGroup() == GCodeLine::GROUP_M_USER_DEFINED
			|| line.GetCleaned().find('$') != string::npos) {
			return;
		}

		for (auto chunk : chunks) {
			auto param = chunk.substr(1);
			switch (chunk[0]) {
				case 'X':
				{
					if (m_DistanceMode == DISTANCE_MODE::ABSOLUTE_MOTION) { xTarget = stof(param); }
					else { xTarget = m_Position.x + stof(param); }
				} break;
				case 'Y':
				{
					if (m_DistanceMode == DISTANCE_MODE::ABSOLUTE_MOTION) { yTarget = stof(param); }
					else { yTarget = m_Position.y + stof(param); }
				} break;
				case 'Z':
				{
					if (m_DistanceMode == DISTANCE_MODE::ABSOLUTE_MOTION) { zTarget = stof(param); }
					else { zTarget = m_Position.z + stof(param); }
				} break;
				case 'G':
				{
					auto n = param.find('.');
					if (n != string::npos) { param.erase(n, 1); }
					auto gNum = stoi(param);

					// Cast and assign enum values
					//if ((0 <= gNum && gNum <= 3) || (382 <= gNum && gNum <= 385) || gNum == 80) {
					//	m_MotionMode = static_cast<MOTION_MODE>(gNum);
					//	if (382 <= gNum && gNum <= 385) { m_Status.m_State = MACHINE_STATE::RUN; }
					//}
					if (gNum == 53) {
						useWCS = false;
					}
					//else if (54 <= gNum && gNum <= 59) {
					//	m_WCS = GetWCS(chunk).second;
					//	m_CoordinateSystem = static_cast<COORDINATE_SYSTEM>(gNum);
					//}
					else if (17 <= gNum && gNum <= 19) {
						m_PlaneSelect = static_cast<PLANE_SELECT>(gNum);
					}
					else if (gNum == 20 || gNum == 21) {
						m_UnitMode = static_cast<UNIT_MODE>(gNum);
					}
					else if (gNum == 90 || gNum == 91) {
						m_DistanceMode = static_cast<DISTANCE_MODE>(gNum);
					}
				} break;
			}
		}

		if (useWCS && m_DistanceMode != DISTANCE_MODE::RELATIVE_MOTION) {
			if (xTarget) { m_Position.x = *xTarget + m_WCS.x; }
			if (yTarget) { m_Position.y = *yTarget + m_WCS.y; }
			if (zTarget) { m_Position.z = *zTarget + m_WCS.z; }
		}
		else {
			if (xTarget) { m_Position.x = *xTarget; }
			if (yTarget) { m_Position.y = *yTarget; }
			if (zTarget) { m_Position.z = *zTarget; }
		}
	}
	catch (const std::exception e) {
		MILL_LOG(std::string{ "Position accumulation error: " } + e.what());
	}
}
