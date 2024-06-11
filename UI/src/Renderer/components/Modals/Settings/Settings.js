import React from "react";
import PropTypes from "prop-types";
import {Button, Typography, Dialog, DialogContent, Fab, Grid, Tooltip, Badge} from "@material-ui/core";
import path from "path";
import {withStyles} from "@material-ui/core/styles";
import {ipcRenderer} from "electron";
import app from 'app';
import SettingsTabs from './SettingsTabs.js';
import Operation from './Operation';
import Machine from './Machine';
import Software from './Software';
import ManualFirmwareUpload from './ManualFirmwareUpload';
import DialogTitle from "@material-ui/core/DialogTitle";
import './Settings.scss'

const styles = theme => ({
    settingsButton: {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        marginRight: '5px',
        backgroundColor: app.menuButton.backgroundColor,
        '&:disabled': {
            opacity: 0.5
        }
    },
    settingsCog: {
        width: '25px',
        height: '25px',
        marginRight: theme.spacing(1),
        padding: 0,
        marginTop: 0
    },
    settingsText: {
        width: '62px',
        height: '28px',
        objectFit: 'contain',
        padding: 0,
        margin: 0
    },
    timeoutText: {
        width: 100,
        height: 30,
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        marginTop: theme.spacing(1),
        color: '#ffffff'
    },
    cancel: {
        marginRight: theme.spacing(1)
    },
    save: {
        marginLeft: theme.spacing(1)
    },
    radio: {
        marginLeft: theme.spacing(1),
        marginTop: 0,
        marginBottom: 0
    },
    radioGroup: {
        width: "100%",
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderColor: app.modal.color,
        borderWidth: "2px",
        borderRadius: "2px"
    },
    feedRatePercentage: {
        marginLeft: theme.spacing(1),
        padding: theme.spacing(1),
        backgroundColor: "transparent",
        color: app.modal.color
    }
});

function Settings(props) {
    const { classes, disabled, firmware } = props;
    const [open, setOpen] = React.useState(false);
    const [selectedTab, setSelectedTab] = React.useState(0);
    const [settings, setSettings] = React.useState(null);

    
    function handleClickOpen() {
		if (!disabled) {
            ipcRenderer.once('Settings::GetSettingsResponse', (event, settings) => {
                setSettings(settings);
                setOpen(true);
            });
            ipcRenderer.send("Settings::GetSettings");
		}
    }

    function handleClose() {
        setSelectedTab(0);
        setOpen(false);
    }

    function displaySelectedWindow() {
        if (open === true) {
            if (selectedTab === 0) {
                return (<Operation settings={settings} closeDialog={handleClose} updateSetting={props.updateSetting} />);
            } else if (selectedTab === 1) {
                return (<Machine firmware={firmware} disabled={false} />);
            } else if (selectedTab === 2) {
                return (<Software setSelectedTab={setSelectedTab} firmware={firmware} firmwareAvailable={props.firmwareAvailable} checkFirmwareUpdates={props.checkFirmwareUpdates} updateMachineStatus={props.updateMachineStatus} />);
            } else {
                return (<ManualFirmwareUpload setSelectedTab={setSelectedTab} firmware={firmware} checkFirmwareUpdates={props.checkFirmwareUpdates} updateMachineStatus={props.updateMachineStatus} />);
            }
        }

        return "";
    }

    function showCR3FirmwareTip() {
        if (firmware) {
            if (firmware.grbl.startsWith('1.1')) {
                return (
                    <React.Fragment>
                        <Typography variant="subtitle1">
                            <p>
                                To update the 32M1 firmware, select BOTH a valid 32M1 firmware file and a 328p firmware file.
                            </p>
                        </Typography>
                    </React.Fragment>
                );
            }
        }
    }

    function displayTabMenu() {
        if (selectedTab <= 2) {
            return (
                    <SettingsTabs selectTab={setSelectedTab} selectedTab={selectedTab} firmwareAvailable={props.firmwareAvailable} />
            );
        } else if (firmware) {
            return (
                <Typography variant="subtitle1">
                    <p>
                        Use this functionality to manually upload firmware files. 
                        To update the 328p firmware, select a valid 328p firmware file. 
                    </p>
                    {showCR3FirmwareTip()}
                    <p>
                        <b>
                            WARNING: uploading invalid firmware files can break your machine. 
                            Do not use this functionality unless you know what you are doing.
                        </b>
                    </p>
                </Typography>
            );
        } else {
            return (
                <h4><center>Please connect your machine</center></h4>
            );
        }
    }

    function displayDialogTitle() {
        if (selectedTab === 3) {
            return (
                <React.Fragment>Manual Firmware Upload</React.Fragment>
            );
        } else {
            return (
                <React.Fragment>Settings</React.Fragment>
            );

        }
    }

    return (
        <React.Fragment>
            <Tooltip
                disableHoverListener={!disabled}
                disableFocusListener={true}
                disableTouchListener={true}
                title="Disabled while machine is running"
            >
                <span>
                    <Badge color="error" variant="dot" invisible={!props.firmwareAvailable} >
                        <Button
                            variant="extended"
                            aria-label="Settings"
                            disabled={disabled}
                            onClick={handleClickOpen}
                            className={classes.settingsButton}
                            size="small"
                            id="settings"
                            style={{border: '1px solid black', backgroundColor: '#f6f6f6', borderRadius: '0px', height: '100%', boxShadow: "1px 1px 0px 0px #000000"}}
                        >
                            <img src={path.join(__dirname, app.image.cog)} className={classes.settingsCog} />
                            <img src={path.join(__dirname, app.image.settingsButton)} className={classes.settingsText}/>
                        </Button>
                    </Badge>
                </span>
            </Tooltip>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="form-dialog-title"
                maxWidth="sm"
                PaperProps={{
                    className: classes.paper
                }}
            >
                <DialogTitle id="form-dialog-title">
                    <Grid container>
                        <Grid item xs={1} />
                        <Grid item xs={10}>
                            <center>
                                {displayDialogTitle()}
                            </center>
                        </Grid>
                        <Grid item xs={1}>
                            <Button onClick={handleClose}>X</Button>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <div>
                        {displayTabMenu()}

                        <section id="dialog-content-section">
                            {displaySelectedWindow()}
                        </section>
                    </div>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}

Settings.propTypes = {
    classes: PropTypes.object.isRequired,
    disabled: PropTypes.bool.isRequired,
    firmware: PropTypes.object
};

export default withStyles(styles)(Settings);
