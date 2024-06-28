import React from "react";
import PropTypes from "prop-types";
import path from "path";
import {ipcRenderer, shell} from 'electron';
import {ClickAwayListener, Button, Grow, MenuItem, MenuList, Paper, Popper, Tooltip} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import CustomerSupport from '../Modals/CustomerSupport';
import ViewLogs from '../Modals/ViewLogs';
import app from 'app';
import SupportCenter from "./SupportCenter";

const styles = theme => ({
    root: {
        display: 'flex',
    },
    paper: {
        marginBottom: '5px',
        border: '#FFFFFF 1px solid',
        color: "black",
        backgroundColor: "#f6f6f6"
    },
    menuItem: {
        '&:hover': {
            backgroundColor: 'black',
            color: 'white'
        }
    },
    supportButton: {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        borderRadius: '0px',
        border: '1px solid black',
        minHeight: '34px',
        backgroundColor: '#f6f6f6',
        '&:disabled': {
            opacity: 0.5
        }, boxShadow: "1px 1px 0px 0px #000000"
    },
    supportImg: {
        width: '100px',
        height: '25px',
        objectFit: 'contain',
        padding: 0,
        margin: 0
    }
});

class Support extends React.Component {
    constructor() {
        super();
        this.state = {
            openDialog: false,
            openMenu: false,
            openLogViewer: false
        };

        this.anchor = React.createRef();
        this.handleToggleMenu = this.handleToggleMenu.bind(this);
        this.handleCloseMenu = this.handleCloseMenu.bind(this);
        this.handleOpenDialog = this.handleOpenDialog.bind(this);
        this.handleCloseDialog = this.handleCloseDialog.bind(this);
        this.handleShowLogs = this.handleShowLogs.bind(this);
        this.handleCloseLogViewer = this.handleCloseLogViewer.bind(this);
    }

    handleToggleMenu() {
        this.setState({
            openMenu: !this.state.openMenu
        });
    }

    handleCloseMenu(event) {
        if (this.anchor.contains(event.target)) {
            return;
        }

        this.setState({
            openMenu: false
        });
    }

    handleOpenDialog() {
        this.setState({
            openDialog: true,
            openMenu: false
        });
    }

    handleCloseDialog() {
        this.setState({
            openDialog: false
        });
    }

    handleShowLogs() {
        this.setState({
            openMenu: false,
            openLogViewer: true
        });
    }

    handleCloseLogViewer() {
        this.setState({
            openMenu: false,
            openLogViewer: false
        });
    }

    render() {
        const { classes, disabled, set_walkthrough_showing, firmware } = this.props;

        if (disabled && this.state.openMenu === true) {
            this.setState({
                openMenu: false
            });
        }

        function onClickWalkthrough(event) {
            ipcRenderer.once('ResponseCR_GetCurrentPage', (event, currentPage) => {
                if (currentPage === "Dashboard") {
                    set_walkthrough_showing(true);
                    window.ShowDashboardWalkthrough(app.machine_name, () => { set_walkthrough_showing(false); });
                  } else if (currentPage === "Milling") {
                    window.ShowMillingWalkthrough(app.machine_name);
                  }
        
                  this.handleCloseMenu(event);
            });
            ipcRenderer.send("CR_GetCurrentPage");

        }

        function onClickViewManual(event) {
            var manualPath = path.join(__dirname, app.support.manual);
            if (process.platform === 'darwin') {
                manualPath = 'file://' + manualPath;
            }

            shell.openExternal(manualPath);
            this.handleCloseMenu(event);
        }

        function onClickVisitSupport(event) {
            shell.openExternal(app.support.link);
            this.handleCloseMenu(event);
        }

		function onClickOpenDialog() {
			this.handleOpenDialog();
		}

		function onClickShowLogs() {
			this.handleShowLogs();
        }

        function getManualButton() {
            return <React.Fragment>View Manual</React.Fragment>

        }

        return (
            <React.Fragment>
                <Tooltip
                    disableHoverListener={!disabled}
                    disableFocusListener={true}
                    disableTouchListener={true}
                    title="Disabled while machine is running"
                >
                    <span>
                        <Button
                            aria-label="Support"
                            onClick={this.handleToggleMenu}
                            className={classes.supportButton}
				            disabled={disabled}
                            size="small"
                            buttonRef={node => { this.anchor = node }}
					        id="support"
                        >
                            <img src={path.join(__dirname, app.image.supportButton)} className={classes.supportImg} />
                        </Button>
                    </span>
                </Tooltip>

                <Popper open={this.state.openMenu} anchorEl={this.anchor} transition disablePortal>
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            id="menu-list-grow"
                            style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                        >
                            <Paper className={classes.paper}>
                                <ClickAwayListener onClickAway={this.handleCloseMenu}>
                                    <MenuList>
                                        <MenuItem className={classes.menuItem} onClick={onClickWalkthrough.bind(this)}>'How to' Walkthrough</MenuItem>
                                        {/* <MenuItem className={classes.menuItem} onClick={onClickViewManual.bind(this)}>{ getManualButton() }</MenuItem> */}
                                        {/* <MenuItem className={classes.menuItem} onClick={onClickVisitSupport.bind(this)}>Visit Helpdesk</MenuItem> */}
                                        {/* <MenuItem className={classes.menuItem} onClick={onClickOpenDialog.bind(this)}>Contact Us</MenuItem> */}
                                        <MenuItem className={classes.menuItem} onClick={onClickShowLogs.bind(this)}>Show Logs</MenuItem>
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>

                <SupportCenter open={this.state.openDialog} onClose={this.handleCloseDialog} />
                <ViewLogs open={this.state.openLogViewer} onClose={this.handleCloseLogViewer} />
            </React.Fragment>
        );
    }
};

Support.propTypes = {
    classes: PropTypes.object.isRequired,
    disabled: PropTypes.bool.isRequired,
    set_walkthrough_showing: PropTypes.func.isRequired,
    firmware: PropTypes.object
};

export default withStyles(styles)(Support);
