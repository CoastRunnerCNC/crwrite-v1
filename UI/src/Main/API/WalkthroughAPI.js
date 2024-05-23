const crwrite = require("crwrite");
const electron = require("electron");

class WalkthroughAPI {
    static Initialize() {
        electron.ipcMain.on('Walkthrough::ShouldDisplay', function (event, walkthroughType) {
            if (crwrite.ShouldShowWalkthrough(walkthroughType)) {
                event.reply('Walkthrough::ResponseShouldDisplay');
            }
        });
        electron.ipcMain.on('Walkthrough::SetShowWalkthrough', function (event, walkthroughType, value) {
            event.returnValue = crwrite.SetShowWalkthrough(walkthroughType, value);
        });
    }
}

export default WalkthroughAPI;
