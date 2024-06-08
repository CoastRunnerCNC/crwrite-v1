import React from "react";
import { Grid, withStyles } from "@material-ui/core";

const ActionPanel = (props) => {
    return (
        <Grid container>
            <Grid item>
                <IconButton
                    onClick={(event) => {
                        onClickBack(this);
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
                        root: classes.nextPrevButtonRoot,
                        disabled: classes.nextPrevButtonDisable,
                    }}
                    color="secondary"
                    disabled={!isPrevAvailable(this)}
                    className={classes.prev}
                    onClick={handlePrev.bind(this)}
                >
                    &#60; Prev
                </Button>
            </Grid>
            <Grid item xs>
                <center>
                    <Typography className={classes.stepNumber}>
                        Step {this.state.selectedStepIndex + 1}/
                        {this.state.steps.length}
                    </Typography>
                </center>
            </Grid>
            <Grid item>
                <Button
                    classes={{
                        root: classes.nextPrevButtonRoot,
                        disabled: classes.nextPrevButtonDisable,
                    }}
                    color="secondary"
                    disabled={!isNextAvailable(this)}
                    className={classes.next}
                    onClick={handleNext.bind(this)}
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
