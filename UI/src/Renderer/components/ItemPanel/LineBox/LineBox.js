import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';

const styles = theme => ({
  box: {
    position: 'relative',
    width: '100%', // Adjust the width as needed
    height: '16px', // Adjust the height as needed
    backgroundColor: '#F6F6F6', // Adjust the background color as needed
    margin: '0px',
    '&::before, &::after, & $line1, & $line2, & $line3': {
      content: '""',
      position: 'absolute',
      left: 0,
      width: '100%',
      height: '1px',
      backgroundColor: '#000000',
    },
    '&::before': {
      top: 0,
    },
    '&::after': {
      bottom: 0,
    },
  },
  line1: {
    top: '25%',
    transform: 'translateY(-50%)',
  },
  line2: {
    top: '50%',
    transform: 'translateY(-50%)',
  },
  line3: {
    top: '75%',
    transform: 'translateY(-50%)',
  },
});

const LineBox = ({ classes }) => {
  return (
    <Box className={classes.box}>
      <div className={classes.line1}></div>
      <div className={classes.line2}></div>
      <div className={classes.line3}></div>
    </Box>
  );
};

export default withStyles(styles)(LineBox);
