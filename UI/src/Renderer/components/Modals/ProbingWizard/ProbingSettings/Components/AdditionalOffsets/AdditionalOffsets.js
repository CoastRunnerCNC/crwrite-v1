import React from "react";
import { Grid, TextField, Typography, withStyles } from "@material-ui/core";

const styles = {
    xyzTextField: { width: "100px" },
    xyzOffset: { width: "80px" },
    xyzLabelMargin: { marginRight: "8px" },
};

const AdditionalOffsets = (props) => {
    return (
        <Grid item>
            <Typography>Additional Offset:</Typography>
            <Grid container justify="space-between">
                {props.featureType != "surface" && (
                    <>
                        <Grid item>
                            <Grid container>
                                <Grid
                                    item
                                    className={props.classes.xyzLabelMargin}
                                >
                                    <Typography>X</Typography>
                                </Grid>
                                <Grid item>
                                    <TextField
                                        value={props.xOffset}
                                        placeholder="MM"
                                        onChange={(event) => {
                                            props.setXOffset(
                                                event.target.value
                                            );
                                        }}
                                        className={props.classes.xyzOffset}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid container>
                                <Grid
                                    item
                                    className={props.classes.xyzLabelMargin}
                                >
                                    <Typography>Y</Typography>
                                </Grid>
                                <Grid item>
                                    <TextField
                                        value={props.yOffset}
                                        placeholder="MM"
                                        onChange={(event) => {
                                            props.setYOffset(
                                                event.target.value
                                            );
                                        }}
                                        className={props.classes.xyzOffset}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </>
                )}
                <Grid item>
                    <Grid container>
                        <Grid item className={props.classes.xyzLabelMargin}>
                            <Typography>Z</Typography>
                        </Grid>
                        <Grid item>
                            <TextField
                                value={props.zOffset}
                                placeholder="MM"
                                onChange={(event) => {
                                    props.setZOffset(event.target.value);
                                }}
                                className={props.classes.xyzOffset}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default withStyles(styles)(AdditionalOffsets);