import React from "react";
import MachineJogging from "./MachineJogging/MachineJogging";
import ItemPanel from "../../../ItemPanel/ItemPanel";
import { Grid, Typography } from "@material-ui/core";
import ProbingManager from "../ProbingManager/ProbingManager";

const ProbingPanel = (props) => {
    const GetInstructionText = () => {
        if (
            (props.featureType === "rectangleProtrusion" ||
                props.featureType === "circleProtrusion") &&
            props.locationType != "corner"
        ) {
            return "Please use the jogging tool to jog the tool to the rough center of the protrusion. Jog the tool tip to be between 5mm and 10mm from the surface.";
        } else if (
            props.featureType === "rectangleProtrusion" &&
            props.locationType === "corner"
        ) {
            return "Please use the jogging tool to jog the tool to the tip of the corner. Jog the tool tip to be between 5mm and 10mm from the surface.";
        } else if (
            props.featureType === "circlePocket" ||
            props.featureType === "rectanglePocket"
        ) {
            return "Please use the jogging tool to jog the tool to the rough center of the pocket. Jog the tool tip to be between 5mm and 10mm from the top of the pocket. Do not jog the tool into the pocket.";
        } else if (props.featureType === "surface") {
            return (
                "Jog the spindle over the surface you wish to probe. Place the tip of the tool between 5mm and 10mm away from the surface."
            )
        } else {
            return ""
        }
    };

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
                <ProbingManager
                    startProbing={props.startProbing}
                    featureType={props.featureType}
                    toolWidth={props.toolWidth}
                    locationType={props.locationType}
                    probingType={props.probingType}
                    toolUnits={props.toolUnits}
                    wcs={props.wcs}
                    xChecked={props.xChecked}
                    yChecked={props.yChecked}
                    zChecked={props.zChecked}
                    probeXSide={props.probeXSide}
                    probeYSide={props.probeYSide}
                    probeCorner={props.probeCorner}
                    probeZ={props.probeZ}
                    featureDiameter={props.featureDiameter}
                    featureLength={props.featureLength}
                    featureWidth={props.featureWidth}
                    xOffset={props.xOffset}
                    yOffset={props.yOffset}
                    zOffset={props.zOffset}
                />
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
