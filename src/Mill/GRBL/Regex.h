#pragma once

#include "Common/CommonHeaders.h"

// Regex helpers for various string analysis
namespace GRBL
{
	static const std::regex RXSTART = std::regex("^Grbl (\\d+\\.\\d+).*\n?", std::regex_constants::icase);
	static const std::regex RXERROR = std::regex("^error: (.*)\n?");
	static const std::regex RXOVERFLOW = std::regex("^Line overflow\n?");
	static const std::regex RXNOTIDLE = std::regex("^Not idle\n?");
	static const std::regex RXOK = std::regex("^K([0-9A-F])");
	static const std::regex RXALARM = std::regex("^ALARM:(.*)\n?");
	//static const std::regex RXM1XX=std::regex("^M(1\\d\\d)(.*)",std::regex_constants::icase);
	static const std::regex RXM1XX = std::regex("^M(1\\d\\d)(.*)", std::regex_constants::icase);
	static const std::regex RXXYZ = std::regex("^(X|Y|Z)(-?\\d*\\.?\\d+)(.*)", std::regex_constants::icase);
	static const std::regex RXPRB = std::regex("^\\[PRB:(-?\\d*\\.?\\d+),(-?\\d*\\.?\\d+),(-?\\d*\\.?\\d+):(-?\\d*\\.?\\d+).*", std::regex_constants::icase);
	static const std::regex RXPRBV1 = std::regex("^\\[PRB:(-?\\d*\\.?\\d+),(-?\\d*\\.?\\d+),(-?\\d*\\.?\\d+):(-?\\d*\\.?\\d+).*", std::regex_constants::icase);
	static const std::regex RXSTATUS = std::regex("^<(\\w+),(\\w+):(-?\\d+\\.?\\d+),(-?\\d+\\.?\\d+),(-?\\d+\\.?\\d+),(\\w+):(-?\\d+\\.?\\d+),(-?\\d+\\.?\\d+),(-?\\d+\\.?\\d+),(\\w+):(\\d),(\\w+):(\\d),(\\w+):(\\d),(\\w+):(\\d+)\\|(\\d)\\|(\\d+)>.*", std::regex_constants::icase);
	static const std::regex CMDFEEDRATE = std::regex("^.*F(\\d+).*", std::regex_constants::icase);
	static const std::regex RXWCS = std::regex("^\\[(.?\\d+):(-?\\d*\\.?\\d+),(-?\\d*\\.?\\d+),(-?\\d*\\.?\\d+).*", std::regex_constants::icase);
	//static const std::regex RXTLO=std::regex("^\\[(.?\\d+):(-?\\d*\\.?\\d+).*",std::regex_constants::icase);

	// TODO: Confirm these are still correct
	static const std::regex RXDISABLED = std::regex("^\\[Disabled\\]\n?"); // WAS: std::regex("^\\[Disabled]\n?");
	static const std::regex RXENABLED = std::regex("^\\[Enabled\\]\n?"); // WAS: std::regex("^\\[Enabled]\n?");
	static const std::regex RXLOCKED = std::regex("^\\[.*to unlock\\]\n?"); // WAS: std::regex("^\\[.*unlock]\n?");


	static std::regex RXTRUE("^t(rue)?$", std::regex_constants::icase);
	static std::regex RXBMP("^.*BMP$", std::regex_constants::icase);
	static std::regex RXJPEG("^.*(JPEG|JPG)$", std::regex_constants::icase);
	static std::regex RXSTRIP("^\\s*(.*\\w)\\s*$");


	static std::regex RXGCODE = std::regex("^G0*(\\d+).*", std::regex_constants::icase);
	static std::regex RXMCODE = std::regex("^M(\\d+)(.*)", std::regex_constants::icase);
	static std::regex RXAFS = std::regex("^[FIJKLNPRSTXYZ].*", std::regex_constants::icase);
	static std::regex RXGRBL = std::regex("^(\\$(\\$|#|[GINCXHJ?]|\\d).*|[~!?])");


	static std::regex RXSETTINGS = std::regex("^\\$(.?\\d+)=(-?\\d*\\.?\\d+).*", std::regex_constants::icase);
}