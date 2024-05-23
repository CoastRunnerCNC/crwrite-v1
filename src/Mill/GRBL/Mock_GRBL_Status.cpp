#include "Mock_GRBL_Status.h"
using std::string;
using std::operator""s;
using std::to_string;
using std::pair;

////////////////////
// Utilities
////////////////////

string ToRoundedString(float num) {
	auto result = to_string(num);
	auto decimal = result.find('.');
	assert(decimal != string::npos);
	return result.substr(0, decimal + 5);
}

pair<string, Point>& MOCK_GRBL_STATUS::GetWCS(const string& wcs) noexcept {
	return const_cast<pair<string, Point>&>(*(
		std::find_if(m_Offsets.begin(), m_Offsets.end(),
			[ &wcs ] (auto& pair) { return pair.first == wcs; })
		));
}

////////////////////
// Implementation
////////////////////

string MOCK_GRBL_STATUS::Status(const Point position, const Point wcs) const noexcept {
	auto result = "<"s;

	switch (m_State) {
		case MACHINE_STATE::ALARM: { result += "Alarm"; } break;
		case MACHINE_STATE::IDLE: { result += "Idle"; } break;
		case MACHINE_STATE::RUN: { result += "Run"; } break;
		case MACHINE_STATE::CHECK: { result += "Check"; } break;
	}

	result += "|M:";
	result += ToRoundedString(position.x) + ',';
	result += ToRoundedString(position.y) + ',';
	result += ToRoundedString(position.z);

	result += "|B:";
	result += to_string(m_BufferStatus) + ',';
	result += to_string(m_BufferSpace);

	result += "|L:";
	result += to_string(m_LineNumber);

	result += '|';
	result += m_ProbeAlarm ? 'P' : '0';
	result += m_xLimit ? 'X' : '0';
	result += m_yLimit ? 'Y' : '0';
	result += m_zLimit ? 'Z' : '0';

	if (--m_CountStatusRequests == 0) {
		m_CountStatusRequests = 9;
		result += "|W:";
		result += ToRoundedString(wcs.x) + ',';
		result += ToRoundedString(wcs.y) + ',';
		result += ToRoundedString(wcs.z);
	}

	result += '>';
	return result;
}

string MOCK_GRBL_STATUS::ModalState() const noexcept {
	auto result = "[GC:"s;

	result += 'G' + EnumVal(m_MotionMode);
	result += " G" + EnumVal(m_CoordinateSystem);
	result += " G" + EnumVal(m_PlaneSelect);
	result += " G" + EnumVal(m_UnitMode);
	result += " G" + EnumVal(m_DistanceMode);
	result += " G" + EnumVal(m_FeedRateMode);
	result += " M" + EnumVal(m_SpindleState);
	result += " M9 T0 F" + ToRoundedString(m_FeedRate);
	result += " S" + to_string(m_SpindleSpeed);

	result += ']';
	return result;
}

void MOCK_GRBL_STATUS::PrintOffsets(QUEUE_THREADSAFE<string>& outputQ) noexcept {
	auto line = ""s;
	for (auto& pair : m_Offsets) {
		line = '[';
		line += pair.first + ':';
		line += ToRoundedString(pair.second.x);
		if (pair.first != "TLO") {
			line += ',' + ToRoundedString(pair.second.y);
			line += ',' + ToRoundedString(pair.second.z);
		}
		line += ']';
		outputQ.push(line);
	}
}