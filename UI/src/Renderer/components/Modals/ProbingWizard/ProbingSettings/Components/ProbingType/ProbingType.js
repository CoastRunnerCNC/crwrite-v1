import React from "react";
import { Grid, MenuItem, Select, Typography, withStyles } from "@material-ui/core";


const styles = {
    xyzTextField: { width: "100px" },
    xyzOffset: { width: "80px" },
    xyzLabelMargin: { marginRight: "8px" },
};

const ProbingType = (props) => {
    const onChangeProbingType = (event) => {
        props.setProbingType(event.target.value);
    };
    return (
        <Grid container item>
            <Grid item xs={4}>
                <Typography>Probing Type</Typography>
            </Grid>
            <Grid item xs>
                <Select
                    value={props.probingType}
                    onChange={onChangeProbingType}
                    fullWidth
                >
                    <MenuItem value="electrical">Electrical</MenuItem>
                    <MenuItem disabled value="manual">
                        Manual
                    </MenuItem>
                </Select>
            </Grid>
        </Grid>
    );
};

export default withStyles(styles)(ProbingType);