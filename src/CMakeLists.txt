cmake_minimum_required(VERSION 3.12.4)
set(CMAKE_OSX_DEPLOYMENT_TARGET
    "10.12"
    CACHE STRING "Minimum OS X deployment version")

set(MILL_SOFTWARE_VERSION 1.0.5)
project(crwrite VERSION ${MILL_SOFTWARE_VERSION})

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_BUILD_TYPE RelWithDebInfo)
set(CMAKE_MAP_IMPORTED_CONFIG_MINSIZEREL MinSizeRel Release)
set(CMAKE_MAP_IMPORTED_CONFIG_RELWITHDEBINFO "RelWithDebInfo;Release;")

if(WIN32)
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /std:c++17 /MP")
  #set(CMAKE_GENERATOR_PLATFORM "Win32")
  string(REPLACE "/MD" "/MT" CMAKE_CXX_FLAGS_RELEASE
                 "${CMAKE_CXX_FLAGS_RELEASE}")
  string(REPLACE "/MD" "/MT" CMAKE_CXX_FLAGS_RELWITHDEBINFO
                 "${CMAKE_CXX_FLAGS_RELWITHDEBINFO}")
else(WIN32)
  if(APPLE)
    set(CMAKE_CXX_FLAGS
        "${CMAKE_CXX_FLAGS} -std=c++17 -stdlib=libc++ -Wdeprecated-declarations -Wnonportable-include-path"
    )
    set(CMAKE_EXE_LINKER_FLAGS
        "${CMAKE_EXE_LINKER_FLAGS} -framework CoreFoundation -framework IOKit")
  else(APPLE)
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++17")
  endif(APPLE)
endif(WIN32)

set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/${CMAKE_BUILD_TYPE})
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

# Dependencies
set(CMAKE_MODULE_PATH ${CMAKE_CURRENT_SOURCE_DIR}/CMake)
string(TOUPPER "${CMAKE_BUILD_TYPE}" BUILD_TYPE_SUFFIX)
if(BUILD_TYPE_SUFFIX MATCHES "DEBUG")
  set(IMPORT_BUILD_TYPE "DEBUG")
else()
  set(IMPORT_BUILD_TYPE "RELEASE")
endif()

find_package(Boost REQUIRED COMPONENTS iostreams system thread filesystem)
find_package(Catch2 CONFIG REQUIRED)

if(NOT APPLE)
  find_package(Filesystem REQUIRED)
endif(NOT APPLE)

find_package(jsoncpp CONFIG REQUIRED)
get_target_property(jsoncpp_LIBRARIES jsoncpp_lib 
                    IMPORTED_LOCATION_${IMPORT_BUILD_TYPE})
find_package(minizip CONFIG REQUIRED)
get_target_property(minizip_LIBRARIES minizip::minizip
                    IMPORTED_LOCATION_${IMPORT_BUILD_TYPE})
find_package(OpenSSL REQUIRED)
find_package(spdlog CONFIG REQUIRED)
get_target_property(spdlog_LIBRARIES spdlog::spdlog
                    IMPORTED_LOCATION_${IMPORT_BUILD_TYPE})
find_package(Threads REQUIRED)
find_package(unofficial-tiny-process-library CONFIG REQUIRED)
get_target_property(
  tinyprocesslibrary_LIBRARIES
  unofficial::tiny-process-library::tiny-process-library
  IMPORTED_LOCATION_${IMPORT_BUILD_TYPE})
find_package(ZLIB REQUIRED)

include(NodeJS)
nodejs_init()

add_definitions(-DMILL_SOFTWARE_VERSION="${MILL_SOFTWARE_VERSION}")

if(WIN32)
  add_definitions(-DWIN32_LEAN_AND_MEAN)
endif()

include_directories(
  ${CMAKE_CURRENT_SOURCE_DIR} ${CMAKE_CURRENT_SOURCE_DIR}/deps/ghc/include
  ${CMAKE_CURRENT_SOURCE_DIR}/deps/optional/include)

set(CMAKE_INSTALL_NAME_DIR "@executable_path")
set(CMAKE_BUILD_WITH_INSTALL_RPATH TRUE)

add_subdirectory(Common)
add_subdirectory(Mill)
add_subdirectory(Files)
add_subdirectory(Services)
add_subdirectory(Settings)

if(WIN32)
  set(MILL_SOFTWARE_SRC "")
else(WIN32)
  set(MILL_SOFTWARE_SRC
      "${jsoncpp_LIBRARIES}"
      "${minizip_LIBRARIES}"
      "${OPENSSL_CRYPTO_LIBRARY}"
      "${OPENSSL_SSL_LIBRARY}"
      "${tinyprocesslibrary_LIBRARIES}"
      "${ZLIB_LIBRARIES}"
      "${spdlog_LIBRARIES}")
endif(WIN32)

list(
  APPEND
  MILL_SOFTWARE_SRC
  "${CMAKE_CURRENT_SOURCE_DIR}/MillDaemon.cpp"
  $<TARGET_OBJECTS:crwrite-common>
  $<TARGET_OBJECTS:crwrite-files>
  $<TARGET_OBJECTS:crwrite-firmware>
  $<TARGET_OBJECTS:crwrite-mill>
  $<TARGET_OBJECTS:crwrite-mill-drivers>
  $<TARGET_OBJECTS:crwrite-mill-display>
  $<TARGET_OBJECTS:crwrite-services>
  $<TARGET_OBJECTS:crwrite-settings>
  $<TARGET_OBJECTS:crwrite-mill-grbl>)

add_library(MillDaemon STATIC ${MILL_SOFTWARE_SRC})
set_property(TARGET MillDaemon PROPERTY POSITION_INDEPENDENT_CODE 1)
target_link_libraries(
  MillDaemon
  INTERFACE jsoncpp_lib
  PRIVATE jsoncpp_lib
          ZLIB::ZLIB
          minizip::minizip
          unofficial::tiny-process-library::tiny-process-library
          OpenSSL::Crypto
          OpenSSL::SSL
          Threads::Threads
          Boost::system
          Boost::thread
          Boost::filesystem
          spdlog::spdlog)

if(NOT APPLE)
  target_link_libraries(MillDaemon PRIVATE std::filesystem)
endif(NOT APPLE)

if(WIN32)
  target_link_libraries(MillDaemon PRIVATE setupapi crypt32)
endif(WIN32)

add_nodejs_module(${PROJECT_NAME} "${CMAKE_CURRENT_SOURCE_DIR}/NodeWrapper.cpp")
set_target_properties(
  ${PROJECT_NAME}
  PROPERTIES MACOSX_RPATH ON
             BUILD_WITH_INSTALL_RPATH 1
             INSTALL_NAME_DIR "@executable_path")
target_link_libraries(${PROJECT_NAME} MillDaemon)

add_executable(MillUtil "MillTest.cpp")
target_link_libraries(MillUtil MillDaemon)

#add_subdirectory(Tests)

add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy $<TARGET_FILE:crwrite> ${CMAKE_CURRENT_LIST_DIR}/../UI/app/Backend/crwrite.node
)
