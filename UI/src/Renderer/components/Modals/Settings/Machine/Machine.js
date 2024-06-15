import React from "react";
import PropTypes from "prop-types";
import {Button, Grid, Tooltip} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import {ipcRenderer} from "electron";

const styles = theme => ({
    button: {
        '&:disabled': {
            opacity: 0.5,
            backgroundColor: '#f6f6f6'
        },
        backgroundColor: '#f6f6f6'
    }
})

function Machine(props) {
    const { classes, firmware } = props;

    return (
        <React.Fragment>
            {/* Version */}
            <Grid container spacing={1}>
                <Grid item xs={1} />
                <Grid item xs={9}>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        disabled={firmware == null}
                        className={classes.button}
                        onClick={() => {
                            ipcRenderer.send('CNC::ExecuteCommand', '$X');
                            ipcRenderer.send('CNC::ExecuteCommand', '$L');
                            ipcRenderer.send('CNC::ExecuteCommand', '$HX');
                        }}
                        fullWidth
                    >
                        Auto-Level X Axis
                    </Button>
                </Grid>
                <Grid item xs={1}>
                    <Tooltip
                        disableFocusListener={true}
                        disableTouchListener={true}
                        title="Automatically level the X axis, using factory calibration data. If you've replaced the X limit switches or adjusted the X tabs, then your machine must be recalibrated for this feature to work correctly (see manual)."
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                        >
                            ?
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item xs={1} />

                <Grid item xs={1} />
                <Grid item xs={9}>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        disabled={firmware == null}
                        className={classes.button}
                        onClick={() => {
                            ipcRenderer.send('CNC::ExecuteCommand', '$X');
                            ipcRenderer.send('CNC::ExecuteCommand', '$RST=#');
                        }}
                        fullWidth
                    >
                        Clear Machine Work Offsets
                    </Button>
                </Grid>
                <Grid item xs={1}>
                    <Tooltip
                        disableFocusListener={true}
                        disableTouchListener={true}
                        title={
                            <p style={{display: 'inline-block'}}>Zero all G54-G59 work coordinate offsets and G28/G30 positions stored in EEPROM.<br/> Note: Pushing this button should cause CRWrite to send "$RST=#" to grbl</p>
                        }
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                        >
                            ?
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item xs={1} />

                <Grid item xs={1} />
                <Grid item xs={9}>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        disabled={firmware == null}
                        className={classes.button}
                        onClick={() => {
                            ipcRenderer.send('CNC::ExecuteCommand', '$X');
                            ipcRenderer.send('CNC::ExecuteCommand', '$RST=*');
                        }}
                        fullWidth
                    >
                        Restore Machine Defaults
                    </Button>
                </Grid>
                <Grid item xs={1}>
                    <Tooltip
                        disableFocusListener={true}
                        disableTouchListener={true}
                        title={
                            <p style={{display: 'inline-block'}}>Restore all machine settings to default values. Specifically, this resets all values returned by "$$".<br/> Note: Pushing this button should cause CRWrite to send "$RST=$" to grbl</p>
                        }
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                        >
                            ?
                        </Button>
                    </Tooltip>
                </Grid>
                <Grid item xs={1} />
            </Grid>
            <br /><br />
        </React.Fragment>
    );
}

Machine.propTypes = {
    classes: PropTypes.object.isRequired,
    disabled: PropTypes.bool.isRequired,
    firmware: PropTypes.object
};

export default withStyles(styles)(Machine);
