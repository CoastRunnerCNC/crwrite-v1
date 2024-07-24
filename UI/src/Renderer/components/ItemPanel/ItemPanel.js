import React from "react";
import { Typography, Grid, Box } from "@material-ui/core";
import LineBox from "./LineBox/LineBox";

const ItemPanel = (props) => {
    let titleSize = props.small ? "subtitle1" : "h4";
    let svgHeight = props.small ? "12" : "12";
    let titleBarPadding = props.small ? "4px 4px 0px 4px" : "3px 5px";

    const MinimizeIcon = () => {
        let minimizeBackgroundColor =
            props.color === "secondary" ? "white" : "#E2D9CE";

        return (
            <svg
                style={{ display: "block" }}
                width={svgHeight}
                height={svgHeight}
                viewBox="0 0 6 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M0.146447 0.646447C0.341709 0.451184 0.658291 0.451184 0.853553 0.646447L3 2.79289L5.14645 0.646447C5.34171 0.451184 5.65829 0.451184 5.85355 0.646447C6.04882 0.841709 6.04882 1.15829 5.85355 1.35355L3.70711 3.5L5.85355 5.64645C6.04882 5.84171 6.04882 6.15829 5.85355 6.35355C5.65829 6.54882 5.34171 6.54882 5.14645 6.35355L3 4.20711L0.853553 6.35355C0.658291 6.54882 0.341709 6.54882 0.146447 6.35355C-0.0488155 6.15829 -0.0488155 5.84171 0.146447 5.64645L2.29289 3.5L0.146447 1.35355C-0.0488155 1.15829 -0.0488155 0.841709 0.146447 0.646447Z"
                    fill="black"
                />
            </svg>
        );
    };

    let style = {
        border: "2px solid black",
        boxShadow: "2px 2px 0px 0px #000000",
    };

    return (
        <Box
            style={{
                ...style,
                ...props.style,
                display: "grid",
                gridTemplateColumns: "1fr",
                gridTemplateRows: "24px 1fr",
            }}
        >
            <Box>
                <Grid container alignItems="center">
                    <Grid
                        item
                        style={{ padding: "3px", border: "1px solid black" }}
                    >
                        <MinimizeIcon />
                    </Grid>
                    <Grid item xs>
                        <LineBox />
                    </Grid>
                    <Grid item>
                        <Typography
                            component="span"
                            variant={titleSize}
                            style={{
                                fontFamily: [
                                    "ChicagoFLF",
                                    "Public Sans",
                                    "sans-serif",
                                ],
                                fontWeight: "bold",
                            }}
                        >
                            {props.title}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            <Box
                style={{
                    ...props.contentStyle,
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gridTemplateRows: "1fr",
                }}
            >
                {props.children}
            </Box>
        </Box>
    );
};

export default ItemPanel;
