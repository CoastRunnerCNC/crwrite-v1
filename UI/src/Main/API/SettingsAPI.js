import Settings from "../../Common/Models/Settings";
import APIUtility from "./APIUtility";

var crwrite = require("crwrite");
var electron = require("electron");

export default class SettingsAPI {

    static Initialize() {
        /*
         *
         * DECLARE_NAPI_METHOD("GetEnableSlider", GetEnableSlider),
         * DECLARE_NAPI_METHOD("GetPauseAfterGCode", GetPauseAfterGCode),
         * DECLARE_NAPI_METHOD("GetMinFeedRate", GetMinFeedRate),
         * DECLARE_NAPI_METHOD("GetMaxFeedRate", GetMaxFeedRate),
         * DECLARE_NAPI_METHOD("GetSettings", GetSettings),
         * DECLARE_NAPI_METHOD("UpdateSettings", UpdateSettings),
         *
         */
        electron.ipcMain.on('Settings::GetSettings', function (event) {
            APIUtility.handleAsyncApiResponse(
                event,
                'Settings::GetSettings',
                () => {
                    let settings = crwrite.GetSettings();
                    let pauseAfterGCode = settings["pauseAfterGCode"];
                    let enableSlider = settings["enable_slider"];
                    let maxFeedRate = settings["maxFeedRate"];
                    let disableLimitCatch = settings["disableLimitCatch"];
                    let showEditButtonSetting = settings["showEditButtonSetting"]
                    let enableEditButton = settings["enableEditButton"];
                    console.log("Settings::GetSettings response: " + JSON.stringify(settings));


                    return new Settings(pauseAfterGCode, enableSlider, maxFeedRate, disableLimitCatch, showEditButtonSetting, enableEditButton);
                }
            );
        });

        electron.ipcMain.on('Settings::UpdateSettings', function (
            event,
            pauseAfterGCode,
            enableSlider,
            maxFeedRate,
            disableLimitCatch,
            enableEditButton
        ) {
            let settings = new Settings(pauseAfterGCode, enableSlider, maxFeedRate, disableLimitCatch, null, enableEditButton);
            console.log("SET: " + JSON.stringify(settings));
            crwrite.UpdateSettings(settings);
        });

        electron.ipcMain.on('Settings::GetFeedRate', function (event) {
            APIUtility.handleAsyncApiResponse(event, 'Settings::GetFeedRate', crwrite.GetFeedRate);
        });

        electron.ipcMain.on('Settings::SetFeedRate', function (event, feedRate) {
            crwrite.SetFeedRate(feedRate);
        });

        electron.ipcMain.on('Settings::GetPositionButton', function (event, buttonNumber) {
            event.reply('Settings::ResponseGetPositionButton', crwrite.GetPositionButton(buttonNumber));
        });

        electron.ipcMain.on('Settings::SetPositionButton', function (event, buttonNumber) {
            crwrite.SetPositionButton(buttonNumber);
            event.reply('Settings::ResponseSetPositionButton');
        });
    }
}
