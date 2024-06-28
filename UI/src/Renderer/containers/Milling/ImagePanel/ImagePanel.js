import React, { useState } from "react";
import { withStyles, Grid, Dialog, Button } from "@material-ui/core";
import app from "app";
import ItemPanel from "../../../components/ItemPanel/ItemPanel";

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

const ImagePanel = (props) => {
    const [zoom, setZoom] = useState(false);

    function getImageButton(zoom) {
        return (
            <Button
                className={"image-button"}
                style={{ width: "100%", height: "100%", padding: "0px" }}
                onClick={() => {
                    setZoom(zoom);
                }}
            >
                <img
                    key={Date.now()}
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                    src={`data:image/jpeg;base64,${props.selectedStep.Image}`}
                    alt={""}
                />
            </Button>
        );
    }

    function getDisplay() {
        if (zoom === true) {
            return (
              <>
                <Dialog
                    open={zoom}
                    aria-labelledby="form-dialog-title"
                    maxWidth="md"
                    onClose={() => {
                        setZoom(false);
                    }}
                    fullWidth
                >
                    {getImageButton(false)}
                </Dialog>
                {getImageButton(true)}
              </>
            );
        } else {
            return getImageButton(true);
        }
    }

    return (
        <ItemPanel>
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
                        style={{ width: "100%", height: "50vh" }}
                    >
                        {getDisplay()}
                    </Grid>
                </Grid>
            </div>
        </ItemPanel>
    );
};

export default withStyles(styles)(ImagePanel);
