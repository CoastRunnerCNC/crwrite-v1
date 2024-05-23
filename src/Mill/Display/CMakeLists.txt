set(
  cxx-sources
  MillDisplayManager.cpp
)
set(
  cxx-headers
  MillDisplayManager.h
  LineType.h
)
add_library(crwrite-mill-display OBJECT ${cxx-sources} ${cxx-headers})
set_property(TARGET crwrite-mill-display PROPERTY POSITION_INDEPENDENT_CODE 1)
