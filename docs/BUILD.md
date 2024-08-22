# NEW BUILD INSTRUCTIONS
1. Setup Dependencies
	* Install Node & npm (https://nodejs.org/en/blog/release/v16.20.2/)
    * NOTE: make sure you are using the 32 bit version! nvm use 16.20.2 32
	* Install C++ 17 Compatible Compiler
	* Install CMake (Included by default with VS if using Developer Tools Command Prompt)
2. Configure vcpkg
	* If the vcpkg folder is empty, delete the folder and clone vcpkg from github
	* cd vcpkg
	* git checkout 769f5bc
	* (OS X / Linux) ./bootstrap-vcpkg.sh
	* (Windows) bootstrap-vcpkg.bat
	* (OS X) ./vcpkg install --overlay-triplets=../custom-triplets @../vcpkg.txt --triplet x64-osx_b
	* (Linux) ./vcpkg install --overlay-triplets=../custom-triplets @../vcpkg.txt --triplet x64-linux
	* (Windows) vcpkg install --overlay-triplets=../custom-triplets @../vcpkg.txt --triplet x86-windows-static
3. From root directory:
	* (Windows) mkdir build && cd build && cmake -DVCPKG_TARGET_TRIPLET=x86-windows-static -DCMAKE_TOOLCHAIN_FILE=../vcpkg/scripts/buildsystems/vcpkg.cmake -DCMAKE_EXPORT_COMPILE_COMMANDS:BOOL=ON -A Win32 -DOPENSSL_ROOT_DIR:PATH=../vcpkg/installed/x86-windows-static ../src
	* (OS X) mkdir -p build && cd build && cmake -DVCPKG_TARGET_TRIPLET=x64-osx_b -DCMAKE_TOOLCHAIN_FILE=../vcpkg/scripts/buildsystems/vcpkg.cmake -DCMAKE_EXPORT_COMPILE_COMMANDS:BOOL=ON ../src
	* (Linux) mkdir -p build && cd build && cmake -DVCPKG_TARGET_TRIPLET=x64-linux -DCMAKE_TOOLCHAIN_FILE=../vcpkg/scripts/buildsystems/vcpkg.cmake -DCMAKE_EXPORT_COMPILE_COMMANDS:BOOL=ON ../src
	* cmake --build . --config Release
4. From UI directory:
	* npm install
	* node scripts/startCoastRunner.js
5. Build executable:
	From UI directory:
	* npm run release
	* Build can be found in UI/dist
	* NOTE: This process will seem to fail, but the executable will build succesfully to UI/dist. This local executable will not contain any API functionality (because we rely on Github's build to insert API creds')
