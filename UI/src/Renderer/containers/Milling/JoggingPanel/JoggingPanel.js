import React from "react";
import ItemPanel from "../../../components/ItemPanel/ItemPanel";
import { Box, Grid, Input, Select, Typography } from "@material-ui/core";
import HorizontalLines from "../HorizontalLines/HorizontalLines";

const JoggingPanel = (props) => {
    if (props.open) {
    return (
        <ItemPanel
        title="Jogging"
        small
        contentStyle={{
            padding: "8px",
        }}
        >
            {/* Main grid container */}
            <Box
                style={{
                    display: "grid",
                    gridTemplateRows: "160px 16px 1fr",
                    gridTemplateColumns: "1fr",
                }}
            >
                {/* Jog controls container */}
                <Box style={{
                    display: "grid",
                    gridTemplateColumns: "24px 1fr 2fr 1fr 24px",
                    gridTemplateRows: "16px 1fr 16px 10px 17px",
                    gridTemplateAreas: `
                        "xControls . . . zControls"
                        "xControls . millSVG . zControls"
                        "xControls . . . zControls"
                        ". . . . ."
                        "yControls yControls yControls yControls yControls"
                        `

                }}>
                    {/* x controls */}
                    <Box style={{gridArea: "xControls"}}>
                        
                    </Box>

                    {/* svg */}
                    <Box style={{gridArea: "millSVG"}}>
                        
                    </Box>

                    {/* z controls */}
                    <Box style={{gridArea: "zControls"}}>
                        
                    </Box>

                    {/* y controls */}
                    <Box style={{gridArea: "yControls"}}>
                        
                    </Box>
                </Box>
                <Box><HorizontalLines /></Box>
                <Box>
                    {/* jogging settings - flexbox */}
                    <Grid container>
                        <Grid item container>
                            {/* mode max */}
                            <Grid item>
                                <Typography>Mode</Typography>
                            </Grid>
                            <Grid item xs>
                                <Select fullwidth></Select>
                            </Grid>
                            <Grid item>
                                <Typography>Max</Typography>
                            </Grid>
                            <Grid item>
                                <Input />
                            </Grid>
                        </Grid>
                        <Grid item container>
                            {/* spindle direction */}
                            <Grid item>
                                <Typography>Spindle</Typography>
                            </Grid>
                            <Grid item>
                                <Select></Select>
                            </Grid>
                            <Grid item>
                                <Typography>Direction</Typography>
                            </Grid>
                            <Grid item xs>
                                <Select></Select>
                            </Grid>
                        </Grid>
                        <Grid item container>
                            {/* feedrate */}
                            <Grid item>
                                <Typography>Speed</Typography>
                            </Grid>
                            <Grid item xs>
                                feedrate
                            </Grid>
                        </Grid>
                        <Grid item container>
                            {/* file */}
                            <Grid item>
                                <Typography>File</Typography>
                            </Grid>
                            <Grid item xs>
                                <Input fullwidth disabled />
                            </Grid>
                        </Grid>
                        <Grid item container>
                            {/* manual entry */}
                            <Grid item>
                                <Typography>Manual Entry</Typography>
                            </Grid>
                            <Grid item xs>
                                <Input fullwidth/>
                            </Grid>
                        </Grid>
                        <Grid item container>
                            {/* presets */}
                            <Grid item>

                            </Grid>
                            <Grid item>

                            </Grid>
                            <Grid item>

                            </Grid>
                            <Grid item>

                            </Grid>
                            <Grid item>

                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </ItemPanel>
    );
}
else {
    return "";
}
};

export default JoggingPanel;
