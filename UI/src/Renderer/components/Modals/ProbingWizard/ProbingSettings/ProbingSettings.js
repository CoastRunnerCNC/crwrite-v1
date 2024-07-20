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
import { YouTube } from "@material-ui/icons";

const styles = {
    xyzTextField: { width: "100px" },
    xyzOffset: { width: "80px" },
    xyzLabelMargin: { marginRight: "8px" },
};

const UnitsSelect = (props) => {
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

const ProbingSettings = (props) => {
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
                    <ProbeWhere
                        featureType={props.featureType}
                        locationType={props.locationType}
                        setLocationType={props.setLocationType}
                        getShape={getShape}
                    />
                    <AxisSelection
                        featureType={props.featureType}
                        xChecked={props.xChecked}
                        yChecked={props.yChecked}
                        zChecked={props.zChecked}
                        setXChecked={props.setXChecked}
                        setYChecked={props.setYChecked}
                        setZChecked={props.setZChecked}
                    />
                    <LocationDetails
                        featureType={props.featureType}
                        probeXSide={props.probeXSide}
                        setProbeXSide={props.setProbeXSide}
                        probeYSide={props.probeYSide}
                        setProbeYSide={props.setProbeYSide}
                        probeCorner={props.probeCorner}
                        setProbeCorner={props.setProbeCorner}
                    />
                    <AdditionalLocationDetails
                        featureType={props.featureType}
                        probeZ={props.probeZ}
                        setProbeZ={props.setProbeZ}
                    />
                    <ProbingType
                        probingType={props.probingType}
                        setProbingType={props.setProbingType}
                    />
                    {/* <UnitsSelect /> */}
                    <ToolWidth
                        featureType={props.featureType}
                        toolWidth={props.toolWidth}
                        setToolWidth={props.setToolWidth}
                    />
                    <TargetWCS wcs={props.wcs} setWcs={props.setWcs} />
                    <AdditionalOffsets
                        featureType={props.featureType}
                        xOffset={props.xOffset}
                        yOffset={props.yOffset}
                        zOffset={props.zOffset}
                        setXOffset={props.setXOffset}
                        setYOffset={props.setYOffset}
                        setZOffset={props.setZOffset}
                    />
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
