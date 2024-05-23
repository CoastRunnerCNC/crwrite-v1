#include "SerialConnection.h"
#include <Common/Defs.h>
#include <Common/Logger.h>
#include "Mill/Display/MillDisplayManager.h"
#include "Mill/MillException.h"
#include <boost/asio.hpp>
#include <boost/bind.hpp>
using namespace MillLogger;

struct SerialConnection::Imp
{
	Imp(const std::string& path, std::shared_ptr<ConnectionState> pState)
	: m_path(path)
	, m_context()
	, m_port()
	, m_mutex()
	, m_queue()
	, m_work()
	, m_pState(pState)
	, m_readBuffer()
	, m_ioThread()
	, m_nextByte()
	, m_showStatus(false)
	{
	}
	~Imp() { Disconnect(); }

	void Connect() {
		MILL_LOG("File Path: " + m_path);

		std::lock_guard lock{m_mutex};
		Disconnect();
		m_context = std::make_unique<boost::asio::io_context>();
		m_work = std::make_unique<boost::asio::io_context::work>(*m_context);
		m_ioThread = std::thread([this](){ m_context->run(); });

		try {
			m_port = std::make_unique<boost::asio::serial_port>(*m_context, m_path);
		} catch (...) {
			throw MillException(MillException::FAILED_OPEN, "failed to open - " + m_path);
		}

		try {
			using serial = boost::asio::serial_port_base;
			m_port->set_option(serial::baud_rate(115200));
			m_port->set_option(serial::character_size(8));
			m_port->set_option(serial::parity(serial::parity::none));
			m_port->set_option(serial::stop_bits(serial::stop_bits::one));
		} catch (...) {
			throw MillException(MillException::FAILED_SET);
		}

		get_next_byte();
	}

	bool IsPluggedIn() const
	{
		return true; // TODO: Implement
	}

	void Disconnect() {
		std::lock_guard lock{m_mutex};
		m_work.reset();

		if (m_context) {
			m_context->stop();

			while (false == m_context->stopped()) {
				;
			}
		}

		if (m_ioThread.joinable()) { m_ioThread.join(); }

		m_port.reset();
		m_context.reset();
	}

	void WriteChar(const char val, const int timeout) {
		{
			std::lock_guard lock{ m_mutex };
			Write(&val, 1);
		}
		if (timeout > 0) { Sleep(timeout); }
	}

	void WriteLine(const std::string& value, const int timeout) {
		{
			// TODO: Handle write buffer size
			const std::string line = value + "\n";
			MILL_LOG("Writing: " + value);

			if (m_pState->GetBuffer().empty() || !m_pState->GetBuffer().back().GetInjectedCommand())
			{
				MillDisplayManager::AddLine(ELineType::WRITE, value);

				if (value.find_first_of('?', 0) != std::string::npos) {
					m_showStatus = true;
				}
			}

			std::lock_guard lock{ m_mutex };
			Write(line.c_str(), line.length());
		}

		if (timeout > 0)
		{
			Sleep(timeout);
		}
	}

	std::unique_ptr<std::string> ReadLine() {
		auto t = char{};
		std::lock_guard lock{ m_mutex };
		while (Read(&t, 1) > 0)
		{
			m_pState->ResetIdleTime();

			if (t == '\n')
			{
				std::string line = m_readBuffer;
				if (m_pState->GetBuffer().empty() || !m_pState->GetBuffer().front().GetInjectedCommand())
				{
					if (!StringUtil::StartsWith(line, "<"))
					{
						MillDisplayManager::AddLine(ELineType::READ, line);
					}
					else if (m_showStatus)
					{
						MillDisplayManager::AddLine(ELineType::READ, line);
						m_showStatus = false;
					}
				}

				m_readBuffer = "";
				return unique::make_unique<std::string>(line);
			}
			else if (t != '\r')
			{
				m_readBuffer.push_back(t);
			}
		}

		return nullptr;
	}

	void FlushReads() {
		std::lock_guard lock{ m_mutex };
		auto t = char{};
		auto line = std::string{""};
		while (Read(&t, 1) > 0)
		{
			if (t == '\n')
			{
				MILL_LOG(line);
				line = "";
			}
			else if (t != '\r')
			{
				line.push_back(t);
			}
		}
	}

	std::lock_guard<std::recursive_mutex> LockConnection() { return std::lock_guard{ m_mutex }; }

private:
	const std::string m_path;
	mutable std::unique_ptr<boost::asio::io_context> m_context;
	mutable std::unique_ptr<boost::asio::serial_port> m_port;
	mutable std::recursive_mutex m_mutex;
	mutable std::mutex m_queueMutex;
	mutable std::queue<char> m_queue;
	std::unique_ptr<boost::asio::io_context::work> m_work;
	std::shared_ptr<ConnectionState> m_pState;
	std::string m_readBuffer;
	std::thread m_ioThread;
	char m_nextByte;
	bool m_showStatus;

	void get_next_byte() noexcept {
		if (m_port && m_work) {
			m_port->async_read_some(
				boost::asio::buffer(&m_nextByte, sizeof(m_nextByte)),
				boost::bind(
					&Imp::read_cb,
					this,
					boost::asio::placeholders::error,
					boost::asio::placeholders::bytes_transferred)
			);
		}
	}

	void Write(const char* pc, const int num) {
		std::lock_guard lock{ m_mutex };
		if (!m_port) { throw MillException(MillException::FAILED_WRITE); }

		try {
			const auto writeSize = boost::asio::write(*m_port, boost::asio::buffer(pc, num));

			if (num != writeSize) {
				throw MillException(MillException::FAILED_WRITE);
			}
		} catch (...) {
			throw MillException(MillException::FAILED_WRITE);
		}
	}

	std::size_t Read(char* pc, const std::size_t num) const {
		auto counter = int{-1};
		std::lock_guard lock{ m_mutex };
		std::lock_guard lockQueue{ m_queueMutex };

		while ((++counter < num) && !m_queue.empty()) {
			auto& byte = m_queue.front();
			std::memcpy(pc, &byte, sizeof(byte));
			std::advance(pc, sizeof(byte));
			m_queue.pop();
		}

		return counter;
	}

	void read_cb(const boost::system::error_code& error, const std::size_t bytes) noexcept {
		std::lock_guard lock{ m_queueMutex };
		if ((0 < bytes) && !error) {
			m_queue.push(m_nextByte);
		}

		get_next_byte();
	}
};

SerialConnection::SerialConnection(const std::string& path, std::shared_ptr<ConnectionState> pState)
	: m_imp(std::make_unique<Imp>(path, pState))
{
	assert(m_imp);
}

SerialConnection::~SerialConnection() = default;

void SerialConnection::Connect()
{
	m_imp->Connect();
}

void SerialConnection::Disconnect()
{
	m_imp->Disconnect();
}

void SerialConnection::WriteChar(const char c, const int timeout) {
	m_imp->WriteChar(c, timeout);
}

void SerialConnection::WriteLine(const std::string& value, const int timeout)
{
	m_imp->WriteLine(value, timeout);
}

std::unique_ptr<std::string> SerialConnection::ReadLine()
{
	return m_imp->ReadLine();
}

void SerialConnection::FlushReads()
{
	m_imp->FlushReads();
}

auto SerialConnection::LockConnection() -> std::lock_guard<std::recursive_mutex> {
	return m_imp->LockConnection();
}
