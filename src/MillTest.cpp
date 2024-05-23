#include "MillDaemon.h"
#include <Common/Defs.h>
#include <Common/FileDownloader.h>
#include "Mill/MillingManager.h"
#include <Mill/GRBL/Regex.h>
#include <Mill/GRBL/MillConnection.h>
#include <Mill/Firmware/FirmwareVersion.h>
#include "Common/Util/FileUtil.h"
#include "Files/operation.h"
#include "Mill/GRBL/Commands/ContourMapping.h"

#include <MillDaemon.h>

#include <iostream>
#include <fstream>
using namespace std;

void MyTestFunction();
void PrintYMAL(const YAMLObject&);
void PrintOperation(const Operation*);

int main(int argc, char* argv[])
{
	MyTestFunction();

	return 0;
}

void PrintYMAL(const YAMLObject& yml) {
	cout << yml.getValue() << endl;
	auto& ymlLines = yml.getChildren();
	if (ymlLines.size() > 0) {
		for (auto& line : ymlLines) {
			PrintYMAL(line);
		}
	}
}

void MyTestFunction() {
	auto& daemon = MillDaemon::GetInstance();

	daemon.Initialize();
	while (daemon.GetCNCMillStatus() != ECNCMillStatus::connected) {
		std::cout << "Not connected\n";
		Sleep(250);
	}
	//return;
	Sleep(250);
	daemon.ExecuteCommand("$H");
	Sleep(50);
	/*daemon.ExecuteCommand("$RST=*");
	//daemon.ExecuteCommand("M111 Z-0.5 F100");
	daemon.ExecuteCommand("M111 Z-10.5 F100");
	Sleep(50);
	daemon.ExecuteCommand("G0G53Y-30.5");
	daemon.ExecuteCommand("M111 Z-10.5 F100");
	Sleep(50);
	daemon.ExecuteCommand("G0G53X-56");
	daemon.ExecuteCommand("M111 Z-10.5 F100");*/
	/*Sleep(50);
	//daemon.ExecuteCommand("G0G53Y-0.5");
	daemon.ExecuteCommand("G0G53X-85.5");
	//daemon.ExecuteCommand("M111 Z-10 F100");
	daemon.ExecuteCommand("M111 Z-0.5 F100");*/

	/*auto wcs = Vector3{ 10.0f, 10.0f, 5.0f };
	auto line = GCodeLine{"G0X-76Y-10Z0"};
	auto accum = POSITION_ACCUMULATOR{};
	accum.ApplyGCode(line);
	auto pos = accum.GetAbsolutePosition();
	//auto newLine = TransformZCoord(line, Point3{ -76.f, -10.5f, 0.0f }, Vector3{ 0.0f, 0.0f, 0.0f });
	auto newLine = TransformZCoord(line, pos, wcs);
	cout << newLine.GetOriginal() << endl;

	line = GCodeLine{ "G0X-86Y0Z0" };
	accum.ApplyGCode(line);
	pos = accum.GetAbsolutePosition();
	newLine = TransformZCoord(line, pos, wcs);
	cout << newLine.GetOriginal() << endl;

	line = GCodeLine{ "G0G91X-5Y-5Z0" };
	accum.ApplyGCode(line);
	pos = accum.GetAbsolutePosition();
	newLine = TransformZCoord(line, pos, wcs);
	cout << newLine.GetOriginal() << endl;

	line = GCodeLine{ "X-1Y-1Z1" };
	accum.ApplyGCode(line);
	pos = accum.GetAbsolutePosition();
	newLine = TransformZCoord(line, pos, wcs);
	cout << newLine.GetOriginal() << endl;

	line = GCodeLine{ "X-2Y-2Z2" };
	accum.ApplyGCode(line);
	pos = accum.GetAbsolutePosition();
	newLine = TransformZCoord(line, pos, wcs);
	cout << newLine.GetOriginal() << endl;

	line = GCodeLine{ "X-2Y-2Z3" };
	accum.ApplyGCode(line);
	pos = accum.GetAbsolutePosition();
	newLine = TransformZCoord(line, pos, wcs);
	cout << newLine.GetOriginal() << endl;*/

	atomic<bool> doQuery = true;
	//auto path = "D:\\Programming\\Coastrunner\\Extra-CRWrite\\TestFiles\\Engraving-customized.txt"s;
	auto path = "D:\\Programming\\Coastrunner\\Extra-CRWrite\\TestFiles\\Engraving-probe-corner.txt"s;
	cout << "send in path: " << path << endl;
	auto success = daemon.RunManualGCodeFile(path);
	cout << "success: " << boolalpha << success << endl;

	Sleep(250);
	auto sendQuery = [ &daemon, &doQuery ] () {
		while (doQuery) {
			daemon.ExecuteRealtime('?');
			Sleep(30);
		}
		Sleep(300);
	};
	auto th = thread{sendQuery};
	while (daemon.MillingInProgress()) { LogCout("Waiting on mill process..."s); Sleep(100); }
	//-37.360,-12.295,-27.788
	daemon.ExecuteCommand("G0 X-37.360 Y-12.295 Z-27.788");

	//auto path2 = "D:\\Programming\\Coastrunner\\Extra-CRWrite\\TestFiles\\Engraving-long-text.txt"s;
	auto path2 = "D:\\Programming\\Coastrunner\\Extra-CRWrite\\TestFiles\\Engraving-relative-shape-2-squares.txt"s;
	cout << "send in path: " << path2 << endl;
	success = daemon.RunManualGCodeFile(path2);
	cout << "success: " << success << endl;

	Sleep(250);
	while (daemon.MillingInProgress()) { LogCout("Waiting on mill process..."s); Sleep(100); }
	doQuery = false;
	th.join();
}
