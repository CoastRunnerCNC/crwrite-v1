import { Grid, Typography } from "@material-ui/core";
import React from "react";

const CustomInputLabel = (props) => {
    let padding = props.padding;
    let width = props.fitContent ? "fit-content" : "";
    return (
        <Grid
            container
            style={{
                backgroundColor: "#E2D9CE",
                border: "1px solid black",
                borderRadius: "4px",
                boxShadow: "-2px 2px 0px 0px #4A4A4A",
                width: width,
            }}
        >
            <Grid item xs={12}>
                {/* , "Agency FB" */}
                <Typography
                    align="center"
                    style={{
                        fontFamily: ["Public Sans", "sans-serif"],
                        paddingTop: "1px",
                        paddingBottom: "1px",
                        paddingLeft: "1px",
                        paddingRight: "1px",
                    }}
                >
                    {props.children}
                </Typography>
            </Grid>
        </Grid>
    );
};

export default CustomInputLabel;
