import React from "react";
import {
    Grid,
    MenuItem,
    Select,
    TextField,
    Typography,
    withStyles,
} from "@material-ui/core";

const GetInputs = (props) => {
    console.log("toolWidth: " + props.toolWidth);
    if (props.toolWidth === "other") {
        return (
            <>
                <Grid item xs>
                    <TextField
                        value={props.customToolWidth}
                        placeholder="MM"
                        onChange={(event) => {
                            props.setCustomToolWidth(event.target.value);
                        }}
                    />
                </Grid>
            </>
        );
    } else {
        return "";
    }
};

const styles = {
    xyzTextField: { width: "100px" },
    xyzOffset: { width: "80px" },
    xyzLabelMargin: { marginRight: "8px" },
};

const ToolWidth = (props) => {
    if (props.featureType != "surface") {
        return (
            <Grid container item alignItems="center">
                <Grid item xs={4}>
                    <Typography>Tool Width</Typography>
                </Grid>
                <Grid item style={{marginRight: "6px"}}>
                    {/* <TextField
                        value={props.toolWidth}
                        onChange={(event) => {
                            props.setToolWidth(event.target.value);
                        }}
                        fullWidth
                    /> */}
                    <Select
                        value={props.toolWidth}
                        onChange={(event) => {
                                props.setToolWidth(event.target.value);
                                if (event.target.value != "other") {
                                    props.setCustomToolWidth("");
                                }
                        }}
                    >
                        <MenuItem value="0.25">1/4</MenuItem>
                        <MenuItem value="0.1875">3/16</MenuItem>
                        <MenuItem value="0.15625">5/32</MenuItem>
                        <MenuItem value="0.125">1/8</MenuItem>
                        <MenuItem value="0.09375">3/32</MenuItem>
                        <MenuItem value="0.0625">1/16</MenuItem>
                        <MenuItem value="3">3MM</MenuItem>
                        <MenuItem value="4">4MM</MenuItem>
                        <MenuItem value="5">5MM</MenuItem>
                        <MenuItem value="6">6MM</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                    </Select>
                </Grid>
                <GetInputs
                    setCustomToolWidth={props.setCustomToolWidth}
                    customToolWidth={props.customToolWidth}
                    toolWidth={props.toolWidth}
                    setToolWidth={props.setToolWidth}
                />
            </Grid>
        );
    } else {
        return "";
    }
};

export default withStyles(styles)(ToolWidth);
