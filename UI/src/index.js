console.time("Startup");
import {app, BrowserWindow} from 'electron';
const crwrite = require("crwrite");
import CNCController from './Main/CNCController';
import Updater from './Main/Updater.js';
import env from 'env';
import {version} from '../package.json';

const unhandled = require('electron-unhandled');
console.log(env.name)
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

unhandled({
    logger: console.log,
    showDialog: false
});

global.sharedObject = {argv: process.argv}

const createWindow = async () => {
    console.time("createWindow");
    // Create the browser window.
    mainWindow = new BrowserWindow({
        minWidth: 1205,
        width: 1375,
        minHeight: 710,
        height: 824,
        frame: false,
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: true
        },
        icon: __dirname + '/static/image/coastrunner-icon.ico'
    });

    CNCController.Initialize();
 
    mainWindow.webContents.on('crashed', (event, killed) => {
        let name = "AUTO TICKET";
        let email = "noemail@noemail.com";
        let description = "PLEASE FORWARD TO DEV TEAM. Renderer process crashed. ./UI/src/index.js";
        let includeLogs = true;
        console.log(`Renderer process crashed, was killed: ${killed}`);
        // relaunch app
        crwrite.SendCustomerSupportRequest(name, email, description, version, includeLogs, (error) => {});

        app.exit(0)
    });
    
    mainWindow.webContents.once('dom-ready', () => {
        console.log("Finished loading");
        CNCController.SetWindow(mainWindow);

        if (env.name !== 'development') {
            // Updater.checkForUpdates();
        }
    });

    // and load the index.html of the app.
    

    // Open the DevTools.
    crwrite.LogString("env.name: " + env.name);
    if (env.name == 'development') {
        require('./webpack-server.js');
        mainWindow.loadURL(`http://localhost:3000/`);
        mainWindow.webContents.openDevTools({mode:'undocked'});
    } else {
        mainWindow.loadURL(`file://${__dirname}/index.html`);
    }

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        console.log("closed");

        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
    console.timeEnd("createWindow");
};


const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore();
                mainWindow.focus();
                return;
            }
        }

        // Windows Only -- Double click file while application is open;
        let path = '';
        const index = commandLine.length - 1;
        if (process.platform.startsWith('win') && index >= 1) { path = commandLine[index]; }
        if (path !== '') {
            mainWindow.focus();
            mainWindow.webContents.send("CRFileDoubleClick", path);
            return;
        }

        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow == null && process.platform === 'darwin') {
            createWindow();
            let obj = {cl: commandLine, wd: workingDirectory};
            // crwrite.LogString(obj);
            crwrite.LogString("Second Instance");
            // mainWindow.webContents.send("MacOpenDoubleClickTest", obj);
            // mainWindow.webContents.send("MacOpenDoubleClickTest", "workingDirectory string:");
            // mainWindow.webContents.send("MacOpenDoubleClickTest", workingDirectory);
            // mainWindow.webContents.send("MacOpenDoubleClickTest", "commandLine string:");
            // for(let i = 0; i < commandLine.length; i++) {
            //     mainWindow.webContents.send("MacOpenDoubleClickTest", commandLine[i]);
            // }
            // mainWindow.webContents.send("MacOpenDoubleClickTest", commandLine);
            // mainWindow.webContents.send("CRFileDoubleClick", obj);
            // mainWindow.webContents.send("CRFileDoubleClick", path);
            // mainWindow.send("Logs::LogString", "commandLine string:");
            // mainWindow.send("Logs::LogString", commandLine);
            // mainWindow.send("Logs::LogString", "workingDirectory string:");
            // mainWindow.send("Logs::LogString", workingDirectory);
        }
    });

    let macFilePath = "";
    app.on('open-file', (event, path) => {
        event.preventDefault();
        crwrite.LogString("open-file path: " + path);
        if (path !== '') {
            mainWindow.focus();
            crwrite.LogString("Open File");
            macFilePath = path;
            crwrite.LogString("setting macFilePath: " + macFilePath);
        }
    });

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', createWindow);
    crwrite.LogString("Checking macFilePath: " + macFilePath);
    if (macFilePath !== "") {
        crwrite.LogString("Sending file path to backend: " +  macFilePath);
        mainWindow.webContents.send("CRFileDoubleClick", macFilePath);
    }
    console.timeEnd("Startup");
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    console.log("window-all-closed");
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    //if (process.platform != 'darwin') {
        setTimeout(() => {
            CNCController.SetWindow(null);
            CNCController.Shutdown();

            console.log("app.quit");
            app.quit();
        }, 0);
    //}
});

app.on('before-quit', (e) => {
    console.log("before-quit");
});

app.on('will-quit', (e) => {
    console.log("will-quit");
});

app.on('quit', (e) => {
    console.log("quit");
    app.removeAllListeners();
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow == null) {
        createWindow();
    }
});

// Mac Only -- Double click file while application is open

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
process.on('unhandledRejection', (error, promise) => {
    console.error('Unhandled promise rejection:', promise)
    console.error('Error:', error)
  })
  
  // Catch uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error)
})
