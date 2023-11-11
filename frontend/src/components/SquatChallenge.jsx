import React, { useState, useEffect } from "react";
import { Typography, Button, ButtonGroup } from "@mui/joy";

function SquatChallenge() {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [squatCount, setSquatCount] = useState(0);
  const [squatTimestamp, setSquatTimestamp] = useState(null);

  const squatThreshold = -10;
  const timeInterval = 1000;

  const startRecording = () => {
    if (countdown === null || countdown === 0) {
      setSquatCount(0);
      setCountdown(3);
    }
  };

  const detectSquat = (yAcceleration) => {
    const timestamp = performance.now();

    setSquatTimestamp((prevTimestamp) => {
      if (prevTimestamp === null || timestamp - prevTimestamp > timeInterval) {
        return timestamp;
      }
      return prevTimestamp;
    });

    const hasDetectedSquatRecently = timestamp - squatTimestamp < timeInterval;

    const isSquat =
      yAcceleration < squatThreshold &&
      !hasDetectedSquatRecently;

    return isSquat;
  };

  const handleMotionEvent = (event) => {
    const yAcceleration = event.acceleration.y;

    const isSquat = detectSquat(yAcceleration);

    if (isRecording && isSquat) {
      setSquatCount((prevCount) => prevCount + 1);
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
    if (isRecording) {
        window.addEventListener("devicemotion", handleMotionEvent, true);
    }

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
      <Typography level="h2">Squat timestamp: {squatTimestamp}</Typography>
    </>
  );
}

export default SquatChallenge;
