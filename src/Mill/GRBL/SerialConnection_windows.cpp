#include "SerialConnection.h"
#include <Common/Logger.h>
#include "Mill/Display/MillDisplayManager.h"
#include "Mill/MillException.h"
using namespace MillLogger;
using std::string;
using std::unique_ptr;
using std::shared_ptr;

#define USE_MOCK_GRBL

#ifdef USE_MOCK_GRBL
#include "Mock_GRBL.h"
using std::queue;

class SerialConnection::Imp {
public:
	Imp(const string& path, shared_ptr<ConnectionState> pState) : m_pState{ pState } { }

	void Connect() { m_GRBL_Mock.Connect(); }

	void Disconnect() { m_GRBL_Mock.Disconnect(); }

	void WriteChar(char val, const int timeout) {
		if (val == 24) { val = '|'; }
		MILL_LOG("Writing: " + val);
		//MillDisplayManager::AddLine(ELineType::WRITE, std::string{ val });
		m_GRBL_Mock.Write(string{ val });
	}

	void WriteLine(const string& val, const int timeout) {
		if (val == "?") { showStatus.store(true, std::memory_order_release); }
		MILL_LOG("Writing: " + val);
		MillDisplayManager::AddLine(ELineType::WRITE, val);
		m_GRBL_Mock.Write(val);
	}

	unique_ptr<string> ReadLine() {
		if (m_GRBL_Mock.HasOutput()) {
			m_pState->ResetIdleTime();
			auto msg = m_GRBL_Mock.Read();
			auto status = showStatus.load(std::memory_order_acquire);
			if (msg[0] == '<' && status) {
				showStatus.store(false, std::memory_order_release);
				MillDisplayManager::AddLine(ELineType::READ, msg);
			}
			else if (msg[0] != '<' && !m_pState->GetBuffer().empty() && !m_pState->GetBuffer().front().GetInjectedCommand()) {
				MillDisplayManager::AddLine(ELineType::READ, msg);
			}
			//MillDisplayManager::AddLine(ELineType::READ, msg);
			return std::make_unique<string>(msg);
		}
		else { return nullptr; }
	}

	void FlushReads() { 
		while (m_GRBL_Mock.HasOutput()) {
			LogCout("Flushing reads:");
			LogCout(m_GRBL_Mock.Read());
			LogCout("End read flush.\n~~~~~");
			//static_cast<void>(m_GRBL_Mock.Read());
		}
	}

	std::lock_guard<std::recursive_mutex> LockConnection() { return std::lock_guard{ m_mutex }; }

private:
	shared_ptr<ConnectionState> m_pState;
	mutable std::recursive_mutex m_mutex;
	queue<string> writeQ{ };
	queue<string> readQ{ };
	std::atomic<bool> connected{ false };
	std::atomic<bool> showStatus{ false };
	MOCK_GRBL m_GRBL_Mock{ };
};

#else

struct SerialConnection::Imp
{
	Imp(const std::string& path, std::shared_ptr<ConnectionState> pState)
	: m_path(path)
	, m_pState(pState)
	, m_file(INVALID_HANDLE_VALUE)
	, m_readBuffer()
	, m_showStatus(false)
	{
	}
	~Imp() = default;

	void Connect() {
		auto lock = std::lock_guard{ m_mutex };
		MILL_LOG("File Path: " + m_path);

		OS_FILE file = CreateFile(m_path.c_str(), GENERIC_READ | GENERIC_WRITE, 0, 0, OPEN_EXISTING, 0, 0);
		if (file == INVALID_HANDLE_VALUE)
		{
			throw MillException(MillException::FAILED_OPEN, "Invalid handle");
		}

		DCB dcb = { 0 };
		dcb.DCBlength = sizeof(DCB);
		if (!GetCommState(file, &dcb)) {
			CloseHandle(file);
			throw MillException(MillException::FAILED_OPEN, "GetCommState failed");
		}

		dcb.BaudRate = CBR_115200;
		dcb.fBinary = FALSE;
		dcb.fParity = FALSE;
		dcb.fOutxCtsFlow = FALSE;
		dcb.fDtrControl = DTR_CONTROL_ENABLE;
		dcb.fOutX = FALSE;
		dcb.fInX = FALSE;
		dcb.fNull = FALSE;
		dcb.fRtsControl = RTS_CONTROL_DISABLE;
		dcb.fAbortOnError = FALSE;
		dcb.ByteSize = 8;
		dcb.StopBits = ONESTOPBIT;
		dcb.Parity = NOPARITY;

		if (!SetCommState(file, &dcb)) {
			CloseHandle(file);
			throw MillException(MillException::FAILED_OPEN, "SetCommState failed");
		}

		// Set timeouts
		COMMTIMEOUTS timeout = { 0 };
		if (!GetCommTimeouts(file, &timeout)) {
			CloseHandle(file);
			throw MillException(MillException::FAILED_OPEN, "GetCommTimeouts failed");
		}

		timeout.ReadIntervalTimeout = MAXDWORD;
		timeout.ReadTotalTimeoutConstant = 0;
		timeout.ReadTotalTimeoutMultiplier = 0;
		timeout.WriteTotalTimeoutConstant = 0;
		timeout.WriteTotalTimeoutMultiplier = 0;

		if (!SetCommTimeouts(file, &timeout)) {
			CloseHandle(file);
			throw MillException(MillException::FAILED_OPEN, "SetCommTimeouts failed");
		}

		m_file = file;
	}

	bool IsPluggedIn() const {
		auto lock = std::lock_guard{ m_mutex };
		if (m_file == INVALID_HANDLE_VALUE) {
			return false;
		}

		COMMTIMEOUTS timeout = { 0 };
		return GetCommTimeouts(m_file, &timeout);
	}

	void Disconnect() {
		auto lock = std::lock_guard{ m_mutex };
		OS_FILE file = m_file;
		m_file = INVALID_HANDLE_VALUE;

		CloseHandle(file);
	}

	void WriteChar(const char val, const int timeout) { 
		{
			auto lock = std::lock_guard{ m_mutex };
			Write(&val, 1);
		}
		if (timeout > 0) { Sleep(timeout); }
	}

	void WriteLine(const std::string& value, const int timeout) {
		{
			auto lock = std::lock_guard{ m_mutex };
			const std::string line = value + "\n";

			MILL_LOG("Writing: " + value);
			if (m_pState->GetBuffer().empty() || !m_pState->GetBuffer().back().GetInjectedCommand())
			{
				MillDisplayManager::AddLine(ELineType::WRITE, value);

				if (value.find_first_of('?', 0) != std::string::npos) {
					m_showStatus = true;
				}
			}

			Write(line.c_str(), line.length());
		}

		if (timeout > 0)
		{
			Sleep(timeout);
		}
	}

	std::unique_ptr<std::string> ReadLine() {
		char t;
		auto lock = std::lock_guard{ m_mutex };
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
		auto lock = std::lock_guard{ m_mutex };
		char t;
		std::string line = "";
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
	using OS_FILE = HANDLE;

	std::string m_path;
	std::shared_ptr<ConnectionState> m_pState;
	OS_FILE m_file;
	std::string m_readBuffer;
	bool m_showStatus;
	mutable std::recursive_mutex m_mutex;

	void Write(const char* pc, const int num) {
		DWORD writeSize;
		BOOL written = WriteFile(m_file, pc, num, &writeSize, NULL);
		if (num != writeSize || written == FALSE)
		{
			throw MillException(MillException::FAILED_WRITE);
		}
	}

	int Read(char* pc, const int num) const {
		DWORD readSize;
		ReadFile(m_file, pc, num, &readSize, NULL);
		return readSize;
	}
};

#endif	// USE_MOCK_GRBL

SerialConnection::SerialConnection(const std::string& path, std::shared_ptr<ConnectionState> pState)
	: m_imp(std::make_unique<Imp>(path, pState)) {
	assert(m_imp);
}

SerialConnection::~SerialConnection() = default;

auto SerialConnection::Connect() -> void
{
	m_imp->Connect();
}

auto SerialConnection::Disconnect() -> void
{
	m_imp->Disconnect();
}

auto SerialConnection::WriteChar(const char c, const int timeout) -> void {
	m_imp->WriteChar(c, timeout);
}

auto SerialConnection::WriteLine(const std::string& value, const int timeout) -> void
{
	m_imp->WriteLine(value, timeout);
}

auto SerialConnection::ReadLine() -> std::unique_ptr<std::string>
{
	return m_imp->ReadLine();
}

auto SerialConnection::FlushReads() -> void
{
	m_imp->FlushReads();
}

auto SerialConnection::LockConnection() -> std::lock_guard<std::recursive_mutex> {
	return m_imp->LockConnection();
}
