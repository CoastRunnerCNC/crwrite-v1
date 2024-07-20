const AdditionalOffsets = (props) => {
    return (
        <Grid item>
            <Typography>Additional Offset:</Typography>
            <Grid container justify="space-between">
                {props.featureType != "surface" && (
                    <>
                        <Grid item>
                            <Grid container>
                                <Grid
                                    item
                                    className={props.classes.xyzLabelMargin}
                                >
                                    <Typography>X</Typography>
                                </Grid>
                                <Grid item>
                                    <TextField
                                        value={props.xOffset}
                                        onChange={(event) => {
                                            props.setXOffset(
                                                event.target.value
                                            );
                                        }}
                                        className={props.classes.xyzOffset}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid container>
                                <Grid
                                    item
                                    className={props.classes.xyzLabelMargin}
                                >
                                    <Typography>Y</Typography>
                                </Grid>
                                <Grid item>
                                    <TextField
                                        value={props.yOffset}
                                        onChange={(event) => {
                                            props.setYOffset(
                                                event.target.value
                                            );
                                        }}
                                        className={props.classes.xyzOffset}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </>
                )}
                <Grid item>
                    <Grid container>
                        <Grid item className={props.classes.xyzLabelMargin}>
                            <Typography>Z</Typography>
                        </Grid>
                        <Grid item>
                            <TextField
                                value={props.zOffset}
                                onChange={(event) => {
                                    props.setZOffset(event.target.value);
                                }}
                                className={props.classes.xyzOffset}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};