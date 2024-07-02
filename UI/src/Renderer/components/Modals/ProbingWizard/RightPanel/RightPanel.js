import React from "react";
import ProbingSettings from "../ProbingSettings/ProbingSettings";
import ProbingPanel from "../ProbingPanel/ProbingPanel";

const RightPanel = (props) => {
    if (!props.probingActive) {
        return <ProbingSettings />;
    } else {
        return <ProbingPanel />
    }
};

export default RightPanel;
