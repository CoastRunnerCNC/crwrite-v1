import React from "react";
import ItemPanel from "../../../components/ItemPanel/ItemPanel";
import { Box } from "@material-ui/core";

const JoggingPanel = () => {
    return (
        <ItemPanel
        title="Jogging"
        small
        contentStyle={{
            padding: "8px",
        }}
        >
            {/* Main grid container */}
            <Box
                style={{
                    display: "grid",
                    gridTemplateRows: "160px 32px 1fr",
                    gridTemplateColumns: "1fr",
                }}
            >
                {/* Jog controls container */}
                <Box style={{
                    display: "grid",

                }}>
                    {/* x controls */}
                    <Box></Box>

                    {/* svg */}
                    <Box></Box>

                    {/* z controls */}
                    <Box></Box>

                    {/* y controls */}
                    <Box></Box>
                </Box>
                <Box>HorizontalLines</Box>
                <Box>jogging settings - flexbox</Box>
            </Box>
        </ItemPanel>
    );
};

export default JoggingPanel;
