#include "MillErrorHandler.h"
#include <Common/Logger.h>
using namespace MillLogger;

MillingError MillErrorHandler::GetError(const MillConnection::Ptr& pConnection, const MillException& exception)
{
    if (exception.getType() == MillException::SOFTWARE_ESTOP) {
        MILL_LOG("Resetting software E-stop error.");
        try { pConnection->Reset(); }
        catch (...) {
            // Do nothing.
        }
        
        return ErrorCodes::GetAlarm(ALARM_CODE_SOFT_ESTOP);
    }

    //tl::optional<MillingError> error_opt = pConnection->GetError();
    //if (error_opt.has_value()) {
    //    MillingError error = error_opt.value();

    //    if (error.IsProbeFailure()) {
    //        pConnection->ProbeReset();
    //        error.description += "\n\nVerify probe lead is charging workpiece with 5V DC. The workpiece may be shorted to the t-slot platform.";
    //        return error;
    //    }

    //    if (error.IsNotIdle()) {
    //        pConnection->ExecuteCommand(GCodeLine("$X")); // Kill Alarm Clock
    //    }

    //    pConnection->Reset();

    //    if (error.IsHomingFail()) {
    //        error.description += "\n\nPlease make sure there is power to the unit.";
    //    } 

    //    return error;
    //}
    
    if (exception.getType() == MillException::M101_FAIL) {
        MILL_LOG("M101 Failure");
        MillLogger::Flush();

        const std::string msg = "The frame/lower is out of tolerance for the "
            + exception.GetRawDetailMessage()
            + " axis\n\nPlease adjust the frame/lower and try again.\n\nIf this error persists you may need to contact Coast Runner technical support or run the M100.crproj file.\n\nThe workpiece is not positioned within tolerance for the "
            + exception.GetRawDetailMessage()
            + " axis\n\n Please adjust the workpiece and try again.  ";
        return MillingError{ MillingError::Alarm, 101, "Alarm", msg };
    }

    if (exception.getType() == MillException::TIMEOUT || pConnection->IsTimedOut()) {
        MILL_LOG("Resetting to clear timeout error.");
        try { pConnection->Reset(); }
        catch (...) {
            // Do nothing.
        }
        return ErrorCodes::GetAlarm(ALARM_CODE_TIMEOUT);
    }

    if (exception.getType() == MillException::M106_BOOL_TEST_FAIL) {
        MILL_LOG("M106 Test Failed");
        return MillingError{ MillingError::Error, -1, "M106 Check Failed", exception.what()};
    }
    if (exception.getType() == MillException::M106_MALFORMED_TEST) {
        MILL_LOG("M106 Command Malformed");
        MILL_LOG(exception.what());
        return MillingError{ MillingError::Error, -1, "M106 Error", exception.what()};
    }
    
    return MillingError{ MillingError::Error, -1, "Machine is locked due to an error", exception.what() };
}
