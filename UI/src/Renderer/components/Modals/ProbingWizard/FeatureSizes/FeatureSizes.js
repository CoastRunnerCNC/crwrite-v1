import { Grid, TextField, Typography, withStyles } from "@material-ui/core";
import React from "react";

const styles = {
    xyzTextField: { width: "50px" },
};

const FeatureSizes = (props) => {
    if (props.shape === "square") {
        return (
            <Grid container>
                <Grid item xs={3}>
                    <Typography>Width</Typography>
                    <TextField />
                </Grid>
                <Grid item xs={3}>
                    <Typography>Length</Typography>
                    <TextField />
                </Grid>
                <Grid item xs={3}>
                    <Typography>Height</Typography>
                    <TextField />
                </Grid>
                <Grid item xs={3}>
                    <Typography>Units</Typography>
                    <TextField />
                </Grid>
            </Grid>
        );
    } else if (props.shape === "circle") {
        return (
            // <Grid container>
            //     <Grid item>
            //         <Grid container>
            //             <Grid item>
            //                 <Typography>Diameter</Typography>
            //             </Grid>
            //             <Grid item>
            //                 <TextField className={props.classes.xyzTextField} />
            //             </Grid>
            //         </Grid>
            //     </Grid>
            //     <Grid item>
            //         <Grid container>
            //             <Grid item>
            //                 <Typography>Height</Typography>
            //             </Grid>
            //             <Grid item>
            //                 <TextField className={props.classes.xyzTextField} />
            //             </Grid>
            //         </Grid>
            //     </Grid>
            // </Grid>
            <>
                <Grid item style={{marginRight: '16px'}}><Typography>Feature Sizes:</Typography></Grid>
                <Grid item>
                    <Typography>Diameter</Typography>
                </Grid>
                <Grid item style={{marginLeft: '8px'}}>
                    <TextField className={props.classes.xyzTextField} />
                </Grid>
                <Grid item style={{marginLeft: '16px'}}>
                    <Typography>Height</Typography>
                </Grid>
                <Grid item style={{marginLeft: '8px'}}>
                    <TextField className={props.classes.xyzTextField} />
                </Grid>
            </>
        );
    }
};

export default withStyles(styles)(FeatureSizes);
