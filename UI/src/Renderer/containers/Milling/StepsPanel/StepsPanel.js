import React from "react";
import ItemPanel from "../../../components/ItemPanel/ItemPanel";
import { Box, Grid } from "@material-ui/core";
import HorizontalLines from "../HorizontalLines/HorizontalLines";
import StepList from "../../../components/StepList";
import ActionPanel from "../../../components/ActionPanel/ActionPanel";

const StepsPanel = (props) => {
    let list = [];
    for (let x = 0; x < 7; x++) {
        list.push(<h1>test</h1>);
    }

    return (
        <ItemPanel title="Project Steps" scrollContent small>
            <Box
                style={{
                    display: "grid",
                    gridTemplateRows: "74px 20px 1fr 26px",
                    gridTemplateColumns: "1fr",
                    overflowY: "auto"
                }}
            >
                <Box style={{display: "grid", gridTemplateRows: "1fr 1fr", gap: "4px"}}>
                    <Box style={{display: "grid", backgroundColor: "black", color: "white", paddingLeft: "8px"}}>
                        <Box style={{alignSelf: "center"}}>
                            
                        {props.fileName}
                        </Box>
                    </Box>
                    <Box style={{display: "grid", backgroundColor: "black", color: "white", paddingLeft: "8px"}}>
                        <Box style={{alignSelf: "center"}}>
                        {props.jobName}

                        </Box>
                    </Box>
                </Box>
                <Box>
                    <HorizontalLines />
                </Box>
                <Box style={{ overflowY: "auto" }}>
                    <StepList
                        steps={props.steps}
                        selectedStep={props.selectedStepIndex}
                        editMode={props.editMode}
                        submanifestUsed={props.submanifestUsed}
                        deleteStep={props.handleDeleteStep}
                        moveStep={props.moveStep}
                    />
                    {/* {list.map((step) => {
                        if (true) {
                            return step
                        }
                    })} */}
                </Box>
                <Box>
                    <ActionPanel
                        steps={props.steps}
                        selectedStepIndex={props.selectedStepIndex}
                        onClickBack={(event) => {
                            props.onClickBack();
                        }}
                        isPrevAvailable={props.isPrevAvailable}
                        classes={props.classes}
                        handlePrev={() => {
                            props.handlePrev();
                        }}
                        this={props.this}
                        isNextAvailable={() => {
                            return props.isNextAvailable();
                        }}
                        handleNext={() => {
                            props.handleNext();
                        }}
                        handleSkip={props.handleSkip}
                        isSkipAvailable={props.isSkipAvailable}
                    />
                </Box>
            </Box>
        </ItemPanel>
    );
};

export default StepsPanel;
