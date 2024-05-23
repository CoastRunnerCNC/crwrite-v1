#pragma once

#include "CNCMill.h"

// Find connected Coast Runners
// Implementation is OS specific
// There is a tie-in here for selecting the Mock GRBL for testing purposes
class MillFinder
{
public:
	std::list<CNCMill> GetAvailableCNCMills() const;
};
