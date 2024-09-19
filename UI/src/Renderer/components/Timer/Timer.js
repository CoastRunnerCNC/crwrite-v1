import React, { useState, useEffect } from 'react';

function Timer({ estimatedDuration, elapsedSeconds}) {

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <>
      {formatTime(elapsedSeconds)} {/* / formatTime(estimatedDuration) (est) */}
    </>
  );
}

export default Timer;
