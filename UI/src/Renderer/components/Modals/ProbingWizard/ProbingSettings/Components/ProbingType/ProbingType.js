const ProbingType = (props) => {
    const onChangeProbingType = (event) => {
        props.setProbingType(event.target.value);
    };
    return (
        <Grid container item>
            <Grid item xs={4}>
                <Typography>Probing Type</Typography>
            </Grid>
            <Grid item xs>
                <Select
                    value={props.probingType}
                    onChange={onChangeProbingType}
                    fullWidth
                >
                    <MenuItem value="electrical">Electrical</MenuItem>
                    <MenuItem disabled value="manual">
                        Manual
                    </MenuItem>
                </Select>
            </Grid>
        </Grid>
    );
};