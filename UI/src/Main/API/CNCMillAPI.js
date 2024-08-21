import APIUtility from "./APIUtility";

const crwrite = require("crwrite");
const electron = require("electron");
var jogging = false;

class CNCMillAPI {
    static Initialize() {
        electron.ipcMain.on('CNC::GetAvailableCNCs', function (event) {
            var availableCNCMills = crwrite.GetAvailableCNCMills();
            event.reply("CNC::GetAvailableCNCsResponse", availableCNCMills);
        });
        electron.ipcMain.on('CNC::ChooseMill', function (event, path, serialNumber) {
            crwrite.SelectCNCMill(path, serialNumber);
        });

        electron.ipcMain.on('CNC::Jog', function (event, direction, continuous, distance_mm) {
            if (!jogging) {
                try {
                    const parsed_distance = parseFloat(distance_mm);

                    jogging = true;

                    crwrite.Jog({
                        direction: direction,
                        continuous: continuous,
                        distance_mm: parsed_distance
                    });
                } catch (_) {

                }
            }
        });

        electron.ipcMain.on('CNC::CancelJog', function (event) {
            crwrite.CancelJog();
            jogging = false;
        });

        electron.ipcMain.on('CNC::ExecuteCommand', function (event, command, finalCommand) {
            crwrite.ExecuteCommand(command);
            if (finalCommand) {
                event.reply("CNC::ProbingWizardComplete");
            }
        });

        electron.ipcMain.on('CNC::ExecuteRealtime', function (event, command) {
            crwrite.ExecuteRealtime(command.charCodeAt(0));
        });

        electron.ipcMain.on('CNC::SetManualEntryMode', function (event, manualEntryModeFlag) {
            crwrite.SetManualEntryMode(manualEntryModeFlag);
        });

        electron.ipcMain.on('CNC::GetShuttleKeys', function (event) {
            APIUtility.handleAsyncApiResponse(event, 'CNC::GetShuttleKeys', crwrite.GetJogKeys);
        });

        electron.ipcMain.on('CNC::SetShuttleKeys', function (event, shuttleKeys) {
            event.returnValue = crwrite.SetJogKeys(shuttleKeys);
        });

        electron.ipcMain.on('CNC::GetStatus', function (event) {
            let readWrites = crwrite.GetReadWrites();
            console.log("readWrites: " + readWrites);
            let status = crwrite.GetStatus();
            console.log("status: " + status);
            event.sender.send('Jobs::ReadWrites', readWrites);
            event.sender.send("CR_UpdateRealtimeStatus", status);
        });

        electron.ipcMain.on('CNC::GetMachineConfig', function (event) {
            APIUtility.handleAsyncApiResponse(
                event,
                'CNC::GetMachineConfig',
                crwrite.GetMachineConfig
            );
        });

        electron.ipcMain.on('CNC::GetCNCMillStatus', function (event) {
            APIUtility.handleAsyncApiResponse(
                event,
                'CNC::GetCNCMillStatus',
                crwrite.GetCNCMillStatus
            );
        });

        electron.ipcMain.on('CNC::UploadGCodeFile', function (event, gCodeFile) {
            APIUtility.handleAsyncApiResponse(
                event,
                'CNC::UploadGCodeFile',
                () => {
                    console.log('-----');
                    console.log(`gCodeFile: ${gCodeFile}`);
                    crwrite.RunManualGCodeFile(gCodeFile);
                    console.log('-----');
                }
            );
        });

        electron.ipcMain.on('CNC::UploadGCodeString', function (event, gCodeString) {
            APIUtility.handleAsyncApiResponse(
                event,
                'CNC::UploadGCodeFile',
                () => {
                    console.log(gCodeString);
                    crwrite.RunManualGCodeString(gCodeString)
                }
            );
        });

        electron.ipcMain.on('CNC::HasNonzeroWCS', function (event) {
            event.returnValue = crwrite.HasNonzeroWCS();
        });

        electron.ipcMain.on('CNC::AllowWcsClearPrompt', function (event) {
            event.returnValue = crwrite.AllowWcsClearPrompt();
        });

        electron.ipcMain.on('CNC::ClearG54ThroughG58', function (event) {
            crwrite.ClearG54ThroughG58();
        });

        electron.ipcMain.on('CNC::WcsValueCheck', function (event) {
            event.returnValue = crwrite.WcsValueCheck();
        });
    }
}

export default CNCMillAPI;
