import React from "react";

const HorizontalLines = () => {
    return (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 300 10"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <line
                x1="0"
                y1="6.75"
                x2="300"
                y2="6.75"
                stroke="black"
                strokeWidth="0.5"
            />
            <line
                x1="0"
                y1="9.75"
                x2="300"
                y2="9.75"
                stroke="black"
                strokeWidth="0.5"
            />
            <line
                x1="0"
                y1="3.75"
                x2="300"
                y2="3.75"
                stroke="black"
                strokeWidth="0.5"
            />
            <line
                x1="0"
                y1="0.75"
                x2="300"
                y2="0.75"
                stroke="black"
                strokeWidth="0.5"
            />
        </svg>
    );
};

export default HorizontalLines;
