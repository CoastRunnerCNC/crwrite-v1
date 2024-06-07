import React from 'react';
import PropTypes from 'prop-types';
import {ipcRenderer, shell} from 'electron';
import withStyles from '@material-ui/core/styles/withStyles';
import StepList from '../../components/StepList';
import RPMDivergence from '../../components/Modals/RPMDivergence/RPMDivergence';
import Feedrate from '../../components/Feedrate';
import StartMilling from '../../components/Modals/StartMilling';
import Alert from '../../components/Modals/Alert';
import PopUp from '../../components/Modals/PopUp';
import path from "path";
import {Button, Grid, Box, IconButton, LinearProgress, Typography, CircularProgress} from '@material-ui/core';
import ArrowBackIosRoundedIcon from '@material-ui/icons/ArrowBackIosRounded';
import {Redirect} from 'react-router-dom';
import app from 'app';
import ImageRaw from "../../components/ImageRaw/ImageRaw";
import logger from 'electron-log';
import ReactMarkdown from 'react-markdown'
import {version} from '../../../../package.json';
import JobSelection from '../../components/Modals/JobSelection';
import TransformToInput from '../../util/TransformToInput';
import PopUpInput from '../../components/Modals/PopUpInput/PopUpInput';
import Throbber from '../../components/Modals/Throbber/Throbber';
import ItemPanel from '../../components/ItemPanel/ItemPanel';
import CoastRunnerLogo from '../../components/CoastRunnerLogo/CoastRunnerLogo';



const styles = theme => ({
    millingStyle: {
        backgroundColor: "#F1F2F2",
        backgroundSize: 'cover',
        overflow: 'hidden',
        width: '100%',
        height: 'calc(100% - 39px)',
        position: 'fixed',
        left: 0,
        top: 0,
        paddingTop: 60,
        // z: -1,
        // flex: 1,
        // justifyContent: 'center',
        // alignItems: 'center',
        // display: 'flex',
        // verticalAlign: 'middle',

        // backgroundColor: "#F1F2F2",
        // overflow: 'hidden',
        // height: '100%',//height: 'calc(100% - 93px)',
        // position: 'fixed',

        // flex: 1,
        // justifyContent: 'left',
        // display: 'flex',
        // verticalAlign: 'middle',
        // paddingLeft: '10px'
    },
    // middle: {
    //     height: 'calc(100% - 110px)',
    //     marginTop: '60px'
    // },
    instructions: {
        backgroundColor: '#FFFFFF',
        border: '1.5px solid black',
        borderRadius: '4px',
        padding: '16px'
        
    },
    nextPrevButtonRoot: {
        background: '#3EC6CB',
        border: '1px solid black',
        color: 'white',
    },
    nextPrevButtonDisable: {
        background: '#b6eaeb',
        color: 'white !important',
    }
});

class Milling extends React.Component {
    constructor() {
        super();
        this.state = {
            filePath: ipcRenderer.sendSync("File::FetchFilePath"),
            fileName: "",
            jobName: ipcRenderer.sendSync("Jobs::FetchJobName"), 
            steps: ipcRenderer.sendSync("Jobs::GetSteps"),
            selectedStepIndex: 0,
            selectedStep: ipcRenderer.sendSync("Jobs::GetStep", 0),
			previousMillingStep: -1,
            editMode: false,
            editTitleValue: "",
            editPromptValue: "",
            editMarkdownValue: "",
            editJobTextValue: "",
            editGCode: "",
            showImage: true,
            showStartMilling: false,
            goBack: false,
            showNext: false,
            milling: false,
            millingProgress: -1,
            showAlert: false,
			promptClearWCS: ipcRenderer.sendSync("CNC::HasNonzeroWCS")
                && ipcRenderer.sendSync("CNC::AllowWcsClearPrompt"),   // Possibly prompt to clear WCS
            wcsValueCheckFailedMessage: ipcRenderer.sendSync("CNC::WcsValueCheck"),    // Empty string means no issue (no check needed or check succeeded)
            firmwareMinVersionMet: ipcRenderer.sendSync("Firmware::FirmwareMeetsMinimumVersion"),
            crwriteMinVersionMet: ipcRenderer.sendSync("Firmware::CRWriteMeetsMinimumVersion", version),
            alertTitle: "",
            alertMessage: "",
            status_loop: false,
            paused: false,
            showJobSelection: false,
            availableJobs: [],
            showEndOfJobPopUp: false,
            showSaveEditsPopup: false,
            showPopupImageInput: false,
            showPopupGCodeInput: false,
            writeInProgress: false
        };

        this.onClickChangeJob = this.onClickChangeJob.bind(this);
        this.onCloseJobSelection = this.onCloseJobSelection.bind(this);
        this.progress = this.progress.bind(this);
        this.getFileNameFromPath = this.getFileNameFromPath.bind(this);
        this.interceptClickEvent = this.interceptClickEvent.bind(this);
        this.handlePopupCancel = this.handlePopupCancel.bind(this);
        this.onClickToggleEdit = this.onClickToggleEdit.bind(this);
        this.setEditTitleValue = this.setEditTitleValue.bind(this);
        this.saveEdits = this.saveEdits.bind(this);
        this.getJobEditText = this.getJobEditText.bind(this);
        this.onEditJobTextChange = this.onEditJobTextChange.bind(this);
        this.setEditImage = this.setEditImage.bind(this);
        this.showImagePopUpInput = this.showImagePopUpInput.bind(this);
        this.showGCodePopUpInput = this.showGCodePopUpInput.bind(this);
        this.setEditGCode = this.setEditGCode.bind(this);
        this.setEditGCodePath = this.setEditGCodePath.bind(this);
        this.getEditButton = this.getEditButton.bind(this);
        this.currentEditsPresent = this.currentEditsPresent.bind(this);
        this.editPopupNoHandler = this.editPopupNoHandler.bind(this);
        this.handleDeleteStep = this.handleDeleteStep.bind(this);
        this.moveStep = this.moveStep.bind(this);
        this.handleWriteChangesYes = this.handleWriteChangesYes.bind(this);
        this.handleWriteChangesNo = this.handleWriteChangesNo.bind(this);
        this.closeFailedImageLoad = this.closeFailedImageLoad.bind(this);
        this.handleSetWriteStatus = this.handleSetWriteStatus.bind(this);
        this.refreshJobs = this.refreshJobs.bind(this);
        this.getAddStepButton = this.getAddStepButton.bind(this);
        this.handlePopupOkay = this.handlePopupOkay.bind(this);
        this.parseGoTo = this.parseGoTo.bind(this);
        ipcRenderer.removeAllListeners("CRFileDoubleClick");
        ipcRenderer.on("CRFileDoubleClick", (event, path) => {
            ipcRenderer.send('File::DoubleClickSetFilePath', path);
            let jobs = ipcRenderer.sendSync('Jobs::GetJobsFromPath', path);
            this.setState({ availableJobs: jobs, showJobSelection: true });
        });
    }

    parseGoTo(rawValue) {
        /*
            we need to check to see if the value is valid. We can do this in two parts:
            first check for a positive or negative sign. Next, check to see if the remaining string resolves to an int.
            If there is a sign, parse as relative step movement. If there is no sign, parse as absolute step.
            If the value does not resolve to an int, throw an error popup.
        */
        let sign = null;
        let valueStr = null;
        let value;

        // check for positive or negative sign
        if (rawValue.startsWith('+')) {
            sign = '+';
            valueStr = rawValue.substring(1);
        } else if (rawValue.startsWith('-')) {
            sign = '-';
            valueStr = rawValue.substring(1);
        } else {
            valueStr = rawValue;
        }
        // check if remaining value resolves to an int
        value = parseInt(valueStr, 10);
        // if value doesn't resolve, throw an error
        if (isNaN(value)) {
            this.setState({
                alertMessage: "Relative step movement",
                alertTitle: "Relative step movement syntax error in manifest. Please check your manifest and confirm that the syntax is correct (+4, -5)."
            })
            return -1;
        }
        // calculate absolute index
        if (sign === "-") {
            value = this.state.selectedStepIndex - value;
        } else if (sign === "+") {
            value = this.state.selectedStepIndex + value;
        }
        // return absolute index
        return value;
    }

    onCloseJobSelection(event, jobChanged) {
        if (jobChanged) {
            let newPath = ipcRenderer.sendSync("File::FetchFilePath");
            this.getFileNameFromPath(newPath);
            this.setState({
                showJobSelection: false,
                filePath: newPath,
                jobName: ipcRenderer.sendSync("Jobs::FetchJobName"), 
                steps: ipcRenderer.sendSync("Jobs::GetSteps"),
                selectedStepIndex: 0,
                selectedStep: ipcRenderer.sendSync("Jobs::GetStep", 0),
                previousMillingStep: -1,
                showImage: true,
                showStartMilling: false,
                goBack: false,
                showNext: false,
                milling: false,
                millingProgress: -1,
                showAlert: false,
                promptClearWCS: ipcRenderer.sendSync("CNC::HasNonzeroWCS")
                    && ipcRenderer.sendSync("CNC::AllowWcsClearPrompt"),   // Possibly prompt to clear WCS
                wcsValueCheckFailedMessage: ipcRenderer.sendSync("CNC::WcsValueCheck"),    // Empty string means no issue (no check needed or check succeeded)
                firmwareMinVersionMet: ipcRenderer.sendSync("Firmware::FirmwareMeetsMinimumVersion"),
                crwriteMinVersionMet: ipcRenderer.sendSync("Firmware::CRWriteMeetsMinimumVersion", version),
                alertTitle: "",
                alertMessage: "",
                status_loop: false,
                paused: false,
                submanifestUsed: undefined
            });   
        } else {
            this.setState({
                showJobSelection: false
            });
        }
    }

    saveEdits() {
        let newStepText;
        if (this.state.selectedStep.Markdown) {
            newStepText = this.state.editMarkdownValue;
        } else {
            newStepText = this.state.editJobTextValue;
        }
        // this.setState({writeInProgress: true});
        // Start listener for write success
        this.setState({writeInProgress: true, showSaveEditsPopup: false});
        let showPremillingStepPopup = this.state.preEditModeStepIndex === this.state.selectedStepIndex ? false : true;
        // Listeners for successful write out
        ipcRenderer.removeAllListeners("Jobs::WriteEditsSuccessful")
        ipcRenderer.once("Jobs::WriteEditsSuccessful", () => {
            this.setState({
                editMode: false,
                selectedStep: ipcRenderer.sendSync("Jobs::GetStep", this.state.selectedStepIndex),
                steps: ipcRenderer.sendSync("Jobs::GetSteps"),
                showPremillingStepPopup: showPremillingStepPopup
            });
        });


        // Send request to start right out
        ipcRenderer.send("Jobs::SetStepValues", {
                title: this.state.editTitleValue,  
                markdown: newStepText,
                prompt: "Please download the latest version of CRWrite at https://coastrunner.net/downloads/",
                set_image: this.state.editImage,
                set_gcode: this.state.editGCode,
                set_gcode_path: this.state.editGCodePath
            }, 
            this.state.selectedStepIndex);
    }

    handleAddStep() {
        this.setState({writeInProgress: true});
        let showPremillingStepPopup = this.state.preEditModeStepIndex === this.state.selectedStepIndex ? false : true;
        ipcRenderer.removeAllListeners("Jobs::WriteEditsSuccessful")
        ipcRenderer.once("Jobs::WriteEditsSuccessful", () => {
            this.setState({
                selectedStep: ipcRenderer.sendSync("Jobs::GetStep", this.state.selectedStepIndex),
                steps: ipcRenderer.sendSync("Jobs::GetSteps"),
                showPremillingStepPopup: showPremillingStepPopup
            });
        });

        ipcRenderer.send("Jobs::AddNewOperation", this.state.selectedStepIndex + 1);
    }

    handleDeleteStep(stepIndex) {
        this.setState({writeInProgress: true});
        let newStepIndex = this.state.selectedStepIndex;
        let showPremillingStepPopup = this.state.preEditModeStepIndex === this.state.selectedStepIndex ? false : true;

        if (stepIndex < newStepIndex) {
            newStepIndex--;
        }

        ipcRenderer.removeAllListeners("Jobs::WriteEditsSuccessful");
        ipcRenderer.once("Jobs::WriteEditsSuccessful", () => {
            this.setState({
                selectedStepIndex: newStepIndex,
                selectedStep: ipcRenderer.sendSync("Jobs::GetStep", newStepIndex),
                steps: ipcRenderer.sendSync("Jobs::GetSteps"),
                showPremillingStepPopup: showPremillingStepPopup
            });
        });
        ipcRenderer.send("Jobs::DeleteOperation", stepIndex);
    }

    moveStep(prevStepIndex, newStepIndex) {
        this.setState({writeInProgress: true});
        let showPremillingStepPopup = this.state.preEditModeStepIndex === this.state.selectedStepIndex ? false : true;
        ipcRenderer.removeAllListeners("Jobs::WriteEditsSuccessful");
        ipcRenderer.once("Jobs::WriteEditsSuccessful", () => {
            this.setState({
                selectedStep: ipcRenderer.sendSync("Jobs::GetStep", this.state.selectedStepIndex),
                steps: ipcRenderer.sendSync("Jobs::GetSteps"),
                showPremillingStepPopup: showPremillingStepPopup
            });
        });
        ipcRenderer.send("Jobs::MoveOperation", prevStepIndex, newStepIndex);
    }

    showGCodePopUpInput() {
        this.setState({ showPopUpGCodeInput: true });
    }

    setEditGCodePath(event) {
        this.setState({editGCodePath: event.target.value});
    }

    setEditGCode(event) {
        this.setState({editGCode: event.target.value});
    }

    showImagePopUpInput() {
        this.setState({showPopupImageInput: true});
    }

    setEditImage(event) {
        this.setState({editImage: event.target.value});
    }

    setEditTitleValue(event) {
        this.setState({editTitleValue: event.target.value});
    }

    onClickToggleEdit() {
        if (this.state.editMode) {
            this.setState({showSaveEditsPopup: true});
        } else {
            this.setState({editMode: true, preEditModeStepIndex: this.state.selectedStepIndex});
        }
    }

    getEditButton() {
        if (this.state.submanifestUsed == undefined) {
            let submanifestUsed = ipcRenderer.sendSync("Jobs::SubmanifestUsed");
            this.setState({submanifestUsed: submanifestUsed});
        }
        
        if (this.props.settings.enableEditButton && (this.state.millingProgress == -1)) {
            return (
                <Button onClick={this.onClickToggleEdit}>{this.getEditButtonText()}</Button>
            );
        }
    }

    getEditButtonText() {
        if (this.state.editMode) {
            return "Save Edits";
        } else {
            return "Edit";
        }
    }

    onClickChangeJob() {
        ipcRenderer.once('File::ResponseGetExistingJobs', (event, jobs) => {
            this.setState({
                availableJobs: jobs,
                showJobSelection: true
            });
        });
        ipcRenderer.send("File::GetExistingJobs")
    }

    showJobSelection() {
        return this.state.showJobSelection;
    }

    pickNewFile() {
        ipcRenderer.removeAllListeners("ShowJobSelection");
        ipcRenderer.on("ShowJobSelection", (event, jobs) => {
            this.onClickChangeJob();
        });

        ipcRenderer.removeAllListeners("InvalidCRFile");
        ipcRenderer.on("InvalidCRFile", (event, filename, error) => {
            this.setState({alertMessage: "File error: " + error, showAlert: true});
        });

        ipcRenderer.send('File::OpenFileDialog');
    }

    getJobEditText() {
        if (this.state.selectedStep.Markdown.length > 0) {
            return this.state.selectedStep.Markdown;
        } else {
            return this.state.selectedStep.Prompt;
        }
    }

    onEditJobTextChange(event) {
        if (this.state.selectedStep.Markdown.length > 0) {
            this.setState({editJobTextValue: event.target.value, editMarkdownValue: event.target.value});
        } else {
            this.setState({editJobTextValue: event.target.value, editPromptValue: event.target.value});
        }
    }

    currentEditsPresent() {

        // check for gcode edits
        if (this.state.editGCode != this.state.selectedStep.RawGCode) {
            return true;
        }
        if (this.state.editGCodePath != this.state.selectedStep.GCodePath) {
            return true;
        }
        // check for image edits
        if (this.state.editImage != this.state.selectedStep.ImagePath) {
            return true;
        }
        // check for prompt edits
        if (this.state.editPromptValue != this.state.selectedStep.Prompt) {
            return true;
        }
        // check for markdown edits
        if (this.state.editMarkdownValue != this.state.selectedStep.Markdown) {
            return true;
        }
        if (this.state.editTitleValue != this.state.selectedStep.Title) {
            return true;
        }
        
        return false;
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.selectedStep != prevState.selectedStep) {
            this.setState({
                editTitleValue: this.state.selectedStep.Title, 
                editJobTextValue: this.getJobEditText(),
                editPromptValue: this.state.selectedStep.Prompt,
                editMarkdownValue: this.state.selectedStep.Markdown,
                editImage: this.state.selectedStep.ImagePath,
                editGCode: this.state.selectedStep.RawGCode,
                editGCodePath: this.state.selectedStep.GCodePath
            });
        }
    }

	componentDidMount() {
		ipcRenderer.send('CR_SetCurrentPage', "Milling");
        ipcRenderer.once('Walkthrough::ResponseShouldDisplay', (event) => {
			window.ShowMillingWalkthrough(app.machine_name);
			ipcRenderer.send("Walkthrough::SetShowWalkthrough", "Milling", false);
        });
		ipcRenderer.send("Walkthrough::ShouldDisplay", "Milling")

        this.setState({
            editTitleValue: this.state.selectedStep.Title, 
            editJobTextValue: this.getJobEditText(),
            editPromptValue: this.state.selectedStep.Prompt,
            editMarkdownValue: this.state.selectedStep.Markdown,
            editImage: this.state.selectedStep.ImagePath,
            editGCode: this.state.selectedStep.RawGCode,
            editGCodePath: this.state.selectedStep.GCodePath
        });

        this.getFileNameFromPath(this.state.filePath);
        document.addEventListener('click', this.interceptClickEvent);
        this.status_loop = true;
        setTimeout(this.progress, 100);
	}

    progress() {
        const showNext = this.state.showNext;
        if (showNext === true) {
            let selectedStep = this.state.selectedStep;
            selectedStep.GCode = null;
            this.setState({
                showNext: false,
                millingProgress: -1,
                selectedStep: selectedStep
            });
            this.showNextStep(this);
        } else if (!this.state.showAlert) {
            ipcRenderer.once('Jobs::GetProgressResponse', (event, updatedProgress) => {
                if (updatedProgress.error != null) {
                    logger.debug("Updating millingProgress from " + this.state.millingProgress + " to -1");
                    const nextStep = updatedProgress.error.retry_step ? this.state.selectedStepIndex : 0;
                    this.setState({
                        millingProgress: -1,
                        showAlert: true,
                        alertTitle: updatedProgress.error.title,
                        alertMessage: updatedProgress.error.description,
                        selectedStepIndex: nextStep,
                        selectedStep: ipcRenderer.sendSync("Jobs::GetStep", nextStep),
                        previousMillingStep: nextStep,
                        milling: false
                    });
                } else if (updatedProgress.milling === true) {
                    logger.debug("Updating millingProgress from " + this.state.millingProgress + " to " + updatedProgress.progress.percentage);
                    this.setState({ millingProgress: updatedProgress.progress.percentage });
                } else if (this.state.milling === true && this.state.millingStartTime.getTime() + 2000 < (new Date()).getTime()) {
                    logger.debug("Updating millingProgress from " + this.state.millingProgress + " to 100");
                    this.setState({
                        millingProgress: 100,
                        showNext: true,
                        milling: false
                    });
                }

                if (this.status_loop === true) {
                    setTimeout(this.progress, 100);
                }
            });

            ipcRenderer.send("Jobs::GetProgress", this.state.selectedStepIndex);
            return;
        }

        if (this.status_loop === true) {
            setTimeout(this.progress, 100);
        }
    };

    showNextStep(milling) {
        let nextStepIndex = (milling.state.selectedStepIndex + 1);
        let parsedStepIndex;

        if (milling.state.selectedStep.GoToStep) {
            parsedStepIndex = milling.parseGoTo(milling.state.selectedStep.GoToStep);
            if (parsedStepIndex != -1 && !isNaN(parsedStepIndex)) {
                nextStepIndex = parsedStepIndex;
            }        
        }
        if (nextStepIndex < milling.state.steps.length) {
            milling.setState({
                showStartMilling: false,
                showNext: false,
                millingProgress: -1,
                selectedStepIndex: nextStepIndex,
                selectedStep: ipcRenderer.sendSync("Jobs::GetStep", nextStepIndex)
            });
        } else {
            milling.setState({
                showEndOfJobPopUp: true
            });
        }
    }

    interceptClickEvent(e) {
        var href;
        var target = e.target || e.srcElement;
        if (target.tagName === 'A') {
            href = target.getAttribute('href');
    
            //put your logic here...
            if (true) {
                shell.openExternal(href)
               //tell the browser not to respond to the link click
               e.preventDefault();
            }
        }
    }

    showPrevStep(milling) {
        const prevStepIndex = (milling.state.selectedStepIndex - 1);
        milling.setState({
            showStartMilling: false,
            millingProgress: -1,
            selectedStepIndex: prevStepIndex,
            selectedStep: ipcRenderer.sendSync("Jobs::GetStep", prevStepIndex)
        });
    }

    skipToNextMillingStep(milling) {
        if (!milling.currentEditsPresent()) {
            let stepIndex;
            const nextMillingIndex = milling.state.selectedStep.next_milling_step;
            const nextUnskippableIndex = milling.state.selectedStep.next_unskippable_step;

            if (!nextUnskippableIndex || (nextMillingIndex < nextUnskippableIndex)) {
                stepIndex = nextMillingIndex;
            } else {
                stepIndex = nextUnskippableIndex;
            }

            milling.setState({
                showStartMilling: false,
                millingProgress: -1,
                selectedStepIndex: stepIndex,
                selectedStep: ipcRenderer.sendSync("Jobs::GetStep", stepIndex)
            });
        } else {
            this.setState({showSaveEditsPopup: true});
        }
    }

    getFileNameFromPath(path) {
        if (path) {
            let slashType;
            if (path.indexOf('\\') === -1) {
                slashType = '/';
            }
            else {
                slashType = '\\';
            }

            let reversedPath = path.split("").reverse().join("");
            let cutOffIndex = reversedPath.indexOf(slashType);
            cutOffIndex = reversedPath.length - cutOffIndex;
            this.setState({fileName: path.substring(cutOffIndex)});
        } else {
            return
        }
    }

    handlePopupCancel() {
        let parsedPopupNoStep = this.parseGoTo(this.state.selectedStep.PopupNoStep);
        this.setState({ showPopupText: false });
        if (parsedPopupNoStep != -1) {
            this.setState({
                selectedStepIndex: parsedPopupNoStep,
                selectedStep: ipcRenderer.sendSync("Jobs::GetStep", parsedPopupNoStep)
            });
        } else {
            this.showNextStep(this);
        }
    }

    editPopupNoHandler() {
        this.setState({
            editMode: false, 
            showSaveEditsPopup: false,
            editJobTextValue: this.getJobEditText(),
            editTitleValue: this.state.selectedStep.Title,
            editPromptValue: this.state.selectedStep.Prompt,
            editMarkdownValue: this.state.selectedStep.Markdown,
            editImage: this.state.selectedStep.ImagePath,
            editGCode: this.state.selectedStep.RawGCode,
            editGCodePath: this.state.selectedStep.GCodePath
        });
    }

    handleWriteChangesYes() {
        this.saveEdits();
    }

    handleWriteChangesNo() {
        this.editPopupNoHandler();
    }

    handlePopupOkay() {
        let parsedPopupYesStep = this.parseGoTo(this.state.selectedStep.PopupYesStep);
        this.setState({ showPopupText: false });
        if (parsedPopupYesStep != -1) {
            this.setState({
                selectedStepIndex: parsedPopupYesStep,
                selectedStep: ipcRenderer.sendSync("Jobs::GetStep", parsedPopupYesStep)
            });
        } else {
            this.showNextStep(this);
        }
    }

    openImageFailAlert() {
        if (this.state.selectedStep.Error && this.state.selectedStep.Error.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    closeFailedImageLoad() {
        let selectedStep = this.state.selectedStep;
        selectedStep.Error = "";
        this.setState({selectedStep: selectedStep});
    }

    refreshJobs() {
        ipcRenderer.once("File::ResponseGetExistingJobs", (event, jobs) => {
            this.setState({availableJobs: jobs});
        });
        ipcRenderer.send("File::GetExistingJobs");
    }

    handleSetWriteStatus(status) {
        this.setState({writeInProgress: status});
    }

    getAddStepButton() {
        if (this.state.editMode) {
            return (
                <Button color="secondary" disabled={!this.state.editMode} className={this.props.classes.addStep} style={{ marginTop: '-4px' }} onClick={this.handleAddStep.bind(this)}>Add Step</Button>
            );
        }
    }

    printTestItems() {
        let item = <div style={{border: '2px solid blue', padding: '5px', width: '100%', marginBottom: '2px'}}>test</div>
        let items = [];

        for (let x = 0; x < 30; x++) {
            items.push(item);
        }

        return items;
    }

    render() {
        const { classes, status } = this.props;

        function getWarning(milling) {
            if (milling.state.selectedStep != null) {
                if (milling.state.selectedStep.GCode != null && milling.state.millingProgress === -1) {
                    return (
                        <Typography align='center' color='error'>
                            Warning!<br />
                            {app.milling.warning_text}
                        </Typography>
                    );
                }
            }

            return "";
        }

        function getMillingInProgressDisplay(milling) {
            if (milling.state.millingProgress >= 0) {
                return (
                    <React.Fragment>
                        <Typography variant='h4'>{milling.state.millingProgress}%</Typography>
                        <LinearProgress variant="determinate" style={{ height: '15px' }} value={milling.state.millingProgress} />
                    </React.Fragment>
                );
            }

            return "";
        }

        function getFeedrateSlider(milling) {
                return (
                    <div className={classes.slider}>
                        <Feedrate selectedStep={milling.state.selectedStepIndex} feedRate={milling.props.feedRate} updateFeedRate={milling.props.updateFeedRate} />
                    </div>
                );
        }

        function handlePrev(event) {
			this.showPrevStep(this);
        }

        function handleNext(event) {
            if (!this.currentEditsPresent()) {
                if ((this.state.selectedStep.GCode != null) && !this.state.editMode && status === 2) {
                    this.setState({
                        showStartMilling: true
                    });
                } else if (this.state.selectedStep.PopupText) {
                    this.setState({
                        showPopupText: true
                    });
                } else {
                    this.showNextStep(this);
                }
            } else {
                this.setState({showSaveEditsPopup: true});
            }
        }

		function handleSkip(event) {
			this.skipToNextMillingStep(this);
		}

        function handleStop(event) {
            ipcRenderer.send("Jobs::EmergencyStop");

            this.setState({
                millingProgress: -1,
                selectedStepIndex: 0,
                selectedStep: ipcRenderer.sendSync("Jobs::GetStep", 0),
				previousMillingStep: -1,
                showAlert: true,
                alertTitle: "Job aborted",
                alertMessage: "Job was aborted. Press 'OK' to start program from the very beginning.",
                milling: false,
                paused: false
            });
        }

        function handleFeedPause() {
            if (this.state.paused) {
                this.setState({ paused: false });
                ipcRenderer.send('CNC::ExecuteCommand', '~');
            }
            else {
                this.setState({ paused: true });
                ipcRenderer.send('CNC::ExecuteCommand', '!');
            }
        }

        function handleCloseStartMilling(start) {
            if (start) {
                this.setState({
                    millingProgress: 0,
                    showStartMilling: false,
                    previousMillingStep: this.state.selectedStepIndex,
                    milling: true,
                    millingStartTime: new Date()
                });
                ipcRenderer.send("Jobs::StartMilling", this.state.selectedStepIndex);
            } else {
                this.setState({ showStartMilling: false });
            }
        }

		function isNextAvailable(component) {
			return component.state.millingProgress === -1;
		}

		function isPrevAvailable(component) {
			if (component.state.millingProgress === -1) {
				if (component.state.selectedStepIndex === 0) {
					return false;
				}

				if ((component.state.selectedStepIndex - 1 > component.state.previousMillingStep) || component.state.editMode) {
					return true;
				}
			}

			return false;
		}

		function isSkipAvailable(component) {
			return (component.state.selectedStep.next_milling_step != null) && (!component.state.selectedStep.PopupText);
		}

        function getActionButton(component) {
            if (component.state.millingProgress === -1) {
                if (app.name === 'CRWrit') {
                    return (
                        <IconButton onClick={handleNext.bind(component)}>
                            <img
                                style={{ height: '90px' }}
                                onMouseOver={e => e.currentTarget.src = path.join(__dirname, './static/img/next_milling_button.png')}
                                onMouseOut={e => e.currentTarget.src = path.join(__dirname, './static/img/next_milling_button.png')}
                                src={path.join(__dirname, './static/img/next_milling_button.png')}
                            />
                        </IconButton>
                    );
                } else {
                    return (
                        <Button
                            onClick={handleNext.bind(component)}
                            color='secondary'
                            classes={{root: classes.nextPrevButtonRoot}}
                        >
                            Next
                        </Button>
                    );
                }
            } else {
                if (app.name === 'CRWrit') {
                    let imagePath = component.state.paused ? './static/img/play_button.png'  : './static/img/pause_button.png';
                    return (
                        <>
                            <IconButton onClick={handleFeedPause.bind(component)}>
                                <img
                                    style={{ height: '80px' }}
                                    src={path.join(__dirname, imagePath)}
                                />
                            </IconButton>
                            <IconButton onClick={handleStop.bind(component)}>
                                <img
                                    style={{ height: '80px' }}
                                    src={path.join(__dirname, './static/img/stop_circle.png')}
                                />
                            </IconButton>
                            <RPMDivergence />
                        </>
                    );
                } else {
                    return (
                        <>
                            <Button
                                onClick={handleFeedPause.bind(component)}
                                color='error'
                                classes={{root: classes.nextPrevButtonRoot}}
                            >
                                {component.state.paused ? "RUN" : "PAUSE"}
                            </Button>
                            <Button
                                style={{marginLeft: '4px'}}
                                onClick={handleStop.bind(component)}
                                color='error'
                                classes={{root: classes.nextPrevButtonRoot}}
                            >
                                Stop
                            </Button>
                        </>
                    );
                }
            }
        }

        function onClickBack(component) {

            document.removeEventListener('click', component.interceptClickEvent);

            if (component.state.selectedStepIndex === 0 && component.state.millingProgress === -1) {
                component.setState({
                    goBack: true
                });
            } else {
                component.setState({
                    showAlert: true,
                    alertTitle: "Warning",
                    alertMessage: "You will lose your progress if you navigate away. Are you sure you want to continue?",
                    goBack: true
                });
            }

        }

        function getJobText(selectedStep) {
            if (selectedStep.Markdown.length > 0) {
                return (
                    <ReactMarkdown>{selectedStep.Markdown}</ReactMarkdown>
                );
            }

            return selectedStep.Prompt;
        }

        if (this.state.goBack === true && this.state.showAlert === false) {
            if (this.state.millingProgress >= 0) {
                ipcRenderer.send("Jobs::EmergencyStop");
            }

            this.status_loop = false;
            ipcRenderer.send("CNC::ExecuteCommand", "|");
			ipcRenderer.send('CR_SetCurrentPage', "Dashboard");
            return (<Redirect to='/' />);
        }

        return (
			<React.Fragment>
                <Throbber start={this.state.writeInProgress} setWritingStatus={this.handleSetWriteStatus} />
                <Alert 
                    open={this.state.showPopupText}
                    message={this.state.selectedStep.PopupText}
                    yesNo={true}
                    onOk={ this.handlePopupOkay }
                    onCancel={ this.handlePopupCancel }
                    title={this.state.selectedStep.PopupTitle}
                />

                <Alert
                    open={this.state.showAlert && status === 2 && !this.props.showOperationsWindow}
                    message={this.state.alertMessage}
                    yesNo={this.state.goBack}
                    onOk={(event) => { this.setState({ showAlert: false }) }}
                    onCancel={(event) => { this.setState({ showAlert: false, goBack: false }) }}
                    title={this.state.alertTitle}
                />

                <Alert
                    open={status != 2 && this.props.settings.enableEditButton == false}
                    message="Machine was disconnected!"
                    onOk={(e) => { this.setState({ showAlert: false, goBack: true })}}
                    onCancel={(e) => { this.setState({ showAlert: false, goBack: true })}}
                />

                <Alert
                    open={ this.state.wcsValueCheckFailedMessage !== '' }
                    message={ this.state.wcsValueCheckFailedMessage }
                    yesNo={false}
                    onOk={(event) => { this.setState({ wcsValueCheckFailedMessage: '' }) } }
                    onCancel={(event) => { this.setState({ wcsValueCheckFailedMessage: '' }) } }
                    title="WCS Check Failed"
                />

                <Alert
                    open={ !this.state.firmwareMinVersionMet }
                    message="This project requires more recent firmware than your current version. Please update your firmware to run this file."
                    yesNo={false}
                    onOk={(event) => { onClickBack(this) } }
                    onCancel={(event) => { onClickBack(this) } }
                    title="Minimum Firmware Check Failed"
                />

                <Alert
                    open={ !this.state.crwriteMinVersionMet }
                    message="This project requires a more recent CRWrite than your current version. Unexpected behavior may occur."
                    yesNo={false}
                    onOk={(event) => { this.setState({ crwriteMinVersionMet: true }) } }
                    onCancel={(event) => { this.setState({ crwriteMinVersionMet: true }) } }
                    title="Minimum Software Version Check Failed"
                />

                <Alert
                    open={this.openImageFailAlert()}
                    message="CRWrite failed to load the image in this step. Please check the file path and try again."
                    yesNo={false}
                    onOk={this.closeFailedImageLoad}
                    onCancel={this.closeFailedImageLoad}
                    title="Failed to Load Image"
                />

                <Alert
                    open={
                        this.state.promptClearWCS
                        && this.state.selectedStepIndex === 0
                    }
                    message="Your machine has stored work coordinates from a previous operation. This may affect your current milling operation.
                    It is advised that you clear these values unless you specifically intend this behavior. Would you like CRWrite to reset the
                    work coordinates for you?"
                    yesNo={true}
                    onOk={(event) => {
                        ipcRenderer.send('CNC::ClearG54ThroughG58');
                        this.setState({ promptClearWCS: false })
                        }
                    }
                    onCancel={(event) => { this.setState({ promptClearWCS: false }) }}
                    title="Resetting WCS is Advised"
                />
                
                <Alert
                    open={this.state.showPremillingStepPopup}
                    title="Return to Last Executed Step?"
                    message="Would you like to return to the last executed step before edit mode was activated?"
                    yesNo={true}
                    onOk={() => {this.setState({showPremillingStepPopup: false, selectedStepIndex: this.state.preEditModeStepIndex, selectedStep: ipcRenderer.sendSync("Jobs::GetStep", this.state.preEditModeStepIndex)})}}
                    onCancel={() => {this.setState({showPremillingStepPopup: false})}}
                />

                <PopUp 
                    open={this.state.showEndOfJobPopUp}
                    title="Job Complete"
                    buttonInfo={
                        [{name: "EXIT", code: () => {this.setState({showNext: false, goBack: true})}}, 
                        {name: "LOAD NEW FILE", code: () => {this.pickNewFile(); this.setState({showEndOfJobPopUp: false})}}, 
                        {name: "RUN NEW JOB", code: () => {this.onClickChangeJob(); this.setState({showEndOfJobPopUp: false})}}
                        ]
                    }
                />

                <PopUp 
                    open={this.state.showSaveEditsPopup}
                    title="Write Changes To File?"
                    buttonInfo={
                        [{name: "YES", code: this.handleWriteChangesYes}, 
                        {name: "NO", code: this.handleWriteChangesNo}, 
                        {name: "CANCEL", code: () => {this.setState({showSaveEditsPopup: false})}}
                        ]
                    }
                />

                <PopUpInput
                    open={this.state.showPopupImageInput}
                    fileType="image"
                    optionalInput={false} 
                    value={this.state.editImage} 
                    setValue={this.setEditImage} 
                    title="Set Image Path"
                    onOk={() => {this.setState({showPopupImageInput: false})}}
                    onCancel={() => {this.setState({showPopupImageInput: false, editImage: this.state.selectedStep.ImagePath})}}
                />

                <PopUpInput
                    open={this.state.showPopUpGCodeInput}
                    fileType="gcode"
                    optionalInput={true}
                    value={this.state.editGCodePath}
                    optionalValue={this.state.editGCode}
                    setValue={this.setEditGCodePath} 
                    setOptionalValue={this.setEditGCode}
                    title="Edit GCode File"
                    onOk={() => {this.setState({showPopUpGCodeInput: false})}}
                    onCancel={() => {this.setState({showPopUpGCodeInput: false, editGCode: this.state.selectedStep.RawGCode})}}
                />

                <JobSelection open={this.showJobSelection()} onClose={this.onCloseJobSelection} jobs={this.state.availableJobs} status={status} refreshJobs={this.refreshJobs} enableEditButton={this.props.settings.enableEditButton} />

                <Grid container direction='column' className={classes.millingStyle}>
                    {/* <Grid item>
                        <h1>test</h1>
                    </Grid> */}
                        <Grid item>
                            <Grid container direction='column'>
                                <Grid item>
                                {/* , "Agency FB" */}
                                    <div style={{ color: '#3EC6CB', fontFamily: ["Public Sans", "sans-serif"], fontSize: '14px', maxHeight: '17px', overflow: 'hidden' }}>
                                        File: <span style={{ color: '#3EC6CB'}}>{this.state.fileName}</span>
                                    </div>
                                </Grid>
                                <Grid item>
                                {/* , "Agency FB" */}
                                    <div style={{ maxHeight: '33.6px', overflow: 'hidden', fontFamily: ["Public Sans", "sans-serif"], fontSize: '18px' }}>
                                        Job: <span style={{ color: 'black'}}>{this.state.jobName}</span>
                                    </div>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs>
                            <Grid container spacing={2}>
                                <Grid item xs={4} id="steps">
                                    {/* <Button color="secondary" style={{ color: 'black', fontFamily: ["Lato", "sans-serif"], fontSize: '14px', textTransform: 'none' }} onClick={(event) => { onClickBack(this) }}>
                                    <ArrowBackIosRoundedIcon style={{fontSize: 18}} /> Back
                                    </Button>
                                    <Button color="secondary" style={{ color: 'black', fontFamily: ["Lato", "sans-serif"], fontSize: '14px', textTransform: 'none'}} onClick={this.onClickChangeJob} >
                                        Change Job
                                    </Button> */}
                                    <ItemPanel title="Project Steps" small contentStyle={{padding: '8px'}}>
                                        <Grid container direction='column'>
                                            <Grid item style={{height: '66vh'}}>
                                                <StepList
                                                    steps={this.state.steps} 
                                                    selectedStep={this.state.selectedStepIndex} 
                                                    editMode={this.state.editMode}
                                                    submanifestUsed={this.state.submanifestUsed} 
                                                    deleteStep={this.handleDeleteStep} 
                                                    moveStep={this.moveStep}
                                                />
                                            </Grid>
                                            <Grid item>
                                                <Grid container justify='space-around' alignItems='center' spacing={1} style={{marginTop: '4px'}}>
                                                    <Grid item style={{height: '33px', width: '33px', padding: '0px'}}>
                                                        <IconButton onClick={(event) => { onClickBack(this) }} style={{padding: '0px'}}>
                                                            <img style={{height: '33px', width: '33px', padding: '0px'}} src='./static/img/back_button.png' />
                                                        </IconButton>
                                                    </Grid>
                                                    <Grid item>
                                                        <Button
                                                            classes={{root: classes.nextPrevButtonRoot, disabled: classes.nextPrevButtonDisable}}
                                                            color="secondary" 
                                                            disabled={!isPrevAvailable(this)} 
                                                            className={classes.prev} 
                                                            onClick={handlePrev.bind(this)}
                                                        >
                                                            &#60; Prev
                                                        </Button>
                                                    </Grid>
                                                    <Grid item>
                                                        <center>
                                                            <Typography className={classes.stepNumber}>Step {this.state.selectedStepIndex + 1}/{this.state.steps.length}</Typography>
                                                        </center>
                                                    </Grid>
                                                    <Grid item>
                                                        <Button
                                                            classes={{root: classes.nextPrevButtonRoot, disabled: classes.nextPrevButtonDisable}}
                                                            color="secondary" 
                                                            disabled={!isNextAvailable(this)} 
                                                            className={classes.next} 
                                                            onClick={handleNext.bind(this)}
                                                        >
                                                            Next &#62;
                                                        </Button>
                                                    </Grid>
                                                    <Grid item style={{height: '33px', width: '33px', padding: '0px'}}>
                                                        <img src='./static/img/next_milling_button.png' />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </ItemPanel>

                                    {/* {this.getAddStepButton()} */}
                                    {/* <Button color="secondary" disabled={!isSkipAvailable(this)} className={classes.next} style={{ marginTop: '-4px' }} onClick={handleSkip.bind(this)}>Skip Forward &#62;</Button> */}
                                </Grid>
                                <Grid item xs={3} id="middle_section">
                                    <Grid container direction='column' justify='space-between' spacing={0} style={{height: '100%'}}>
                                        <StartMilling open={this.state.showStartMilling} onClose={handleCloseStartMilling.bind(this)}/>
                                        <Grid item>
                                            <div className={classes.instructions}>
                                                <TransformToInput editMode={this.state.editMode} value={this.state.editTitleValue} setValue={this.setEditTitleValue}>
                                                    <Typography color="textPrimary" variant="subtitle1" style={{textTransform: 'uppercase'}}><b
                                                        className="show-line-breaks"> {this.state.selectedStep.Title} </b>
                                                    </Typography>
                                                </TransformToInput>
                                                {this.getEditButton()}
                                                <br/>
                                                <TransformToInput editMode={this.state.editMode} value={this.state.editJobTextValue} setValue={this.onEditJobTextChange} multiline={true} rows={10}>
                                                    <Typography className="show-line-breaks" color="textPrimary">{getJobText(this.state.selectedStep)}</Typography>
                                                </TransformToInput>
                                            </div>
                                        </Grid>
                                        <Grid item>
                                            <Grid container direction='column'>
                                                <Grid item>
                                                    <div className={classes.warning}>
                                                        {getMillingInProgressDisplay(this)}
                                                    </div>
                                                </Grid>
                                                <Grid item>
                                                    <Grid container justify='space-between' style={{marginTop: '8px'}}>
                                                        <Grid item>
                                                            {getWarning(this)}                                                            
                                                        </Grid>
                                                        <Grid item>
                                                            <div className={classes.actions}>
                                                                {getActionButton(this)}
                                                            </div>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        {/* <Grid id={'feedrate-slider'} item xs={12} style={{ height: '40px' }}>
                                            {getFeedrateSlider(this)}
                                        </Grid> */}
                                    </Grid>
                                </Grid>
                                <Grid item xs={5} id="image">
                                    <ItemPanel title="Machine Output" color="secondary" style={{height: '100%'}} small>
                                        <ImageRaw selectedStep={this.state.selectedStep} millingInProgress={this.state.millingProgress != -1} editMode={this.state.editMode} onEditImage={this.showImagePopUpInput} onEditGCode={this.showGCodePopUpInput} />
                                    </ItemPanel>
                                </Grid>
                            </Grid>
                        </Grid>
                </Grid>
			</React.Fragment>
        );
    }
}

Milling.propTypes = {
    classes: PropTypes.object.isRequired,
    status: PropTypes.number.isRequired
};

export default withStyles(styles)(Milling);
