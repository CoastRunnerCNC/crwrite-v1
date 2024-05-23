#include <Mill/GRBL/MillWriter.h>
#include <Mill/GRBL/Protocol/Protocol.h>
#include <Mill/MillException.h>
#include <Mill/GRBL/Regex.h>
#include <Mill/GRBL/Commands/M100.h>
#include <Mill/GRBL/Commands/M101.h>
#include <Mill/GRBL/Commands/M102.h>
#include <Mill/GRBL/Commands/M106.h>
#include <Mill/GRBL/Commands/ContourMapping.h>
#include <string>
#include <Common/Logger.h>

void MillWriter::Write(const GCodeLine& line) {
    UpdateConnectionState(line);
    switch (line.GetType()) {
        case GCodeLine::TYPE_GRBL: {
            MILL_LOG("TYPE_GRBL");
            WriteGRBLLine(line);
            break;
        }
        case GCodeLine::TYPE_MCODE: {
            MILL_LOG("TYPE_MCODE");
            WriteMCodeLine(line);
            break;
        } 
        case GCodeLine::TYPE_GCODE: {
            MILL_LOG("TYPE_GCODE");
            if (line.GetWCS().has_value()) {
                m_pState->SetWCS(line.GetWCS().value());
            }
            if (line.GetMovementType().has_value()) {
                m_pState->SetMovementType(line.GetMovementType().value());
            }
            if (line.GetGroup() == GCodeLine::GROUP_G_UNITS) {
                m_pState->SetUnits(line.GetUnits().value());
            }
            m_pState->SetLastGCodeGroup(line.GetGroup());
            WriteLine(line);
            break;
        }
        case GCodeLine::TYPE_AXIS_FEED_SPINDLE: {
            MILL_LOG("TYPE_TYPE_AXIS_FEED_SPINDLE");
            m_pState->SetLastGCodeGroup(GCodeLine::GROUP_G_MOTION);
            WriteLine(line);
            break;
        }
        default: {
            MILL_LOG("TYPE_DEFAULT");
            throw MillException(MillException::UNKNOWN_COMMAND, line.GetOriginal());
        }
    }
}

void MillWriter::UpdateConnectionState(const GCodeLine& line) {
    std::string cleaned = line.GetCleaned();
    std::regex pattern(R"(G(\d{2}))"); // Regular expression pattern to search for G codes
    std::smatch match;
    std::string::const_iterator search_start(cleaned.cbegin());

    while (std::regex_search(search_start, cleaned.cend(), match, pattern)) {
        uint8_t code = static_cast<uint8_t>(std::stoi(match[1].str()));
        if (code == 20 || code == 21) {
            MILL_LOG("units found: " + std::to_string(code));
            m_pState -> SetUnits(code);
        }
        if (code >= 54 && code <= 58) {
            MILL_LOG("WCS found: " + std::to_string(code));
            m_pState -> SetWCS(code);
        }
        search_start = match.suffix().first;
    }

    return;
}

void MillWriter::WriteGRBLLine(const GCodeLine& line) {
    // Unlock machine if $X or $H
    if (line.IsUnlock() || line.IsHome()) {
        m_pState->SetLocked(false);
    }

    // Since grbl doesn't respond to commands while homing or leveling,
    // we set the homing indicator so we can accurately determine timeout.
    if (line.IsHome() || line.IsLevel()) {
        m_pState->SetHoming(true);
    }

    // Update check mode
    if (line.GetGroup() == GCodeLine::GROUP_GRBL_CHK_MODE) {
        // JT probe detection change
        m_pState->SetCheckMode(!m_pState->IsCheckMode());
    }

    WriteLine(line);
}

void MillWriter::WriteMCodeLine(const GCodeLine& line) {
    MILL_LOG("Running WriteMCodeLine");
    if (line.GetGroup() == GCodeLine::GROUP_M_USER_DEFINED) {
        MILL_LOG("Line group is GROUP_M_USER_DEFINED");
        auto mcodeInfoOpt = line.GetMCodeInfo();
        if (!mcodeInfoOpt.has_value()) {
            MILL_LOG("empty mcodeinfoOpt, throwing exception");
            throw MillException(MillException::UNKNOWN_COMMAND, line.GetOriginal());
        }
        MILL_LOG("pre mcode variable assignment");
        const int mcode = mcodeInfoOpt.value().code;
        MILL_LOG("pre params variable assignment");
        const auto params = mcodeInfoOpt.value().options;
        MILL_LOG("pre mcode switch");
        switch (mcode) {
            case 100: { M100(params); } break;
            case 101: { M101(params); } break;
            case 106: { M106(line.GetOriginal()); } break;
            case 102: { M102<double>(line.GetOriginal()); } break; //Must be line.GetOriginal() so that we can pass in parens that would otherwise be filtered out
            case 111: { M111(m_pSerial, params); } break;
            case 112: { M112(); } break;
            case 113: { M113(); } break;
            case 114: { M114(); } break;
        }

        return;
    }
    MILL_LOG("Line group is NOT GROUP_M_USER_DEFINED");
    WriteLine(line);
}

void MillWriter::WriteLine(const GCodeLine& line) {
    if (m_pState->IsCheckMode()) {
        Sleep(500);
    }

    std::string cleaned = line.GetCleaned();

    std::smatch sm;
    if (std::regex_match(cleaned, sm, GRBL::CMDFEEDRATE) && !line.GetInjectedCommand()) {
        int feedRate = m_pFeedRate->UpdateFeedRate(stoi(sm[1].str()));
        if (feedRate > 0) {
            cleaned = std::regex_replace(
                cleaned,
                std::regex("F\\d+", std::regex_constants::icase),
                "F" + std::to_string(feedRate)
            );
        }
    }

    if (std::regex_match(cleaned, sm, GRBL::RXSETTINGS)) {
        m_pState->UpdateSetting(
            (uint8_t)std::stoi(sm[1].str()),
            std::stof(sm[2].str())
        );
    }

    m_pState->GetBuffer().push(line);
    m_pSerial->WriteLine(cleaned);
}
