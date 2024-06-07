import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Menu from '../../components/Menu';
import {Button, Container, Grid, Tooltip, Typography} from "@material-ui/core";
import withStyles from '@material-ui/core/styles/withStyles';
import path from "path";
import {ipcRenderer, shell} from "electron";
import JobSelection from '../../components/Modals/JobSelection';
import {Redirect} from 'react-router-dom';
import SupportCenter from '../../components/Support/SupportCenter';
import Alert from '../../components/Modals/Alert';
import app from 'app';
import packageJSON from '../../../../package.json';
import ItemPanel from '../../components/ItemPanel/ItemPanel';
const crwrite = require("crwrite");

const styles = theme => ({
    main: {
        width: '80%',
        height: '45%',
        marginTop: 'auto',
        marginBottom: 'auto',
        marginLeft: 'auto',
        marginRight: 'auto',
        position: 'absolute',
        borderLeft: app.dashboard.border,
        borderRight: app.dashboard.border,
        borderBottom: app.dashboard.border,
    },
    dashboardStyle: {
        backgroundColor: "#F6F6F6",
        backgroundSize: 'cover',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        position: 'fixed',
        left: 0,
        top: 0,
        z: -1,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        verticalAlign: 'middle',
    },
    topLeft: {
        width: 'calc(40% - 60px)',
        height: '45%',
        marginTop: 'auto',
        marginBottom: 'auto',
        marginLeft: 'calc(-20% - 30px)',
        position: 'absolute',
        borderTop: app.dashboard.border,
    },
    topRight: {
        width: 'calc(40% - 60px)',
        height: '45%',
        marginTop: 'auto',
        marginBottom: 'auto',
        marginLeft: 'calc(20% + 30px)',
        position: 'absolute',
        borderTop: app.dashboard.border,
    },
    runButton: {
        '&:hover': {
            filter: 'brightness(0.65)'
        },
        lineHeight: '1.2',
    },
    runButtonDisabled: {
        '&:disabled': {
            opacity: 0.5
        },
        lineHeight: '1.2',
    },
    dashButton: {
        lineHeight: '1.2',
        '&:hover': {
            filter: 'brightness(0.65)'
        }
    },
    buttonText: {
        color: '#9B43A7',
        fontSize: '65px',
        fontWeight: 'bold',
        WebkitTextStroke: '2px black',
        paddingBottom: '0'
    },
    buttonSubtext: {
        color: '#34B5B6',
        fontSize: '30px',
        fontWeight: 'bold',
        WebkitTextStroke: '2px black'
    },
    standardButton: {
        borderColor: 'black', // changing the border color
        borderWidth: '2px', // setting border width
        borderStyle: 'solid', // setting border style
        boxShadow: "-1px 1px 0px 0px #4A4A4A", // setting shadow
        fontFamily: '"Public Sans", sans-serif', // specifying "public sans" font with a fallback to generic sans-serif
        fontWeight: 'bold', // making the text bold
        fontSize: '35px',
        padding: '0px 25px',
        backgroundColor: 'white', // setting the background color
        '&:hover': { // styles for hover state
            backgroundColor: '#D6CDC2', // changing the background color on hover
        }
    },
    smallGreyButton: {
        borderColor: 'black', // changing the border color
        borderWidth: '2px', // setting border width
        borderStyle: 'solid', // setting border style
        boxShadow: "-1px 1px 0px 0px #4A4A4A", // setting shadow
        fontFamily: '"Public Sans", sans-serif', // specifying "public sans" font with a fallback to generic sans-serif
        fontWeight: 'bold', // making the text bold
        fontSize: '20px',
        padding: '5px 15px',
        backgroundColor: 'white', // setting the background color
        '&:hover': { // styles for hover state
            backgroundColor: '#F0F0F0', // changing the background color on hover
        },
        width: '240px'
    }
});

function Dashboard(props) {
    const { classes, status, settings } = props;
    const [availableJobs, setAvailableJobs] = React.useState(new Array());
    const [showJobSelection, setShowJobSelection] = React.useState(false);
    const [navigateToMilling, setNavigateToMilling] = React.useState(false);
    const [openCustomerSupport, setOpenCustomerSupport] = React.useState(false);
    const [alertMessage, setAlertMessage] = React.useState("");
    const [showNewFileAlert, setShowNewFileAlert] = React.useState(false);
    const [enableEditButton, setEnableEditButton] = React.useState(false);

    ipcRenderer.send('Logs::LogString', 'CRWrite Version: ' + packageJSON.version);

    ipcRenderer.removeAllListeners("CRFileDoubleClick");
    ipcRenderer.on("CRFileDoubleClick", (event, path) => {
        ipcRenderer.send('Logs::LogString', "command line:");
        ipcRenderer.send('Logs::LogString', path.cl);
        ipcRenderer.send('Logs::LogString', "working directory:");
        ipcRenderer.send('Logs::LogString', path.wd);

        ipcRenderer.removeAllListeners("Jobs::JobSelected");
        ipcRenderer.on("Jobs::JobSelected", (event) => {
            setNavigateToMilling(true);
        });
        
        ipcRenderer.send('File::DoubleClickSetFilePath', path);
        ipcRenderer.once('Jobs::ResponseGetJobsFromPath', (event, jobs) => {
            if (typeof jobs !== "string") {
                setAvailableJobs(jobs);
                setShowJobSelection(true);
            }
            else {
                setAlertMessage("File error: " + jobs);  // Jobs is an error string instead
            }
        });
        ipcRenderer.send('Jobs::GetJobsFromPath', path);

    });

    const CoastRunnerImage = () => {
        return (
                <img style={{
                        border: '2px solid black',
                        borderRadius: '4px',
                        boxShadow: "-3px 3px 0px 0px #4A4A4A",
                        width: '100%',
                        }}
                        src='./static/img/CoastRunner.svg' 
                        />
        );
    }

    function showFilePicker() {
        ipcRenderer.removeAllListeners("Jobs::JobSelected");
        ipcRenderer.on("Jobs::JobSelected", (event) => {
            setNavigateToMilling(true);
        });

        ipcRenderer.removeAllListeners("ShowJobSelection");
        ipcRenderer.on("ShowJobSelection", (event, jobs) => {
            setAvailableJobs(jobs);
            setShowJobSelection(true);
        });

        ipcRenderer.removeAllListeners("InvalidCRFile");
        ipcRenderer.on("InvalidCRFile", (event, filename, error) => {
            setAlertMessage("CR file error: " + error);
        });

        ipcRenderer.send('File::OpenFileDialog');
    }

    function onClickRun() {
        if (status === 2 || enableEditButton) {
            if (enableEditButton) {
                setShowNewFileAlert(true);
            } else {
                showFilePicker();
            }
        }
    }

    function onCloseJobSelection(event) {
        setShowJobSelection(false);
    }

    function onClickHelp() {
        setOpenCustomerSupport(true);
    }

    function getRunButton() {
        if (status == 2) {
            return (
                <Button className={classes.runButton} style={{ backgroundColor: "transparent" }} onClick={onClickRun} disabled={status != 2}>
                    <div 
                        id="run-code" 
                        style={{ marginTop: '20px', marginRight: '30px', height: '14vh' }}
                    >
                        <div className={classes.buttonText}>RUN</div>
                        <div className={classes.buttonSubtext}>RUN GCODE</div>
                    </div>
                </Button>
            );
        } else {
            return (
                <Tooltip
                    disableFocusListener={true}
                    disableTouchListener={true}
                    title={app.dashboard.run.tooltip}
                >
                    <span>
                        <Button className={classes.runButtonDisabled} style={{ backgroundColor: "transparent" }} onClick={onClickRun} disabled={status != 2}>
                            <div 
                                id="run-code" 
                                style={{ marginTop: '20px', marginRight: '30px', height: '14vh' }}
                            >
                                <div className={classes.buttonText}>RUN</div>
                                <div className={classes.buttonSubtext}>RUN GCODE</div>
                            </div>
                        </Button>
                    </span>
                </Tooltip>
            );
        }
    }

    function getIcon() {
        if (app.dashboard.logo != "none") {
            return (
                <img src={path.join(__dirname, app.dashboard.logo)} width="88px" style={{ marginTop: "-44px" }} />
            );
        }
    }

    function refreshJobs() {
        ipcRenderer.once('File::ResponseGetExistingJobs', (event, jobs) => {
            console.log("refreshJobs - jobs: " + JSON.stringify(jobs));
            setAvailableJobs(jobs);
        });
        ipcRenderer.send("File::GetExistingJobs");

    }

    function handleNewFileYes() {
        ipcRenderer.removeAllListeners("Jobs::JobSelected");
        ipcRenderer.on("Jobs::JobSelected", (event) => {
            setNavigateToMilling(true);
        });

        ipcRenderer.removeAllListeners("ShowJobSelection");
        ipcRenderer.on("ShowJobSelection", (event, jobs) => {
            setAvailableJobs(jobs);
            setShowJobSelection(true);
        });
        ipcRenderer.once('File::ResponsePickNewCRFileDirectory', (event, filepath) => {
            console.log("filepath: " + JSON.stringify(filepath));
            setShowNewFileAlert(false);
        });
        ipcRenderer.send('File::PickNewCRFileDirectory')
    }

    function handleNewFileNo() {
        setShowNewFileAlert(false);
        showFilePicker();
    }

    function getEnableEditButtonValue() {
        if (settings) {
            return settings.enableEditButton;
        } else {
            return false;
        }
    }

    function handleManualOpenClick() {
        props.toggleShuttle();
    }

    setTimeout(function() {
        ipcRenderer.once('ResponseGetPassedInFilePath', (event, filePath) => {
            if (filePath != null) {
                ipcRenderer.send('File::DoubleClickSetFilePath', filePath);
            }
        });
        ipcRenderer.once('ResponseGetPassedInJobs', (event, jobs) => {
            if (jobs != null) {
                ipcRenderer.removeAllListeners("Jobs::JobSelected");
                ipcRenderer.on("Jobs::JobSelected", (event) => {
                    setNavigateToMilling(true);
                });
                setAvailableJobs(jobs);
                setShowJobSelection(true);
            }
        });
        ipcRenderer.send("GetPassedInFilePath");
        ipcRenderer.send('GetPassedInJobs');
    },
    500);

    useEffect(() => {
        if (settings) {
            setEnableEditButton(settings.enableEditButton);
        }
    }, [settings && settings.enableEditButton]);

    if (navigateToMilling) {
        ipcRenderer.removeAllListeners("CRFileDoubleClick");
        return (<Redirect to='/milling' />);
    }

    return (
        <section className={classes.dashboardStyle}>
			<Alert open={alertMessage.length > 0} message={alertMessage} onOk={(event) => { setAlertMessage("") }} onCancel={(e) => { setAlertMessage("")}} />
            <Alert open={showNewFileAlert} message="Would you like to create a new file?" yesNo={true} onOk={handleNewFileYes} onCancel={handleNewFileNo} />
            <Menu />
            <JobSelection open={showJobSelection} onClose={onCloseJobSelection} jobs={availableJobs} status={status} refreshJobs={refreshJobs} enableEditButton={enableEditButton} />


                <Grid container
                    justify="space-evenly"
                    spacing={6}
                    style={{ height: '100%', padding: "38px" }}
                >
                    <Grid item xs={4}>
                        <Grid container direction='column' spacing={4}  style={{ flexWrap: 'inherit' }}>
                            <Grid item>
                                <CoastRunnerImage />
                            </Grid>
                            <Grid item>
                                <ItemPanel title="Quick Actions" color="secondary">
                                    <Grid container direction='column' justify='space-evenly' alignItems='center' style={{height: '200px'}}>
                                        <Grid item>
                                            <Button classes={{root: classes.smallGreyButton}}>Open Last Job</Button>
                                        </Grid>
                                        <Grid item>
                                            <Button classes={{root: classes.smallGreyButton}}>Set Home Position</Button>
                                        </Grid>
                                        <Grid item>
                                            <Button classes={{root: classes.smallGreyButton}}>Auto Level</Button>
                                        </Grid>
                                    </Grid>
                                </ItemPanel>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={8}>
                        <Grid container direction='column' spacing={4}>
                            <Grid item>
                                <ItemPanel title="Guided Mode">
                                    <Grid container alignItems="center" justify="space-evenly" style={{height: '120px', width: '100%'}}>
                                        <Grid item>
                                            <Button onClick={onClickRun} classes={{root: classes.standardButton}}>Open</Button>
                                        </Grid>
                                        <Grid item>
                                            <Button onClick={() => { shell.openExternal(app.dashboard.store.url) }}classes={{root: classes.standardButton}}>Store</Button>
                                        </Grid>
                                        <Grid item>
                                            <Button classes={{root: classes.standardButton}}>Help</Button>
                                        </Grid>
                                    </Grid>
                                </ItemPanel>
                            </Grid>
                            <Grid item>
                                <ItemPanel title="Manual Mode">
                                    <Grid container alignItems='center' style={{height: '120px', width: '100%'}}>
                                        <Grid item>
                                            <Button style={{marginLeft: '100px'}} onClick={handleManualOpenClick} classes={{root: classes.standardButton}}>Open</Button>
                                        </Grid>
                                        <Grid item>
                                            <Button style={{marginLeft: '100px'}} classes={{root: classes.standardButton}}>File Editor</Button>
                                        </Grid>
                                    </Grid>
                                </ItemPanel>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

            <SupportCenter open={openCustomerSupport} onClose={() => { setOpenCustomerSupport(false) }} />

        </section>
        // <Grid container>
        //     <Grid item xs={6}>
        //         <Grid container direction="column" style={{border: '1px solid red'}}>
        //             <Grid item style={{border: '1px solid blue'}}>
        //                 <CoastRunnerImage />
        //             </Grid>
        //             <Grid item style={{border: '1px solid green'}}>
        //                 <Typography variant='h1'>TEST</Typography>
        //             </Grid>
        //         </Grid>
        //     </Grid>
        //     <Grid item xs={6}>
        //         <Typography variant='h1'>Test Header</Typography>
        //     </Grid> 
        // </Grid>
    );
}

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired,
    status: PropTypes.number.isRequired
};

export default withStyles(styles)(Dashboard);
