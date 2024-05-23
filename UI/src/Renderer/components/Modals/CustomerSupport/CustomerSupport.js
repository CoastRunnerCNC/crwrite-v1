import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import {ipcRenderer} from 'electron';
import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    Grid,
    TextField,
    Typography
} from '@material-ui/core';
import Input from "@material-ui/core/Input";
import CircularProgress from "@material-ui/core/CircularProgress";
import Backdrop from "@material-ui/core/Backdrop";
import app from 'app';

const styles = theme => ({
    cancel: {
        marginTop: theme.spacing(-1),
        marginBottom: theme.spacing(1),
        marginRight: '4px',
        backgroundColor: app.button.cancel.backgroundColor,
        color: app.button.cancel.color
    },
    send: {
        marginTop: theme.spacing(-1),
        marginBottom: theme.spacing(1),
        marginLeft: '4px',
        backgroundColor: app.button.save.backgroundColor,
        color: app.button.save.color
    },
    emailText: {
        width: '100%',
        height: 30,
        marginTop: 0,
        backgroundColor: app.colors.form,
        border: app.formControl.border
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    },
    textField: {

    }
});

function CustomerSupport(props) {
    const {classes, open, onClose} = props;
    const [submitted, setSubmitted] = React.useState(false);
    const [errors, setErrors] = React.useState(new Array());
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [includeLogs, setIncludeLogs] = React.useState(false);
    const [sending, setSending] = React.useState(false);
    const [engravingError, setEngravingError] = React.useState(false);

    function handleClose(event) {
        setSubmitted(false);
        setErrors(new Array());
        setName("");
        setEmail("");
        setDescription("");
        setIncludeLogs(false);
        setSending(false);
        onClose(event);
    }

    function handleSend(event) {
        setSending(true);
        let tempDescription = description;
        if (engravingError) {
            tempDescription = "REGARDING ENGRAVING ERROR: " + description;
        }
        ipcRenderer.once('Support::SendRequestResponse', (event, error) => {
            setSending(false);

            if (!error) {
                setSubmitted(true);
            } else {
                let errorsArray = [];

                if (error.hasOwnProperty("details")) {
                    errorsArray.push(error.details);
                }

                else if (error.hasOwnProperty("name")) {
                    errorsArray.push("NAME: " + error.name);
                }

                else if (error.hasOwnProperty("email")) {
                    errorsArray.push("EMAIL: " + error.email);
                }

                else if (error.hasOwnProperty("description")) {
                    errorsArray.push("DESCRIPTION: " + error.description);
                }

                else if (errorsArray.length === 0) {
                    errorsArray.push("Unable to send. Server may be down.");
                }

                setErrors(errorsArray);
            }
        });
        ipcRenderer.send("Support::SendRequest", name, email, tempDescription, includeLogs);
    }

    return (
        <React.Fragment>
            <>
                <DialogContent style={{overflowX: 'hidden'}}>

                    {
                        errors.map((error, index) => {
                            return (
                                <Typography variant="body1" color="error">{error}</Typography>
                            );
                        })
                    }

                    <br/>
                    <Grid container spacing={0} justify="center">
                        <Grid item xs={3}>
                            <Typography variant="body1" display="inline" style={{lineHeight: '30px'}}>Your
                                name:</Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <Input
                                margin="dense"
                                variant="filled"
                                disableUnderline
                                className={classes.emailText}
                                onChange={e => setName(e.currentTarget.value)}
                            />
                        </Grid>
                    </Grid>
                    <br/>
                    <Grid container spacing={0} justify="center">
                        <Grid item xs={3}>
                            <Typography variant="body1" display="inline" style={{lineHeight: '30px'}}>Your e-mail
                                address:</Typography>
                        </Grid>
                        <Grid item xs={9}>
                            <Input
                                margin="dense"
                                variant="filled"
                                disableUnderline
                                className={classes.emailText}
                                onChange={e => setEmail(e.currentTarget.value)}
                            />
                        </Grid>
                    </Grid>
                    <TextField
                        className={classes.textField}
                        margin="dense"
                        variant="outlined"
                        placeholder="Please enter a description of your problem."
                        rows={4}
                        fullWidth
                        multiline={true}
                        onChange={e => setDescription(e.currentTarget.value)}
                    />

                    <br/>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={includeLogs}
                                onChange={e => {
                                    setIncludeLogs(e.currentTarget.checked)
                                }}
                            />
                        }
                        label="Include logs and data that might help us solve your problem."
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={engravingError}
                                onChange={e => {
                                    setEngravingError(e.currentTarget.checked)
                                }}
                            />
                        }
                        label="Check if issue is related to engraving."
                    />
                    <br/>
                    <Backdrop className={classes.backdrop} open={sending}>
                        <CircularProgress color="inherit"/>
                    </Backdrop>
                </DialogContent>
                <DialogActions>
                    <Grid container spacing={2} justify="center">
                        <Grid item xs={6}>
                            <Button
                                variant="contained"
                                className={classes.cancel}
                                onClick={handleClose}
                                fullWidth
                            >
                                CANCEL
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                variant="contained"
                                className={classes.send}
                                color="secondary"
                                onClick={handleSend}
                                fullWidth
                            >
                                SEND REPORT
                            </Button>
                        </Grid>
                    </Grid>
                </DialogActions>
            </>

            <Dialog
                open={submitted}
                onClose={handleClose}
                aria-describedby="alert-dialog-description"
            >
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Your support request was sent successfully.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <center>
                        <Button onClick={handleClose} color="secondary" autoFocus>
                            OK
                        </Button>
                    </center>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

CustomerSupport.propTypes = {
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
};

export default withStyles(styles)(CustomerSupport);