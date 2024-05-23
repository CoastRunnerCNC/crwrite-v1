import React from 'react';
import PropTypes from 'prop-types';
import withStyles from '@material-ui/core/styles/withStyles';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography} from '@material-ui/core';
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import _ from "underscore";

const styles = theme => ({
    cancel: {
        marginTop: theme.spacing(-1),
        marginBottom: theme.spacing(1)
    },
    select: {
        marginTop: theme.spacing(-1),
        marginBottom: theme.spacing(1)
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    }
});

class StartMilling extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            open: props.open,
            loading: false
        };
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps.open, this.props.open)) {
            this.setState({loading: false});
        }
    }

    render() {
        return (
            <React.Fragment>
                <Dialog
                    open={this.props.open}
                    aria-labelledby="form-dialog-title"
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{style: {overflow:'hidden'}}}
                >
                    <DialogTitle>
                        <center>
                            START MOVING
                        </center>
                    </DialogTitle>
                    <DialogContent>
                        <Typography align="center">The machine is about to start moving. Are you sure you<br />want to continue?</Typography>
                        <Backdrop className={this.props.classes.backdrop} open={this.state.loading}>
                            <CircularProgress color="inherit" />
                        </Backdrop>
                    </DialogContent>
                    <DialogActions>
                        <Grid container spacing={1} justify="center">
                            <Grid item xs={3}>
                                <Button
                                    variant="contained"
                                    className={this.props.classes.cancel}
                                    onClick={() => {
                                        this.props.onClose(false);
                                    }}
                                    fullWidth
                                >
                                    CANCEL
                                </Button>
                            </Grid>
                            <Grid item xs={3}>
                                <Button
                                    variant="contained"
                                    className={this.props.classes.select}
                                    color="secondary"
                                    onClick={() => {
                                        this.setState({loading: true});
                                        this.props.onClose(true);
                                    }}
                                    fullWidth
                                >
                                    START
                                </Button>
                            </Grid>
                        </Grid>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

StartMilling.propTypes = {
    classes: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
};

export default withStyles(styles)(StartMilling);
