import React from "react";
import ItemPanel from "../../../components/ItemPanel/ItemPanel";
import { Box, Grid, Input, Select, Typography } from "@material-ui/core";
import HorizontalLines from "../HorizontalLines/HorizontalLines";
import { withStyles } from "@material-ui/core";

const styles = (theme) => ({
    bottomMiddleCell: {
        borderTop: "1px solid black",
        borderBottom: "1px solid black",
        borderRight: "1px solid black",
    },
    bottomLeftCell: {
        borderLeft: "1px solid black",
        borderRight: "1px solid black",
        borderTop: "1px solid black",
        borderBottom: "1px solid black",
    },
    bottomRightCell: {
        borderTop: "1px solid black",
        borderRight: "1px solid black",
        borderBottom: "1px solid black",
    },
    sideTopCell: {
        borderLeft: "1px solid black",
        borderRight: "1px solid black",
        borderTop: "1px solid black",
        borderBottom: "1px solid black",
    },
    sideMiddleCell: {
        borderLeft: "1px solid black",
        borderRight: "1px solid black",
        borderBottom: "1px solid black",
    },
    sideBottomCell: {
        borderLeft: "1px solid black",
        borderRight: "1px solid black",
        borderBottom: "1px solid black",
    },
});

const MillSVG = () => {
    return (
        <svg
            viewBox="0 0 134 81"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M4.2 3.06C4.2 2.16391 4.2 1.71587 4.37439 1.37362C4.52779 1.07256 4.77256 0.827787 5.07361 0.67439C5.41587 0.5 5.86391 0.5 6.76 0.5H130.44C131.336 0.5 131.784 0.5 132.126 0.67439C132.427 0.827787 132.672 1.07256 132.826 1.37362C133 1.71587 133 2.16392 133 3.06V77.94C133 78.8361 133 79.2841 132.826 79.6264C132.672 79.9274 132.427 80.1722 132.126 80.3256C131.784 80.5 131.336 80.5 130.44 80.5H6.76C5.86391 80.5 5.41587 80.5 5.07361 80.3256C4.77256 80.1722 4.52779 79.9274 4.37439 79.6264C4.2 79.2841 4.2 78.8361 4.2 77.94V3.06Z"
                fill="#F6F6F6"
            />
            <path
                d="M12.2 0.5H125V64.34C125 65.2361 125 65.6841 124.826 66.0264C124.672 66.3274 124.427 66.5722 124.126 66.7256C123.784 66.9 123.336 66.9 122.44 66.9H14.76C13.8639 66.9 13.4159 66.9 13.0736 66.7256C12.7726 66.5722 12.5278 66.3274 12.3744 66.0264C12.2 65.6841 12.2 65.2361 12.2 64.34V0.5Z"
                fill="#F6F6F6"
            />
            <path
                d="M1 7.86C1 6.96392 1 6.51587 1.17439 6.17362C1.32779 5.87256 1.57256 5.62779 1.87362 5.47439C2.21587 5.3 2.66392 5.3 3.56 5.3H4.2V12.5H3.56C2.66392 12.5 2.21587 12.5 1.87362 12.3256C1.57256 12.1722 1.32779 11.9274 1.17439 11.6264C1 11.2841 1 10.8361 1 9.94V7.86Z"
                fill="#F6F6F6"
            />
            <path
                d="M4.2 3.06C4.2 2.16391 4.2 1.71587 4.37439 1.37362C4.52779 1.07256 4.77256 0.827787 5.07361 0.67439C5.41587 0.5 5.86391 0.5 6.76 0.5H130.44C131.336 0.5 131.784 0.5 132.126 0.67439C132.427 0.827787 132.672 1.07256 132.826 1.37362C133 1.71587 133 2.16392 133 3.06V77.94C133 78.8361 133 79.2841 132.826 79.6264C132.672 79.9274 132.427 80.1722 132.126 80.3256C131.784 80.5 131.336 80.5 130.44 80.5H6.76C5.86391 80.5 5.41587 80.5 5.07361 80.3256C4.77256 80.1722 4.52779 79.9274 4.37439 79.6264C4.2 79.2841 4.2 78.8361 4.2 77.94V3.06Z"
                stroke="black"
            />
            <path
                d="M12.2 0.5H125V64.34C125 65.2361 125 65.6841 124.826 66.0264C124.672 66.3274 124.427 66.5722 124.126 66.7256C123.784 66.9 123.336 66.9 122.44 66.9H14.76C13.8639 66.9 13.4159 66.9 13.0736 66.7256C12.7726 66.5722 12.5278 66.3274 12.3744 66.0264C12.2 65.6841 12.2 65.2361 12.2 64.34V0.5Z"
                stroke="black"
            />
            <path
                d="M1 7.86C1 6.96392 1 6.51587 1.17439 6.17362C1.32779 5.87256 1.57256 5.62779 1.87362 5.47439C2.21587 5.3 2.66392 5.3 3.56 5.3H4.2V12.5H3.56C2.66392 12.5 2.21587 12.5 1.87362 12.3256C1.57256 12.1722 1.32779 11.9274 1.17439 11.6264C1 11.2841 1 10.8361 1 9.94V7.86Z"
                stroke="black"
            />
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M17 4.5H19V6.5H17V4.5ZM17 10.5H19V12.5H17V10.5ZM19 16.5H17V18.5H19V16.5ZM17 22.5H19V24.5H17V22.5ZM19 28.5H17V30.5H19V28.5ZM22.9999 4.5H24.9999V6.5H22.9999V4.5ZM24.9999 10.5H22.9999V12.5H24.9999V10.5ZM22.9999 16.5H24.9999V18.5H22.9999V16.5ZM24.9999 22.5H22.9999V24.5H24.9999V22.5ZM22.9999 28.5H24.9999V30.5H22.9999V28.5ZM31 4.5H29V6.5H31V4.5ZM29 10.5H31V12.5H29V10.5ZM31 28.5H29V30.5H31V28.5ZM34.9999 4.5H36.9999V6.5H34.9999V4.5ZM36.9999 10.5H34.9999V12.5H36.9999V10.5ZM41 4.5H43V6.5H41V4.5ZM49 4.5H47V6.5H49V4.5Z"
                fill="black"
            />
        </svg>
    );
};

const JoggingPanel = (props) => {
    const { classes } = props;
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
                        gridTemplateRows: "220px 16px 1fr",
                        gridTemplateColumns: "1fr",
                    }}
                >
                    {/* Jog controls container */}
                    <Box
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "12px 36px 1fr 3fr 1fr 36px 12px",
                            gridTemplateRows:
                                "12px 16px 1fr 16px 10px 17px 12px",
                            gridTemplateAreas: `
                        " . . . . . . ."
                        ". xControls . . . zControls ."
                        ". xControls . millSVG . zControls ."
                        ". xControls . . . zControls ."
                        ". . . . . . ."
                        ". yControls yControls yControls yControls yControls ."
                        `,
                        }}
                    >
                        {/* x controls */}
                        <Box
                            style={{
                                gridArea: "xControls",
                                display: "grid",
                                gridTemplateColumns: "1fr",
                                gridTemplateRows:
                                    "16px 20px 20px 20px 1fr 20px 20px 20px 16px",
                            }}
                        >
                            <div
                                className={classes.sideTopCell}
                                style={{ gridRow: "1 / 2" }}
                            >
                                +
                            </div>
                            <div
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "2 / 3" }}
                            >
                                1
                            </div>
                            <div
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "3 / 4" }}
                            >
                                0.1
                            </div>
                            <div
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "4 / 5" }}
                            >
                                0.01
                            </div>
                            <div
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "5 / 6" }}
                            >
                                x
                            </div>
                            <div
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "6 / 7" }}
                            >
                                0.01
                            </div>
                            <div
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "7 / 8" }}
                            >
                                0.1
                            </div>
                            <div
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "8 / 9" }}
                            >
                                1
                            </div>
                            <div
                                className={classes.sideBottomCell}
                                style={{ gridRow: "9 / 10" }}
                            >
                                -
                            </div>
                        </Box>

                        {/* svg */}
                        <Box style={{ gridArea: "millSVG" }}>
                            <MillSVG />
                        </Box>

                        {/* z controls */}
                        <Box
                            style={{
                                gridArea: "zControls",
                                display: "grid",
                                gridTemplateColumns: "1fr",
                                gridTemplateRows:
                                    "16px 20px 20px 20px 1fr 20px 20px 20px 16px",
                            }}
                        >
                            <div
                                className={classes.sideTopCell}
                                style={{ gridRow: "1 / 2" }}
                            >
                                +
                            </div>
                            <div
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "2 / 3" }}
                            >
                                1
                            </div>
                            <div
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "3 / 4" }}
                            >
                                0.1
                            </div>
                            <div
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "4 / 5" }}
                            >
                                0.01
                            </div>
                            <div
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "5 / 6" }}
                            >
                                x
                            </div>
                            <div
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "6 / 7" }}
                            >
                                0.01
                            </div>
                            <div
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "7 / 8" }}
                            >
                                0.1
                            </div>
                            <div
                                className={classes.sideMiddleCell}
                                style={{ gridRow: "8 / 9" }}
                            >
                                1
                            </div>
                            <div
                                className={classes.sideBottomCell}
                                style={{ gridRow: "9 / 10" }}
                            >
                                -
                            </div>
                        </Box>

                        {/* y controls */}
                        <Box
                            style={{
                                gridArea: "yControls",
                                display: "grid",
                                gridTemplateRows: "1fr",
                                gridTemplateColumns:
                                    "12px 36px 36px 36px 1fr 36px 36px 36px 12px",
                            }}
                        >
                            <div
                                className={classes.bottomLeftCell}
                                style={{
                                    gridColumn: "1 / 2",
                                    gridRow: "1 / 2",
                                }}
                            >
                                -
                            </div>
                            <div
                                className={classes.bottomMiddleCell}
                                style={{
                                    gridColumn: "2 / 3",
                                    gridRow: "1 / 2",
                                }}
                            >
                                1
                            </div>
                            <div
                                className={classes.bottomMiddleCell}
                                style={{
                                    gridColumn: "3 / 4",
                                    gridRow: "1 / 2",
                                }}
                            >
                                0.1
                            </div>
                            <div
                                className={classes.bottomMiddleCell}
                                style={{
                                    gridColumn: "4 / 5",
                                    gridRow: "1 / 2",
                                }}
                            >
                                0.01
                            </div>
                            <div
                                className={classes.bottomMiddleCell}
                                style={{
                                    gridColumn: "5 / 6",
                                    gridRow: "1 / 2",
                                }}
                            >
                                x
                            </div>
                            <div
                                className={classes.bottomMiddleCell}
                                style={{
                                    gridColumn: "6 / 7",
                                    gridRow: "1 / 2",
                                }}
                            >
                                0.01
                            </div>
                            <div
                                className={classes.bottomMiddleCell}
                                style={{
                                    gridColumn: "7 / 8",
                                    gridRow: "1 / 2",
                                }}
                            >
                                0.1
                            </div>
                            <div
                                className={classes.bottomMiddleCell}
                                style={{
                                    gridColumn: "8 / 9",
                                    gridRow: "1 / 2",
                                }}
                            >
                                1
                            </div>
                            <div
                                className={classes.bottomRightCell}
                                style={{
                                    gridColumn: "9 / 10",
                                    gridRow: "1 / 2",
                                }}
                            >
                                +
                            </div>
                        </Box>
                    </Box>
                    <Box>
                        <HorizontalLines />
                    </Box>
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
                            <Grid>
                                {/* WCS */}

                                {/* Units */}
                            </Grid>
                            <Grid>{/* Status */}</Grid>
                            <Grid>{/* Feedrate */}</Grid>
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
                                    <Input fullwidth />
                                </Grid>
                            </Grid>
                            <Grid item container>
                                {/* presets */}
                                <Grid item></Grid>
                                <Grid item></Grid>
                                <Grid item></Grid>
                                <Grid item></Grid>
                                <Grid item></Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </ItemPanel>
        );
    } else {
        return "";
    }
};

export default withStyles(styles)(JoggingPanel);
