import { Grid, TextField } from '@material-ui/core'
import React from 'react'

const FeatureSizes = (props) => {
    if (props.shape === "square") {
        return (
            <Grid container>
                <Grid item xs={3}>
                    <TextField />
                </Grid>
                <Grid item xs={3}>
                    <TextField />
                </Grid>
                <Grid item xs={3}>
                    <TextField />
                </Grid>
                <Grid item xs={3}>
                    <TextField />
                </Grid>
            </Grid>
          )
    } else if (props.shape === "circle") {
        return (
            <Grid container>
                <Grid item xs={6}>
                    <TextField />
                </Grid>
                <Grid item xs={6}>
                    <TextField />
                </Grid>
            </Grid>
          )
    }

}

export default FeatureSizes