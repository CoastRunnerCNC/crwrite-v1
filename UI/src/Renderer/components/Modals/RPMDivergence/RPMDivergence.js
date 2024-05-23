import React from 'react';
import path from "path";
import {IconButton} from '@material-ui/core';
import {ipcRenderer} from 'electron';

class RPMDivergence extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            indicatorMeaningful: false,
            lastKValue: null,
            M105Active: false,
            lastSpinDirection: "",
            lastRPM: -1,
            lastSpindeChange: -1,
            lastCommand: ""
        }
        this.SpindleChanged = this.SpindleChanged.bind(this);
        this.FindSpindleSpeedChange = this.FindSpindleSpeedChange.bind(this);
        this.FindSpindleDirChange = this.FindSpindleDirChange.bind(this);
        this.UpdateSpindleSpeedRecord = this.UpdateSpindleSpeedRecord.bind(this);
        this.UpdateSpindleDirectionRecord = this.UpdateSpindleDirectionRecord.bind(this);
        this.UpdateLastCommand = this.UpdateLastCommand.bind(this);
        this.UpdateCommandRecord = this.UpdateCommandRecord.bind(this);
        this.ProcessReadWrites = this.ProcessReadWrites.bind(this);
        this.PickIndicatorColor = this.PickIndicatorColor.bind(this);
        this.CheckMeaningfulness = this.CheckMeaningfulness.bind(this);
    }

    GetIndicatorHeight() {
        if (this.props.indicatorHeight) {
            return this.props.indicatorHeight;
        } else {
            return '80px';
        }
    }

    UpdateM105StatusRecord(element) {
        if (element.VALUE == "0k" || element.VALUE == "1k" || element.VALUE == "2k" || element.VALUE == "3k") {
            this.setState({
                M105Active: true,
                lastKValue: element.VALUE
            });
            return;
        } else if (element.VALUE == "ok") {
            this.setState({
                M105Active: false
            });
        }
    }

    SpindleChanged() {
        let spindleChanged, spindleSpeedChanged, spindleDirChanged = null;
        spindleSpeedChanged = this.FindSpindleSpeedChange(this.state.lastCommand);
        spindleDirChanged = this.FindSpindleDirChange(this.state.lastCommand);

        if (spindleSpeedChanged || spindleDirChanged) {
            spindleChanged = true;
        } else {
            spindleChanged = false;
        }
        return spindleChanged;
    }

    FindSpindleSpeedChange(element) {
        let regex = /s[0-9]+/i;
        let spindleSpeedChange = element.VALUE.match(regex);

        return spindleSpeedChange;
    }

    FindSpindleDirChange(element) {
        let regex = /m[345]/i;
        let spindleDirChange = element.VALUE.match(regex);

        return spindleDirChange;
    }

    UpdateSpindleSpeedRecord(element) {
        let currentSpindleSpeedChange = this.FindSpindleSpeedChange(element);

        if (currentSpindleSpeedChange) {
            let newRPM = Number(currentSpindleSpeedChange[0].slice(1));
            this.setState({
                lastRPM: newRPM,
                lastSpindeChange: Date.now()
            });
        }
    }

    UpdateSpindleDirectionRecord(element) {
        let currentSpindleDirChange = this.FindSpindleDirChange(element);
        if (currentSpindleDirChange) {
            this.setState({
                lastSpinDirection: currentSpindleDirChange[0].toUpperCase(),
                lastSpindeChange: Date.now()
            });
        }
    }

    UpdateLastCommand(element) {
        if (element.TYPE == "WRITE") {
            this.setState({
                lastCommand: element
            });
        }
        return;
    }

    UpdateCommandRecord(element) {
        this.UpdateLastCommand(element);
        this.UpdateM105StatusRecord(element);
        this.UpdateSpindleDirectionRecord(element);
        this.UpdateSpindleSpeedRecord(element);
    }

    CheckMeaningfulness() {

        if (!this.state.M105Active || this.state.lastSpinDirection == "M5" || this.state.lastRPM < 1500 || this.SpindleChanged()) {
            this.setState({
                indicatorMeaningful: false
            });
            return;
        }

        if ((this.state.lastSpindeChange + 5000) <= Date.now()) {
            this.setState({
                indicatorMeaningful: true
            });
        }
    }

    PickIndicatorColor() {
        if (this.state.indicatorMeaningful) {
            switch (this.state.lastKValue) {
                case "0k":
                    return "green";
                case "1k":
                    return "yellow";
                case "2k":
                    return "orange";
                case "3k":
                    return "red";
            }
        }
        return "grey";
    }

    ProcessReadWrites(event, newLines) {
        if (newLines.length > 0) {
            newLines.forEach(element => {
                this.UpdateCommandRecord(element);
                this.CheckMeaningfulness();
            });
        }
    }

    render() {
        ipcRenderer.removeListener("Jobs::ReadWrites", this.ProcessReadWrites);
        ipcRenderer.on("Jobs::ReadWrites", this.ProcessReadWrites);
        if (this.state.M105Active) {
            return (
                <React.Fragment>
                    <IconButton>
                        <img
                            style={{ height: this.GetIndicatorHeight() }}
                            src={path.join(__dirname, './static/img/RPM' + this.PickIndicatorColor() + '.png')}
                        />
                    </IconButton>
                </React.Fragment>
            );
        } else {
            return "";
        }
    }
}

export default RPMDivergence;