::rmdir /s /q build 
::mkdir build 
cd build 
::cmake -DVCPKG_TARGET_TRIPLET=x86-windows-static -DCMAKE_TOOLCHAIN_FILE=../vcpkg/scripts/buildsystems/vcpkg.cmake -DCMAKE_EXPORT_COMPILE_COMMANDS:BOOL=ON -A Win32 -DOPENSSL_ROOT_DIR:PATH=../vcpkg/installed/x86-windows-static ../src || exit /b
cmake --build . --config Release || exit /b
cd ../UI
call npm install || exit /b
node scripts/startCoastRunner.js || exit /b
cd ..
