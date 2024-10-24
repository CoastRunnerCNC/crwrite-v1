import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import PropTypes from "prop-types";
import ScrollToTop from "./util/ScrollToTop";
import Dashboard from "./containers/Dashboard";
import Milling from "./containers/Milling";

function Routes(props) {
    // Create a reusable object containing common props
    const sharedProps = {
        status: props.status,
        firmware: props.firmware,
        feedRate: props.feedRate,
        updateFeedRate: props.updateFeedRate,
        settings: props.settings,
        toggleShuttle: props.toggleShuttle,
        milling: props.milling,
        openShuttle: props.openShuttle,
        shuttleSelectedTab: props.shuttleSelectedTab,
        closeOperationsWindow: props.closeOperationsWindow,
        setOperationsWindowOpen: props.setOperationsWindowOpen,
        openProbingWizard: props.openProbingWizard,
        setOpenProbingWizard: props.setOpenProbingWizard,
        navigateToMilling: props.navigateToMilling,
        setNavigateToMilling: props.setNavigateToMilling,
    };

    return (
        <Router>
            <ScrollToTop>
                <Switch>
                    <Route
                        exact
                        path="/"
                        render={(routeProps) => (
                            <Dashboard
                                {...routeProps}
                                {...sharedProps}
                            />
                        )}
                    />
                    <Route
                        exact
                        path="/milling"
                        render={(routeProps) => (
                            <Milling
                                {...routeProps}
                                {...sharedProps}
                                showOperationsWindow={props.showOperationsWindow}
                                spindleRate={props.spindleRate}
                                updateSpindleRate={props.updateSpindleRate}
                                openImagePanel={props.openImagePanel}
                                openJoggingPanel={props.openJoggingPanel}
                                openStepsPanel={props.openStepsPanel}
                                openMachineOutputPanel={props.openMachineOutputPanel}
                                commandKeys={props.commandKeys}
                                eventKeyFrontEndCommandMap={props.eventKeyFrontEndCommandMap}
                                refreshShuttleKeys={props.refreshShuttleKeys}
                                showJoggingResetAlert={props.showJoggingResetAlert}
                                toggleJoggingPanel={props.toggleJoggingPanel}
                                setShowJoggingResetAlert={props.setShowJoggingResetAlert}
                                toggleStepsPanel={props.toggleStepsPanel}
                            />
                        )}
                    />
                </Switch>
            </ScrollToTop>
        </Router>
    );
}


Routes.propTypes = {
    status: PropTypes.number.isRequired,
};

export default Routes;
