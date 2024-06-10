import React from "react";
import { Grid, withStyles, IconButton, Button, Typography } from "@material-ui/core";

const ActionPanel = (props) => {
    return (
        <Grid container>
            <Grid item>
                <IconButton
                    onClick={(event) => {
                        props.onClickBack();
                    }}
                    style={{
                        padding: "0px",
                    }}
                >
                    <img
                        style={{
                            height: "33px",
                            width: "33px",
                            padding: "0px",
                        }}
                        src="./static/img/back_button.png"
                    />
                </IconButton>
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
                    &#60; Prev
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
                    Next &#62;
                </Button>
            </Grid>
            <Grid item>
                <img src="./static/img/next_milling_button.png" />
            </Grid>
        </Grid>
    );
};

export default ActionPanel;
