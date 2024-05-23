set(
  cxx-sources
  CustSupportService.cpp
  FirmwareUpdateService.cpp
  Client/RestClient.cpp
  Models/AvailableFirmware.cpp
)
set(
  cxx-headers
  CustSupportService.h
  FirmwareUpdateService.h
  Client/RestClient.h
  Models/AvailableFirmware.h
)

add_library(crwrite-services OBJECT ${cxx-sources} ${cxx-headers})
set_property(TARGET crwrite-services PROPERTY POSITION_INDEPENDENT_CODE 1)
target_compile_definitions(crwrite-services PRIVATE REST_CLIENT CR_AUTH_KEY="${CR_AUTH_KEY}")
target_link_libraries(crwrite-services OpenSSL::Crypto OpenSSL::SSL Boost::headers jsoncpp_lib crwrite-common crwrite-firmware)
