#include "FirmwareUpdateService.h"
#include "Client/RestClient.h"
#include <Common/Models/URL.h>
#include <Common/Util/StringUtil.h>
#include <json/json.h>

static bool ParseResponse(const RestClient::Response& response, Json::Value& json)
{
	if (response.status_code == 200) {
		auto input = std::stringstream{ response.body };
		auto reader = Json::CharReaderBuilder{};

		if (Json::parseFromStream(reader, input, &json, nullptr)) {
			if (json.isMember("status") && json["status"] == "ok") {
				return true;
			}
		}
	}

	return false;
}

FirmwareUpdateService::Response FirmwareUpdateService::Invoke(const FirmwareUpdateService::Request& req)
{
	FirmwareUpdateService::Response response;

	std::string url = "/lookupCRFirmware?";

	if (!req.explicit_version.empty()) {
		url += "version=" + req.explicit_version;
	} else {
		url += StringUtil::Format(
			"grblVersion=%s&chassisVersion=%s&electronicsVersion=%s&vfdVersion=%s&buildDate=%s&paramsWrittenToEEPROM=true",
			req.current_firmware.GetGRBL().c_str(),
			req.current_firmware.GetChassis().c_str(),
			req.current_firmware.GetElectronics().c_str(),
			req.current_firmware.GetVFD().c_str(),
			req.current_firmware.GetYMD().c_str()
		);
	}

	url = URL(url).Encoded();

	RestClient::Response raw_resp = RestClient::Get(url);

	Json::Value json;
	if (ParseResponse(raw_resp, json)) {
		AvailableFirmware firmwareUpdate;
		firmwareUpdate.VERSION = json["version"].asString();
		firmwareUpdate.DESCRIPTION = json["description"].asString();
		firmwareUpdate.FILE_328P = json["328p"].asString();

		if (json.isMember("32M1") && !json["32M1"].isNull()) {
			firmwareUpdate.FILE_32M1 = json["32M1"].asString();
		}

		response.available.emplace_back(std::move(firmwareUpdate));
	}

	return response;
}
