If no COM port is available when Choose Mill is selected in CRWrite, run ‘install.bat’ found in \Drivers\Arduino\ to manually install drivers necessary for your computer to detect your mill
 
Firmware/ Arduino/ contains the hardware drivers required to find the CNC mill.  Don't change the relative file path to CRWrite.  CRWrite should automatically install these drivers if they aren't installed already.  
If you're not able to connect to the mill, see the README in the /Arduino folder.  Otherwise you don't need to mess around in this folder.

\AVRdude is required by CRWrite to update the firmware.  Don't change the relative file path to CRWrite.  You don't need to mess around in this folder.
