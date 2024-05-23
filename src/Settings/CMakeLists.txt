set(
  cxx-sources
  SettingManager.cpp
)
set(
  cxx-headers
  JogKeys.h
  Setting.h
  SettingManager.h
  WalkthroughType.h
)
add_library(crwrite-settings OBJECT ${cxx-sources} ${cxx-headers})
set_property(TARGET crwrite-settings PROPERTY POSITION_INDEPENDENT_CODE 1)
target_compile_definitions(crwrite-settings PRIVATE REST_CLIENT)
target_link_libraries(crwrite-settings PUBLIC jsoncpp_lib)
