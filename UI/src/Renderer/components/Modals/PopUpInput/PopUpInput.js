import React from "react";
import { Button, Dialog, DialogContent, DialogActions, Typography, Input } from "@material-ui/core";
import { IpcRenderer, ipcRenderer } from "electron";

const PopUpInput = (props) => {

    function extractFilename(filepath) {
        // Extract filename from Windows or macOS filepath
        const separator = process.platform === 'win32' ? '\\' : '/';
        const parts = filepath.split(separator);
        const filenameWithExtension = parts[parts.length - 1];
      
        return filenameWithExtension;
    }
      

    const onBrowse = () => {
        ipcRenderer.removeAllListeners('FileUploadSuccessful');
        ipcRenderer.once('FileUploadSuccessful', function (event, filePath) {
            let subDirectory = props.fileType == "image" ? "Image" : "Code";
            let filename = extractFilename(filePath);
            let returnValue = {target: {value: subDirectory + "/" + filename}};
            props.setValue(returnValue);
        });

        // on click send API call to open file picker
        ipcRenderer.send('File::UploadFileToCRFile', props.fileType);

        // on successful write, set path in picture editor input

    }

    const getActions = () => {
        return (
        <React.Fragment>
            <DialogActions>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={onBrowse}
                >
                    BROWSE
                </Button>
                <Button
                    variant="contained"
                    // className={classes.select}
                    color="secondary"
                    onClick={props.onCancel}
                >
                    RESET
                </Button>
                <Button
                    variant="contained"
                    // className={classes.select}
                    color="secondary"
                    onClick={props.onOk}
                >
                    OK
                </Button>
            </DialogActions>
        </React.Fragment>
        );
    }

    const getOptionalInput = () => {
        if (props.optionalInput) {
            return (
                <Input fullWidth value={props.optionalValue} onChange={props.setOptionalValue} multiline={true} rows={6} />
            );
        }
    }

    return (
        <React.Fragment>
            <Dialog
                open={props.open}
                aria-labelledby="form-dialog-title"
                maxWidth="xs"
                fullWidth
            >
                <DialogContent>
                    <Typography color="textPrimary" variant="subtitle1" style={{textTransform: 'uppercase'}}>
                        {props.title}
                    </Typography>
                    <Input fullWidth value={props.value} onChange={props.setValue} multiline={false} rows={1} />
                    {getOptionalInput()}
                </DialogContent>
                <DialogActions>
                    {getActions()}
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );

}

export default PopUpInput;
