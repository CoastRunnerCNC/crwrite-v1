const crwrite = require("crwrite");
const electron = require("electron");
const globalAny = global;
var mainWindow = null;
var crStatus = 0;
var milling = false;
var currentContainer = "Dashboard";

import SettingsAPI from "./API/SettingsAPI";
import FirmwareAPI from "./API/FirmwareAPI";
import FileAPI from "./API/FileAPI";
import CNCMillAPI from "./API/CNCMillAPI";
import JobsAPI from "./API/JobsAPI";
import LogsAPI from "./API/LogsAPI";
import SupportAPI from "./API/SupportAPI";
import WalkthroughAPI from "./API/WalkthroughAPI";

function InitializeAPIs() {
    SettingsAPI.Initialize();
    FirmwareAPI.Initialize();
    FileAPI.Initialize();
    CNCMillAPI.Initialize();
    JobsAPI.Initialize();
    LogsAPI.Initialize();
    SupportAPI.Initialize();
    WalkthroughAPI.Initialize();
    electron.ipcMain.on("CR_SetCurrentPage", function (event, container) {
        currentContainer = container;
    });
    electron.ipcMain.on("CR_GetCurrentPage", function (event) {
        event.reply('ResponseCR_GetCurrentPage', currentContainer);
    });
}

function CheckConnectionStatus() {
    if (mainWindow != null) {
        let newStatus = crwrite.GetCNCMillStatus(); // TODO: Add callback to avoid slowness when e-stop is pressed.

        if (newStatus.connection_status != crStatus || milling != newStatus.milling) {
            crStatus = newStatus.connection_status;
            milling = newStatus.milling;
            mainWindow.webContents.send("CR_UpdateCRStatus", newStatus.connection_status, newStatus.milling);
        }
    }
}

var connectionStatusIntervalId = null;
class CRController {
    static Initialize() {
        crwrite.Initialize(function () {
            InitializeAPIs();
            let filePath = "";

            if (process.argv.length > 1 && process.argv[1].length > 1) {
                filePath = process.argv[1];
                global.job_passed_in = crwrite.SetCRFile(process.argv[1]).length === 0;
            }

            electron.ipcMain.on("GetPassedInFilePath", function (event) {
                const jobPassedIn = global.job_passed_in;
                global.job_passed_in = false;
                if (jobPassedIn) {
                    event.reply('ResponseGetPassedInFilePath', filePath);
                } else {
                    event.reply('ResponseGetPassedInFilePath', null);
                }
            });

            electron.ipcMain.on("GetPassedInJobs", function (event) {
                const value = global.job_passed_in;
                
                if (value) {
                    event.reply('ResponseGetPassedInJobs', crwrite.GetJobs());
                } else {
                    event.reply('ResponseGetPassedInJobs', null);
                }
            });

            crwrite.InstallDrivers();

            connectionStatusIntervalId = setTimeout(function check_status() {
                CheckConnectionStatus();
                connectionStatusIntervalId = setTimeout(check_status, 100);
            }, 100);
            
            globalAny.initialized = true;
        });
    }

    static SetWindow(window) {
        mainWindow = window;
    }

    static Shutdown() {
        clearTimeout(connectionStatusIntervalId);
        crwrite.Shutdown();
    }
}

export default CRController;
