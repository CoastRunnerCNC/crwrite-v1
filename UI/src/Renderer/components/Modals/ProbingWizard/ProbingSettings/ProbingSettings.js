import React, { useState } from "react";
import ItemPanel from "../../../ItemPanel/ItemPanel";
import {
    Grid,
    Select,
    MenuItem,
    TextField,
    Checkbox,
    Typography,
} from "@material-ui/core";
import FeatureSizes from "../FeatureSizes/FeatureSizes";

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
                    }}
                    alignContent="center"
                >
                    <Grid item xs={10}>
                        <Grid container>
                            <Grid item>
                                <Typography>Probe Where</Typography>
                            </Grid>
                            <Grid item>
                                <Select
                                    labelId="probeWhere"
                                    value={probeWhere}
                                    onChange={onChangeProbeWhere}
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
                    </Grid>

                    <Grid item xs={10}>
                        <Grid container>
                            <Grid item>
                                <Typography>Location Details</Typography>
                            </Grid>
                            <Grid item>
                                <TextField />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={10}>
                        <Grid container>
                            <Grid item>
                                <Typography>Probing Type</Typography>
                            </Grid>
                            <Grid item>
                                <Select
                                    value={probingType}
                                    onChange={onChangeProbingType}
                                >
                                    <MenuItem value="electrical">
                                        Electrical
                                    </MenuItem>
                                    <MenuItem value="manual">Manual</MenuItem>
                                </Select>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={10}>
                        <Grid container style={{ width: "100%" }}>
                            <Grid item>
                                <Typography>Tool Width</Typography>
                            </Grid>
                            <Grid item>
                                <TextField />
                            </Grid>
                            <Grid item>
                                <Typography>Units</Typography>
                            </Grid>
                            <Grid item>
                                <Select
                                    labelId="toolUnits"
                                    value={toolUnits}
                                    onChange={onChangeToolUnits}
                                >
                                    <MenuItem value="mm">MM</MenuItem>
                                    <MenuItem value="inches">Inches</MenuItem>
                                </Select>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Grid container>
                            <Grid item>
                                <Typography>Target WCS</Typography>
                            </Grid>
                            <Grid item>
                                <Select
                                    labelId="target-wcs"
                                    value={wcs}
                                    onChange={onChangeWcs}
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
                    </Grid>
                    <Grid item xs={10}>
                        <Grid container>
                            <Grid item>
                                <Typography>Axis Selection</Typography>
                            </Grid>
                            <Grid item>
                                <Grid container>
                                    <Grid item>
                                        <Grid container>
                                            <Grid item>
                                                <Typography>X</Typography>
                                            </Grid>
                                            <Grid item>
                                                <Checkbox value="checkedX" />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item>
                                        <Grid container>
                                            <Grid item>
                                                <Typography>Y</Typography>
                                            </Grid>
                                            <Grid item>
                                                <Checkbox value="checkedY" />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item>
                                        <Grid container>
                                            <Grid item>
                                                <Typography>Z</Typography>
                                            </Grid>
                                            <Grid item>
                                                <Checkbox value="checkedZ" />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={10}>
                        <FeatureSizes shape="circle" />
                    </Grid>
                    <Grid item xs={10}>
                        <Typography>Additional Offset</Typography>
                        <Grid container>
                            <Grid item>
                                <Grid container>
                                    <Grid item>
                                        <Typography>X</Typography>
                                    </Grid>
                                    <Grid item>
                                        <TextField />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Grid container>
                                    <Grid item>
                                        <Typography>Y</Typography>
                                    </Grid>
                                    <Grid item>
                                        <TextField />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Grid container>
                                    <Grid item>
                                        <Typography>Z</Typography>
                                    </Grid>
                                    <Grid item>
                                        <TextField />
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

export default ProbingSettings;
