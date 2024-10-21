import React, { useEffect, useState, useRef } from "react";
import ImageRaw from "../../../components/ImageRaw/ImageRaw";
import ItemPanel from "../../../components/ItemPanel/ItemPanel";
import { withStyles } from "@material-ui/core";
import app from "app";
import Raw from "../../../components/ImageRaw/Raw";
import { Grid } from "@material-ui/core";
import { ipcRenderer } from "electron";
import Timer from "../../../components/Timer/Timer";

const styles = (theme) => ({
    root: {
        width: "100%",
        height: "100%",
    },
    gcodes: {
        width: "100%",
        height: "100%",
        backgroundColor: app.milling.gcodes.background,
        position: "relative",
        border: app.milling.gcodes.border,
        color: app.milling.gcodes.color,
        overflowY: "auto",
    },
});

const MachineOutputPanel = (props) => {
    const [readWrites, setReadWrites] = useState([]);
    const [seconds, setSeconds] = useState(0);
    const gcodeEnd = useRef(null);
    const prevProps = useRef();
    const outputPanelHeight = props.imagePanelOpen ? "30vh" : "75vh";

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
        ipcRenderer.removeListener("Jobs::ReadWrites", updateReadWrites);
        ipcRenderer.on("Jobs::ReadWrites", updateReadWrites);

        return () => {
            ipcRenderer.removeListener(
                "Jobs::ReadWrites",
                updateReadWrites
            );
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

    if (props.open) {
        return (
            <ItemPanel
                title="Machine Output"
                color="secondary"
                scrollContent
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
            </ItemPanel>
        );
    } else {
        return "";
    }
};

export default withStyles(styles)(MachineOutputPanel);
