import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import app from 'app';

const styles = theme => ({
  root: {
    backgroundImage: `url(${app.dashboard.background})`,
    backgroundSize: 'cover',
    backgroundPosition: '10% 50%',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    position: 'fixed',
    left: 0,
    top: 0,
    z: -1,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    verticalAlign: 'middle',
  },
});

function BackgroundPhoto(props) {
  const {classes} = props;
  console.log(classes);
  console.log(app.dashboard.background);
  console.log(classes.root);
  return (
    <div className={classes.root}></div>
  );
}

export default withStyles(styles)(BackgroundPhoto);