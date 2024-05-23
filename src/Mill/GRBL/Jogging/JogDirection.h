#pragma once

#include "Common/CommonHeaders.h"
#include <Common/Models/Axis.h>

enum class EJogDirection
{
	UP, // X: Raise table
	DOWN, // X: Lower Table
	LEFT, // Y: Gantry Left
	RIGHT, // Y: Gantry Right
	PLUNGE, // Z: Plunge
	RETRACT // Z: Retract
};

namespace JogDirection
{
	static EJogDirection FromString(const std::string& value)
	{
		if (value == "UP")
		{
			return EJogDirection::UP;
		}
		else if (value == "DOWN")
		{
			return EJogDirection::DOWN;
		}
		else if (value == "LEFT")
		{
			return EJogDirection::LEFT;
		}
		else if (value == "RIGHT")
		{
			return EJogDirection::RIGHT;
		}
		else if (value == "PLUNGE")
		{
			return EJogDirection::PLUNGE;
		}
		else if (value == "RETRACT")
		{
			return EJogDirection::RETRACT;
		}

		throw std::exception();
	}

	static EAxis GetAxis(const EJogDirection& direction) noexcept
	{
		switch (direction)
		{
			case EJogDirection::UP:
			case EJogDirection::DOWN:
			{
				return EAxis::X;
			}
			case EJogDirection::LEFT:
			case EJogDirection::RIGHT:
			{
				return EAxis::Y;
			}
			case EJogDirection::PLUNGE:
			case EJogDirection::RETRACT:
			{
				return EAxis::Z;
			}
		}

		return EAxis::X;
	}

	static bool IsPositiveDirection(const EJogDirection& direction) noexcept
	{
		switch (direction)
		{
			case EJogDirection::UP:
			case EJogDirection::LEFT:
			case EJogDirection::PLUNGE:
			{
				return false;
			}
			case EJogDirection::DOWN:
			case EJogDirection::RIGHT:
			case EJogDirection::RETRACT:
			{
				return true;
			}
		}

		return true;
	}
}
