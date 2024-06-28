import React, { useState } from "react";
import ItemPanel from "../../../ItemPanel/ItemPanel";
import { Grid, Select, MenuItem, Typography } from "@material-ui/core";
import CustomInputLabel from "../../Shuttle/CustomInputLabel/CustomInputLabel";

const ProbeFeature = (props) => {
    const onFeatureChange = (event) => {
        props.setFeatureType(event.target.value);
    };

    return (
        <ItemPanel small title="Probe Feature">
            <Grid container alignContent="center">
                <Grid item>
                    <Typography>Probe Feature</Typography>
                </Grid>
                <Grid item xs={4}>
                    <Select
                        labelId="probe-feature"
                        value={props.featureType}
                        onChange={onFeatureChange}
                        disabled={props.probingActive}
                    >
                        <MenuItem value="surface">Surface (Z Only)</MenuItem>
                        <MenuItem value="circlePocket">
                            Circle Pocket / Bore
                        </MenuItem>
                        <MenuItem value="rectanglePocket">
                            Rectangle Pocket
                        </MenuItem>
                        <MenuItem value="circleProtrusion">
                            Circle Protrusion
                        </MenuItem>
                    </Select>
                </Grid>
            </Grid>
        </ItemPanel>
    );
};

export default ProbeFeature;
