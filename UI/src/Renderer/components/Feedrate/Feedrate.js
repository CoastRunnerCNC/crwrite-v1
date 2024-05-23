import React from 'react';
import PropTypes from 'prop-types';
import {ipcRenderer} from 'electron';
import {Paper, Typography, Grid} from '@material-ui/core';
import {withStyles} from "@material-ui/core/styles";
import {fade} from "@material-ui/core/styles/colorManipulator";
import Slider from "@material-ui/core/Slider";
import TextField from "@material-ui/core/TextField";
import app from 'app';


const StyledSlider = withStyles({
    thumb: {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid #75327e',
        '&$focused, &:hover': {
            boxShadow: `0px 0px 0px ${8}px ${fade('#de235b', 0.16)}`,
        },
        '&$activated': {
            boxShadow: `0px 0px 0px ${8 * 1.5}px ${fade('#de235b', 0.16)}`,
        },
        '&$jumped': {
            boxShadow: `0px 0px 0px ${8 * 1.5}px ${fade('#de235b', 0.16)}`,
        }
    },
    track: {
        backgroundColor: app.colors.secondary,
        height: 8,
    },
    trackAfter: {
        backgroundColor: '#d0d7dc',
    },
    focused: {},
    activated: {},
    jumped: {},
})(Slider);

class Feedrate extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            feedRate: this.props.feedRate,
            feedRate2: 30
        };
    }

    componentDidUpdate(prevProps) {
        if ((this.props.selectedStep != prevProps.selectedStep) || (this.props.feedRate != prevProps.feedRate)) {
            ipcRenderer.once("Settings::GetSettingsResponse", (event, settings) => {
                this.setState({
                    settings: settings
                });
            });
            ipcRenderer.send('Settings::GetSettings');
            //Not sure why this is here. Needs investigating
            this.setState({
                feedRate: this.props.feedRate,
                feedRate2: this.props.feedRate,
            });
        }
    }

    componentDidMount() {
        ipcRenderer.once("Settings::GetSettingsResponse", (event, settings) => {
            this.setState({
                settings: settings
            })
        });
        ipcRenderer.send('Settings::GetSettings');
        this.setState({
            feedRate2: this.props.feedRate
        });
    }

    render() {

        if (this.state.settings == null || this.state.settings.enable_slider != true) {
            return "";
        }

        const handleChange = (event, newValue) => {
            if (newValue) {
                this.setState({ feedRate: newValue, feedRate2: newValue });
            }
        };

        const handleNumberInputChange = (event, newValue) => {
            if (newValue < 30) {
                newValue = 30;
            } else if (newValue > maxFeedRate) {
                newValue = maxFeedRate;
            }
            handleChange(event, newValue);
            this.props.updateFeedRate(newValue);
        }

        const maxFeedRate = this.state.settings.maxFeedRate;

        return (
            <React.Fragment>
                <Paper style={{width: 'calc(100%-48px)', padding: 24}}>
                    <Grid container>
                        <Grid item xs={8}>
                            <StyledSlider
                            value={this.state.feedRate}
                            min={30}
                            max={maxFeedRate}
                            step={2}
                            aria-labelledby="label"
                            onChange={handleChange}
                            onChangeCommitted={(event, value) => { this.props.updateFeedRate(value); }}
                            />
                        </Grid>
                        <Grid item xs={4} style={{marginTop: 8}}>
                            <TextField
                                value={this.state.feedRate2} 
                                min={30}
                                max={maxFeedRate}
                                size="small"
                                type="text"
                                onChange={ (event) => this.setState({feedRate2: event.target.value})}
                                onBlur={ (event) => { handleNumberInputChange({}, parseInt(event.target.value)) }}
                                onKeyDown={ (event) => { event.key === 'Enter' ? handleNumberInputChange({}, parseInt(event.target.value)) : "" }}
                                className="text-box feed-rate"
                                id="feed-rate-input-label"
                                style={{color: app.modal.color, width: 40}}
                                inputProps={{style: {color: app.modal.color}}}
                            />
                            <Typography color="textPrimary" display="inline">%</Typography>
                        </Grid>
                    </Grid>
                </Paper>
            </React.Fragment>
        );
    }
}

Feedrate.propTypes = {
    selectedStep: PropTypes.number.isRequired
};

export default Feedrate;