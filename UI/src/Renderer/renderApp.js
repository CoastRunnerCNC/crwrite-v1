import {version} from '../../package.json';
const crwrite = require("crwrite");
console.time("renderApp");

// window.onerror = function(message, source, lineno, colno, error) {
//     let errorDetails = `Error: ${message}\n` + `Source: ${source}\n` + `Line: ${lineno}\n` + `Column: ${colno}\n` + `Error object: ${JSON.stringify(error)}`;
//     let name = "AUTO TICKET";
//     let email = "noemail@noemail.com";
//     let description = "PLEASE FORWARD TO DEV TEAM. Renderer process error. ./UI/src/Renderer/renderApp.js\n\n" + errorDetails;
//     let includeLogs = true;

//     crwrite.LogString(errorDetails);

// };


import React from 'react';
import ReactDOM from 'react-dom';
import {AppContainer} from 'react-hot-loader';
import env from 'env';

    console.log(env.coastrunner + " = true?");
    const render = () => {
    const App = require('./App').default;
    ReactDOM.render(
    <AppContainer>
        <App />
    </AppContainer>, document.getElementById('App'));
    }
console.time("render()");
    render();
console.timeEnd("render()")
// if (module.hot) {
//     module.hot.accept(render);
// }
console.timeEnd("renderApp");
