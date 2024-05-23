set(
  cxx-sources
  AVRDude.cpp
  FirmwareManager.cpp
  FirmwareUpdater.cpp
  FirmwareVersion.cpp
)
set(
  cxx-headers
  AVRDude.h
  FirmwareManager.h
  FirmwareUpdater.h
  FirmwareVersion.h
)
add_library(crwrite-firmware OBJECT ${cxx-sources} ${cxx-headers})
set_property(TARGET crwrite-firmware PROPERTY POSITION_INDEPENDENT_CODE 1)
target_link_libraries(crwrite-firmware PUBLIC crwrite-mill-grbl PRIVATE unofficial::tiny-process-library::tiny-process-library)
