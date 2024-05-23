#pragma once

#include "Common/CommonHeaders.h"
#include <Mill/GRBL/MillConnection.h>
#include <Mill/Status/MillingError.h>
#include <Mill/MillException.h>

// Access and handle certain milling errors
class MillErrorHandler
{
public:
	static MillingError GetError(
		const MillConnection::Ptr& pConnection,
		const MillException& exception
	);
};