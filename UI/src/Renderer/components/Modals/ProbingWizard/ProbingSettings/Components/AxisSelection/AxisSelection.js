import React, { useEffect } from "react";
import { Checkbox, Grid, Typography, withStyles } from "@material-ui/core";

const styles = {
    xyzTextField: { width: "100px" },
    xyzOffset: { width: "80px" },
    xyzLabelMargin: { marginRight: "8px" },
};

const AxisSelection = (props) => {
    useEffect(() => {
        if (props.locationType === "midpoint-x") {
            props.setXChecked(true);
            props.setYChecked(false);
            props.setZChecked(false);
        } else if (props.locationType === "midpoint-y") {
            props.setYChecked(true);
            props.setXChecked(false);
            props.setZChecked(false);
        } else if (props.locationType === "midpoint-x-y" || props.locationType === "corner") {
            props.setXChecked(true);
            props.setYChecked(true);
            props.setZChecked(false);
        } 
    }, [props.locationType]);

    useEffect(() => {
        if (props.featureType === "surface") {
            console.log("surface fired!");
            props.setXChecked(false);
            props.setYChecked(false);
            props.setZChecked(true);
        } else if (props.featureType === "circleProtrusion") {
            props.setXChecked(false);
            props.setYChecked(false);
            props.setZChecked(false);
        }
         else if (props.featureType === "rectangleProtrusion") {
            props.setXChecked(false);
            props.setYChecked(false);
            props.setZChecked(false);
        }
    }, [props.featureType]);

    // if (props.featureType != "surface") {
    return (
        <Grid item container alignItems="center">
            <Grid item xs={4}>
                <Typography>Axis Selection:</Typography>
            </Grid>
            <Grid item>
                <Grid container alignItems="center">
                    {props.featureType != "surface" && (
                        <>
                            <Grid item>
                                <Typography>X</Typography>
                            </Grid>
                            <Grid item>
                                <Checkbox
                                    checked={props.xChecked}
                                    value="checkedX"
                                    onChange={(event) => {
                                        if (
                                            props.locationType !=
                                                "midpoint-x" &&
                                            props.locationType != "midpoint-x-y"
                                        ) {
                                            props.setXChecked(!props.xChecked);
                                        }
                                    }}
                                />
                            </Grid>
                            <Grid item>
                                <Typography>Y</Typography>
                            </Grid>
                            <Grid item>
                                <Checkbox
                                    checked={props.yChecked}
                                    value="checkedY"
                                    onChange={(event) => {
                                        if (
                                            props.locationType !=
                                                "midpoint-y" &&
                                            props.locationType != "midpoint-x-y"
                                        ) {
                                            props.setYChecked(!props.yChecked);
                                        }
                                    }}
                                />
                            </Grid>
                        </>
                    )}

                    <Grid item>
                        <Typography>Z</Typography>
                    </Grid>
                    <Grid item>
                        <Checkbox
                            checked={props.zChecked}
                            value="checkedZ"
                            onChange={(event) => {
                                if (props.featureType != "surface") {
                                    props.setZChecked(!props.zChecked);
                                }
                            }}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default withStyles(styles)(AxisSelection);
