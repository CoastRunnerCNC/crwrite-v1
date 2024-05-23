import React, { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import {CircularProgress, Dialog, DialogContent, Typography} from '@material-ui/core';

const Throbber = (props) => {
    const {start} = props;

    const [pollingInterval, setPollingInterval] = React.useState();

    function handleWriteStatus(event, status) {
        props.setWritingStatus(status);
        if (status === false) {
            clearInterval(pollingInterval);
        }
    }

    function pollWriteStatus() {
        ipcRenderer.send("Jobs::GetWriteStatus");
    }

    function startPolling() {
        setPollingInterval(setInterval(pollWriteStatus, 1000));
    }

    useEffect(() => {
        if (start == true) {
            ipcRenderer.on("Jobs::HandleWriteStatus", handleWriteStatus);
            startPolling();
        }

        return (() => {
            clearInterval(pollingInterval);
            ipcRenderer.removeAllListeners("Jobs::HandleWriteStatus");
        });
    }, [start])

    return (
        <>
            <Dialog                
                open={start}
                aria-labelledby="form-dialog-title"
                maxWidth="xs"
                fullWidth
            >
                <DialogContent>
                    <Typography variant='h5'>Writing to Disk</Typography>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                            <CircularProgress />
                        </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default Throbber;