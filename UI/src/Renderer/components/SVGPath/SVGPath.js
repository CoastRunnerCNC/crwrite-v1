import PropTypes from "prop-types";
import path from "path";
import React from "react";
import './SVGPath.css';
import {Tooltip} from "@material-ui/core";

class SVGPath extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <React.Fragment>
                <Tooltip title={this.props.tooltipValue} placement={this.props.tooltipPlacement}>
                    <path
                        id={this.props.id}
                        className={' svg-path-link'}
                        fill={this.props.fill}
                        stroke={this.props.stroke}
                        strokeWidth={this.props.strokeWidth}
                        d={this.props.d}
                        onMouseDown={this.props.clickStarted}
                        onMouseUp={this.props.clickEnded}
                    />
                </Tooltip>
            </React.Fragment>
        );
    }
}

SVGPath.propTypes = {
    id: PropTypes.string.isRequired,
    fill: PropTypes.string.isRequired,
    stroke: PropTypes.string.isRequired,
    strokeWidth: PropTypes.string.isRequired,
    d: PropTypes.string.isRequired,
    clickStarted: PropTypes.func.isRequired,
    clickEnded: PropTypes.func.isRequired,
    tooltipValue: PropTypes.string.isRequired,
    tooltipPlacement: PropTypes.string.isRequired
};

export default SVGPath;