import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { Typography, Button, ButtonGroup, Box, Grid } from "@mui/joy";

function App() {
  const [deviceMotion, setDeviceMotion] = useState({
    acceleration: {
      x: 0,
      y: 0,
      z: 0,
    }
  });
  const [deviceOrientation, setDeviceOrientation] = useState({});
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedData, setRecordedData] = useState([]);
  const { username } = useOutletContext();
  const alpha = 0.8;
  const rmsMax = 5;
  const rmsMin = 0;

  const askForPermission = async () => {
    let orientationPermissionGranted = false;
    let motionPermissionGranted = false;

    try {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        const permissionState =
          await DeviceOrientationEvent.requestPermission();
        orientationPermissionGranted = permissionState === "granted";
      } else {
        orientationPermissionGranted = true;
      }

      if (typeof DeviceMotionEvent.requestPermission === "function") {
        const permissionState = await DeviceMotionEvent.requestPermission();
        motionPermissionGranted = permissionState === "granted";
      } else {
        motionPermissionGranted = true;
      }

      if (orientationPermissionGranted && motionPermissionGranted) {
        setPermissionGranted(true);
      } else {
        console.error("Permission not granted for device sensors");
      }
    } catch (error) {
      console.error("Error requesting permissions:", error);
    }
  };

  const calculateX = (previousAcceleration, acceleration) => {
    return (alpha * previousAcceleration.x + (1 - alpha) * acceleration.x).toFixed(2)
  };

  const calculateY = (previousAcceleration, acceleration) => {
    return (alpha * previousAcceleration.y + (1 - alpha) * acceleration.y).toFixed(2)
  };

  const calculateZ = (previousAcceleration, acceleration) => {
    return (alpha * previousAcceleration.z + (1 - alpha) * acceleration.z).toFixed(2)
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

      let x;
      let y;
      let z;
      let rms;
      let score;

      setDeviceMotion((prevDeviceMotion) => {
        x = calculateX(prevDeviceMotion.acceleration, motionData.acceleration);
        y = calculateY(prevDeviceMotion.acceleration, motionData.acceleration);
        z = calculateZ(prevDeviceMotion.acceleration, motionData.acceleration);
        rms = calculateRMS(prevDeviceMotion.acceleration, motionData.acceleration);
        score = calculateScore(rms);
        return ({
        acceleration: {
          x: x,
          y: y,
          z: z,
          rms: rms,
          score: score
        },
        rotationRate: motionData.rotationRate,
        timestamp: motionData.timestamp,
      })});
    };

    const handleOrientationEvent = (event) => {
      setDeviceOrientation({
        alpha: parseFloat(event.alpha?.toFixed(2)),
        beta: parseFloat(event.beta?.toFixed(2)),
        gamma: parseFloat(event.gamma?.toFixed(2)),
      });
    };

    if (permissionGranted) {
      window.addEventListener(
        "deviceorientation",
        handleOrientationEvent,
        true
      );
      window.addEventListener("devicemotion", handleMotionEvent, true);
    }

    return () => {
      if (permissionGranted) {
        window.removeEventListener("deviceorientation", handleOrientationEvent);
        window.removeEventListener("devicemotion", handleMotionEvent);
      }
    };
  }, [isRecording, permissionGranted]);

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

  const startRecording = () => {
    setIsRecording(prevIsRecording => !prevIsRecording);
    setRecordedData([]);
  };

  const stopRecording = () => {
    setIsRecording(prevIsRecording => !prevIsRecording);
  };

  const downloadCSV = () => {
    const csvRows = recordedData.map(
      (data) => `${data.timestamp},${data.x},${data.y},${data.z},${data.rms},${data.score}`
    );
    const csvContent =
      "data:text/csv;charset=utf-8," + "Timestamp,X,Y,Z,RMS,Score\n" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "motion_data.csv");
    document.body.appendChild(link);

    link.click();
  };

  const calculateStabilityScore = () => {
    if (recordedData.length === 0) {
      return 0;
    }
    const scores = recordedData.map((data) => data.score);
    const average = scores.reduce((sum, value) => sum + value, 0) / scores.length;
    
    return Math.round(average);
  };

  return (
    <>
      <Typography level="h1">YoMove, {username}</Typography>
      {!permissionGranted && (
        <Button onClick={askForPermission}>Enable Device Sensors</Button>
      )}
      {permissionGranted && (
        <Box>
          <ButtonGroup
            variant="contained"
            aria-label="outlined primary button group"
          >
            <Button onClick={startRecording} disabled={isRecording}>
              Start Recording
            </Button>
            <Button onClick={stopRecording} disabled={!isRecording}>
              Stop Recording
            </Button>
            <Button
              onClick={downloadCSV}
              disabled={isRecording || recordedData.length === 0}
            >
              Download CSV
            </Button>
          </ButtonGroup>

          <Grid
            container
            direction={"column"}
            alignItems={"center"}
            spacing={3}
            sx={{ flexGrow: 1, mt: 1 }}
            className="sensor-info"
          >
            {!isRecording && recordedData.length > 0 && (
              <Typography level="h2">Stability score: {calculateStabilityScore()}</Typography>
            )}
            <Typography level="h2">Device Motion</Typography>
            <Grid className="acceleration-info">
              <Typography level="h3">Acceleration</Typography>
              <Typography>
                X-axis: {deviceMotion.acceleration?.x} m/s²
              </Typography>
              <Typography>
                Y-axis: {deviceMotion.acceleration?.y} m/s²
              </Typography>
              <Typography>
                Z-axis: {deviceMotion.acceleration?.z} m/s²
              </Typography>
              <Typography>
                RMS: {deviceMotion.acceleration?.rms} m/s²
              </Typography>
            </Grid>
            <Grid className="rotation-rate-info">
              <Typography level="h3">Rotation Rate</Typography>
              <Typography>
                Alpha: {deviceMotion.rotationRate?.alpha} deg/s
              </Typography>
              <Typography>
                Beta: {deviceMotion.rotationRate?.beta} deg/s
              </Typography>
              <Typography>
                Gamma: {deviceMotion.rotationRate?.gamma} deg/s
              </Typography>
            </Grid>

            <Typography level="h2">Device Orientation</Typography>
            <Grid className="orientation-info">
              <Typography>
                Alpha (Z-axis): {deviceOrientation.alpha}°
              </Typography>
              <Typography>Beta (X-axis): {deviceOrientation.beta}°</Typography>
              <Typography>
                Gamma (Y-axis): {deviceOrientation.gamma}°
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  );
}

export default App;
