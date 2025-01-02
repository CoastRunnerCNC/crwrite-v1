set(VCPKG_TARGET_ARCHITECTURE x64)
set(VCPKG_CRT_LINKAGE dynamic)
set(VCPKG_LIBRARY_LINKAGE static)

set(VCPKG_CMAKE_SYSTEM_NAME Darwin)

# Make sure your deployment target is new enough to support <filesystem>.
# For example, 10.13 or later is often safe for C++17 filesystem on macOS.
set(VCPKG_OSX_DEPLOYMENT_TARGET "10.13")

# Add -DUSE_STD_FILESYSTEM to your flags:
set(VCPKG_C_FLAGS "${VCPKG_C_FLAGS} -mmacosx-version-min=10.13 -Wno-implicit-function-declaration -DUSE_STD_FILESYSTEM")
set(VCPKG_CXX_FLAGS "${VCPKG_CXX_FLAGS} -mmacosx-version-min=10.13 -DUSE_STD_FILESYSTEM")
