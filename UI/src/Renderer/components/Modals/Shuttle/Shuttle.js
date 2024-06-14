import React from 'react';
import PropTypes from 'prop-types';
import path from 'path';
import withStyles from '@material-ui/core/styles/withStyles';
import {Button, Dialog, DialogContent, Fab, DialogTitle, Grid, IconButton, Tab, Tabs, Tooltip} from '@material-ui/core';
import Operations from './Operations.js';
import ShuttleSettings from './ShuttleSettings.js';
import Alert from '../Alert'
import {ipcRenderer} from 'electron';
import app from 'app';

const styles = theme => ({
    close: {
        marginTop: theme.spacing(-1),
        marginBottom: theme.spacing(1)
    },
    shuttleButton: {
        height: '34px',
        width: '34px',
        marginRight: '5px',
        backgroundColor: app.shuttleButton.backgroundColor,
        "&:hover": {
            backgroundColor: app.shuttleButton.hoverColor
        }
    }
});

class Shuttle extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            realTimeStatus: null,
            manualEntry: "",
            step: 0,
            selectedTab: 0,
            milling: false,
            showResetAlert: false,
        };

        this.showDialog = this.showDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.setMilling = this.setMilling.bind(this);
        this.getBindingsTab = this.getBindingsTab.bind(this);
    }

    getBindingsTab() {
      return (<Tab label="Key Bindings" disabled={ false } />);
    }

    showDialog() {
        this.setState({
            open: true,
            selectedTab: 0
        });
        this.props.setOperationsWindowOpen();
    }

    closeDialog() {
        if (this.state.milling) {
            this.setState({ showResetAlert: true });
        } else {
            this.setState({
                open: false
            });
            this.props.closeOperationsWindow();
        }
    }

    setMilling(status) {
        this.setState({ milling: status });
    }

    componentDidUpdate(prevProps) {
        if ((this.props.firmware !== prevProps.firmware) && this.props.firmware) {
        }
    }

    render() {
        function displaySelected(component) {
            if (component.state.selectedTab == 0) {
                return 
            } else {
                return <ShuttleSettings closeDialog={component.closeDialog} />
            }
        }

        function getTooltip(component) {
            if (component.props.milling) {
                return 'Disabled while machine is running';
            }

            return "";
        }


        if (this.props.status != 2 || this.props.firmware == null || this.props.firmware.grbl == null) {
            if (this.state.open) {
                setTimeout(this.closeDialog, 0);
            }

            return "";
        }

        const tooltip = getTooltip(this);
        const disabled = tooltip.length > 0;

        return (
            <React.Fragment>

                <Alert
                    open={this.state.showResetAlert}
                    message={"Your machine is currently executing gcode. Closing this window will reset your machine.\n\nAre you sure you want to close this window?"}
                    yesNo={true}
                    onOk={(event) => {
                        ipcRenderer.send("CNC::ExecuteCommand", '|');
                        this.setState({ showResetAlert: false, open: false });
                        this.props.closeOperationsWindow();
                        }
                    }
                    onCancel={(event) => { this.setState({ showResetAlert: false }) }}
                    title={"Reset Machine?"}
                />

                <Tooltip
                    disableHoverListener={!disabled}
                    disableFocusListener={true}
                    disableTouchListener={true}
                    title={tooltip}
                >
                    <span>
                        <Button className={this.props.classes.shuttleButton} onClick={this.props.toggleShuttle} disabled={disabled} style={{border: '1px solid black', backgroundColor: '#f6f6f6', borderRadius: '0px', boxShadow: "1px 1px 0px 0px #000000"}}>
                            <img src={path.join(__dirname, app.image.joystick)} style={{ width: '20px', height: '20x' }} />
                        </Button>
                    </span>
                </Tooltip>

                <Dialog
                    open={this.props.openShuttle}
                    aria-labelledby="form-dialog-title"
                    PaperProps={{ style: {height: '100%', maxWidth: '1600px', backgroundColor: '#f6f6f6'}}}
                    maxWidth="xl"
                    fullWidth
                >
                    <DialogTitle style={{padding: '0px'}}>
                        <Grid container>
                            <Grid item xs={1} />
                            <Grid item xs={10}>
                            </Grid>
                            <Grid item xs={1}>
                                <Button onClick={this.props.toggleShuttle}>X</Button>
                            </Grid>
                        </Grid>
                    </DialogTitle>
                    <DialogContent className={'no-scroll'} style={{overflow: 'auto'}}>
                        <Operations closeDialog={this.closeDialog} firmware={this.props.firmware} open={this.state.open} milling={this.state.milling} setMilling={this.setMilling} feedRate={this.props.feedRate} updateFeedRate={this.props.updateFeedRate} />
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        );
    }
}

Shuttle.propTypes = {
    milling: PropTypes.bool.isRequired,
    status: PropTypes.number.isRequired,
    firmware: PropTypes.object
};

export default withStyles(styles)(Shuttle);
