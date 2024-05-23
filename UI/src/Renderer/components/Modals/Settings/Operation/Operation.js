import React from "react";
import PropTypes from "prop-types";
import {Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Tooltip, Checkbox} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import app from 'app';
import HelpIcon from '@material-ui/icons/Help';
import {ipcRenderer} from 'electron';

const styles = theme => ({
    timeoutText: {
        width: 100,
        height: 30,
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        marginTop: theme.spacing(1),
        color: '#ffffff'
    },
    radio: {
        marginLeft: theme.spacing(1),
        marginTop: 0,
        marginBottom: 0
    },
    radioGroup: {
        width: "100%",
        backgroundColor: "transparent",
        borderStyle: "solid",
        borderColor: app.modal.color,
        borderWidth: "2px",
        borderRadius: "2px"
    },
    feedRatePercentage: {
        marginLeft: theme.spacing(1),
        padding: theme.spacing(1),
        backgroundColor: "transparent",
        color: app.modal.color
    },
    help: {
        marginTop: '30px',
        marginLeft: '-30px'
    },
    cancel: {
        marginRight: theme.spacing(1),
        backgroundColor: app.button.cancel.backgroundColor,
        color: app.button.cancel.color
    },
    save: {
        marginLeft: theme.spacing(1),
        backgroundColor: app.button.save.backgroundColor,
        color: app.button.save.color
    }
});


class Operation extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            feedRate: null,
            pause: false,
            enableSlider: false,
            maxFeedRate: 100,
            disableLimitCatch: false,
            enableEditButton: false
        };

        this.closeDialog = this.props.closeDialog;
        this.handleClose = this.handleClose.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.getEditButtonSetting = this.getEditButtonSetting.bind(this);
    }

    componentDidMount() {
        ipcRenderer.once('Settings::GetFeedRateResponse', (event, feedrate) => {
            this.setState({
                feedRate: feedrate
            });
        });
        ipcRenderer.send("Settings::GetFeedRate")
        this.setState({
            pause: this.props.settings.pauseAfterGCode,
            enableSlider: this.props.settings.enable_slider,
            maxFeedRate: this.props.settings.maxFeedRate,
            disableLimitCatch: this.props.settings.disableLimitCatch,
            enableEditButton: this.props.settings.enableEditButton
        });
    }

    handleClose() {
        this.closeDialog();
    }

    handleSave() {
        ipcRenderer.send(
            "Settings::UpdateSettings",
            this.state.pause,
            this.state.enableSlider,
            this.state.maxFeedRate,
            this.state.disableLimitCatch,
            this.state.enableEditButton
        );

        if (!this.state.enableSlider && this.state.feedRate > 100) {
            ipcRenderer.send('Settings::SetFeedRate', 100);
        }
        this.props.updateSetting("enableEditButton", this.state.enableEditButton);
        this.closeDialog();
    }

    getEditButtonSetting() {
        if (this.props.settings.showEditButtonSetting) {
            return (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={this.state.enableEditButton}
                            onChange={e => {
                                this.setState({ enableEditButton: !this.state.enableEditButton })
                            }}
                        />
                    }
                    label="Show file edit mode button"
                />
            );
        }
    }

    render() {
        const { classes } = this.props;
        return (
            <React.Fragment>
                {/* Feedrate */}
                <FormControl
                    component="fieldset"
                    className={classes.radioGroup}
                >
                    <FormLabel
                        component="legend"
                        className={classes.feedRatePercentage}
                    >
                        <Tooltip
                            disableFocusListener={true}
                            disableTouchListener={true}
                            title='During motion, overrides the programmed feedrate by the specified percentage.'
                        >
                            <span>FeedRate Percentage <HelpIcon fontSize="small" style={{ verticalAlign: 'middle', color: app.colors.secondary }} /></span>
                        </Tooltip>
                    </FormLabel>
                    <RadioGroup>
                        <FormControlLabel
                            control={
                                <Radio
                                    checked={!this.state.enableSlider}
                                    onChange={e => this.setState({
                                        enableSlider: false,
                                        maxFeedRate: 100
                                    })}
                                    value='locked'
                                />
                            }
                            label="Locked at 100%"
                            className={classes.radio}
                        />
                        <FormControlLabel
                            control={
                                <Radio
                                    checked={this.state.enableSlider && this.state.maxFeedRate === 100}
                                    onChange={e => this.setState({
                                        enableSlider: true,
                                        maxFeedRate: 100
                                    })}
                                    value='adjustable100'
                                />
                            }
                            label="Adustable 30% - 100%"
                            className={classes.radio}
                        />
                        <FormControlLabel
                            control={
                                <Radio
                                    checked={this.state.enableSlider && this.state.maxFeedRate === 300}
                                    onChange={e => this.setState({
                                        enableSlider: true,
                                        maxFeedRate: 300
                                    })}
                                    value='adjustable300'
                                />
                            }
                            label="Adjustable 30% - 300%"
                            className={classes.radio}
                        />
                    </RadioGroup>
                </FormControl>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={this.state.disableLimitCatch}
                            onChange={e => {
                                this.setState({ disableLimitCatch: !this.state.disableLimitCatch })
                            }}
                        />
                    }
                    label="Disable warning when manual entry will trigger a limit alarm"
                />
                {this.getEditButtonSetting()}

                <br /><br /><br />

                {/* Save/Cancel Buttons */}
                <div
                    style={{ textAlign: "right", width: "100%", paddingBottom: '10px' }}
                >
                    <Button
                        variant="contained"
                        className={classes.cancel}
                        onClick={this.handleClose}
                        size="large"
                    >
                        CANCEL
                    </Button>
                    <Button
                        variant="contained"
                        className={classes.save}
                        onClick={this.handleSave}
                        size="large"
                    >
                        SAVE CHANGES
                    </Button>
                </div>
            </React.Fragment>
        );
    }
}

Operation.propTypes = {
    classes: PropTypes.object.isRequired,
    closeDialog: PropTypes.func.isRequired,
    settings: PropTypes.object.isRequired
};

export default withStyles(styles)(Operation);
