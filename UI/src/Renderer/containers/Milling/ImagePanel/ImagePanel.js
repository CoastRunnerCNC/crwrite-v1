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
            // <Button
            //     style={{padding: "0px" }}

            // >
            <img
                key={Date.now()}
                style={{ maxHeight: "100%", maxWidth: "100%", justifySelf: "center" }}
                src={`data:image/jpeg;base64,${props.selectedStep.Image}`}
                alt={""}
                onClick={() => {
                    setZoom(zoom);
                }}
            />
            // </Button>
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

    if (props.open) {
        return (
            <ItemPanel title="Image" small>
                {getDisplay()}
            </ItemPanel>
        );
    } else {
        return "";
    }
};

export default withStyles(styles)(ImagePanel);
