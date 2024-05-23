#pragma once

#include "Common/CommonHeaders.h"

// This class only represents WHICH mill is being referenced
// It tracks the machine by it's serial number and the path to the connection port
class CNCMill
{
public:
    CNCMill(const std::string& path, const std::string& serialNumber)
        : m_path(path), m_serialNumber(serialNumber)
    {
        
    }
    
    const std::string& GetPath() const noexcept { return m_path; }
    const std::string& GetSerialNumber() const noexcept { return m_serialNumber; }

    bool operator==(const CNCMill& rhs) const { return m_path == rhs.GetPath() && m_serialNumber == rhs.GetSerialNumber(); }
    bool operator!=(const CNCMill& rhs) const { return !(*this == rhs); }
    
private:
    std::string m_path;
    std::string m_serialNumber;
};
