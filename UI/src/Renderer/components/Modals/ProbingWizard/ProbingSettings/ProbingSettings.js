import React, { useState } from "react";
import ItemPanel from "../../../ItemPanel/ItemPanel";
import { Grid, Select, MenuItem, TextField, Checkbox } from "@material-ui/core";
import CustomInputLabel from "../../Shuttle/CustomInputLabel/CustomInputLabel";
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
                        <Grid container direction="column">
                            <Grid item>
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
                            <Grid item>
                                <Grid
                                    container
                                    justify="flex-end"
                                    style={{ width: "100%" }}
                                >
                                    <Grid item>
                                        <CustomInputLabel>
                                            Probe Where
                                        </CustomInputLabel>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={10}>
                        {/* Location details */}
                        <TextField fullWidth />
                        <CustomInputLabel>Location Details</CustomInputLabel>
                    </Grid>
                    <Grid item xs={10}>
                        <Select
                            value={probingType}
                            onChange={onChangeProbingType}
                            fullWidth
                        >
                            <MenuItem value="electrical">Electrical</MenuItem>
                            <MenuItem value="manual">Manual</MenuItem>
                        </Select>
                        <CustomInputLabel>Probing Type</CustomInputLabel>
                    </Grid>
                    <Grid item xs={10}>
                        <Grid container style={{ width: "100%" }}>
                            <Grid item xs>
                                <TextField fullWidth />
                                <CustomInputLabel>Tool Width</CustomInputLabel>
                            </Grid>
                            <Grid item xs={2}>
                                <Select
                                    labelId="toolUnits"
                                    value={toolUnits}
                                    onChange={onChangeToolUnits}
                                    fullWidth
                                >
                                    <MenuItem value="mm">MM</MenuItem>
                                    <MenuItem value="inches">Inches</MenuItem>
                                </Select>
                                <CustomInputLabel>Units</CustomInputLabel>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={10}>
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
                        <CustomInputLabel>Target WCS</CustomInputLabel>
                    </Grid>
                    <Grid item xs={10}>
                        <Grid container>
                            <Grid item>
                                <CustomInputLabel>
                                    Axis Selection
                                </CustomInputLabel>
                            </Grid>
                            <Grid item>
                                <Grid container>
                                    <Grid item>
                                        <Grid container direction="column">
                                            <Grid item>
                                                <Checkbox value="checkedX" />
                                            </Grid>
                                            <Grid item>
                                                <CustomInputLabel>
                                                    X
                                                </CustomInputLabel>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item>
                                        <Grid container direction="column">
                                            <Grid item>
                                                <Checkbox value="checkedY" />
                                            </Grid>
                                            <Grid item>
                                                <CustomInputLabel>
                                                    Y
                                                </CustomInputLabel>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item>
                                        <Grid container direction="column">
                                            <Grid item>
                                                <Checkbox value="checkedZ" />
                                            </Grid>
                                            <Grid item>
                                                <CustomInputLabel>
                                                    Z
                                                </CustomInputLabel>
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
                        <Grid container>
                            <Grid item>
                                <Grid container direction="column">
                                    <Grid item>
                                        <TextField />
                                    </Grid>
                                    <Grid item>
                                        <CustomInputLabel>X</CustomInputLabel>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Grid container direction="column">
                                    <Grid item>
                                        <TextField />
                                    </Grid>
                                    <Grid item>
                                        <CustomInputLabel>Y</CustomInputLabel>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Grid container direction="column">
                                    <Grid item>
                                        <TextField />
                                    </Grid>
                                    <Grid item>
                                        <CustomInputLabel>Z</CustomInputLabel>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                        <CustomInputLabel>Additional Offset</CustomInputLabel>
                    </Grid>
                </Grid>
            </ItemPanel>
        );
    }
};

export default ProbingSettings;
