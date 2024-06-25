import React from 'react';
import PropTypes from 'prop-types';
import path from 'path';
import withStyles from '@material-ui/core/styles/withStyles';
import {Button, Dialog, DialogContent, Fab, DialogTitle, Grid, IconButton, Tab, Tabs, Tooltip} from '@material-ui/core';
import Operations from './Operations.js';
import ShuttleSettings from './ShuttleSettings.js';
import Alert from '../Alert'
import {ipcRenderer} from 'electron';
import app from 'app';

const styles = theme => ({
    close: {
        marginTop: theme.spacing(-1),
        marginBottom: theme.spacing(1)
    },
    shuttleButton: {
        height: '34px',
        width: '34px',
        marginRight: '5px',
        backgroundColor: app.shuttleButton.backgroundColor,
        "&:hover": {
            backgroundColor: app.shuttleButton.hoverColor
        }
    }
});

const ManualModeSVG = (props) => {
    return (
<svg onClick={() => {if (!props.disabled) {props.onClick()}}} style={{ cursor: 'pointer' }} width="86" height="66" viewBox="0 0 86 66" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M42.089 5L23.8696 24.3548L43.3037 45L61.5231 25.6452L42.089 5Z" stroke="black"/>
<path d="M52.4133 23.0645L58.4865 29.5161V37.258H56.0572V35.9677H46.9475L45.7329 34.6774H44.5182L40.8743 30.8064V29.5161L42.089 28.2257V26.9354L45.7329 23.0645H52.4133Z" fill="white"/>
<path d="M42.089 28.2257V26.9354L45.7329 23.0645H52.4133L58.4865 29.5161V37.258H56.0572V35.9677H46.9475L45.7329 34.6774H44.5182L40.8743 30.8064V29.5161M42.089 28.2257H44.5182M42.089 28.2257L40.8743 29.5161M44.5182 28.2257L45.7329 26.9354H46.9475L48.1621 28.2257V29.5161M44.5182 28.2257V29.5161L45.7329 30.8064H46.9475L48.1621 29.5161M48.1621 29.5161H53.628M40.8743 29.5161H37.2304" stroke="black"/>
<rect x="58.4866" y="28.8711" width="3.64389" height="10.3226" fill="black"/>
<rect x="44.5183" y="28.8711" width="3.64389" height="1.29032" fill="black"/>
<path d="M7.62844 53.5L11.4084 57.2L15.1784 53.5H15.5584V61H13.8984V56.34L11.0784 59.32L8.06844 56.34V61H7.23844V53.5H7.62844ZM18.9784 56C18.6318 56 18.3884 56.0533 18.2484 56.16C18.1151 56.2667 18.0484 56.4267 18.0484 56.64H17.2384C17.2384 56.2133 17.3784 55.8633 17.6584 55.59C17.9384 55.31 18.3718 55.17 18.9584 55.17H20.4984C20.7651 55.17 21.0051 55.22 21.2184 55.32C21.4318 55.4133 21.6118 55.54 21.7584 55.7C21.9118 55.86 22.0284 56.0433 22.1084 56.25C22.1884 56.4567 22.2284 56.6667 22.2284 56.88V61H18.9184C18.6918 61 18.4751 60.96 18.2684 60.88C18.0684 60.8 17.8918 60.6867 17.7384 60.54C17.5851 60.3867 17.4618 60.2033 17.3684 59.99C17.2818 59.7767 17.2384 59.54 17.2384 59.28V58.39C17.2384 58.17 17.2851 57.9667 17.3784 57.78C17.4784 57.5933 17.6051 57.43 17.7584 57.29C17.9184 57.15 18.0984 57.04 18.2984 56.96C18.4984 56.88 18.7051 56.84 18.9184 56.84H20.5684V56H18.9784ZM20.5684 57.67H18.8984V60.16H20.5684V57.67ZM27.1684 55.17C27.4084 55.17 27.6317 55.22 27.8384 55.32C28.0517 55.4133 28.235 55.54 28.3884 55.7C28.5484 55.86 28.6717 56.0433 28.7584 56.25C28.8517 56.4567 28.8984 56.6667 28.8984 56.88V61H27.2384V56H25.5684V61H23.9084V55.17H27.1684ZM32.2983 61C32.0583 61 31.8316 60.9567 31.6183 60.87C31.4116 60.7833 31.2283 60.6633 31.0683 60.51C30.9149 60.3567 30.7949 60.1767 30.7083 59.97C30.6216 59.7633 30.5783 59.5433 30.5783 59.31V55.17H32.2383V60.17H33.9083V55.17H35.5683V61H32.2983ZM38.9882 56C38.6415 56 38.3982 56.0533 38.2582 56.16C38.1249 56.2667 38.0582 56.4267 38.0582 56.64H37.2482C37.2482 56.2133 37.3882 55.8633 37.6682 55.59C37.9482 55.31 38.3815 55.17 38.9682 55.17H40.5082C40.7749 55.17 41.0149 55.22 41.2282 55.32C41.4415 55.4133 41.6215 55.54 41.7682 55.7C41.9215 55.86 42.0382 56.0433 42.1182 56.25C42.1982 56.4567 42.2382 56.6667 42.2382 56.88V61H38.9282C38.7015 61 38.4849 60.96 38.2782 60.88C38.0782 60.8 37.9015 60.6867 37.7482 60.54C37.5949 60.3867 37.4715 60.2033 37.3782 59.99C37.2915 59.7767 37.2482 59.54 37.2482 59.28V58.39C37.2482 58.17 37.2949 57.9667 37.3882 57.78C37.4882 57.5933 37.6149 57.43 37.7682 57.29C37.9282 57.15 38.1082 57.04 38.3082 56.96C38.5082 56.88 38.7149 56.84 38.9282 56.84H40.5782V56H38.9882ZM40.5782 57.67H38.9082V60.16H40.5782V57.67ZM45.5781 61H43.9181V53.5H45.5781V61ZM50.8413 53.5L54.6213 57.2L58.3913 53.5H58.7713V61H57.1113V56.34L54.2913 59.32L51.2813 56.34V61H50.4513V53.5H50.8413ZM62.1513 61C61.898 61 61.668 60.9567 61.4613 60.87C61.2547 60.7767 61.0747 60.6533 60.9213 60.5C60.7747 60.3467 60.658 60.1667 60.5713 59.96C60.4913 59.7467 60.4513 59.52 60.4513 59.28V56.88C60.4513 56.6533 60.4947 56.4367 60.5813 56.23C60.668 56.0233 60.788 55.8433 60.9413 55.69C61.0947 55.53 61.2747 55.4033 61.4813 55.31C61.688 55.2167 61.9113 55.17 62.1513 55.17H63.7313C63.9847 55.17 64.2147 55.2167 64.4213 55.31C64.6347 55.4033 64.8147 55.53 64.9613 55.69C65.1147 55.8433 65.2313 56.0233 65.3113 56.23C65.398 56.4367 65.4413 56.6533 65.4413 56.88V59.28C65.4413 59.52 65.398 59.7467 65.3113 59.96C65.2313 60.1667 65.1147 60.3467 64.9613 60.5C64.8147 60.6533 64.6347 60.7767 64.4213 60.87C64.2147 60.9567 63.9847 61 63.7313 61H62.1513ZM63.7813 60.16V56H62.1113V60.16H63.7813ZM72.1113 53.5V61H68.8413C68.6279 61 68.4179 60.9533 68.2113 60.86C68.0046 60.76 67.8213 60.6333 67.6613 60.48C67.5013 60.32 67.3713 60.14 67.2713 59.94C67.1713 59.7333 67.1213 59.5233 67.1213 59.31V56.87C67.1213 56.65 67.1713 56.44 67.2713 56.24C67.3713 56.0333 67.5013 55.8533 67.6613 55.7C67.8213 55.54 68.0046 55.4133 68.2113 55.32C68.4179 55.22 68.6279 55.17 68.8413 55.17H70.4513V53.5H72.1113ZM70.4513 56H68.7812V60.16H70.4513V56ZM75.4512 58.5V60.16H77.0012C77.1212 60.16 77.2378 60.14 77.3512 60.1C77.4645 60.0533 77.5645 59.9933 77.6512 59.92C77.7378 59.8467 77.8078 59.76 77.8612 59.66C77.9145 59.56 77.9412 59.45 77.9412 59.33H78.7612C78.7612 59.55 78.7112 59.76 78.6112 59.96C78.5112 60.16 78.3778 60.34 78.2112 60.5C78.0512 60.6533 77.8678 60.7767 77.6612 60.87C77.4545 60.9567 77.2445 61 77.0312 61H75.4812C75.2478 61 75.0278 60.95 74.8212 60.85C74.6212 60.75 74.4445 60.62 74.2912 60.46C74.1378 60.2933 74.0145 60.1067 73.9212 59.9C73.8345 59.6933 73.7912 59.4867 73.7912 59.28V56.88C73.7912 56.6667 73.8345 56.4567 73.9212 56.25C74.0145 56.0433 74.1378 55.86 74.2912 55.7C74.4512 55.54 74.6312 55.4133 74.8312 55.32C75.0378 55.22 75.2545 55.17 75.4812 55.17H77.0312C77.2712 55.17 77.4978 55.22 77.7112 55.32C77.9245 55.4133 78.1078 55.54 78.2612 55.7C78.4145 55.86 78.5345 56.0433 78.6212 56.25C78.7145 56.4567 78.7612 56.6667 78.7612 56.88V58.5H75.4512ZM77.0912 57.67V55.99H75.4512V57.67H77.0912Z" fill="black"/>
</svg>

    )
}

class Shuttle extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            open: false,
            realTimeStatus: null,
            manualEntry: "",
            step: 0,
            selectedTab: 0,
            milling: false,
            showResetAlert: false,
        };

        this.showDialog = this.showDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.setMilling = this.setMilling.bind(this);
        this.getBindingsTab = this.getBindingsTab.bind(this);
    }

    getBindingsTab() {
      return (<Tab label="Key Bindings" disabled={ false } />);
    }

    showDialog() {
        this.setState({
            open: true,
            selectedTab: 0
        });
        this.props.setOperationsWindowOpen();
    }

    closeDialog() {
        if (this.state.milling) {
            this.setState({ showResetAlert: true });
        } else {
            this.setState({
                open: false
            });
            this.props.closeOperationsWindow();
        }
    }

    setMilling(status) {
        this.setState({ milling: status });
    }

    componentDidUpdate(prevProps) {
        if ((this.props.firmware !== prevProps.firmware) && this.props.firmware) {
        }
    }

    render() {
        function displaySelected(component) {
            if (component.state.selectedTab == 0) {
                return 
            } else {
                return <ShuttleSettings closeDialog={component.closeDialog} />
            }
        }

        function getTooltip(component) {
            if (component.props.milling) {
                return 'Disabled while machine is running';
            }

            return "";
        }


        if (this.props.status != 2 || this.props.firmware == null || this.props.firmware.grbl == null) {
            if (this.state.open) {
                setTimeout(this.closeDialog, 0);
            }

            return "";
        }

        const tooltip = getTooltip(this);
        const disabled = tooltip.length > 0;

        return (
            <React.Fragment>

                <Alert
                    open={this.state.showResetAlert}
                    message={"Your machine is currently executing gcode. Closing this window will reset your machine.\n\nAre you sure you want to close this window?"}
                    yesNo={true}
                    onOk={(event) => {
                        ipcRenderer.send("CNC::ExecuteCommand", '|');
                        this.setState({ showResetAlert: false, open: false });
                        this.props.closeOperationsWindow();
                        }
                    }
                    onCancel={(event) => { this.setState({ showResetAlert: false }) }}
                    title={"Reset Machine?"}
                />

                <Tooltip
                    disableHoverListener={!disabled}
                    disableFocusListener={true}
                    disableTouchListener={true}
                    title={tooltip}
                >
                    <span>
                            <ManualModeSVG disabled={disabled} onClick={this.props.toggleShuttle} />
                    </span>
                </Tooltip>

                <Dialog
                    open={this.props.openShuttle}
                    aria-labelledby="form-dialog-title"
                    PaperProps={{ style: {height: '100%', maxWidth: '1600px', backgroundColor: '#f6f6f6'}}}
                    maxWidth="xl"
                    fullWidth
                >
                    <DialogTitle style={{padding: '0px'}}>
                        <Grid container>
                            <Grid item xs={1} />
                            <Grid item xs={10}>
                            </Grid>
                            <Grid item xs={1}>
                                <Button onClick={this.props.toggleShuttle}>X</Button>
                            </Grid>
                        </Grid>
                    </DialogTitle>
                    <DialogContent className={'no-scroll'} style={{overflow: 'auto'}}>
                        <Operations closeDialog={this.closeDialog} firmware={this.props.firmware} open={this.state.open} milling={this.state.milling} setMilling={this.setMilling} feedRate={this.props.feedRate} updateFeedRate={this.props.updateFeedRate} />
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        );
    }
}

Shuttle.propTypes = {
    milling: PropTypes.bool.isRequired,
    status: PropTypes.number.isRequired,
    firmware: PropTypes.object
};

export default withStyles(styles)(Shuttle);
