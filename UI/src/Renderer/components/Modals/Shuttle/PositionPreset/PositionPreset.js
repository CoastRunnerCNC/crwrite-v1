import { Button } from '@material-ui/core'
import { ipcRenderer } from 'electron'
import React, { useEffect } from 'react'
import { useState } from 'react'
import Alert from '../../Alert'

/*
button loads and fills state
onClick send command
*/

const PositionPreset = (props) => {
  const [position, setPosition] = useState("");
  const [showPopup, setShowPopup] = useState(false);


  const setCurrentPosition = () => {
    ipcRenderer.once('Settings::ResponseSetPositionButton', (event) => {
      getPosition();
    });
    ipcRenderer.send("Settings::SetPositionButton", parseInt(props.children));
  }

  const handleRightClick = (event) => {
    // throw set position popup
    if (!props.home) {
      setShowPopup(true);
    }
  };

  const handleClick = () => {

    if (props.editParentState) {
      props.editParentState();
    }

    if (props.home) {
      ipcRenderer.send("CNC::ExecuteCommand", '$H');
    } else {
      if (position) {
        ipcRenderer.send("CNC::ExecuteCommand", `$HZ`);
        ipcRenderer.send("CNC::ExecuteCommand", `G53 X${position.x[props.units]} Y${position.y[props.units]}`);
        ipcRenderer.send("CNC::ExecuteCommand", `G53 Z${position.z[props.units]}`);
      } else {
        // throw set position popup
        setShowPopup(true);
      }
    }
  }

  const getPosition = () => {
    ipcRenderer.once('Settings::ResponseGetPositionButton', (event, position) => {
      try {
        let parsedPosition = JSON.parse(position);
        setPosition(parsedPosition);
      } catch (e) {
        console.log("Failed to parse position for button " + props.children);
        console.log(position);
      }
    });
    ipcRenderer.send("Settings::GetPositionButton", parseInt(props.children));
  }

  useEffect(() => {
    if (!props.home) {
      getPosition();
    }
  }, []);

  let alertTitle = `Save current machine position as Position ${props.children}?`;
  return (
    <>
      <Alert 
        open={showPopup}
        title="Set Current Position?"
        message={alertTitle}
        yesNo={true}
        onOk={() => {setCurrentPosition(); setShowPopup(false)}}
        onCancel={() => {setShowPopup(false)}}
      />
      <Button variant='contained' color='secondary' onClick={handleClick} onContextMenu={handleRightClick}>{props.children}</Button>
    </>
  )
}

export default PositionPreset
