import React from "react";
import ItemPanel from "../../../components/ItemPanel/ItemPanel";
import { Grid } from "@material-ui/core";
import HorizontalLines from "../HorizontalLines/HorizontalLines";
import StepList from "../../../components/StepList";
import ActionPanel from "../../../components/ActionPanel/ActionPanel";

const StepsPanel = (props) => {
    return (
        <ItemPanel
            title="Project Steps"
            small
            contentStyle={{
                padding: "8px",
                flexGrow: "1",
            }}
            style={{ height: "100%" }}
        >
            <Grid container direction="column" style={{ height: "100%" }}>
                <Grid item>
                    <Grid
                        container
                        alignItems="center"
                        style={{
                            backgroundColor: "black",
                            color: "white",
                            height: "35px",
                            fontFamily: ["Public Sans", "sans-serif"],
                            fontSize: "14px",
                            overflow: "hidden",
                            marginBottom: "4px",
                            paddingLeft: "8px",
                            boxShadow: "1px 1px 0 0 #000000",
                        }}
                    >
                        <Grid item>File: {props.fileName}</Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <Grid
                        container
                        alignItems="center"
                        style={{
                            backgroundColor: "black",
                            color: "white",
                            height: "35px",
                            overflow: "hidden",
                            fontFamily: ["Public Sans", "sans-serif"],
                            fontSize: "14px",
                            paddingLeft: "8px",
                            boxShadow: "1px 1px 0 0 #000000",
                            marginBottom: "10px",
                        }}
                    >
                        <Grid item>Job: {props.jobName}</Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <HorizontalLines />
                </Grid>
                <Grid item style={{ flexGrow: "1" }}>
                    <Grid
                        container
                        direction="column"
                        style={{
                            marginTop: "10px",
                            height: "100%",
                        }}
                    >
                        <Grid item style={{ height: "50vh" }}>
                            <StepList
                                steps={props.steps}
                                selectedStep={props.selectedStepIndex}
                                editMode={props.editMode}
                                submanifestUsed={props.submanifestUsed}
                                deleteStep={props.handleDeleteStep}
                                moveStep={props.moveStep}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <ActionPanel
                        steps={props.steps}
                        selectedStepIndex={props.selectedStepIndex}
                        onClickBack={(event) => {
                            props.onClickBack();
                        }}
                        isPrevAvailable={() => {
                            props.isPrevAvailable();
                        }}
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
                    />
                </Grid>
            </Grid>
        </ItemPanel>
    );
};

export default StepsPanel;
