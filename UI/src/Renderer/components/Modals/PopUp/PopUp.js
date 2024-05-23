import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import {Button, Dialog, DialogActions, DialogContent, Typography} from '@material-ui/core';

const styles = theme => ({
    cancel: {
        marginTop: theme.spacing(-1),
        marginBottom: theme.spacing(1)
    },
    select: {
        marginTop: theme.spacing(-1),
        marginBottom: theme.spacing(1)
    },
    title: {
        marginTop: theme.spacing(-2)
    },
    cncList: {
        width: "100%"
    },
    switch: {
        marginLeft: theme.spacing(-2)
    }
});

function PopUp(props) {
    const { classes, open, message, title, buttonInfo} = props;

    // buttonInfo example [{name: "quit", code: () => {function here}}, ...]

    function getButtons() {

        var buttons = [];

        for (const item of buttonInfo) {
            buttons.push( 
            <Button
                variant="contained"
                className={classes.select}
                color="secondary"
                onClick={item.code}
            >
                {item.name}
            </Button>
            );
        }

        return (
            <DialogActions>
                {buttons.map((button, index) => {
                    return <React.Fragment key={index}>{button}</React.Fragment>
                })}
            </DialogActions>
        ); 
    }

    function getTitle() {
        if (title == null) {
            return;
        }

        return (
            <React.Fragment>
                <Typography variant='h5'>{title}</Typography>
                <br/>
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <Dialog
                open={open}
                aria-labelledby="form-dialog-title"
                maxWidth="xs"
                fullWidth
            >
                <DialogContent>
                    {getTitle()}
                    <Typography style={{whiteSpace: 'pre-line'}}>{message}</Typography>
                    <br />
                </DialogContent>
                {getButtons()}
            </Dialog>
        </React.Fragment>
    );
}

PopUp.propTypes = {
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    title: PropTypes.string
};

export default withStyles(styles)(PopUp);
