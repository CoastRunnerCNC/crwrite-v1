import {
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import ProbingSettings from "./ProbingSettings/ProbingSettings";
import ProbeFeature from "./ProbeFeature/ProbeFeature";
import RightPanel from "./RightPanel/RightPanel";
import Alert from "../Alert";
import AnimationPlayer from "./AnimationPlayer/AnimationPlayer";

const ProbingWizard = (props) => {
    const [featureType, setFeatureType] = useState("");
    const [locationType, setLocationType] = useState("");
    const [probingActive, setProbingActive] = useState(false);
    const [startProbing, setStartProbing] = useState(false);
    const [probingType, setProbingType] = useState("");
    const [toolWidth, setToolWidth] = useState("");
    const [toolUnits, setToolUnits] = useState("MM");
    const [customToolWidth, setCustomToolWidth] = useState("");
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
    const [showProbeStart, setShowProbeStart] = useState(false);

    // This needs to be change to watch for machine status change away from connected. Maybe put this in dashboard instead
    useEffect(() => {
        if (props.open === false) {
            handleClose();
        } else {
            resetState();
        }
    }, [props.open]);

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
        console.log("handleStart - probingActive: " + probingActive);
        if (probingActive === false) {
            setProbingActive(true);
        } else {
            console.log("closing alert");
            setStartProbing(true);
            setShowProbeStart(false);
        }
    };

    const resetState = () => {
        setFeatureType("");
        setLocationType("");
        setProbingActive(false);
        setStartProbing(false);
        setProbingType("");
        setToolWidth("");
        setWcs("");
        setXChecked(false);
        setYChecked(false);
        setZChecked(false);
        setProbeXSide("");
        setProbeYSide("");
        setProbeCorner("");
        setProbeZ("");
        setFeatureDiameter("");
        setFeatureLength("");
        setFeatureWidth("");
        setXOffset("");
        setYOffset("");
        setZOffset("");
    };

    const handleClose = () => {
        props.setOpenProbingWizard(false);
        resetState();
    };

    const handleCloseSuccess = () => {
        resetState();
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
                (toolWidth === "other" && customToolWidth === "") ||
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
                (toolWidth === "other" && customToolWidth === "") ||
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
            if (toolWidth === "" || featureDiameter === "") {
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
            if (toolWidth === "" ||
                (toolWidth === "other" && customToolWidth === "") || 
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

    const openProbeAlert = () => {
        if (probingActive) {
            setShowProbeStart(true);
        } else {
            setProbingActive(true);
        }
    };

    const handleCancelAlert = () => {
        setShowProbeStart(false);
    };

    const createAnimationObject = (fileName, speed = 1.0, repeat = 1) => {
        return {src: `./static/img/CR Animations/${fileName}.webm`, speed: speed, repeat: repeat}
    }

    const getAnimations = () => {
        let animationArray = [];
        // Take feature type, locationType, x y z checked, probe x y side, probeCorner, probeZ
        if (featureType === "surface") {
            return animationArray.push({src: "./static/img/CR Animations/Protrusion.webm", speed: 1.0, repeat: 1})
        }
        else if (featureType === "circleProtrusion") {
            switch (locationType) {
                case "midpoint-x":
                    animationArray.push(createAnimationObject("Tap Top - Circle(Out)"));
                    animationArray.push(createAnimationObject("tap bottom of circle (outside)"));
                    switch (probeYSide) {
                        case "probe-y-on-left":
                            animationArray.push(createAnimationObject("Tap Left Square (Out)"));
                            break;
                        case "probe-y-on-right":
                            animationArray.push(createAnimationObject("Tap Right - Square (Out)"));
                            break;
                    }
                    break;
                case "midpoint-y":
                    animationArray.push(createAnimationObject("Tap Right Circle(out)"));
                    animationArray.push(createAnimationObject("tap left of circle (outside)"));
                    switch (probeXSide) {
                        case "probe-x-on-top":
                            animationArray.push(createAnimationObject("Tap Top - Square (Out)"));
                            break;
                        case "probe-x-on-bottom":
                            animationArray.push(createAnimationObject("Tap Bottom - Square (Out)"));
                            break;
                    }
                    break;
                case "midpoint-x-y":
                    animationArray.push(createAnimationObject("Tap Top - Circle(Out)"));
                    animationArray.push(createAnimationObject("tap bottom of circle (outside)"));
                    animationArray.push(createAnimationObject("Tap Right Circle(out)"));
                    animationArray.push(createAnimationObject("tap left of circle (outside)"));
                    break;
            }
        }
        else if (featureType === "rectangleProtrusion") {
            switch (locationType) {
                case "midpoint-x":
                    animationArray.push(createAnimationObject("Tap Top - Square (Out)"));
                    animationArray.push(createAnimationObject("Tap Bottom - Square (Out)"));
                    switch (probeYSide) {
                        case "probe-y-on-left":
                            animationArray.push(createAnimationObject("Tap Left Square (Out)"));
                            break;
                        case "probe-y-on-right":
                            animationArray.push(createAnimationObject("Tap Right - Square (Out)"));
                            break;
                    }
                    break;
                case "midpoint-y":
                    animationArray.push(createAnimationObject("Tap Left Square (Out)"));
                    animationArray.push(createAnimationObject("Tap Right - Square (Out)"));
                    switch (probeXSide) {
                        case "probe-x-on-top":
                            animationArray.push(createAnimationObject("Tap Top - Square (Out)"));
                            break;
                        case "probe-x-on-bottom":
                            animationArray.push(createAnimationObject("Tap Bottom - Square (Out)"));
                            break;
                    }
                    break;
                case "midpoint-x-y":
                    animationArray.push(createAnimationObject("Tap Top - Square (Out)"));
                    animationArray.push(createAnimationObject("Tap Bottom - Square (Out)"));
                    animationArray.push(createAnimationObject("Tap Left Square (Out)"));
                    animationArray.push(createAnimationObject("Tap Right - Square (Out)"));
                    break;
            }
        }

        switch (probeCorner) {
            case "top-left":
                animationArray.push(createAnimationObject("Corner 4"));
                animationArray.push(createAnimationObject("Corner 5"));
                break;
            case "top-right":
                animationArray.push(createAnimationObject("Corner 6"));
                animationArray.push(createAnimationObject("Corner 7"));
                break;
            case "bottom-left":
                animationArray.push(createAnimationObject("Corner 2"));
                animationArray.push(createAnimationObject("Corner 3"));
                break;
            case "bottom-right":
                animationArray.push(createAnimationObject("Corner 1"));
                animationArray.push(createAnimationObject("Corner 8"));
                break;
        }
        // return array of animation objects
    }

    const animations = [
        {src: "./static/img/CR Animations/Corner 3.webm", speed: 1.0, repeat: 1},
        {src: "./static/img/CR Animations/Corner 2.webm", speed: 1.0, repeat: 2},
        {src: "./static/img/CR Animations/Corner 1.Webm", speed: 1.0, repeat: 3}
    ];

    return (
        <React.Fragment>
            <Alert
                open={showProbeStart}
                message="Start probing?"
                yesNo={true}
                onOk={handleStart}
                onCancel={handleCancelAlert}
            />
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
                                        resetState={resetState}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    {/* <PictureSVG /> */}
                                    <AnimationPlayer animations={animations} />
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
                                        customToolWidth={customToolWidth}
                                        setCustomToolWidth={setCustomToolWidth}
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
                                        handleCloseSuccess={handleCloseSuccess}
                                    />
                                </Grid>
                                <Grid item>
                                    <Button
                                        onClick={openProbeAlert}
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
                                        {probingActive ? "RUN" : "CONTINUE"}
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
