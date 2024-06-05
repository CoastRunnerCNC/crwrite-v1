import {
    Grid,
    Dialog,
    DialogContent,
    Button,
    TextField,
    Checkbox,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from "@material-ui/core";
import React, { useState } from "react";
import ItemPanel from "../../ItemPanel/ItemPanel";
import FeatureSizes from "./FeatureSizes/FeatureSizes";
import CustomInputLabel from "../Shuttle/CustomInputLabel/CustomInputLabel";

const ProbingWizard = (props) => {
    const [featureType, setFeatureType] = useState("");
    const [probeWhere, setProbeWhere] = useState("");
    const [probingType, setProbingType] = useState("");
    const [toolUnits, setToolUnits] = useState("");
    const [wcs, setWcs] = useState("");

    const PictureSVG = () => {
        return (
            <svg
                width="505"
                height="494"
                viewBox="0 0 505 494"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <g filter="url(#filter0_d_1224_606)">
                    <g clip-path="url(#clip0_1224_606)">
                        <rect
                            x="5"
                            y="0.193237"
                            width="500"
                            height="488.807"
                            rx="4"
                            fill="white"
                        />
                        <g clip-path="url(#clip1_1224_606)">
                            <path
                                d="M307.692 384.565C308.22 384.248 308.537 383.614 308.537 382.664V217.089C308.537 215.188 307.164 212.865 305.58 211.914L162.181 129.232C161.336 128.81 160.597 128.704 160.069 129.021L202.307 104.628C202.835 104.311 203.574 104.417 204.419 104.839L347.819 187.627C349.508 188.577 350.776 190.901 350.776 192.801V358.377C350.776 359.327 350.459 359.961 349.931 360.277L307.692 384.67V384.565Z"
                                fill="#F1F2F2"
                            />
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M203.181 109.002L345.708 191.285L345.747 191.308C345.747 191.308 345.808 191.346 345.909 191.454C346.018 191.571 346.14 191.733 346.251 191.931C346.363 192.129 346.445 192.328 346.496 192.503C346.548 192.682 346.552 192.785 346.552 192.802V357.352L312.761 376.866V217.089C312.761 215.201 312.111 213.419 311.311 212.033C310.51 210.647 309.311 209.227 307.754 208.293L169.392 128.515L203.181 109.002ZM158.024 125.324L200.174 100.983C202.634 99.5327 205.147 100.481 206.308 101.062L206.421 101.118L349.89 183.946C349.898 183.95 349.906 183.955 349.914 183.959C351.582 184.905 352.811 186.364 353.611 187.785C354.418 189.216 355 190.98 355 192.802V358.377C355 360.217 354.343 362.557 352.105 363.9L352.044 363.936L303.469 391.987V382.173L304.314 381.667V217.091C304.313 217.091 304.309 217.011 304.26 216.851C304.208 216.679 304.12 216.473 303.995 216.257C303.871 216.043 303.734 215.858 303.606 215.72C303.501 215.606 303.431 215.553 303.412 215.54L160.071 132.892L161.177 130.973L157.896 125.399C157.938 125.373 157.981 125.348 158.024 125.324ZM161.249 131.096L162.181 132.679C161.493 133.07 160.857 133.083 160.539 133.048C160.43 133.035 160.348 133.017 160.295 133.003L161.249 131.096ZM304.314 382.664C304.314 382.667 304.314 382.667 304.314 382.664V382.664ZM346.552 358.377C346.552 358.38 346.552 358.379 346.552 358.377V358.377Z"
                                fill="black"
                            />
                            <path
                                d="M307.692 384.565C307.164 384.882 306.425 384.777 305.58 384.354L162.181 301.672C160.491 300.722 159.224 298.398 159.224 296.498V130.922C159.224 129.971 159.541 129.338 160.069 129.021C160.597 128.704 161.336 128.81 162.181 129.232L305.58 212.02C307.27 212.971 308.537 215.294 308.537 217.194V382.77C308.537 383.721 308.22 384.354 307.692 384.671V384.565Z"
                                fill="#F1F2F2"
                            />
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M163.448 134.841V296.497C163.448 296.514 163.452 296.617 163.505 296.796C163.555 296.971 163.637 297.17 163.749 297.368C163.86 297.566 163.982 297.728 164.091 297.845C164.192 297.953 164.253 297.991 164.253 297.991L164.29 298.012L304.313 378.748V217.194C304.313 217.178 304.309 217.075 304.257 216.896C304.206 216.721 304.124 216.522 304.012 216.324C303.901 216.126 303.779 215.964 303.67 215.847C303.565 215.735 303.504 215.698 303.508 215.701L303.469 215.678L163.448 134.841ZM304.313 382.77C304.313 382.773 304.313 382.772 304.313 382.77V382.77ZM303.469 388.012L160.11 305.353C160.102 305.349 160.095 305.345 160.088 305.341C158.418 304.395 157.189 302.935 156.389 301.514C155.582 300.083 155 298.319 155 296.497V130.922C155 129.082 155.657 126.742 157.895 125.399C160.369 123.915 162.902 124.871 164.07 125.454L164.183 125.511L307.675 208.352C309.344 209.298 310.572 210.757 311.372 212.178C312.179 213.608 312.761 215.373 312.761 217.194V382.77C312.761 384.61 312.104 386.95 309.866 388.293L303.469 392.131V388.012ZM163.448 130.922C163.448 130.92 163.448 130.92 163.448 130.922V130.922Z"
                                fill="black"
                            />
                            <path
                                d="M308.538 214.66L350.776 190.267L308.538 214.66Z"
                                fill="#F1F2F2"
                            />
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M352.888 193.925L310.65 218.318L306.425 211.002L348.664 186.609L352.888 193.925Z"
                                fill="black"
                            />
                        </g>
                        <g clip-path="url(#clip2_1224_606)">
                            <path
                                d="M489.535 119.036L561.748 77.315C565.034 75.3979 566.221 71.1984 564.304 67.8206L492.822 -55.9726C490.905 -59.2592 486.705 -60.446 483.327 -58.5288L411.115 -16.808C407.828 -14.8908 406.641 -10.6913 408.558 -7.31348L480.041 116.48C481.958 119.766 486.157 120.953 489.535 119.036Z"
                                fill="black"
                            />
                            <path
                                d="M549.88 56.6829L962.433 -181.5C965.719 -183.418 966.906 -187.617 964.989 -190.995L917.334 -273.524C915.417 -276.81 911.217 -277.997 907.839 -276.08L495.287 -37.8053C492 -35.8881 490.813 -31.6887 492.73 -28.3108L540.385 54.218C542.303 57.5045 546.502 58.6913 549.88 56.7742V56.6829Z"
                                fill="black"
                            />
                            <path
                                d="M383.361 125.609L465.89 77.9542C469.177 76.0371 470.364 71.8376 468.446 68.4597L444.619 27.1953C442.702 23.9088 438.502 22.722 435.125 24.6391L352.596 72.294C349.309 74.2112 348.122 78.4107 350.04 81.7885L373.867 123.053C375.784 126.339 379.984 127.526 383.361 125.609Z"
                                fill="black"
                            />
                            <path
                                d="M219.947 184.493C219.034 182.941 218.76 181.115 219.217 179.289L221.59 170.343C222.138 168.152 223.781 166.417 225.881 165.595C226.155 165.504 226.52 165.321 226.885 165.23L228.164 164.865C228.62 164.774 228.985 164.591 229.442 164.5C229.533 164.5 229.898 164.409 229.989 164.409C230.446 164.317 230.811 164.226 231.176 164.135C231.541 164.135 232.089 163.952 232.637 163.952L233.641 163.769L235.376 163.587C235.376 163.587 236.197 163.587 236.38 163.496C236.38 163.496 238.662 163.404 238.754 163.404C238.754 163.404 238.754 163.404 238.936 163.404C241.401 163.404 243.957 163.404 246.513 163.404C248.704 163.404 250.895 163.404 253.178 163.404C255.734 163.404 258.108 164.682 259.386 166.873V167.056C260.755 169.43 260.573 172.168 259.021 174.359C256.19 178.376 253.178 181.206 249.891 183.124L238.845 189.514C237.293 190.427 235.376 190.701 233.641 190.244L224.329 187.78C222.503 187.323 221.043 186.136 220.13 184.584L219.947 184.493Z"
                                fill="black"
                            />
                            <path
                                d="M228.072 171.895C227.616 171.073 227.342 170.251 227.159 169.338C226.794 166.6 228.164 163.861 230.537 162.4L242.862 155.279C246.605 153.088 251.169 151.901 257.103 151.536C257.286 151.536 257.377 151.536 257.56 151.536C260.573 151.354 263.768 151.445 266.781 151.536H267.602C270.25 151.536 272.988 151.628 275.545 151.536C275.636 151.536 275.819 151.536 276.001 151.536C276.823 151.536 277.644 151.445 278.466 151.354C278.557 151.354 278.922 151.354 278.922 151.354C281.57 151.171 284.035 152.54 285.313 154.823C285.587 155.279 285.769 155.736 285.952 156.283C286.865 159.387 285.587 162.674 282.757 164.226L270.432 171.347C266.598 173.538 261.851 174.816 255.643 175.09C252.448 175.272 249.161 175.181 246.24 175.09C243.044 175.09 240.214 175.09 237.475 175.09C236.654 175.09 235.741 175.272 234.919 175.364C234.006 175.455 233.093 175.364 232.272 175.181C230.446 174.725 228.985 173.538 228.072 171.986V171.895Z"
                                fill="black"
                            />
                            <path
                                d="M253.999 159.388C252.813 157.105 252.995 154.275 254.547 152.084C257.469 148.159 260.39 145.237 263.677 143.411C270.797 139.303 279.835 139.394 287.869 139.577H288.326C290.425 139.577 292.525 139.577 294.534 139.577C297.09 139.577 299.463 140.855 300.741 143.046V143.229C302.111 145.602 301.928 148.341 300.376 150.532C297.546 154.549 294.534 157.379 291.247 159.296C284.126 163.404 275.088 163.313 267.146 163.131L266.872 156.192V163.131C264.589 163.131 262.49 163.131 260.299 163.131C257.742 163.131 255.46 161.852 254.182 159.661L253.999 159.388Z"
                                fill="black"
                            />
                            <path
                                d="M269.428 148.067C267.511 144.781 268.606 140.49 271.984 138.573L284.309 131.452C288.052 129.261 292.616 128.074 298.55 127.709C298.733 127.709 298.824 127.709 299.007 127.709C302.202 127.526 305.397 127.618 308.501 127.709H308.867C312.792 127.709 316.444 127.8 319.822 127.435C320.735 127.344 321.648 127.435 322.561 127.618C324.386 128.074 325.847 129.261 326.76 130.813C327.216 131.634 327.49 132.456 327.582 133.369C327.947 136.108 326.577 138.847 324.204 140.307L311.879 147.428C308.045 149.619 303.389 150.806 297.272 151.171C294.351 151.354 291.43 151.262 288.508 151.171H287.687C283.944 151.171 280.018 151.08 276.549 151.445C273.81 151.902 270.889 150.623 269.428 148.067Z"
                                fill="black"
                            />
                            <path
                                d="M295.355 135.469C294.168 133.095 294.351 130.356 295.903 128.165C298.824 124.24 301.746 121.318 305.032 119.492C312.153 115.384 321.191 115.476 329.225 115.658H329.773C331.872 115.658 333.881 115.749 335.981 115.658C338.537 115.658 340.91 116.936 342.188 119.127V119.31C343.558 121.684 343.375 124.422 341.823 126.613C338.993 130.63 335.981 133.46 332.694 135.377C325.573 139.486 316.444 139.303 308.501 139.212H307.406C305.489 139.212 303.663 139.212 301.746 139.212C299.189 139.212 296.907 137.934 295.629 135.743L295.446 135.469H295.355Z"
                                fill="black"
                            />
                            <path
                                d="M310.784 124.148C308.867 120.862 309.962 116.571 313.34 114.654L359.808 87.8138C363.095 85.8966 367.385 86.9921 369.303 90.37L376.149 102.238C378.067 105.525 376.971 109.815 373.593 111.733L353.235 123.509C348.305 126.339 342.554 126.978 338.628 127.252C335.707 127.435 332.694 127.435 329.773 127.252H328.951C326.121 127.252 323.017 127.161 320.096 127.252C319.365 127.252 318.635 127.344 317.813 127.435C315.075 127.891 312.153 126.613 310.692 124.057L310.784 124.148Z"
                                fill="black"
                            />
                            <path
                                d="M558.279 71.3811L486.796 -52.4121L414.584 -10.6912L486.066 113.102L558.279 71.3811Z"
                                fill="#767576"
                            />
                            <path
                                d="M958.964 -187.434L911.309 -269.963L498.756 -31.78L546.411 50.7488L958.964 -187.434Z"
                                fill="#C6C5C5"
                            />
                            <path
                                d="M462.421 72.0202L438.594 30.7557L356.065 78.4107L379.892 119.675L462.421 72.0202Z"
                                fill="#C6C5C5"
                            />
                            <path
                                d="M246.331 177.19L235.284 183.58L225.972 181.115L228.346 172.168C228.346 172.168 228.985 171.986 229.168 171.895C229.442 171.895 229.807 171.712 230.081 171.621C230.446 171.529 230.902 171.438 231.267 171.347C231.541 171.347 231.906 171.164 232.18 171.164C232.637 171.164 233.002 170.982 233.458 170.982C233.732 170.982 234.097 170.89 234.371 170.799C234.828 170.799 235.376 170.799 235.923 170.708C236.197 170.708 236.471 170.708 236.654 170.708C237.293 170.708 237.932 170.708 238.571 170.616C238.753 170.616 238.845 170.616 238.936 170.616C241.31 170.616 243.866 170.616 246.239 170.616C248.522 170.616 250.895 170.616 253.178 170.616C250.895 173.812 248.613 176.003 246.239 177.372L246.331 177.19Z"
                                fill="#767576"
                            />
                            <path
                                d="M279.47 158.109L267.146 165.23C263.859 167.147 259.751 167.878 255.369 168.06C252.448 168.243 249.435 168.152 246.422 168.06C243.318 168.06 240.214 168.06 237.11 168.06C237.11 168.06 237.11 168.06 237.019 168.06C236.015 168.06 235.102 168.243 234.098 168.334L246.422 161.213C249.709 159.296 253.726 158.566 258.016 158.383C260.938 158.201 264.042 158.292 267.054 158.383C270.158 158.383 273.354 158.475 276.366 158.383C277.371 158.383 278.375 158.201 279.288 158.109C279.288 158.109 279.288 158.109 279.379 158.109H279.47Z"
                                fill="#767576"
                            />
                            <path
                                d="M287.686 153.271C282.209 156.466 274.54 156.284 267.054 156.192C264.772 156.192 262.398 156.192 260.116 156.192C262.398 152.997 264.681 150.806 267.146 149.437C272.623 146.241 280.292 146.424 287.778 146.515C290.06 146.515 292.434 146.606 294.716 146.515C292.434 149.71 290.151 151.901 287.778 153.271H287.686Z"
                                fill="#767576"
                            />
                            <path
                                d="M320.735 134.191L308.41 141.312C305.215 143.137 301.107 143.868 296.816 144.142C293.895 144.324 290.791 144.233 287.778 144.142C283.67 144.142 279.47 144.05 275.545 144.507L287.869 137.386C291.156 135.469 295.173 134.738 299.463 134.556C302.385 134.373 305.489 134.465 308.501 134.556C312.61 134.556 316.809 134.647 320.735 134.191C320.735 134.191 320.735 134.191 320.826 134.191H320.735Z"
                                fill="#767576"
                            />
                            <path
                                d="M329.042 129.352C323.565 132.547 315.896 132.365 308.41 132.274C306.128 132.274 303.754 132.274 301.472 132.274C303.754 129.078 306.036 126.887 308.501 125.518C313.979 122.323 321.647 122.505 329.133 122.596C331.416 122.596 333.789 122.688 336.072 122.596C333.789 125.792 331.507 127.983 329.133 129.352H329.042Z"
                                fill="#767576"
                            />
                            <path
                                d="M370.124 105.707L349.766 117.484C346.571 119.31 342.462 120.04 338.172 120.314C335.25 120.497 332.146 120.405 329.134 120.314C326.03 120.314 322.834 120.223 319.822 120.314C318.818 120.314 317.905 120.497 316.9 120.588L363.368 93.8391L370.215 105.707H370.124Z"
                                fill="#767576"
                            />
                        </g>
                    </g>
                    <rect
                        x="5.825"
                        y="1.01824"
                        width="498.35"
                        height="487.157"
                        rx="3.175"
                        stroke="black"
                        stroke-width="1.65"
                    />
                </g>
                <defs>
                    <filter
                        id="filter0_d_1224_606"
                        x="0"
                        y="0.193237"
                        width="505"
                        height="493.807"
                        filterUnits="userSpaceOnUse"
                        color-interpolation-filters="sRGB"
                    >
                        <feFlood
                            flood-opacity="0"
                            result="BackgroundImageFix"
                        />
                        <feColorMatrix
                            in="SourceAlpha"
                            type="matrix"
                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                            result="hardAlpha"
                        />
                        <feOffset dx="-5" dy="5" />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix
                            type="matrix"
                            values="0 0 0 0 0.290196 0 0 0 0 0.290196 0 0 0 0 0.290196 0 0 0 1 0"
                        />
                        <feBlend
                            mode="normal"
                            in2="BackgroundImageFix"
                            result="effect1_dropShadow_1224_606"
                        />
                        <feBlend
                            mode="normal"
                            in="SourceGraphic"
                            in2="effect1_dropShadow_1224_606"
                            result="shape"
                        />
                    </filter>
                    <clipPath id="clip0_1224_606">
                        <rect
                            x="5"
                            y="0.193237"
                            width="500"
                            height="488.807"
                            rx="4"
                            fill="white"
                        />
                    </clipPath>
                    <clipPath id="clip1_1224_606">
                        <rect
                            width="200"
                            height="288.807"
                            fill="white"
                            transform="translate(155 100.193)"
                        />
                    </clipPath>
                    <clipPath id="clip2_1224_606">
                        <rect
                            width="800"
                            height="511.788"
                            fill="white"
                            transform="translate(219 -322)"
                        />
                    </clipPath>
                </defs>
            </svg>
        );
    };

    const onFeatureChange = (event) => {
        setFeatureType(event.target.value);
    };

    const onChangeProbeWhere = (event) => {
        setProbeWhere(event.target.value);
    };

    const onChangeProbingType = (event) => {
        setProbingType(event.target.value);
    };

    const onChangeToolUnits = (event) => {
        setToolUnits(event.target.value);
    };

    const onChangeWcs = (event) => {
        setWcs(event.target.value);
    };

    return (
        <React.Fragment>
            <Dialog
                open={props.open}
                fullWidth
                PaperProps={{ style: { height: "100%", maxWidth: "1600px" } }}
                maxWidth="xl"
            >
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Grid container direction="column">
                                <Grid item>
                                    <ItemPanel small title="Probe Feature">
                                        <Grid
                                            container
                                            style={{ width: "100%" }}
                                            justify="center"
                                        >
                                            <Grid item xs={4}>
                                                <Select
                                                    labelId="probe-feature"
                                                    value={featureType}
                                                    onChange={onFeatureChange}
                                                    fullWidth
                                                >
                                                    <MenuItem value="surface">
                                                        Surface (Z Only)
                                                    </MenuItem>
                                                    <MenuItem value="circlePocket">
                                                        Circle Pocket / Bore
                                                    </MenuItem>
                                                    <MenuItem value="rectanglePocket">
                                                        Rectangle Pocket
                                                    </MenuItem>
                                                    <MenuItem value="circleProtrusion">
                                                        Circle Protrusion
                                                    </MenuItem>
                                                </Select>
                                                <CustomInputLabel>
                                                    Probe Feature
                                                </CustomInputLabel>
                                            </Grid>
                                        </Grid>
                                    </ItemPanel>
                                </Grid>
                                <Grid item xs={12}>
                                    <PictureSVG />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={6}>
                            <Grid container direction="column">
                                <Grid item>
                                    <ItemPanel small title="Settings">
                                        <Grid
                                            container
                                            spacing={2}
                                            direction="column"
                                            style={{
                                                paddingTop: "16px",
                                                paddingBottom: "16px",
                                            }}
                                            alignContent="center"
                                        >
                                            <Grid item xs={10}>
                                                <Select
                                                    labelId="probeWhere"
                                                    value={probeWhere}
                                                    onChange={
                                                        onChangeProbeWhere
                                                    }
                                                    fullWidth
                                                >
                                                    <MenuItem value="corner">
                                                        Corner
                                                    </MenuItem>
                                                    <MenuItem value="midpoint-x">
                                                        Midpoint X
                                                    </MenuItem>
                                                    <MenuItem value="midpoint-y">
                                                        Midpoint Y
                                                    </MenuItem>
                                                    <MenuItem value="midpoint-x-y">
                                                        Midpoint X&Y
                                                    </MenuItem>
                                                </Select>
                                                <CustomInputLabel>
                                                    Probe Where
                                                </CustomInputLabel>
                                            </Grid>
                                            <Grid item xs={10}>
                                                {/* Location details */}
                                                <TextField fullWidth />
                                                <CustomInputLabel>
                                                    Location Details
                                                </CustomInputLabel>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Select
                                                    value={probingType}
                                                    onChange={
                                                        onChangeProbingType
                                                    }
                                                    fullWidth
                                                >
                                                    <MenuItem value="electrical">
                                                        Electrical
                                                    </MenuItem>
                                                    <MenuItem value="manual">
                                                        Manual
                                                    </MenuItem>
                                                </Select>
                                                <CustomInputLabel>
                                                    Probing Type
                                                </CustomInputLabel>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Grid
                                                    container
                                                    style={{ width: "100%" }}
                                                >
                                                    <Grid item xs>
                                                        <TextField fullWidth />
                                                        <CustomInputLabel>
                                                            Tool Width
                                                        </CustomInputLabel>
                                                    </Grid>
                                                    <Grid item xs={2}>
                                                        <Select
                                                            labelId="toolUnits"
                                                            value={toolUnits}
                                                            onChange={
                                                                onChangeToolUnits
                                                            }
                                                            fullWidth
                                                        >
                                                            <MenuItem value="mm">
                                                                MM
                                                            </MenuItem>
                                                            <MenuItem value="inches">
                                                                Inches
                                                            </MenuItem>
                                                        </Select>
                                                        <CustomInputLabel>
                                                            Units
                                                        </CustomInputLabel>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Select
                                                    labelId="target-wcs"
                                                    id={wcs}
                                                    onChange={onChangeWcs}
                                                    fullWidth
                                                >
                                                    <MenuItem value="G54">
                                                        G54
                                                    </MenuItem>
                                                    <MenuItem value="G55">
                                                        G55
                                                    </MenuItem>
                                                    <MenuItem value="G56">
                                                        G56
                                                    </MenuItem>
                                                    <MenuItem value="G57">
                                                        G57
                                                    </MenuItem>
                                                    <MenuItem value="G58">
                                                        G58
                                                    </MenuItem>
                                                    <MenuItem value="G59">
                                                        G59
                                                    </MenuItem>
                                                </Select>
                                                <CustomInputLabel>
                                                    Target WCS
                                                </CustomInputLabel>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Grid container>
                                                    <Grid item>
                                                        <CustomInputLabel>
                                                            Axis Selection
                                                        </CustomInputLabel>
                                                    </Grid>
                                                    <Grid item>
                                                        <Grid container>
                                                            <Grid item>
                                                                <Grid
                                                                    container
                                                                    direction="column"
                                                                >
                                                                    <Grid item>
                                                                        <Checkbox value="checkedX" />
                                                                    </Grid>
                                                                    <Grid item>
                                                                        <CustomInputLabel>
                                                                            X
                                                                        </CustomInputLabel>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid item>
                                                                <Grid
                                                                    container
                                                                    direction="column"
                                                                >
                                                                    <Grid item>
                                                                        <Checkbox value="checkedY" />
                                                                    </Grid>
                                                                    <Grid item>
                                                                        <CustomInputLabel>
                                                                            Y
                                                                        </CustomInputLabel>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid item>
                                                                <Grid
                                                                    container
                                                                    direction="column"
                                                                >
                                                                    <Grid item>
                                                                        <Checkbox value="checkedZ" />
                                                                    </Grid>
                                                                    <Grid item>
                                                                        <CustomInputLabel>
                                                                            Z
                                                                        </CustomInputLabel>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={10}>
                                                <FeatureSizes shape="circle" />
                                            </Grid>
                                            <Grid item xs={10}>
                                                <Grid container>
                                                    <Grid item>
                                                        <Grid
                                                            container
                                                            direction="column"
                                                        >
                                                            <Grid item>
                                                                <TextField />
                                                            </Grid>
                                                            <Grid item>
                                                                <CustomInputLabel>
                                                                    X
                                                                </CustomInputLabel>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                    <Grid item>
                                                        <Grid
                                                            container
                                                            direction="column"
                                                        >
                                                            <Grid item>
                                                                <TextField />
                                                            </Grid>
                                                            <Grid item>
                                                                <CustomInputLabel>
                                                                    Y
                                                                </CustomInputLabel>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                    <Grid item>
                                                        <Grid
                                                            container
                                                            direction="column"
                                                        >
                                                            <Grid item>
                                                                <TextField />
                                                            </Grid>
                                                            <Grid item>
                                                                <CustomInputLabel>
                                                                    Z
                                                                </CustomInputLabel>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <CustomInputLabel>
                                                    Additional Offset
                                                </CustomInputLabel>
                                            </Grid>
                                        </Grid>
                                    </ItemPanel>
                                </Grid>
                                <Grid item>
                                    <Button fullWidth>Start</Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
};

export default ProbingWizard;
