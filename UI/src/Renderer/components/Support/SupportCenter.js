import React from "react";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core/styles";
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
    Tab,
    Tabs,
    Typography
} from '@material-ui/core';
import app from 'app';
import CustomerSupport from '../Modals/CustomerSupport';

const styles = theme => ({
    settingsButton: {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        backgroundColor: "transparent",
        '&:disabled': {
            opacity: 0.5
        }
    },
    settingsCog: {
        width: '25px',
        height: '25px',
        marginRight: theme.spacing(1),
        padding: 0,
        marginTop: 0
    },
    settingsText: {
        width: '62px',
        height: '28px',
        objectFit: 'contain',
        padding: 0,
        margin: 0
    },
    timeoutText: {
        width: 100,
        height: 30,
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        marginTop: theme.spacing(1),
        color: '#ffffff'
    },
    cancel: {
        marginRight: theme.spacing(1),
        backgroundColor: app.button.cancel.backgroundColor,
        color: app.button.cancel.color
    },
    save: {
        marginLeft: theme.spacing(1),
        backgroundColor: app.button.save.backgroundColor,
        color: app.button.save.color
    },
    radio: {
        marginLeft: theme.spacing(1),
        marginTop: 0,
        marginBottom: 0
    },
    radioGroup: {
        width: "100%",
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderColor: app.modal.color,
        borderWidth: "2px",
        borderRadius: "2px"
    },
    feedRatePercentage: {
        marginLeft: theme.spacing(1),
        padding: theme.spacing(1),
        backgroundColor: "transparent",
        color: app.modal.color
    }
});

function SupportCenter(props) {
    const {classes, open, onClose} = props;
    // const [open, setOpen] = React.useState(false);
    const [selectedTab, setSelectedTab] = React.useState(0);
    const [settings, setSettings] = React.useState(null);

    function SupportCenterTabs() {
        return (
            <Tabs
                value={selectedTab}
                onChange={(e, value) => { setSelectedTab(value); }}
                indicatorColor="secondary"
                textColor="primary"
                centered
            >
                <Tab label="E-mail" />
                <Tab label="Phone" />
            </Tabs>
        );
    }

    function displaySelectedWindow() {
        if (open === true) {
            if (selectedTab === 0) {
                return <CustomerSupport open={selectedTab===0} onClose={(ignored)=>{onClose();}} />;
            } else if (selectedTab === 1) {
                return (<></>);
            } else {
                return (<></>);
            }
        }

        return "";
    }

    return (
        <React.Fragment>

            <Dialog
                open={open}
                onClose={onClose}
                aria-labelledby="form-dialog-title"
                maxWidth="sm"
                PaperProps={{
                    className: classes.paper
                }}
            >
                <DialogTitle id="form-dialog-title">
                    <Grid container>
                        <Grid item xs={1} />
                        <Grid item xs={10}>
                            <center>
                                Contact Us
                            </center>
                        </Grid>
                        <Grid item xs={1}>
                            <Button onClick={onClose}>X</Button>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <div>
                        <section id="dialog-content-section">
                            {displaySelectedWindow()}
                        </section>
                    </div>
                </DialogContent>
            </Dialog>


        </React.Fragment>
    );
}

SupportCenter.propTypes = {
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
};

export default withStyles(styles)(SupportCenter);
