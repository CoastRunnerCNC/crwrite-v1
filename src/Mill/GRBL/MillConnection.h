#pragma once

#include "Common/CommonHeaders.h"
#include <Mill/MillException.h>
#include <Mill/CNCMill.h>
#include <Mill/Status/MillingError.h>
#include <Mill/GRBL/Settings/FeedRate.h>
#include <Mill/GRBL/Settings/MillSettings.h>
#include <Mill/GRBL/MillWriter.h>
#include <Mill/GRBL/Jogging/JogDirection.h>
#include <Mill/GRBL/Protocol/Protocol.h>
#include "Status/RealTimeStatus.h"
#include "SerialConnection.h"
#include "ConnectionState.h"
#include "Common/Util/CommonTypes.h"

#include <Common/Defs.h>
#include <Common/Models/Progress.h>
#include <Files/GCodeLine.h>
#include <Files/GCodeFile.h>
#include "PositionAccumulator.h"

using std::unique_ptr;
using std::shared_ptr;

/*
 * The class for dealing with the actual connection to a machine.
 * A lot of state is maintained to deal with GRBL.
 */
class MillConnection
{
public:
	using Ptr = std::shared_ptr<MillConnection>;

	static MillConnection::Ptr Connect(const CNCMill& cncMill);
	~MillConnection();

	// Connect/Disconnect
	void Disconnect(); // disconnects from the device
	void Reconnect(); // like reset, but does a full disconnect and connect
	bool Reset(bool sendSoftResetToGRBL = true); // Resets local state. Optionally reset GRBL by sending a ^X signal.
	void ProbeReset();	// Reset machine on failed probe attempt; Unlocks machine, etc.

	// Execute
	void ExecuteCommand(const GCodeLine& gcode, const bool isManualEntry = false);	// Execute a GCode command
	void ExecuteProgram(const std::vector<GCodeLine>& gcodes, const bool isManualEntry = false);	// Execute a batch of GCode
	void ExecuteRealtime(const char command); // Execute a real-time GCode command (?, ~, !, |)

	// MillSettings
	const MillSettings& GetSettings(const bool updateFirst = true);

	// Job Status
	Progress& GetProgress() noexcept { return m_progress; }
	const Progress& GetProgress() const noexcept { return m_progress; }

	// Connection Status
	bool IsAlarm() const noexcept { return GetState().IsAlarm(); }
	bool IsConnected() const noexcept { return GetState().IsConnected(); }
	bool IsLocked() const noexcept { return GetState().IsLocked(); }
	bool IsTimedOut() const noexcept { return GetState().IsTimedOut(); }
	bool IsHoming() const noexcept { return GetState().IsHoming(); }
	bool IsInError() const noexcept { return GetState().IsError(); }
	bool IsStartup() const noexcept { return GetState().IsStartup(); }

	// Send ? to GRBL, wait for response, and update status
	// Always fails on old mill with old GRBL 1.0 controller
	RealTimeStatusPtr QueryStatus()
	{
		VerifyConnected();
		return m_protocol.QueryStatus();
	}

	// Send ? command, read response, and update status
	void RefreshStatus() {
		m_pState->GetBuffer().push(GCodeLine{ "?", true });
		m_pSerialConnection->WriteLine("?");
		ReadResponse(true);
	}

	const ConnectionState& GetState() const noexcept
	{
		m_pState->UpdateState();
		return *m_pState;
	}

	// Getters
	const std::string& GetPath() const noexcept { return m_cncMill.GetPath(); }	// Path to mill serial port
	const CNCMill& GetCNCMill() const noexcept { return m_cncMill; }
	SerialConnection::Ptr GetSerial() noexcept { return m_pSerialConnection; }		// Serial connection object
    tl::optional<MillingError> GetError() const noexcept
    {
        if (m_pState->GetError() > 0) {
            return tl::make_optional(ErrorCodes::GetError(m_pState->GetError(), m_pState->GetErrorSource()));
        } else if (m_pState->GetAlarm() > 0) {
            return tl::make_optional(ErrorCodes::GetAlarm(m_pState->GetAlarm()));
        }

        return tl::nullopt;
    }
	std::vector<std::pair<std::string, Point3>> GetOffsets() noexcept;	// All WCS offsets and other offsets

	// Feed Rate
	int GetFeedRateSlider() const noexcept { return m_pFeedRate->GetSlider(); }
	void SetFeedRateSlider(const int slider) noexcept { m_pFeedRate->SetSlider(slider); }

	// Emergency Stop
	void EmergencyStop();

	// Provide locking mechanism to outside functions/classes that need exclusive access to machine
	// Issue with Clang/GCC: GitHub versions are failing to do manditory copy elision necessary to return std::lock_guard
	// This does work in C++17 mode on these compilers as verified by Compiler Explorer
	// https://godbolt.org/z/ex1asfM9z
	std::unique_lock<std::recursive_mutex> GetLock() {
		return std::unique_lock<std::recursive_mutex>{ m_mutex };
	}
	
	// If blocking, will read until buffer empty (all expected 'ok's returned)
	void ReadResponse(const bool blocking);
	std::string ReadResponseWithoutProcessing();	// Read response without automatic response processing
	bool EstopEngaged() { return m_pState->GetAlarm() == ALARM_CODE_ESTOP; }
	Point3 GetLastProbedPoint();	// Result of last probing operation
	void SaveProbeResult(const std::string& resultStr);	// Save result string of probe response
	Point3 GetCurrentPosition();
	Vector3 GetCurrentWCS();
private:
	MillConnection(
		const CNCMill& cncMill,
		const ConnectionState::Ptr& pState,
		const SerialConnection::Ptr& pSerial
	);

	struct SAVED_PREPROBE_STATE {
		Point3 position{ };
		std::vector<std::string> gStates{ };
		std::string coolantState{ };
		std::string spindleState{ };
		std::string toolNumber{ };
		std::string feedRate{ };
		std::string spindleRPM{ };
	};

	void Connect();

	void VerifyConnected() const;

	void ExecuteLine(const GCodeLine& gcode, const bool useBuffer, const bool manualEntry);	// Private implementation of executing GCode
	bool TryProbeOperation(const GCodeLine& line);	// Wrap probe operation for posible recovery upon failure
	void RestorePreprobeState();					// Reset machine state to saved state just before probe operation
	void TransformZAndWriteLine(const GCodeLine& line);	// Modify Z value of GCode for contour map mode

	Progress m_progress;

	FeedRate::Ptr m_pFeedRate;
	std::unique_ptr<SAVED_PREPROBE_STATE> m_SavedPreprobeState{ nullptr };

	mutable std::recursive_mutex m_mutex;
	mutable std::mutex m_probePointLock;	// Use locking as workaround for GCC issue linking atomic operations on custom types
	SerialConnection::Ptr m_pSerialConnection;
	CNCMill m_cncMill;
	ConnectionState::Ptr m_pState;
	Protocol m_protocol;
	MillWriter::UPtr m_pWriter;

	POSITION_ACCUMULATOR m_accumulatedPosition{};
	Point3 m_lastProbedPoint{};
	std::atomic_bool m_emergencyStop;
};
