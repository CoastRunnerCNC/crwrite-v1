import React from "react";
import PropTypes from "prop-types";
import {createMuiTheme, Fab, MuiThemeProvider, Typography} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import {red, yellow} from "@material-ui/core/colors";
import StatusIcon from "@material-ui/icons/Lens";
import app from 'app';

const styles = theme => ({
    leftRightPadding: {
        padding: theme.spacing(1),
    },
    statusSection: {
        textTransform: 'uppercase',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    statusText: {
        color: app.toolbar.status.statusTextColor
    }
});

function Status(props) {
    const { classes, status } = props;


    const statusTheme = createMuiTheme({
        palette: {
            primary: {
                main: app.colors.secondary,
            },
            secondary: yellow,
            error: red
        },
        typography: {
            useNextVariants: true,
            body1: {
                fontSize: 14
            }
        }
    });

    function getColor() {
        var color = "error";

        if (status === 1) {
            color = "secondary";
        } else if (status === 2) {
            color = "primary";
        }

        return color;
    }

    function getStatusText() {
        var statusText = "Not Connected";

        if (status === 1) {
            statusText = "Connecting";
        } else if (status === 2) {
            statusText = "Connected";
        } else if (status === -1) {
            statusText = "Connect Failed";
        }

        return statusText;
    }

    return (
        <React.Fragment>
            <MuiThemeProvider theme={statusTheme}>
                <div className={classes.statusSection}>
                    <StatusIcon color={getColor()} style={{ width: "18px" }} />
                    <Typography variant="body1" color={getColor()}>
                        <b>
                            <span className={classes.leftRightPadding} style={{ color: '#ffffff' }}>
                                {app.toolbar.status.label}
                            </span>
                            <span className={classes.statusText}>
                                {getStatusText()}
                            </span>

                        </b>
                    </Typography>
                </div>
            </MuiThemeProvider>
        </React.Fragment>
    );
}

Status.propTypes = {
    classes: PropTypes.object.isRequired,
    status: PropTypes.number.isRequired
};

export default withStyles(styles)(Status);
