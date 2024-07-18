import { ipcRenderer } from "electron";
import React from "react";

const ProbingManager = (props) => {
    // NOTES ON USING THE PROBE WIZARD:
    // 1. Be very careful of using in any "tight spaces", including small holes, shallow holes, etc. Probe wizard expects it has some room to move around
    // 2. Best to use with tools that have shank size same as cutter size
    // 3. Be careful with stickout. Stickout should be at least 10mm

    // TODO
    // Handle pocket too small, protrusion too small
    // FUTURE
    // Safety mode: all movements will be done as slow probes and we'll "feel around" for the right location to avoid crashes
    // High-Accuracy mode: do a second slow probe
    // Double-check mode: probe results twice and average or something
    // Expert mode: probe without safeties

    const convertNames = (name) => {
        switch (name) {
            case "rectangleProtrusion":
                return RECT_PROTRUSION;
            case "circleProtrusion":
                return CIRCLE_PROTRUSION;
            case "rectanglePocket":
                return RECT_POCKET;
            case "circlePocket":
                return CIRCLE_POCKET;
            case "midpoint-x":
                return MIDPOINT_X;
            case "midpoint-y":
                return MIDPOINT_Y;
            case "midpoint-x-y":
                return MIDPOINT_X_Y;
            case "corner":
                return CORNER;
            case "top-left":
                return TOP_LEFT;
            case "top-right":
                return TOP_RIGHT;
            case "bottom-left":
                return BOTTOM_LEFT;
            case "bottom-right":
                return BOTTOM_RIGHT;
            case "probe-y-on-left":
                return LEFT_EDGE;
            case "probe-y-on-right":
                return  RIGHT_EDGE;
            case "probe-x-on-top":
                return TOP_EDGE;
            case "probe-x-on-bottom":
                return BOTTOM_EDGE;
            case "electrical":
                return ELECTRICAL;
            case "manual":
                return MANUAL;
            case "G54":
                return 1;
            case "G55":
                return 2;
            case "G56":
                return 3;
            case "G57":
                return 4;
            case "G58":
                return 5;
            case "G59":
                return 6;
        }
    }

    const RECT_PROTRUSION = 1;
    const CIRCLE_PROTRUSION = 2;
    const RECT_POCKET = 3;
    const CIRCLE_POCKET = 4;
    const SURFACE = 5;

    const MIDPOINT_X = 1;
    const MIDPOINT_Y = 2;
    const MIDPOINT_X_Y = 3;
    const CORNER = 4;

    const TOP_LEFT = 1;
    const TOP_RIGHT = 2;
    const BOTTOM_LEFT = 3;
    const BOTTOM_RIGHT = 4;

    const LEFT_EDGE = 1;
    const RIGHT_EDGE = 2;

    const TOP_EDGE = 1;
    const BOTTOM_EDGE = 2;

    const POCKET_TOP = 1;
    const POCKET_BOTTOM = 2;

    const ELECTRICAL = 1;
    const MANUAL = 2;

    const G54 = 1;
    const G55 = 2;
    const G56 = 3;
    const G57 = 4;
    const G58 = 5;
    const G59 = 6;

    const WCS = [
        [G54, "G54"],
        [G55, "G55"],
        [G56, "G56"],
        [G57, "G57"],
        [G58, "G58"],
        [G59, "G59"],
    ];

    let probe_feature = convertNames(props.featureType);
    let probe_location = convertNames(props.locationType);
    let corner = convertNames(props.probeCorner);
    let axes = ["X"];
    let midpoint_x_y = convertNames(props.probeYSide);
    let midpoint_y_x = convertNames(props.probeXSide);
    let pocket_z = null;
    let probe_type = convertNames(props.probingType);
    let tool_diameter = parseFloat(props.toolWidth);
    let wcs = convertNames(props.wcs);
    let wcs_addl = wcs < 6 ? wcs + 1 : 1;
    let width = parseFloat(props.featureWidth);
    let length = parseFloat(props.featureLength);
    let diameter = parseFloat(props.featureDiameter);
    let height = null;
    let x_offset = parseFloat(props.xOffset);
    let y_offset = parseFloat(props.yOffset);
    let z_offset = parseFloat(props.zOffset);

    let cornerXSign = null;
    let cornerYSign = null;
    let xToClear = null;
    let yToClear = null;
    let travelDirection = null;



    const sendGCodeLine = (line) => {
        ipcRenderer.send("CNC::ExecuteCommand", line);
    };

    function get_wcs_from_offset(offset) {
        for (let w of WCS) {
            if (w[0] === offset) {
                return w[1];
            }
        }
    }

    function main() {
        // Skipping get_input function as per the user's request

        let output = "";

        // Install first tool
        if (probe_type === ELECTRICAL) {
            // Install cutting tool
        } else if (probe_type === MANUAL) {
            if (axes.includes("X") || axes.includes("Y")) {
                // Install edgefinder
            }
            if (axes.includes("Z")) {
                // Install cutting tool
            }
        }

        if (probe_location === CORNER) {
            xToClear = 2 * tool_diameter;
            yToClear = 2 * tool_diameter;
            switch (corner) {
                case TOP_LEFT:
                    cornerXSign = 1;
                    cornerYSign = -1;
                    break;
                case TOP_RIGHT:
                    cornerXSign = 1;
                    cornerYSign = 1;
                    break;
                case BOTTOM_LEFT:
                    cornerXSign = -1;
                    cornerYSign = -1;
                    break;
                case BOTTOM_RIGHT:
                    cornerXSign = -1;
                    cornerYSign = 1;
                    break;
            }
        } else if (probe_feature === RECT_POCKET) {
            xToClear = width / 2 - 2 * tool_diameter;
            yToClear = length / 2 - 2 * tool_diameter;
            if (xToClear < 0) xToClear = 0;
            if (yToClear < 0) yToClear = 0;
        } else if (probe_feature === CIRCLE_POCKET) {
            xToClear = diameter / 2 - 2 * tool_diameter;
            yToClear = diameter / 2 - 2 * tool_diameter;
            if (xToClear < 0) xToClear = 0;
            if (yToClear < 0) yToClear = 0;
        } else if (probe_feature === RECT_PROTRUSION) {
            xToClear = width / 2 + 2 * tool_diameter;
            yToClear = length / 2 + 2 * tool_diameter;
            if (xToClear < 0) xToClear = tool_diameter;
            if (yToClear < 0) yToClear = tool_diameter;
        } else if (probe_feature === CIRCLE_PROTRUSION) {
            xToClear = diameter / 2 + 2 * tool_diameter;
            yToClear = diameter / 2 + 2 * tool_diameter;
            if (xToClear < 0) xToClear = tool_diameter;
            if (yToClear < 0) yToClear = tool_diameter;
        }

        if ([RECT_POCKET, CIRCLE_POCKET].includes(probe_feature)) {
            travelDirection = -1;
        } else if (
            [RECT_PROTRUSION, CIRCLE_PROTRUSION].includes(probe_feature)
        ) {
            travelDirection = 1;
        }

        // Jog to starting point

        // Record current position to a local variable or something
        // For this example we'll store in G59, but we shouldn't do this in the real code
        // "(Store current location after jogging)\n";
        sendGCodeLine("G10 L20 P6 X0Y0Z0");

        // output += '(Probe down 15mm to determine safety depth)\n';
        // output += 'G38.3 G91 Z-15 F20\n';
        //
        // if (probe_feature === RECT_PROTRUSION || probe_feature === CIRCLE_PROTRUSION) {
        //     output += 'G10 L20 P1 Z5\n';
        // } else if (probe_feature === RECT_POCKET || probe_feature === CIRCLE_POCKET) {
        //     output += 'G10 L20 P1 Z2\n';
        // }
        // output += 'G4 P1\n';

        if (axes.includes("X") && probe_location !== MIDPOINT_Y) {
            //"(PROBE X)";
            sendGCodeLine("M4 S1500");

            if (
                [MIDPOINT_X, MIDPOINT_Y, MIDPOINT_X_Y].includes(probe_location)
            ) {
                let wcs_to_use = wcs;

                if (
                    !(
                        probe_location === MIDPOINT_Y &&
                        midpoint_y_x === BOTTOM_EDGE
                    )
                ) {
                    // "(Move to X top)\n";
                    sendGCodeLine(`G91 G0 X${xToClear}`);
                    sendGCodeLine("G91 G0 Z-10");
                    sendGCodeLine(`G38.2 G91 X${-20 * travelDirection} F20`);
                    sendGCodeLine(
                        `G10 L20 P${wcs_to_use} X${
                            (tool_diameter / 2) * travelDirection
                        }`
                    );
                    sendGCodeLine(`G91 G0 X${1 * travelDirection}`);
                    sendGCodeLine("$HZ");
                    sendGCodeLine("G90 G59 G0 X0Y0");
                    sendGCodeLine("G90 G59 G0 Z0");
                    wcs_to_use = wcs_addl;
                }

                if (
                    !(
                        probe_location === MIDPOINT_Y &&
                        midpoint_y_x === TOP_EDGE
                    )
                ) {
                    // "(Move to X bottom)\n";
                    sendGCodeLine(`G91 G0 X${xToClear * -1}`);
                    sendGCodeLine("G91 G0 Z-10\n");
                    sendGCodeLine(`G38.2 G91 X${20 * travelDirection} F20`);
                    sendGCodeLine(`G10 L20 P${wcs_to_use} X${
                        -1 * (tool_diameter / 2) * travelDirection
                    }`);
                    sendGCodeLine(`G91 G0 X${-1 * travelDirection}`);
                    sendGCodeLine("$HZ");
                    sendGCodeLine("G90 G59 G0 X0Y0");
                    sendGCodeLine("G90 G59 G0 Z0");
                }

                if ([MIDPOINT_X, MIDPOINT_X_Y].includes(probe_location)) {
                    sendGCodeLine("G4 P1");
                    sendGCodeLine`M102 ${get_wcs_from_offset(
                        wcs
                    )}X ((${get_wcs_from_offset(wcs)}X+${get_wcs_from_offset(
                        wcs_addl
                    )}X) / 2)\n`;
                    sendGCodeLine("G4 P1");
                }
            } else if (probe_location === CORNER) {
                // "(Move to corner)\n";
                sendGCodeLine(`G91 G0 X${xToClear * cornerXSign}\n`);
                sendGCodeLine("G91 G0 Z-10\n");
                sendGCodeLine(`G38.2 G91 X${
                    20 * cornerXSign * -1 * travelDirection
                } F20\n`);
                sendGCodeLine(`G10 L20 P${wcs} X${
                    (tool_diameter / 2) * cornerXSign * travelDirection
                }\n`);
                sendGCodeLine(`G91 G0 X${1 * travelDirection * cornerXSign}\n`);
                sendGCodeLine("$HZ\n");
                sendGCodeLine("G90 G59 G0 X0Y0\n");
                sendGCodeLine("G90 G59 G0 Z0\n\n");
            }
        }

        if (axes.includes("Y")) {
            // "(PROBE Y)\n\n";
            sendGCodeLine("M4 S1500\n\n");

            if (
                [MIDPOINT_X, MIDPOINT_Y, MIDPOINT_X_Y].includes(probe_location)
            ) {
                let wcs_to_use = wcs;

                if (
                    !(
                        probe_location === MIDPOINT_X &&
                        midpoint_x_y === LEFT_EDGE
                    )
                ) {
                    // "(Move to Y right)\n";
                    sendGCodeLine(`G91 G0 Y${yToClear}`);
                    sendGCodeLine("G91 G0 Z-10");
                    sendGCodeLine(`G38.2 G91 Y${-20 * travelDirection} F20`);
                    sendGCodeLine(`G10 L20 P${wcs_to_use} Y${
                        (tool_diameter / 2) * travelDirection
                    }`);
                    sendGCodeLine(`G91 G0 Y${1 * travelDirection}`);
                    sendGCodeLine("$HZ");
                    sendGCodeLine("G90 G59 G0 X0Y0");
                    sendGCodeLine("G90 G59 G0 Z0");
                    wcs_to_use = wcs_addl;
                }

                if (
                    !(
                        probe_location === MIDPOINT_X &&
                        midpoint_x_y === RIGHT_EDGE
                    )
                ) {
                    // "(Move to Y left)\n";
                    sendGCodeLine(`G91 G0 Y${yToClear * -1}`);
                    sendGCodeLine("G91 G0 Z-10");
                    sendGCodeLine(`G38.2 G91 Y${20 * travelDirection} F20`);
                    output += `G10 L20 P${wcs_to_use} Y${
                        -1 * (tool_diameter / 2) * travelDirection
                    }\n`;
                    sendGCodeLine(`G91 G0 Y${-1 * travelDirection}`);
                    sendGCodeLine("$HZ");
                    sendGCodeLine("G90 G59 G0 X0Y0");
                    sendGCodeLine("G90 G59 G0 Z0\n");
                }

                if ([MIDPOINT_Y, MIDPOINT_X_Y].includes(probe_location)) {
                    sendGCodeLine("G4 P1");
                    sendGCodeLine(`M102 ${get_wcs_from_offset(
                        wcs
                    )}Y ((${get_wcs_from_offset(wcs)}Y+${get_wcs_from_offset(
                        wcs_addl
                    )}Y) / 2)`);
                    sendGCodeLine("G4 P1");
                }
            } else if (probe_location === CORNER) {
                // "(Move to corner)\n";
                sendGCodeLine(`G91 G0 Y${yToClear * cornerYSign}`);
                sendGCodeLine("G91 G0 Z-10");
                sendGCodeLine(`G38.2 G91 Y${
                    20 * cornerYSign * -1 * travelDirection
                } F20`);
                sendGCodeLine(`G10 L20 P${wcs} Y${
                    (tool_diameter / 2) * cornerYSign * travelDirection
                }`);
                sendGCodeLine(`G91 G0 Y${cornerYSign * travelDirection}`);
                sendGCodeLine("$HZ");
                sendGCodeLine("G90 G59 G0 X0Y0");
                sendGCodeLine("G90 G59 G0 Z0");
            }

            if (axes.includes("X") && probe_location === MIDPOINT_Y) {
                // "(PROBE X)\n\n";
                sendGCodeLine("M4 S1500");

                let wcs_to_use = wcs;

                if (
                    !(
                        probe_location === MIDPOINT_Y &&
                        midpoint_y_x === BOTTOM_EDGE
                    )
                ) {
                    // "(Move to X top)\n";
                    sendGCodeLine(`G91 G0 X${xToClear}`);
                    sendGCodeLine("G91 G0 Z-10");
                    sendGCodeLine(`G38.2 G91 X${-20 * travelDirection} F20`);
                    sendGCodeLine(`G10 L20 P${wcs_to_use} X${
                        (tool_diameter / 2) * travelDirection
                    }`);
                    sendGCodeLine(`G91 G0 X${1 * travelDirection}`);
                    sendGCodeLine("$HZ");
                    sendGCodeLine("G90 G59 G0 X0Y0");
                    sendGCodeLine("G90 G59 G0 Z0");
                    wcs_to_use = wcs_addl;
                }

                if (
                    !(
                        probe_location === MIDPOINT_Y &&
                        midpoint_y_x === TOP_EDGE
                    )
                ) {
                    // "(Move to X bottom)\n";
                    sendGCodeLine(`G91 G0 X${xToClear * -1}`);
                    sendGCodeLine("G91 G0 Z-10");
                    sendGCodeLine(`G38.2 G91 X${20 * travelDirection} F20`);
                    sendGCodeLine(`G10 L20 P${wcs_to_use} X${
                        -1 * (tool_diameter / 2) * travelDirection
                    }`);
                    sendGCodeLine(`G91 G0 X${-1 * travelDirection}`);
                    sendGCodeLine("$HZ");
                    sendGCodeLine("G90 G59 G0 X0Y0");
                    sendGCodeLine("G90 G59 G0 Z0\n");
                }
            }
        }

        if (axes.includes("Z")) {
            sendGCodeLine("M5 S0");
            sendGCodeLine("G4 P1");
            // "(PROBE Z)\n\n";
            if ([RECT_PROTRUSION, CIRCLE_PROTRUSION].includes(probe_feature)) {
                if (probe_location === MIDPOINT_X) {
                    // "(Move to X midpoint)\n";
                    sendGCodeLine(`${get_wcs_from_offset(wcs)} G0 G90 X0`);
                    if (axes.includes("Y")) {
                        // "(Move to Y zero)";
                        sendGCodeLine(`${get_wcs_from_offset(wcs)} G0 G90 Y0`);
                    }
                } else if (probe_location === MIDPOINT_Y) {
                    // "(Move to Y midpoint)\n";
                    sendGCodeLine(`${get_wcs_from_offset(wcs)} G0 G90 Y0`);
                    if (axes.includes("X")) {
                        // "(Move to X zero)\n";
                        sendGCodeLine(`${get_wcs_from_offset(wcs)} G0 G90 X0`);
                    }
                } else if (probe_location === MIDPOINT_X_Y) {
                    sendGCodeLine(`${get_wcs_from_offset(wcs)} G0 G90 X0 Y0`);
                }
            } else if (
                [RECT_POCKET, CIRCLE_POCKET].includes(probe_feature) &&
                pocket_z === POCKET_TOP
            ) {
                sendGCodeLine(`G0 G91 X${diameter / 2 + tool_diameter} Y${
                    diameter / 2 + tool_diameter
                }`);
            }

            sendGCodeLine("G38.2 G91 Z-20 F20");
            sendGCodeLine(`G10 L20 P${wcs} Z0`);

            if (x_offset) {
                sendGCodeLine(`M102 ${get_wcs_from_offset(
                    wcs
                )}X ${get_wcs_from_offset(wcs)}X+${x_offset}`);
            }
            if (y_offset) {
                sendGCodeLine(`M102 ${get_wcs_from_offset(
                    wcs
                )}Y ${get_wcs_from_offset(wcs)}Y+${y_offset}`);
            }
            if (z_offset) {
                sendGCodeLine(`M102 ${get_wcs_from_offset(
                    wcs
                )}Z ${get_wcs_from_offset(wcs)}Z+${z_offset}`);
            }
        }


        console.log("PRINTING");
    }

    main();

    return "";
};

export default ProbingManager;
