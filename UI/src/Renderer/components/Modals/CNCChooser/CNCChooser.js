import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import {ipcRenderer} from 'electron';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography} from '@material-ui/core';
import app from 'app';

const styles = theme => ({
    cancel: {
        marginTop: theme.spacing(-1),
        marginBottom: theme.spacing(1),
        color: app.button.cancel.color,
        backgroundColor: '#f6f6f6'
    },
    select: {
        marginTop: theme.spacing(-1),
        marginBottom: theme.spacing(1),
        color: app.button.save.color,
        backgroundColor: app.button.save.backgroundColor
    },
    cncList: {
        width: "100%",
    },
    switch: {
        // marginLeft: -2 * theme.spacing(1),
        color: 'black'
    }
});

function CNCChooser(props) {
    const { classes, disabled } = props;
    const [open, setOpen] = React.useState(false);
    const [availableCNCs, setAvailableCNCs] = React.useState(null);
    const [selectedCNC, setSelectedCNC] = React.useState(-1);

    function handleSelect(event) {
        if (selectedCNC >= 0) {
            ipcRenderer.send("CNC::ChooseCNC", availableCNCs[selectedCNC].path, availableCNCs[selectedCNC].serial_number);
        }

        setOpen(false);
    }

    function handleClickOpen(event) {

        ipcRenderer.once("CNC::GetAvailableCNCsResponse", (event, available) => {

            console.log(available);
            setAvailableCNCs(available);

            for (var i = 0; i < available.length; i++) {
                if (available[i].selected === true) {
                    setSelectedCNC(i);
                }
            }
    
            setOpen(true);
        });
        ipcRenderer.send("CNC::GetAvailableCNCs");
    }

    function handleClose(event) {
        setOpen(false);
    }

    function handleSelectCNC(event) {
        setSelectedCNC(event.target.selectedIndex);
    }

    function getCNCOptions() {
        if (availableCNCs != null) {
            const options = availableCNCs.map((cnc, index) => {
                return (<option key={index}>{cnc.path}</option>);
            });

            return options;
        }

        return null;
    }

    function getSwitchButton() {
        if (!disabled) {
            return (
                <Button color="secondary" onClick={handleClickOpen} className={classes.switch}>(<span style={{ textDecoration: 'underline' }}>Select</span>)</Button>
			);
		}

		return null;
	}

    return (
        <React.Fragment>
            {getSwitchButton()}

            <Dialog
                open={open}
                aria-labelledby="form-dialog-title"
                maxWidth="sm"
                fullWidth
                PaperProps={{style: {overflow:'hidden'}}}
            >
                <DialogTitle>
                    <center>
                        {app.chooser.title}
                    </center>
                </DialogTitle>
                <DialogContent>
                    <Typography>{app.chooser.select}</Typography>
                    <select size="5" onChange={handleSelectCNC} className={classes.cncList} value={selectedCNC}>
                        {getCNCOptions()}
                    </select>
                    <br />
                </DialogContent>
                <DialogActions>
                    <Grid container spacing={8} justify="center">
                        <Grid item xs={3}>
                            <Button
                                variant="contained"
                                className={classes.cancel}
                                onClick={handleClose}
                                fullWidth
                            >
                                CANCEL
                            </Button>
                        </Grid>
                        <Grid item xs={3}>
                            <Button
                                variant="contained"
                                className={classes.select}
                                onClick={handleSelect}
                                fullWidth
                            >
                                SELECT
                            </Button>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

CNCChooser.propTypes = {
    classes: PropTypes.object.isRequired,
	disabled: PropTypes.bool.isRequired
};

export default withStyles(styles)(CNCChooser);
