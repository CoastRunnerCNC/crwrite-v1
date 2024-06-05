import { Grid, TextField } from '@material-ui/core'
import React from 'react'
import CustomInputLabel from '../../Shuttle/CustomInputLabel/CustomInputLabel'

const FeatureSizes = (props) => {
    if (props.shape === "square") {
        return (
            <Grid container>
                <Grid item xs={3}>
                    <TextField />
                    <CustomInputLabel>
                        Width
                    </CustomInputLabel>
                </Grid>
                <Grid item xs={3}>
                    <TextField />
                    <CustomInputLabel>
                        Length
                    </CustomInputLabel>
                </Grid>
                <Grid item xs={3}>
                    <TextField />
                    <CustomInputLabel>
                        Height
                    </CustomInputLabel>
                </Grid>
                <Grid item xs={3}>
                    <TextField />
                    <CustomInputLabel>
                        Units
                    </CustomInputLabel>
                </Grid>
            </Grid>
          )
    } else if (props.shape === "circle") {
        return (
            <Grid container>
                <Grid item xs={6}>
                    <TextField />
                    <CustomInputLabel>
                        Diameter
                    </CustomInputLabel>
                </Grid>
                <Grid item xs={6}>
                    <TextField />
                    <CustomInputLabel>
                        Height
                    </CustomInputLabel>
                </Grid>
            </Grid>
          )
    }

}

export default FeatureSizes