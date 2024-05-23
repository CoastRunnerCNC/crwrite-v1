import React from 'react';
import PropTypes from "prop-types";
import {Grid, Typography, Button} from '@material-ui/core';
import path from 'path';
import {ipcRenderer} from 'electron';
import app from 'app';
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import FormControl from "@material-ui/core/FormControl";
import {withStyles} from "@material-ui/core/styles";
import {Dialog, DialogTitle, DialogContent} from '@material-ui/core';

const styles = theme => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 50,
        classKey: 'fullWidth',
        variant: 'outlined',
        border: app.formControl.border,
        open: false
    }
});

class ShuttleSettings extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            command_keys: null,
            actionToUpdate: ''
        }

        this.keydownListener = this.keydownListener.bind(this);
    }

    keydownListener(event) {
        if (this.state.actionToUpdate != '') {
            for (let [key, value] of Object.entries(this.state.command_keys)) {
                if (value === event.key) {
                    return;
                }
            }

            var command_keys = this.state.command_keys;
            command_keys[this.state.actionToUpdate] = event.key;
            ipcRenderer.send('CNC::SetShuttleKeys', command_keys);

            this.setState({
                actionToUpdate: '',
                command_keys: command_keys
            });
            this.props.refreshShuttleKeys();
        }
    }

    componentDidMount() {
        ipcRenderer.once('CNC::GetShuttleKeysResponse', (event, command_keys) => {
            this.setState({
                command_keys: command_keys
            });
        });
        ipcRenderer.send('CNC::GetShuttleKeys');

        window.addEventListener('keydown', this.keydownListener, true);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.keydownListener, true);
    }

    render() {

        function getCommandKey(value) {
            if (this.state.command_keys == null) {
                return '';
            } else {
                return this.state.command_keys[value];
            }
        }

        function getTextField(command_key, label) {
            const style = {cursor: 'pointer', color: app.modal.color};
            const isSelected = this.state.actionToUpdate === command_key;

            if (isSelected) {
                style.backgroundColor = app.colors.secondary;
            }

            return (
                <FormControl
                    className={this.props.classes.formControl}
                    fullWidth
                    style={style}
                    onClick={
                        () => {
                            if (isSelected) {
                                this.setState({actionToUpdate: ''})
                            } else {
                                this.setState({actionToUpdate: command_key});
                            }
                        }
                    }>
                    <InputLabel id={`${command_key}-input`}>{label}</InputLabel>
                    <Input
                        id={`${command_key}-input`}
                        className="shuttle-settings-input"
                        inputRef={input => input && input.blur()}
                        value={getCommandKey.call(this, command_key)}
                        disabled
                        fullWidth
                        inputProps={{style: style}}
                    />
                </FormControl>
            );
        }

        function displayY() {
            return (
                <React.Fragment>

                    {/* Gantry Left (Y) */}
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            {getTextField.call(this, 'gantry_left', 'Gantry Left(Y)')}
                        </Grid>
                    </Grid>

                    {/* Gantry Right (Y) */}
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            {getTextField.call(this, 'gantry_right', 'Gantry Right(Y)')}
                        </Grid>
                    </Grid>

                </React.Fragment>
            );
        }

        function displayZ() {
            return (
                <React.Fragment>

                    {/* Retract Z */}
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            {getTextField.call(this, 'retract', 'Retract Z')}
                        </Grid>
                    </Grid>

                    {/* Plunge Z */}
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            {getTextField.call(this, 'plunge', 'Plunge Z')}
                        </Grid>
                    </Grid>

                </React.Fragment>
            );
        }

        function displayX() {
            return (
                <React.Fragment>

                    {/* Raise Table (X) */}
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            {getTextField.call(this, 'raise_table', 'Raise Table(X)')}
                        </Grid>
                    </Grid>

                    {/* Lower Table (X) */}
                    <Grid container spacing={1}>
                        <Grid item xs={12}>
                            {getTextField.call(this, 'lower_table', 'Lower Table(X)')}
                        </Grid>
                    </Grid>

                </React.Fragment>
            );
        }

        return (


            <Dialog
            id="shuttle-dialog"
            open={this.props.open}
            aria-labelledby="form-dialog-title"
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle id="form-dialog-title">
                <Grid container>
                    <Grid item xs={1} />
                    <Grid item xs={10}>
                        <center>
                            Key Bindings
                        </center>
                    </Grid>
                    <Grid item xs={1}>
                        <Button onClick={this.props.close}>X</Button>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogContent className={'no-scroll'}>
            <Typography style={{ margin: '20px' }} align="center">Click a box, then press a key to set a keybinding.</Typography>
                <Grid container spacing={1} justify='center'>
                    <Grid item xs={6}>
                        {displayX.call(this)}
                    </Grid>
                    <Grid item xs={6}>
                        {displayZ.call(this)}
                    </Grid>
                    <Grid item xs={6}>
                        {displayY.call(this)}
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
        );
    }
}

ShuttleSettings.propTypes = {
    //closeDialog: PropTypes.func.isRequired
};

export default withStyles(styles)(ShuttleSettings);
