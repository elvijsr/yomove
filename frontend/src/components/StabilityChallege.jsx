import { useState, useEffect } from "react";
import { Typography, Button, ButtonGroup, Box, Card } from "@mui/joy";
import { submitResult } from "../services/challenges";

function StabilityChallenge({ lobby, finishChallenge }) {
  const [deviceMotion, setDeviceMotion] = useState({
    acceleration: {
      x: 0,
      y: 0,
      z: 0,
    },
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordedData, setRecordedData] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [challengeStarted, setChallengeStarted] = useState(false);

  const alpha = 0.8;
  const rmsMax = 2;
  const rmsMin = 0;

  const startRecording = () => {
    if (countdown === null || countdown === 0) {
      setChallengeStarted(true);
      setRecordedData([]);
      setCountdown(3);
    }
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

  const calculateStabilityScore = async () => {
    if (recordedData.length === 0) {
      return 0;
    }
    const scores = recordedData.map((data) => data.score);
    const average =
      scores.reduce((sum, value) => sum + value, 0) / scores.length;

    const finalScore = Math.round(average);

    try {
      await submitResult({
        lobby_id: lobby.id,
        challenge_id: lobby.current_challenge.id,
        score: finalScore,
      });
      finishChallenge();
    } catch (error) {
      console.error("Error submitting score:", error);
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
      calculateStabilityScore();
    }
  }, [recordingTimer]);

  useEffect(() => {
    const handleMotionEvent = (event) => {
      const motionData = {
        acceleration: {
          x: event.acceleration.x?.toFixed(2),
          y: event.acceleration.y?.toFixed(2),
          z: event.acceleration.z?.toFixed(2),
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "auto", // Set the height of the container to full viewport height
            gap: 1,
            m: 1,
            flexGrow: 1,
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            {!challengeStarted && (
              <Button
                onClick={startRecording}
                disabled={isRecording || countdown > 0}
                sx={{
                  width: "100%",
                  height: "100%",
                  fontSize: 50,
                  color: "white",
                }}
              >
                RECORD
              </Button>
            )}
            <Box
              sx={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {countdown !== null && countdown !== 0 && (
                <Box
                  sx={{
                    display: "flex",
                    flex: 1,
                    flexDirection: "column",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography level="h1">GET READY</Typography>
                  <Typography level="h1">{countdown}</Typography>
                </Box>
              )}
              {recordingTimer !== null && recordingTimer !== 0 && (
                <Box
                  sx={{
                    m: 1,
                    display: "flex",
                    flex: 1,
                    flexDirection: "column",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography level="h1">Recording</Typography>
                  <Typography level="h1">{recordingTimer}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default StabilityChallenge;
