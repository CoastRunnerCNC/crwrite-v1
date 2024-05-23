#include "Mock_GRBL.h"
#include "Common/Logger.h"
#include "Files/GCodeLine.h"

using std::string;
using std::operator""s;
using namespace std::chrono_literals;
using std::to_string;
using std::this_thread::sleep_for;
using std::vector;
using std::stoi;
using std::stof;
using std::find_if;

constexpr auto moveInstantaneously = true;

constexpr auto homePosition = Point{ -86.f, -0.5f, -0.5f };
constexpr auto maxFeedRate = 2000;
constexpr auto maxSpindleRPM = 8000;
constexpr auto latency = 2ms;
constexpr auto maxSpeedX = 2540;	// mm/min
constexpr auto maxSpeedY = 2540;	// mm/min
constexpr auto maxSpeedZ = 2540;	// mm/min
constexpr auto minX = -86.5f;	// mm
constexpr auto minY = -241.0f;	// mm
constexpr auto minZ = -78.5f;	// mm

constexpr auto grbl$$Response =
R"($0=10 (stepPulse)
$1 = 100 (idleDelay)
$2 = 0 (stepMask)
$3 = 0 (dirMask)
$4 = 0 (stepEn)
$5 = 1 (limLVL)
$6 = 0 (prbLVL)
$10 = 127 (statMask)
$11 = 0.020 (jncDev)
$12 = 0.002 (arcTol)
$13 = 0 (Inch)
$20 = 1 (softLim)
$21 = 1 (hardLim)
$22 = 1 (homeEn)
$23 = 1 (homeDirMask)
$24 = 30.000 (homeFine)
$25 = 2000.000 (homeSeek)
$26 = 1 (homeDelay)
$27 = 0.500 (homePulloff)
$30 = 8000 (rpmMax)
$31 = 0 (rpmMin)
$100 = 400.000 (x:stp/mm)
$101 = 400.000 (y:stp/mm)
$102 = 400.000 (z:stp/mm)
$110 = 2540.000 (x:mm/min)
$111 = 3100.000 (y:mm/min)
$112 = 3100.000 (z:mm/min)
$120 = 500.000 (x:mm/s^2)
$121 = 500.000 (y:mm/s^2)
$122 = 500.000 (z:mm/s^2)
$130 = 86.500 (x:mm max)
$131 = 241.500 (y:mm max)
$132 = 78.500 (z:mm max))";

////////////////////
// Utilities
////////////////////

/*vector<string> ChunkGCodeLine(const string& line) {
	auto n = -1;
	auto temp = ""s;
	auto result = vector<string>{ };
	while (++n < line.size()) {
		if (!temp.empty() && isalpha(line[n]) &&  (line[n] != 'P' && line[n] != 'L')) {
			result.push_back(temp);
			temp.clear();
		}
		temp.push_back(line[n]);
	}
	result.push_back(temp);
	assert(!result.empty());
	return result;
}*/

void CleanCommand(string& line) {
	auto n = 0;
	bool inComment = false;
	while (n < line.size()) {
		if (line[n] == ' ') { line.erase(n, 1); }
		else if (line[n] == '(') { inComment = true; }
		else if (line[n] == ')') { inComment = false; }
		else if (line[n] == ';') { line.erase(n); }
		else { ++n; }
	}
}

////////////////////
// Implementation
////////////////////

void MOCK_GRBL::Connect() noexcept {
	auto startup = [this] () {
		std::this_thread::sleep_for(5ms);
		m_OutputQ.push("Grbl 1.1h [help:'$']");
		m_OutputQ.push("[MSG:$H/$X]");
	};
	std::thread(startup).detach();
}

void MOCK_GRBL::Disconnect() noexcept {
	
}

void MOCK_GRBL::Write(const std::string& msg) noexcept {
	assert(!msg.empty());
	if (msg == "?") {
		m_OutputQ.push(m_Status.Status(m_Position, m_WCS));
		m_OutputQ.push("ok");
	}
	else { m_InputQ.push(msg); }
}

void MOCK_GRBL::DoGRBLThings() noexcept {
	while (m_KeepRunning.load(std::memory_order_acquire)) {
		if (m_Status.m_State == MACHINE_STATE::LOCKED_WITH_ALARM) { sleep_for(latency); continue; }

		auto msg = ""s;
		auto ignoreWCS = false;
		if (m_InputQ.load_and_pop(msg)) {
			// TODO: Clean msg here...
			const auto rawMsg = msg;

			try {
				if (msg[0] == '$') {
					// $ Actions
					if (msg == "$H") {
						sleep_for(3s);
						m_Status.m_State = MACHINE_STATE::IDLE;
						m_Position = homePosition;
					}
					else if (msg == "$X") {
						sleep_for(10ms);
						m_Status.m_State = MACHINE_STATE::IDLE;
					}
					else if (msg == "$I") { m_OutputQ.push(m_Firmware); }
					else if (msg == "$G") { m_OutputQ.push(m_Status.ModalState()); }
					else if (msg == "$#") { m_Status.PrintOffsets(m_OutputQ); }
					else if (msg == "$$") { m_OutputQ.push(grbl$$Response); }
					else if (msg == "$RST=#") {
						for (auto& pair: m_Status.m_Offsets) {
							pair.second = Point{ };
						}
					}
				}
				else if (m_Status.m_State == MACHINE_STATE::IDLE || m_Status.m_State == MACHINE_STATE::CHECK) {
					auto chunks = ChunkGCodeLine(msg);
					for (auto& chunk : chunks) {
						auto breakEarly = false;
						auto param = chunk.substr(1);
						// Update modal states
						switch (chunk[0]) {
							case 'F': {
								auto newRate = stof(param);
								if (newRate < 0) { newRate = 0; }
								else if (newRate > maxFeedRate) { newRate = maxFeedRate; }
								m_Status.m_FeedRate = newRate;
							} break;
							case 'S': {
								auto newSpeed = stoi(param);
								if (newSpeed < 0) { newSpeed = 0; }
								else if (newSpeed > maxSpindleRPM) { newSpeed = maxFeedRate; }
								m_Status.m_SpindleSpeed = newSpeed;
							} break;
							case 'X': {
								m_xTarget = stof(param);
								m_Status.m_State = MACHINE_STATE::RUN;
							} break;
							case 'Y': {
								m_yTarget = stof(param);
								m_Status.m_State = MACHINE_STATE::RUN;
							} break;
							case 'Z': {
								m_zTarget = stof(param);
								m_Status.m_State = MACHINE_STATE::RUN;
							} break;
							case 'G': {
								auto n = param.find('.');
								if (n != string::npos) { param.erase(n, 1); }
								auto gNum = stoi(param);

								// Cast and assign enum values
								if ( (0 <= gNum && gNum <= 3) || (382 <= gNum && gNum <= 385) || gNum == 80 ) {
									m_Status.m_MotionMode = static_cast<MOTION_MODE>(gNum);
									if (382 <= gNum && gNum <= 385) { m_Status.m_State = MACHINE_STATE::RUN; }
								}
								else if (gNum == 53) {
									m_Status.m_State = MACHINE_STATE::RUN;
									ignoreWCS = true;
								}
								else if (54 <= gNum && gNum <= 59) {
									m_WCS = m_Status.GetWCS(chunk).second;
									m_Status.m_CoordinateSystem = static_cast<COORDINATE_SYSTEM>(gNum);
								}
								else if (17 <= gNum && gNum <= 19) {
									m_Status.m_PlaneSelect = static_cast<PLANE_SELECT>(gNum);
								}
								else if (gNum == 20 || gNum == 21) {
									m_Status.m_UnitMode = static_cast<UNIT_MODE>(gNum);
								}
								else if (gNum == 90 || gNum == 91) {
									m_Status.m_DistanceMode = static_cast<DISTANCE_MODE>(gNum);
								}
								else if (gNum == 93 || gNum == 94) {
									m_Status.m_FeedRateMode = static_cast<FEEDRATE_MODE>(gNum);
								}
								else if (gNum == 10) {
									auto xLine = find_if(chunks.begin(), chunks.end(), [ ] (auto& val) { return val[0] == 'X'; });
									
									auto pIndex = chunk.find('P');
									if (pIndex == string::npos) { throw std::runtime_error{ "Parsing error." }; }
									auto wcsPosition = string{ chunk[pIndex + 1] };

									auto lIndex = chunk.find('L');
									if (lIndex == string::npos) { throw std::runtime_error{ "Parsing error." }; }
									auto useRelativePosition = (chunk[lIndex + 1] == '2') && (chunk[lIndex + 2] == '0');

									auto wcs = static_cast<COORDINATE_SYSTEM>(stoi(wcsPosition) + 53);
									auto& wcsRef = m_Status.GetWCS('G' + EnumVal(wcs));
									if (xLine != chunks.end()) {
										wcsRef.second.x = stof(xLine->substr(1));
										if (useRelativePosition) { wcsRef.second.x += m_Position.x; }
									}
									auto yLine = find_if(chunks.begin(), chunks.end(), [ ] (auto& val) { return val[0] == 'Y'; });
									if (yLine != chunks.end()) {
										wcsRef.second.y = stof(yLine->substr(1));
										if (useRelativePosition) { wcsRef.second.y += m_Position.y; }
									}
									auto zLine = find_if(chunks.begin(), chunks.end(), [ ] (auto& val) { return val[0] == 'Z'; });
									if (zLine != chunks.end()) {
										wcsRef.second.z = stof(zLine->substr(1));
										if (useRelativePosition) { wcsRef.second.z += m_Position.z; }
									}
									if (wcs == m_Status.m_CoordinateSystem) { m_WCS = wcsRef.second; }

									breakEarly = true;
								}
								else if (gNum == 4 || gNum == 921) {
									// TODO: Implement
								}
								// Action GCodes
								else if (gNum == 28 || gNum == 281 || gNum == 30 
									|| gNum == 301 || gNum == 431 || gNum == 49) {
									m_OutputQ.push("[echo:" + chunk + ']');
									m_OutputQ.push("[MSG:Not yet implemented]");
									m_OutputQ.push("error:0");
								}
								else { throw std::runtime_error{ "Parsing error." }; }	// Unknown GCode value
							} break;
							case 'M': {
								auto mNum = stoi(param);
								if (3 <= mNum && mNum <= 5) {
									m_Status.m_SpindleState = static_cast<SPINDLE_STATE>(mNum);
								}
								else if (mNum == 100) {
									//auto WCS1 = chunks[1].substr(1);
									//auto WCS2 = chunks[3].substr(1);
									//auto targetWCS = GetWCS(chunks[5].substr(1));
									//targetWCS.second.x = (GetWCS(WCS1).second.x + GetWCS(WCS2).second.x) / 2;
									breakEarly = true;
								}
								else if (mNum == 0 || mNum == 2 || mNum == 17 || mNum == 18 || mNum == 101) {
									m_OutputQ.push("[echo:" + chunk + ']');
									m_OutputQ.push("[MSG:Not yet implemented]");
									m_OutputQ.push("error:0");
								}
								else { throw std::runtime_error{ "Parsing error." }; }
							} break;
						}
						if (breakEarly) { break; }
					}
					if (m_Status.m_MotionMode == MOTION_MODE::LINEAR && m_Status.m_FeedRate <= 0) { throw std::runtime_error{ "Parsing error." }; }	// G1 needs a feed rate
					if (chunks.size() == 1) { m_OutputQ.push(chunks[0]); }
				}

				if (m_Status.m_State != MACHINE_STATE::RUN) { m_OutputQ.push("ok"); }
				//m_OutputQ.push("ok");
			}
			catch (...) {
				m_OutputQ.push("[echo:" + rawMsg + ']');
				m_OutputQ.push("[MSG:Parsing error]");
				m_OutputQ.push("error:0");
			}
		}

		// TODO: Compute movement
		if (m_Status.m_State == MACHINE_STATE::RUN && !m_IsLocked && !m_IsDwelling) {
			// Do movement
			//auto diff = 4ms - 1ms;
			//auto x = diff.count();

			//using std::chrono::duration_cast
			//constexpr auto milliToMin = 1000 * 60;	// Milliseconds to minutes
			//auto diffMilliseconds = (std::chrono::system_clock::now() - m_MostRecentUpdateTime).count();
			// auto speedCap = ;

			//m_Position.x += diffMilliseconds * milliToMin * maxSpeedX;

			if constexpr (moveInstantaneously) {
				if (ignoreWCS) {
					if (m_xTarget) { m_Position.x = *m_xTarget; }
					if (m_yTarget) { m_Position.y = *m_yTarget; }
					if (m_zTarget) { m_Position.z = *m_zTarget; }
				}
				else {
					if (m_xTarget) { m_Position.x = *m_xTarget + m_WCS.x; }
					if (m_yTarget) { m_Position.y = *m_yTarget + m_WCS.y; }
					if (m_zTarget) { m_Position.z = *m_zTarget + m_WCS.z; }
				}

				m_xTarget = std::nullopt;
				m_yTarget = std::nullopt;
				m_zTarget = std::nullopt;

				// Check Limits
				if (m_Position.x < minX || m_Position.y < minY || m_Position.z < minZ) {
					if (m_Position.x < minX) { m_Status.m_xLimit = true; }
					if (m_Position.y < minY) { m_Status.m_yLimit = true; }
					if (m_Position.z < minZ) { m_Status.m_zLimit = true; }

					m_Status.m_State = MACHINE_STATE::ALARM;
					m_OutputQ.push("ALARM:2");
					continue;
				}
				else if (m_Position.x > 0|| m_Position.y > 0 || m_Position.z > 0) {
					if (m_Position.x > 0) { m_Status.m_xLimit = true; }
					if (m_Position.y > 0) { m_Status.m_yLimit = true; }
					if (m_Position.z > 0) { m_Status.m_zLimit = true; }

					m_Status.m_State = MACHINE_STATE::ALARM;
					m_OutputQ.push("ALARM:1");
					continue;
				}

				if (m_Status.m_MotionMode == MOTION_MODE::PROBE_UNTIL_CONTACT_WITH_ALARM
					|| m_Status.m_MotionMode == MOTION_MODE::PROBE_UNTIL_CLEAR_WITH_ALARM) {
					m_Status.m_State = MACHINE_STATE::ALARM;
					//m_OutputQ.push("ALARM:5");
					m_Status.m_State = MACHINE_STATE::IDLE;
					m_OutputQ.push("[PRB:" + to_string(m_Position.x) + "," + to_string(m_Position.y)
						+ "," + to_string(m_Position.z) + ":1]");
					m_OutputQ.push("ok");
				}
				else {
					m_Status.m_State = MACHINE_STATE::IDLE;
					m_OutputQ.push("ok");
				}
			}
		}
		
		sleep_for(latency);
	}
}
