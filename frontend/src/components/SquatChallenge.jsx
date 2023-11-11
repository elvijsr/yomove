import { useState, useEffect } from "react";
import { Typography, Button } from "@mui/joy";

function SquatChallenge() {
  const [deviceMotion, setDeviceMotion] = useState({
    acceleration: {
      x: 0,
      y: 0,
      z: 0,
    },
  });
  const [isRecording, setIsRecording] = useState(false);
  const [squatCount, setSquatCount] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [lastSquatTime, setLastSquatTime] = useState(null);
  const [previousAcceleration, setPreviousAcceleration] = useState(0);

  const squatThreshold = -10; // This value may need to be adjusted based on the specific behavior of the device's accelerometer
  const squatMinTime = 2000; // Minimum time between squats in milliseconds
  const movingAverageAlpha = 0.8; // Adjust this value to change the smoothing effect

  const startRecording = () => {
    if (countdown === null || countdown === 0) {
      setSquatCount(0);
      setCountdown(3);
    }
  };

  const handleMotionEvent = (event) => {
    const motionData = {
      acceleration: {
        x: event.acceleration.x?.toFixed(2),
        y: event.acceleration.y?.toFixed(2),
        z: event.acceleration.z?.toFixed(2),
      },
    };

    const currentTime = new Date().getTime();

    const filteredAcceleration =
      movingAverageAlpha * previousAcceleration +
      (1 - movingAverageAlpha) * motionData.acceleration.y;
    setPreviousAcceleration(filteredAcceleration);

    if (
      filteredAcceleration < squatThreshold &&
      isRecording &&
      filteredAcceleration < previousAcceleration
    ) {
      if (
        lastSquatTime === null ||
        currentTime - lastSquatTime > squatMinTime
      ) {
        setSquatCount((prevSquatCount) => prevSquatCount + 1);
        setLastSquatTime(currentTime);
      }
    }

    setDeviceMotion(motionData);
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
  }, [recordingTimer]);

  useEffect(() => {
    window.addEventListener("devicemotion", handleMotionEvent, true);

    return () => {
      window.removeEventListener("devicemotion", handleMotionEvent);
    };
  }, [isRecording]);

  return (
    <>
      <Button onClick={startRecording} disabled={isRecording || countdown > 0}>
        Start Recording
      </Button>

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
