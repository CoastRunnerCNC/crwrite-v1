import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ipcRenderer } from "electron";
import {
    Button,
    Dialog,
    DialogContent,
    Grid,
    Select,
    TextField,
    Typography,
    Tabs,
    Tab,
    Box,
} from "@material-ui/core";
import app from "app";
import Alert from "../../../components/Modals/Alert";
import Slider from "@material-ui/core/Slider";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import _ from "underscore";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import { withStyles } from "@material-ui/core/styles";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";
import ExecuteIcon from "@material-ui/icons/Autorenew";
import SelectFileIcon from "@material-ui/icons/Attachment";
import Tooltip from "@material-ui/core/Tooltip";
import PositionPreset from "../../../components/Modals/Shuttle/PositionPreset/PositionPreset";
import ExportOutput from "../../../components/Modals/Shuttle/ExportOutput/ExportOutput";
import DisplayPanel from "../../../components/Modals/Shuttle/DisplayPanel/DisplayPanel";
import ShuttleSettings from "../../../components/Modals/Shuttle/ShuttleSettings";
import ItemPanel from "../../../components/ItemPanel/ItemPanel";
import StopButton from "../../../components/StopButton/StopButton";
import SVGPath from "../../../components/SVGPath/SVGPath";
import HorizontalLines from "../HorizontalLines/HorizontalLines";

const path = require("path");
const DEFAULT_COORDINATE_LIMITS = {
    min: {
        inch: -100,
        mm: -100,
    },
    max: {
        inch: 0,
        mm: 0,
    },
};

const styles = (theme) => ({
    bottomMiddleCell: {
        cursor: "pointer",
        borderTop: "1px solid black",
        borderBottom: "1px solid black",
        borderRight: "1px solid black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    bottomLeftCell: {
        cursor: "pointer",
        borderLeft: "1px solid black",
        borderRight: "1px solid black",
        borderTop: "1px solid black",
        borderBottom: "1px solid black",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    bottomRightCell: {
        cursor: "pointer",
        borderTop: "1px solid black",
        borderRight: "1px solid black",
        borderBottom: "1px solid black",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    sideTopCell: {
        cursor: "pointer",
        borderLeft: "1px solid black",
        borderRight: "1px solid black",
        borderTop: "1px solid black",
        borderBottom: "1px solid black",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    sideMiddleCell: {
        cursor: "pointer",
        borderLeft: "1px solid black",
        borderRight: "1px solid black",
        borderBottom: "1px solid black",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    sideBottomCell: {
        cursor: "pointer",
        borderLeft: "1px solid black",
        borderRight: "1px solid black",
        borderBottom: "1px solid black",
        backgroundColor: "black",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
});

const MillSVG = () => {
    return (
        <svg
            viewBox="0 0 134 81"
            width="100%"
            height="100%"
            fill="none"
            // preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                display: "block",
            }}
        >
            <path
                d="M4.2 3.06C4.2 2.16391 4.2 1.71587 4.37439 1.37362C4.52779 1.07256 4.77256 0.827787 5.07361 0.67439C5.41587 0.5 5.86391 0.5 6.76 0.5H130.44C131.336 0.5 131.784 0.5 132.126 0.67439C132.427 0.827787 132.672 1.07256 132.826 1.37362C133 1.71587 133 2.16392 133 3.06V77.94C133 78.8361 133 79.2841 132.826 79.6264C132.672 79.9274 132.427 80.1722 132.126 80.3256C131.784 80.5 131.336 80.5 130.44 80.5H6.76C5.86391 80.5 5.41587 80.5 5.07361 80.3256C4.77256 80.1722 4.52779 79.9274 4.37439 79.6264C4.2 79.2841 4.2 78.8361 4.2 77.94V3.06Z"
                fill="#F6F6F6"
            />
            <path
                d="M12.2 0.5H125V64.34C125 65.2361 125 65.6841 124.826 66.0264C124.672 66.3274 124.427 66.5722 124.126 66.7256C123.784 66.9 123.336 66.9 122.44 66.9H14.76C13.8639 66.9 13.4159 66.9 13.0736 66.7256C12.7726 66.5722 12.5278 66.3274 12.3744 66.0264C12.2 65.6841 12.2 65.2361 12.2 64.34V0.5Z"
                fill="#F6F6F6"
            />
            <path
                d="M1 7.86C1 6.96392 1 6.51587 1.17439 6.17362C1.32779 5.87256 1.57256 5.62779 1.87362 5.47439C2.21587 5.3 2.66392 5.3 3.56 5.3H4.2V12.5H3.56C2.66392 12.5 2.21587 12.5 1.87362 12.3256C1.57256 12.1722 1.32779 11.9274 1.17439 11.6264C1 11.2841 1 10.8361 1 9.94V7.86Z"
                fill="#F6F6F6"
            />
            <path
                d="M4.2 3.06C4.2 2.16391 4.2 1.71587 4.37439 1.37362C4.52779 1.07256 4.77256 0.827787 5.07361 0.67439C5.41587 0.5 5.86391 0.5 6.76 0.5H130.44C131.336 0.5 131.784 0.5 132.126 0.67439C132.427 0.827787 132.672 1.07256 132.826 1.37362C133 1.71587 133 2.16392 133 3.06V77.94C133 78.8361 133 79.2841 132.826 79.6264C132.672 79.9274 132.427 80.1722 132.126 80.3256C131.784 80.5 131.336 80.5 130.44 80.5H6.76C5.86391 80.5 5.41587 80.5 5.07361 80.3256C4.77256 80.1722 4.52779 79.9274 4.37439 79.6264C4.2 79.2841 4.2 78.8361 4.2 77.94V3.06Z"
                stroke="black"
            />
            <path
                d="M12.2 0.5H125V64.34C125 65.2361 125 65.6841 124.826 66.0264C124.672 66.3274 124.427 66.5722 124.126 66.7256C123.784 66.9 123.336 66.9 122.44 66.9H14.76C13.8639 66.9 13.4159 66.9 13.0736 66.7256C12.7726 66.5722 12.5278 66.3274 12.3744 66.0264C12.2 65.6841 12.2 65.2361 12.2 64.34V0.5Z"
                stroke="black"
            />
            <path
                d="M1 7.86C1 6.96392 1 6.51587 1.17439 6.17362C1.32779 5.87256 1.57256 5.62779 1.87362 5.47439C2.21587 5.3 2.66392 5.3 3.56 5.3H4.2V12.5H3.56C2.66392 12.5 2.21587 12.5 1.87362 12.3256C1.57256 12.1722 1.32779 11.9274 1.17439 11.6264C1 11.2841 1 10.8361 1 9.94V7.86Z"
                stroke="black"
            />
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M17 4.5H19V6.5H17V4.5ZM17 10.5H19V12.5H17V10.5ZM19 16.5H17V18.5H19V16.5ZM17 22.5H19V24.5H17V22.5ZM19 28.5H17V30.5H19V28.5ZM22.9999 4.5H24.9999V6.5H22.9999V4.5ZM24.9999 10.5H22.9999V12.5H24.9999V10.5ZM22.9999 16.5H24.9999V18.5H22.9999V16.5ZM24.9999 22.5H22.9999V24.5H24.9999V22.5ZM22.9999 28.5H24.9999V30.5H22.9999V28.5ZM31 4.5H29V6.5H31V4.5ZM29 10.5H31V12.5H29V10.5ZM31 28.5H29V30.5H31V28.5ZM34.9999 4.5H36.9999V6.5H34.9999V4.5ZM36.9999 10.5H34.9999V12.5H36.9999V10.5ZM41 4.5H43V6.5H41V4.5ZM49 4.5H47V6.5H49V4.5Z"
                fill="black"
            />
        </svg>
    );
};

class JoggingPanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            realTimeStatus: {},
            realTimeStatusDisplay: "",
            manualEntry: "",
            entryHistory: [],
            historyIndex: 0,
            isSeekingHistory: false,
            step: { stepNum: 0 },
            WCS: "G54",
            units: "mm",
            speed: "Feedrate",
            mode: "Fixed",
            fixed_distance: { value: 1.0, unit: "mm" },
            feedRate: this.props.feedRate,
            feedRate2: 100,
            jogRate: 0,
            homingAlertDialogOpen: false,
            pathIdEventKeyMap: {},
            gCodeFilePath: "",
            gCodeFilePathDisplay: "",
            forceShowJoggingTooltip: false,
            forceShowUnitTooltip: false,
            forceShowJoggingTooltipMaxDistance: false,
            joggingTooltipText: "",
            focusedInput: "",
            maxDistanceIsValid: true,
            milling: false,
            millingProgress: -1,
            movementAbsolute: true,
            limitWarningOpen: false,
            settings: {},
            currentTab: 0,
            readWrites: [],
            rawGCodes: [],
            rawHistory: [],
            timerElapsedSeconds: 0,
            openShuttleSettings: false,
        };

        this.progress = this.progress.bind(this);
        // this.getMillingInProgressDisplay =
        // this.getMillingInProgressDisplay.bind(this);
        // this.getMillingProgress = this.getMillingProgress.bind(this);
        this.updateRealtimeStatus = this.updateRealtimeStatus.bind(this);
        this.executeCommand = this.executeCommand.bind(this);
        this.uploadGCodeFile = this.uploadGCodeFile.bind(this);
        this.closeShuttleSettings = this.closeShuttleSettings.bind(this);
        this.openShuttleSettings = this.openShuttleSettings.bind(this);
        this.interval = null;
        this.timerInterval = null;
        this.convertToUnits = this.convertToUnits.bind(this);
        this.get_work_pos = this.get_work_pos.bind(this);
        this.get_position = this.get_position.bind(this);
        this.getCommandKey = this.getCommandKey.bind(this);
        this.keydownListener = this.keydownListener.bind(this);
        this.keyupListener = this.keyupListener.bind(this);
        this.onModeChange = this.onModeChange.bind(this);
        this.printLog = this.printLog.bind(this);
        this.onSpeedChange = this.onSpeedChange.bind(this);
        this.onFeedRateChange = this.onFeedRateChange.bind(this);
        this.onJogRateChange = this.onJogRateChange.bind(this);
        this.pathClickStarted = this.pathClickStarted.bind(this);
        this.pathClickEnded = this.pathClickEnded.bind(this);
        this.sendCommand = this.sendCommand.bind(this);
        this.isOutOfBounds = this.isOutOfBounds.bind(this);
        this.tempIsMovementAbsolute = this.tempIsMovementAbsolute.bind(this);
        this.populateCoordinateCache = this.populateCoordinateCache.bind(this);
        this.selectGCodeFile = this.selectGCodeFile.bind(this);
        this.getFixedValue = this.getFixedValue.bind(this);
        this.handleInputHasFocus = this.handleInputHasFocus.bind(this);
        this.handleInputNoLongerHasFocus =
            this.handleInputNoLongerHasFocus.bind(this);
        this.isMaxDistanceValid = this.isMaxDistanceValid.bind(this);
        this.allowedToJog = this.allowedToJog.bind(this);
        this.focusOnNothing = this.focusOnNothing.bind(this);
        this.onFeedRateNumberChange = this.onFeedRateNumberChange.bind(this);
        this.updateMovementType = this.updateMovementType.bind(this);
        this.disableSoftLimitSetting = this.disableSoftLimitSetting.bind(this);
        this.updateUnits = this.updateUnits.bind(this);
        this.updateUnitsOutput = this.updateUnitsOutput.bind(this);
        this.updateUnitsInput = this.updateUnitsInput.bind(this);
        this.updateReadWrites = this.updateReadWrites.bind(this);
        this.setRawHistory = this.setRawHistory.bind(this);
        this.incrementElapsedSeconds = this.incrementElapsedSeconds.bind(this);
        this.handleSpindleChange = this.handleSpindleChange.bind(this);
        this.jogEnd = this.jogEnd.bind(this);
        this.handleUnitsChange = this.handleUnitsChange.bind(this);
        this.currentJog = null;
        this.manual_entry_focused = false;
        this.manual_entry_ref = React.createRef();
        this.max_distance_ref = React.createRef();
        this.unitRef = React.createRef();
        this.wcsRef = React.createRef();
        this.jogModeRef = React.createRef();
        this.homePresetRef = React.createRef();
        this.preset1Ref = React.createRef();
        this.preset2Ref = React.createRef();
        this.preset3Ref = React.createRef();
        this.preset4Ref = React.createRef();
        this.backEndKeyMap = {
            gantry_left: "LEFT",
            gantry_right: "RIGHT",
            raise_table: "UP",
            lower_table: "DOWN",
            retract: "RETRACT",
            plunge: "PLUNGE",
        };
        this.pathIdFrontEndCommandMap = {
            y_neg_path: "gantry_left",
            y_pos_path: "gantry_right",
            z_neg_path: "plunge",
            z_pos_path: "retract",
            x_pos_path: "lower_table",
            x_neg_path: "raise_table",
        };
        this.coordinateColorThresholdCache = {};
    }

    disableSoftLimitSetting() {
        ipcRenderer.send(
            "Settings::UpdateSettings",
            this.state.settings.pause,
            this.state.settings.enableSlider,
            this.state.settings.maxFeedRate,
            true
        );
        let settings = this.state.settings;
        settings.disableLimitCatch = true;
        this.setState({ settings: settings });
    }

    handleInputHasFocus(focusName) {
        this.setState({ focusedInput: focusName });
    }

    handleInputNoLongerHasFocus() {
        this.setState({ focusedInput: "" });
    }

    updateMovementType(event, command) {
        let movementType;

        const regex = /G9[0-1]/i;
        if (command.length > 0) {
            movementType = command[0].VALUE.match(regex);
        }
        if (movementType && command[1].VALUE === "ok") {
            this.setState({
                movementAbsolute:
                    movementType[0].toLowerCase() === "g90" ? true : false,
            });
        }
    }

    handleEStop() {
        console.log("estop fired!");
        ipcRenderer.send("Jobs::EmergencyStop");
    }

    fetchAsyncData() {
        this.props.refreshShuttleKeys();

        ipcRenderer.once("Settings::GetSettingsResponse", (event, settings) => {
            this.setState({ settings: settings });
        });
        ipcRenderer.send("Settings::GetSettings");

        ipcRenderer.once("CNC::GetMachineConfigResponse", (event, config) => {
            let limits = this.state.limits;

            if (config.soft_limits != null) {
                limits = JSON.parse(config.soft_limits);
            }

            this.setState({
                limits: limits,
            });
        });
        ipcRenderer.send("CNC::GetMachineConfig");
    }

    progress() {
        setTimeout(this.progress, 100);
    }

    // getMillingProgress() {
    //     while (this.props.open) {
    //         ipcRenderer.send("Jobs::GetProgress", 0);
    //         ipcRenderer.once(
    //             "Jobs::GetProgressResponse",
    //             (event, updatedProgress) => {
    //                 if (updatedProgress.milling) {
    //                     this.setState({
    //                         millingProgress:
    //                             updatedProgress.progress.percentage,
    //                     });
    //                     this.props.setMilling(true);
    //                 } else {
    //                     this.props.setMilling(false);
    //                 }
    //             }
    //         );
    //         setTimeout(this.getMillingProgress, 100);
    //         return;
    //     }
    // }

    // getMillingInProgressDisplay() {
    //     if (this.props.milling) {
    //         return (
    //             <React.Fragment>
    //                 <Typography display="inline" variant="h4" color="primary">
    //                     {this.state.millingProgress}%
    //                 </Typography>
    //                 <RPMDivergence indicatorHeight="30px" />
    //                 <LinearProgress
    //                     variant="determinate"
    //                     color="primary"
    //                     style={{ height: "5px" }}
    //                     value={this.state.millingProgress}
    //                 />
    //             </React.Fragment>
    //         );
    //     }
    //     return;
    // }

    closeShuttleSettings() {
        this.setState({ openShuttleSettings: false });
    }

    openShuttleSettings() {
        this.setState({ openShuttleSettings: true });
    }

    printLog(event, arg) {
        // console.log(JSON.stringify(arg));
    }

    updateReadWrites(event, newLines) {
        if (newLines.length > 0) {
            let readWrites = this.state.readWrites.concat(newLines);

            // this ensures the output window only has as many as 50 readWrites

            this.setState({
                readWrites: readWrites,
            });
        }
    }

    componentDidMount() {
        this.fetchAsyncData.call(this);
        this.props.setManualMode(true);

        window.addEventListener("keydown", this.keydownListener, true);
        window.addEventListener("keyup", this.keyupListener, true);

        // this.interval = setInterval(() => {
        //     ipcRenderer.send("CNC::GetStatus");
        // }, 200);

        ipcRenderer.removeListener(
            "CR_UpdateRealtimeStatus",
            this.updateRealtimeStatus
        );
        ipcRenderer.on("CR_UpdateRealtimeStatus", this.updateRealtimeStatus);
        ipcRenderer.send("CNC::SetManualEntryMode", true);

        // this.getMillingProgress();
        // ipcRenderer.removeListener("Jobs::ReadWrites", this.updateMovementType);
        // ipcRenderer.on("Jobs::ReadWrites", this.updateMovementType);
        this.setState({ feedRate2: this.state.feedRate });
        ipcRenderer.removeListener("Jobs::ReadWrites", this.updateReadWrites);
        ipcRenderer.on("Jobs::ReadWrites", this.updateReadWrites);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        this.stopTimer();
        window.removeEventListener("keydown", this.keydownListener, true);
        window.removeEventListener("keyup", this.keyupListener, true);
        ipcRenderer.removeListener(
            "CR_UpdateRealtimeStatus",
            this.updateRealtimeStatus
        );
        ipcRenderer.send("CNC::SetManualEntryMode", false);
        console.log("component unmounting");
        this.props.setManualMode(false);
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            !_.isEqual(this.state.units, prevState.units) ||
            !_.isEqual(this.state.limits, prevState.limits) ||
            !_.isEqual(this.state.fixed_distance, prevState.fixed_distance) ||
            !_.isEqual(this.state.mode, prevState.mode)
        ) {
            this.coordinateColorThresholdCache = {};
        }
        if (this.props.milling != prevProps.milling) {
            if (this.props.milling) {
                this.startTimer();
            } else {
                this.stopTimer();
            }
        }

        if (this.props.feedRate != prevProps.feedRate) {
            this.setState({ feedRate: this.props.feedRate, feedRate2: this.props.feedRate });
        }
    }

    convertToUnits(value, input_unit, output_unit) {
        if (input_unit === output_unit) {
            return value;
        }

        let sanitizedValue = this.isMaxDistanceValid(value) ? value : 0;
        const isMM = input_unit === "mm";
        if (isMM) {
            sanitizedValue = sanitizedValue / 25.4;
        } else {
            sanitizedValue = sanitizedValue * 25.4;
        }

        return sanitizedValue.toFixed(isMM ? 3 : 4);
    }

    updateRealtimeStatus(event, status) {
        if (
            !this.firstRealTimeStatusReceived &&
            this.state.realTimeStatus &&
            this.state.realTimeStatus.state
        ) {
            this.firstRealTimeStatusReceived = true;

            if (this.state.realTimeStatus.state.toLowerCase() == "alarm") {
                this.setState({ homingAlertDialogOpen: true });
            }
        }

        try {
            const parsed = JSON.parse(status);
            // console.log("rtstatusdisplay: " + this.state.realTimeStatusDisplay);
            // console.log("status display: " + this.getStatusDisplay(status));
            // if (status.state === "Idle") {
            //     this.currentJog = null;
            // }
            if (parsed.error == null) {
                // console.log(JSON.stringify(parsed));
                let status = parsed.status;
                let wcs = this.state.WCS;
                if (status.work_coordinates != null) {
                    wcs = status.work_coordinates.wcs;
                }

                this.setState({
                    realTimeStatus: status,
                    realTimeStatusDisplay: this.getStatusDisplay(status),
                    WCS: wcs,
                    units: status.parserUnits,
                    movementType: status.movementType,
                });
            }
        } catch (e) {
            console.log(e);
        }
    }

    focusOnNothing() {
        setTimeout(() => {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
                this.setState({ focusedInput: "" });
                console.log("focusOnNothing fired!");
            }
        }, 0);
    }

    getAxisValue(axis, value) {
        const regex = new RegExp(axis + "-?[0-9]+\\.?[0-9]*", "i");
        const movementString = value.match(regex);
        if (movementString) {
            return Number(movementString[0].slice(1));
        } else {
            return 0;
        }
    }

    convertToAbsolute(axis, value) {
        return value + Number(this.get_position(axis));
    }

    tempIsMovementAbsolute(value) {
        let movementType;

        const regex = /G9[0-1]/i;
        movementType = value.match(regex);

        if (movementType) {
            return movementType[0].toLowerCase() === "g90" ? true : false;
        }
    }

    containsTypeAndDir(value) {
        const regex1 = /G9[0-1]/i;
        const regex2 = /(x|y|z)-?[0-9]+/i;

        let directionChange = value.match(regex1);
        let axisChange = value.match(regex2);

        if (directionChange && axisChange) {
            return true;
        } else {
            return false;
        }
    }

    isOutOfBounds(value) {
        let x, y, z;
        let xLimit, yLimit, zLimit;
        let useTempMovementType;
        let movementTypeAbsolute;

        if (this.props.firmware != null && this.props.firmware.grbl != null) {
            if (this.props.firmware.grbl.startsWith("1.1")) {
                xLimit = -86.5;
                yLimit = -241.5;
                zLimit = -78.5;
            } else {
                xLimit = -75;
                yLimit = -180;
                zLimit = -60.5;
            }
        }

        useTempMovementType = this.containsTypeAndDir(value);

        if (useTempMovementType) {
            movementTypeAbsolute = this.tempIsMovementAbsolute(value);
        } else {
            movementTypeAbsolute =
                this.state.movementType == "absolute" ? true : false;
        }

        x = this.getAxisValue("x", value);
        y = this.getAxisValue("y", value);
        z = this.getAxisValue("z", value);

        if (!movementTypeAbsolute) {
            x = this.convertToAbsolute("x", x);
            y = this.convertToAbsolute("y", y);
            z = this.convertToAbsolute("z", z);
        }

        if (x > 0 || x < xLimit || y > 0 || y < yLimit || z > 0 || z < zLimit) {
            return true;
        } else {
            return false;
        }
    }

    sendCommand() {
        let isOutOfBounds = false;
        isOutOfBounds = this.isOutOfBounds(this.state.manualEntry);
        // if (isOutOfBounds) {
        //     console.log("out of bounds");
        //     this.setState({ limitWarningOpen: true });
        // } else {
        console.log("in bounds");
        this.executeCommand();
        // }
    }

    executeCommand() {
        this.manual_entry_ref.current.focus();
        const command = this.state.manualEntry;

        this.updateUnits(command);
        let history = this.state.entryHistory.slice();
        let searchIndex = history.indexOf(command);
        if (searchIndex !== -1) {
            history.splice(searchIndex, 1);
        }
        history.push(command);
        const buffSize = 15;
        if (history.length === buffSize) {
            history.splice(1, 1);
        } // Remove earliest except for empty string at front

        // Hack to clear raw output
        // const nextStepNum = this.state.step.stepNum + 1;
        this.setState({
            manualEntry: "",
            entryHistory: history,
            historyIndex: history.length,
            isSeekingHistory: false,
            currentTab: 0,
        });

        if (command.trim().toLowerCase() === "$h") {
            this.sendHome();
        } else if (command.trim() === "|") {
            // this.setState({ movementAbsolute: true });
            ipcRenderer.send("CNC::ExecuteCommand", command);
        } else {
            ipcRenderer.send("CNC::ExecuteCommand", command);
        }

        this.fetchAsyncData.call(this);
    }

    getCommandKey(value) {
        if (this.props.commandKeys == null) {
            return "";
        } else {
            return this.props.commandKeys[value];
        }
    }

    getFrontEndCommand(eventKey) {
        let sanitizedEventKey = (eventKey || "").toLowerCase();
        let frontEndCommand =
            this.props.eventKeyFrontEndCommandMap[sanitizedEventKey];

        //We hard key these but allow the jog commands to be bound to other keys as well
        //These are hardcoded because now that NumLock is used to quick-jump to max_distance
        //it causes my preferred keybindings (the number pad) to inadvertently switch between
        //the bound keys (4, 8, etc.) and the arrow keys. This allows me to keep my preferred keybindings
        if (eventKey == "ArrowLeft") {
            frontEndCommand = "gantry_left";
        } else if (eventKey == "ArrowRight") {
            frontEndCommand = "gantry_right";
        } else if (eventKey == "ArrowUp") {
            frontEndCommand = "raise_table";
        } else if (eventKey == "ArrowDown") {
            frontEndCommand = "lower_table";
        }

        if (!frontEndCommand) {
            throw new Error(
                `Cannot determine frontEndCommand from eventKey: ${sanitizedEventKey}`
            );
        }

        return frontEndCommand;
    }

    getBackendCommand(frontEndCommand) {
        let sanitizedFrontEndCommand = (frontEndCommand || "").toLowerCase();

        let backendCommand = this.backEndKeyMap[sanitizedFrontEndCommand];

        if (!backendCommand) {
            throw new Error(
                `Cannot determine backendCommand from frontEndCommand: ${sanitizedFrontEndCommand}`
            );
        }

        return backendCommand;
    }

    jogStart(
        frontEndCommand,
        distanceOverride = null,
        forceNotContinuous = null
    ) {
        if (this.currentJog != null || !this.allowedToJog()) {
            return;
        }

        let backendCommand = this.getBackendCommand(frontEndCommand);
        this.currentJog = frontEndCommand;

        let inputValue = this.state.fixed_distance.value;

        if (distanceOverride) {
            inputValue = distanceOverride;
        }
        console.log("jogStart - inputValue: " + inputValue);
        console.log(
            "jogStart - fixed_distance.unit:" + this.state.fixed_distance.unit
        );
        let value = this.convertToUnits(
            inputValue,
            this.state.fixed_distance.unit,
            "mm"
        );

        console.log("jogStart - converted value: " + value);

        let joggingMode = this.state.mode;
        if (forceNotContinuous) {
            joggingMode = "Fixed";
        }
        ipcRenderer.send(
            "CNC::Jog",
            backendCommand,
            joggingMode === "Continuous",
            value
        );
        this.setState({ isHome: false });
    }

    jogEnd() {
        if (this.currentJog != null) {
            ipcRenderer.send("CNC::CancelJog");
            this.currentJog = null;
        }
    }

    keydownListener(event) {
        let eventKey = event.key;
        //console.log(eventKey);

        if (this.state.focusedInput) {
            if (
                eventKey == this.getCommandKey("escape_textbox") ||
                (this.state.focusedInput == "max_distance" &&
                    eventKey == "Enter")
            ) {
                this.focusOnNothing();
                return;
            }

            if (this.state.focusedInput == "manual_entry") {
                if (eventKey == "Enter") {
                    this.state.settings.disableLimitCatch
                        ? this.executeCommand()
                        : this.sendCommand();
                } else if (
                    eventKey === "ArrowDown" &&
                    this.state.isSeekingHistory
                ) {
                    let index = this.state.historyIndex + 1;
                    let command = "";
                    if (index < this.state.entryHistory.length) {
                        command = this.state.entryHistory[index];
                    } else {
                        index = this.state.entryHistory.length;
                    }
                    this.setState({
                        manualEntry: command,
                        historyIndex: index,
                        isSeekingHistory: true,
                    });
                } else if (eventKey === "ArrowUp") {
                    let index = this.state.historyIndex - 1;
                    if (index < 0) {
                        index = 0;
                    }
                    this.setState({
                        manualEntry: this.state.entryHistory[index],
                        historyIndex: index,
                        isSeekingHistory: true,
                    });
                }

                return;
            }

            return;
        } else if (!this.state.openShuttleSettings) {
            if (eventKey == this.getCommandKey("escape_textbox")) {
                //Putting this condition here so that the escape button doesn't fall through and throw an error message
                return;
            } else if (eventKey == this.getCommandKey("focus_manual_entry")) {
                this.manual_entry_ref.current.focus();
                this.handleInputHasFocus("manual_entry");
                return;
            } else if (eventKey == this.getCommandKey("focus_max_distance")) {
                this.max_distance_ref.current.focus();
                this.handleInputHasFocus("max_distance");
                return;
            } else if (eventKey == this.getCommandKey("switch_units")) {
                if (this.state.units == "mm") {
                    this.sendUnitsInputChange("inch");
                } else if (this.state.units == "inch") {
                    this.sendUnitsInputChange("mm");
                }
                return;
            } else if (eventKey == this.getCommandKey("switch_jog_mode")) {
                if (this.state.mode == "Continuous") {
                    this.setState({ mode: "Fixed" });
                } else if (this.state.mode == "Fixed") {
                    this.setState({ mode: "Continuous" });
                }
                return;
            } else if (eventKey == this.getCommandKey("increase_units")) {
                this.setState({
                    fixed_distance: {
                        value: this.state.fixed_distance.value * 10,
                        unit: this.state.units,
                    },
                });
                return;
            } else if (eventKey == this.getCommandKey("decrease_units")) {
                this.setState({
                    fixed_distance: {
                        value: this.state.fixed_distance.value / 10,
                        unit: this.state.units,
                    },
                });
                return;
            } else if (eventKey == this.getCommandKey("home_preset")) {
                this.homePresetRef.current.handleClick();
                return;
            } else if (eventKey == this.getCommandKey("preset_1")) {
                this.preset1Ref.current.handleClick();
                return;
            } else if (eventKey == this.getCommandKey("preset_2")) {
                this.preset2Ref.current.handleClick();
                return;
            } else if (eventKey == this.getCommandKey("preset_3")) {
                this.preset3Ref.current.handleClick();
                return;
            } else if (eventKey == this.getCommandKey("preset_4")) {
                this.preset4Ref.current.handleClick();
                return;
            }
        }

        try {
            if (this.state.realTimeStatus.state.toLowerCase() != "alarm") {
                let frontEndCommand = this.getFrontEndCommand(eventKey);
                this.jogStart(frontEndCommand);
            }
        } catch (e) {
            // do nothing, not all keys have bindings
            console.log(e);
        }
    }

    keyupListener(event) {
        if (
            this.currentJog != null &&
            this.currentJog === this.getFrontEndCommand(event.key)
        ) {
            this.jogEnd();
        }
    }

    get_work_pos(axis) {
        if (
            this.state.realTimeStatus &&
            this.state.realTimeStatus.work_coordinates
        ) {
            const value =
                this.state.realTimeStatus.work_coordinates.work_pos[axis];
            return value[this.state.units].toFixed(this.getFixedValue());
        }

        return "";
    }

    getFixedValue() {
        return this.state.units === "mm" ? 3 : 4;
    }

    get_position(axis) {
        if (
            this.state.realTimeStatus &&
            this.state.realTimeStatus.machine_pos
        ) {
            const value = this.state.realTimeStatus.machine_pos[axis];
            return value[this.state.units].toFixed(this.getFixedValue());
        }

        return "";
    }

    getStatusDisplay(status) {
        let realTimeStatusDisplay = "";

        if (status && status.state) {
            realTimeStatusDisplay = status.state;
        }

        return realTimeStatusDisplay;
    }

    onJogRateChange(event, jogRate) {
        this.setState({ jogRate: jogRate });
    }

    onFeedRateChange(event, feedRate) {
        this.setState({ feedRate: feedRate, feedRate2: feedRate });
        this.focusOnNothing();
    }

    onFeedRateNumberChange(event, newFeedRate) {
        if (newFeedRate < 30) {
            newFeedRate = 30;
        } else if (newFeedRate > this.state.settings.maxFeedRate) {
            newFeedRate = this.state.settings.maxFeedRate;
        }
        this.onFeedRateChange(event, newFeedRate);
        this.props.updateFeedRate(newFeedRate);
    }

    onModeChange(e) {
        this.setState({ mode: e.target.value });
        this.jogModeRef.current.blur();
        this.focusOnNothing();
    }

    onSpeedChange(e) {
        this.setState({ speed: e.target.value });
    }

    pathClickStarted(frontEndCommand, distance) {
        console.log("frontend: " + frontEndCommand);
        console.log("distance: " + distance);
        if (frontEndCommand) {
            this.jogStart(frontEndCommand, distance, true);
        }
    }

    pathClickEnded() {
        this.jogEnd();
    }

    isValueInRange(value, pointA, pointB) {
        return (
            (pointA <= value && pointB >= value) ||
            (pointB <= value && pointA >= value)
        );
    }

    populateCoordinateCache(coordinate, units) {
        if (!this.coordinateColorThresholdCache[coordinate]) {
            let coordinateLimits;

            if (this.state.limits && this.state.limits[coordinate]) {
                coordinateLimits = this.state.limits[coordinate];
            } else {
                coordinateLimits = DEFAULT_COORDINATE_LIMITS;
            }

            let redThreshold;
            let yellowThreshold;
            if (this.state.mode === "Continuous") {
                redThreshold = this.convertToUnits(2, "mm", units);
                yellowThreshold = this.convertToUnits(10, "mm", units);
            } else {
                const fixedDistance = this.getSafeFloat(
                    this.state.fixed_distance.value
                );
                redThreshold = fixedDistance;
                yellowThreshold = this.safeMultiply(fixedDistance, 3);
            }

            if (this.coordinateColorThresholdCache == null) {
                this.coordinateColorThresholdCache = {};
            }

            this.coordinateColorThresholdCache[coordinate] = {
                min: {},
                max: {},
            };

            const minA = this.getSafeFloat(coordinateLimits.min[units]);
            this.coordinateColorThresholdCache[coordinate]["min"]["A"] = minA;
            this.coordinateColorThresholdCache[coordinate]["min"]["BR"] =
                this.safeAdd(minA, redThreshold);
            this.coordinateColorThresholdCache[coordinate]["min"]["BY"] =
                this.safeAdd(minA, yellowThreshold);

            const maxA = this.getSafeFloat(coordinateLimits.max[units]);
            this.coordinateColorThresholdCache[coordinate]["max"]["A"] = maxA;
            this.coordinateColorThresholdCache[coordinate]["max"]["BR"] =
                this.safeSubtract(maxA, redThreshold);
            this.coordinateColorThresholdCache[coordinate]["max"]["BY"] =
                this.safeSubtract(maxA, yellowThreshold);
        }
    }

    getSafeFloat(value) {
        let sanitizedValue = value;
        if (typeof sanitizedValue !== "number") {
            sanitizedValue = parseFloat(sanitizedValue.trim());
        }

        return sanitizedValue;
    }

    safeAdd(a, b) {
        return this.getSafeFloat(a) + this.getSafeFloat(b);
    }

    safeSubtract(a, b) {
        return this.getSafeFloat(a) - this.getSafeFloat(b);
    }

    safeMultiply(a, b) {
        return this.getSafeFloat(a) * this.getSafeFloat(b);
    }

    sendHome() {
        this.setState({
            isHome: true,
        });
        ipcRenderer.send("CNC::ExecuteCommand", "$H");
    }

    selectGCodeFile() {
        ipcRenderer.once("GCodeFileSelected", (event, gCodeFilePath) => {
            let gCodeFilePathDisplay = gCodeFilePath;

            if (gCodeFilePathDisplay.length > 60) {
                gCodeFilePathDisplay = gCodeFilePathDisplay.substr(
                    gCodeFilePathDisplay.length - 60
                );
                gCodeFilePathDisplay = `...${gCodeFilePathDisplay.substr(
                    gCodeFilePathDisplay.indexOf(path.sep)
                )}`;
            }
            ipcRenderer.once(
                "File::ResponseGetManualGCodeFileLines",
                (event, rawGCodes) => {
                    console.log(JSON.stringify(rawGCodes));
                    this.setState({
                        gCodeFilePath: gCodeFilePath,
                        gCodeFilePathDisplay: gCodeFilePathDisplay,
                        rawGCodes: rawGCodes,
                        currentTab: 1,
                    });
                }
            );
            ipcRenderer.send("File::GetManualGCodeFileLines", gCodeFilePath);
        });
        ipcRenderer.send("File::OpenGCodeFileDialog");
    }

    uploadGCodeFile() {
        if (!this.state.gCodeFilePath) {
            return;
        }

        ipcRenderer.once("CNC::UploadGCodeFileResponse", () => {
            this.setState({
                gCodeFilePath: "",
                gCodeFilePathDisplay: "",
                currentTab: 0,
                timerElapsedSeconds: 0,
            });
        });
        ipcRenderer.send("CNC::UploadGCodeFile", this.state.gCodeFilePath);
    }

    isMaxDistanceValid(value) {
        if (isNaN(value)) {
            return false;
        }

        const isEmpty =
            value === null ||
            value === undefined ||
            (typeof value === "string" && value.trim() === "");

        if (isEmpty) {
            return false;
        }

        const units = this.state.units;
        const isMM = units === "mm";
        const min = isMM ? 0.0025 : 0.0001;
        const max = isMM ? 1000 : 40;

        const floatValue = parseFloat(value);

        if (floatValue < min || floatValue > max) {
            return false;
        }

        return true;
    }

    allowedToJog() {
        return (
            this.state.maxDistanceIsValid || this.state.mode === "Continuous"
        );
    }

    sendUnitsInputChange(units) {
        if (units == "mm") {
            ipcRenderer.send("CNC::ExecuteCommand", "G21");
        } else if (units == "inch") {
            ipcRenderer.send("CNC::ExecuteCommand", "G20");
        }
    }

    updateUnits(command) {
        this.updateUnitsOutput(command);
        this.updateUnitsInput(command);
    }

    updateUnitsOutput(command) {
        if (command === "$13=0") {
            this.setState({ units: "mm" });
            this.sendUnitsInputChange("mm");
        } else if (command === "$13=1") {
            this.setState({ units: "inch" });
            this.sendUnitsInputChange("inch");
        }
    }

    updateUnitsInput(command) {
        var match = command.match(/G(20|21)/i);
        if (match) {
            if (match[0] === "G20") {
                this.setState({ units: "inch" });
            } else if (match[0] === "G21") {
                this.setState({ units: "mm" });
            }
        }
    }

    handleFeedPause() {
        if (this.state.paused) {
            this.setState({ paused: false });
            ipcRenderer.send("CNC::ExecuteCommand", "~");
        } else {
            this.setState({ paused: true });
            ipcRenderer.send("CNC::ExecuteCommand", "!");
        }
    }

    setRawHistory(lines) {
        this.setState({ rawHistory: lines });
    }

    incrementElapsedSeconds(seconds) {
        this.setState((prevState) => ({
            timerElapsedSeconds: prevState.timerElapsedSeconds + 1,
        }));
    }

    startTimer() {
        if (!this.timerInterval) {
            this.timerInterval = setInterval(() => {
                this.incrementElapsedSeconds();
            }, 1000);
        }
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    handleSpindleChange(event) {
        this.setState({ spindle: event.target.value });
    }

    handleDirectionChange(event) {
        this.setState({ direction: event.target.value });
    }

    handleUnitsChange(e) {
        console.log("handleUnitsChange - value: " + e.target.value);
        this.sendUnitsInputChange(e.target.value);
        this.setState({
            units: e.target.value,
            fixed_distance: {
                value: this.state.fixed_distance.value,
                unit: e.target.value,
            },
        });
        this.fetchAsyncData.call(this);
        this.unitRef.current.blur();
        this.focusOnNothing();
    }

    handleJoggingClick(frontEndCommand, distance) {
        if (this.state.realTimeStatusDisplay === "Idle") {
            this.pathClickStarted(frontEndCommand, distance);
        }
    }

    render() {
        const { classes } = this.props;

        function handleMaxDistanceChange(component, e) {
            const value = e.currentTarget.value;
            const isValid = component.isMaxDistanceValid(value);

            component.setState({
                maxDistanceIsValid: isValid,
                fixed_distance: { value: value, unit: component.state.units },
            });
        }

        function maxDistanceInput(component) {
            let textField = "";

            const isFixedMode = component.state.mode === "Fixed";

            if (isFixedMode) {
                const distance = component.convertToUnits(
                    component.state.fixed_distance.value,
                    component.state.fixed_distance.unit,
                    component.state.units
                );

                return (
                    <>
                        <Grid item>Max Distance</Grid>
                        <Grid item xs>
                            <Tooltip
                                open={
                                    component.state
                                        .forceShowJoggingTooltipMaxDistance
                                }
                                placement="top-end"
                                title={
                                    component.state
                                        .joggingTooltipMaxDistanceText
                                }
                            >
                                <FormControl
                                    className={
                                        component.props.classes.formControl
                                    }
                                    error={!component.state.maxDistanceIsValid}
                                    onMouseLeave={(ignored) =>
                                        component.setState({
                                            forceShowJoggingTooltipMaxDistance: false,
                                        })
                                    }
                                    style={{ width: "100%" }}
                                >
                                    <Input
                                        value={distance}
                                        onChange={(e) => {
                                            handleMaxDistanceChange(
                                                component,
                                                e
                                            );
                                        }}
                                        disableUnderline
                                        inputRef={component.max_distance_ref}
                                        onFocus={() =>
                                            component.handleInputHasFocus(
                                                "max_distance"
                                            )
                                        }
                                        onBlur={() =>
                                            component.handleInputNoLongerHasFocus()
                                        }
                                    />
                                </FormControl>
                            </Tooltip>
                        </Grid>
                    </>
                );
            }
        }

        function getJoggingMode(component) {
            return (
                <React.Fragment>
                    <Grid item>
                        <Typography>Mode</Typography>
                    </Grid>
                    <Grid item xs>
                        <Tooltip
                            open={component.state.forceShowJoggingTooltip}
                            placement="top-end"
                            title={component.state.joggingTooltipText}
                        >
                            <FormControl
                                className={component.props.classes.formControl}
                                fullWidth
                                onMouseLeave={(ignored) =>
                                    component.setState({
                                        forceShowJoggingTooltip: false,
                                    })
                                }
                            >
                                <Select
                                    id="jog-mode-select"
                                    labelId="jog-mode-select-label"
                                    ref={component.jogModeRef}
                                    fullWidth
                                    disableUnderline
                                    value={component.state.mode}
                                    onChange={component.onModeChange}
                                    onBlurCapture={(ignored) =>
                                        component.setState({
                                            forceShowJoggingTooltip: false,
                                        })
                                    }
                                >
                                    <MenuItem
                                        value="Continuous"
                                        onMouseEnter={(ignored) =>
                                            component.setState({
                                                forceShowJoggingTooltip: true,
                                                joggingTooltipText:
                                                    "In this mode, CR will move until the arrow click/keystroke ends, or until the axis reaches its end-of-travel.",
                                            })
                                        }
                                        onMouseLeave={(ignored) =>
                                            component.setState({
                                                forceShowJoggingTooltip: false,
                                            })
                                        }
                                        onClick={(ignored) => {
                                            component.jogModeRef.current.blur();
                                            component.focusOnNothing();
                                        }}
                                    >
                                        Continuous Motion
                                    </MenuItem>
                                    <MenuItem
                                        value="Fixed"
                                        onMouseEnter={(ignored) =>
                                            component.setState({
                                                forceShowJoggingTooltip: true,
                                                joggingTooltipText:
                                                    "In this mode, CR will move up to the maximum specified distance per activation (arrow click, keystroke). Motion stops immediately if the keystroke/click ends prior to hitting the maximum specified distance.",
                                            })
                                        }
                                        onMouseLeave={(ignored) =>
                                            component.setState({
                                                forceShowJoggingTooltip: false,
                                            })
                                        }
                                        onClick={(ignored) => {
                                            component.jogModeRef.current.blur();
                                            component.focusOnNothing();
                                        }}
                                    >
                                        Limited (per click)
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Tooltip>
                    </Grid>
                </React.Fragment>
            );
        }

        function getHomingAlertDialog(component) {
            let handleClose = () => {
                component.setState({ homingAlertDialogOpen: false });
            };

            let sendHome = () => {
                handleClose();
                component.sendHome();
            };

            return (
                <React.Fragment>
                    <Dialog
                        open={component.state.homingAlertDialogOpen}
                        onClose={handleClose}
                        aria-labelledby="homing-alert-dialog-title"
                        aria-describedby="homing-alert-dialog-description"
                    >
                        <DialogContent>
                            <DialogContentText>
                                We recommend that you home your machine before
                                jogging.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} color="primary">
                                Continue Without Homing
                            </Button>
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    sendHome();
                                }}
                                color="primary"
                                autoFocus
                            >
                                Home Now
                            </Button>
                        </DialogActions>
                    </Dialog>
                </React.Fragment>
            );
        }

        function getUnitsSelect(component) {
            return (
                <Grid item xs>
                    <Tooltip
                        open={component.state.forceShowUnitTooltip}
                        placement="top-end"
                        title="Defines the units for 'Max Distance,' Machine Coordinates,' & 'Work Coordinates'. G-code manually typed into 'Manual Entry' ignores this drop-down; the parser state ('$G') is used instead."
                        onMouseEnter={(ignored) =>
                            component.setState({ forceShowUnitTooltip: true })
                        }
                        onMouseLeave={(ignored) =>
                            component.setState({ forceShowUnitTooltip: false })
                        }
                    >
                        <FormControl
                            className={component.props.classes.formControl}
                            onMouseEnter={(ignored) =>
                                component.setState({
                                    forceShowUnitTooltip: true,
                                })
                            }
                            onMouseLeave={(ignored) =>
                                component.setState({
                                    forceShowUnitTooltip: false,
                                })
                            }
                        >
                            <Select
                                //className={component.props.classes.select}
                                labelId="units-select-label"
                                autoWidth={false}
                                ref={component.unitRef}
                                disableUnderline
                                value={component.state.units}
                                onChange={component.handleUnitsChange}
                                onMouseEnter={(ignored) =>
                                    component.setState({
                                        forceShowUnitTooltip: true,
                                    })
                                }
                                onMouseLeave={(ignored) =>
                                    component.setState({
                                        forceShowUnitTooltip: false,
                                    })
                                }
                                onBlurCapture={(ignored) =>
                                    component.setState({
                                        forceShowUnitTooltip: false,
                                    })
                                }
                                disabled={
                                    component.state.realTimeStatusDisplay ===
                                    "Run"
                                }
                            >
                                <MenuItem
                                    value="mm"
                                    onMouseEnter={(ignored) =>
                                        component.setState({
                                            forceShowUnitTooltip: true,
                                        })
                                    }
                                    onMouseLeave={(ignored) =>
                                        component.setState({
                                            forceShowUnitTooltip: false,
                                        })
                                    }
                                    onClick={(ignored) => {
                                        component.unitRef.current.blur();
                                        component.focusOnNothing();
                                    }}
                                >
                                    mm
                                </MenuItem>
                                <MenuItem
                                    value="inch"
                                    onMouseEnter={(ignored) =>
                                        component.setState({
                                            forceShowUnitTooltip: true,
                                        })
                                    }
                                    onMouseLeave={(ignored) =>
                                        component.setState({
                                            forceShowUnitTooltip: false,
                                        })
                                    }
                                    onClick={(ignored) => {
                                        component.unitRef.current.blur();
                                        component.focusOnNothing();
                                    }}
                                >
                                    inch
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Tooltip>
                </Grid>
            );
        }

        function getWCSSelect(component) {
            return (
                <Grid item>
                    <FormControl
                        className={component.props.classes.formControl}
                    >
                        <Select
                            className={component.props.classes.select}
                            labelId="wcs-select-label"
                            ref={component.wcsRef}
                            disableUnderline
                            value={component.state.WCS}
                            onChange={(e) => {
                                component.setState({ WCS: e.target.value });
                                ipcRenderer.send(
                                    "CNC::ExecuteCommand",
                                    e.target.value
                                );
                                component.fetchAsyncData.call(component);
                                component.wcsRef.current.blur();
                                component.focusOnNothing();
                            }}
                            disabled={
                                component.state.realTimeStatusDisplay === "Run"
                            }
                        >
                            <MenuItem
                                value="G54"
                                onClick={(ignored) => {
                                    component.wcsRef.current.blur();
                                    component.focusOnNothing();
                                }}
                            >
                                G54
                            </MenuItem>
                            <MenuItem
                                value="G55"
                                onClick={(ignored) => {
                                    component.wcsRef.current.blur();
                                    component.focusOnNothing();
                                }}
                            >
                                G55
                            </MenuItem>
                            <MenuItem
                                value="G56"
                                onClick={(ignored) => {
                                    component.wcsRef.current.blur();
                                    component.focusOnNothing();
                                }}
                            >
                                G56
                            </MenuItem>
                            <MenuItem
                                value="G57"
                                onClick={(ignored) => {
                                    component.wcsRef.current.blur();
                                    component.focusOnNothing();
                                }}
                            >
                                G57
                            </MenuItem>
                            <MenuItem
                                value="G58"
                                onClick={(ignored) => {
                                    component.wcsRef.current.blur();
                                    component.focusOnNothing();
                                }}
                            >
                                G58
                            </MenuItem>
                            <MenuItem
                                value="G59"
                                onClick={(ignored) => {
                                    component.wcsRef.current.blur();
                                    component.focusOnNothing();
                                }}
                            >
                                G59
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            );
        }

        function getStatusDisplay(component) {
            return (
                <Grid item xs={2}>
                    <FormControl
                        style={{ border: "none", backgroundColor: "#f6f6f6" }}
                        className={component.props.classes.formControl}
                    >
                        <Input
                            className="text-box status"
                            id="status-input-label"
                            value={component.state.realTimeStatusDisplay}
                            disableUnderline
                            disabled
                        />
                    </FormControl>
                </Grid>
            );
        }

        function getManualEntryRow(component) {
            if (!component.props.milling) {
                return (
                    <FormControl
                        className={component.props.classes.formControl}
                        fullWidth
                    >
                        {/* <InputLabel id="manual-entry-input" shrink>Manual Entry</InputLabel> */}
                        <Input
                            id="manual-entry-input"
                            inputRef={component.manual_entry_ref}
                            style={{ color: app.modal.color, height: "32px" }}
                            inputProps={{ style: { color: app.modal.color } }}
                            value={component.state.manualEntry}
                            placeholder="Manual Entry"
                            onChange={(e) => {
                                component.setState({
                                    manualEntry: e.currentTarget.value,
                                });
                            }}
                            onFocus={() => {
                                component.handleInputHasFocus("manual_entry");
                                component.manual_entry_focused = true;
                            }}
                            onBlur={() => {
                                component.handleInputNoLongerHasFocus();
                                component.manual_entry_focused = false;
                            }}
                            endAdornment={
                                <InputAdornment
                                    position="end"
                                    style={{
                                        alignItems: "center",
                                        height: "100%",
                                        margin: "0px",
                                    }}
                                >
                                    <IconButton
                                        style={{ padding: "0px" }}
                                        onClick={() => {
                                            console.log(
                                                "disableLimitCatch: " +
                                                    component.state.settings
                                                        .disableLimitCatch
                                            );
                                            component.state.settings
                                                .disableLimitCatch
                                                ? component.executeCommand()
                                                : component.sendCommand();
                                        }}
                                        color="primary"
                                        disabled={
                                            component.state
                                                .realTimeStatusDisplay === "Run"
                                        }
                                    >
                                        <SendIcon />
                                    </IconButton>
                                </InputAdornment>
                            }
                            disableUnderline
                        />
                    </FormControl>
                );
            }
        }

        function handleClockwiseClick(component) {
            ipcRenderer.send("CNC::ExecuteCommand", "M3");
        }

        function handleCounterClockwiseClick(component) {
            ipcRenderer.send("CNC::ExecuteCommand", "M4");
        }

        function handleDisableSpindleClick(component) {
            ipcRenderer.send("CNC::ExecuteCommand", "M5");
        }

        return (
            <ItemPanel
                title="Jogging"
                small
                contentStyle={{
                    padding: "8px",
                }}
            >
                <Alert
                    open={this.props.showJoggingResetAlert}
                    message={
                        "Your machine is currently executing gcode. Closing this window will reset your machine.\n\nAre you sure you want to close this window?"
                    }
                    yesNo={true}
                    onOk={(event) => {
                        ipcRenderer.send("CNC::ExecuteCommand", "|");
                        this.props.toggleJoggingPanel();
                        this.props.toggleStepsPanel();
                        this.props.setShowJoggingResetAlert(false);
                    }}
                    onCancel={(event) => {
                        this.props.setShowJoggingResetAlert(false);
                    }}
                    title={"Reset Machine?"}
                />
                {getHomingAlertDialog(this)}
                {/* Main grid container */}
                <Box
                    style={{
                        display: "grid",
                        gridTemplateRows: "220px 16px 1fr",
                        gridTemplateColumns: "1fr",
                    }}
                >
                    {/* Jog controls container */}
                    <Box
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "12px 36px 1fr 3fr 1fr 36px 12px",
                            gridTemplateRows:
                                "12px 16px 1fr 16px 10px 17px 12px",
                            gridTemplateAreas: `
                            " . . . . . . ."
                            ". xControls . . . zControls ."
                            ". xControls . millSVG . zControls ."
                            ". xControls . . . zControls ."
                            ". . . . . . ."
                            ". yControls yControls yControls yControls yControls ."
                            `,
                        }}
                    >
                        {/* x controls */}
                        <Box
                            style={{
                                gridArea: "xControls",
                                display: "grid",
                                gridTemplateColumns: "1fr",
                                gridTemplateRows:
                                    "16px 20px 20px 20px 1fr 20px 20px 20px 16px",
                            }}
                        >
                            <div
                                className={classes.sideTopCell}
                                style={{ gridRow: "1 / 2" }}
                            >
                                +
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick("raise_table", 1);
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "2 / 3" }}
                            >
                                1
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick("raise_table", 0.1);
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "3 / 4" }}
                            >
                                0.1
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick(
                                        "raise_table",
                                        0.01
                                    );
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "4 / 5" }}
                            >
                                0.01
                            </div>
                            <div
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "5 / 6" }}
                            >
                                X
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick(
                                        "lower_table",
                                        0.01
                                    );
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "6 / 7" }}
                            >
                                0.01
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick("lower_table", 0.1);
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "7 / 8" }}
                            >
                                0.1
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick("lower_table", 1);
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "8 / 9" }}
                            >
                                1
                            </div>
                            <div
                                className={classes.sideBottomCell}
                                style={{ gridRow: "9 / 10" }}
                            >
                                -
                            </div>
                        </Box>

                        {/* svg */}
                        <Box style={{ gridArea: "millSVG" }}>
                            <MillSVG />
                        </Box>

                        {/* z controls */}
                        <Box
                            style={{
                                gridArea: "zControls",
                                display: "grid",
                                gridTemplateColumns: "1fr",
                                gridTemplateRows:
                                    "16px 20px 20px 20px 1fr 20px 20px 20px 16px",
                            }}
                        >
                            <div
                                className={classes.sideTopCell}
                                style={{ gridRow: "1 / 2" }}
                            >
                                +
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick("plunge", 1);
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "2 / 3" }}
                            >
                                1
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick("plunge", 0.1);
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "3 / 4" }}
                            >
                                0.1
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick("plunge", 0.01);
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "4 / 5" }}
                            >
                                0.01
                            </div>
                            <div
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "5 / 6" }}
                            >
                                Z
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick("retract", 0.01);
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "6 / 7" }}
                            >
                                0.01
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick("retract", 0.1);
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "7 / 8" }}
                            >
                                0.1
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick("retract", 1);
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "8 / 9" }}
                            >
                                1
                            </div>
                            <div
                                className={classes.sideBottomCell}
                                style={{ gridRow: "9 / 10" }}
                            >
                                -
                            </div>
                        </Box>

                        {/* y controls */}
                        <Box
                            style={{
                                gridArea: "yControls",
                                display: "grid",
                                gridTemplateRows: "1fr",
                                gridTemplateColumns:
                                    "12px 36px 36px 36px 1fr 36px 36px 36px 12px",
                            }}
                        >
                            <div
                                className={classes.bottomLeftCell}
                                style={{
                                    gridColumn: "1 / 2",
                                    gridRow: "1 / 2",
                                }}
                            >
                                -
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick("gantry_left", 1);
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.bottomMiddleCell}
                                style={{
                                    gridColumn: "2 / 3",
                                    gridRow: "1 / 2",
                                }}
                            >
                                1
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick("gantry_left", 0.1);
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.bottomMiddleCell}
                                style={{
                                    gridColumn: "3 / 4",
                                    gridRow: "1 / 2",
                                }}
                            >
                                0.1
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick(
                                        "gantry_left",
                                        0.01
                                    );
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.bottomMiddleCell}
                                style={{
                                    gridColumn: "4 / 5",
                                    gridRow: "1 / 2",
                                }}
                            >
                                0.01
                            </div>
                            <div
                                className={classes.bottomMiddleCell}
                                style={{
                                    gridColumn: "5 / 6",
                                    gridRow: "1 / 2",
                                }}
                            >
                                Y
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick(
                                        "gantry_right",
                                        0.01
                                    );
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.bottomMiddleCell}
                                style={{
                                    gridColumn: "6 / 7",
                                    gridRow: "1 / 2",
                                }}
                            >
                                0.01
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick(
                                        "gantry_right",
                                        0.1
                                    );
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.bottomMiddleCell}
                                style={{
                                    gridColumn: "7 / 8",
                                    gridRow: "1 / 2",
                                }}
                            >
                                0.1
                            </div>
                            <div
                                onMouseDown={() => {
                                    this.handleJoggingClick("gantry_right", 1);
                                }}
                                onMouseUp={this.jogEnd}
                                className={classes.bottomMiddleCell}
                                style={{
                                    gridColumn: "8 / 9",
                                    gridRow: "1 / 2",
                                }}
                            >
                                1
                            </div>
                            <div
                                className={classes.bottomRightCell}
                                style={{
                                    gridColumn: "9 / 10",
                                    gridRow: "1 / 2",
                                }}
                            >
                                +
                            </div>
                        </Box>
                    </Box>
                    <Box>
                        <HorizontalLines />
                    </Box>
                    <Box>
                        {/* jogging settings - flexbox */}
                        <Grid
                            container
                            direction="column"
                            justify="space-around"
                            style={{ height: "100%" }}
                        >
                            <Grid
                                item
                                container
                                spacing={1}
                                alignItems="center"
                            >
                                {/* mode max */}
                                {getJoggingMode(this)}
                                {maxDistanceInput(this)}
                            </Grid>
                            <Grid
                                item
                                container
                                spacing={1}
                                alignItems="center"
                            >
                                {/* Status */}
                                <Grid item>
                                    <Typography>Status</Typography>
                                </Grid>
                                {getStatusDisplay(this)}
                                {/* WCS */}
                                <Grid item>
                                    <Typography>WCS</Typography>
                                </Grid>
                                {getWCSSelect(this)}
                                {/* Units */}
                                <Grid item>
                                    <Typography>Units</Typography>
                                </Grid>
                                {getUnitsSelect(this)}
                            </Grid>
                            <Grid
                                item
                                container
                                spacing={1}
                                alignItems="center"
                            ></Grid>
                            <Grid
                                item
                                container
                                spacing={1}
                                alignItems="center"
                            >
                                {/* Feedrate */}
                                <Grid item>
                                    <Typography>Feedrate</Typography>
                                </Grid>
                                <Grid item xs>
                                    <Slider
                                        className={this.props.classes.slider}
                                        value={this.state.feedRate}
                                        step={2}
                                        min={30}
                                        disabled={
                                            !this.state.settings.enable_slider
                                        }
                                        max={this.state.settings.maxFeedRate}
                                        aria-labelledby="label"
                                        onChange={this.onFeedRateChange}
                                        onChangeCommitted={(event, value) => {
                                            this.props.updateFeedRate(value);
                                        }}
                                    />
                                </Grid>
                                <Grid xs={1}>
                                    <Input
                                        value={this.state.feedRate2}
                                        min={30}
                                        max={this.state.settings.maxFeedRate}
                                        onChange={(event) => {
                                            this.setState({
                                                feedRate2: event.target.value,
                                            });
                                        }}
                                        onBlur={(event) => {
                                            this.onFeedRateNumberChange(
                                                event,
                                                Number(event.target.value)
                                            );
                                        }}
                                        onKeyDown={(event) => {
                                            event.key === "Enter"
                                                ? this.onFeedRateNumberChange(
                                                      event,
                                                      Number(event.target.value)
                                                  )
                                                : "";
                                        }}
                                    />
                                </Grid>
                                {/* <Grid xs={1}>
                                        <Input value={100} />
                                    </Grid> */}
                            </Grid>
                            <Grid
                                item
                                container
                                spacing={1}
                                alignItems="center"
                            >
                                {/* spindle direction */}
                                <Grid item>
                                    <Typography>Spindle</Typography>
                                </Grid>
                                <Grid item>
                                    <Select
                                        fullWidth
                                        value={this.state.spindle}
                                        onChange={this.handleSpindleChange}
                                    >
                                        <MenuItem value="option1">
                                            Option 1
                                        </MenuItem>
                                        <MenuItem value="option2">
                                            Option 2
                                        </MenuItem>
                                        <MenuItem value="option3">
                                            Option 3
                                        </MenuItem>
                                    </Select>
                                </Grid>
                                <Grid item>
                                    <Typography>Direction</Typography>
                                </Grid>
                                <Grid item>
                                    <Select
                                        fullWidth
                                        value={this.state.direction}
                                        onChange={this.handleDirectionChange}
                                        disabled={
                                            this.state.realTimeStatusDisplay ===
                                            "Run"
                                        }
                                    >
                                        <MenuItem
                                            onClick={handleClockwiseClick}
                                            value="clockwise"
                                        >
                                            Clockwise
                                        </MenuItem>
                                        <MenuItem
                                            onClick={
                                                handleCounterClockwiseClick
                                            }
                                            value="counter-clockwise"
                                        >
                                            Counter-clockwise
                                        </MenuItem>
                                        <MenuItem
                                            onClick={handleDisableSpindleClick}
                                            value="counter-clockwise"
                                        >
                                            Disable
                                        </MenuItem>
                                    </Select>
                                </Grid>
                                {/* <Grid xs>
                                        <Slider />
                                    </Grid>
                                    <Grid xs={1}>
                                        <Input disabled value={100} />
                                    </Grid>
                                    <Grid xs={1}>
                                        <Input value={100} />
                                    </Grid> */}
                            </Grid>
                            <Grid
                                item
                                container
                                spacing={1}
                                alignItems="center"
                            >
                                {/* file */}
                                <Grid item>
                                    <Typography>File</Typography>
                                </Grid>
                                <Grid item xs>
                                    <FormControl
                                        className={
                                            this.props.classes.formControl
                                        }
                                        fullWidth
                                    >
                                        {/* <InputLabel id="g-code-file-input">Run G-code File</InputLabel> */}
                                        <Input
                                            id="g-code-file-input"
                                            style={{
                                                color: app.modal.color,
                                                height: "32px",
                                            }}
                                            inputProps={{
                                                style: {
                                                    color: app.modal.color,
                                                },
                                            }}
                                            value={
                                                this.state.gCodeFilePathDisplay
                                            }
                                            placeholder="Run G-code File"
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <IconButton
                                                        style={{
                                                            padding: "0px",
                                                        }}
                                                        onClick={
                                                            this.selectGCodeFile
                                                        }
                                                        color="primary"
                                                    >
                                                        <SelectFileIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            endAdornment={
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        style={{
                                                            padding: "0px",
                                                        }}
                                                        onClick={
                                                            this.uploadGCodeFile
                                                        }
                                                        color="primary"
                                                        disabled={
                                                            !this.state
                                                                .gCodeFilePath
                                                        }
                                                    >
                                                        <ExecuteIcon />
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            disableUnderline
                                            readOnly
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item>
                                    <Typography>Manual Entry</Typography>
                                </Grid>
                                <Grid item xs>
                                    {getManualEntryRow(this)}
                                </Grid>
                            </Grid>
                            <Grid item container justify="space-between">
                                {/* presets */}
                                <Grid item>
                                    <PositionPreset
                                        home
                                        ref={this.homePresetRef}
                                        editParentState={() => {
                                            this.setState({ isHome: true });
                                        }}
                                        disabled={
                                            this.state.realTimeStatusDisplay ===
                                            "Run"
                                        }
                                    >
                                        Home
                                    </PositionPreset>
                                </Grid>
                                <Grid item>
                                    <PositionPreset
                                        ref={this.preset1Ref}
                                        units={this.state.units}
                                        getPosition={this.get_position}
                                        disabled={
                                            this.state.realTimeStatusDisplay ===
                                            "Run"
                                        }
                                    >
                                        1
                                    </PositionPreset>
                                </Grid>
                                <Grid item>
                                    <PositionPreset
                                        ref={this.preset2Ref}
                                        units={this.state.units}
                                        getPosition={this.get_position}
                                        disabled={
                                            this.state.realTimeStatusDisplay ===
                                            "Run"
                                        }
                                    >
                                        2
                                    </PositionPreset>
                                </Grid>
                                <Grid item>
                                    <PositionPreset
                                        ref={this.preset3Ref}
                                        units={this.state.units}
                                        getPosition={this.get_position}
                                        disabled={
                                            this.state.realTimeStatusDisplay ===
                                            "Run"
                                        }
                                    >
                                        3
                                    </PositionPreset>
                                </Grid>
                                <Grid item>
                                    <PositionPreset
                                        ref={this.preset4Ref}
                                        units={this.state.units}
                                        getPosition={this.get_position}
                                        disabled={
                                            this.state.realTimeStatusDisplay ===
                                            "Run"
                                        }
                                    >
                                        4
                                    </PositionPreset>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </ItemPanel>
        );
    }
}

export default withStyles(styles)(JoggingPanel);
