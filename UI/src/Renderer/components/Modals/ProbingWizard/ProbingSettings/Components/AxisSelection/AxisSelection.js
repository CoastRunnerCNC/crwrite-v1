const AxisSelection = (props) => {
    // if (props.featureType != "surface") {
    return (
        <Grid item container alignItems="center">
            <Grid item xs={4}>
                <Typography>Axis Selection:</Typography>
            </Grid>
            <Grid item>
                <Grid container alignItems="center">
                    {props.featureType != "surface" && (
                        <>
                            {" "}
                            <Grid item>
                                <Typography>X</Typography>
                            </Grid>
                            <Grid item>
                                <Checkbox
                                    checked={props.xChecked}
                                    value="checkedX"
                                    onChange={(event) => {
                                        props.setXChecked(!props.xChecked);
                                    }}
                                />
                            </Grid>
                            <Grid item>
                                <Typography>Y</Typography>
                            </Grid>
                            <Grid item>
                                <Checkbox
                                    checked={props.yChecked}
                                    value="checkedY"
                                    onChange={(event) => {
                                        props.setYChecked(!props.yChecked);
                                    }}
                                />
                            </Grid>
                        </>
                    )}

                    <Grid item>
                        <Typography>Z</Typography>
                    </Grid>
                    <Grid item>
                        <Checkbox
                            checked={props.zChecked}
                            value="checkedZ"
                            onChange={(event) => {
                                props.setZChecked(!props.zChecked);
                            }}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};