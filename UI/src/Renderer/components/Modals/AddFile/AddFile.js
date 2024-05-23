import React, { useState, useEffect } from 'react';
import { Button, Grid, Input, Typography, withStyles, Dialog, DialogTitle, DialogContent, DialogActions } from "@material-ui/core";
import {ipcRenderer} from 'electron';

const styles = theme => ({
    input: {
        backgroundColor: 'white',
        color: 'black'
    }
});


function AddFile(props) {
    const {open, classes, jobsCount, onClose, refreshJobs} = props;
    const [nameValue, setNameValue] = useState("");
    const [descriptionValue, setDescriptionValue] = useState("");

    function handleChangeName(event) {
        setNameValue(event.target.value);
    }

    function handleChangeDescription(event) {
        setDescriptionValue(event.target.value);
    }

    function handleSave() {
        ipcRenderer.removeAllListeners("File::AddNewFile");
        ipcRenderer.once("File::AddNewJobSuccessful", () => {
            // console.log("AddNewJobSuccessful fired!");
            onClose(false);
            refreshJobs();
        });

        ipcRenderer.send("Jobs::AddNewJob", nameValue, descriptionValue, jobsCount);
    }

    function handleClose() {
        onClose(false);
    }

    return (
        <Dialog
            open={open()}
            aria-labelledby="form-dialog-title"
            maxWidth="sm"
            PaperProps={{style: {overflow:'hidden'}}}
            fullWidth
        >
            <DialogTitle>
                <center>
                    Add New Job
                </center>
            </DialogTitle>
            <DialogContent>
                <Typography>Job Name</Typography>
                <Input fullWidth className={classes.input} value={nameValue} onChange={handleChangeName} multiline={false} rows={1} />
                <br />
                <Typography>Job Description</Typography>
                <Input fullWidth className={classes.input} value={descriptionValue} onChange={handleChangeDescription} multiline={true} rows={5} />
                <br />
            </DialogContent>
            <DialogActions>
                <Grid container spacing={6} justify="center">
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
                            className={classes.save}
                            color="secondary"
                            onClick={handleSave}
                            fullWidth
                        >
                            SAVE
                        </Button>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    );
}

export default withStyles(styles)(AddFile);