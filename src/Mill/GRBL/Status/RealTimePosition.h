#pragma once

#include "Common/CommonHeaders.h"
#include "RealTimeCoordinates.h"
#include <Common/Util/StringUtil.h>
#include <json/json.h>

enum class EPositionType
{
	MACHINE,
	WORK
};

// Wraps access to position data and provides specific access types
class RealTimePosition
{
public:
	RealTimePosition(const EPositionType& type, const RealTimeCoordinates& coordinates)
		: m_type(type), m_coordinates(coordinates)
	{

	}

	/* PARSERS */
	static RealTimePosition Parse(const std::string& positionStr, const Measurement::Unit unit)
	{
		const std::pair<std::string, std::string> positionParts = StringUtil::SplitOnce(positionStr, ":");
		EPositionType positionType = ParsePositionType(positionParts.first);
		RealTimeCoordinates coordinates = RealTimeCoordinates::Parse(positionParts.second, unit);
		return RealTimePosition(positionType, coordinates);
	}

	/* JSON */
	Json::Value ToJSON(EPositionType type, std::shared_ptr<RealTimeCoordinates> workCoordinateOffset) const
	{
		if (m_type == type)
		{
			return m_coordinates.ToJSON();
		}
		else if (workCoordinateOffset != nullptr)
		{
			if (type == EPositionType::MACHINE)
			{
				return GetMachinePosition(*workCoordinateOffset).ToJSON();
			}
			else
			{
				return GetWorkPosition(*workCoordinateOffset).ToJSON();
			}
		}

		return Json::Value(Json::nullValue);
	}

	/* GETTERS */
	RealTimeCoordinates GetMachinePosition(const RealTimeCoordinates& workCoordinateOffsets) const
	{
		if (m_type == EPositionType::MACHINE)
		{
			return m_coordinates;
		}
		else
		{
			return m_coordinates + workCoordinateOffsets;
		}
	}

	RealTimeCoordinates GetMachinePosition() const
	{
		assert(m_type == EPositionType::MACHINE);
		return m_coordinates;
	}

	RealTimeCoordinates GetWorkPosition(const RealTimeCoordinates& workCoordinateOffsets) const
	{
		if (m_type == EPositionType::WORK)
		{
			return m_coordinates;
		}
		else
		{
			return m_coordinates - workCoordinateOffsets;
		}
	}

private:
	EPositionType m_type;
	RealTimeCoordinates m_coordinates;

	static EPositionType ParsePositionType(const std::string& positionType)
	{
		if (StringUtil::StartsWith(positionType, "M"))
		{
			return EPositionType::MACHINE;
		}
		else if (StringUtil::StartsWith(positionType, "W"))
		{
			return EPositionType::WORK;
		}
		else
		{
			throw std::exception{ };
		}
	}
};