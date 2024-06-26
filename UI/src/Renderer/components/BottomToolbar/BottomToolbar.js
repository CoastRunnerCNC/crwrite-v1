import React from "react";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core/styles";
import {AppBar, Button, Grid, Toolbar} from "@material-ui/core";
import {shell} from "electron";
import Status from '../Status';
import Settings from '../Modals/Settings';
import CNCChooser from '../Modals/CNCChooser';
import Support from '../Support';
import Shuttle from '../Modals/Shuttle';
import app from 'app';

const styles = theme => ({
    root: {
        marginBottom: theme.spacing(3),
        // flexGrow: 1
    },
    appBar: {
        top: 'auto',
        height: 39,
        bottom: 0,
        backgroundImage: `url(${app.toolbar.backgroundPhoto})`,
        backgroundColor: '#75327e',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    right: {
        float: 'right'
    },
    connectionArea: {
        display: 'flex',
        flexDirection: 'row'
    },
    websiteLink: {
        color: app.toolbar.websiteLink.color
    }

});

function BottomToolbar(props) {
    const { classes, status, milling, firmware, set_walkthrough_showing, closeOperationsWindow, setOperationsWindowOpen } = props;

    
    function openCNCMillNet() {
        shell.openExternal(app.toolbar.link.url);
    }

    return (
        <footer className={classes.root}>
            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar>
                    <Grid container spacing={1} className={classes.root} alignItems="center">
                        <Grid className={classes.connectionArea} item xs={4}>
                            <Status status={status} />
                            <CNCChooser disabled={milling} />
                        </Grid>
                        <Grid item xs={8}>
                            <div className={classes.right}>
                                <Button className={classes.websiteLink} onClick={openCNCMillNet}>
                                    {app.toolbar.link.display}
                                </Button>
                                <Shuttle openShuttle={props.openShuttle} shuttleSelectedTab={props.shuttleSelectedTab} toggleShuttle={props.toggleShuttle} milling={milling} status={status} firmware={firmware} closeOperationsWindow={closeOperationsWindow} setOperationsWindowOpen={setOperationsWindowOpen} feedRate={props.feedRate} updateFeedRate={props.updateFeedRate} />
                                <Settings disabled={milling} firmware={firmware} firmwareAvailable={props.firmwareAvailable} checkFirmwareUpdates={props.checkFirmwareUpdates} updateMachineStatus={props.updateMachineStatus} updateSetting={props.updateSetting} />
                                <Support disabled={milling} set_walkthrough_showing={set_walkthrough_showing} firmware={firmware} />
                            </div>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        </footer>
    );
}

BottomToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
    status: PropTypes.number.isRequired,
    milling: PropTypes.bool.isRequired,
    set_walkthrough_showing: PropTypes.func.isRequired,
    firmware: PropTypes.object
};

export default withStyles(styles)(BottomToolbar);
