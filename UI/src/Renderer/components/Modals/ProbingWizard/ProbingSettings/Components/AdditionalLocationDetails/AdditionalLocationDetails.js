import React from "react";
import { Grid, MenuItem, Select, Typography, withStyles } from "@material-ui/core";

const styles = {
    xyzTextField: { width: "100px" },
    xyzOffset: { width: "80px" },
    xyzLabelMargin: { marginRight: "8px" },
};

const AdditionalLocationDetails = (props) => {
    if (
        (props.featureType === "rectanglePocket" ||
            props.featureType === "circlePocket") &&
        props.zChecked
    ) {
        return (
            <Grid container item>
                <Grid item xs={4}>
                    <Typography>Location Details</Typography>
                </Grid>
                <Grid item xs>
                    <Select
                        onChange={(event) => {
                            props.setProbeZ(event.target.value);
                        }}
                        fullWidth
                        value={props.probeZ}
                    >
                        <MenuItem value="top">Probe Z top of pocket</MenuItem>
                        <MenuItem value="bottom">
                            Probe z bottom of pocket
                        </MenuItem>
                    </Select>
                </Grid>
            </Grid>
        );
    } else {
        return "";
    }
};

export default withStyles(styles)(AdditionalLocationDetails);