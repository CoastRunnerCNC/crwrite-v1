import React from 'react';
import PropTypes from 'prop-types';
import {ipcRenderer} from 'electron';
import {withStyles} from '@material-ui/core/styles';
import {Button, Dialog, Grid} from '@material-ui/core';
import Raw from './Raw';
import app from 'app';
import './ImageRaw.scss'

const styles = theme => ({
    root: {
        width: '100%',
        height: '100%',
    },
    gcodes: {
        width: '100%',
        height: 'calc(100% - 50px)',
        overflow: 'auto',
        backgroundColor: app.milling.gcodes.background,
        position: 'relative',
        border: app.milling.gcodes.border,
        color: app.milling.gcodes.color
    }
});

class ImageRaw extends React.Component {
    constructor() {
        super();
        this.state = {
            imageSelected: true,
            zoom: false,
            readWrites: []
        };

        this.gcodeEnd = null;
        this.updateReadWrites = this.updateReadWrites.bind(this);
    }

    componentDidMount() {
        ipcRenderer.removeAllListeners("Jobs::ReadWrites");
        ipcRenderer.on("Jobs::ReadWrites", this.updateReadWrites);
        ipcRenderer.removeAllListeners("ShowMillingCode");
        ipcRenderer.on("ShowMillingCode", () => {
            this.setState({ imageSelected: false });
        });
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners("Jobs::ReadWrites", this.updateReadWrites);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.selectedStep != nextProps.selectedStep) {
            this.setState({ readWrites: [] });
            return true;
        } else if (this.state.imageSelected != nextState.imageSelected) {
            return true;
        } else if (this.state.zoom != nextState.zoom) {
            return true;
        } else if (this.props.millingInProgress != nextProps.millingInProgress) {
            return true;
        } else if (this.state.readWrites != nextState.readWrites) {
            return true;
        } else if (this.props.editMode != nextProps.editMode) {
            return true;
        } else if (this.props.selectedStep.Image != nextProps.selectedStep.Image) {
            return true;
        }

        return false;
    }

    componentDidUpdate(prevProps) {
        if (this.props.selectedStep != prevProps.selectedStep) {
            this.setState({
                imageSelected: true,
                zoom: false
            });
        }
    }

    updateReadWrites(event, newLines) {
        if (newLines.length > 0) {
            this.setState({
                readWrites: [...this.state.readWrites, ...newLines]
            });
        }
    }

    render() {
        const { classes, selectedStep, millingInProgress } = this.props;
        function getImageButton(component, zoom) {
            return (
                <Button
                    className={'image-button'}
                    style={{ width: '100%', height: '100%', padding: '0px' }}
                    onClick={() => {
                        component.setState({zoom: zoom});
                    }}
                >
                    <img
                        key={Date.now()}
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                        src={`data:image/jpeg;base64,${selectedStep.Image}`}
                        alt={''} />
                </Button>
            );
        }

        function getDisplay(component) {
            if (component.state.imageSelected === true) {
                if (component.state.zoom === true) {
                    return (
                        <Dialog
                            open={component.state.zoom}
                            aria-labelledby="form-dialog-title"
                            maxWidth="md"
                            onClose={() => {
                                component.setState({zoom: false});
                            }}
                            fullWidth
                        >
                            {getImageButton(component, false)}
                        </Dialog>
                    );
                } else {
                    return getImageButton(component, true);
                }
            } else {
                return (
                    <div className={classes.gcodes} >
                        <Raw selectedStep={selectedStep} millingInProgress={millingInProgress} history={component.state.readWrites.slice()} />
                    </div>
                );
            }
        }

        function onClickImage(event) {
            this.setState({
                imageSelected: true
            });
        }

        function onClickRaw(event) {
            if (selectedStep.GCode != null) {
                this.setState({
                    imageSelected: false
                });
            }
        }

        function getButtons(component) {
            let imageButton;
            let gcodeButton;
            let imageButtonFunction;
            let gcodeButtonFunction;
            if (component.props.editMode) {
                imageButton = "EDIT IMAGE";
                imageButtonFunction = (component) => {component.props.onEditImage()}//(component) => {component.editImage()}
                gcodeButton = "EDIT GCODE";
                gcodeButtonFunction = (component) => {component.props.onEditGCode()}//(component) => {component.editGcode()}
            } else {
                imageButton = "IMAGE";
                imageButtonFunction = (component) => {onClickImage.bind(component)}
                gcodeButton = "GCODE";
                gcodeButtonFunction = (component) => {onClickRaw.bind(component)}
            }
            return (
                <React.Fragment>
                    <Grid item xs={3}>
                        <Button
                            fullWidth
                            variant="contained"
                            color={component.state.imageSelected == true ? "secondary" : "primary"}
                            size="small"
                            onClick={() => {imageButtonFunction(component)}}
                            style={{ borderRadius: '0px', padding: '0px' }}
                        >
                            {imageButton}
                        </Button>
                    </Grid>
                    <Grid item xs={3}>

                        {/*disabled={selectedStep.GCode == null ? true : false}*/}
                        <Button
                            fullWidth
                            variant="contained"
                            color={component.state.imageSelected == true ? "primary" : "secondary"}
                            size="small"
                            onClick={() => {gcodeButtonFunction(component)}}
                            style={{ borderRadius: '0px', padding: '0px' }}
                        >
                            {gcodeButton}
                        </Button>
                    </Grid>
                </React.Fragment>
            );
        }

        function scrollToBottom(component) {
            if (millingInProgress && component.gcodeEnd != null && !component.state.imageSelected) {
                component.gcodeEnd.scrollIntoView({ behavior: "auto", block: 'center' });
            }
        }
        return (
            <div className={classes.root}>
                <Grid container spacing={0}>
                    <Grid item xs={3} />
                        {/* {getButtons(this)} */}
                    <Grid item xs={3} />
                </Grid>
                <Grid container style={{ padding: '8px', paddingTop: '15px', width: '100%', height: '100%' }}>
                    <Grid id={'image-raw-display'} item xs={12} style={{ width: '100%', height: '50vh' }}>
                        {getDisplay(this)}
                        {scrollToBottom(this)}
                    </Grid>
                </Grid>
            </div>
        );
    }
};

ImageRaw.propTypes = {
    classes: PropTypes.object.isRequired,
    selectedStep: PropTypes.object.isRequired,
    millingInProgress: PropTypes.bool.isRequired
};

export default withStyles(styles)(ImageRaw);