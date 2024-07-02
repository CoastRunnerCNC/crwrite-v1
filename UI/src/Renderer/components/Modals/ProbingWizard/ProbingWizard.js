import {
    Grid,
    Dialog,
    DialogContent,
    Button
} from "@material-ui/core";
import React, { useState } from "react";
import ProbingSettings from "./ProbingSettings/ProbingSettings";
import ProbeFeature from "./ProbeFeature/ProbeFeature";
import RightPanel from "./RightPanel/RightPanel";

const ProbingWizard = (props) => {
    const [featureType, setFeatureType] = useState("");
    const [probingActive, setProbingActive] = useState(false);

    const PictureSVG = () => {
        return (
            <img style={{
                    width: '100%',
                    }}
                    src='./static/img/CoastRunnerProbingWizard.svg' 
                    />
    );
    };

    const handleStart = () => {
        setProbingActive(true);
    }

    return (
        <React.Fragment>
            <Dialog
                open={props.open}
                PaperProps={{ style: { minWidth: "800px", minHeight: '550px' } }}
                maxWidth="xl"
            >
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
                                    <RightPanel probingActive={probingActive} />
                                </Grid>
                                <Grid item>
                                    <Button onClick={handleStart} fullWidth style={{border: '1px solid black', backgroundColor: '#f6f6f6', borderRadius: '0px', boxShadow: "1px 1px 0px 0px #000000"}}>Start</Button>
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
