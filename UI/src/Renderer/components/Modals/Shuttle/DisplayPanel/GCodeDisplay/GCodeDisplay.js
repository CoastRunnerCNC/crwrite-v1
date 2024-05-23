import { Typography } from '@material-ui/core';
import React from 'react'
import {withStyles} from '@material-ui/core';
import app from 'app';

const styles = theme => ({
    root: {
        width: '100%',
        overflow: 'hidden'
    },
    gcodes: {
        width: '-webkit-fill-available',
        height: '350px',
        overflow: 'auto',
        backgroundColor: 'black',
        position: 'relative',
        color: '#FFFFFF'
    },
    raw: {
        color: app.raw.color
    },
    timer: {
        color: '#FFFFFF',
        backgroundColor: 'black'
    }
});

const GCodeDisplay = (props) => {

    const { classes } = props;
    console.log(JSON.stringify(props.rawGCodes));

  return (
    <div className={classes.gcodes}>
        {props.rawGCodes.map((line, index) => {
            return (
                <Typography className={classes.raw} variant="body1" color="textPrimary" align="left" style={{ marginLeft: '10px' }}>
                    {line}
                </Typography>
            );
        })}
    </div>
  )
}

export default withStyles(styles)(GCodeDisplay);