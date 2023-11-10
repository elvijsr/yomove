import { useState, useEffect } from "react";
import { Typography, Button, Box, Grid } from '@mui/joy';

function App() {
  const [deviceMotion, setDeviceMotion] = useState({});
  const [deviceOrientation, setDeviceOrientation] = useState({});
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedData, setRecordedData] = useState([]);

  const askForPermission = async () => {
    let orientationPermissionGranted = false;
    let motionPermissionGranted = false;

    try {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        const permissionState = await DeviceOrientationEvent.requestPermission();
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

      setDeviceMotion(motionData);

      if (isRecording) {
        setRecordedData((prevData) => [
          ...prevData,
          {
            x: motionData.acceleration.x,
            y: motionData.acceleration.y,
            z: motionData.acceleration.z,
            timestamp: motionData.timestamp,
          },
        ]);
      }
    };

    const handleOrientationEvent = (event) => {
      setDeviceOrientation({
        alpha: parseFloat(event.alpha?.toFixed(2)),
        beta: parseFloat(event.beta?.toFixed(2)),
        gamma: parseFloat(event.gamma?.toFixed(2)),
      });
    };

    if (permissionGranted) {
      window.addEventListener("deviceorientation", handleOrientationEvent, true);
      window.addEventListener("devicemotion", handleMotionEvent, true);
    }

    return () => {
      if (permissionGranted) {
        window.removeEventListener("deviceorientation", handleOrientationEvent);
        window.removeEventListener("devicemotion", handleMotionEvent);
      }
    };
  }, [isRecording, permissionGranted]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordedData([]);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const downloadCSV = () => {
    const csvRows = recordedData.map((data) => `${data.timestamp},${data.x},${data.y},${data.z}`);
    const csvContent = "data:text/csv;charset=utf-8," + "Timestamp,X,Y,Z\n" + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "motion_data.csv");
    document.body.appendChild(link);

    link.click();
  };

  return (
    <>
      <Typography level="h1">YoMove</Typography>
      {!permissionGranted && (
        <Button onClick={askForPermission}>Enable Device Sensors</Button>
      )}
      {permissionGranted && (
        <Box>
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

          <Grid
            container
            direction={"column"}
            alignItems={"center"}
            spacing={3}
            sx={{ flexGrow: 1, mt: 1 }}
            className="sensor-info"
          >
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
