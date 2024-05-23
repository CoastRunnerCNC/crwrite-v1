/*import React from 'react';
import ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';

// main app
import App from './App';

ReactDOM.render(
    <AppContainer>
        <App />
    </AppContainer>, document.getElementById('App')
);
*/

import {version} from '../../package.json';
const crwrite = require("crwrite");
console.time("renderApp");

window.onerror = function(message, source, lineno, colno, error) {
    let errorDetails = `Error: ${message}\n` + `Source: ${source}\n` + `Line: ${lineno}\n` + `Column: ${colno}\n` + `Error object: ${JSON.stringify(error)}`;
    let name = "AUTO TICKET";
    let email = "noemail@noemail.com";
    let description = "PLEASE FORWARD TO DEV TEAM. Renderer process error. ./UI/src/Renderer/renderApp.js\n\n" + errorDetails;
    let includeLogs = true;

    crwrite.LogString(errorDetails);

    // crwrite.SendCustomerSupportRequest(name, email, description, version, includeLogs, (error) => {});
};


import React from 'react';
import ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import env from 'env';
//import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

/*installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));*/
    console.log(env.coastrunner + " = true?");
    const render = () => {
    const App = require('./App').default;
    ReactDOM.render(
    <AppContainer>
        <App />
    </AppContainer>, document.getElementById('App'));
    }

    render();
if (module.hot) {
    module.hot.accept(render);
}
console.timeEnd("renderApp");
