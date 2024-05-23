import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import SaveIcon from '@material-ui/icons/Save';
import app from 'app';
import {ipcRenderer} from 'electron';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography} from '@material-ui/core';
import AddJob from '../AddJob/AddJob';
import Throbber from '../Throbber/Throbber';

const styles = theme => ({
    cancel: {
        marginTop: theme.spacing(-1),
        marginBottom: theme.spacing(1)
    },
    select: {
        marginTop: theme.spacing(-1),
        marginBottom: theme.spacing(1)
    },
    jobList: {
        width: "100%"
    },
    addJob: {
        color: app.colors.secondary,
        cursor: 'pointer'
    },
    jobText: {
        width: "calc(100% - 6px)"
    },
});

function JobSelection(props) {
    const { classes, open, onClose, jobs, status, refreshJobs, enableEditButton } = props;
    const [selectedJob, setSelectedJob] = React.useState(0);
    const [extraContentExtracted, setExtraContentExtracted] = useState(false);
    const [hasMore, setHasMore] = React.useState(false);
    const [addJobOpen, setAddJobOpen] = React.useState(false);
    const [writingStatus, setWritingStatus] = React.useState(false);


    useEffect(() => {
        ipcRenderer.removeAllListeners("MacOpenDoubleClickTest");
        ipcRenderer.on("MacOpenDoubleClickTest", (event, path) => {
            ipcRenderer.send('Logs::LogString', path);
        });
      }, []);

    useEffect(() => {
        // ipcRenderer.removeAllListeners("CRFileDoubleClick");
        // ipcRenderer.sendSync('Logs::LogString', "~~~ Test ~~~");
        setHasMore(ipcRenderer.sendSync('File::HasAdditionalContent'));
      }, [props.jobs]);

    function handleSelect(event) {
        ipcRenderer.send("Jobs::SelectJob", selectedJob);
        ipcRenderer.send("Jobs::SetJobName", jobs[selectedJob].title);
        onClose(event, true);
    }

    function handleAdditionalFiles(event) {
        ipcRenderer.once('File::ResponseExtractAdditionalContent', (event, content) => {
            setExtraContentExtracted(content);            
        });
        ipcRenderer.send("File::ExtractAdditionalContent");
    }

    function handleClose(event) {
        onClose(event, false);
    }

    function handleSelectJob(event) {
        setSelectedJob(event.target.selectedIndex);
    }

    function getJobText() {
        if (selectedJob >= 0 && jobs.length > selectedJob) {
            return jobs[selectedJob].prompt;
        }

        return "";
    }

    function onClickAddJob() {
        setAddJobOpen(true);        
    }

    function openAddJob() {
        if (status == 2 && addJobOpen) {
            return true;
        } else {
            return false;
        }
    }

    function getAddNewJob() {
        if (enableEditButton) {
            return (
                <span className={classes.addJob} onClick={onClickAddJob}>ADD NEW JOB</span>
            );
        }
    }

    function startPolling() {
        setWritingStatus(true);
        ipcRenderer.removeAllListeners("Jobs::WriteEditsSuccessful");
        ipcRenderer.once("Jobs::WriteEditsSuccessful", () => {
            refreshJobs();
        });
    }

    return (
        <>
            <Throbber start={writingStatus} setWritingStatus={setWritingStatus} />
            <AddJob open={openAddJob} jobsCount={jobs.length} refreshJobs={refreshJobs} onClose={setAddJobOpen} startPolling={startPolling} />
            <Dialog
                open={open}
                aria-labelledby="form-dialog-title"
                maxWidth="sm"
                PaperProps={{style: {overflow:'hidden'}}}
                fullWidth
            >
                <DialogTitle>
                    <center>
                        Job Selection
                    </center>
                </DialogTitle>
                <DialogContent>
                    <Typography>Select job to continue.</Typography>
                    <select size="5" onChange={handleSelectJob} className={classes.jobList}>
                        {
                            jobs.map((job, index) => {
                                if (index == 0) {
                                    return (<option key={index} selected>{job.title}</option>);
                                } else {
                                    return (<option key={index}>{job.title}</option>);
                                }
                            })
                        }
                    </select>
                    <br />
                    <br />
                    <div> 
                        {getAddNewJob()}
                    </div>
                    <br />
                    <textarea type="text" disabled={true} rows="6" cols="78" value={getJobText()} className={classes.jobText} />
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
                        <Grid item xs={5}>
                            {extraContentExtracted ?
                            (<>SAVE SUCCESSFUL</>) :
                            (<Button
                                variant="contained"
                                className={classes.select}
                                color="secondary"
                                onClick={handleAdditionalFiles}
                                disabled={ !hasMore || extraContentExtracted }
                                startIcon={<SaveIcon />}
                                fullWidth
                            >
                                EXTRA FILES
                            </Button>)
                            }
                        </Grid>
                        <Grid item xs={3}>
                            <Button
                                variant="contained"
                                className={classes.select}
                                color="secondary"
                                onClick={handleSelect}
                                disabled={status != 2 && !enableEditButton}
                                fullWidth
                            >
                                SELECT
                            </Button>
                        </Grid>
                    </Grid>
                </DialogActions>
            </Dialog>
        </>
    );
}

JobSelection.propTypes = {
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    jobs: PropTypes.array.isRequired,
    status: PropTypes.number.isRequired
};

export default withStyles(styles)(JobSelection);
