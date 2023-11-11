import { useState, useEffect } from "react";
import { Typography, Button, ButtonGroup } from "@mui/joy";

function StabilityChallenge() {
  const [deviceMotion, setDeviceMotion] = useState({
    acceleration: {
      x: 0,
      y: 0,
      z: 0,
    },
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordedData, setRecordedData] = useState([]);
  const alpha = 0.8;
  const rmsMax = 2;
  const rmsMin = 0;

  const startRecording = () => {
    setIsRecording((prevIsRecording) => !prevIsRecording);
    setRecordedData([]);
  };

  const stopRecording = () => {
    setIsRecording((prevIsRecording) => !prevIsRecording);
  };

  const applyLowPathFilter = (prev, curr) => {
    return (alpha * prev + (1 - alpha) * curr).toFixed(2);
  };

  const calculateX = (previousAcceleration, acceleration) => {
    return applyLowPathFilter(previousAcceleration.x, acceleration.x);
  };

  const calculateY = (previousAcceleration, acceleration) => {
    return applyLowPathFilter(previousAcceleration.y, acceleration.y);
  };

  const calculateZ = (previousAcceleration, acceleration) => {
    return applyLowPathFilter(previousAcceleration.z, acceleration.z);
  };

  const calculateRMS = (previousAcceleration, acceleration) => {
    const x = calculateX(previousAcceleration, acceleration);
    const y = calculateY(previousAcceleration, acceleration);
    const z = calculateZ(previousAcceleration, acceleration);

    const sumOfSquares = x ** 2 + y ** 2 + z ** 2;
    const rms = Math.sqrt(sumOfSquares / 3);
    return rms.toFixed(2);
  };

  const calculateScore = (rms) => {
    if (rms > rmsMax) {
      return 0;
    }

    return ((rmsMax - rms) * 100) / (rmsMax - rmsMin);
  };

  const calculateStabilityScore = () => {
    if (recordedData.length === 0) {
      return 0;
    }
    const scores = recordedData.map((data) => data.score);
    const average =
      scores.reduce((sum, value) => sum + value, 0) / scores.length;

    return Math.round(average);
  };

  useEffect(() => {
    const handleMotionEvent = (event) => {
      const motionData = {
        acceleration: {
          x: event.acceleration.x?.toFixed(2),
          y: event.acceleration.y?.toFixed(2),
          z: event.acceleration.z?.toFixed(2),
        },
        rotationRate: {
          alpha: event.rotationRate.alpha?.toFixed(2),
          beta: event.rotationRate.beta?.toFixed(2),
          gamma: event.rotationRate.gamma?.toFixed(2),
        },
        timestamp: event.timeStamp,
      };

      setDeviceMotion((prevDeviceMotion) => {
        const rms = calculateRMS(
          prevDeviceMotion.acceleration,
          motionData.acceleration
        );
        return {
          acceleration: {
            x: calculateX(
              prevDeviceMotion.acceleration,
              motionData.acceleration
            ),
            y: calculateY(
              prevDeviceMotion.acceleration,
              motionData.acceleration
            ),
            z: calculateZ(
              prevDeviceMotion.acceleration,
              motionData.acceleration
            ),
            rms: rms,
            score: calculateScore(rms),
          },
          rotationRate: motionData.rotationRate,
          timestamp: motionData.timestamp,
        };
      });
    };

    window.addEventListener("devicemotion", handleMotionEvent, true);

    return () => {
      window.removeEventListener("devicemotion", handleMotionEvent);
    };
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      setRecordedData((prevData) => [
        ...prevData,
        {
          x: deviceMotion.acceleration.x,
          y: deviceMotion.acceleration.y,
          z: deviceMotion.acceleration.z,
          rms: deviceMotion.acceleration.rms,
          score: deviceMotion.acceleration.score,
          timestamp: deviceMotion.timestamp,
        },
      ]);
    }
  }, [isRecording, deviceMotion]);

  return (
    <>
        <ButtonGroup
          variant="contained"
          aria-label="outlined primary button group"
          sx={{ mt: 5 }}
        >
          <Button onClick={startRecording} disabled={isRecording}>
            Start Recording
          </Button>
          <Button onClick={stopRecording} disabled={!isRecording}>
            Stop Recording
          </Button>
        </ButtonGroup>

        {!isRecording && recordedData.length > 0 && (
          <Typography level="h2">
            Score: {calculateStabilityScore()}
          </Typography>
        )}
    </>
  );
}

export default StabilityChallenge;
