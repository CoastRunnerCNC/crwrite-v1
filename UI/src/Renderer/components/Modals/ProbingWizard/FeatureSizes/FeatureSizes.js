import { Grid, TextField, Typography, withStyles } from "@material-ui/core";
import React from "react";

const styles = {
    xyzTextField: { width: "50px" },
};

const FeatureSizes = (props) => {
    if (props.featureType != "surface") {
        if (props.shape === "square") {
            return (
                <Grid container>
                    <Grid item xs={6}>
                        <Typography>Width</Typography>
                        <TextField
                            value={props.featureWidth}
                            onChange={(event) => {
                                props.setFeatureWidth(event.target.value);
                            }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography>Length</Typography>
                        <TextField
                            value={props.featureLength}
                            onChange={(event) => {
                                props.setFeatureLength(event.target.value);
                            }}
                        />
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
                    <Grid item style={{ marginRight: "16px" }}>
                        <Typography>Feature Sizes:</Typography>
                    </Grid>
                    <Grid item>
                        <Typography>Diameter</Typography>
                    </Grid>
                    <Grid item style={{ marginLeft: "8px" }}>
                        <TextField
                            className={props.classes.xyzTextField}
                            value={props.featureDiameter}
                            onChange={(event) => {
                                props.setFeatureDiameter(event.target.value);
                            }}
                        />
                    </Grid>
                </>
            );
        }
    } else {
        return "";
    }
};

export default withStyles(styles)(FeatureSizes);
