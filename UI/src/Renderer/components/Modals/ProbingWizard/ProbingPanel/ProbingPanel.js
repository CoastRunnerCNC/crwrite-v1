import React from "react";
import MachineJogging from "./MachineJogging/MachineJogging";
import ItemPanel from "../../../ItemPanel/ItemPanel";
import { Grid, Typography } from "@material-ui/core";
import ProbingManager from "../ProbingManager/ProbingManager";

const ProbingPanel = (props) => {
    const GetInstructionText = () => {
        let instructionText = `Please jog the tool to the starting position. Starting position is: `;

        if (
            (props.featureType === "rectangleProtrusion" ||
                props.featureType === "circleProtrusion") &&
            props.locationType != "corner"
        ) {
            instructionText += `above the protrusion, centered in both X and Y. `;
        } else if (
            (props.featureType === "rectangleProtrusion" || props.featureType === "rectanglePocket") &&
            props.locationType === "corner"
        ) {
            instructionText += `directly above the tip of the corner. `;
        } else if (
            props.featureType === "circlePocket" ||
            props.featureType === "rectanglePocket"
        ) {
            instructionText += `above the pocket, centered in both X and Y. `;
        } else if (props.featureType === "surface") {
            instructionText += (
                `anywhere over the surface you wish to probe. `
            )
        } else {
            instructionText += ``
        }
        instructionText += `Notes: Tool should be within (tool length * 1.5, round up) mm of the desired starting position in both X and Y. Starting too far outside this position may cause a crash.`
        if (props.featureType != "circlePocket" && props.featureType != "rectanglePocket") {
            instructionText += ` Please place tool roughly 7mm to 12mm above surface. Too close may cause crashes; too far away may cause probe to fail.`
        }
        else if (props.featureType === "circlePocket" || props.featureType === "rectanglePocket") {
            instructionText += ` Please place tool roughly 7mm to 12mm above pocket. Too far away may cause probe to fail. **Do not jog tool into pocket.**`
        }
        return instructionText;
    };
    console.log("customToolWidth: " + props.customToolWidth);
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
                    toolWidth={props.customToolWidth ? props.customToolWidth : props.toolWidth}
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
                    handleCloseSuccess={props.handleCloseSuccess}
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
