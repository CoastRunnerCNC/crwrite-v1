import React, { useState } from "react";
import PropTypes from "prop-types";
import { ipcRenderer } from "electron";
import {
    Button,
    Dialog,
    DialogContent,
    Grid,
    Select,
    TextField,
    Typography,
    Tabs,
    Tab,
} from "@material-ui/core";
import app from "app";
import Alert from "../Alert";
import Slider from "@material-ui/core/Slider";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import SVGPath from "../../SVGPath/SVGPath";
import _ from "underscore";
import "./Operations.scss";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import { withStyles } from "@material-ui/core/styles";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import SendIcon from "@material-ui/icons/Send";
import ExecuteIcon from "@material-ui/icons/Autorenew";
import SelectFileIcon from "@material-ui/icons/Attachment";
import Tooltip from "@material-ui/core/Tooltip";
import ReportLimitCatchError from "./ReportLimitCatchError/ReportLimitCatchError";
import PositionPreset from "./PositionPreset/PositionPreset";
import ExportOutput from "./ExportOutput/ExportOutput";
import DisplayPanel from "./DisplayPanel/DisplayPanel";
import ShuttleSettings from "./ShuttleSettings";
import ItemPanel from "../../ItemPanel/ItemPanel";
import StopButton from "../../StopButton/StopButton";

const path = require("path");
const DEFAULT_COORDINATE_LIMITS = {
    min: {
        inch: -100,
        mm: -100,
    },
    max: {
        inch: 0,
        mm: 0,
    },
};

const styles = (theme) => ({
    slider: {
        padding: "11px 0px",
    },
    millImageStyle: {
        width: "265px",
        height: "135px",
        backgroundImage: app.manualOperations.millImage,
    },
    yellow: {
        stroke: "#000000",
        fill: "#000000",
    },
    orange: {
        stroke: "#000000",
    },
    red: {
        stroke: "#000000",
        fill: "#000000",
    },
    jogButton: {
        "&:hover": {
            cursor: "pointer",
        },
    },
    nowrap: {
        flexWrap: "nowrap !important",
    },
});

const CoastRunnerSVG = (props) => {
    const { component } = props;
    return (
        <div>
            <svg
                viewBox="0 31.7412 736 394.1588"
                style={{ maxHeight: "260px" }}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect
                    x="90.1882"
                    y="41.2706"
                    width="396.424"
                    height="275.718"
                    fill="#F1F2F2"
                />
                <rect
                    x="80.6588"
                    y="31.7412"
                    width="19.0588"
                    height="19.0588"
                    fill="#F1F2F2"
                />
                <rect
                    x="80.6588"
                    y="31.7412"
                    width="19.0588"
                    height="19.0588"
                    stroke="black"
                    strokeWidth="2.54118"
                />
                <rect
                    x="477.082"
                    y="31.7412"
                    width="19.0588"
                    height="19.0588"
                    fill="#F1F2F2"
                />
                <rect
                    x="477.082"
                    y="31.7412"
                    width="19.0588"
                    height="19.0588"
                    stroke="black"
                    strokeWidth="2.54118"
                />
                <rect
                    x="477.082"
                    y="307.459"
                    width="19.0588"
                    height="19.0588"
                    fill="#F1F2F2"
                />
                <rect
                    x="477.082"
                    y="307.459"
                    width="19.0588"
                    height="19.0588"
                    stroke="black"
                    strokeWidth="2.54118"
                />
                <rect
                    x="80.6588"
                    y="307.459"
                    width="19.0588"
                    height="19.0588"
                    fill="#F1F2F2"
                />
                <rect
                    x="80.6588"
                    y="307.459"
                    width="19.0588"
                    height="19.0588"
                    stroke="black"
                    strokeWidth="2.54118"
                />
                <path
                    d="M463.303 76.1546H129.411C128.159 76.1546 127.143 77.17 127.143 78.4226V285.255C127.143 286.508 128.159 287.523 129.411 287.523H463.303C464.555 287.523 465.571 286.508 465.571 285.255V78.4226C465.571 77.17 464.555 76.1546 463.303 76.1546Z"
                    fill="#444444"
                />
                <path
                    d="M458.907 70.7355H125.015C123.762 70.7355 122.747 71.7509 122.747 73.0035V279.836C122.747 281.089 123.762 282.104 125.015 282.104H458.907C460.159 282.104 461.175 281.089 461.175 279.836V73.0035C461.175 71.7509 460.159 70.7355 458.907 70.7355Z"
                    fill="#010101"
                />
                <path
                    d="M458.907 73.0035H125.015V279.836H458.907V73.0035Z"
                    fill="#010101"
                />
                <path
                    d="M116.331 108.173C113.516 108.173 111.229 105.886 111.229 103.072V84.9407C111.229 82.1263 113.516 79.8393 116.331 79.8393C118.332 79.8393 120.066 80.9955 120.898 82.6727H124.259C125.511 82.6727 126.527 83.6892 126.527 84.9407V103.072C126.527 104.324 125.511 105.34 124.259 105.34H120.898C120.06 107.017 118.325 108.173 116.331 108.173Z"
                    fill="#010101"
                />
                <path
                    d="M119.164 84.9407C119.164 83.3779 117.893 82.1073 116.331 82.1073C114.768 82.1073 113.497 83.3779 113.497 84.9407V103.072C113.497 104.635 114.768 105.905 116.331 105.905C117.893 105.905 119.164 104.635 119.164 103.072H124.265V84.9407H119.164Z"
                    fill="#010101"
                />
                <path
                    d="M458.748 73.0099V279.83H124.863V73.0099H172.808V231.668H410.796V201.924C410.808 201.873 410.808 201.822 410.796 201.771V73.0099H458.748Z"
                    fill="white"
                />
                <path
                    d="M119.005 84.9407C119.005 83.3779 117.735 82.1073 116.172 82.1073C114.609 82.1073 113.338 83.3779 113.338 84.9407V103.072C113.338 104.635 114.609 105.905 116.172 105.905C117.735 105.905 119.005 104.635 119.005 103.072H124.107V84.9407H119.005Z"
                    fill="#F19E9F"
                />
                <path
                    d="M410.796 73.0099H172.808V231.668H410.796V73.0099Z"
                    fill="#C6C5C5"
                />
                <path
                    d="M312.897 94.3812H188.24V105.715H312.897V94.3812Z"
                    fill="#767576"
                />
                <path
                    d="M315.762 89.032V114.526H310.095V137.194H298.762V179.695H395.091V89.032H315.762Z"
                    fill="#767576"
                />
                <path
                    d="M183.856 76.6883V210.958L174.784 216.199V76.6883H183.856Z"
                    fill="#767576"
                />
                <path
                    d="M407.086 221.427V229.68H174.784V221.427L192.274 211.326H389.596L407.086 221.427Z"
                    fill="#767576"
                />
                <path
                    d="M407.086 76.6883V216.199L398.02 210.958V76.6883H407.086Z"
                    fill="#767576"
                />
                <path
                    d="M360.493 165.718C369.153 165.718 376.172 158.699 376.172 150.039C376.172 141.38 369.153 134.36 360.493 134.36C351.834 134.36 344.814 141.38 344.814 150.039C344.814 158.699 351.834 165.718 360.493 165.718Z"
                    fill="#C6C5C5"
                />
                <path
                    d="M360.493 154.798C363.121 154.798 365.252 152.667 365.252 150.039C365.252 147.411 363.121 145.281 360.493 145.281C357.865 145.281 355.735 147.411 355.735 150.039C355.735 152.667 357.865 154.798 360.493 154.798Z"
                    fill="#444444"
                />
                <rect
                    x="90.1882"
                    y="41.2706"
                    width="396.424"
                    height="275.718"
                    stroke="black"
                    strokeWidth="2.54118"
                />
                <g
                    id="x_neg_path"
                    className={props.classes.jogButton}
                    onMouseDown={component.pathClickStarted}
                    onMouseUp={component.pathClickEnded}
                >
                    <rect
                        id="x_neg_path"
                        x="40.5241"
                        y="65.9359"
                        width="26.9047"
                        height="26.9047"
                        rx="2.01706"
                        fill="#f6f6f6"
                    />{" "}
                    {/*X-Minus*/}
                    <path
                        id="x_neg_path"
                        className={component.getPathColorClass("x", false)}
                        d="M63.2994 77.6761C63.2994 77.3253 63.015 77.0408 62.6641 77.0408H45.2888C44.938 77.0408 44.6535 77.3253 44.6535 77.6761V81.1004C44.6535 81.4512 44.938 81.7357 45.2888 81.7357H62.6641C63.015 81.7357 63.2994 81.4512 63.2994 81.1004V77.6761Z"
                        fill="#3EC6CB"
                        stroke="black"
                        strokeWidth="0.635294"
                    />
                </g>
                <rect
                    x="40.5241"
                    y="65.9359"
                    width="26.9047"
                    height="26.9047"
                    rx="2.01706"
                    stroke="black"
                    strokeWidth="1.04824"
                />
                <path
                    d="M53.9765 105.718L53.9765 255.718"
                    stroke="black"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
                <g
                    id="x_pos_path"
                    className={props.classes.jogButton}
                    onMouseDown={component.pathClickStarted}
                    onMouseUp={component.pathClickEnded}
                >
                    <rect
                        id="x_pos_path"
                        x="40.5241"
                        y="268.595"
                        width="26.9047"
                        height="26.9047"
                        rx="2.01706"
                        fill="#f6f6f6"
                    />{" "}
                    {/*X-Plus*/}
                    <path
                        id="x_pos_path"
                        className={component.getPathColorClass("x", true)}
                        d="M63.2994 280.354C63.2994 280.003 63.015 279.719 62.6641 279.719H56.3429V273.359C56.3429 273.009 56.0585 272.724 55.7076 272.724H52.2834C51.9325 272.724 51.6481 273.009 51.6481 273.359V279.719H45.2888C44.938 279.719 44.6535 280.003 44.6535 280.354V283.778C44.6535 284.129 44.938 284.414 45.2888 284.414H51.6481V290.735C51.6481 291.086 51.9325 291.37 52.2834 291.37H55.7076C56.0585 291.37 56.3429 291.086 56.3429 290.735V284.414H62.6641C63.015 284.414 63.2994 284.129 63.2994 283.778V280.354Z"
                        fill="#3EC6CB"
                        stroke="black"
                        strokeWidth="0.635294"
                    />
                </g>
                <rect
                    x="40.5241"
                    y="268.595"
                    width="26.9047"
                    height="26.9047"
                    rx="2.01706"
                    stroke="black"
                    strokeWidth="1.04824"
                />
                <g
                    id="y_neg_path"
                    className={props.classes.jogButton}
                    onMouseDown={component.pathClickStarted}
                    onMouseUp={component.pathClickEnded}
                >
                    <rect
                        id="y_neg_path"
                        x="111.677"
                        y="336.571"
                        width="26.9047"
                        height="26.9047"
                        rx="2.01706"
                        fill="#f6f6f6"
                    />{" "}
                    {/*Y-Minus*/}
                    <path
                        id="y_neg_path"
                        className={component.getPathColorClass("y", false)}
                        d="M134.452 348.311C134.452 347.961 134.168 347.676 133.817 347.676H116.442C116.091 347.676 115.806 347.961 115.806 348.311V351.736C115.806 352.087 116.091 352.371 116.442 352.371H133.817C134.168 352.371 134.452 352.087 134.452 351.736V348.311Z"
                        fill="#3EC6CB"
                        stroke="black"
                        strokeWidth="0.635294"
                    />
                </g>
                <rect
                    x="111.677"
                    y="336.571"
                    width="26.9047"
                    height="26.9047"
                    rx="2.01706"
                    stroke="black"
                    strokeWidth="1.04824"
                />
                <path
                    d="M150.9 350.024L425.9 350.024"
                    stroke="black"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
                <g
                    id="y_pos_path"
                    className={props.classes.jogButton}
                    onMouseDown={component.pathClickStarted}
                    onMouseUp={component.pathClickEnded}
                >
                    <rect
                        id="y_pos_path"
                        x="438.218"
                        y="336.571"
                        width="26.9047"
                        height="26.9047"
                        rx="2.01706"
                        fill="#f6f6f6"
                    />{" "}
                    {/*Y-Plus*/}
                    <path
                        id="y_pos_path"
                        className={component.getPathColorClass("y", true)}
                        d="M460.994 348.33C460.994 347.98 460.709 347.695 460.358 347.695H454.037V341.336C454.037 340.985 453.753 340.701 453.402 340.701H449.978C449.627 340.701 449.342 340.985 449.342 341.336V347.695H442.983C442.632 347.695 442.348 347.98 442.348 348.33V351.755C442.348 352.106 442.632 352.39 442.983 352.39H449.342V358.711C449.342 359.062 449.627 359.346 449.978 359.346H453.402C453.753 359.346 454.037 359.062 454.037 358.711V352.39H460.358C460.709 352.39 460.994 352.106 460.994 351.755V348.33Z"
                        fill="#3EC6CB"
                        stroke="black"
                        strokeWidth="0.635294"
                    />
                </g>
                <rect
                    x="438.218"
                    y="336.571"
                    width="26.9047"
                    height="26.9047"
                    rx="2.01706"
                    stroke="black"
                    strokeWidth="1.04824"
                />
                <rect
                    x="529.153"
                    y="41.2706"
                    width="123.882"
                    height="275.718"
                    fill="#F1F2F2"
                />
                <rect
                    x="519.623"
                    y="31.7412"
                    width="19.0588"
                    height="19.0588"
                    fill="#F1F2F2"
                />
                <rect
                    x="519.623"
                    y="31.7412"
                    width="19.0588"
                    height="19.0588"
                    stroke="black"
                    strokeWidth="2.54118"
                />
                <rect
                    x="643.506"
                    y="31.7412"
                    width="19.0588"
                    height="19.0588"
                    fill="#F1F2F2"
                />
                <rect
                    x="643.506"
                    y="31.7412"
                    width="19.0588"
                    height="19.0588"
                    stroke="black"
                    strokeWidth="2.54118"
                />
                <rect
                    x="643.506"
                    y="307.459"
                    width="19.0588"
                    height="19.0588"
                    fill="#F1F2F2"
                />
                <rect
                    x="643.506"
                    y="307.459"
                    width="19.0588"
                    height="19.0588"
                    stroke="black"
                    strokeWidth="2.54118"
                />
                <rect
                    x="519.623"
                    y="307.459"
                    width="19.0588"
                    height="19.0588"
                    fill="#F1F2F2"
                />
                <rect
                    x="519.623"
                    y="307.459"
                    width="19.0588"
                    height="19.0588"
                    stroke="black"
                    strokeWidth="2.54118"
                />
                <path
                    d="M610.229 83.8321C611.201 83.8321 611.995 83.0444 611.995 82.066V69.9192C611.995 68.9472 611.208 68.1531 610.229 68.1531H573.782C572.81 68.1531 572.016 68.9408 572.016 69.9192V82.066C572.016 83.038 572.804 83.8321 573.782 83.8321H578.09V201.794H573.782C572.81 201.794 572.016 202.581 572.016 203.56V224.823C572.016 225.795 572.804 226.589 573.782 226.589H584.239V249.123C584.239 250.095 585.027 250.889 586.005 250.889H588.572V263.195C588.572 263.5 588.655 263.786 588.794 264.033C588.655 264.561 588.572 265.101 588.572 265.647C588.572 266.587 588.813 267.591 589.303 268.703C588.82 269.814 588.572 270.799 588.572 271.739V275.373C588.572 275.678 588.655 275.964 588.794 276.212C588.655 276.739 588.572 277.279 588.572 277.826C588.572 278.766 588.813 279.77 589.303 280.881C588.82 281.993 588.572 282.978 588.572 283.918V287.552C588.572 287.85 588.661 288.124 588.794 288.371C588.794 288.384 588.788 288.397 588.782 288.41L588.712 288.734C588.693 288.816 588.674 288.905 588.661 288.988C588.566 289.547 588.756 290.131 589.163 290.531L590.84 292.202C591.183 292.545 591.634 292.717 592.085 292.717C592.536 292.717 592.987 292.545 593.33 292.202L595.071 290.462C595.401 290.131 595.586 289.68 595.586 289.216V285.957C595.586 285.011 595.344 284.013 594.855 282.902C595.344 281.79 595.586 280.805 595.586 279.865V276.225C595.586 275.926 595.49 275.659 595.357 275.405C595.497 274.871 595.586 274.325 595.586 273.772C595.586 272.826 595.344 271.828 594.855 270.717C595.344 269.598 595.586 268.614 595.586 267.68V264.04C595.586 263.741 595.497 263.462 595.363 263.214C595.503 262.68 595.586 262.14 595.586 261.594C595.586 260.654 595.344 259.656 594.855 258.551C595.224 257.712 595.586 256.645 595.586 255.501V250.889H598.152C599.124 250.889 599.918 250.101 599.918 249.123V226.589H610.229C611.201 226.589 611.995 225.801 611.995 224.823V203.56C611.995 202.588 611.208 201.794 610.229 201.794H605.922V83.8321H610.229Z"
                    fill="#444444"
                />
                <path
                    d="M610.178 79.4549V67.3081C610.178 66.3327 609.388 65.542 608.412 65.542H571.965C570.99 65.542 570.199 66.3327 570.199 67.3081V79.4549C570.199 80.4303 570.99 81.221 571.965 81.221H608.412C609.388 81.221 610.178 80.4303 610.178 79.4549Z"
                    fill="black"
                />
                <path
                    d="M610.172 222.212V200.955C610.172 199.98 609.381 199.189 608.406 199.189H571.959C570.984 199.189 570.193 199.98 570.193 200.955V222.212C570.193 223.187 570.984 223.978 571.959 223.978H608.406C609.381 223.978 610.172 223.187 610.172 222.212Z"
                    fill="black"
                />
                <path
                    d="M604.099 200.955V79.4676C604.099 78.4922 603.308 77.7015 602.332 77.7015H578.039C577.063 77.7015 576.273 78.4922 576.273 79.4676V200.955C576.273 201.93 577.063 202.721 578.039 202.721H602.332C603.308 202.721 604.099 201.93 604.099 200.955Z"
                    fill="black"
                />
                <path
                    d="M598.095 246.512V222.218C598.095 221.243 597.304 220.452 596.329 220.452H584.182C583.207 220.452 582.416 221.243 582.416 222.218V246.512C582.416 247.487 583.207 248.278 584.182 248.278H596.329C597.304 248.278 598.095 247.487 598.095 246.512Z"
                    fill="black"
                />
                <path
                    d="M590.262 290.112C589.811 290.112 589.36 289.941 589.017 289.598L587.34 287.927C586.933 287.526 586.742 286.948 586.838 286.383C586.85 286.3 586.869 286.211 586.888 286.129L586.958 285.805C586.99 285.684 587.016 285.589 587.047 285.487C587.054 285.462 587.085 285.366 587.092 285.347C587.124 285.239 587.155 285.144 587.187 285.049C587.219 284.96 587.27 284.82 587.327 284.693L587.416 284.458L587.6 284.064C587.6 284.064 587.689 283.867 587.708 283.823C587.708 283.823 587.968 283.314 587.994 283.276C587.994 283.276 588 283.257 588.019 283.226C588.324 282.666 588.655 282.101 588.985 281.555C589.271 281.078 589.569 280.589 589.836 280.094C590.147 279.522 590.745 279.172 591.386 279.172C591.405 279.172 591.431 279.172 591.45 279.172C592.123 279.198 592.72 279.598 592.994 280.208C593.508 281.345 593.756 282.374 593.756 283.34V286.599C593.756 287.069 593.572 287.514 593.241 287.844L591.501 289.585C591.158 289.928 590.707 290.099 590.256 290.099L590.262 290.112Z"
                    fill="black"
                />
                <path
                    d="M588.521 286.707C588.292 286.707 588.064 286.662 587.848 286.574C587.187 286.3 586.755 285.659 586.755 284.941V281.307C586.755 280.202 587.073 279.045 587.746 277.686C587.759 277.648 587.778 277.616 587.797 277.584C588.153 276.892 588.566 276.199 588.96 275.532L589.061 275.361C589.411 274.776 589.773 274.179 590.059 273.601C590.071 273.569 590.09 273.531 590.109 273.499C590.205 273.309 590.294 273.118 590.376 272.927C590.389 272.896 590.427 272.819 590.427 272.813C590.732 272.203 591.348 271.835 592.003 271.835C592.136 271.835 592.276 271.847 592.409 271.879C593.203 272.07 593.769 272.781 593.769 273.594V277.235C593.769 278.372 593.432 279.566 592.708 280.989C592.339 281.707 591.901 282.444 591.52 283.073C591.107 283.766 590.738 284.394 590.414 285.017C590.414 285.017 590.414 285.017 590.414 285.023C590.319 285.22 590.23 285.417 590.141 285.621C590.052 285.83 589.925 286.021 589.766 286.18C589.43 286.516 588.979 286.701 588.515 286.701L588.521 286.707Z"
                    fill="black"
                />
                <path
                    d="M589.042 279.388C588.375 279.357 587.778 278.956 587.505 278.34C586.996 277.197 586.749 276.18 586.749 275.221C586.749 273.118 587.937 271.136 588.979 269.389L589.042 269.287C589.315 268.836 589.588 268.379 589.843 267.915C590.154 267.343 590.751 266.994 591.393 266.994C591.412 266.994 591.437 266.994 591.456 266.994C592.13 267.019 592.727 267.419 593 268.029C593.515 269.166 593.762 270.196 593.762 271.161C593.762 273.251 592.581 275.234 591.532 276.981L589.97 276.155L591.482 277.063C591.202 277.527 590.916 278.003 590.656 278.48C590.344 279.045 589.754 279.388 589.112 279.388C589.087 279.388 589.061 279.388 589.036 279.388H589.042Z"
                    fill="black"
                />
                <path
                    d="M588.521 274.528C587.549 274.528 586.755 273.741 586.755 272.762V269.128C586.755 268.023 587.073 266.867 587.746 265.507C587.759 265.469 587.778 265.437 587.797 265.399C588.165 264.681 588.591 263.963 588.998 263.29L589.042 263.214C589.55 262.356 590.04 261.549 590.37 260.755C590.459 260.546 590.599 260.336 590.757 260.177C591.094 259.84 591.545 259.656 592.009 259.656C592.238 259.656 592.466 259.701 592.682 259.79C593.343 260.063 593.775 260.704 593.775 261.422V265.062C593.775 266.187 593.445 267.362 592.74 268.773C592.409 269.44 592.015 270.088 591.64 270.723L591.539 270.894C591.043 271.72 590.535 272.572 590.179 273.385C589.925 274.052 589.284 274.528 588.528 274.528H588.521Z"
                    fill="black"
                />
                <path
                    d="M589.042 267.21C588.375 267.178 587.778 266.778 587.505 266.162C586.996 265.018 586.749 264.002 586.749 263.042C586.749 260.939 587.937 258.957 588.979 257.21L589.048 257.096C589.322 256.645 589.595 256.194 589.843 255.736C590.154 255.165 590.751 254.809 591.393 254.809C591.412 254.809 591.437 254.809 591.456 254.809C592.13 254.834 592.727 255.234 593 255.844C593.515 256.982 593.762 258.011 593.762 258.976C593.762 261.073 592.568 263.061 591.52 264.808L591.38 265.05C591.139 265.463 590.891 265.876 590.662 266.295C590.351 266.86 589.76 267.203 589.118 267.203C589.093 267.203 589.067 267.203 589.042 267.203V267.21Z"
                    fill="black"
                />
                <path
                    d="M588.521 262.35C587.549 262.35 586.755 261.562 586.755 260.584V246.899C586.755 245.927 587.543 245.133 588.521 245.133H592.009C592.981 245.133 593.775 245.921 593.775 246.899V252.89C593.775 254.351 593.184 255.705 592.74 256.594C592.403 257.267 592.015 257.922 591.634 258.551L591.532 258.722C591.164 259.332 590.751 260.025 590.421 260.685C590.338 260.85 590.256 261.028 590.179 261.206C589.932 261.88 589.284 262.356 588.528 262.356L588.521 262.35Z"
                    fill="black"
                />
                <path
                    d="M608.412 67.3081H571.965V79.4549H608.412V67.3081Z"
                    fill="#767576"
                />
                <path
                    d="M608.412 200.955H571.965V222.218H608.412V200.955Z"
                    fill="#767576"
                />
                <path
                    d="M602.339 79.4613H578.039V200.955H602.339V79.4613Z"
                    fill="#C6C5C5"
                />
                <path
                    d="M596.335 222.212H584.188V246.512H596.335V222.212Z"
                    fill="#C6C5C5"
                />
                <path
                    d="M592.003 283.34V286.599L590.262 288.34L588.585 286.669C588.597 286.593 588.623 286.516 588.636 286.446C588.655 286.37 588.674 286.281 588.693 286.205C588.718 286.11 588.756 286.008 588.782 285.906C588.807 285.837 588.826 285.754 588.852 285.678C588.89 285.576 588.928 285.468 588.972 285.36C589.004 285.29 589.029 285.214 589.055 285.144C589.112 285.03 589.163 284.915 589.22 284.795C589.245 284.731 589.277 284.68 589.296 284.617C589.366 284.471 589.449 284.325 589.519 284.178C589.538 284.147 589.55 284.115 589.569 284.09C589.862 283.55 590.186 283.003 590.503 282.476C590.808 281.974 591.12 281.453 591.399 280.938C591.812 281.853 592.009 282.635 592.009 283.346L592.003 283.34Z"
                    fill="#767576"
                />
                <path
                    d="M592.003 273.607V277.247C592.003 278.219 591.64 279.21 591.132 280.202C590.796 280.856 590.395 281.529 590.008 282.177C589.601 282.857 589.195 283.543 588.839 284.236C588.839 284.248 588.839 284.255 588.826 284.261C588.718 284.483 588.616 284.712 588.515 284.934V284.947V281.313C588.515 280.354 588.864 279.376 589.36 278.397C589.703 277.73 590.109 277.05 590.503 276.383C590.91 275.704 591.329 275.011 591.679 274.312C591.793 274.084 591.895 273.855 591.996 273.633C591.996 273.633 591.996 273.62 592.009 273.607H592.003Z"
                    fill="#767576"
                />
                <path
                    d="M592.003 271.161C592.003 272.769 590.986 274.458 590.008 276.091C589.709 276.587 589.398 277.108 589.112 277.622C588.705 276.707 588.508 275.926 588.508 275.214C588.508 273.601 589.519 271.917 590.497 270.285C590.802 269.783 591.113 269.268 591.393 268.754C591.806 269.668 592.003 270.45 592.003 271.161Z"
                    fill="#767576"
                />
                <path
                    d="M592.003 261.429V265.069C592.003 266.022 591.647 267.006 591.151 267.985C590.815 268.652 590.402 269.332 590.008 269.999C589.468 270.901 588.921 271.822 588.521 272.75C588.521 272.75 588.521 272.762 588.521 272.769V269.135C588.521 268.175 588.871 267.197 589.366 266.219C589.709 265.552 590.116 264.866 590.51 264.205C591.05 263.303 591.602 262.382 591.996 261.454C591.996 261.441 591.996 261.435 592.009 261.429H592.003Z"
                    fill="#767576"
                />
                <path
                    d="M592.003 258.983C592.003 260.59 590.986 262.28 590.008 263.906C589.709 264.408 589.398 264.929 589.112 265.444C588.705 264.529 588.508 263.747 588.508 263.036C588.508 261.422 589.519 259.739 590.497 258.106C590.802 257.604 591.113 257.09 591.393 256.575C591.806 257.49 592.003 258.271 592.003 258.983Z"
                    fill="#767576"
                />
                <path
                    d="M592.003 246.899V252.89C592.003 253.843 591.647 254.822 591.151 255.806C590.815 256.473 590.402 257.153 590.008 257.82C589.601 258.5 589.188 259.192 588.832 259.891C588.724 260.114 588.616 260.342 588.515 260.571C588.515 260.571 588.515 260.584 588.515 260.59V246.906H592.003V246.899Z"
                    fill="#767576"
                />
                <rect
                    x="529.153"
                    y="41.2706"
                    width="123.882"
                    height="275.718"
                    stroke="black"
                    strokeWidth="2.54118"
                />
                <g
                    id="z_pos_path"
                    className={props.classes.jogButton}
                    onMouseDown={component.pathClickStarted}
                    onMouseUp={component.pathClickEnded}
                >
                    <rect
                        id="z_pos_path"
                        x="668.171"
                        y="62.7594"
                        width="26.9047"
                        height="26.9047"
                        rx="2.01706"
                        fill="#f6f6f6"
                    />{" "}
                    {/*Z-Plus*/}
                    <path
                        id="z_pos_path"
                        className={component.getPathColorClass("z", true)}
                        d="M690.946 74.5187C690.946 74.1678 690.662 73.8834 690.311 73.8834H683.99V67.5241C683.99 67.1733 683.706 66.8888 683.355 66.8888H679.93C679.58 66.8888 679.295 67.1733 679.295 67.5241V73.8834H672.936C672.585 73.8834 672.301 74.1678 672.301 74.5187V77.9429C672.301 78.2938 672.585 78.5782 672.936 78.5782H679.295V84.8994C679.295 85.2503 679.58 85.5347 679.93 85.5347H683.355C683.706 85.5347 683.99 85.2503 683.99 84.8994V78.5782H690.311C690.662 78.5782 690.946 78.2938 690.946 77.9429V74.5187Z"
                        fill="#3EC6CB"
                        stroke="black"
                        strokeWidth="0.635294"
                    />
                </g>
                <rect
                    x="668.171"
                    y="62.7594"
                    width="26.9047"
                    height="26.9047"
                    rx="2.01706"
                    stroke="black"
                    strokeWidth="1.04824"
                />
                <path
                    d="M681.623 104.129V254.129"
                    stroke="black"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
                <g
                    id="z_neg_path"
                    className={props.classes.jogButton}
                    onMouseDown={component.pathClickStarted}
                    onMouseUp={component.pathClickEnded}
                >
                    <rect
                        id="z_neg_path"
                        x="668.171"
                        y="268.595"
                        width="26.9047"
                        height="26.9047"
                        rx="2.01706"
                        fill="#f6f6f6"
                    />{" "}
                    {/*Z-minus*/}
                    <path
                        id="z_neg_path"
                        className={component.getPathColorClass("z", false)}
                        d="M690.946 280.335C690.946 279.984 690.662 279.7 690.311 279.7H672.936C672.585 279.7 672.301 279.984 672.301 280.335V283.759C672.301 284.11 672.585 284.394 672.936 284.394H690.311C690.662 284.394 690.946 284.11 690.946 283.759V280.335Z"
                        fill="#3EC6CB"
                        stroke="black"
                        strokeWidth="0.635294"
                    />
                </g>
                <rect
                    x="668.171"
                    y="268.595"
                    width="26.9047"
                    height="26.9047"
                    rx="2.01706"
                    stroke="black"
                    strokeWidth="1.04824"
                />
            </svg>
        </div>
    );
};

const RunPauseButton = (props) => {
    const [paused, setPaused] = useState(false);

    const circleStyle = {
        width: "80px", // You can adjust this to your preferred size
        height: "80px",
        borderRadius: "50%",
        backgroundColor: "#f6f6f6",
        border: "1.65px solid #000000",
        boxShadow: "3px 3px 0px 0px #000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // center the text both horizontally and vertically
        position: "relative",
        fontSize: "16px", // adjust according to your preference
    };

    const handleFeedPause = () => {
        if (paused) {
            setPaused(false);
            ipcRenderer.send("CNC::ExecuteCommand", "~");
        } else {
            setPaused(true);
            ipcRenderer.send("CNC::ExecuteCommand", "!");
        }
    };

    return (
        <IconButton onClick={handleFeedPause}>
            <div style={circleStyle}>
                <Typography
                    variant="h5"
                    fontWeight={"fontWeightBold"}
                    style={{ color: "black" }}
                >
                    {paused ? "Run" : "Pause"}
                </Typography>
            </div>
        </IconButton>
    );
};

// const StopButton = props => {

//     const handleStop = () => {
//         ipcRenderer.send("Jobs::EmergencyStop");
//     };

//   return (
//     <IconButton onClick={handleStop}>
//         <img
//             style={{ height: '80px' }}
//             src={path.join(__dirname, './static/img/stop_circle.png')}
//         />
//     </IconButton>
//   )
// }

class Operations extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            realTimeStatus: {},
            realTimeStatusDisplay: "",
            manualEntry: "",
            entryHistory: [],
            historyIndex: 0,
            isSeekingHistory: false,
            step: { stepNum: 0 },
            WCS: "G54",
            units: "mm",
            speed: "Feedrate",
            mode: "Fixed",
            fixed_distance: { value: 1.0, unit: "mm" },
            feedRate: this.props.feedRate,
            feedRate2: 100,
            jogRate: 0,
            homingAlertDialogOpen: false,
            pathIdEventKeyMap: {},
            gCodeFilePath: "",
            gCodeFilePathDisplay: "",
            forceShowJoggingTooltip: false,
            forceShowUnitTooltip: false,
            forceShowJoggingTooltipMaxDistance: false,
            joggingTooltipText: "",
            focusedInput: "",
            maxDistanceIsValid: true,
            milling: false,
            millingProgress: -1,
            movementAbsolute: true,
            limitWarningOpen: false,
            settings: {},
            currentTab: 0,
            readWrites: [],
            rawGCodes: [],
            rawHistory: [],
            timerElapsedSeconds: 0,
            openShuttleSettings: false,
        };

        this.progress = this.progress.bind(this);
        // this.getMillingInProgressDisplay =
        // this.getMillingInProgressDisplay.bind(this);
        // this.getMillingProgress = this.getMillingProgress.bind(this);
        this.updateRealtimeStatus = this.updateRealtimeStatus.bind(this);
        this.executeCommand = this.executeCommand.bind(this);
        this.uploadGCodeFile = this.uploadGCodeFile.bind(this);
        this.closeShuttleSettings = this.closeShuttleSettings.bind(this);
        this.openShuttleSettings = this.openShuttleSettings.bind(this);
        this.interval = null;
        this.timerInterval = null;
        this.convertToUnits = this.convertToUnits.bind(this);
        this.get_work_pos = this.get_work_pos.bind(this);
        this.get_position = this.get_position.bind(this);
        this.getCommandKey = this.getCommandKey.bind(this);
        this.keydownListener = this.keydownListener.bind(this);
        this.keyupListener = this.keyupListener.bind(this);
        this.onModeChange = this.onModeChange.bind(this);
        this.printLog = this.printLog.bind(this);
        this.onSpeedChange = this.onSpeedChange.bind(this);
        this.onFeedRateChange = this.onFeedRateChange.bind(this);
        this.onJogRateChange = this.onJogRateChange.bind(this);
        this.pathClickStarted = this.pathClickStarted.bind(this);
        this.pathClickEnded = this.pathClickEnded.bind(this);
        this.getPathColorClass = this.getPathColorClass.bind(this);
        this.sendCommand = this.sendCommand.bind(this);
        this.isOutOfBounds = this.isOutOfBounds.bind(this);
        this.tempIsMovementAbsolute = this.tempIsMovementAbsolute.bind(this);
        this.populateCoordinateCache = this.populateCoordinateCache.bind(this);
        this.selectGCodeFile = this.selectGCodeFile.bind(this);
        this.getFixedValue = this.getFixedValue.bind(this);
        this.handleInputHasFocus = this.handleInputHasFocus.bind(this);
        this.handleInputNoLongerHasFocus =
            this.handleInputNoLongerHasFocus.bind(this);
        this.isMaxDistanceValid = this.isMaxDistanceValid.bind(this);
        this.allowedToJog = this.allowedToJog.bind(this);
        this.focusOnNothing = this.focusOnNothing.bind(this);
        this.onFeedRateNumberChange = this.onFeedRateNumberChange.bind(this);
        this.updateMovementType = this.updateMovementType.bind(this);
        this.disableSoftLimitSetting = this.disableSoftLimitSetting.bind(this);
        this.updateUnits = this.updateUnits.bind(this);
        this.updateUnitsOutput = this.updateUnitsOutput.bind(this);
        this.updateUnitsInput = this.updateUnitsInput.bind(this);
        this.updateReadWrites = this.updateReadWrites.bind(this);
        this.setRawHistory = this.setRawHistory.bind(this);
        this.incrementElapsedSeconds = this.incrementElapsedSeconds.bind(this);
        this.refreshShuttleKeys = this.refreshShuttleKeys.bind(this);
        this.currentJog = null;
        this.manual_entry_focused = false;
        this.manual_entry_ref = React.createRef();
        this.max_distance_ref = React.createRef();
        this.unitRef = React.createRef();
        this.wcsRef = React.createRef();
        this.jogModeRef = React.createRef();
        this.homePresetRef = React.createRef();
        this.preset1Ref = React.createRef();
        this.preset2Ref = React.createRef();
        this.preset3Ref = React.createRef();
        this.preset4Ref = React.createRef();
        this.commandKeys = {};
        this.eventKeyFrontEndCommandMap = {};
        this.backEndKeyMap = {
            gantry_left: "LEFT",
            gantry_right: "RIGHT",
            raise_table: "UP",
            lower_table: "DOWN",
            retract: "RETRACT",
            plunge: "PLUNGE",
        };
        this.pathIdFrontEndCommandMap = {
            y_neg_path: "gantry_left",
            y_pos_path: "gantry_right",
            z_neg_path: "plunge",
            z_pos_path: "retract",
            x_pos_path: "lower_table",
            x_neg_path: "raise_table",
        };
        this.coordinateColorThresholdCache = {};
    }

    disableSoftLimitSetting() {
        ipcRenderer.send(
            "Settings::UpdateSettings",
            this.state.settings.pause,
            this.state.settings.enableSlider,
            this.state.settings.maxFeedRate,
            true
        );
        let settings = this.state.settings;
        settings.disableLimitCatch = true;
        this.setState({ settings: settings });
    }

    handleInputHasFocus(focusName) {
        this.setState({ focusedInput: focusName });
    }

    handleInputNoLongerHasFocus() {
        this.setState({ focusedInput: "" });
    }

    updateMovementType(event, command) {
        let movementType;

        const regex = /G9[0-1]/i;
        if (command.length > 0) {
            movementType = command[0].VALUE.match(regex);
        }
        if (movementType && command[1].VALUE === "ok") {
            this.setState({
                movementAbsolute:
                    movementType[0].toLowerCase() === "g90" ? true : false,
            });
        }
    }

    handleEStop() {
        console.log("estop fired!");
        ipcRenderer.send("Jobs::EmergencyStop");
    }

    refreshShuttleKeys() {
        ipcRenderer.once(
            "CNC::GetShuttleKeysResponse",
            (event, commandKeys) => {
                this.commandKeys = commandKeys;

                // populate eventKeyFrontEndCommandMap
                _.each(
                    this.commandKeys,
                    (commandKey, commandValue) =>
                        (this.eventKeyFrontEndCommandMap[
                            commandKey.toLowerCase()
                        ] = commandValue)
                );

                // this is a test
                // populate pathIdEventKeyMap
                this.setState({
                    pathIdEventKeyMap: {
                        y_neg_path: this.getCommandKey("gantry_left"),
                        y_pos_path: this.getCommandKey("gantry_right"),
                        z_neg_path: this.getCommandKey("plunge"),
                        z_pos_path: this.getCommandKey("retract"),
                        x_pos_path: this.getCommandKey("lower_table"),
                        x_neg_path: this.getCommandKey("raise_table"),
                    },
                });
            }
        );
        ipcRenderer.send("CNC::GetShuttleKeys");
    }

    fetchAsyncData() {
        this.refreshShuttleKeys();

        ipcRenderer.once("Settings::GetSettingsResponse", (event, settings) => {
            this.setState({ settings: settings });
        });
        ipcRenderer.send("Settings::GetSettings");

        ipcRenderer.once("CNC::GetMachineConfigResponse", (event, config) => {
            let limits = this.state.limits;

            if (config.soft_limits != null) {
                limits = JSON.parse(config.soft_limits);
            }

            this.setState({
                limits: limits,
            });
        });
        ipcRenderer.send("CNC::GetMachineConfig");
    }

    progress() {
        setTimeout(this.progress, 100);
    }

    // getMillingProgress() {
    //     while (this.props.open) {
    //         ipcRenderer.send("Jobs::GetProgress", 0);
    //         ipcRenderer.once(
    //             "Jobs::GetProgressResponse",
    //             (event, updatedProgress) => {
    //                 if (updatedProgress.milling) {
    //                     this.setState({
    //                         millingProgress:
    //                             updatedProgress.progress.percentage,
    //                     });
    //                     this.props.setMilling(true);
    //                 } else {
    //                     this.props.setMilling(false);
    //                 }
    //             }
    //         );
    //         setTimeout(this.getMillingProgress, 100);
    //         return;
    //     }
    // }

    // getMillingInProgressDisplay() {
    //     if (this.props.milling) {
    //         return (
    //             <React.Fragment>
    //                 <Typography display="inline" variant="h4" color="primary">
    //                     {this.state.millingProgress}%
    //                 </Typography>
    //                 <RPMDivergence indicatorHeight="30px" />
    //                 <LinearProgress
    //                     variant="determinate"
    //                     color="primary"
    //                     style={{ height: "5px" }}
    //                     value={this.state.millingProgress}
    //                 />
    //             </React.Fragment>
    //         );
    //     }
    //     return;
    // }

    closeShuttleSettings() {
        this.setState({ openShuttleSettings: false });
    }

    openShuttleSettings() {
        this.setState({ openShuttleSettings: true });
    }

    printLog(event, arg) {
        // console.log(JSON.stringify(arg));
    }

    updateReadWrites(event, newLines) {
        if (newLines.length > 0) {
            let readWrites = this.state.readWrites.concat(newLines);

            // this ensures the output window only has as many as 50 readWrites

            this.setState({
                readWrites: readWrites,
            });
        }
    }

    componentDidMount() {
        this.fetchAsyncData.call(this);

        window.addEventListener("keydown", this.keydownListener, true);
        window.addEventListener("keyup", this.keyupListener, true);

        this.interval = setInterval(() => {
            ipcRenderer.send("CNC::GetStatus");
        }, 200);

        ipcRenderer.removeListener(
            "CR_UpdateRealtimeStatus",
            this.updateRealtimeStatus
        );
        ipcRenderer.on("CR_UpdateRealtimeStatus", this.updateRealtimeStatus);
        ipcRenderer.send("CNC::SetManualEntryMode", true);

        // this.getMillingProgress();
        // ipcRenderer.removeListener("Jobs::ReadWrites", this.updateMovementType);
        // ipcRenderer.on("Jobs::ReadWrites", this.updateMovementType);
        this.setState({ feedRate2: this.state.feedRate });
        ipcRenderer.removeListener("Jobs::ReadWrites", this.updateReadWrites);
        ipcRenderer.on("Jobs::ReadWrites", this.updateReadWrites);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        this.stopTimer();
        window.removeEventListener("keydown", this.keydownListener, true);
        window.removeEventListener("keyup", this.keyupListener, true);
        ipcRenderer.removeListener(
            "CR_UpdateRealtimeStatus",
            this.updateRealtimeStatus
        );
        ipcRenderer.send("CNC::SetManualEntryMode", false);
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            !_.isEqual(this.state.units, prevState.units) ||
            !_.isEqual(this.state.limits, prevState.limits) ||
            !_.isEqual(this.state.fixed_distance, prevState.fixed_distance) ||
            !_.isEqual(this.state.mode, prevState.mode)
        ) {
            this.coordinateColorThresholdCache = {};
        }
        if (this.props.milling != prevProps.milling) {
            if (this.props.milling) {
                this.startTimer();
            } else {
                this.stopTimer();
            }
        }
    }

    convertToUnits(value, input_unit, output_unit) {
        if (input_unit === output_unit) {
            return value;
        }

        let sanitizedValue = this.isMaxDistanceValid(value) ? value : 0;
        const isMM = input_unit === "mm";
        if (isMM) {
            sanitizedValue = sanitizedValue / 25.4;
        } else {
            sanitizedValue = sanitizedValue * 25.4;
        }

        return sanitizedValue.toFixed(isMM ? 3 : 4);
    }

    updateRealtimeStatus(event, status) {
        if (
            !this.firstRealTimeStatusReceived &&
            this.state.realTimeStatus &&
            this.state.realTimeStatus.state
        ) {
            this.firstRealTimeStatusReceived = true;

            if (this.state.realTimeStatus.state.toLowerCase() == "alarm") {
                this.setState({ homingAlertDialogOpen: true });
            }
        }

        try {
            const parsed = JSON.parse(status);
            if (parsed.error == null) {
                // console.log(JSON.stringify(parsed));
                let status = parsed.status;
                let wcs = this.state.WCS;
                if (status.work_coordinates != null) {
                    wcs = status.work_coordinates.wcs;
                }

                this.setState({
                    realTimeStatus: status,
                    realTimeStatusDisplay: this.getStatusDisplay(status),
                    WCS: wcs,
                    units: status.parserUnits,
                    movementType: status.movementType,
                });
            }
        } catch (e) {
            console.log(e);
        }
    }

    focusOnNothing() {
        setTimeout(() => {
            if (document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
                this.setState({ focusedInput: "" });
                console.log("focusOnNothing fired!");
            }
        }, 0);
    }

    getAxisValue(axis, value) {
        const regex = new RegExp(axis + "-?[0-9]+\\.?[0-9]*", "i");
        const movementString = value.match(regex);
        if (movementString) {
            return Number(movementString[0].slice(1));
        } else {
            return 0;
        }
    }

    convertToAbsolute(axis, value) {
        return value + Number(this.get_position(axis));
    }

    tempIsMovementAbsolute(value) {
        let movementType;

        const regex = /G9[0-1]/i;
        movementType = value.match(regex);

        if (movementType) {
            return movementType[0].toLowerCase() === "g90" ? true : false;
        }
    }

    containsTypeAndDir(value) {
        const regex1 = /G9[0-1]/i;
        const regex2 = /(x|y|z)-?[0-9]+/i;

        let directionChange = value.match(regex1);
        let axisChange = value.match(regex2);

        if (directionChange && axisChange) {
            return true;
        } else {
            return false;
        }
    }

    isOutOfBounds(value) {
        let x, y, z;
        let xLimit, yLimit, zLimit;
        let useTempMovementType;
        let movementTypeAbsolute;

        if (this.props.firmware != null && this.props.firmware.grbl != null) {
            if (this.props.firmware.grbl.startsWith("1.1")) {
                xLimit = -86.5;
                yLimit = -241.5;
                zLimit = -78.5;
            } else {
                xLimit = -75;
                yLimit = -180;
                zLimit = -60.5;
            }
        }

        useTempMovementType = this.containsTypeAndDir(value);

        if (useTempMovementType) {
            movementTypeAbsolute = this.tempIsMovementAbsolute(value);
        } else {
            movementTypeAbsolute =
                this.state.movementType == "absolute" ? true : false;
        }

        x = this.getAxisValue("x", value);
        y = this.getAxisValue("y", value);
        z = this.getAxisValue("z", value);

        if (!movementTypeAbsolute) {
            x = this.convertToAbsolute("x", x);
            y = this.convertToAbsolute("y", y);
            z = this.convertToAbsolute("z", z);
        }

        if (x > 0 || x < xLimit || y > 0 || y < yLimit || z > 0 || z < zLimit) {
            return true;
        } else {
            return false;
        }
    }

    sendCommand() {
        let isOutOfBounds = false;
        isOutOfBounds = this.isOutOfBounds(this.state.manualEntry);
        // if (isOutOfBounds) {
        //     console.log("out of bounds");
        //     this.setState({ limitWarningOpen: true });
        // } else {
        console.log("in bounds");
        this.executeCommand();
        // }
    }

    executeCommand() {
        this.manual_entry_ref.current.focus();
        const command = this.state.manualEntry;

        this.updateUnits(command);
        let history = this.state.entryHistory.slice();
        let searchIndex = history.indexOf(command);
        if (searchIndex !== -1) {
            history.splice(searchIndex, 1);
        }
        history.push(command);
        const buffSize = 15;
        if (history.length === buffSize) {
            history.splice(1, 1);
        } // Remove earliest except for empty string at front

        // Hack to clear raw output
        // const nextStepNum = this.state.step.stepNum + 1;
        this.setState({
            manualEntry: "",
            entryHistory: history,
            historyIndex: history.length,
            isSeekingHistory: false,
            currentTab: 0,
        });

        if (command.trim().toLowerCase() === "$h") {
            this.sendHome();
        } else if (command.trim() === "|") {
            // this.setState({ movementAbsolute: true });
            ipcRenderer.send("CNC::ExecuteCommand", command);
        } else {
            ipcRenderer.send("CNC::ExecuteCommand", command);
        }

        this.fetchAsyncData.call(this);
    }

    getCommandKey(value) {
        if (this.commandKeys == null) {
            return "";
        } else {
            return this.commandKeys[value];
        }
    }

    getFrontEndCommand(eventKey) {
        let sanitizedEventKey = (eventKey || "").toLowerCase();
        let frontEndCommand =
            this.eventKeyFrontEndCommandMap[sanitizedEventKey];

        //We hard key these but allow the jog commands to be bound to other keys as well
        //These are hardcoded because now that NumLock is used to quick-jump to max_distance
        //it causes my preferred keybindings (the number pad) to inadvertently switch between
        //the bound keys (4, 8, etc.) and the arrow keys. This allows me to keep my preferred keybindings
        if (eventKey == "ArrowLeft") {
            frontEndCommand = "gantry_left";
        } else if (eventKey == "ArrowRight") {
            frontEndCommand = "gantry_right";
        } else if (eventKey == "ArrowUp") {
            frontEndCommand = "raise_table";
        } else if (eventKey == "ArrowDown") {
            frontEndCommand = "lower_table";
        }

        if (!frontEndCommand) {
            throw new Error(
                `Cannot determine frontEndCommand from eventKey: ${sanitizedEventKey}`
            );
        }

        return frontEndCommand;
    }

    getBackendCommand(frontEndCommand) {
        let sanitizedFrontEndCommand = (frontEndCommand || "").toLowerCase();

        let backendCommand = this.backEndKeyMap[sanitizedFrontEndCommand];

        if (!backendCommand) {
            throw new Error(
                `Cannot determine backendCommand from frontEndCommand: ${sanitizedFrontEndCommand}`
            );
        }

        return backendCommand;
    }

    jogStart(frontEndCommand) {
        if (this.currentJog != null || !this.allowedToJog()) {
            return;
        }

        let backendCommand = this.getBackendCommand(frontEndCommand);
        this.currentJog = frontEndCommand;

        let value = this.convertToUnits(
            this.state.fixed_distance.value,
            this.state.fixed_distance.unit,
            "mm"
        );

        ipcRenderer.send(
            "CNC::Jog",
            backendCommand,
            this.state.mode === "Continuous",
            value
        );
        this.setState({ isHome: false });
    }

    jogEnd() {
        if (this.jogInterval != null) {
            clearInterval(this.jogInterval);
            this.jogInterval = null;
        }

        if (this.currentJog != null) {
            ipcRenderer.send("CNC::CancelJog");
            this.currentJog = null;
        }
    }

    keydownListener(event) {
        let eventKey = event.key;
        //console.log(eventKey);

        if (this.state.focusedInput) {
            if (
                eventKey == this.getCommandKey("escape_textbox") ||
                (this.state.focusedInput == "max_distance" &&
                    eventKey == "Enter")
            ) {
                this.focusOnNothing();
                return;
            }

            if (this.state.focusedInput == "manual_entry") {
                if (eventKey == "Enter") {
                    this.state.settings.disableLimitCatch
                        ? this.executeCommand()
                        : this.sendCommand();
                } else if (
                    eventKey === "ArrowDown" &&
                    this.state.isSeekingHistory
                ) {
                    let index = this.state.historyIndex + 1;
                    let command = "";
                    if (index < this.state.entryHistory.length) {
                        command = this.state.entryHistory[index];
                    } else {
                        index = this.state.entryHistory.length;
                    }
                    this.setState({
                        manualEntry: command,
                        historyIndex: index,
                        isSeekingHistory: true,
                    });
                } else if (eventKey === "ArrowUp") {
                    let index = this.state.historyIndex - 1;
                    if (index < 0) {
                        index = 0;
                    }
                    this.setState({
                        manualEntry: this.state.entryHistory[index],
                        historyIndex: index,
                        isSeekingHistory: true,
                    });
                }

                return;
            }

            return;
        } else if (!this.state.openShuttleSettings) {
            if (eventKey == this.getCommandKey("escape_textbox")) {
                //Putting this condition here so that the escape button doesn't fall through and throw an error message
                return;
            } else if (eventKey == this.getCommandKey("focus_manual_entry")) {
                this.manual_entry_ref.current.focus();
                this.handleInputHasFocus("manual_entry");
                return;
            } else if (eventKey == this.getCommandKey("focus_max_distance")) {
                this.max_distance_ref.current.focus();
                this.handleInputHasFocus("max_distance");
                return;
            } else if (eventKey == this.getCommandKey("switch_units")) {
                if (this.state.units == "mm") {
                    this.sendUnitsInputChange("inch");
                } else if (this.state.units == "inch") {
                    this.sendUnitsInputChange("mm");
                }
                return;
            } else if (eventKey == this.getCommandKey("switch_jog_mode")) {
                if (this.state.mode == "Continuous") {
                    this.setState({ mode: "Fixed" });
                } else if (this.state.mode == "Fixed") {
                    this.setState({ mode: "Continuous" });
                }
                return;
            } else if (eventKey == this.getCommandKey("increase_units")) {
                this.setState({
                    fixed_distance: {
                        value: this.state.fixed_distance.value * 10,
                        unit: this.state.units,
                    },
                });
                return;
            } else if (eventKey == this.getCommandKey("decrease_units")) {
                this.setState({
                    fixed_distance: {
                        value: this.state.fixed_distance.value / 10,
                        unit: this.state.units,
                    },
                });
                return;
            } else if (eventKey == this.getCommandKey("home_preset")) {
                this.homePresetRef.current.handleClick();
                return;
            } else if (eventKey == this.getCommandKey("preset_1")) {
                this.preset1Ref.current.handleClick();
                return;
            } else if (eventKey == this.getCommandKey("preset_2")) {
                this.preset2Ref.current.handleClick();
                return;
            } else if (eventKey == this.getCommandKey("preset_3")) {
                this.preset3Ref.current.handleClick();
                return;
            } else if (eventKey == this.getCommandKey("preset_4")) {
                this.preset4Ref.current.handleClick();
                return;
            }
        }

        try {
            if (!this.state.openShuttleSettings) {
                let frontEndCommand = this.getFrontEndCommand(eventKey);
                this.jogStart(frontEndCommand);
            }
        } catch (e) {
            // do nothing, not all keys have bindings
            console.log(e);
        }
    }

    keyupListener(event) {
        if (
            this.currentJog != null &&
            this.currentJog === this.getFrontEndCommand(event.key)
        ) {
            this.jogEnd();
        }
    }

    getEventKeyFromPathId(pathId) {
        return this.state.pathIdEventKeyMap[pathId] || "";
    }

    get_work_pos(axis) {
        if (
            this.state.realTimeStatus &&
            this.state.realTimeStatus.work_coordinates
        ) {
            const value =
                this.state.realTimeStatus.work_coordinates.work_pos[axis];
            return value[this.state.units].toFixed(this.getFixedValue());
        }

        return "";
    }

    getFixedValue() {
        return this.state.units === "mm" ? 3 : 4;
    }

    get_position(axis) {
        if (
            this.state.realTimeStatus &&
            this.state.realTimeStatus.machine_pos
        ) {
            const value = this.state.realTimeStatus.machine_pos[axis];
            return value[this.state.units].toFixed(this.getFixedValue());
        }

        return "";
    }

    getStatusDisplay(status) {
        let realTimeStatusDisplay = "";

        if (status && status.state) {
            realTimeStatusDisplay = status.state;
        }

        return realTimeStatusDisplay;
    }

    onJogRateChange(event, jogRate) {
        this.setState({ jogRate: jogRate });
    }

    onFeedRateChange(event, feedRate) {
        this.setState({ feedRate: feedRate, feedRate2: feedRate });
        this.focusOnNothing();
    }

    onFeedRateNumberChange(event, newFeedRate) {
        if (newFeedRate < 30) {
            newFeedRate = 30;
        } else if (newFeedRate > this.state.settings.maxFeedRate) {
            newFeedRate = this.state.settings.maxFeedRate;
        }
        this.onFeedRateChange(event, newFeedRate);
        this.props.updateFeedRate(newFeedRate);
    }

    onModeChange(e) {
        this.setState({ mode: e.target.value });
        this.jogModeRef.current.blur();
        this.focusOnNothing();
    }

    onSpeedChange(e) {
        this.setState({ speed: e.target.value });
    }

    pathClickStarted(e) {
        let pathId = e.target.id;
        console.log(JSON.stringify(e.target.id));
        console.log("click fired! " + pathId);
        let frontEndCommand = this.pathIdFrontEndCommandMap[pathId];
        if (frontEndCommand) {
            this.jogStart(frontEndCommand);
        }
    }

    pathClickEnded() {
        this.jogEnd();
    }

    isValueInRange(value, pointA, pointB) {
        return (
            (pointA <= value && pointB >= value) ||
            (pointB <= value && pointA >= value)
        );
    }

    getPathColorClass(coordinate, isMax) {
        // temporary override
        return this.props.classes.red;

        const units = this.state.units;
        const value = this.get_position(coordinate, units);

        if (this.state.isHome) {
            return "";
        }

        this.populateCoordinateCache(coordinate, units);
        const coordinateKey = isMax ? "max" : "min";

        if (
            this.coordinateColorThresholdCache == null ||
            this.coordinateColorThresholdCache[coordinate] == null ||
            this.coordinateColorThresholdCache[coordinate][coordinateKey] ==
                null
        ) {
            return "";
        }

        const A =
            this.coordinateColorThresholdCache[coordinate][coordinateKey]["A"];
        const BR =
            this.coordinateColorThresholdCache[coordinate][coordinateKey]["BR"];
        const BY =
            this.coordinateColorThresholdCache[coordinate][coordinateKey]["BY"];

        // the following ||'s are to handle the edge case when the machine coordinate surpasses the provided max or min respectively
        if (
            this.isValueInRange(value, A, BR, isMax) ||
            (isMax && value > A) ||
            (!isMax && value < A)
        ) {
            return this.props.classes.red;
        } else if (this.isValueInRange(value, A, BY, isMax)) {
            return this.props.classes.yellow;
        }
        return "";
    }

    populateCoordinateCache(coordinate, units) {
        if (!this.coordinateColorThresholdCache[coordinate]) {
            let coordinateLimits;

            if (this.state.limits && this.state.limits[coordinate]) {
                coordinateLimits = this.state.limits[coordinate];
            } else {
                coordinateLimits = DEFAULT_COORDINATE_LIMITS;
            }

            let redThreshold;
            let yellowThreshold;
            if (this.state.mode === "Continuous") {
                redThreshold = this.convertToUnits(2, "mm", units);
                yellowThreshold = this.convertToUnits(10, "mm", units);
            } else {
                const fixedDistance = this.getSafeFloat(
                    this.state.fixed_distance.value
                );
                redThreshold = fixedDistance;
                yellowThreshold = this.safeMultiply(fixedDistance, 3);
            }

            if (this.coordinateColorThresholdCache == null) {
                this.coordinateColorThresholdCache = {};
            }

            this.coordinateColorThresholdCache[coordinate] = {
                min: {},
                max: {},
            };

            const minA = this.getSafeFloat(coordinateLimits.min[units]);
            this.coordinateColorThresholdCache[coordinate]["min"]["A"] = minA;
            this.coordinateColorThresholdCache[coordinate]["min"]["BR"] =
                this.safeAdd(minA, redThreshold);
            this.coordinateColorThresholdCache[coordinate]["min"]["BY"] =
                this.safeAdd(minA, yellowThreshold);

            const maxA = this.getSafeFloat(coordinateLimits.max[units]);
            this.coordinateColorThresholdCache[coordinate]["max"]["A"] = maxA;
            this.coordinateColorThresholdCache[coordinate]["max"]["BR"] =
                this.safeSubtract(maxA, redThreshold);
            this.coordinateColorThresholdCache[coordinate]["max"]["BY"] =
                this.safeSubtract(maxA, yellowThreshold);
        }
    }

    getSafeFloat(value) {
        let sanitizedValue = value;
        if (typeof sanitizedValue !== "number") {
            sanitizedValue = parseFloat(sanitizedValue.trim());
        }

        return sanitizedValue;
    }

    safeAdd(a, b) {
        return this.getSafeFloat(a) + this.getSafeFloat(b);
    }

    safeSubtract(a, b) {
        return this.getSafeFloat(a) - this.getSafeFloat(b);
    }

    safeMultiply(a, b) {
        return this.getSafeFloat(a) * this.getSafeFloat(b);
    }

    sendHome() {
        this.setState({
            isHome: true,
        });
        ipcRenderer.send("CNC::ExecuteCommand", "$H");
    }

    selectGCodeFile() {
        ipcRenderer.once("GCodeFileSelected", (event, gCodeFilePath) => {
            let gCodeFilePathDisplay = gCodeFilePath;

            if (gCodeFilePathDisplay.length > 60) {
                gCodeFilePathDisplay = gCodeFilePathDisplay.substr(
                    gCodeFilePathDisplay.length - 60
                );
                gCodeFilePathDisplay = `...${gCodeFilePathDisplay.substr(
                    gCodeFilePathDisplay.indexOf(path.sep)
                )}`;
            }
            ipcRenderer.once(
                "File::ResponseGetManualGCodeFileLines",
                (event, rawGCodes) => {
                    console.log(JSON.stringify(rawGCodes));
                    this.setState({
                        gCodeFilePath: gCodeFilePath,
                        gCodeFilePathDisplay: gCodeFilePathDisplay,
                        rawGCodes: rawGCodes,
                        currentTab: 1,
                    });
                }
            );
            ipcRenderer.send("File::GetManualGCodeFileLines", gCodeFilePath);
        });
        ipcRenderer.send("File::OpenGCodeFileDialog");
    }

    uploadGCodeFile() {
        if (!this.state.gCodeFilePath) {
            return;
        }

        ipcRenderer.once("CNC::UploadGCodeFileResponse", () => {
            this.setState({
                gCodeFilePath: "",
                gCodeFilePathDisplay: "",
                currentTab: 0,
                timerElapsedSeconds: 0,
            });
        });
        ipcRenderer.send("CNC::UploadGCodeFile", this.state.gCodeFilePath);
    }

    isMaxDistanceValid(value) {
        if (isNaN(value)) {
            return false;
        }

        const isEmpty =
            value === null ||
            value === undefined ||
            (typeof value === "string" && value.trim() === "");

        if (isEmpty) {
            return false;
        }

        const units = this.state.units;
        const isMM = units === "mm";
        const min = isMM ? 0.0025 : 0.0001;
        const max = isMM ? 1000 : 40;

        const floatValue = parseFloat(value);

        if (floatValue < min || floatValue > max) {
            return false;
        }

        return true;
    }

    allowedToJog() {
        return (
            this.state.maxDistanceIsValid || this.state.mode === "Continuous"
        );
    }

    sendUnitsInputChange(units) {
        if (units == "mm") {
            ipcRenderer.send("CNC::ExecuteCommand", "G21");
        } else if (units == "inch") {
            ipcRenderer.send("CNC::ExecuteCommand", "G20");
        }
    }

    updateUnits(command) {
        this.updateUnitsOutput(command);
        this.updateUnitsInput(command);
    }

    updateUnitsOutput(command) {
        if (command === "$13=0") {
            this.setState({ units: "mm" });
            this.sendUnitsInputChange("mm");
        } else if (command === "$13=1") {
            this.setState({ units: "inch" });
            this.sendUnitsInputChange("inch");
        }
    }

    updateUnitsInput(command) {
        var match = command.match(/G(20|21)/i);
        if (match) {
            if (match[0] === "G20") {
                this.setState({ units: "inch" });
            } else if (match[0] === "G21") {
                this.setState({ units: "mm" });
            }
        }
    }

    handleFeedPause() {
        if (this.state.paused) {
            this.setState({ paused: false });
            ipcRenderer.send("CNC::ExecuteCommand", "~");
        } else {
            this.setState({ paused: true });
            ipcRenderer.send("CNC::ExecuteCommand", "!");
        }
    }

    setRawHistory(lines) {
        this.setState({ rawHistory: lines });
    }

    incrementElapsedSeconds(seconds) {
        this.setState((prevState) => ({
            timerElapsedSeconds: prevState.timerElapsedSeconds + 1,
        }));
    }

    startTimer() {
        if (!this.timerInterval) {
            this.timerInterval = setInterval(() => {
                this.incrementElapsedSeconds();
            }, 1000);
        }
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    render() {
        function handleMaxDistanceChange(component, e) {
            const value = e.currentTarget.value;
            const isValid = component.isMaxDistanceValid(value);

            component.setState({
                maxDistanceIsValid: isValid,
                fixed_distance: { value: value, unit: component.state.units },
            });
        }

        function maxDistanceInput(component) {
            let textField = "";

            const isFixedMode = component.state.mode === "Fixed";

            if (isFixedMode) {
                const distance = component.convertToUnits(
                    component.state.fixed_distance.value,
                    component.state.fixed_distance.unit,
                    component.state.units
                );

                return (
                    <>
                        <Grid item>Max Distance</Grid>
                        <Grid item xs>
                            <Tooltip
                                open={
                                    component.state
                                        .forceShowJoggingTooltipMaxDistance
                                }
                                placement="top-end"
                                title={
                                    component.state
                                        .joggingTooltipMaxDistanceText
                                }
                            >
                                <FormControl
                                    className={
                                        component.props.classes.formControl
                                    }
                                    error={!component.state.maxDistanceIsValid}
                                    onMouseLeave={(ignored) =>
                                        component.setState({
                                            forceShowJoggingTooltipMaxDistance: false,
                                        })
                                    }
                                    style={{ width: "100%" }}
                                >
                                    <Input
                                        value={distance}
                                        onChange={(e) => {
                                            handleMaxDistanceChange(
                                                component,
                                                e
                                            );
                                        }}
                                        disableUnderline
                                        inputRef={component.max_distance_ref}
                                        onFocus={() =>
                                            component.handleInputHasFocus(
                                                "max_distance"
                                            )
                                        }
                                        onBlur={() =>
                                            component.handleInputNoLongerHasFocus()
                                        }
                                    />
                                </FormControl>
                            </Tooltip>
                        </Grid>
                    </>
                );
            }
        }

        function getJoggingMode(component) {
            return (
                <React.Fragment>
                    <Grid item xs={12} style={{ minWidth: "80%" }}>
                        <Tooltip
                            open={component.state.forceShowJoggingTooltip}
                            placement="top-end"
                            title={component.state.joggingTooltipText}
                        >
                            <FormControl
                                className={component.props.classes.formControl}
                                fullWidth
                                onMouseLeave={(ignored) =>
                                    component.setState({
                                        forceShowJoggingTooltip: false,
                                    })
                                }
                            >
                                <Select
                                    id="jog-mode-select"
                                    labelId="jog-mode-select-label"
                                    ref={component.jogModeRef}
                                    fullWidth
                                    disableUnderline
                                    value={component.state.mode}
                                    onChange={component.onModeChange}
                                    onBlurCapture={(ignored) =>
                                        component.setState({
                                            forceShowJoggingTooltip: false,
                                        })
                                    }
                                >
                                    <MenuItem
                                        value="Continuous"
                                        onMouseEnter={(ignored) =>
                                            component.setState({
                                                forceShowJoggingTooltip: true,
                                                joggingTooltipText:
                                                    "In this mode, CR will move until the arrow click/keystroke ends, or until the axis reaches its end-of-travel.",
                                            })
                                        }
                                        onMouseLeave={(ignored) =>
                                            component.setState({
                                                forceShowJoggingTooltip: false,
                                            })
                                        }
                                        onClick={(ignored) => {
                                            component.jogModeRef.current.blur();
                                            component.focusOnNothing();
                                        }}
                                    >
                                        Continuous Motion
                                    </MenuItem>
                                    <MenuItem
                                        value="Fixed"
                                        onMouseEnter={(ignored) =>
                                            component.setState({
                                                forceShowJoggingTooltip: true,
                                                joggingTooltipText:
                                                    "In this mode, CR will move up to the maximum specified distance per activation (arrow click, keystroke). Motion stops immediately if the keystroke/click ends prior to hitting the maximum specified distance.",
                                            })
                                        }
                                        onMouseLeave={(ignored) =>
                                            component.setState({
                                                forceShowJoggingTooltip: false,
                                            })
                                        }
                                        onClick={(ignored) => {
                                            component.jogModeRef.current.blur();
                                            component.focusOnNothing();
                                        }}
                                    >
                                        Limited (per click)
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Tooltip>
                    </Grid>
                </React.Fragment>
            );
        }

        function getHomingAlertDialog(component) {
            let handleClose = () => {
                component.setState({ homingAlertDialogOpen: false });
            };

            let sendHome = () => {
                handleClose();
                component.sendHome();
            };

            return (
                <React.Fragment>
                    <Dialog
                        open={component.state.homingAlertDialogOpen}
                        onClose={handleClose}
                        aria-labelledby="homing-alert-dialog-title"
                        aria-describedby="homing-alert-dialog-description"
                    >
                        <DialogContent>
                            <DialogContentText>
                                We recommend that you home your machine before
                                jogging.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} color="primary">
                                Continue Without Homing
                            </Button>
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    sendHome();
                                }}
                                color="primary"
                                autoFocus
                            >
                                Home Now
                            </Button>
                        </DialogActions>
                    </Dialog>
                </React.Fragment>
            );
        }

        function getUnitsSelect(component) {
            return (
                <Grid item xs>
                    <Tooltip
                        open={component.state.forceShowUnitTooltip}
                        placement="top-end"
                        title="Defines the units for 'Max Distance,' Machine Coordinates,' & 'Work Coordinates'. G-code manually typed into 'Manual Entry' ignores this drop-down; the parser state ('$G') is used instead."
                        onMouseEnter={(ignored) =>
                            component.setState({ forceShowUnitTooltip: true })
                        }
                        onMouseLeave={(ignored) =>
                            component.setState({ forceShowUnitTooltip: false })
                        }
                    >
                        <FormControl
                            className={component.props.classes.formControl}
                            onMouseEnter={(ignored) =>
                                component.setState({
                                    forceShowUnitTooltip: true,
                                })
                            }
                            onMouseLeave={(ignored) =>
                                component.setState({
                                    forceShowUnitTooltip: false,
                                })
                            }
                        >
                            <Select
                                //className={component.props.classes.select}
                                labelId="units-select-label"
                                autoWidth={false}
                                ref={component.unitRef}
                                disableUnderline
                                value={component.state.units}
                                onChange={(e) => {
                                    component.sendUnitsInputChange(
                                        e.target.value
                                    );
                                    component.setState({
                                        units: e.target.value,
                                    });
                                    component.fetchAsyncData.call(component);
                                    component.unitRef.current.blur();
                                    component.focusOnNothing();
                                }}
                                onMouseEnter={(ignored) =>
                                    component.setState({
                                        forceShowUnitTooltip: true,
                                    })
                                }
                                onMouseLeave={(ignored) =>
                                    component.setState({
                                        forceShowUnitTooltip: false,
                                    })
                                }
                                onBlurCapture={(ignored) =>
                                    component.setState({
                                        forceShowUnitTooltip: false,
                                    })
                                }
                            >
                                <MenuItem
                                    value="mm"
                                    onMouseEnter={(ignored) =>
                                        component.setState({
                                            forceShowUnitTooltip: true,
                                        })
                                    }
                                    onMouseLeave={(ignored) =>
                                        component.setState({
                                            forceShowUnitTooltip: false,
                                        })
                                    }
                                    onClick={(ignored) => {
                                        component.unitRef.current.blur();
                                        component.focusOnNothing();
                                    }}
                                >
                                    mm
                                </MenuItem>
                                <MenuItem
                                    value="inch"
                                    onMouseEnter={(ignored) =>
                                        component.setState({
                                            forceShowUnitTooltip: true,
                                        })
                                    }
                                    onMouseLeave={(ignored) =>
                                        component.setState({
                                            forceShowUnitTooltip: false,
                                        })
                                    }
                                    onClick={(ignored) => {
                                        component.unitRef.current.blur();
                                        component.focusOnNothing();
                                    }}
                                >
                                    inch
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </Tooltip>
                </Grid>
            );
        }

        function getWCSSelect(component) {
            return (
                <Grid item>
                    <FormControl
                        className={component.props.classes.formControl}
                    >
                        <Select
                            className={component.props.classes.select}
                            labelId="wcs-select-label"
                            ref={component.wcsRef}
                            disableUnderline
                            value={component.state.WCS}
                            onChange={(e) => {
                                component.setState({ WCS: e.target.value });
                                ipcRenderer.send(
                                    "CNC::ExecuteCommand",
                                    e.target.value
                                );
                                component.fetchAsyncData.call(component);
                                component.wcsRef.current.blur();
                                component.focusOnNothing();
                            }}
                        >
                            <MenuItem
                                value="G54"
                                onClick={(ignored) => {
                                    component.wcsRef.current.blur();
                                    component.focusOnNothing();
                                }}
                            >
                                G54
                            </MenuItem>
                            <MenuItem
                                value="G55"
                                onClick={(ignored) => {
                                    component.wcsRef.current.blur();
                                    component.focusOnNothing();
                                }}
                            >
                                G55
                            </MenuItem>
                            <MenuItem
                                value="G56"
                                onClick={(ignored) => {
                                    component.wcsRef.current.blur();
                                    component.focusOnNothing();
                                }}
                            >
                                G56
                            </MenuItem>
                            <MenuItem
                                value="G57"
                                onClick={(ignored) => {
                                    component.wcsRef.current.blur();
                                    component.focusOnNothing();
                                }}
                            >
                                G57
                            </MenuItem>
                            <MenuItem
                                value="G58"
                                onClick={(ignored) => {
                                    component.wcsRef.current.blur();
                                    component.focusOnNothing();
                                }}
                            >
                                G58
                            </MenuItem>
                            <MenuItem
                                value="G59"
                                onClick={(ignored) => {
                                    component.wcsRef.current.blur();
                                    component.focusOnNothing();
                                }}
                            >
                                G59
                            </MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            );
        }

        function getSvg(component) {
            return (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="3.68056in"
                    height="1.875in"
                    viewBox="0 0 265 135"
                    className={component.props.classes.millImageStyle}
                >
                    <path
                        id="x_neg_head"
                        className={component.getPathColorClass("x", false)}
                        fill="transparent"
                        stroke="#7b7b7b"
                        strokeWidth="3"
                        d="M 9.59,0.81
           C 6.99,2.94 3.43,9.10 1.70,12.21
             0.93,13.60 -0.10,15.35 1.19,16.80
             2.80,18.62 13.10,17.97 15.84,17.95
             17.21,17.94 19.96,18.13 20.79,16.80
             21.65,15.44 20.38,13.40 19.72,12.21
             19.72,12.21 13.52,2.32 13.52,2.32
             12.07,0.56 11.69,0.42 9.59,0.81 Z"
                    />
                    <path
                        id="x_pos_head"
                        className={component.getPathColorClass("x", true)}
                        fill="transparent"
                        stroke="#7b7b7b"
                        strokeWidth="3"
                        d="M 1.18,91.21
           C 1.07,91.41 0.53,91.60 0.52,92.74
             0.51,94.75 6.19,103.52 7.63,105.48
             8.67,106.91 10.02,108.59 12.02,107.62
             13.75,106.78 18.74,98.31 19.90,96.22
             20.67,94.83 21.70,93.08 20.41,91.63
             19.38,90.46 17.27,90.51 15.84,90.48
             12.24,90.42 4.17,89.91 1.18,91.21 Z"
                    />
                    <path
                        id="y_pos_head"
                        className={component.getPathColorClass("y", true)}
                        fill="transparent"
                        stroke="#7b7b7b"
                        strokeWidth="3"
                        d="M 188.00,112.00
           C 186.62,116.85 186.91,121.99 187.00,127.00
             187.04,129.07 186.91,132.71 189.31,133.59
             191.98,134.57 205.57,126.69 204.55,122.99
             203.54,119.33 191.64,113.16 188.00,112.00 Z"
                    />
                    <path
                        id="y_neg_head"
                        className={component.getPathColorClass("y", false)}
                        fill="transparent"
                        stroke="#7b7b7b"
                        strokeWidth="3"
                        d="M 50.00,135.00
           C 51.38,130.15 51.09,125.01 51.00,120.00
             50.96,117.93 51.09,114.29 48.69,113.41
             46.02,112.43 32.43,120.31 33.45,124.01
             34.46,127.67 46.36,133.84 50.00,135.00 Z"
                    />
                    <path
                        id="z_pos_head"
                        className={component.getPathColorClass("z", true)}
                        fill="transparent"
                        stroke="#7b7b7b"
                        strokeWidth="3"
                        d="M 252.98,0.81
           C 250.39,2.94 246.82,9.10 245.10,12.21
             244.33,13.60 243.30,15.35 244.59,16.80
             246.19,18.62 256.50,17.97 259.24,17.95
             260.61,17.94 263.36,18.13 264.19,16.80
             265.04,15.44 263.78,13.40 263.11,12.21
             263.11,12.21 256.91,2.32 256.91,2.32
             255.47,0.56 255.09,0.42 252.98,0.81 Z"
                    />
                    <path
                        id="z_neg_head"
                        className={component.getPathColorClass("z", false)}
                        fill="transparent"
                        stroke="#7b7b7b"
                        strokeWidth="3"
                        d="M 244.58,87.62
           C 244.47,87.82 243.93,88.01 243.92,89.15
             243.91,91.16 249.58,99.93 251.02,101.89
             252.07,103.32 253.42,105.00 255.41,104.03
             257.15,103.18 262.14,94.72 263.30,92.63
             264.07,91.24 265.10,89.49 263.81,88.04
             262.78,86.87 260.66,86.92 259.24,86.89
             255.64,86.83 247.57,86.32 244.58,87.62 Z"
                    />

                    <SVGPath
                        id="y_neg_path"
                        fill={"transparent"}
                        stroke={"transparent"}
                        strokeWidth={"1"}
                        d="M 50.00,135.00
           C 50.00,135.00 51.00,125.00 51.00,125.00
             51.00,125.00 109.00,125.00 109.00,125.00
             109.00,125.00 109.00,122.00 109.00,122.00
             109.00,122.00 51.00,122.00 51.00,122.00
             50.99,119.63 51.47,114.43 48.69,113.41
             45.91,112.39 33.38,120.27 33.34,123.17
             33.27,127.19 46.45,133.87 50.00,135.00 Z"
                        clickStarted={component.pathClickStarted}
                        clickEnded={component.pathClickEnded}
                        tooltipValue={component.getEventKeyFromPathId(
                            "y_neg_path"
                        )}
                        tooltipPlacement={"bottom-end"}
                    />
                    <SVGPath
                        id="y_pos_path"
                        fill={"transparent"}
                        stroke={"transparent"}
                        strokeWidth={"1"}
                        d="M 188.00,112.00
           C 188.00,112.00 187.00,122.00 187.00,122.00
             187.00,122.00 129.00,122.00 129.00,122.00
             129.00,122.00 129.00,125.00 129.00,125.00
             129.00,125.00 187.00,125.00 187.00,125.00
             187.01,127.37 186.53,132.57 189.31,133.59
             192.09,134.61 204.62,126.73 204.66,123.83
             204.73,119.81 191.55,113.13 188.00,112.00 Z"
                        clickStarted={component.pathClickStarted}
                        clickEnded={component.pathClickEnded}
                        tooltipValue={component.getEventKeyFromPathId(
                            "y_pos_path"
                        )}
                        tooltipPlacement={"bottom-start"}
                    />
                    <SVGPath
                        id="z_pos_path"
                        fill={"transparent"}
                        stroke={"transparent"}
                        strokeWidth={"1"}
                        d="M 252.76,17.95
           C 252.76,17.95 252.76,39.49 252.76,39.49
             252.76,39.49 255.64,39.49 255.64,39.49
             255.64,39.49 255.64,17.95 255.64,17.95
             257.47,17.95 263.17,18.43 264.19,16.80
             265.04,15.44 263.78,13.40 263.11,12.21
             261.78,9.82 256.89,0.61 254.19,0.53
             251.55,0.46 246.41,9.84 245.10,12.21
             244.44,13.41 243.54,14.90 244.23,16.29
             245.33,18.51 250.60,17.95 252.76,17.95 Z"
                        clickStarted={component.pathClickStarted}
                        clickEnded={component.pathClickEnded}
                        tooltipValue={component.getEventKeyFromPathId(
                            "z_pos_path"
                        )}
                        tooltipPlacement={"top-end"}
                    />
                    <SVGPath
                        id="z_neg_path"
                        fill={"transparent"}
                        stroke={"transparent"}
                        strokeWidth={"1"}
                        d="M 252.76,65.35
           C 252.76,65.35 252.76,86.89 252.76,86.89
             250.92,86.89 245.23,86.41 244.21,88.04
             243.35,89.40 244.62,91.44 245.28,92.63
             246.62,95.02 251.51,104.23 254.21,104.31
             256.85,104.38 261.99,95.00 263.30,92.63
             263.96,91.43 264.86,89.94 264.17,88.55
             263.07,86.33 257.79,86.89 255.64,86.89
             255.64,86.89 255.64,65.35 255.64,65.35
             255.64,65.35 252.76,65.35 252.76,65.35 Z"
                        clickStarted={component.pathClickStarted}
                        clickEnded={component.pathClickEnded}
                        tooltipValue={component.getEventKeyFromPathId(
                            "z_neg_path"
                        )}
                        tooltipPlacement={"bottom"}
                    />
                    <SVGPath
                        id="x_pos_path"
                        fill={"transparent"}
                        stroke={"transparent"}
                        strokeWidth={"1"}
                        d="M 9.36,68.94
           C 9.36,68.94 9.36,90.48 9.36,90.48
             7.53,90.48 1.83,90.00 0.81,91.63
             -0.04,92.99 1.22,95.03 1.89,96.22
             3.22,98.62 8.11,107.82 10.81,107.90
             13.45,107.97 18.59,98.59 19.90,96.22
             20.56,95.02 21.46,93.53 20.77,92.14
             19.67,89.92 14.40,90.48 12.24,90.48
             12.24,90.48 12.24,68.94 12.24,68.94
             12.24,68.94 9.36,68.94 9.36,68.94 Z"
                        clickStarted={component.pathClickStarted}
                        clickEnded={component.pathClickEnded}
                        tooltipValue={component.getEventKeyFromPathId(
                            "x_pos_path"
                        )}
                        tooltipPlacement={"bottom-start"}
                    />
                    <SVGPath
                        id="x_neg_path"
                        fill={"transparent"}
                        stroke={"transparent"}
                        strokeWidth={"1"}
                        d="M 9.36,17.95
           C 9.36,17.95 9.36,39.49 9.36,39.49
             9.36,39.49 12.24,39.49 12.24,39.49
             12.24,39.49 12.24,17.95 12.24,17.95
             14.08,17.95 19.77,18.43 20.79,16.80
             21.65,15.44 20.38,13.40 19.72,12.21
             18.38,9.82 13.49,0.61 10.79,0.53
             8.15,0.46 3.01,9.84 1.70,12.21
             1.04,13.41 0.14,14.90 0.83,16.29
             1.93,18.51 7.21,17.95 9.36,17.95 Z"
                        clickStarted={component.pathClickStarted}
                        clickEnded={component.pathClickEnded}
                        tooltipValue={component.getEventKeyFromPathId(
                            "x_neg_path"
                        )}
                        tooltipPlacement={"top-start"}
                    />
                </svg>
            );
        }

        function getStatusDisplay(component) {
            return (
                <FormControl
                    style={{ border: "none", backgroundColor: "#f6f6f6" }}
                    className={component.props.classes.formControl}
                    fullWidth
                >
                    <Input
                        className="text-box status"
                        id="status-input-label"
                        value={component.state.realTimeStatusDisplay}
                        inputProps={{
                            style: {
                                color: app.modal.color,
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "1.5em",
                                backgroundColor: "#f6f6f6",
                            },
                        }}
                        style={{ border: "none" }}
                        disableUnderline
                        disabled
                    />
                </FormControl>
            );
        }

        function getManualEntryRow(component) {
            if (!component.props.milling) {
                return (
                    <FormControl
                        className={component.props.classes.formControl}
                        fullWidth
                    >
                        {/* <InputLabel id="manual-entry-input" shrink>Manual Entry</InputLabel> */}
                        <Input
                            id="manual-entry-input"
                            inputRef={component.manual_entry_ref}
                            style={{ color: app.modal.color, height: "32px" }}
                            inputProps={{ style: { color: app.modal.color } }}
                            value={component.state.manualEntry}
                            placeholder="Manual Entry"
                            onChange={(e) => {
                                component.setState({
                                    manualEntry: e.currentTarget.value,
                                });
                            }}
                            onFocus={() => {
                                component.handleInputHasFocus("manual_entry");
                                component.manual_entry_focused = true;
                            }}
                            onBlur={() => {
                                component.handleInputNoLongerHasFocus();
                                component.manual_entry_focused = false;
                            }}
                            endAdornment={
                                <InputAdornment
                                    position="end"
                                    style={{
                                        alignItems: "center",
                                        height: "100%",
                                        margin: "0px",
                                    }}
                                >
                                    <IconButton
                                        style={{ padding: "0px" }}
                                        onClick={() => {
                                            console.log(
                                                "disableLimitCatch: " +
                                                    component.state.settings
                                                        .disableLimitCatch
                                            );
                                            component.state.settings
                                                .disableLimitCatch
                                                ? component.executeCommand()
                                                : component.sendCommand();
                                        }}
                                        color="primary"
                                    >
                                        <SendIcon />
                                    </IconButton>
                                </InputAdornment>
                            }
                            disableUnderline
                        />
                    </FormControl>
                );
            }
        }

        return (
            <React.Fragment>
                <ShuttleSettings
                    open={this.state.openShuttleSettings}
                    close={this.closeShuttleSettings}
                    refreshShuttleKeys={this.refreshShuttleKeys}
                />
                {getHomingAlertDialog(this)}

                {/* <Box style={{display: "grid", gridTemplateColumns: , gridTemplateRows: }} */}

                <Grid container spacing={3}>
                    <Grid item xs={7}>
                        <Grid container spacing={2} direction="column">
                            <Grid item>
                                <Grid container justify="space-around">
                                    <Grid item xs={8}>
                                        <CoastRunnerSVG
                                            component={this}
                                            classes={this.props.classes}
                                        />
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Grid container direction="column">
                                            <Grid item>
                                                <ItemPanel
                                                    title="Jog Mode"
                                                    small
                                                >
                                                    <Grid
                                                        container
                                                        direction="column"
                                                        style={{
                                                            height: "100%",
                                                            padding: "10px",
                                                        }}
                                                    >
                                                        <Grid item>
                                                            <Grid
                                                                container
                                                                alignItems="center"
                                                            >
                                                                {getJoggingMode(
                                                                    this
                                                                )}
                                                            </Grid>
                                                        </Grid>
                                                        <Grid
                                                            item
                                                            style={{
                                                                marginTop:
                                                                    "8px",
                                                            }}
                                                        >
                                                            <Grid
                                                                container
                                                                spacing={1}
                                                            >
                                                                {maxDistanceInput(
                                                                    this
                                                                )}
                                                            </Grid>
                                                        </Grid>
                                                        <Grid
                                                            item
                                                            style={{
                                                                marginTop:
                                                                    "8px",
                                                            }}
                                                        >
                                                            <Grid
                                                                container
                                                                justify="center"
                                                                spacing={1}
                                                            >
                                                                <Grid item>
                                                                    <Grid
                                                                        container
                                                                        spacing={
                                                                            1
                                                                        }
                                                                    >
                                                                        <Grid
                                                                            item
                                                                        >
                                                                            Units
                                                                        </Grid>
                                                                        {getUnitsSelect(
                                                                            this
                                                                        )}
                                                                    </Grid>
                                                                </Grid>
                                                                <Grid item>
                                                                    <Grid
                                                                        container
                                                                        spacing={
                                                                            1
                                                                        }
                                                                    >
                                                                        <Grid
                                                                            item
                                                                            xs
                                                                        >
                                                                            WCS
                                                                        </Grid>
                                                                        {getWCSSelect(
                                                                            this
                                                                        )}
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </ItemPanel>
                                            </Grid>
                                            <Grid
                                                item
                                                style={{ marginTop: "15px" }}
                                            >
                                                <Button
                                                    variant="contained"
                                                    onClick={
                                                        this.openShuttleSettings
                                                    }
                                                    fullWidth
                                                >
                                                    Key Bindings
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item style={{ marginTop: "-10px" }}>
                                <Grid
                                    container
                                    justify="space-between"
                                    spacing={1}
                                >
                                    <Grid item xs={3}>
                                        <ItemPanel title="Status" small>
                                            {getStatusDisplay(this)}
                                        </ItemPanel>
                                    </Grid>
                                    <Grid item xs={9}>
                                        <Grid container alignItems="center">
                                            <Grid item xs>
                                                <ItemPanel
                                                    title="Feedrate"
                                                    small
                                                    contentStyle={{
                                                        paddingLeft: "16px",
                                                        paddingRight: "16px",
                                                    }}
                                                >
                                                    <Slider
                                                        className={
                                                            this.props.classes
                                                                .slider
                                                        }
                                                        value={
                                                            this.state.feedRate
                                                        }
                                                        step={2}
                                                        min={30}
                                                        disabled={
                                                            !this.state.settings
                                                                .enable_slider
                                                        }
                                                        max={
                                                            this.state.settings
                                                                .maxFeedRate
                                                        }
                                                        aria-labelledby="label"
                                                        onChange={
                                                            this
                                                                .onFeedRateChange
                                                        }
                                                        onChangeCommitted={(
                                                            event,
                                                            value
                                                        ) => {
                                                            this.props.updateFeedRate(
                                                                value
                                                            );
                                                        }}
                                                    />
                                                </ItemPanel>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Grid container>
                                    <Grid item xs={9}>
                                        <Grid
                                            container
                                            spacing={1}
                                            direction="column"
                                        >
                                            <Grid item>
                                                <Grid
                                                    container
                                                    spacing={1}
                                                    style={{ width: "100%" }}
                                                >
                                                    <Grid item xs={6}>
                                                        <ItemPanel
                                                            title="Machine Coordinates"
                                                            small
                                                        >
                                                            <Grid
                                                                container
                                                                justify="space-evenly"
                                                                alignItems="center"
                                                                direction="column"
                                                                style={{
                                                                    height: "100%",
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <Grid item>
                                                                    <Grid
                                                                        container
                                                                        alignItems="center"
                                                                        spacing={
                                                                            1
                                                                        }
                                                                    >
                                                                        <Grid
                                                                            item
                                                                            xs={
                                                                                2
                                                                            }
                                                                        >
                                                                            X
                                                                        </Grid>
                                                                        <Grid
                                                                            item
                                                                            xs={
                                                                                10
                                                                            }
                                                                        >
                                                                            <TextField
                                                                                disabled
                                                                                margin="dense"
                                                                                className={
                                                                                    this
                                                                                        .props
                                                                                        .classes
                                                                                        .formControl
                                                                                }
                                                                                value={this.get_position(
                                                                                    "x"
                                                                                )}
                                                                            />
                                                                        </Grid>
                                                                    </Grid>
                                                                </Grid>
                                                                <Grid item>
                                                                    <Grid
                                                                        container
                                                                        alignItems="center"
                                                                        spacing={
                                                                            1
                                                                        }
                                                                    >
                                                                        <Grid
                                                                            item
                                                                            xs={
                                                                                2
                                                                            }
                                                                        >
                                                                            Y
                                                                        </Grid>
                                                                        <Grid
                                                                            item
                                                                            xs={
                                                                                10
                                                                            }
                                                                        >
                                                                            <TextField
                                                                                disabled
                                                                                className={
                                                                                    this
                                                                                        .props
                                                                                        .classes
                                                                                        .formControl
                                                                                }
                                                                                margin="dense"
                                                                                value={this.get_position(
                                                                                    "y"
                                                                                )}
                                                                            />
                                                                        </Grid>
                                                                    </Grid>
                                                                </Grid>
                                                                <Grid item>
                                                                    <Grid
                                                                        container
                                                                        alignItems="center"
                                                                        spacing={
                                                                            1
                                                                        }
                                                                    >
                                                                        <Grid
                                                                            item
                                                                            xs={
                                                                                2
                                                                            }
                                                                        >
                                                                            Z
                                                                        </Grid>
                                                                        <Grid
                                                                            item
                                                                            xs={
                                                                                10
                                                                            }
                                                                        >
                                                                            <TextField
                                                                                disabled
                                                                                margin="dense"
                                                                                className={
                                                                                    this
                                                                                        .props
                                                                                        .classes
                                                                                        .formControl
                                                                                }
                                                                                value={this.get_position(
                                                                                    "z"
                                                                                )}
                                                                            />
                                                                        </Grid>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                        </ItemPanel>
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <ItemPanel
                                                            title="Work Coordinates"
                                                            small
                                                        >
                                                            <Grid
                                                                container
                                                                direction="column"
                                                                justify="space-evenly"
                                                                alignItems="center"
                                                                style={{
                                                                    height: "100%",
                                                                    padding:
                                                                        "8px",
                                                                }}
                                                            >
                                                                <Grid item>
                                                                    <Grid
                                                                        container
                                                                        alignItems="center"
                                                                        spacing={
                                                                            1
                                                                        }
                                                                    >
                                                                        <Grid
                                                                            item
                                                                            xs={
                                                                                2
                                                                            }
                                                                        >
                                                                            X
                                                                        </Grid>
                                                                        <Grid
                                                                            item
                                                                            xs={
                                                                                10
                                                                            }
                                                                        >
                                                                            <TextField
                                                                                disabled
                                                                                margin="dense"
                                                                                className={
                                                                                    this
                                                                                        .props
                                                                                        .classes
                                                                                        .formControl
                                                                                }
                                                                                value={this.get_work_pos(
                                                                                    "x"
                                                                                )}
                                                                            />
                                                                        </Grid>
                                                                    </Grid>
                                                                </Grid>
                                                                <Grid item>
                                                                    <Grid
                                                                        container
                                                                        alignItems="center"
                                                                        spacing={
                                                                            1
                                                                        }
                                                                    >
                                                                        <Grid
                                                                            item
                                                                            xs={
                                                                                2
                                                                            }
                                                                        >
                                                                            Y
                                                                        </Grid>
                                                                        <Grid
                                                                            item
                                                                            xs={
                                                                                10
                                                                            }
                                                                        >
                                                                            <TextField
                                                                                disabled
                                                                                margin="dense"
                                                                                className={
                                                                                    this
                                                                                        .props
                                                                                        .classes
                                                                                        .formControl
                                                                                }
                                                                                value={this.get_work_pos(
                                                                                    "y"
                                                                                )}
                                                                            />
                                                                        </Grid>
                                                                    </Grid>
                                                                </Grid>
                                                                <Grid item>
                                                                    <Grid
                                                                        container
                                                                        alignItems="center"
                                                                        spacing={
                                                                            1
                                                                        }
                                                                    >
                                                                        <Grid
                                                                            item
                                                                            xs={
                                                                                2
                                                                            }
                                                                        >
                                                                            Z
                                                                        </Grid>
                                                                        <Grid
                                                                            item
                                                                            xs={
                                                                                10
                                                                            }
                                                                        >
                                                                            <TextField
                                                                                disabled
                                                                                margin="dense"
                                                                                className={
                                                                                    this
                                                                                        .props
                                                                                        .classes
                                                                                        .formControl
                                                                                }
                                                                                value={this.get_work_pos(
                                                                                    "z"
                                                                                )}
                                                                            />
                                                                        </Grid>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                        </ItemPanel>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Grid item>
                                                <Grid
                                                    container
                                                    spacing={1}
                                                    style={{ width: "100%" }}
                                                >
                                                    <Grid item xs={12}>
                                                        <ItemPanel
                                                            title="Position Presets"
                                                            small
                                                        >
                                                            <Grid
                                                                container
                                                                justify="space-between"
                                                                style={{
                                                                    padding:
                                                                        "10px",
                                                                }}
                                                            >
                                                                <Grid item>
                                                                    <PositionPreset
                                                                        ref={
                                                                            this
                                                                                .homePresetRef
                                                                        }
                                                                        home
                                                                        editParentState={() => {
                                                                            this.setState(
                                                                                {
                                                                                    isHome: true,
                                                                                }
                                                                            );
                                                                        }}
                                                                    >
                                                                        Home
                                                                    </PositionPreset>
                                                                </Grid>
                                                                <Grid item>
                                                                    <PositionPreset
                                                                        ref={
                                                                            this
                                                                                .preset1Ref
                                                                        }
                                                                        units={
                                                                            this
                                                                                .state
                                                                                .units
                                                                        }
                                                                        getPosition={
                                                                            this
                                                                                .get_position
                                                                        }
                                                                    >
                                                                        1
                                                                    </PositionPreset>
                                                                </Grid>
                                                                <Grid item>
                                                                    <PositionPreset
                                                                        ref={
                                                                            this
                                                                                .preset2Ref
                                                                        }
                                                                        units={
                                                                            this
                                                                                .state
                                                                                .units
                                                                        }
                                                                        getPosition={
                                                                            this
                                                                                .get_position
                                                                        }
                                                                    >
                                                                        2
                                                                    </PositionPreset>
                                                                </Grid>
                                                                <Grid item>
                                                                    <PositionPreset
                                                                        ref={
                                                                            this
                                                                                .preset3Ref
                                                                        }
                                                                        units={
                                                                            this
                                                                                .state
                                                                                .units
                                                                        }
                                                                        getPosition={
                                                                            this
                                                                                .get_position
                                                                        }
                                                                    >
                                                                        3
                                                                    </PositionPreset>
                                                                </Grid>
                                                                <Grid item>
                                                                    <PositionPreset
                                                                        ref={
                                                                            this
                                                                                .preset4Ref
                                                                        }
                                                                        units={
                                                                            this
                                                                                .state
                                                                                .units
                                                                        }
                                                                        getPosition={
                                                                            this
                                                                                .get_position
                                                                        }
                                                                    >
                                                                        4
                                                                    </PositionPreset>
                                                                </Grid>
                                                            </Grid>
                                                        </ItemPanel>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={3}>
                                        <Grid
                                            container
                                            alignItems="center"
                                            direction="column"
                                            justify="space-evenly"
                                            style={{ height: "100%" }}
                                        >
                                            <Grid
                                                item
                                                style={{
                                                    height: "120px",
                                                    width: "120px",
                                                }}
                                            >
                                                <RunPauseButton />
                                            </Grid>
                                            <Grid
                                                item
                                                style={{
                                                    height: "120px",
                                                    width: "120px",
                                                }}
                                            >
                                                <IconButton
                                                    onClick={this.handleEStop}
                                                >
                                                    <StopButton />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={5}>
                        <Grid
                            container
                            direction="column"
                            spacing={1}
                            style={{ height: "100%" }}
                        >
                            <Grid item>
                                <ItemPanel title="Machine Output" small>
                                    <Grid
                                        container
                                        direction="column"
                                        spacing={1}
                                        style={{
                                            padding: "0px 8px 16px 8px",
                                        }}
                                    >
                                        <Grid item>
                                            <Grid container alignItems="center">
                                                <Grid item xs={8}>
                                                    <Tabs
                                                        value={
                                                            this.state
                                                                .currentTab
                                                        }
                                                        onChange={(
                                                            event,
                                                            newVal
                                                        ) => {
                                                            this.setState({
                                                                currentTab:
                                                                    newVal,
                                                            });
                                                        }}
                                                        TabIndicatorProps={{
                                                            style: {
                                                                background:
                                                                    "#000000",
                                                            },
                                                        }}
                                                    >
                                                        <Tab label="Output" />
                                                        <Tab
                                                            label="file"
                                                            disabled={
                                                                this.state
                                                                    .rawGCodes
                                                                    .length > 0
                                                                    ? false
                                                                    : true
                                                            }
                                                        />
                                                    </Tabs>
                                                </Grid>
                                                <Grid item xs={4}>
                                                    <Grid
                                                        container
                                                        justify="flex-end"
                                                        alignItems="flex-end"
                                                        style={{
                                                            height: "100%",
                                                        }}
                                                    >
                                                        <Grid item>
                                                            <ExportOutput
                                                                machineOutput={
                                                                    this.state
                                                                        .readWrites
                                                                }
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        <Grid item>
                                            <DisplayPanel
                                                tab={this.state.currentTab}
                                                rawGCodes={this.state.rawGCodes}
                                                milling={this.props.milling}
                                                history={this.state.rawHistory}
                                                setHistory={this.setRawHistory}
                                            />
                                        </Grid>
                                        {/* <Grid item>
                                            <Grid container alignItems="center">
                                                <Grid item xs={1}>
                                                    <Timer
                                                        estimatedDuration={624}
                                                        milling={
                                                            this.props.milling
                                                        }
                                                        elapsedSeconds={
                                                            this.state
                                                                .timerElapsedSeconds
                                                        }
                                                        incrementElapsedSeconds={
                                                            this
                                                                .incrementElapsedSeconds
                                                        }
                                                    />
                                                </Grid>
                                                <Grid item xs={11}>
                                                    {this.getMillingInProgressDisplay()}
                                                </Grid>
                                            </Grid>
                                        </Grid> */}
                                    </Grid>
                                </ItemPanel>
                            </Grid>
                            <Grid item>{getManualEntryRow(this)}</Grid>
                            <Grid item>
                                <FormControl
                                    className={this.props.classes.formControl}
                                    fullWidth
                                >
                                    {/* <InputLabel id="g-code-file-input">Run G-code File</InputLabel> */}
                                    <Input
                                        id="g-code-file-input"
                                        style={{
                                            color: app.modal.color,
                                            height: "32px",
                                        }}
                                        inputProps={{
                                            style: { color: app.modal.color },
                                        }}
                                        value={this.state.gCodeFilePathDisplay}
                                        placeholder="Run G-code File"
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <IconButton
                                                    style={{ padding: "0px" }}
                                                    onClick={
                                                        this.selectGCodeFile
                                                    }
                                                    color="primary"
                                                >
                                                    <SelectFileIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        endAdornment={
                                            <InputAdornment position="end">
                                                <IconButton
                                                    style={{ padding: "0px" }}
                                                    onClick={
                                                        this.uploadGCodeFile
                                                    }
                                                    color="primary"
                                                    disabled={
                                                        !this.state
                                                            .gCodeFilePath
                                                    }
                                                >
                                                    <ExecuteIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        }
                                        disableUnderline
                                        readOnly
                                    />
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                <Alert
                    open={this.state.limitWarningOpen}
                    message={
                        "The command you sent will trigger a limit alarm. Would you like to still send it?"
                    }
                    yesNo={true}
                    onOk={(event) => {
                        this.executeCommand();
                        this.setState({ limitWarningOpen: false });
                    }}
                    onCancel={(event) => {
                        this.setState({ limitWarningOpen: false });
                    }}
                    extraButtonText="This error is incorrect"
                    onExtraButton={(event) => {
                        this.setState({
                            reportLimitErrorOpen: true,
                            limitWarningOpen: false,
                        });
                    }}
                />
                <ReportLimitCatchError
                    open={this.state.reportLimitErrorOpen}
                    onClose={(event) => {
                        this.setState({ reportLimitErrorOpen: false });
                    }}
                    inputValue={this.state.manualEntry}
                    onSend={this.disableSoftLimitSetting}
                />
            </React.Fragment>
        );
    }
}

Operations.propTypes = {
    classes: PropTypes.object.isRequired,
    closeDialog: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
};

export default withStyles(styles)(Operations);
