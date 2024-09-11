import React from 'react';
import PropTypes from 'prop-types';
import {ipcRenderer} from 'electron';
import {withStyles} from '@material-ui/core/styles';
import {Typography} from '@material-ui/core';
import app from 'app';

const styles = theme => ({
    root: {
        width: '100%',
        overflow: 'hidden'
    },
    gcodes: {
        width: '-webkit-fill-available',
//        height: '330px',
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

class Raw extends React.Component {

    constructor(props) {
        super(props);
        let history = [];
        if (props.history !== undefined) { history = props.history; }
        this.state = {
            zoom: false,
            readWrites: history
        };

        this.gcodeEndRef = React.createRef();
        this.haltAutoScroll = false;
        this.updateReadWrites = this.updateReadWrites.bind(this);
        this.onOutputScroll = this.onOutputScroll.bind(this);
        this.scrolledToBottom = false;
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.selectedStep != nextProps.selectedStep) {
            return true;
        } else if (this.props.millingInProgress != nextProps.millingInProgress) {
            return true;
        } else if (this.state.readWrites != nextState.readWrites) {
            return true;
        } else if (this.props.milling != nextProps.milling) {
            return true;
        } else if (this.props.elapsedSeconds != nextProps.elapsedSeconds) {
            return true;
        }

        return false;
    }

    componentDidUpdate(prevProps) {
        this.scrollToBottom();
        if (this.props.selectedStep != prevProps.selectedStep) {
            this.setState({
                readWrites: []
            });
        }
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    componentWillUnmount() {
        ipcRenderer.removeListener("Jobs::ReadWrites", this.updateReadWrites);
    }

    scrollToBottom() {
        if (this.props.millingInProgress && this.gcodeEndRef.current != null && !this.haltAutoScroll) {
            this.gcodeEndRef.current.scrollIntoView({behavior: "auto", block: 'center'});

            if (!this.scrolledToBottom) {
                this.scrolledToBottom = true;
            }
        }
    }

    updateReadWrites(event, newLines) {
        if (newLines.length > 0) {
            let readWrites = this.state.readWrites.concat(newLines);

            // this ensures the output window only has as many as 50 readWrites
            if (readWrites.length > 1000) {
                readWrites = readWrites.slice(readWrites.length - 50, readWrites.length);
            }

            this.setState({
                readWrites: readWrites
            });

            if (this.props.externalHistory) {
                this.props.setHistory(readWrites);
            }
        }
    }

    onOutputScroll(event) {
        let element = event.nativeEvent.target;
        const scrollMargin = 3; // pixels
        let isAtBottom = element.scrollHeight - element.scrollTop - element.clientHeight < scrollMargin;    // CAUTION: Floating point imprecision; cannot use exact equality

        if (this.scrolledToBottom) {
            this.haltAutoScroll = !isAtBottom;
        }
    }

    render() {
        const { classes, selectedStep, millingInProgress, height } = this.props;
        ipcRenderer.removeListener("Jobs::ReadWrites", this.updateReadWrites);
        ipcRenderer.on("Jobs::ReadWrites", this.updateReadWrites);

        function getGCodeDisplay(milling, readWrites) {
            if (milling) {
                return readWrites.map((readWrite, index) => {
                    return (
                        <Typography className={classes.raw} variant="body1" color="textPrimary" key={index} align="left" style={{ marginLeft: '10px' }}>
                            {readWrite.TYPE} : {readWrite.VALUE}
                        </Typography>
                    )
                });
            } else {
                var gcodes = [];
                if (selectedStep.GCode != null) {
                    gcodes = selectedStep.GCode;
                }

                return gcodes.map((gcode, index) => {
                    return (
                        <Typography className={classes.raw} variant="body1" color="textPrimary" key={index} align="left" style={{ marginLeft: '10px' }}>
                            {gcode}
                        </Typography>
                    )
                });
            }
        }

        function getDisplay(component) {
            return (
                <div className={classes.gcodes} style={{height: height}} onScrollCapture={component.onOutputScroll}>
                    {getGCodeDisplay(millingInProgress, component.state.readWrites)}
                    <div style={{float: "left", clear: "both"}} ref={component.gcodeEndRef}>
                    </div>
                </div>
            );
        }

        return (
            <div className={classes.root}>
                {getDisplay(this)}
            </div>
        );
    }
}

Raw.propTypes = {
    classes: PropTypes.object.isRequired,
    //selectedStep: PropTypes.object.isRequired,
    millingInProgress: PropTypes.bool.isRequired
};

export default withStyles(styles)(Raw);
