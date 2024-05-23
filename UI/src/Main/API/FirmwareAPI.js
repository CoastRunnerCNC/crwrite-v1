var crwrite = require("crwrite");
var electron = require("electron");
import FirmwareUpdate from "../../Common/Models/FirmwareUpdate";

class FirmwareAPI {
    static Initialize() {
        /*
         *
         * napi_get_named_property(env, args[0], "Version", &versionProperty);
         * napi_get_named_property(env, args[0], "Description", &descriptionProperty);
         * napi_get_named_property(env, args[0], "Files", &filesArray);
         *
         * DECLARE_NAPI_METHOD("UploadFirmware", UploadFirmware),
         * DECLARE_NAPI_METHOD("GetFirmwareUploadStatus", GetFirmwareUploadStatus),
         * DECLARE_NAPI_METHOD("GetFirmwareVersion", GetFirmwareVersion),
         * DECLARE_NAPI_METHOD("GetAvailableFirmwareUpdates", GetAvailableFirmwareUpdates)
         *
         */
        electron.ipcMain.on("Firmware::GetAvailableFirmwareUpdates", function (event) {
            crwrite.GetAvailableFirmwareUpdates(function (availableFirmware) {
                var availableUpdates = [];
                console.log(availableFirmware);
                for (var i = 0; i < availableFirmware.length; i++) {
                    var version = availableFirmware[i].version;
                    var description = availableFirmware[i].description;
                    var file328p = availableFirmware[i].file_328p;
                    var file32m1 = '';
                    if (availableFirmware[i].file_32m1 != null) {
                        file32m1 = availableFirmware[i].file_32m1;
                    }

                    var update = new FirmwareUpdate(version, description, file328p, file32m1);
                    availableUpdates.push(update);
                }
                event.sender.send("Firmware::UpdatesAvailable", availableUpdates);
            });
        });
        electron.ipcMain.on("Firmware::GetFirmwareUploadStatus", function (event) {
            event.reply('Firmware::ResponseGetFirmwareUploadStatus', crwrite.GetFirmwareUploadStatus());
        });
        electron.ipcMain.on("Firmware::GetFirmwareVersion", function (event) {
            var firmwareVersion = crwrite.GetFirmwareVersion();
            try {
                event.reply('Firmware::ResponseGetFirmwareVersion',JSON.parse(firmwareVersion));
            } catch (e) {
                event.reply('Firmware::ResponseGetFirmwareVersion', null);
            }
        });

        electron.ipcMain.on("Firmware::UploadFirmware", function (event, version, description, file328p, file32m1) {
            var firmwareUpdate = new FirmwareUpdate(version, description, file328p, file32m1);
            event.reply('Firmware::ResponseUploadFirmware', crwrite.UploadFirmware(firmwareUpdate));
        });

        electron.ipcMain.on("Firmware::UploadCustomFirmware", function (event, file328p, file32m1) {
            event.reply('Firmware::ResponseUploadCustomFirmware', crwrite.UploadCustomFirmware(file328p, file32m1));
        });

        electron.ipcMain.on('Firmware::FirmwareMeetsMinimumVersion', function (event) {
            event.returnValue = crwrite.FirmwareMeetsMinimumVersion();
        });

        electron.ipcMain.on('Firmware::CRWriteMeetsMinimumVersion', function (event, version) {
            event.returnValue = crwrite.CRWriteMeetsMinimumVersion(version);
        });
    };
}

export default FirmwareAPI;
