import React from "react";
import {Grid, Typography, Button} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import {ipcRenderer} from "electron";
import FirmwareUpdater from "../../FirmwareUpdater";
import {version} from '../../../../../../package.json';
import Alert from '../../../Modals/Alert';
import app from 'app';

const styles = theme => ({
    button: {
        '&:disabled': {
            opacity: 0.5,
            color: 'white',
            backgroundColor: theme.palette.secondary.main
        }
    },
    actionButton: {
        color: 'black',
        backgroundColor: '#f6f6f6'
    }
});

class ManualFirmwareUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            path328p: "",
            path32m1: "",
            alertMessage: "",
            firmwareUploading: false
        }
        this.show32M1Button = this.show32M1Button.bind(this);
        this.showFirmwareUpdateProgress = this.showFirmwareUpdateProgress.bind(this);
        this.onClickUploadFirmware = this.onClickUploadFirmware.bind(this);
    }

    onClickUploadFirmware() {
        ipcRenderer.once( 'Firmware::ResponseUploadCustomFirmware', (event, success) => {
            this.setState({ alertMessage: "Upload succeded == " + success, firmwareUploading: true  });
        });
        ipcRenderer.send('Firmware::UploadCustomFirmware', this.state.path328p, this.state.path32m1);
    }

    showUploadFirmwareButton() {
        
        if (this.props.firmware && (this.state.path328p || this.state.path32m1)) {
            return (
                <React.Fragment>
                    <Grid container spacing={1}>
                        <Grid item xs={3} />
                        <Grid item xs={6}>
                        <Button
                            className={this.props.classes.actionButton}
                            variant="contained"
                            onClick={this.onClickUploadFirmware}
                            fullWidth
                        >
                        Upload Firmware
                        </Button>
                        </Grid>
                        <Grid item xs={3} />
                    </Grid>
                    <br /><br />
                </React.Fragment>
            );
        } 
    }

    show32M1Button() {
        if (this.props.firmware && this.props.firmware.grbl.startsWith('1.1')) {
            return (
                <React.Fragment>
                    <Grid container spacing={1}>
                        <Grid item xs={3} />
                        <Grid item xs={6}>
                            { this.state.path32m1
                            ? (<Typography variant='subtitle1'>{this.state.path32m1}</Typography>) :
                            (<Button
                                className={this.props.classes.actionButton}
                                variant="contained"
                                onClick={ () => {
                                    ipcRenderer.once('FirmwareFileSelected', (event, gCodeFilePath) => {
                                        this.setState({path32m1: gCodeFilePath});
                                    });
                                    ipcRenderer.send('File::OpenFirmwareFileDialog');
                                } }
                                fullWidth
                            >
                                Select Firmware 32M1
                            </Button>)
                            }
                        </Grid>
                        <Grid item xs={3} />
                    </Grid>
                    <br /><br />
                </React.Fragment>
            );

        } else {
            return "";
        }
    }

    show328pButton() {
        if (this.props.firmware) {
            return (
                <React.Fragment>
                    <Grid container spacing={1}>
                        <Grid item xs={3} />
                        <Grid item xs={6}>
                            { this.state.path328p
                            ? (<Typography variant='subtitle1'>{this.state.path328p}</Typography>) :
                            (<Button
                                variant="contained"
                                className={this.props.classes.actionButton}
                                onClick={ () => {
                                    ipcRenderer.once('FirmwareFileSelected', (event, gCodeFilePath) => {
                                        this.setState({path328p: gCodeFilePath});
                                    });
                                    ipcRenderer.send('File::OpenFirmwareFileDialog');
                                } }
                                fullWidth
                            >
                                Select Firmware 328P
                            </Button>)
                            }
                        </Grid>
                        <Grid item xs={3} />
                    </Grid>
                    <br />
                </React.Fragment>
            );
        }
    }

    showFirmwareUpdateProgress() {
        if (this.state.firmwareUploading === true) {
            return (
                <FirmwareUpdater 
                    firmwarePreselected={true} 
                    refreshFirmwareVersion={ () => {this.props.updateMachineStatus("refresh", "refresh")} } 
                    setSelectedTab={this.props.setSelectedTab} 
                    checkFirmwareUpdates={this.props.checkFirmwareUpdates} 
                />
            );
        }
    }

    render() {
        return (
            <React.Fragment>
                {this.showFirmwareUpdateProgress()}
                {this.showUploadFirmwareButton()}
                {this.show328pButton()}
                {this.show32M1Button()}
            </React.Fragment>
        );
    }
}

export default withStyles (styles)(ManualFirmwareUpload);