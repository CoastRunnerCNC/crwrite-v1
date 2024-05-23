#pragma once

#include "Common/CommonHeaders.h"
#include <Common/Util/MathUtil.h>
#include <json/json.h>

// Utility that tracks progress
class Progress
{
public:
    Progress() : m_completed(0), m_total(0) { }
    Progress(const Progress& rhs)
        : m_completed(rhs.GetCompleted()), m_total(rhs.GetTotal()) {}

    void Reset() { m_completed = 0; m_total = 0; }
    void SetCompleted(const size_t completed) { m_completed = completed; }
    void SetTotal(const size_t total) { m_total = total; }

    int GetPercentage() const noexcept { return MathUtil::Percentage(m_completed, m_total); }
    size_t GetCompleted() const noexcept { return m_completed; }
    size_t GetTotal() const noexcept { return m_total; }

    Json::Value ToJSON() const
    {
        Json::Value json;
        json["completed"] = Json::Value((Json::UInt)m_completed.load());
        json["total"] = Json::Value((Json::UInt)m_total.load());
        json["percentage"] = GetPercentage();
        return json;
    }

private:
    std::atomic<size_t> m_completed;
    std::atomic<size_t> m_total;
};