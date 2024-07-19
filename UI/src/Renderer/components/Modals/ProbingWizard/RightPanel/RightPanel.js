import React, { useState } from "react";
import ProbingSettings from "../ProbingSettings/ProbingSettings";
import ProbingPanel from "../ProbingPanel/ProbingPanel";
import { ipcRenderer } from "electron";

const RightPanel = (props) => {




    if (!props.probingActive) {
        return (
            <ProbingSettings
                featureType={props.featureType}
                locationType={props.locationType}
                setLocationType={props.setLocationType}
                probingType={props.probingType}
                setProbingType={props.setProbingType}
                toolWidth={props.toolWidth}
                setToolWidth={props.setToolWidth}
                toolUnits={props.toolUnits}
                setToolUnits={props.setToolUnits}
                wcs={props.wcs}
                setWcs={props.setWcs}
                xChecked={props.xChecked}
                setXChecked={props.setXChecked}
                yChecked={props.yChecked}
                setYChecked={props.setYChecked}
                zChecked={props.zChecked}
                setZChecked={props.setZChecked}
                probeXSide={props.probeXSide}
                setProbeXSide={props.setProbeXSide}
                probeYSide={props.probeYSide}
                setProbeYSide={props.setProbeYSide}
                probeCorner={props.probeCorner}
                setProbeCorner={props.setProbeCorner}
                probeZ={props.probeZ}
                setProbeZ={props.setProbeZ}
                featureDiameter={props.featureDiameter}
                setFeatureDiameter={props.setFeatureDiameter}
                featureLength={props.featureLength}
                setFeatureLength={props.setFeatureLength}
                featureWidth={props.featureWidth}
                setFeatureWidth={props.setFeatureWidth}
                xOffset={props.xOffset}
                setXOffset={props.setXOffset}
                yOffset={props.yOffset}
                setYOffset={props.setYOffset}
                zOffset={props.zOffset}
                setZOffset={props.setZOffset}

            />
        );
    } else {
        return (
            <ProbingPanel
                featureType={props.featureType}
                locationType={props.locationType}
                probingType={props.probingType}
                toolWidth={props.toolWidth}
                toolUnits={props.toolUnits}
                wcs={props.wcs}
                xChecked={props.xChecked}
                yChecked={props.yChecked}
                zChecked={props.zChecked}
                probeXSide={props.probeXSide}
                probeYSide={props.probeYSide}
                probeCorner={props.probeCorner}
                probeZ={props.probeZ}
                featureDiameter={props.featureDiameter}
                featureLength={props.featureLength}
                featureWidth={props.featureWidth}
                xOffset={props.xOffset}
                yOffset={props.yOffset}
                zOffset={props.zOffset}
                startProbing={props.startProbing}
            />
        );
    }
};

export default RightPanel;
