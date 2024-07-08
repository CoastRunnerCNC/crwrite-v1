import * as React from 'react';
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles';
import {ipcRenderer} from 'electron';
import Routes from './Routes';
import {Color, Titlebar} from 'custom-electron-titlebar';
import BottomToolbar from './components/BottomToolbar';
import Alert from './components/Modals/Alert';
import app from 'app';
import './styles/global.scss';
import os from 'os';
import BackgroundPhoto from './components/BackgroundPhoto/BackgroundPhoto'
import packageJSON from '../../package.json'


const theme = createMuiTheme({
    palette: {
        secondary: {
            main: '#FFFFFF',
        },
        primary: {
            main: app.colors.textPrimary,
            dark: '#333333',
        },
        text: {
            primary: app.colors.textPrimary,
            secondary: app.colors.textSecondary,
            disabled: "#444444"
        },
        background: {
            paper: app.modal.backgroundColor
        },
    },
    typography: {
        useNextVariants: true,
        // Use the system font instead of the default Roboto font.
        fontFamily: app.fonts.join(','),
        root: {
            fontWeight: app.font.weight
        },
        body1: {
            fontSize: 14,
            fontWeight: app.font.weight
        },
        h6: {
            fontWeight: app.font.weight
        }
    },
    props: {
        MuiButtonBase: {
            disableRipple: true
        },
        MuiDialog: {
            TransitionProps: {
                enter: false,
                exit: false,
                timeout: 0
            }
        }
    },
    overrides: {
        MuiButton: {
            contained: {
                border: '1px solid black',
                borderRadius: '0px',
                boxShadow: "1px 1px 0px 0px #000000",
                backgroundColor: "#f6f6f6"
            }
        },
        MuiRadio: {
            root: {
              color: 'black',
            },
            colorSecondary: {
              '&$checked': {
                color: 'black',
              },
            },
          },
          MuiCheckbox: {
            root: {
              color: 'black',
            },
            colorSecondary: {
              '&$checked': {
                color: 'black',
              },
            },
          },
        MuiFormControl: {
            root: {
                backgroundColor: app.colors.form,
                border: 'none',
            },
            marginDense: true,
            border: 'none'
        },
        MuiInput: {
            root: {
                border: '1px solid #000000',
                borderRadius: '0px',
                backgroundColor: '#f6f6f6'
            }
        },
        // MuiFormControl: {
        //     root: {
        //       border: '1px solid #000', // Setting a black outline
        //  // Some inner padding so content doesn't touch the border
        //     },
        // },
        // MuiInput: {
        //     underline: {
        //       '&:before': {
        //         borderBottom: 'none'
        //       },
        //       '&:after': {
        //         borderBottom: 'none'
        //       }
        //     }
        //   },
        // MuiInputBase: {
        //     root: {
        //       '& .MuiInputBase-input': {
        //         color: 'black', // change the text color here
        //       },
        //       '& .MuiInput-underline:before': {
        //         borderBottom: 'none',
        //       },
        //       '& .MuiInput-underline:after': {
        //         borderBottom: 'none',
        //       },
        //       '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
        //         borderBottom: 'none',
        //       },
        //     },
        // },
        MuiDialog: {
            paper: {
                border: app.modal.border,
                color: app.modal.color,
                backgroundColor: '#f6f6f6'
            }
        },
        MuiFab: {
            root: {
                fontFamily: app.fonts.join(','),
                fontWeight: app.font.weight
            }
        },
        // MuiOutlinedInput: {
        //     input: {
        //         padding: '5px 10px'
        //     }
        // },
        MuiTabs: {
            indicator: {
              backgroundColor: app.tabs.indicatorColor,
            }
          },    
          MuiTextField: {
            root: {
                    '& .MuiInputBase-input': {
                color: app.colors.textPrimary,
                },
              '& .MuiInput-underline:before': {
                borderBottom: 'none',
              },
              '& .MuiInput-underline:after': {
                borderBottom: 'none',
              },
              '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
                borderBottom: 'none',
              },
            },
          },
        MuiCssBaseline: {
            '@global': {
                '*::webkit-scrollbar': {
                    width: '10px',
                    backgroundColor: app.colors.scrollbar
                },
                '@font-weight': app.font.weight
            },
        },
    }
});

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            cncMillStatus: 0,
            millingInProgress: false,
            firmware: null,
            alertMessage: '',
            walkthrough_showing: false,
            showOperationsWindow: false,
            firmwareAvailable: false,
            feedRate: 100,
            openShuttle: false,
            shuttleSelectedTab: 0,
            openImagePanel: true
        };

        this.updateStatus = this.updateStatus.bind(this);
        this.closeOperationsWindow = this.closeOperationsWindow.bind(this);
        this.setOperationsWindowOpen = this.setOperationsWindowOpen.bind(this);
        this.checkFirmwareUpdates = this.checkFirmwareUpdates.bind(this);
        this.updateFeedrate = this.updateFeedrate.bind(this);
        this.updateSetting = this.updateSetting.bind(this);
        this.toggleShuttle = this.toggleShuttle.bind(this);
        this.toggleImagePanel = this.toggleImagePanel.bind(this);

        if (!props.data) {
            document.title = app.titlebar.title;

            let titlebar = new Titlebar({
                backgroundColor: Color.fromHex('#000000'),
                icon: app.titlebar.icon,
                menu: null,
                titleHorizontalAlignment: "left"
            });
        }
    }

    toggleImagePanel() {
        this.setState({openImagePanel: !this.state.openImagePanel});
    }

    updateFeedrate(newFeedRate) {
        ipcRenderer.send('Settings::SetFeedRate', newFeedRate);
        this.setState({feedRate: newFeedRate});
    }

    getFirmwareYMD(versionStr) {
        let ymd;
        let regex = /(?<=YMD:).........?.?.?.?/i;
        let result = versionStr.match(regex);

        if (result) {
            ymd = result[0];
            return ymd;
        }

        return "";
    }

    isNewFirmwareAvailable(availableUpdates) {
        // if (this.state.firmware && (availableUpdates.length != 0)) {
        //     let firmwareYMD = this.getFirmwareYMD(availableUpdates[0].version);
        //     let newFirmwareAvailable = ((availableUpdates.length != 0) && (firmwareYMD != this.state.firmware.ymd));
        //     return newFirmwareAvailable;
        // }
        return false;
    }

    updateFirmwareAvailable(availableUpdates) {
        let newFirmwareAvailable = this.isNewFirmwareAvailable(availableUpdates);
        if (newFirmwareAvailable) {
            this.setState({ firmwareAvailable: true });
            return;
        } else {
            this.setState({ firmwareAvailable: false });
        }
        return;
    }

    checkFirmwareUpdates(iteration) {
        ipcRenderer.removeAllListeners("Firmware::UpdatesAvailable"); 
        ipcRenderer.on("Firmware::UpdatesAvailable", (event, availableUpdates) => {
            this.updateFirmwareAvailable(   availableUpdates);
            if (!this.state.firmwareAvailable && (iteration < 10)) {
                setTimeout(() => this.checkFirmwareUpdates(iteration + 1), 2000);
            }
        });
        ipcRenderer.send("Firmware::GetAvailableFirmwareUpdates");

    }

	componentDidMount() {
        ipcRenderer.send('Logs::LogString', 'CRWrite Version: ' + packageJSON.version);
        ipcRenderer.once('Walkthrough::ResponseShouldDisplay', (event) => {
            this.setState({
                walkthrough_showing: true
            });
            window.ShowDashboardWalkthrough(app.machine_name, () => {
                this.setState({
                    walkthrough_showing: false
                });
            });
            ipcRenderer.send("Walkthrough::SetShowWalkthrough", "Dashboard", false);
        });
		ipcRenderer.send("Walkthrough::ShouldDisplay", "Dashboard");

        ipcRenderer.removeAllListeners("CR_UpdateCRStatus");
        ipcRenderer.on("CR_UpdateCRStatus", this.updateStatus);
        ipcRenderer.once('Settings::GetSettingsResponse', (event, settings) => {
            this.setState({settings: settings});
        });
        ipcRenderer.send("Settings::GetSettings");
        this.checkFirmwareUpdates(0);
	}

    componentDidUpdate(prevProps, prevState) {
        if (this.state.firmware != prevState.firmware) {
            if (this.state.firmware) {
                ipcRenderer.send('Logs::LogString', 'GRBL: ' + this.state.firmware.grbl);
                ipcRenderer.send('Logs::LogString', 'FW: ' + this.state.firmware.ymd);
                ipcRenderer.send('Logs::LogString', 'CR: ' + this.state.firmware.cr);
                ipcRenderer.send('Logs::LogString', 'PCB: ' + this.state.firmware.pcb);
            }
        }
    }

    updateSetting(updatedSetting, updatedSettingValue) {
        let settings = this.state.settings;
        settings[updatedSetting] = updatedSettingValue;
        this.setState({settings: settings});
        console.log("updateSetting: " + JSON.stringify(this.state.settings));
    }  

    closeOperationsWindow() {
        this.setState({
            showOperationsWindow: false
        });
    }

    setOperationsWindowOpen() {
        this.setState({
            showOperationsWindow: true
        });
    }

    toggleShuttle() {
        this.setState({
            openShuttle: !this.state.openShuttle
        });
    }

   /* componentDidUpdate() {
        console.log("componentDidUpdate fired!");
        this.checkFirmwareUpdates(9);
    }*/

	componentWillUnmount() {
        ipcRenderer.removeAllListeners("CR_UpdateCRStatus");
    }

    updateStatus(event, newConnectionStatus, newMillingStatus) {
        if (newConnectionStatus != this.state.cncMillStatus || newMillingStatus != this.state.millingInProgress) {
            if (newConnectionStatus == 2 || newConnectionStatus == "refresh") {
                if (newConnectionStatus == "refresh") {
                    newConnectionStatus = this.state.cncMillStatus;
                    newMillingStatus = this.state.millingInProgress;
                }
                newMillingStatus = this.state.millingInProgress;
                ipcRenderer.once('Firmware::ResponseGetFirmwareVersion', (event, firmware) => {
                    this.setState({
                        cncMillStatus: newConnectionStatus,
                        firmware: firmware,
                        millingInProgress: newMillingStatus,
                        alertMessage: ''
                    });
                });
                ipcRenderer.send("Firmware::GetFirmwareVersion");

            } else {
                let alertMessage = this.state.alertMessage;
                if (newConnectionStatus === -1 && this.state.cncMillStatus != newConnectionStatus) {
                    alertMessage = "CRWrite found a Coast Runner, but cannot connect to it. Please verify the emergency stop button is not engaged"
                        + " (twist the red knob clockwise until it pops out). Please also verify another program isn't already connected to CR (unplug and reconnect CR's USB cable). Contact support if this problem persists.";
                }

                this.setState({
                    cncMillStatus: newConnectionStatus,
                    firmware: null,
                    millingInProgress: false,
                    alertMessage: alertMessage
                });
            }
        }
        this.checkFirmwareUpdates(9);
    }

    render() {
        if (os.platform != 'darwin') {
            document.getElementsByClassName('window-appicon')[0].style.width = "20px";
            document.getElementsByClassName('window-appicon')[0].style.height = "20px";
            document.getElementsByClassName('window-appicon')[0].style.backgroundSize = "20px 20px";
            document.getElementsByClassName('window-appicon')[0].style.marginLeft = "5px";
        } else {
            document.getElementsByClassName('window-title')[0].style.marginLeft = "55px";
        }
        console.log(this.state.open)
        return (
            <React.Fragment>
                <MuiThemeProvider theme={theme}>
                    {console.time("Alert")}
                    <Alert
                        open={this.state.alertMessage.length > 0 && this.state.walkthrough_showing === false}
                        message={this.state.alertMessage}
                        yesNo={false}
                        onOk={(event) => { this.setState({ alertMessage: '' }) }}
                        onCancel={(event) => {}}
                    />
                    {console.timeEnd("Alert")}
                    {console.time("Routes")}
                    <Routes 
                        status={this.state.cncMillStatus} 
                        showOperationsWindow={this.state.showOperationsWindow}
                        feedRate={this.state.feedRate}
                        updateFeedRate={this.updateFeedrate} 
                        settings={this.state.settings}
                        milling={this.state.millingInProgress}
                        openShuttle={this.state.openShuttle}
                        shuttleSelectedTab={this.state.shuttleSelectedTab}
                        toggleShuttle={this.toggleShuttle}
                        closeOperationsWindow={this.closeOperationsWindow}
                        setOperationsWindowOpen={this.setOperationsWindowOpen}
                        firmware={this.state.firmware}   
                        openImagePanel={this.state.openImagePanel}
                    />
                    {console.timeEnd("Routes")}
                    {console.time("BottomToolbar")}
                    <BottomToolbar
                        openShuttle={this.state.openShuttle}
                        shuttleSelectedTab={this.state.shuttleSelectedTab}
                        toggleShuttle={this.toggleShuttle}
                        status={this.state.cncMillStatus}
                        milling={this.state.millingInProgress}
                        firmware={this.state.firmware}
                        firmwareAvailable={this.state.firmwareAvailable}
                        set_walkthrough_showing={(showing) => { this.setState({ walkthrough_showing: showing }); }}
                        closeOperationsWindow={this.closeOperationsWindow}
                        setOperationsWindowOpen={this.setOperationsWindowOpen}
                        checkFirmwareUpdates={this.checkFirmwareUpdates}
                        updateMachineStatus={this.updateStatus}
                        feedRate={this.state.feedRate}
                        updateFeedRate={this.updateFeedrate}
                        updateSetting={this.updateSetting}
                        toggleImagePanel={this.toggleImagePanel}
                    />
                    {console.timeEnd("BottomToolbar")}
                </MuiThemeProvider>
            </React.Fragment>
        );
    }
}
