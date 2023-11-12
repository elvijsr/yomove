import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Typography, Box, Button, ButtonGroup } from "@mui/joy";
import { fetchProfile } from "../services/login";

function Profile() {
  const { username } = useOutletContext();
  const [profile, setProfile] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("username"); // Remove username from local storage
  };

  const isIOSDevice = () => {
    return typeof DeviceMotionEvent.requestPermission === "function";
  };

  const handleGrantingPermissions = async () => {
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      const permissionState = await DeviceMotionEvent.requestPermission();
      localStorage.setItem("permissionGranted", permissionState === "granted");
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await fetchProfile();
        setProfile(profileData);
        console.log(profileData);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    loadProfile();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        m: 2,
        height: "100%",
      }}
    >
      <Box>
        <Typography level="h1">{username}</Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          width: "100%",
        }}
      >
        <Typography level="h1">Scores</Typography>
        <Typography level="h1">Settings</Typography>
        <ButtonGroup orientation="vertical" spacing="1rem">
          <Button backgroundColor="red" onClick={handleLogout}>
            DELETE PROFILE
          </Button>
          {isIOSDevice && (
            <Button backgroundColor="red" onClick={handleGrantingPermissions}>
              REFRESH MOTION PERMISSIONS
            </Button>
          )}
        </ButtonGroup>
      </Box>
    </Box>
  );
}

export default Profile;
