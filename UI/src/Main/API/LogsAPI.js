const crwrite = require("crwrite");
const electron = require("electron");

class FileAPI {
    static Initialize() {
        electron.ipcMain.on('Logs::GetLogFile', function (event) {
            event.reply('Logs::ResponseGetLogFile', crwrite.GetLogPath());
        });

        electron.ipcMain.on('Logs::LogString', function (event, string) {
            crwrite.LogString(string);    // I think this can be an array as well: [str1, str2, str3, ...]
        });
    }
}

export default FileAPI;
