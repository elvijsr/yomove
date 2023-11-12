import { useState, useEffect } from "react";
import { Typography, Button, Box } from "@mui/joy";
import { debounce } from "lodash";
import { submitResult } from "../services/challenges";

function SquatChallenge({ lobby, finishChallenge }) {
  const [deviceMotion, setDeviceMotion] = useState({
    acceleration: {
      x: 0,
      y: 0,
      z: 0,
    },
  });
  const [isRecording, setIsRecording] = useState(false);
  const [squatCount, setSquatCount] = useState(0);
  const [squatFinalCount, setSquatFinalCount] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [recordingTimer, setRecordingTimer] = useState(null);
  const [lastSquatTime, setLastSquatTime] = useState(null);
  const [previousAcceleration, setPreviousAcceleration] = useState(0);
  const [challengeStarted, setChallengeStarted] = useState(false);

  const squatThreshold = -1;
  const squatMinTime = 2000;
  const movingAverageAlpha = 0.8;

  const startRecording = () => {
    if (countdown === null || countdown === 0) {
      setChallengeStarted(true);
      setSquatCount(0);
      setCountdown(3);
    }
  };

  const debouncedHandleSquat = debounce(() => {
    let squatTime = new Date().getTime();
    if (
      isRecording &&
      (lastSquatTime === null || squatTime - lastSquatTime > squatMinTime)
    ) {
      setSquatCount((prevSquatCount) => prevSquatCount + 1);
      setLastSquatTime(squatTime);
    }
  }, 800);

  const calculateScore = async () => {
    console.log("calculating score started");
    let score;
    if (squatFinalCount <= 0) {
      score = 0;
    }
    if (squatFinalCount >= 10) {
      score = 100;
    }
    console.log("squat amount:" + squatFinalCount);
    const finalScore = score * 10;
    console.log(finalScore);
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

  const handleMotionEvent = (event) => {
    const motionData = {
      acceleration: {
        x: event.acceleration.x?.toFixed(2),
        y: event.acceleration.y?.toFixed(2),
        z: event.acceleration.z?.toFixed(2),
      },
    };

    // Apply a moving average filter to the y-axis acceleration data
    const filteredAcceleration =
      movingAverageAlpha * previousAcceleration +
      (1 - movingAverageAlpha) * motionData.acceleration.y;
    setPreviousAcceleration(filteredAcceleration);

    // Use a peak detection algorithm to identify the highest points in the y-axis acceleration data
    if (
      filteredAcceleration < squatThreshold &&
      isRecording &&
      filteredAcceleration < previousAcceleration
    ) {
      debouncedHandleSquat();
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
      console.log("finished");
      calculateScore();
    }
  }, [recordingTimer]);

  useEffect(() => {
    if (isRecording) {
      window.addEventListener("devicemotion", handleMotionEvent, true);

      return () => {
        window.removeEventListener("devicemotion", handleMotionEvent);
      };
    } else {
      setSquatFinalCount(squatCount);
    }
  }, [isRecording]);

  return (
    /*
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

      {!isRecording && squatFinalCount !== null && (
        <>
          <Typography level="h2">
            Squat Final Count: {squatFinalCount}
          </Typography>
          <Typography level="h2">
            Challenge score: {calculateScore(squatFinalCount)}
          </Typography>
        </>
      )}
    </>*/

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
                  <Typography level="h1">Count: {squatCount}</Typography>
                  <Typography level="h1">FCount: {squatFinalCount}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default SquatChallenge;
