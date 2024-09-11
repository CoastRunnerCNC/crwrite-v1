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
        openProbingWizard,
        setOpenProbingWizard,
        openMachineOutputPanel,
        setNavigateToMilling
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
                                settings={settings}
                                openImagePanel={openImagePanel}
                                openJoggingPanel={openJoggingPanel}
                                openMachineOutputPanel={openMachineOutputPanel}
                                setNavigateToMilling={setNavigateToMilling}
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
