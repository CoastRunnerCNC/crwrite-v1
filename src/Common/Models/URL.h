#pragma once

#include "Common/CommonHeaders.h"

// Utility for handling URL's
class URL
{
public:
    explicit URL(const std::string& url) : m_url(url) {}

    std::string GetFileName() const { return m_url.substr(m_url.find_last_of('/') + 1); }
    std::string ToString() const noexcept { return m_url; }
    std::string Encoded() const noexcept { return std::regex_replace(m_url, std::regex(" "), "%20"); }

private:
    std::string m_url;
};
