import React from "react";
import { Grid, MenuItem, Select, Typography, withStyles } from "@material-ui/core";

const styles = {
    xyzTextField: { width: "100px" },
    xyzOffset: { width: "80px" },
    xyzLabelMargin: { marginRight: "8px" },
};

const ProbeWhere = (props) => {
    const onChangeProbeWhere = (event) => {
        props.resetDetails();
        props.setLocationType(event.target.value);
    };

    if (props.featureType != "surface") {
        return (
            <Grid container item>
                <Grid item xs={4}>
                    <Typography>Probe Where</Typography>
                </Grid>
                <Grid item xs>
                    <Select
                        labelId="probeWhere"
                        value={props.locationType}
                        onChange={onChangeProbeWhere}
                        fullWidth
                    >
                        {props.getShape() != "circle" && (
                            <MenuItem value="corner">Corner</MenuItem>
                        )}

                        <MenuItem value="midpoint-x">Midpoint X</MenuItem>
                        <MenuItem value="midpoint-y">Midpoint Y</MenuItem>
                        <MenuItem value="midpoint-x-y">Midpoint X&Y</MenuItem>
                    </Select>
                </Grid>
            </Grid>
        );
    } else {
        return "";
    }
};

export default withStyles(styles)(ProbeWhere);