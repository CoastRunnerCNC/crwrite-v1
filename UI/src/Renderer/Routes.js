import React from 'react';
import {HashRouter as Router, Route, Switch} from 'react-router-dom';
import PropTypes from "prop-types";
import ScrollToTop from './util/ScrollToTop'
import Dashboard from './containers/Dashboard';
import Milling from './containers/Milling';


function Routes(props) {
    const { status, showOperationsWindow, feedRate, updateFeedRate, settings, toggleShuttle } = props;

    return (
        <Router>
            <ScrollToTop>
                <Switch>
                    <Route exact path='/' render={(props) => <Dashboard {...props} status={status} settings={settings} toggleShuttle={toggleShuttle} />} />
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
