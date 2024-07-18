import React, { useState } from "react";
import ProbingSettings from "../ProbingSettings/ProbingSettings";
import ProbingPanel from "../ProbingPanel/ProbingPanel";

const RightPanel = (props) => {

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

    if (!props.probingActive) {
        return (
            <ProbingSettings
                featureType={props.featureType}
                locationType={props.locationType}
                setLocationType={props.setLocationType}
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
                setFeatureWidth={featureWidth}
                xOffset={xOffset}
                setXOffset={setXOffset}
                yOffset={yOffset}
                setYOffset={setYOffset}
                zOffset={zOffset}
                setZOffset={setZOffset}

            />
        );
    } else {
        return (
            <ProbingPanel
                featureType={props.featureType}
                locationType={props.locationType}
                probingType={probingType}
                toolWidth={toolWidth}
                toolUnits={toolUnits}
                wcs={wcs}
                xChecked={xChecked}
                yChecked={yChecked}
                zChecked={zChecked}
                probeXSide={probeXSide}
                probeYSide={probeYSide}
                probeCorner={probeCorner}
                probeZ={probeZ}
                featureDiameter={featureDiameter}
                featureLength={featureLength}
                featureWidth={featureWidth}
                xOffset={xOffset}
                yOffset={yOffset}
                zOffset={zOffset}
            />
        );
    }
};

export default RightPanel;
