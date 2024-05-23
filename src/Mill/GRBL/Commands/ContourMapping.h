#include "Common/CommonHeaders.h"
#include <Common/Util/CommonTypes.h>
#include <Mill/GRBL/SerialConnection.h>

inline std::atomic<bool> g_useContourMap = false;

// Custom GCode commands for contour map usage
void M111(const SerialConnection::Ptr& pSerial, const std::string& params);
void M112();
void M113();
void M114();

// Execute contour map adjustment on GCode line
std::string TransformAbsoluteZ(const GCodeLine& line, const Point3 origPt, const Vector3 wcs);
std::string TransformRelativeZ(const GCodeLine& line, const Point3 previousPt, const Point3 nextPt);
