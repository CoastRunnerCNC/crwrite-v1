import React from 'react';
import {HashRouter as Router, Route, Switch} from 'react-router-dom';
import PropTypes from "prop-types";
import ScrollToTop from './util/ScrollToTop'
import Dashboard from './containers/Dashboard';
import Milling from './containers/Milling';


function Routes(props) {
    const { status, showOperationsWindow, firmware, feedRate, updateFeedRate, settings, toggleShuttle, milling, openShuttle, shuttleSelectedTab, closeOperationsWindow, setOperationsWindowOpen } = props;

    return (
        <Router>
            <ScrollToTop>
                <Switch>
                    <Route exact path='/' render={(props) => <Dashboard {...props} firmware={firmware} status={status} feedRate={feedRate} milling={milling} settings={settings} openShuttle={openShuttle} shuttleSelectedTab={shuttleSelectedTab} toggleShuttle={toggleShuttle} closeOperationsWindow={closeOperationsWindow} setOperationsWindowOpen={setOperationsWindowOpen} updateFeedRate={updateFeedRate} />} />
                    <Route exact path='/milling' render={(props) => <Milling {...props} status={status} showOperationsWindow={showOperationsWindow} feedRate={feedRate} updateFeedRate={updateFeedRate} settings={settings} />} />
                </Switch>
            </ScrollToTop>
        </Router>
    );
}

Routes.propTypes = {
    status: PropTypes.number.isRequired
};

export default (Routes);
