import React from "react";
import PropTypes from "prop-types";
import {Tab, Tabs, Badge} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import app from 'app';

const styles = theme => ({
    indicator: {
        backgroundColor: ''
    }
});

function SettingsTabs(props) {
    const { classes, selectTab, selectedTab } = props;

    return (
        <Tabs
            // className={classes.indicator}
            value={selectedTab}
            onChange={(e, value) => { selectTab(value); }}
            indicatorColor="secondary"
            textColor="primary"
            centered
        >
            <Tab label="Operation Settings" />
            <Tab label="Machine Actions" />
            <Tab label={<Badge color="error" variant="dot" invisible={!props.firmwareAvailable}>Software</Badge>} />
        </Tabs>
    );
}

SettingsTabs.propTypes = {
    classes: PropTypes.object.isRequired,
    selectTab: PropTypes.func.isRequired,
    selectedTab: PropTypes.number.isRequired
};

export default withStyles(styles)(SettingsTabs);
