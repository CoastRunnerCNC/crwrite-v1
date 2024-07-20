import React from "react";
import { Grid, MenuItem, Select, Typography, withStyles } from "@material-ui/core";


const styles = {
    xyzTextField: { width: "100px" },
    xyzOffset: { width: "80px" },
    xyzLabelMargin: { marginRight: "8px" },
};

const TargetWCS = (props) => {
    const onChangeWcs = (event) => {
        props.setWcs(event.target.value);
    };
    return (
        <Grid container item>
            <Grid item xs={4}>
                <Typography>Target WCS</Typography>
            </Grid>
            <Grid item xs>
                <Select
                    labelId="target-wcs"
                    value={props.wcs}
                    onChange={onChangeWcs}
                    fullWidth
                >
                    <MenuItem value="G54">G54</MenuItem>
                    <MenuItem value="G55">G55</MenuItem>
                    <MenuItem value="G56">G56</MenuItem>
                    <MenuItem value="G57">G57</MenuItem>
                    <MenuItem value="G58">G58</MenuItem>
                    <MenuItem value="G59">G59</MenuItem>
                </Select>
            </Grid>
        </Grid>
    );
};

export default withStyles(styles)(TargetWCS);