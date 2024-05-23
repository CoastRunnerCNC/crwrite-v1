#include "CustSupportService.h"
#include "Client/RestClient.h"
#include <Common/Defs.h>
#include <json/json.h>
#include "../Common/Logger.h"
#include <typeinfo>
#include <string>

std::string CustSupportService::Request::ToJsonStr() const
{
	Json::Value json;
	json["name"] = name;
	json["email"] = email;
	json["description"] = description;
	json["MILL_SOFTWARE_VERSION"] = cr_version;
	json["log_text"] = log_text;
	json["firmware"] = firmware;

	auto builder = Json::StreamWriterBuilder{};
	builder["commentStyle"] = "None";
	builder["indentation"] = "";

	return Json::writeString(builder, json);
}

CustSupportService::Response CustSupportService::Invoke(const CustSupportService::Request& req)
{
	MILL_LOG(req.ToJsonStr());
	auto raw_resp = RestClient::Post("/customerServiceRequest/", req.ToJsonStr());
	if (raw_resp.status_code == 201) {
		MILL_LOG("Response TRUE");
		return Response{true};
	}
	MILL_LOG("response false");
	MILL_LOG(raw_resp.body);
	Response response{false};

	Json::CharReaderBuilder reader;
	std::stringstream input{ raw_resp.body };
	Json::Value rootErrorNode;
	//MILL_LOG(Json::parseFromStream(reader, input, &rootErrorNode, nullptr) ? "true!" : "false!");
	if (Json::parseFromStream(reader, input, &rootErrorNode, nullptr)) {
		const std::vector<std::string> memberNames = rootErrorNode.getMemberNames();

		std::string errorStr;
		Json::Value get1, get2, get3, get4;
		for (const auto& member : memberNames) {
			if (member == "details") {
				errorStr = rootErrorNode.get(member, "Nothing, I guess test").get("email", "Still nothing test").get(Json::Value::ArrayIndex(0), "No array!").get("description", "No description!").asString();
				response.errors[member] = errorStr;
			} else {
				auto errorNode = rootErrorNode.get(member, "UNKNOWN ERROR");
				std::string string = rootErrorNode.get(member, "Nothing, I guess").asString();
				response.errors[member] = "test";//errorNode.get(Json::Value::ArrayIndex(0), "UNKNOWN_ERROR").asString();
			}
		}
	}
	return response;
}
