import React, { useState, useEffect } from "react";
import { Typography, Button, ButtonGroup } from "@mui/joy";

function SquatChallenge() {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [squatCount, setSquatCount] = useState(0);

  const startRecording = () => {
    if (countdown === null || countdown === 0) {
      setSquatCount(0);
      setCountdown(3);
    }
  };

  const detectSquat = (acceleration) => {
    // Placeholder: Adjust these values based on your sensor data characteristics
    const squatThreshold = -1.5; // Example threshold for downward motion in y-axis
    const squatDuration = 500; // Example duration for a squat in milliseconds

    const isSquat =
      acceleration.y < squatThreshold &&
      acceleration.timestamp - lastSquatTimestamp > squatDuration;

    return isSquat;
  };

  let lastSquatTimestamp = 0;

  const handleMotionEvent = (event) => {
    const isSquat = detectSquat(event.acceleration);

    if (isRecording && isSquat) {
      setSquatCount((prevCount) => prevCount + 1);
      lastSquatTimestamp = event.acceleration.timestamp;
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setIsRecording(true);
      setRecordingTimer(10);
    }
  }, [countdown]);

  useEffect(() => {
    if (recordingTimer !== null && recordingTimer !== 0 && isRecording) {
      const timer = setTimeout(() => {
        setRecordingTimer((prevRecordingTimer) => prevRecordingTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (recordingTimer === 0) {
      setIsRecording(false);
    }
  }, [recordingTimer, isRecording]);

  useEffect(() => {
    window.addEventListener("devicemotion", handleMotionEvent, true);

    return () => {
      window.removeEventListener("devicemotion", handleMotionEvent);
    };
  }, [isRecording]);

  return (
    <>
      <ButtonGroup
        variant="contained"
        aria-label="outlined primary button group"
        sx={{ mt: 5 }}
      >
        <Button
          onClick={startRecording}
          disabled={isRecording || countdown > 0}
        >
          Start Recording
        </Button>
      </ButtonGroup>

      {countdown !== null && countdown !== 0 && (
        <Typography level="h2">Countdown: {countdown}</Typography>
      )}
      {recordingTimer !== null && recordingTimer !== 0 && (
        <Typography level="h2">Recording: {recordingTimer}</Typography>
      )}

      {!isRecording && (
        <Typography level="h2">Squat Count: {squatCount}</Typography>
      )}
    </>
  );
}

export default SquatChallenge;