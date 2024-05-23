const { dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const logger = require("electron-log");

var version = null;

autoUpdater.on('error', (error) => {
    logger.error("autoUpdater error occurred:\n" + JSON.stringify(error));

    if (version !== null) {
        dialog.showMessageBox({
            type: "error",
            title: "Error occurred while updating",
            message: "An error occured while attempting to auto-update. CRWrite must be updated manually. You'll now be directed to the download page.\n",
            buttons: ["Ok"]
        }, e => {
            shell.openExternal("https://coastrunner.net/downloads/");
        });
    }
});

autoUpdater.on('update-available', (eventInfo) => {
    //version = releaseName;

    logger.info("update-available: Downloading version " + version);
    autoUpdater.downloadUpdate();
});

autoUpdater.on('update-not-available', () => {
    logger.info("update-not-available: No new updates available");
});

// https://www.electronjs.org/docs/latest/tutorial/updates#applying-updates
autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    version = releaseName;
    logger.info("update-downloaded: Downloaded version " + version);

    var message = 'A new version of CRWrite is available. Would you like to update now?\n';
    if (version !== null) {
        message += "\nVersion: " + version;
    }

    dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: message,
        buttons: ['Yes', 'No']
    }, (buttonIndex) => {
        if (buttonIndex == 0) {
            logger.info("update-downloaded: User chose to install update.");
            autoUpdater.quitAndInstall();
        } else {
            logger.info("update-downloaded: User choose not to update.");
        }
    });
});

function checkForUpdates() {
    logger.transports.file.level = "debug";
    autoUpdater.logger = logger;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;
    return autoUpdater.checkForUpdates();
}

export default {checkForUpdates};