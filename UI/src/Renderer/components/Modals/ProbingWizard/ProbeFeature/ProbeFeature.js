import React, { useState } from "react";
import ItemPanel from "../../../ItemPanel/ItemPanel";
import { Grid, Select, MenuItem } from "@material-ui/core";
import CustomInputLabel from "../../Shuttle/CustomInputLabel/CustomInputLabel";

const ProbeFeature = (props) => {
    const onFeatureChange = (event) => {
        props.setFeatureType(event.target.value);
    };

    return (
        <ItemPanel small title="Probe Feature">
            <Grid container alignContent="center" direction="column">
                <Grid item xs={4}>
                    <Select
                        labelId="probe-feature"
                        value={props.featureType}
                        onChange={onFeatureChange}
                        fullWidth
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
                <Grid item>
                    <Grid container>
                        <Grid item>
                            <CustomInputLabel>Probe Feature</CustomInputLabel>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </ItemPanel>
    );
};

export default ProbeFeature;
