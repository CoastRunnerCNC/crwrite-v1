import React, { useEffect, useState, useRef } from "react";
import ImageRaw from "../../../components/ImageRaw/ImageRaw";
import ItemPanel from "../../../components/ItemPanel/ItemPanel";
import { withStyles } from "@material-ui/core";
import app from "app";
import Raw from "../../../components/ImageRaw/Raw";
import { Grid } from "@material-ui/core";
import { ipcRenderer } from "electron";

const styles = (theme) => ({
    root: {
        width: "100%",
        height: "100%",
    },
    gcodes: {
        width: "100%",
        height: "calc(100% - 50px)",
        overflow: "auto",
        backgroundColor: app.milling.gcodes.background,
        position: "relative",
        border: app.milling.gcodes.border,
        color: app.milling.gcodes.color,
    },
});

const MachineOutputPanel = (props) => {
    const [readWrites, setReadWrites] = useState([]);
    const gcodeEnd = useRef(null);
    const prevProps = useRef();

    useEffect(() => {
        prevProps.current = props; // Update prevProps with the current props after every render
    });

    useEffect(() => {
        ipcRenderer.removeAllListeners("Jobs::ReadWrites");
        ipcRenderer.on("Jobs::ReadWrites", updateReadWrites);
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

        return () => {
          ipcRenderer.removeAllListeners("Jobs::ReadWrites", updateReadWrites);
      };
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

    return (
        <ItemPanel
            title="Machine Output"
            color="secondary"
            style={{ height: "100%" }}
            small
        >
            <div className={props.classes.root}>
                <Grid container spacing={0}>
                    <Grid item xs={3} />
                    {/* {getButtons(this)} */}
                    <Grid item xs={3} />
                </Grid>
                <Grid
                    container
                    style={{
                        padding: "8px",
                        paddingTop: "15px",
                        width: "100%",
                        height: "100%",
                    }}
                >
                    <Grid
                        id={"image-raw-display"}
                        item
                        xs={12}
                        style={{ width: "100%", height: "30vh" }}
                    >
                        {getDisplay()}
                        {scrollToBottom()}
                    </Grid>
                </Grid>
            </div>
        </ItemPanel>
    );
};

export default withStyles(styles)(MachineOutputPanel);