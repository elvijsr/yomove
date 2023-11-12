import { useState, useEffect, useRef } from "react";
import { Typography, Button, ButtonGroup, Box } from "@mui/joy";
import { submitResult } from "../services/challenges";

function JumpChallenge({ lobby, finishChallenge }) {
  const [deviceMotion, setDeviceMotion] = useState({
    acceleration: {
      x: 0,
      y: 0,
      z: 0,
    },
  });
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [peakRMS, setPeakRMS] = useState(0);
  const isRecordingRef = useRef(isRecording);
  const [challengeStarted, setChallengeStarted] = useState(false);

  const alpha = 0.8;

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const startRecording = () => {
    if (countdown === null || countdown === 0) {
      setChallengeStarted(true);
      setPeakRMS(0);
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

    if (isRecordingRef.current) {
      setPeakRMS((prevPeakRMS) => Math.max(prevPeakRMS, rms));
    }

    return rms.toFixed(2);
  };

  const calculateScore = async (peakRMS) => {
    const minRMS = 0;
    const maxRMS = 30;
    const minScore = 0;
    const maxScore = 100;

    if (peakRMS > maxRMS) {
      return maxScore;
    }

    let finalScore;

    finalScore = Math.round(
      ((peakRMS - minRMS) / (maxRMS - minRMS)) * (maxScore - minScore) +
        minScore
    );
    try {
      console.log("trying");
      console.log("challenge_id:" + lobby.current_challenge.id);
      console.log("lobby_id:" + lobby.id);
      await submitResult({
        lobby_id: lobby.id,
        challenge_id: lobby.current_challenge.id,
        score: finalScore,
      });
      console.log("score submitted");
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
      setRecordingTimer(5);
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
      calculateScore(peakRMS);
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

  const challenge = {
    name: "Jump Challenge",
    description: "Jump as high as you can within a 5 second window.",
    img: "",
  };

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
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-center",
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
                    width: "100%",
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
    /*
    <Box sx={{ backgroundColor: "red" }}>
      <ButtonGroup
        variant="contained"
        aria-label="outlined primary button group"
        sx={{
          mt: 5,
          position: "fixed",
          bottom: 0,
          width: "100%",
        }}
      >
        <Button
          onClick={startRecording}
          disabled={isRecording || countdown > 0}
          sx={{ width: "100%", fontSize: 50, color: "white" }}
        >
          START
        </Button>
      </ButtonGroup>

      {countdown !== null && countdown !== 0 && (
        <Typography level="h2">Countdown: {countdown}</Typography>
      )}
      {recordingTimer !== null && recordingTimer !== 0 && (
        <Typography level="h2">Recording: {recordingTimer}</Typography>
      )}

      {!isRecording && peakRMS > 0 && (
        <Typography level="h2">Score: {calculateScore(peakRMS)}</Typography>
      )}
    </Box>
    */
  );
}

export default JumpChallenge;
