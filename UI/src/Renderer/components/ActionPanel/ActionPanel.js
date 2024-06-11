import React from "react";
import {
    Grid,
    withStyles,
    IconButton,
    Button,
    Typography,
} from "@material-ui/core";

const PlayArrow = () => {
    return (
        <svg
            width="8"
            height="10"
            viewBox="0 0 8 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M0.509339 0.333499C0.509339 0.0602725 0.820314 -0.0966104 1.04006 0.0657541L7.35561 4.73205C7.5357 4.86511 7.53571 5.13445 7.35562 5.26753L1.04007 9.93424C0.820326 10.0966 0.509338 9.93973 0.509338 9.6665L0.509339 0.333499Z"
                fill="black"
            />
        </svg>
    );
};

const FastForwardArrow = () => {
    return (
        <svg
            width="14"
            height="10"
            viewBox="0 0 14 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M7.18118 0.0821659C6.90658 -0.120724 6.51799 0.0753162 6.51799 0.416738L6.51799 3.91274C6.51799 3.98102 6.44027 4.02023 6.38535 3.97965L1.11033 0.0821659C0.835736 -0.120724 0.447144 0.0753162 0.447144 0.416738V9.58326C0.447144 9.92469 0.835752 10.1207 1.11035 9.91782L6.38534 6.02C6.44026 5.97942 6.51799 6.01862 6.51799 6.08691L6.51799 9.58326C6.51799 9.92469 6.90659 10.1207 7.18119 9.91782L13.3841 5.33436C13.6091 5.16807 13.6091 4.8315 13.3841 4.66522L7.18118 0.0821659Z"
                fill="black"
            />
        </svg>
    );
};

const BackArrow = () => {
    return (
        <svg
            width="8"
            height="10"
            viewBox="0 0 8 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M7.49066 0.333499C7.49066 0.0602725 7.17969 -0.0966104 6.95994 0.0657541L0.644392 4.73205C0.464297 4.86511 0.464292 5.13445 0.64438 5.26753L6.95993 9.93424C7.17967 10.0966 7.49066 9.93973 7.49066 9.6665L7.49066 0.333499Z"
                fill="black"
            />
        </svg>
    );
};

const RewindArrow = () => {
    return (
        <svg
            width="14"
            height="10"
            viewBox="0 0 14 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M6.81882 0.0821659C7.09342 -0.120724 7.48201 0.0753162 7.48201 0.416738V3.91274C7.48201 3.98102 7.55973 4.02023 7.61465 3.97965L12.8897 0.0821659C13.1643 -0.120724 13.5529 0.0753162 13.5529 0.416738V9.58326C13.5529 9.92469 13.1642 10.1207 12.8896 9.91782L7.61465 6.02C7.55973 5.97942 7.48201 6.01862 7.48201 6.08691L7.48201 9.58326C7.48201 9.92469 7.0934 10.1207 6.81881 9.91782L0.615917 5.33436C0.39088 5.16807 0.390887 4.8315 0.615931 4.66522L6.81882 0.0821659Z"
                fill="black"
            />
        </svg>
    );
};

const ActionPanel = (props) => {
    return (
        <Grid container style={{ border: "1px solid black" }}>
            <Grid item>
                <Button
                    onClick={(event) => {
                        props.onClickBack();
                    }}
                    classes={{
                        root: props.classes.nextPrevButtonRoot,
                        disabled: props.classes.nextPrevButtonDisable,
                    }}
                    className={props.classes.prev}
                    color="secondary"
                    disableElevation
                >
                    <RewindArrow />
                </Button>
            </Grid>
            <Grid item>
                <Button
                    classes={{
                        root: props.classes.nextPrevButtonRoot,
                        disabled: props.classes.nextPrevButtonDisable,
                    }}
                    color="secondary"
                    disabled={!props.isPrevAvailable}
                    className={props.classes.prev}
                    onClick={props.handlePrev}
                >
                    <BackArrow />
                </Button>
            </Grid>
            <Grid item xs>
                <center>
                    <Typography className={props.classes.stepNumber}>
                        Step {props.this.state.selectedStepIndex + 1}/
                        {props.this.state.steps.length}
                    </Typography>
                </center>
            </Grid>
            <Grid item>
                <Button
                    classes={{
                        root: props.classes.nextPrevButtonRoot,
                        disabled: props.classes.nextPrevButtonDisable,
                    }}
                    color="secondary"
                    disabled={!props.isNextAvailable}
                    className={props.classes.next}
                    onClick={props.handleNext}
                >
                    <PlayArrow />
                </Button>
            </Grid>
            <Grid item>
                <Button
                    classes={{
                        root: props.classes.nextPrevButtonRoot,
                        disabled: props.classes.nextPrevButtonDisable,
                    }}
                    className={props.classes.next}
                >
                    <FastForwardArrow />
                </Button>
            </Grid>
        </Grid>
    );
};

export default ActionPanel;
