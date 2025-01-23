import React, { useEffect, useState, useRef } from "react";
import ItemPanel from "../ItemPanel/ItemPanel";
import { FormControl, Grid, IconButton, Input, InputAdornment, withStyles } from "@material-ui/core";
import app from "app";
import Raw from "../ImageRaw/Raw";
import { ipcRenderer } from "electron";
import Timer from "../Timer/Timer";
import SendIcon from "@material-ui/icons/Send";
import SelectFileIcon from "@material-ui/icons/Attachment";

const styles = (theme) => ({
    root: {
        width: "100%",
        height: "100%",
    },
    gcodes: {
        width: "100%",
        height: "100%", // Ensures it fills the parent
        boxSizing: "border-box", // Prevents borders and padding from overflowing
        backgroundColor: app.milling.gcodes.background,
        position: "relative",
        border: app.milling.gcodes.border,
        color: app.milling.gcodes.color,
        overflowY: "auto",
    },
});

const TerminalPanel = (props) => {
    const [readWrites, setReadWrites] = useState([]);
    const [seconds, setSeconds] = useState(0);
    const [manualEntry, setManualEntry] = useState("");
    const [realTimeStatus, setRealTimeStatus] = useState({});
    const [realTimeStatusDisplay, setRealTimeStatusDisplay] = useState("");
    const [entryHistory, setEntryHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [gCodeFilePathDisplay, setGCodeFileDisplayPath] = useState("");
    const [gCodeFilePath, setGCodeFilePath] = useState("");
    const gcodeEnd = useRef(null);
    const manual_entry_ref = useRef(null);
    const prevProps = useRef();
    const focusedInput = useRef();
    const outputPanelHeight = props.imagePanelOpen ? "30vh" : "75vh";

    const executeCommand = () => {
        manual_entry_ref.current.focus();
        const command = manual_entry_ref.current.value;

        let history = entryHistory.slice();
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
        
        setManualEntry("");
        setEntryHistory(history);
        setHistoryIndex(history.length);

        if (command.trim() === "|") {
            ipcRenderer.send("CNC::ExecuteCommand", command);
        } else {
            ipcRenderer.send("CNC::ExecuteCommand", command);
        }
    }

    const selectGCodeFile = () => {
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
                    setGCodeFilePath(gCodeFilePath);
                    setGCodeFileDisplayPath(gCodeFilePathDisplay);
                }
            );
            ipcRenderer.send("File::GetManualGCodeFileLines", gCodeFilePath);
        });
        ipcRenderer.send("File::OpenGCodeFileDialog");
    }
    
    const getStatusDisplay = (status) => {
        let realTimeStatusDisplay = "";

        if (status && status.state) {
            realTimeStatusDisplay = status.state;
        }

        return realTimeStatusDisplay;
    }

    const uploadGCodeFile = () => {
        if (!gCodeFilePath) {
            return;
        }

        ipcRenderer.once("CNC::UploadGCodeFileResponse", () => {
            setGCodeFilePath("");
            setGCodeFileDisplayPath("");
        });
        ipcRenderer.send("CNC::UploadGCodeFile", gCodeFilePath);
    }

    const updateRealtimeStatus = (event, status) => {
        try {
            const parsed = JSON.parse(status);
            if (parsed.error == null) {
                let status = parsed.status;

                setRealTimeStatus(status);
                setRealTimeStatusDisplay(getStatusDisplay(status));
            }
        } catch (e) {
            console.log(e);
        }
    }

    const keydownListener = (event) => {
        if (focusedInput.current == "manual_entry" && event.key == "Enter") {
            executeCommand();
        }
    }

    useEffect(() => {
        focusedInput.current = props.focusedInput;
    }, [props.focusedInput]);

    useEffect(() => {

        let timerId;

        if (props.milling === true) {
            timerId = setInterval(() => {
                setSeconds((prevCount) => prevCount + 1);
            }, 1000); // Increment every second
        } else {
            setSeconds(0);
        }

        return () => {
            // Clean up the timer when the component unmounts or isTimerActive changes
            if (timerId) {
                clearInterval(timerId);
            }

        };
    }, [props.milling]);

    useEffect(() => {
        prevProps.current = props; // Update prevProps with the current props after every render
    });

    useEffect(() => {
        window.removeEventListener("keydown", keydownListener, true);
        window.addEventListener("keydown", keydownListener, true);
        ipcRenderer.removeListener("Jobs::ReadWrites", updateReadWrites);
        ipcRenderer.on("Jobs::ReadWrites", updateReadWrites);
        ipcRenderer.on("CR_UpdateRealtimeStatus", updateRealtimeStatus)
        return () => {
            window.removeEventListener("keydown", keydownListener, true);
            ipcRenderer.removeListener("Jobs::ReadWrites", updateReadWrites);
            ipcRenderer.removeListener("CR_UpdateRealtimeStatus", updateRealtimeStatus);
        };
    }, []);

    useEffect(() => {
        if (
            prevProps.current &&
            props.selectedStep !== prevProps.current.selectedStep
        ) {
            setReadWrites([]);
        }
    }, [props.selectedStep]);


    function getManualEntryRow(component) {
        if (!props.milling) {
            return (
                <FormControl
                    fullWidth
                >
                    <Input
                        id="manual-entry-input"
                        inputRef={manual_entry_ref}
                        style={{ color: app.modal.color, height: "32px" }}
                        inputProps={{ style: { color: app.modal.color } }}
                        value={manualEntry}
                        placeholder="Manual Entry"
                        onChange={(e) => {
                            setManualEntry(
                                e.currentTarget.value,
                            );
                        }}
                        onFocus={() => {
                            props.setFocusedInput("manual_entry");
                        }}
                        onBlur={() => {
                            props.setFocusedInput("");
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
                                        executeCommand()
                                    }}
                                    color="primary"
                                    disabled={
                                        realTimeStatusDisplay === "Run"
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

    const updateReadWrites = (event, newLines) => {
        if (newLines.length > 0) {
            setReadWrites((prevReadWrites) => [...prevReadWrites, ...newLines]);
        }
    };

    function getDisplay() {
        return (
            <div className={props.classes.gcodes}>
                <Raw
                    selectedStep={props.selectedStep}
                    millingInProgress={props.millingInProgress}
                    history={readWrites.slice()}
                    manualMode={props.manualMode}
                />
            </div>
        );
    }

    function scrollToBottom(component) {
        if (
            props.millingInProgress &&
            gcodeEnd.current != null &&
            !component.state.imageSelected
        ) {
            gcodeEnd.current.scrollIntoView({
                behavior: "auto",
                block: "center",
            });
        }
    }
    const onXClick = () => {
        console.log("Terminal panel close");
        props.setOpenTerminalPanel(false);
    };

    if (props.open) {
        return (
            <ItemPanel
                title="Terminal"
                color="secondary"
                scrollContent
                onXClick={onXClick}
                small
            >
                {getDisplay()}
                {scrollToBottom()}
                {props.milling === true ? (
                    <div
                        style={{
                            width: "100%",
                            padding: "4px",
                            backgroundColor: "black",
                            color: "white",
                        }}
                    >
                        <Timer elapsedSeconds={seconds} />
                    </div>
                ) : (
                    ""
                )}
                <Grid container direction="column">
                    <Grid item xs>
                        <FormControl
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
                                value={gCodeFilePathDisplay}
                                placeholder="Run G-code File"
                                startAdornment={
                                    <InputAdornment position="start">
                                        <IconButton
                                            style={{
                                                padding: "0px",
                                            }}
                                            onClick={selectGCodeFile}
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
                                            onClick={uploadGCodeFile}
                                            color="primary"
                                            disabled={!gCodeFilePath || realTimeStatusDisplay === "Run"}
                                        >
                                            <SendIcon />
                                        </IconButton>
                                    </InputAdornment>
                                }
                                disableUnderline
                                readOnly
                            />
                        </FormControl>
                    </Grid>
                    <Grid item xs>
                        {getManualEntryRow(this)}
                    </Grid>
                </Grid>
            </ItemPanel>
        );
    } else {
        return "";
    }
};

export default withStyles(styles)(TerminalPanel);
