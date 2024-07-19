import {
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
} from "@material-ui/core";
import React, { useState } from "react";
import ProbingSettings from "./ProbingSettings/ProbingSettings";
import ProbeFeature from "./ProbeFeature/ProbeFeature";
import RightPanel from "./RightPanel/RightPanel";

const ProbingWizard = (props) => {
    const [featureType, setFeatureType] = useState("");
    const [locationType, setLocationType] = useState("");
    const [probingActive, setProbingActive] = useState(false);
    const [startProbing, setStartProbing] = useState(false);
    const [probingType, setProbingType] = useState("");
    const [toolWidth, setToolWidth] = useState("");
    const [toolUnits, setToolUnits] = useState("");
    const [wcs, setWcs] = useState("");
    const [xChecked, setXChecked] = useState(false);
    const [yChecked, setYChecked] = useState(false);
    const [zChecked, setZChecked] = useState(false);
    const [probeXSide, setProbeXSide] = useState("");
    const [probeYSide, setProbeYSide] = useState("");
    const [probeCorner, setProbeCorner] = useState("");
    const [probeZ, setProbeZ] = useState("");
    const [featureDiameter, setFeatureDiameter] = useState("");
    const [featureLength, setFeatureLength] = useState("");
    const [featureWidth, setFeatureWidth] = useState("");
    const [xOffset, setXOffset] = useState();
    const [yOffset, setYOffset] = useState();
    const [zOffset, setZOffset] = useState();

    const PictureSVG = () => {
        return (
            <img
                style={{
                    width: "100%",
                }}
                src="./static/img/CoastRunnerProbingWizard.svg"
            />
        );
    };

    const handleStart = () => {
        if (probingActive === false) {
            setProbingActive(true);
        } else {
            setStartProbing(true);
        }
    };

    const handleClose = () => {
        props.setOpenProbingWizard(false);
        setProbingActive(false);
        setStartProbing(false);
        setFeatureType("");
        setLocationType("");
    };

    const fieldsFilled = () => {
        if (
            !(
                probingType != "" &&
                toolUnits != "" &&
                wcs != "" &&
                (xChecked || yChecked || zChecked)
            )
        ) {
            return false;
        }

        if (featureType === "surface") {
            if (!zChecked) {
                return false;
            }
        } else if (featureType === "rectanglePocket") {
            if (
                toolWidth === "" ||
                featureLength === "" ||
                featureWidth === ""
            ) {
                return false;
            }
            if (locationType === "midpoint-x") {
                if (yChecked) {
                    if (probeYSide === "") {
                        return false;
                    }
                }
                if (zChecked) {
                    if (probeZ === "") {
                        return false;
                    }
                }
            } else if (locationType === "midpoint-y") {
                if (xChecked) {
                    if (probeXSide === "") {
                        return false;
                    }
                }
                if (zChecked) {
                    if (probeZ === "") {
                        return false;
                    }
                }
            } else if (locationType === "corner") {
                if (zChecked) {
                    if (probeZ === "") {
                        return false;
                    }
                }
                if (probeCorner === "") {
                    return false;
                }
            } else if (locationType === "midpoint-x-y") {
                if (zChecked) {
                    if (probeZ === "") {
                        return false;
                    }
                }
            } else {
                return false;
            }
        } else if (featureType === "rectangleProtrusion") {
            if (
                toolWidth === "" ||
                featureLength === "" ||
                featureWidth === ""
            ) {
                return false;
            }
            if (locationType === "midpoint-x") {
                if (yChecked) {
                    if (probeYSide === "") {
                        return false;
                    }
                }
            } else if (locationType === "midpoint-y") {
                if (xChecked) {
                    if (probeXSide === "") {
                        return false;
                    }
                }
            } else if (locationType === "corner") {
                if (probeCorner === "") {
                    return false;
                }
            } else if (locationType === "midpoint-x-y") {

            } else {
                return false;
            }
        } else if (featureType === "circlePocket") {
            if (
                toolWidth === "" ||
                featureDiameter === ""
            ) {
                return false;
            }
            if (locationType === "midpoint-x") {
                if (yChecked) {
                    if (probeYSide === "") {
                        return false;
                    }
                }
                if (zChecked) {
                    if (probeZ === "") {
                        return false;
                    }
                }
            } else if (locationType === "midpoint-y") {
                if (xChecked) {
                    if (probeXSide === "") {
                        return false;
                    }
                }
                if (zChecked) {
                    if (probeZ === "") {
                        return false;
                    }
                }
            } else if (locationType === "midpoint-x-y") {
                if (zChecked) {
                    if (probeZ === "") {
                        return false;
                    }
                }
            } else {
                return false;
            }
        } else if (featureType === "circleProtrusion") {
            if (
                toolWidth === "" ||
                featureDiameter === ""
            ) {
                return false;
            }
            if (locationType === "midpoint-x") {
                if (yChecked) {
                    if (probeYSide === "") {
                        return false;
                    }
                }
            } else if (locationType === "midpoint-y") {
                if (xChecked) {
                    if (probeXSide === "") {
                        return false;
                    }
                }
            } else if (locationType === "midpoint-x-y") {

            } else {
                return false;
            }
        } else {
            return false;
        }
        return true;
    };

    return (
        <React.Fragment>
            <Dialog
                open={props.open}
                PaperProps={{
                    style: { width: "800px", minHeight: "550px" },
                }}
                maxWidth="xl"
            >
                <DialogTitle style={{ padding: "0px" }}>
                    <Grid container>
                        <Grid item xs={1} />
                        <Grid item xs={10}></Grid>
                        <Grid item xs={1}>
                            <Button onClick={handleClose}>X</Button>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Grid container direction="column" spacing={2}>
                                <Grid item>
                                    <ProbeFeature
                                        featureType={featureType}
                                        setFeatureType={setFeatureType}
                                        probingActive={probingActive}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <PictureSVG />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={6}>
                            <Grid container direction="column" spacing={1}>
                                <Grid item>
                                    <RightPanel
                                        featureType={featureType}
                                        locationType={locationType}
                                        setLocationType={setLocationType}
                                        probingActive={probingActive}
                                        startProbing={startProbing}
                                        probingType={probingType}
                                        setProbingType={setProbingType}
                                        toolWidth={toolWidth}
                                        setToolWidth={setToolWidth}
                                        toolUnits={toolUnits}
                                        setToolUnits={setToolUnits}
                                        wcs={wcs}
                                        setWcs={setWcs}
                                        xChecked={xChecked}
                                        setXChecked={setXChecked}
                                        yChecked={yChecked}
                                        setYChecked={setYChecked}
                                        zChecked={zChecked}
                                        setZChecked={setZChecked}
                                        probeXSide={probeXSide}
                                        setProbeXSide={setProbeXSide}
                                        probeYSide={probeYSide}
                                        setProbeYSide={setProbeYSide}
                                        probeCorner={probeCorner}
                                        setProbeCorner={setProbeCorner}
                                        probeZ={probeZ}
                                        setProbeZ={setProbeZ}
                                        featureDiameter={featureDiameter}
                                        setFeatureDiameter={setFeatureDiameter}
                                        featureLength={featureLength}
                                        setFeatureLength={setFeatureLength}
                                        featureWidth={featureWidth}
                                        setFeatureWidth={setFeatureWidth}
                                        xOffset={xOffset}
                                        setXOffset={setXOffset}
                                        yOffset={yOffset}
                                        setYOffset={setYOffset}
                                        zOffset={zOffset}
                                        setZOffset={setZOffset}
                                    />
                                </Grid>
                                <Grid item>
                                    <Button
                                        onClick={handleStart}
                                        fullWidth
                                        disabled={!fieldsFilled()}
                                        style={{
                                            border: "1px solid black",
                                            backgroundColor: "#f6f6f6",
                                            borderRadius: "0px",
                                            boxShadow:
                                                "1px 1px 0px 0px #000000",
                                        }}
                                    >
                                        Start
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
};

export default ProbingWizard;
