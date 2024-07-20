const LocationDetails = (props) => {
    if (props.featureType != "surface") {
        if (props.locationType === "midpoint-x" && props.yChecked) {
            return (
                <Grid container item>
                    <Grid item xs={4}>
                        <Typography>Location Details</Typography>
                    </Grid>
                    <Grid item xs>
                        <Select
                            onChange={(event) => {
                                props.setProbeYSide(event.target.value);
                            }}
                            fullWidth
                            value={props.probeYSide}
                        >
                            <MenuItem value="probe-y-on-left">
                                Probe Y on Left
                            </MenuItem>
                            <MenuItem value="probe-y-on-right">
                                Probe Y on Right
                            </MenuItem>
                        </Select>
                    </Grid>
                </Grid>
            );
        } else if (props.locationType === "midpoint-y" && props.xChecked) {
            return (
                <Grid container item>
                    <Grid item xs={4}>
                        <Typography>Location Details</Typography>
                    </Grid>
                    <Grid item xs>
                        <Select
                            onChange={(event) => {
                                props.setProbeXSide(event.target.value);
                            }}
                            fullWidth
                            value={props.probeXSide}
                        >
                            <MenuItem value="probe-x-on-top">
                                Probe X on Top
                            </MenuItem>
                            <MenuItem value="probe-x-on-bottom">
                                Probe X on Bottom
                            </MenuItem>
                        </Select>
                    </Grid>
                </Grid>
            );
        } else if (props.locationType === "corner") {
            return (
                <Grid container item>
                    <Grid item xs={4}>
                        <Typography>Location Details</Typography>
                    </Grid>
                    <Grid item xs>
                        <Select
                            onChange={(event) => {
                                props.setProbeCorner(event.target.value);
                            }}
                            fullWidth
                            value={props.probeCorner}
                        >
                            <MenuItem value="top-left">
                                Probe top left corner
                            </MenuItem>
                            <MenuItem value="top-right">
                                Probe top right corner
                            </MenuItem>
                            <MenuItem value="bottom-left">
                                Probe bottom left corner
                            </MenuItem>
                            <MenuItem value="bottom-right">
                                Probe bottom right corner
                            </MenuItem>
                        </Select>
                    </Grid>
                </Grid>
            );
        } else {
            return "";
        }
    }
};