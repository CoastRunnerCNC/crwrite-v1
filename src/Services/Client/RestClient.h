#pragma once
#include "Common/CommonHeaders.h"
#include <Common/Util/OSUtil.h>
#include <boost/asio.hpp>
#include <boost/asio/ssl.hpp>
namespace asio = boost::asio;

// Perform GET and POST requests over the internet
class RestClient
{
public:
	struct Response
	{
		unsigned int status_code;
		std::string status_text;
		std::string body;
	};

	static Response Post(const std::string& path, const std::string& jsonBody);
	static Response Get(const std::string& path);
private:
	RestClient(asio::ssl::stream<asio::ip::tcp::socket>& socket, asio::streambuf& request, asio::streambuf& response);

	Response Resolve(asio::ip::tcp::resolver::iterator endpoint_iterator);
	Response Connect();
	Response Handshake();
	Response WriteRequest();
	Response ReadStatusLine();

	asio::ssl::stream<asio::ip::tcp::socket>& m_socket;
	asio::streambuf& m_request;
	asio::streambuf& m_response;
};
