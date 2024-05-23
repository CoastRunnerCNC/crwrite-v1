import { Button } from '@material-ui/core'
import React from 'react'
import { Save } from '@material-ui/icons'
import { ipcRenderer } from 'electron'

const ExportOutput = (props) => {

  const handleClick = () => {
    let output = "";
    props.machineOutput.map((line, index) => {
      output += line.TYPE + " : " + line.VALUE + "\n";
    });
    ipcRenderer.send("File::ExportMachineOutput", output);
  }

  return (
    <Button onClick={handleClick} variant='contained' color='secondary'><Save /></Button>
  );
}

export default ExportOutput