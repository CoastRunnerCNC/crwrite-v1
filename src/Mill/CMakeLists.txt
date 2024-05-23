add_subdirectory(Drivers)
add_subdirectory(GRBL)
add_subdirectory(Display)
add_subdirectory(Firmware)

set(
  cxx-sources
  MillConnector.cpp
  MillErrorHandler.cpp
  MillException.cpp
  MillingManager.cpp
  Status/MillingError.cpp
)
set(
  cxx-headers
  MillConnector.h
  MillErrorHandler.h
  MillException.h
  CNCMill.h
  MillFinder.h
  MillingManager.h
  Status/ConnectionStatus.h
  Status/MillingError.h
  Status/MillingStatus.h
)

if(WIN32)
  list(APPEND cxx-sources MillFinder_win.cpp)
elseif(APPLE)
  list(APPEND cxx-sources MillFinder_osx.cpp)
else()
  list(APPEND cxx-sources MillFinder_linux.cpp)
endif()

add_library(crwrite-mill OBJECT ${cxx-sources} ${cxx-headers})
set_property(TARGET crwrite-mill PROPERTY POSITION_INDEPENDENT_CODE 1)
target_link_libraries(crwrite-mill PUBLIC crwrite-mill-grbl)
