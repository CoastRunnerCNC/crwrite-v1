#include "JogManager.h"
#include <Common/Logger.h>
#include <Common/Util/MathUtil.h>
#include <Mill/Display/MillDisplayManager.h>
using namespace MillLogger;

void Jog( MillConnection::Ptr pConnection, const EJogDirection direction,
	const bool continuous, const double distance_mm) noexcept {
	try
	{
		pConnection->GetSettings(false);
		pConnection->ExecuteCommand(GCodeLine{ "?", true });
	}
	catch (std::exception& e)
	{
		CR_LOG_F("Exception thrown when trying to query status: %s", e.what());
		MillDisplayManager::AddLine(ELineType::ERR, "Failed to query status. Is the machine still connected?");
		return;
	}

	const EAxis axis = JogDirection::GetAxis(direction);
	double distance = CalculateDistance(pConnection, direction, continuous, distance_mm);
	const int feedRate = 1000;
	const int units = pConnection->GetState().GetUnits();
	const std::string unitsStr = units == 20 ? "G20" : "G21";

	if (unitsStr == "G20")
	{
		distance = distance * 0.0393701;
	}

	// $J=G91 G20 X0.5 F10
	const std::string command = StringUtil::Format(
		"$J=G91 %s %s%.4f F%d", unitsStr.c_str(),
		Axis::ToString(axis).c_str(),
		distance,
		feedRate
	);
	CR_LOG_F("Jog Command: %s", command.c_str());

	// FUTURE: Create thread and jogging queue so we can just push commands to buffer and clear them all on a cancel jog command
	auto lock = pConnection->GetLock();
	if (pConnection->GetState().GetBuffer().fits(GCodeLine{ command }))
	{
		try
		{
			pConnection->ExecuteCommand(GCodeLine{ command });
		}
		catch (std::exception& e)
		{
			CR_LOG_F("Exception thrown when trying to jog: %s", e.what());
			return;
		}
	}
}

double CalculateDistance( MillConnection::Ptr pConnection, const EJogDirection direction,
	const bool continuous, const double distance_mm) noexcept
{
	const EAxis axis = JogDirection::GetAxis(direction);
	const bool positiveDirection = JogDirection::IsPositiveDirection(direction);

	auto limitsOpt = pConnection->GetSettings(false).GetSoftLimits();
	if (limitsOpt.has_value())
	{
		const auto pStatus = pConnection->GetState().GetRealTimeStatus();
		if (!pStatus) {
			MILL_LOG("Realtime status unavailable.");
			return positiveDirection ? 1.0 : -1.0;
		}
		const Measurement position = pStatus->GetPosition().GetMachinePosition().Get(axis);
		const Range range = limitsOpt.value().GetRange(axis);

		Measurement distance_to_limit = positiveDirection ?
			range.maximum() - position : position - range.minimum();

		double distance = std::fabs(distance_to_limit.millimeters());
		if (!continuous)
		{
			distance = (std::min)(distance, distance_mm);
		}

		distance = MathUtil::RoundDown(distance, 4);

		double backoffValue = positiveDirection ? -1.0 : 1.0;
		double returnDistance = positiveDirection ? distance : (distance * -1.0);
		if (continuous) { returnDistance += backoffValue; }
		return returnDistance;
	}
	else
	{
		return positiveDirection ? distance_mm : (distance_mm * -1.0);
	}	
}

void StopJogging(MillConnection::Ptr pConnection) noexcept {
	try
	{
		pConnection->ExecuteRealtime(0x85);
		pConnection->ExecuteCommand(GCodeLine{ "?", true });
	}
	catch (MillException& e)
	{
		CR_LOG_F("Jogging error: %s", e.what());
	}
	catch (...)
	{
		MILL_LOG("Jogging error: Unknown error");
	}
}
