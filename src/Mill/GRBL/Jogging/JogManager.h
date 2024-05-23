#pragma once

#include "JogDirection.h"
#include <Mill/GRBL/MillConnection.h>

// Jogging commands
void Jog( MillConnection::Ptr pConnection, const EJogDirection direction,
	const bool continuous, const double distance_mm ) noexcept;

void StopJogging(MillConnection::Ptr pConnection) noexcept;

double CalculateDistance( MillConnection::Ptr pConnection, const EJogDirection direction,
	const bool continuous, const double distance_mm ) noexcept;
