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

function Alert(props) {
    const { classes, open, yesNo, message, onOk, onCancel, title, extraButtonText, onExtraButton } = props;

    function getExtraButton() {
        if (extraButtonText) {
            return (
                <Button
                variant="contained"
                className={classes.select}
                color="secondary"
                onClick={onExtraButton}
                >
                    { extraButtonText }
                </Button>
            );
        }
    }

    function getActions() {
        if (yesNo === true) {
            return (
                <DialogActions>
                    { getExtraButton() }
                    <Button
                        variant="contained"
                        className={classes.select}
                        color="secondary"
                        onClick={onOk}
                    >
                        YES
                    </Button>
                    <Button
                        variant="contained"
                        className={classes.select}
                        color="secondary"
                        onClick={onCancel}
                    >
                        NO
                    </Button>
                </DialogActions>
            );
        } else {
            return (
                <DialogActions>
                    <Button
                        variant="contained"
                        className={classes.select}
                        color="secondary"
                        onClick={onOk}
                    >
                        OK
                    </Button>
                </DialogActions>
            );
        }
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
                {getActions()}
            </Dialog>
        </React.Fragment>
    );
}

Alert.propTypes = {
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    yesNo: PropTypes.bool,
    message: PropTypes.string.isRequired,
    onOk: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    title: PropTypes.string
};

export default withStyles(styles)(Alert);
