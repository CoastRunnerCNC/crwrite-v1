IF EXIST %WINDIR%\sysnative\cmd.exe (
	%WINDIR%\sysnative\cmd.exe /C "install.bat"
) ELSE (
	SETLOCAL EnableDelayedExpansion
		set ARDUINO_FOUND="false"
		for /f "tokens=*" %%i in ('pnputil.exe /enum-drivers ^| findstr /c:"arduino.inf"') do set ARDUINO_FOUND="true"
		echo !ARDUINO_FOUND!
		if !ARDUINO_FOUND!=="false" (
			%SystemRoot%\System32\InfDefaultInstall.exe "%~dp0arduino.inf"
		)
	
	ENDLOCAL
)