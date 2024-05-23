set(cxx-sources drivers.cpp)
set(cxx-headers drivers.h)

add_library(crwrite-mill-drivers OBJECT ${cxx-sources} ${cxx-headers})
set_property(TARGET crwrite-mill-drivers PROPERTY POSITION_INDEPENDENT_CODE 1)
