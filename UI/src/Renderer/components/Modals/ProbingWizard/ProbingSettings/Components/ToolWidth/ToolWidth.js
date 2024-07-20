import React from "react";
import { Grid, TextField, Typography, withStyles } from "@material-ui/core";


const styles = {
    xyzTextField: { width: "100px" },
    xyzOffset: { width: "80px" },
    xyzLabelMargin: { marginRight: "8px" },
};

const ToolWidth = (props) => {
    if (props.featureType != "surface") {
        return (
            <Grid container item>
                <Grid item xs={4}>
                    <Typography>Tool Width</Typography>
                </Grid>
                <Grid item xs>
                    <TextField
                        value={props.toolWidth}
                        onChange={(event) => {
                            props.setToolWidth(event.target.value);
                        }}
                        fullWidth
                    />
                </Grid>
            </Grid>
        );
    } else {
        return "";
    }
};

export default withStyles(styles)(ToolWidth);