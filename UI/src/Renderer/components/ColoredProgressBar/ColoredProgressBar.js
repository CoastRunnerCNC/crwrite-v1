import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import { LinearProgress } from '@material-ui/core';

const styles = theme => ({
    colorPrimary: {
        backgroundColor: '#AA0000'
    },
    barColorPrimary: {
        backgroundColor: '#FF0000'
    }
});

class ColoredProgressBar extends React.Component {
    render() {
        const { classes, error } = this.props;
        return <LinearProgress {...this.props}
         color={error ? 'primary' : 'secondary'}
         classes={{colorPrimary: classes.colorPrimary, barColorPrimary: classes.barColorPrimary}}/>;
    }
}

ColoredProgressBar.propTypes = {
    classes: PropTypes.object.isRequired,
    error: PropTypes.bool.isRequired
};

export default withStyles(styles)(ColoredProgressBar);