import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import path from "path";
import {ipcRenderer} from 'electron';
import {
    Button,
    Badge,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Typography
} from '@material-ui/core';
import ColoredProgressBar from '../../ColoredProgressBar';
import Alert from '../Alert';
import app from 'app';

const styles = theme => ({
    cancel: {
        marginTop: theme.spacing(-1),
        marginBottom: theme.spacing(1),
        backgroundColor: app.button.cancel.backgroundColor,
        color: app.button.cancel.color
    },
    select: {
        marginTop: theme.spacing(-1),
        marginBottom: theme.spacing(1),
        backgroundColor: app.button.save.backgroundColor,
        color: app.button.save.color
    },
    firmwareList: {
        width: "100%"
    },
    firmwareText: {
        width: "calc(100% - 6px)"
    }
});

class FirmwareUpdater extends React.Component {
    constructor() {
        super();
        this.state = {
            showUpdates: false,
            showUpdater: false,
            updatesLoaded: false,
            selectedIndex: -1,
            availableFirmware: [],
            uploadStatus: -1,
            status_message: '',
            error: false
        };

        this.uploadFirmwareStatusIntervalId = null;
        this.onAvailableFirmware = this.onAvailableFirmware.bind(this);
        this.updateFirmwareUploadStatus = this.updateFirmwareUploadStatus.bind(this);
        this.closeUpdater = this.closeUpdater.bind(this);
    }

    closeUpdater() {
        this.setState({
            showUpdater: false,
            updatesLoaded: false,
            showUpdates: false,
            selectedIndex: -1,
            uploadStatus: -1,
            status_message: '',
            error: false
        });
        this.props.checkFirmwareUpdates(9)
        this.props.refreshFirmwareVersion();
        this.props.setSelectedTab(2);
    }

    componentDidMount() {
        if (this.props.firmwarePreselected === true) {
            this.uploadFirmwareStatusIntervalId = setInterval(this.updateFirmwareUploadStatus, 50);
            this.setState({ showUpdater: true, showUpdates: true });
        }
    }

    showUploadFirmwareButton() {
        if (this.props.firmwarePreselected === false) {
            return (
                <Badge color="error" variant="dot" invisible={!this.props.firmwareAvailable}>
                    <Button
                    className={this.props.classes.select}
                    onClick={() => { this.setState({ showUpdates: true }); }}
                    variant="contained"
                    color="secondary"
                    size="large"
                    fullWidth
                    >
                        Update to Latest Firmware
                    </Button>
                </Badge>
            );
        }
    }

    updateFirmwareUploadStatus() {
        if (!this.state.showUpdater) {
            clearInterval(this.uploadFirmwareStatusIntervalId);
        } else {
            ipcRenderer.once('Firmware::ResponseGetFirmwareUploadStatus', (event, status) => {
                if (status != this.state.uploadStatus) {
                    if (status < 0) {
                        clearInterval(this.uploadFirmwareStatusIntervalId);
                        this.setState({
                            //uploadStatus: status,
                            error: true,
                            status_message: 'An error occurred while updating the firmware. Please try again.'
                        });
                    } else {
                        //document.getElementById("StatusText").innerHTML = status + "%";
                        //document.getElementById("StatusBar").style.width = (2.50 * status) + "px";
    
                        if (status === 100) {
                            clearInterval(this.uploadFirmwareStatusIntervalId);
                            this.setState({
                                uploadStatus: status,
                                status_message: 'Firmware update completed successfully!'
                            });
                        } else {
                            this.setState({ uploadStatus: status });
                        }
                    }
                }
            });
            ipcRenderer.send("Firmware::GetFirmwareUploadStatus");
        }
    }

    onAvailableFirmware(event, availableUpdates) {
        this.setState({ availableFirmware: availableUpdates });
    }

    render() {
        const { classes } = this.props;

        if (this.state.showUpdates) {
            if (!this.state.updatesLoaded) {
                ipcRenderer.removeAllListeners("Firmware::UpdatesAvailable");
                ipcRenderer.on("Firmware::UpdatesAvailable", this.onAvailableFirmware);

                ipcRenderer.send("Firmware::GetAvailableFirmwareUpdates");

                this.setState({ updatesLoaded: true });
            }
        }

        function handleSelect(event) {
            if (this.state.selectedIndex >= 0) {
                const firmwareUpdate = this.state.availableFirmware[this.state.selectedIndex];
                ipcRenderer.once('Firmware::ResponseUploadFirmware', (event, success) => {
                    if (success) {
                        console.log("SUCCESS");
                        this.uploadFirmwareStatusIntervalId = setInterval(this.updateFirmwareUploadStatus, 50);
                        this.setState({ showUpdater: true });
                        return;
                    }
                });
                ipcRenderer.send("Firmware::UploadFirmware", firmwareUpdate.version,
                    firmwareUpdate.description, firmwareUpdate.file_328p, firmwareUpdate.file_32m1);
            }
            this.closeUpdater();
        }

        function handleSelectFirmware(event) {
            this.setState({ selectedIndex: event.target.selectedIndex });
        }

        function getButtons(instance) {
            if (!instance.state.showUpdater) {
                return (
                    <Grid container spacing={8} justify="center">
                        <Grid item xs={3}>
                            <Button
                                variant="contained"
                                className={classes.cancel}
                                onClick={instance.closeUpdater}
                                fullWidth
                            >
                                CANCEL
                            </Button>
                        </Grid>
                        <Grid item xs={3}>
                            <Button
                                variant="contained"
                                className={classes.select}
                                color="secondary"
                                onClick={handleSelect.bind(instance)}
                                fullWidth
                            >
                                SELECT
                            </Button>
                        </Grid>
                    </Grid>
                );
            } else {
                return <br />;
            }
        }

        function getProgress(instance) {
            if (instance.state.showUpdater) {
                return (
                    <React.Fragment>
                        <Grid container spacing={1}>
                            <Grid item xs={3}>
                                <img src={path.join(__dirname, './static/img/computer.png')} width="128" height="72" style={{ marginTop: '15px' }}/>
                            </Grid>
                            <Grid item xs={6}>
                                <br/>
                                <ColoredProgressBar variant="determinate" error={instance.state.error} style={{ height: '30px', marginTop: '5px' }} value={instance.state.uploadStatus} />
                            </Grid>
                            <Grid item xs={3}>
                                <img src={path.join(__dirname, './static/img/mill.png')} width="90" height="90" />
                            </Grid>
                        </Grid>
                    </React.Fragment>
                );
            }

            return "";
        }

        function getSelection(instance) {
            if (!instance.state.showUpdater) {
                return (
                    <React.Fragment>
                        <Typography>Select firmware version to download.</Typography>
                        <select size="5" onChange={handleSelectFirmware.bind(instance)} className={classes.firmwareList}>
                            {
                                instance.state.availableFirmware.map((firmware, index) => {
                                    return (<option key={index}>{firmware.description}</option>);
                                })
                            }
                        </select>
                        <br />
                    </React.Fragment>
                );
            }

            return "";
        }

        return (
            <React.Fragment>
                <Alert
                        open={this.state.status_message.length > 0}
                        message={this.state.status_message}
                        yesNo={false}
                        onOk={(event) => { this.closeUpdater(); }}
                        onCancel={() => {return}}
                />
                {this.showUploadFirmwareButton()}
                <Dialog
                    open={this.state.showUpdates}
                    aria-labelledby="form-dialog-title"
                    maxWidth="sm"
                    PaperProps={{ style: { overflow: 'hidden' } }}
                    fullWidth
                >
                    <DialogTitle>
                        <center>
                            { this.state.showUpdater ? "Uploading Firmware" : "Firmware Selection" }
                        </center>
                    </DialogTitle>
                    <DialogContent>
                        { getProgress(this) }
                        { getSelection(this) }
                    </DialogContent>
                    <DialogActions>
                        { getButtons(this) }
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

FirmwareUpdater.propTypes = {
    classes: PropTypes.object.isRequired,
    refreshFirmwareVersion: PropTypes.func
};

export default withStyles(styles)(FirmwareUpdater);