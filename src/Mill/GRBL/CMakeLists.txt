set(
  cxx-sources
  MillConnection.cpp
  MillWriter.cpp
  Jogging/JogManager.cpp
  Commands/M100.cpp
  Commands/M101.cpp
  Commands/M102.h
  Commands/M106.cpp
  Commands/ContourMapping.cpp
  Protocol/Protocol.cpp
  Mock_GRBL.cpp
  Mock_GRBL_Status.cpp
  PositionAccumulator.cpp
 )
set(
  cxx-headers
  Protocol/Protocol.h
  Jogging/JogManager.h
  Settings/FeedRate.h
  Settings/MillSettings.h
  Settings/SoftLimits.h
  Status/BufferState.h
  Status/LimitSwitchState.h
  Status/RealTimeCoordinates.h
  Status/RealTimePosition.h
  Status/RealTimeRates.h
  Status/RealTimeStatus.h
  Buffer.h
  ConnectionState.h
  MillConnection.h
  MillWriter.h
  SerialConnection.h
  Regex.h
  Mock_GRBL.h
  Mock_GRBL_Status.h
  Commands/ContourMapping.h
  PositionAccumulator.h
  )

if(WIN32)
  list(APPEND cxx-sources SerialConnection_windows.cpp)
else(WIN32)
  list(APPEND cxx-sources SerialConnection.cpp)
endif(WIN32)

add_library(crwrite-mill-grbl OBJECT ${cxx-sources} ${cxx-headers})
set_property(TARGET crwrite-mill-grbl PROPERTY POSITION_INDEPENDENT_CODE 1)
target_link_libraries(crwrite-mill-grbl PUBLIC jsoncpp_lib PRIVATE Boost::headers)
