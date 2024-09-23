import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
    Popper,
    Grow,
    Paper,
    ClickAwayListener,
    MenuList,
    MenuItem,
    Box,
    Tooltip,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import {
    AppBar,
    Button,
    Grid,
    Select,
    TextField,
    Toolbar,
    Typography,
    LinearProgress,
    Slider,
} from "@material-ui/core";
import { ipcRenderer, shell } from "electron";
import Status from "../Status";
import Settings from "../Modals/Settings";
import CNCChooser from "../Modals/CNCChooser";
import Support from "../Support";
import Shuttle from "../Modals/Shuttle";
import app from "app";
import Feedrate from "../Feedrate";
import ViewLogs from "../Modals/ViewLogs";
import SupportCenter from "../Support/SupportCenter";
import Alert from "../Modals/Alert";

const styles = (theme) => ({
    root: {
        //marginBottom: theme.spacing(3),
        // flexGrow: 1
        marginBottom: 19,
    },
    appBar: {
        top: "auto",
        // height: "78px",
        bottom: 0,
        backgroundImage: `url(${app.toolbar.backgroundPhoto})`,
        backgroundColor: "black",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: "none",
        borderTop: "1px solid black",
    },
    toolBar: {
        padding: "8px",
    },
    right: {
        float: "right",
    },
    connectionArea: {
        display: "flex",
        flexDirection: "row",
    },
    websiteLink: {
        color: "black",
    },
    largeSections: {
        backgroundColor: "#F6F6F6",
        height: "66px",
        paddingLeft: "8px",
        paddingRight: "8px",
    },
    smallSections: {
        backgroundColor: "#F6F6F6",
        height: "29px",
        paddingLeft: "8px",
        paddingRight: "8px",
    },
    machineCoordinates: {
        width: "100px",
    },
    buttons: {
        height: "20px",
        fontSize: "12px",
        border: "1px solid black",
        boxShadow: "1px 1px 0px 0px black",
        padding: "0px",
        borderRadius: "0px",
    },
    rowItemSpacing: {
        marginLeft: "10px",
    },
    columnItemSpacing: {
        marginBottom: "8px",
    },
});

const MachineSVG = () => {
    return (
        <svg
            width="65px"
            viewBox="0 0 68 42"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M2.6 2.28C2.6 1.83196 2.6 1.60794 2.68719 1.43681C2.76389 1.28628 2.88628 1.16389 3.03681 1.08719C3.20794 1 3.43196 1 3.88 1H65.72C66.168 1 66.3921 1 66.5632 1.08719C66.7137 1.16389 66.8361 1.28628 66.9128 1.43681C67 1.60794 67 1.83196 67 2.28V39.72C67 40.168 67 40.3921 66.9128 40.5632C66.8361 40.7137 66.7137 40.8361 66.5632 40.9128C66.3921 41 66.168 41 65.72 41H3.88C3.43196 41 3.20794 41 3.03681 40.9128C2.88628 40.8361 2.76389 40.7137 2.68719 40.5632C2.6 40.3921 2.6 40.168 2.6 39.72V2.28Z"
                fill="#F6F6F6"
            />
            <path
                d="M6.6 1H63V32.92C63 33.368 63 33.5921 62.9128 33.7632C62.8361 33.9137 62.7137 34.0361 62.5632 34.1128C62.3921 34.2 62.168 34.2 61.72 34.2H7.88C7.43196 34.2 7.20794 34.2 7.03681 34.1128C6.88628 34.0361 6.76389 33.9137 6.68719 33.7632C6.6 33.5921 6.6 33.368 6.6 32.92V1Z"
                fill="#F6F6F6"
            />
            <path
                d="M1 4.68C1 4.23196 1 4.00794 1.08719 3.83681C1.16389 3.68628 1.28628 3.56389 1.43681 3.48719C1.60794 3.4 1.83196 3.4 2.28 3.4H2.6V7H2.28C1.83196 7 1.60794 7 1.43681 6.91281C1.28628 6.83611 1.16389 6.71372 1.08719 6.56319C1 6.39206 1 6.16804 1 5.72V4.68Z"
                fill="#F6F6F6"
            />
            <path
                d="M2.6 2.28C2.6 1.83196 2.6 1.60794 2.68719 1.43681C2.76389 1.28628 2.88628 1.16389 3.03681 1.08719C3.20794 1 3.43196 1 3.88 1H65.72C66.168 1 66.3921 1 66.5632 1.08719C66.7137 1.16389 66.8361 1.28628 66.9128 1.43681C67 1.60794 67 1.83196 67 2.28V39.72C67 40.168 67 40.3921 66.9128 40.5632C66.8361 40.7137 66.7137 40.8361 66.5632 40.9128C66.3921 41 66.168 41 65.72 41H3.88C3.43196 41 3.20794 41 3.03681 40.9128C2.88628 40.8361 2.76389 40.7137 2.68719 40.5632C2.6 40.3921 2.6 40.168 2.6 39.72V2.28Z"
                stroke="black"
            />
            <path
                d="M6.6 1H63V32.92C63 33.368 63 33.5921 62.9128 33.7632C62.8361 33.9137 62.7137 34.0361 62.5632 34.1128C62.3921 34.2 62.168 34.2 61.72 34.2H7.88C7.43196 34.2 7.20794 34.2 7.03681 34.1128C6.88628 34.0361 6.76389 33.9137 6.68719 33.7632C6.6 33.5921 6.6 33.368 6.6 32.92V1Z"
                stroke="black"
            />
            <path
                d="M1 4.68C1 4.23196 1 4.00794 1.08719 3.83681C1.16389 3.68628 1.28628 3.56389 1.43681 3.48719C1.60794 3.4 1.83196 3.4 2.28 3.4H2.6V7H2.28C1.83196 7 1.60794 7 1.43681 6.91281C1.28628 6.83611 1.16389 6.71372 1.08719 6.56319C1 6.39206 1 6.16804 1 5.72V4.68Z"
                stroke="black"
            />
        </svg>
    );
};

const GuidedModeSVG = () => {
    return (
        <svg
            width="44"
            height="40"
            viewBox="0 0 44 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x="8.52582"
                y="0.5"
                width="22.4783"
                height="21.6087"
                stroke="black"
            />
            <rect
                x="2.05844"
                y="22.2391"
                width="40.7391"
                height="12.0435"
                stroke="black"
            />
            <rect
                x="1.24323"
                y="22.2391"
                width="36.3913"
                height="17.2609"
                fill="#F6F6F6"
                stroke="black"
            />
            <rect
                x="5.69974"
                y="22.2391"
                width="27.6957"
                height="5.08696"
                stroke="black"
            />
            <rect
                x="1.20245"
                y="22.2391"
                width="36.3913"
                height="2.47826"
                stroke="black"
            />
            <rect
                x="1.21603"
                y="22.2391"
                width="36.3913"
                height="9.43478"
                stroke="black"
            />
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M18.0259 5.21741H21.5041V6.08697H18.0259V5.21741ZM17.1562 5.21742H15.4171V6.08699H17.1562V5.21742ZM18.8954 7.8261H15.4172V8.69567H18.8954V7.8261ZM15.4172 10.4348H19.765V11.3044H15.4172V10.4348ZM22.3737 13.9131V13.0435H15.4172V13.9131H22.3737ZM15.4172 15.6522H19.765V16.5218H15.4172V15.6522ZM24.9824 10.4348H20.6346V11.3044H24.9824V10.4348ZM22.3737 7.8261H19.765V8.69567H22.3737V7.8261ZM22.3737 5.21741H24.9824V6.08697H22.3737V5.21741ZM24.9824 7.8261H23.2433V8.69567H24.9824V7.8261ZM23.2433 13.0435H24.9824V13.9131H23.2433V13.0435ZM24.9824 15.6522H20.6346V16.5218H24.9824V15.6522Z"
                fill="black"
            />
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M11.0694 2.6087H11.939V3.47827H11.0694V2.6087ZM11.0693 5.21745H11.9389V6.08702H11.0693V5.21745ZM11.9389 7.82615H11.0693V8.69571H11.9389V7.82615ZM11.0693 10.4348H11.9389V11.3044H11.0693V10.4348ZM11.9389 13.0435H11.0693V13.9131H11.9389V13.0435ZM11.0693 15.6522H11.9389V16.5218H11.0693V15.6522ZM11.9389 18.2609H11.0693V19.1305H11.9389V18.2609Z"
                fill="black"
            />
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M28.4606 2.6087H29.3302V3.47827H28.4606V2.6087ZM28.4607 5.21745H29.3303V6.08702H28.4607V5.21745ZM29.3303 7.82615H28.4607V8.69571H29.3303V7.82615ZM28.4607 10.4348H29.3303V11.3044H28.4607V10.4348ZM29.3303 13.0435H28.4607V13.9131H29.3303V13.0435ZM28.4607 15.6522H29.3303V16.5218H28.4607V15.6522ZM29.3303 18.2609H28.4607V19.1305H29.3303V18.2609Z"
                fill="black"
            />
            <rect
                x="4.98233"
                y="35.6522"
                width="0.869565"
                height="0.869565"
                fill="black"
            />
        </svg>
    );
};

const ManualModeSVG = () => {
    return (
        <svg
            width="65"
            height="42"
            viewBox="0 0 40 42"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M19.089 1L0.869568 20.3548L20.3037 41L38.5231 21.6452L19.089 1Z"
                stroke="black"
            />
            <path
                d="M29.4133 19.0645L35.4865 25.5161V33.258H33.0572V31.9677H23.9475L22.7329 30.6774H21.5182L17.8743 26.8064V25.5161L19.089 24.2257V22.9354L22.7329 19.0645H29.4133Z"
                fill="#F6F6F6"
            />
            <path
                d="M19.089 24.2257V22.9354L22.7329 19.0645H29.4133L35.4865 25.5161V33.258H33.0572V31.9677H23.9475L22.7329 30.6774H21.5182L17.8743 26.8064V25.5161M19.089 24.2257H21.5182M19.089 24.2257L17.8743 25.5161M21.5182 24.2257L22.7329 22.9354H23.9475L25.1621 24.2257V25.5161M21.5182 24.2257V25.5161L22.7329 26.8064H23.9475L25.1621 25.5161M25.1621 25.5161H30.628M17.8743 25.5161H14.2304"
                stroke="black"
            />
            <rect
                x="35.4866"
                y="24.871"
                width="3.64389"
                height="10.3226"
                fill="black"
            />
            <rect
                x="21.5183"
                y="24.871"
                width="3.64389"
                height="1.29032"
                fill="black"
            />
        </svg>
    );
};

const MillingProgress = (props) => {
    if (true /*milling.state.millingProgress >= 0*/) {
        return (
            <Grid container alignItems="center">
                <Grid item xs>
                    <LinearProgress
                        variant="determinate"
                        style={{ height: "15px" }}
                        value={props.progress}
                    />
                </Grid>
                <Grid item>
                    <Typography
                        style={{ color: "black", marginLeft: "4px" }}
                    ></Typography>
                </Grid>
            </Grid>
        );
    }

    return "";
};

function BottomToolbar(props) {
    const {
        classes,
        status,
        milling,
        firmware,
        set_walkthrough_showing,
        closeOperationsWindow,
        setOperationsWindowOpen,
    } = props;

    const [openControlMenu, setOpenControlMenu] = useState(false);
    const [openConfigMenu, setOpenConfigMenu] = useState(false);
    const [openSupportMenu, setOpenSupportMenu] = useState(false);
    const [units, setUnits] = useState("mm");
    const [settings, setSettings] = useState({});
    const [openSettings, setOpenSettings] = useState(false);
    const [openSupportCenter, setOpenSupportCenter] = useState(false);
    const [realTimeStatus, setRealTimeStatus] = useState({});
    const [feedRate, setFeedRate] = useState(props.feedRate);
    const [openViewLogs, setOpenViewLogs] = useState(false);
    const [millingProgress, setMillingProgress] = useState(-1);
    const [showError, setShowError] = useState(false);
    const [errorTitle, setErrorTitle] = useState("");
    const [errorText, setErrorText] = useState("");
    const buttonControlRef = useRef(null);
    const buttonConfigRef = useRef(null);
    const buttonSupportRef = useRef(null);
    const progressIntervalRef = useRef(null);
    const navigateToMillingRef = useRef(null);
    
    navigateToMillingRef.current = props.navigateToMilling;

    useEffect(() => {
        if (props.feedRate != feedRate) {
            setFeedRate(props.feedRate);
        }
    }, [props.feedRate]);

    const handleClickManualMode = () => {
        props.toggleShuttle();
    };

    const machineConnected = () => {
        if (props.status === 2) {
            return true;
        } else {
            return false;
        }
    };

    const handleUnitsSelect = (event) => {
        console.log(event.target.value);
        ipcRenderer.send(
            "CNC::ExecuteCommand",
            event.target.value === "mm" ? "G21" : "G20"
        );
    };

    function openCNCMillNet() {
        shell.openExternal(app.toolbar.link.url);
    }

    const onControlClick = () => {
        setOpenControlMenu(!openControlMenu);
    };

    const onConfigClick = () => {
        setOpenConfigMenu(!openConfigMenu);
    };

    const onSupportClick = () => {
        setOpenSupportMenu(!openSupportMenu);
    };

    const closeControlMenu = (event, force = false) => {
        if (
            buttonControlRef.current.contains(event.target) &&
            force === false
        ) {
            return;
        }

        setOpenControlMenu(false);
    };

    const closeConfigMenu = (event, force = false) => {
        if (buttonConfigRef.current.contains(event.target) && force === false) {
            return;
        }

        setOpenConfigMenu(false);
    };

    const closeSupportMenu = (event, force = false) => {
        if (
            buttonSupportRef.current.contains(event.target) &&
            force === false
        ) {
            return;
        }

        setOpenSupportMenu(false);
    };

    const convertByUnits = (value) => {
        if (units === "mm") {
            return value;
        } else if (units == "inch") {
            let inches = value / 25.4;
            return inches.toFixed(3);
        }
    };

    const sendMachineCommand = (command) => {};

    const handleRun = () => {
        ipcRenderer.send("CNC::ExecuteCommand", "~");
    };

    const handlePause = () => {
        ipcRenderer.send("CNC::ExecuteCommand", "!");
    };

    const handleStop = () => {
        ipcRenderer.send("Jobs::EmergencyStop");
    };

    const handleClickImage = () => {
        props.toggleImagePanel();
        closeControlMenu({}, true);
    };

    const handleClickProbingWizard = () => {
        props.setOpenProbingWizard(true);
        closeControlMenu({}, true);
    };

    const handleClickHome = () => {
        ipcRenderer.send("CNC::ExecuteCommand", "$H");
        closeControlMenu({}, true);
    };

    const handleClickAutolevel = () => {
        ipcRenderer.send("CNC::ExecuteCommand", "$X");
        ipcRenderer.send("CNC::ExecuteCommand", "$L");
        ipcRenderer.send("CNC::ExecuteCommand", "$HX");
        closeControlMenu({}, true);
    };

    const handleClickClearMemory = () => {
        ipcRenderer.send("CNC::ExecuteCommand", "$X");
        ipcRenderer.send("CNC::ExecuteCommand", "$RST=#");
        closeControlMenu({}, true);
    };

    const handleClickReset = () => {
        ipcRenderer.send("CNC::ExecuteCommand", "$X");
        ipcRenderer.send("CNC::ExecuteCommand", "$RST=*");

        closeControlMenu({}, true);
    };

    const onClickSoftware = () => {
        if (!milling) {
            ipcRenderer.once(
                "Settings::GetSettingsResponse",
                (event, settings) => {
                    closeConfigMenu({}, true);
                    setSettings(settings);
                    setOpenSettings(true);
                }
            );
            ipcRenderer.send("Settings::GetSettings");
        }
    };

    const getFixedValue = () => {
        return units === "mm" ? 3 : 4;
    };

    const get_position = (axis, realTimeStatusObj = realTimeStatus) => {
        if (realTimeStatusObj && realTimeStatusObj.machine_pos) {
            const value = realTimeStatusObj.machine_pos[axis];
            // console.log(value[units].toFixed(getFixedValue()));
            return value[units].toFixed(getFixedValue());
        }

        return "";
    };

    const get_work_pos = (axis, realTimeStatusObj = realTimeStatus) => {
        if (realTimeStatusObj && realTimeStatusObj.work_coordinates) {
            const value = realTimeStatusObj.work_coordinates.work_pos[axis];
            // console.log(value[units].toFixed(getFixedValue()));
            return value[units].toFixed(getFixedValue());
        }

        return "";
    };

    const updateRealtimeStatus = (event, status) => {
        try {
            // console.log(status);
            // console.log(JSON.stringify(status));
            const parsed = JSON.parse(status);
            console.log(parsed);
            console.log("parsed.error: " + parsed.error);
            if (parsed.error == null) {
                let status = parsed.status;
                console.log("state: " + JSON.stringify(status.state));
                setRealTimeStatus(status);
                setUnits(status.parserUnits);
            }
        } catch (e) {
            console.log(e);
        }
    };


    const handleProgressResponse = (event, updatedProgress) => {
        try {
            if (updatedProgress.error != null && !navigateToMillingRef.current) {
                console.log("error set");
                setShowError(true);
                setErrorTitle(updatedProgress.error.title);
                setErrorText(updatedProgress.error.description);
            }
            console.log("updating milling progress");
            console.log(JSON.stringify(updatedProgress));

            if (updatedProgress.milling === false) {
                setMillingProgress(-1);
            } else {
                setMillingProgress(updatedProgress.progress.percentage);
            }
        } catch (e) {
            console.error("handleProgressResponse exception caught");
        }
    };

    useEffect(() => {
        // Set up the interval to send messages
        const interval = setInterval(() => {
            ipcRenderer.send("CNC::GetStatus");
        }, 500);

        // Set up the event listener
        ipcRenderer.removeListener(
            "CR_UpdateRealtimeStatus",
            updateRealtimeStatus
        );
        ipcRenderer.on("CR_UpdateRealtimeStatus", updateRealtimeStatus);

        ipcRenderer.removeListener(
            "Jobs::GetProgressResponse",
            handleProgressResponse
        );
        ipcRenderer.on("Jobs::GetProgressResponse", handleProgressResponse);

        const checkForMillingInterval = setInterval(() => {
            try {
                console.log("state: " + JSON.stringify(realTimeStatus));
                console.log("state: " + realTimeStatus);
            } catch (e) {}

            // if (realTimeStatus && realTimeStatus.state === "milling") {
            if (status === 2 && !progressIntervalRef.current) {
                progressIntervalRef.current = setInterval(() => {
                    ipcRenderer.send("Jobs::GetProgress");
                }, 500);
            }
            // } else {
            //     if (progressIntervalRef.current) {
            //         clearInterval(progressIntervalRef.current);
            //         progressIntervalRef.current = null;
            //         console.log("reseting milling progress");
            //         setMillingProgress(-1);
            //     }
            // }
        }, 2000);
        // Clean up the interval and the event listener on component unmount
        return () => {
            clearInterval(interval);
            clearInterval(checkForMillingInterval);
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
            }
            ipcRenderer.removeAllListeners("CR_UpdateRealtimeStatus");
            ipcRenderer.removeAllListeners("Jobs::GetProgressResponse");
        };
    }, []);

    return (
        <>
            <Alert
                open={showError && !props.navigateToMilling && !props.openShuttle}
                message={errorText}
                yesNo={false}
                onOk={(event) => {
                    setShowError(false);
                }}
                onCancel={(event) => {
                    setShowError(false);
                }}
                title={errorTitle}
            />
            <SupportCenter
                open={openSupportCenter}
                onClose={() => {
                    setOpenSupportCenter(false);
                }}
            />

            <ViewLogs
                open={openViewLogs}
                onClose={() => {
                    setOpenViewLogs(false);
                }}
            />

            <Settings
                open={openSettings}
                settings={settings}
                setOpen={setOpenSettings}
                disabled={milling}
                firmware={firmware}
                firmwareAvailable={props.firmwareAvailable}
                checkFirmwareUpdates={props.checkFirmwareUpdates}
                updateMachineStatus={props.updateMachineStatus}
                updateSetting={props.updateSetting}
            />
            <Box
                style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr 1fr 360px",
                    gridTemplateRows: "1fr 1fr",
                    gridTemplateAreas:
                        '"status mill progress feedrate" "status work progress menus"',
                    gap: "6px",
                    padding: "6px",
                    backgroundColor: "black",
                }}
            >
                <Box
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gridTemplateRows: "2fr 1fr",
                        gridArea: "status",
                        backgroundColor: "white",
                    }}
                >
                    <Box style={{ justifySelf: "center", alignSelf: "center" }}>
                        <MachineSVG />
                    </Box>
                    <Box style={{ justifySelf: "center", alignSelf: "center" }}>
                        <Status status={status} />
                    </Box>
                </Box>
                <Box
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                        gridArea: "mill",
                        backgroundColor: "white",
                        alignItems: "center",
                        gap: "6px",
                    }}
                >
                    <Box style={{ justifySelf: "end" }}>
                        <Typography
                            style={{ color: "black", fontWeight: "bold" }}
                        >
                            Mill
                        </Typography>
                    </Box>
                    <Box>
                        <TextField
                            className={classes.machineCoordinates}
                            disabled
                            value={convertByUnits(
                                get_position("x", realTimeStatus)
                            )}
                        />
                    </Box>
                    <Box>
                        <TextField
                            className={classes.machineCoordinates}
                            disabled
                            value={convertByUnits(
                                get_position("y", realTimeStatus)
                            )}
                        />
                    </Box>
                    <Box>
                        <TextField
                            className={classes.machineCoordinates}
                            disabled
                            value={convertByUnits(
                                get_position("z", realTimeStatus)
                            )}
                        />
                    </Box>
                    <Box>
                        <Select
                            value={units}
                            onChange={handleUnitsSelect}
                            style={{ height: "21.5px", fontWeight: "bold" }}
                        >
                            <MenuItem value="mm">MM</MenuItem>
                            <MenuItem value="inch">INCH</MenuItem>
                        </Select>
                    </Box>
                </Box>
                <Box
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
                        gridArea: "work",
                        backgroundColor: "white",
                        alignItems: "center",
                        gap: "6px",
                    }}
                >
                    <Box style={{ justifySelf: "end" }}>
                        <Typography
                            style={{ color: "black", fontWeight: "bold" }}
                        >
                            Work
                        </Typography>
                    </Box>
                    <Box>
                        <TextField
                            className={classes.machineCoordinates}
                            disabled
                            value={convertByUnits(
                                get_work_pos("x", realTimeStatus)
                            )}
                        />
                    </Box>
                    <Box>
                        <TextField
                            className={classes.machineCoordinates}
                            disabled
                            value={convertByUnits(
                                get_work_pos("y", realTimeStatus)
                            )}
                        />
                    </Box>
                    <Box>
                        <TextField
                            className={classes.machineCoordinates}
                            disabled
                            value={convertByUnits(
                                get_work_pos("z", realTimeStatus)
                            )}
                        />
                    </Box>
                    <Box>
                        <Select
                            value={units}
                            onChange={handleUnitsSelect}
                            style={{ height: "21.5px", fontWeight: "bold" }}
                        >
                            <MenuItem value="mm">MM</MenuItem>
                            <MenuItem value="inch">INCH</MenuItem>
                        </Select>
                    </Box>
                </Box>
                <Box
                    style={{
                        display: "grid",
                        gridTemplateRows: "1fr 1fr",
                        gridArea: "progress",
                        backgroundColor: "white",
                        alignItems: "center",
                        justify: "center",
                        padding: "6px",
                    }}
                >
                    <Box>
                        <MillingProgress progress={millingProgress} />
                    </Box>
                    <Box style={{ alignSelf: "center", justifySelf: "center" }}>
                        <Button
                            className={classes.buttons}
                            style={{ fontWeight: "bold" }}
                            onClick={handleRun}
                        >
                            RUN
                        </Button>
                        <Button
                            className={classes.buttons}
                            style={{ fontWeight: "bold" }}
                            onClick={handlePause}
                        >
                            PAUSE
                        </Button>
                        <Button
                            className={classes.buttons}
                            style={{ fontWeight: "bold" }}
                            onClick={handleStop}
                        >
                            STOP
                        </Button>
                    </Box>
                </Box>
                <Box
                    style={{
                        gridArea: "feedrate",
                        backgroundColor: "white",
                        paddingLeft: "6px",
                        paddingRight: "6px",
                    }}
                >
                    <Slider
                        value={feedRate}
                        step={2}
                        min={30}
                        disabled={
                            props.settings && !props.settings.enable_slider
                        }
                        max={props.settings && props.settings.maxFeedRate}
                        aria-labelledby="label"
                        onChange={(event, value) => {
                            console.log(value);
                            setFeedRate(value);
                        }}
                        onChangeCommitted={(event, value) => {
                            props.updateFeedRate(value);
                        }}
                    />
                </Box>
                <Box style={{ gridArea: "menus", backgroundColor: "white" }}>
                    <Grid
                        container
                        justify="center"
                        alignItems="center"
                        style={{ height: "100%" }}
                    >
                        <Grid item>
                            <Button
                                className={classes.buttons}
                                onClick={onControlClick}
                                ref={buttonControlRef}
                                style={{ fontWeight: "bold" }}
                            >
                                Control
                            </Button>

                            <Popper
                                open={openControlMenu}
                                anchorEl={buttonControlRef.current}
                                transition
                                disablePortal
                            >
                                {({ TransitionProps, placement }) => (
                                    <Grow
                                        {...TransitionProps}
                                        id="menu-list-grow"
                                        style={{
                                            transformOrigin:
                                                placement === "bottom"
                                                    ? "center top"
                                                    : "center bottom",
                                        }}
                                    >
                                        <Paper>
                                            <ClickAwayListener
                                                onClickAway={closeControlMenu}
                                            >
                                                <MenuList>
                                                    <MenuItem
                                                        onClick={
                                                            handleClickImage
                                                        }
                                                    >
                                                        Image
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={
                                                            props.toggleMachineOutputPanel
                                                        }
                                                    >
                                                        Terminal
                                                    </MenuItem>
                                                    {/* <MenuItem className={classes.menuItem} onClick={onClickViewManual.bind(this)}>{ getManualButton() }</MenuItem> */}
                                                    {/* <MenuItem className={classes.menuItem} onClick={onClickVisitSupport.bind(this)}>Visit Helpdesk</MenuItem> */}
                                                    {/* <MenuItem className={classes.menuItem} onClick={onClickOpenDialog.bind(this)}>Contact Us</MenuItem> */}
                                                    <MenuItem onClick={props.toggleJoggingPanel}>Jogging</MenuItem>
                                                    <MenuItem
                                                        onClick={
                                                            handleClickProbingWizard
                                                        }
                                                        disabled={
                                                            props.navigateToMilling
                                                        }
                                                    >
                                                        Probing Wizard
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={
                                                            handleClickManualMode
                                                        }
                                                        disabled={
                                                            !machineConnected()
                                                        }
                                                    >
                                                        Manual Mode
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={
                                                            handleClickHome
                                                        }
                                                        disabled={
                                                            !machineConnected()
                                                        }
                                                    >
                                                        Home
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={
                                                            handleClickAutolevel
                                                        }
                                                        disabled={
                                                            !machineConnected()
                                                        }
                                                    >
                                                        Autolevel
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={
                                                            handleClickReset
                                                        }
                                                        disabled={
                                                            !machineConnected()
                                                        }
                                                    >
                                                        Reset
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={
                                                            handleClickClearMemory
                                                        }
                                                        disabled={
                                                            !machineConnected()
                                                        }
                                                    >
                                                        Clear Memory
                                                    </MenuItem>
                                                </MenuList>
                                            </ClickAwayListener>
                                        </Paper>
                                    </Grow>
                                )}
                            </Popper>
                        </Grid>
                        <Grid item>
                            <Button
                                className={classes.buttons}
                                onClick={onConfigClick}
                                ref={buttonConfigRef}
                                style={{ fontWeight: "bold" }}
                            >
                                Config
                            </Button>

                            <Popper
                                open={openConfigMenu}
                                anchorEl={buttonConfigRef.current}
                                transition
                                disablePortal
                            >
                                {({ TransitionProps, placement }) => (
                                    <Grow
                                        {...TransitionProps}
                                        id="menu-list-grow"
                                        style={{
                                            transformOrigin:
                                                placement === "bottom"
                                                    ? "center top"
                                                    : "center bottom",
                                        }}
                                    >
                                        <Paper>
                                            <ClickAwayListener
                                                onClickAway={closeConfigMenu}
                                            >
                                                <MenuList>
                                                    {/* <MenuItem className={classes.menuItem} onClick={onClickViewManual.bind(this)}>{ getManualButton() }</MenuItem> */}
                                                    {/* <MenuItem className={classes.menuItem} onClick={onClickVisitSupport.bind(this)}>Visit Helpdesk</MenuItem> */}
                                                    {/* <MenuItem className={classes.menuItem} onClick={onClickOpenDialog.bind(this)}>Contact Us</MenuItem> */}
                                                    <Tooltip
                                                        disableHoverListener={
                                                            !milling
                                                        }
                                                        disableFocusListener={
                                                            true
                                                        }
                                                        disableTouchListener={
                                                            true
                                                        }
                                                        title="Disabled while machine is running"
                                                    >
                                                        <MenuItem
                                                            onClick={
                                                                onClickSoftware
                                                            }
                                                        >
                                                            Settings
                                                        </MenuItem>
                                                    </Tooltip>
                                                </MenuList>
                                            </ClickAwayListener>
                                        </Paper>
                                    </Grow>
                                )}
                            </Popper>
                        </Grid>
                        <Grid item>
                            <Button
                                className={classes.buttons}
                                onClick={onSupportClick}
                                ref={buttonSupportRef}
                                style={{ fontWeight: "bold" }}
                            >
                                Support
                            </Button>

                            <Popper
                                open={openSupportMenu}
                                anchorEl={buttonSupportRef.current}
                                transition
                                disablePortal
                            >
                                {({ TransitionProps, placement }) => (
                                    <Grow
                                        {...TransitionProps}
                                        id="menu-list-grow"
                                        style={{
                                            transformOrigin:
                                                placement === "bottom"
                                                    ? "center top"
                                                    : "center bottom",
                                        }}
                                    >
                                        <Paper>
                                            <ClickAwayListener
                                                onClickAway={closeSupportMenu}
                                            >
                                                <MenuList>
                                                    {/* <MenuItem className={classes.menuItem} onClick={onClickViewManual.bind(this)}>{ getManualButton() }</MenuItem> */}
                                                    {/* <MenuItem className={classes.menuItem} onClick={onClickVisitSupport.bind(this)}>Visit Helpdesk</MenuItem> */}
                                                    {/* <MenuItem className={classes.menuItem} onClick={onClickOpenDialog.bind(this)}>Contact Us</MenuItem> */}
                                                    <MenuItem
                                                        onClick={() => {
                                                            setOpenViewLogs(
                                                                true
                                                            );
                                                            closeSupportMenu(
                                                                {},
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        Logs
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={() => {
                                                            setOpenSupportCenter(
                                                                true
                                                            );
                                                            closeSupportMenu(
                                                                {},
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        Contact
                                                    </MenuItem>
                                                    <MenuItem disabled={true}>
                                                        Manual
                                                    </MenuItem>
                                                </MenuList>
                                            </ClickAwayListener>
                                        </Paper>
                                    </Grow>
                                )}
                            </Popper>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </>
    );
}

BottomToolbar.propTypes = {
    classes: PropTypes.object.isRequired,
    status: PropTypes.number.isRequired,
    milling: PropTypes.bool.isRequired,
    set_walkthrough_showing: PropTypes.func.isRequired,
    firmware: PropTypes.object,
};

export default withStyles(styles)(BottomToolbar);
