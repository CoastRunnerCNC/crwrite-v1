import React from "react";
import MachineJogging from "./MachineJogging/MachineJogging";
import ItemPanel from "../../../ItemPanel/ItemPanel";
import { Grid, Typography } from "@material-ui/core";

const ProbingPanel = (props) => {

    const GetInstructionText = () => {
        if ((props.featureType === "rectangleProtrusion" || props.featureType === "circleProtrusion") && props.locationType != "corner") {
            return (
                "Please use the jogging tool to jog the tool to the rough center of the protrusion. Jog the tool tip to be between 5mm and 10mm from the surface."
            );
        }
        else if (props.featureType === "rectangleProtrusion" && props.locationType === "corner") {
            return (
                "Please use the jogging tool to jog the tool to the tip of the corner. Jog the tool tip to be between 5mm and 10mm from the surface."
            );
        }
        else if (props.featureType === "circlePocket" || props.featureType === "rectanglePocket") {
            return (
                "Please use the jogging tool to jog the tool to the rough center of the pocket. Jog the tool tip to be between 5mm and 10mm from the top of the pocket. Do not jog the tool into the pocket."
            );
        }
    }

    return (
        <ItemPanel small title="Settings">
            <Grid
                container
                spacing={2}
                direction="column"
                style={{
                    paddingTop: "16px",
                    paddingBottom: "16px",
                    paddingLeft: "8px",
                    paddingRight: "8px",
                }}
            >
                <MachineJogging />
                <Grid item>
                    <Typography>
                        <GetInstructionText />
                    </Typography>
                </Grid>
            </Grid>
        </ItemPanel>
    );
};

export default ProbingPanel;
