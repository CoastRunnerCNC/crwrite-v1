import React, { useState } from "react";
import ItemPanel from "../../../ItemPanel/ItemPanel";
import {
    Grid,
    Select,
    MenuItem,
    TextField,
    Checkbox,
    Typography,
    withStyles,
} from "@material-ui/core";
import FeatureSizes from "../FeatureSizes/FeatureSizes";

const styles = {
    xyzTextField: { width: "100px" },
    xyzOffset: { width: "80px" },
    xyzLabelMargin: { marginRight: '8px'}
};

const ProbingSettings = (props) => {
    const [probeWhere, setProbeWhere] = useState("");
    const [probingType, setProbingType] = useState("");
    const [toolUnits, setToolUnits] = useState("");
    const [wcs, setWcs] = useState("");

    const onChangeProbeWhere = (event) => {
        setProbeWhere(event.target.value);
    };

    const onChangeProbingType = (event) => {
        setProbingType(event.target.value);
    };

    const onChangeToolUnits = (event) => {
        setToolUnits(event.target.value);
    };

    const onChangeWcs = (event) => {
        setWcs(event.target.value);
    };

    if (!props.probingActive) {
        return (
            <ItemPanel small title="Settings">
                <Grid
                    container
                    spacing={2}
                    direction="column"
                    style={{
                        paddingTop: "16px",
                        paddingBottom: "16px",
                        paddingLeft: '8px',
                        paddingRight: '8px'
                    }}
                >
                    <Grid container item>
                        <Grid item xs={4}>
                            <Typography>Probe Where</Typography>
                        </Grid>
                        <Grid item xs>
                            <Select
                                labelId="probeWhere"
                                value={probeWhere}
                                onChange={onChangeProbeWhere}
                                fullWidth
                            >
                                <MenuItem value="corner">Corner</MenuItem>
                                <MenuItem value="midpoint-x">
                                    Midpoint X
                                </MenuItem>
                                <MenuItem value="midpoint-y">
                                    Midpoint Y
                                </MenuItem>
                                <MenuItem value="midpoint-x-y">
                                    Midpoint X&Y
                                </MenuItem>
                            </Select>
                        </Grid>
                    </Grid>

                    <Grid container item>
                        <Grid item xs={4}>
                            <Typography>Location Details</Typography>
                        </Grid>
                        <Grid item xs>
                            <TextField fullWidth />
                        </Grid>
                    </Grid>
                    <Grid container item>
                        <Grid item xs={4}>
                            <Typography>Probing Type</Typography>
                        </Grid>
                        <Grid item xs>
                            <Select
                                value={probingType}
                                onChange={onChangeProbingType}
                                fullWidth
                            >
                                <MenuItem value="electrical">
                                    Electrical
                                </MenuItem>
                                <MenuItem value="manual">Manual</MenuItem>
                            </Select>
                        </Grid>
                    </Grid>
                    <Grid container item>
                        <Grid item xs={4}>
                            <Typography>Units</Typography>
                        </Grid>
                        <Grid item xs>
                            <Select
                                labelId="toolUnits"
                                value={toolUnits}
                                onChange={onChangeToolUnits}
                                fullWidth
                            >
                                <MenuItem value="mm">MM</MenuItem>
                                <MenuItem value="inches">Inches</MenuItem>
                            </Select>
                        </Grid>
                    </Grid>
                    <Grid container item>
                        <Grid item xs={4}>
                            <Typography>Tool Width</Typography>
                        </Grid>
                        <Grid item xs>
                            <TextField fullWidth />
                        </Grid>
                    </Grid>
                    <Grid container item>
                        <Grid item xs={4}>
                            <Typography>Target WCS</Typography>
                        </Grid>
                        <Grid item xs>
                            <Select
                                labelId="target-wcs"
                                value={wcs}
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
                    <Grid item container alignItems="center">
                        <Grid item xs={4}>
                            <Typography>Axis Selection:</Typography>
                        </Grid>
                        <Grid item>
                            <Grid container alignItems="center">
                                <Grid item>
                                    <Typography>X</Typography>
                                </Grid>
                                <Grid item>
                                    <Checkbox value="checkedX" />
                                </Grid>
                                <Grid item>
                                    <Typography>Y</Typography>
                                </Grid>
                                <Grid item>
                                    <Checkbox value="checkedY" />
                                </Grid>
                                <Grid item>
                                    <Typography>Z</Typography>
                                </Grid>
                                <Grid item>
                                    <Checkbox value="checkedZ" />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item container>
                        <FeatureSizes shape="circle" />
                    </Grid>
                    <Grid item>
                        <Typography>Additional Offset:</Typography>
                        <Grid container justify="space-between">
                            <Grid item>
                                <Grid container>
                                    <Grid item className={props.classes.xyzLabelMargin}>
                                        <Typography>X</Typography>
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                            className={props.classes.xyzOffset}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Grid container>
                                    <Grid item className={props.classes.xyzLabelMargin}>
                                        <Typography>Y</Typography>
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                            className={props.classes.xyzOffset}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Grid container>
                                    <Grid item className={props.classes.xyzLabelMargin}>
                                        <Typography>Z</Typography>
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                            className={props.classes.xyzOffset}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </ItemPanel>
        );
    }
};

export default withStyles(styles)(ProbingSettings);
