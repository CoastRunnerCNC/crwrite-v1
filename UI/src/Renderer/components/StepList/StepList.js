import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {List, ListItem, ListItemText, Typography, ArrowUpwardIcon, ArrowDownwardIcon} from '@material-ui/core';
import {ArrowUpward, ArrowDownward, Close} from '@material-ui/icons'
import app from 'app';

const styles = theme => ({
    root: {
        width: '100%',
        height: 'calc(100% - 0px)',
    },
    list: {
        width: '100%',
        height: '100%',
        overflow: 'auto',
        backgroundColor: '#F1F2F2',
        webkitAppearance: 'none',
        mozAppearance: 'none',
        appearance: 'none',
        padding: '0px'
    },
    item: {
        // '&:hover': {
        //     height: '35px',
        //     backgroundColor: app.milling.steps.items.background,
        //     border: '0px',
        //     marginLeft: '0px',
        //     marginRight: '0px',
        // },
        '&:focus': {
            height: '35px',
            backgroundColor: '#3EC6CB',
            border: '0px',
            marginLeft: '0px',
            marginRight: '0px',
            color: 'white',
        },
        height: '35px',
        backgroundColor: app.milling.steps.items.background,
        border: "#000000 1px solid",
        marginLeft: '0px',
        marginRight: '0px',
        marginBottom: '3px',
        borderRadius: '3px',
        paddingLeft: '8px'
    },
    itemText: {
        marginLeft: '0px',
        marginRight: '0px',
        opacity: 0.87,
        fontSize: '14px',
        color: app.milling.steps.fontColor /* selected: color: #069076;*/

    },

    upArrow: {
        marginLeft: '15px',
        marginRight: '15px',
        color: 'yellow'
    },
    downArrow: {
        marginLeft: '15px',
        marginRight: '15px',
        color: 'yellow'
    },
    deleteButton: {
        float: 'right',
        verticleAlign: 'middle',
        fontSize: '170%',
        marginRight: '15px',
        color: 'red',
        cursor: 'pointer'
    },
    itemTextSelected: {
        marginLeft: '0px',
        marginRight: '0px',
        opacity: 0.87,
        fontSize: '14px',
        color: "white" /* selected: color: #069076;*/
    }
});

class StepList extends React.Component {
    constructor() {
        super();
        this.selectedRef = React.createRef();
    
        this.getListItem = this.getListItem.bind(this);
        this.getUpArrow = this.getUpArrow.bind(this);
        this.getDownArrow = this.getDownArrow.bind(this);
        this.getDeleteIcon = this.getDeleteIcon.bind(this);
    }
    // const { classes, steps, selectedStep } = this.props;

    handleUpArrow(stepIndex) {
        this.props.moveStep(stepIndex, stepIndex - 1);
    }

    handleDownArrow(stepIndex) {
        this.props.moveStep(stepIndex, stepIndex + 1);
    }

    handleDelete(stepIndex) {
        this.props.deleteStep(stepIndex);
    }

    getListItem(step, index, component) {
        var selectedDiv = null;
        if (this.props.selectedStep === index) {
            selectedDiv = (<div style={{ float: "left", clear: "both" }} ref={(el) => { component.selectedRef = el; }} />);
        }

        var color = app.milling.steps.items.background;
        if (this.props.selectedStep === index) {
            color = '#3EC6CB';
        }

        return (
            <ListItem
                button
                disableGutters
                key={index}
                selected={this.props.selectedStep === index}
                className={this.props.classes.item}
                style={{ backgroundColor: color }}
            >
                {selectedDiv}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                    {this.getUpArrow(index)}
                    <ListItemText disableTypography>
                        <Typography noWrap className={this.props.classes.itemText}>{step.Title}</Typography>
                    </ListItemText>
                    {this.getDownArrow(index)}
                    {this.getDeleteIcon(index)}
                </div>
            </ListItem>
        );
    }

    getUpArrow(index) {
        if (this.props.editMode && !this.props.submanifestUsed && this.props.steps.length > 1) {
            return <span onClick={() => {this.handleUpArrow(index)}} className={this.props.classes.upArrow}><ArrowUpward /></span>
        }
    }

    getDownArrow(index) {
        if (this.props.editMode && !this.props.submanifestUsed && this.props.steps.length > 1) {
            return <span onClick={() => {this.handleDownArrow(index)}} className={this.props.classes.downArrow}><ArrowDownward /></span>
        }
    }

    getDeleteIcon(index) {
        if (this.props.editMode && this.props.steps.length > 1) {
            return <span onClick={() => {this.handleDelete(index)}} className={this.props.classes.deleteButton}><Close /></span>;
        }
    }

    componentDidUpdate() {
        setTimeout(() => {
            this.selectedRef.scrollIntoView({ behavior: "smooth", block: 'center' });
        });
    }

    render() {

        const { classes, steps, selectedStep } = this.props;

        function getListItem(step, index, component) {
            var selectedDiv = null;
            if (selectedStep === index) {
                selectedDiv = (<div style={{ float: "left", clear: "both" }} ref={(el) => { component.selectedRef = el; }} />);
            }
            let selectedStepTextColor = classes.itemText;
            var color = app.milling.steps.items.background;
            if (selectedStep === index) {
                color = app.milling.steps.items.selected;
                selectedStepTextColor = classes.itemTextSelected;
            }

            return (
                <ListItem
                    button
                    disableGutters
                    key={index}
                    selected={selectedStep === index}
                    className={classes.item}
                    style={{ backgroundColor: color }}
                >
                    <ListItemText disableTypography>
                        {selectedDiv}
                        <Typography noWrap className={selectedStepTextColor}>{step.Title}</Typography>
                    </ListItemText>
                </ListItem>
            );
        }

        return (
            <div className={this.props.classes.root}>
                <List component="nav" className={this.props.classes.list}>
                    {
                        this.props.steps.map((step, index) => {
                            if (true) {
                            return this.getListItem(step, index, this);
                            }
                        })
                    }
                </List>
                {/*<Typography className={classes.stepNumber} align="right">Step {selectedStep + 1}/{steps.length}</Typography>*/}
            </div>
        );
    }
};

StepList.propTypes = {
    classes: PropTypes.object.isRequired,
    steps: PropTypes.array.isRequired,
    selectedStep: PropTypes.number.isRequired
};

export default withStyles(styles)(StepList);