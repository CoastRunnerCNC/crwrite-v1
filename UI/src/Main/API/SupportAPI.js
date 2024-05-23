const crwrite = require("crwrite");
const electron = require("electron");
import {version} from '../../../package.json';

class SupportAPI {

    static Initialize() {
        electron.ipcMain.on('Support::SendRequest', function (event, name, email, description, includeLogs) {
            crwrite.SendCustomerSupportRequest(name, email, description, version, includeLogs, (error) => {
                event.sender.send('Support::SendRequestResponse', error);
            });
        });
    }
}

export default SupportAPI;
