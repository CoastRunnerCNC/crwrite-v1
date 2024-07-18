import React from "react";
import ProbingSettings from "../ProbingSettings/ProbingSettings";
import ProbingPanel from "../ProbingPanel/ProbingPanel";

const RightPanel = (props) => {
    if (!props.probingActive) {
        return <ProbingSettings featureType={props.featureType} locationType={props.locationType} setLocationType={props.setLocationType} />;
    } else {
        return <ProbingPanel featureType={props.featureType} locationType={props.locationType} />
    }
};

export default RightPanel;
