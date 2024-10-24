import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import PropTypes from "prop-types";
import ScrollToTop from "./util/ScrollToTop";
import Dashboard from "./containers/Dashboard";
import Milling from "./containers/Milling";

function Routes(props) {
    const {
        status,
        navigateToMilling,
        showOperationsWindow,
        firmware,
        feedRate,
        updateFeedRate,
        settings,
        toggleShuttle,
        milling,
        openShuttle,
        shuttleSelectedTab,
        closeOperationsWindow,
        setOperationsWindowOpen,
        openImagePanel,
        openJoggingPanel,
        openStepsPanel,
        openProbingWizard,
        setOpenProbingWizard,
        openMachineOutputPanel,
        setNavigateToMilling,
        commandKeys,
        eventKeyFrontEndCommandMap,
        refreshShuttleKeys,
        showJoggingResetAlert,
        toggleJoggingPanel,
        setShowJoggingResetAlert,
        toggleStepsPanel,
        spindleRate,
        updateSpindleRate,
    } = props;

    return (
        <Router>
            <ScrollToTop>
                <Switch>
                    <Route
                        exact
                        path="/"
                        render={(props) => (
                            <Dashboard
                                {...props}
                                firmware={firmware}
                                status={status}
                                feedRate={feedRate}
                                milling={milling}
                                settings={settings}
                                openShuttle={openShuttle}
                                shuttleSelectedTab={shuttleSelectedTab}
                                toggleShuttle={toggleShuttle}
                                closeOperationsWindow={closeOperationsWindow}
                                setOperationsWindowOpen={
                                    setOperationsWindowOpen
                                }
                                updateFeedRate={updateFeedRate}
                                openProbingWizard={openProbingWizard}
                                setOpenProbingWizard={setOpenProbingWizard}
                                navigateToMilling={navigateToMilling}
                                setNavigateToMilling={setNavigateToMilling}
                            />
                        )}
                    />
                    <Route
                        exact
                        path="/milling"
                        render={(props) => (
                            <Milling
                                {...props}
                                status={status}
                                openShuttle={openShuttle}
                                shuttleSelectedTab={shuttleSelectedTab}
                                toggleShuttle={toggleShuttle}
                                milling={milling}
                                firmware={firmware}
                                closeOperationsWindow={closeOperationsWindow}
                                showOperationsWindow={showOperationsWindow}
                                feedRate={feedRate}
                                updateFeedRate={updateFeedRate}
                                spindleRate={spindleRate}
                                updateSpindleRate={updateSpindleRate}
                                settings={settings}
                                openImagePanel={openImagePanel}
                                openJoggingPanel={openJoggingPanel}
                                openStepsPanel={openStepsPanel}
                                openMachineOutputPanel={openMachineOutputPanel}
                                setNavigateToMilling={setNavigateToMilling}
                                commandKeys={commandKeys}
                                eventKeyFrontEndCommandMap={eventKeyFrontEndCommandMap}
                                refreshShuttleKeys={refreshShuttleKeys}
                                showJoggingResetAlert={showJoggingResetAlert}
                                toggleJoggingPanel={toggleJoggingPanel}
                                setShowJoggingResetAlert={setShowJoggingResetAlert}
                                toggleStepsPanel={toggleStepsPanel}
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
