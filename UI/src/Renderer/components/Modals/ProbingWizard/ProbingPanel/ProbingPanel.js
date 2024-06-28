import React from "react";
import MachineJogging from "./MachineJogging/MachineJogging";
import ItemPanel from "../../../ItemPanel/ItemPanel";
import { Grid, Typography } from "@material-ui/core";

const ProbingPanel = (props) => {
    return (
        <ItemPanel small title="Settings">
            <Grid
                container
                spacing={2}
                direction="column"
                style={{
                    paddingTop: "16px",
                    paddingBottom: "16px",
                }}
                alignContent="center"
            >
                <Grid item xs={10} style={{width: '100%'}}>
                    <MachineJogging />
                </Grid>
                <Grid item xs={10}>
                    <Typography>Please use the jogging tool to place the tool in the center of the object. Once in position, click start.</Typography>
                </Grid>
                <Grid item xs={10}>

                </Grid>
            </Grid>
        </ItemPanel>
    );
};

export default ProbingPanel;
