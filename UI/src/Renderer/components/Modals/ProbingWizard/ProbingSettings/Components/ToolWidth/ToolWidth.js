const ToolWidth = (props) => {
    if (props.featureType != "surface") {
        return (
            <Grid container item>
                <Grid item xs={4}>
                    <Typography>Tool Width</Typography>
                </Grid>
                <Grid item xs>
                    <TextField
                        value={props.toolWidth}
                        onChange={(event) => {
                            props.setToolWidth(event.target.value);
                        }}
                        fullWidth
                    />
                </Grid>
            </Grid>
        );
    } else {
        return "";
    }
};