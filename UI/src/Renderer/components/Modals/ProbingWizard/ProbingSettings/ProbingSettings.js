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
    xyzLabelMargin: { marginRight: "8px" },
};

const ProbingSettings = (props) => {
    const onChangeProbeWhere = (event) => {
        props.setLocationType(event.target.value);
    };

    const onChangeProbingType = (event) => {
        props.setProbingType(event.target.value);
    };

    const onChangeToolUnits = (event) => {
        props.setToolUnits(event.target.value);
    };

    const onChangeWcs = (event) => {
        props.setWcs(event.target.value);
    };

    const surfaceFeatureSelected = () => {
        return props.featureType === "surface";
    };

    const getShape = () => {
        if (
            props.featureType === "circlePocket" ||
            props.featureType === "circleProtrusion"
        ) {
            return "circle";
        } else {
            return "square";
        }
    };

    const ProbeWhere = () => {
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
                            disabled={surfaceFeatureSelected()}
                            fullWidth
                        >
                            {getShape() != "circle" && (
                                <MenuItem value="corner">Corner</MenuItem>
                            )}

                            <MenuItem value="midpoint-x">Midpoint X</MenuItem>
                            <MenuItem value="midpoint-y">Midpoint Y</MenuItem>
                            <MenuItem value="midpoint-x-y">
                                Midpoint X&Y
                            </MenuItem>
                        </Select>
                    </Grid>
                </Grid>
            );
        } else {
            return "";
        }
    };

    const LocationDetails = () => {
        if (props.featureTypeType != "surface") {
            if (props.locationType === "midpoint-x" && props.yChecked) {
                return (
                    <Grid container item>
                        <Grid item xs={4}>
                            <Typography>Location Details</Typography>
                        </Grid>
                        <Grid item xs>
                            <Select
                                disabled={surfaceFeatureSelected()}
                                onChange={(event) => {
                                    props.setProbeYSide(event.target.value);
                                }}
                                fullWidth
                                value={props.probeYSide}
                            >
                                <MenuItem value="probe-y-on-left">
                                    Probe Y on Left
                                </MenuItem>
                                <MenuItem value="probe-y-on-right">
                                    Probe Y on Right
                                </MenuItem>
                            </Select>
                        </Grid>
                    </Grid>
                );
            } else if (props.locationType === "midpoint-y" && props.xChecked) {
                return (
                    <Grid container item>
                        <Grid item xs={4}>
                            <Typography>Location Details</Typography>
                        </Grid>
                        <Grid item xs>
                            <Select
                                disabled={surfaceFeatureSelected()}
                                onChange={(event) => {
                                    props.setProbeXSide(event.target.value);
                                }}
                                fullWidth
                                value={props.probeXSide}
                            >
                                <MenuItem value="probe-x-on-top">
                                    Probe X on Top
                                </MenuItem>
                                <MenuItem value="probe-x-on-bottom">
                                    Probe X on Bottom
                                </MenuItem>
                            </Select>
                        </Grid>
                    </Grid>
                );
            } else if (props.locationType === "corner") {
                return (
                    <Grid container item>
                        <Grid item xs={4}>
                            <Typography>Location Details</Typography>
                        </Grid>
                        <Grid item xs>
                            <Select
                                disabled={surfaceFeatureSelected()}
                                onChange={(event) => {
                                    props.setProbeCorner(event.target.value);
                                }}
                                fullWidth
                                value={props.probeCorner}
                            >
                                <MenuItem value="top-left">
                                    Probe top left corner
                                </MenuItem>
                                <MenuItem value="top-right">
                                    Probe top right corner
                                </MenuItem>
                                <MenuItem value="bottom-left">
                                    Probe bottom left corner
                                </MenuItem>
                                <MenuItem value="bottom-right">
                                    Probe bottom right corner
                                </MenuItem>
                            </Select>
                        </Grid>
                    </Grid>
                );
            } else {
                return "";
            }
        }
    };

    const AdditionalLocationDetails = () => {
        console.log(props.featureType);
        console.log(props.featureType === "circlePocket");
        if (
            (props.featureType === "rectanglePocket" ||
                props.featureType === "circlePocket") &&
            props.zChecked
        ) {
            return (
                <Grid container item>
                    <Grid item xs={4}>
                        <Typography>Location Details</Typography>
                    </Grid>
                    <Grid item xs>
                        <Select
                            disabled={surfaceFeatureSelected()}
                            onChange={(event) => {
                                props.setProbeZ(event.target.value);
                            }}
                            fullWidth
                            value={props.probeZ}
                        >
                            <MenuItem value="top">
                                Probe Z top of pocket
                            </MenuItem>
                            <MenuItem value="bottom">
                                Probe z bottom of pocket
                            </MenuItem>
                        </Select>
                    </Grid>
                </Grid>
            );
        } else {
            return "";
        }
    };

    const ProbingType = () => {
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
                        <MenuItem value="manual">Manual</MenuItem>
                    </Select>
                </Grid>
            </Grid>
        );
    };

    const UnitsSelect = () => {
        return (
            <Grid container item>
                <Grid item xs={4}>
                    <Typography>Units</Typography>
                </Grid>
                <Grid item xs>
                    <Select
                        labelId="toolUnits"
                        value={props.toolUnits}
                        onChange={onChangeToolUnits}
                        fullWidth
                    >
                        <MenuItem value="mm">MM</MenuItem>
                        <MenuItem value="inches">Inches</MenuItem>
                    </Select>
                </Grid>
            </Grid>
        );
    };

    const ToolWidth = () => {
        if (props.featureType != "surface") {
            return (
                <Grid container item>
                    <Grid item xs={4}>
                        <Typography>Tool Width</Typography>
                    </Grid>
                    <Grid item xs>
                        <TextField
                            value={props.toolWidth}
                            onChange={(event) => {props.setToolWidth(event.target.value)}}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            );
        } else {
            return "";
        }
    };

    const TargetWCS = () => {
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

    const AxisSelection = () => {
        if (props.featureType != "surface") {
            return (
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
                                <Checkbox
                                    // checked={axis.checkedX}
                                    checked={props.xChecked}
                                    disabled={surfaceFeatureSelected()}
                                    value="checkedX"
                                    // onChange={handleCheckboxChange}
                                    onChange={(event) => {
                                        props.setXChecked(!props.xChecked);
                                    }}
                                />
                            </Grid>
                            <Grid item>
                                <Typography>Y</Typography>
                            </Grid>
                            <Grid item>
                                <Checkbox
                                    checked={props.yChecked}
                                    disabled={surfaceFeatureSelected()}
                                    value="checkedY"
                                    onChange={(event) => {
                                        props.setYChecked(!props.yChecked);
                                    }}
                                />
                            </Grid>
                            <Grid item>
                                <Typography>Z</Typography>
                            </Grid>
                            <Grid item>
                                <Checkbox
                                    checked={props.zChecked}
                                    disabled={surfaceFeatureSelected()}
                                    value="checkedZ"
                                    onChange={(event) => {
                                        props.setZChecked(!props.zChecked);
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            );
        } else {
            return "";
        }
    };

    const AdditionalOffsets = () => {
        const XOffset = () => {
            if (props.featureType != "surface") {
                return (
                    <Grid item>
                        <Grid container>
                            <Grid item className={props.classes.xyzLabelMargin}>
                                <Typography>X</Typography>
                            </Grid>
                            <Grid item>
                                <TextField
                                    value={props.xOffset}
                                    onChange={(event) => {
                                        props.setXOffset(event.target.value);
                                    }}
                                    className={props.classes.xyzOffset}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                );
            } else {
                return "";
            }
        };

        const YOffset = () => {
            if (props.featureType != "surface") {
                return (
                    <Grid item>
                        <Grid container>
                            <Grid item className={props.classes.xyzLabelMargin}>
                                <Typography>Y</Typography>
                            </Grid>
                            <Grid item>
                                <TextField
                                    value={props.yOffset}
                                    onChange={(event) => {
                                        props.setYOffset(event.target.value)
                                    }}
                                    className={props.classes.xyzOffset}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                );
            } else {
                return "";
            }
        };

        const ZOffset = () => {
            if (true) {
                return (
                    <Grid item>
                        <Grid container>
                            <Grid item className={props.classes.xyzLabelMargin}>
                                <Typography>Z</Typography>
                            </Grid>
                            <Grid item>
                                <TextField
                                    value={props.zOffset}
                                    onChange={(event) => {
                                        props.setZOffset(event.target.value)
                                    }}
                                    className={props.classes.xyzOffset}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                );
            } else {
                return "";
            }
        };

        return (
            <Grid item>
                <Typography>Additional Offset:</Typography>
                <Grid container justify="space-between">
                    <XOffset />
                    <YOffset />
                    <ZOffset />
                </Grid>
            </Grid>
        );
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
                        paddingLeft: "8px",
                        paddingRight: "8px",
                    }}
                >
                    <ProbeWhere />
                    <AxisSelection />
                    <LocationDetails />
                    <AdditionalLocationDetails />
                    <ProbingType />
                    <UnitsSelect />
                    <ToolWidth />
                    <TargetWCS />
                    <AdditionalOffsets />
                    <Grid item container>
                        <FeatureSizes
                            featureType={props.featureType}
                            featureDiameter={props.featureDiameter}
                            setFeatureDiameter={props.setFeatureDiameter}
                            featureWidth={props.featureWidth}
                            setFeatureWidth={props.setFeatureWidth}
                            featureLength={props.featureLength}
                            setFeatureLength={props.setFeatureLength}
                            shape={getShape()}
                        />
                    </Grid>
                </Grid>
            </ItemPanel>
        );
    }
};

export default withStyles(styles)(ProbingSettings);
