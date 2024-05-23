import React, { useState } from 'react'
import Raw from '../../../ImageRaw/Raw';
import GCodeDisplay from './GCodeDisplay/GCodeDisplay';

const DisplayPanel = (props) => {

    if (props.tab === 0) {
        return (
            <Raw 
                millingInProgress={true} 
                milling={props.milling} 
                externalHistory 
                history={props.history}
                setHistory={props.setHistory} 
                elapsedSeconds={props.elapsedSeconds}
                incrementElapsedSeconds={props.incrementElapsedSeconds}
                height={330}
                // showTimer
            />
        );
    } else if (props.tab === 1) {
        return (
            <GCodeDisplay rawGCodes={props.rawGCodes} />
        );
    }
}

export default DisplayPanel