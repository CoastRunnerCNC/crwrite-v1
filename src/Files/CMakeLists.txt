set(
  cxx-sources
  archive.cpp
  CRException.cpp
  CRFile.cpp
  GCodeFile.cpp
  GCodeLine.cpp
  job.cpp
  manifest.cpp
  operation.cpp
  yaml.cpp
)
set(
  cxx-headers
  archive.h
  CRException.h
  CRFile.h
  GCodeFile.h
  GCodeLine.h
  job.h
  manifest.h
  operation.h
  yaml.h
)
add_library(crwrite-files OBJECT ${cxx-sources} ${cxx-headers})
set_property(TARGET crwrite-files PROPERTY POSITION_INDEPENDENT_CODE 1)
target_link_libraries(crwrite-files PUBLIC minizip::minizip ZLIB::ZLIB Boost::filesystem)
