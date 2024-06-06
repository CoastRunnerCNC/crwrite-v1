import React from "react";
import MachineJogging from "./MachineJogging/MachineJogging";
import ItemPanel from "../../../ItemPanel/ItemPanel";
import { Grid } from "@material-ui/core";

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
                <Grid item xs={10}>
                    <MachineJogging />
                </Grid>
                <Grid item xs={10}>

                </Grid>
                <Grid item xs={10}>

                </Grid>
            </Grid>
        </ItemPanel>
    );
};

export default ProbingPanel;
