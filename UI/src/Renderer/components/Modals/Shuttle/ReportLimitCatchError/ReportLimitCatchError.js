import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import {ipcRenderer} from 'electron';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    Grid,
    Typography
} from '@material-ui/core';
import Input from "@material-ui/core/Input";
import CircularProgress from "@material-ui/core/CircularProgress";
import Backdrop from "@material-ui/core/Backdrop";

const styles = theme => ({
    cancel: {
        marginTop: theme.spacing(-1),
        marginBottom: theme.spacing(1),
        marginRight: '4px'
    },
    send: {
        marginTop: theme.spacing(-1),
        marginBottom: theme.spacing(1),
        marginLeft: '4px'
    },
    emailText: {
        width: '100%',
        height: 30,
        marginTop: 0,
        backgroundColor: '#555555'
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    }
});

function ReportLimitCatchError(props) {
    const {classes, open, onClose, onSend, inputValue} = props;
    const [submitted, setSubmitted] = React.useState(false);
    const [errors, setErrors] = React.useState(new Array());
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [sending, setSending] = React.useState(false);

    function handleClose(event) {
        setSubmitted(false);
        setErrors(new Array());
        setName("");
        setEmail("");
        setSending(false);
        onClose(event);
    }

    function handleSend(event) {
        setSending(true);
        let tempDescription = "User reported a soft limit error was received inappropriately. Please forward to development team to investigate.\n\nCatch limit error input: " + inputValue;
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
        ipcRenderer.send("Support::SendRequest", name, email, tempDescription, true);
        onSend();
    }

    return (
        open ? (
        <Dialog open={open}>
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
                    <Typography>Was this popup displayed incorrectly?</Typography>
                    <br />
                    <Typography>Please fill out this form to submit a report to Coast Runner tech support letting us know about the error. This will also disable the soft limit popup on your machine. You can re-enable this popup at any time in the Settings menu.</Typography>
                    <br />
                    <br />
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
                    <br/>
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
                                SUBMIT AND DISABLE
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
        </Dialog>
        ) 
        : 
        ""
    );
}

ReportLimitCatchError.propTypes = {
    classes: PropTypes.object.isRequired,
    onClose: PropTypes.func,
};

export default withStyles(styles)(ReportLimitCatchError);