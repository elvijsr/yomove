import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Button,
  ButtonGroup,
  Divider,
  Avatar,
} from "@mui/joy";
import { fetchProfile } from "../services/login";

function Profile() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("username"); // Remove username from local storage
    window.location.href = "https://yomove.xyz";
  };

  const goBack = () => {
    navigate(-1);
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

  const findAvatarUrl = (userProfile) => {
    const avatars = userProfile.avatars;
    const avatarId = parseInt(userProfile.avatar_id);
    const avatar = avatars.find((avatar) => avatar.avatar_id == avatarId);
    return avatar ? avatar.url : null;
  };

  const adjustAvatarUrl = (avatarSrc) => {
    const urlParts = avatarSrc.split("/");

    const publicId = urlParts[urlParts.length - 1].split(".")[0];
    const version = urlParts[urlParts.length - 2];

    const newUrl = `https://res.cloudinary.com/dpajrrxiq/image/upload/w_300,h_300,c_fill,q_70/${version}/${publicId}.png`;

    return newUrl;
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await fetchProfile();
        setProfile(profileData.data);
        console.log(profileData);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };

    loadProfile();
  }, []);

  return (
    <Box>
      <Box sx={{ display: "flex" }}>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={() => goBack()}>Back</Button>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          m: 2,
          height: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Avatar
            src={profile && adjustAvatarUrl(findAvatarUrl(profile))}
            sx={{
              width: "150px",
              height: "150px",
              border: 4,
              borderColor: "#ffb347",
            }}
          />
          <Typography
            sx={{
              textAlign: "center", // Centers the text inside the Typography component
            }}
          >
            Level {profile && profile.level}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Typography level="h1">Top Scores</Typography>
          <Box sx={{ my: 1 }}>
            {profile &&
              profile.top_scores.length > 0 &&
              profile.top_scores.map((item) => {
                return (
                  <Box
                    key={item.challenge_name}
                    sx={{ display: "flex", gap: 2 }}
                  >
                    <Typography level="body-lg" sx={{ width: "130px" }}>
                      {item.challenge_name}
                    </Typography>
                    <Divider orientation="vertical" />
                    <Typography level="body-lg" color="primary">
                      {item.top_score}
                    </Typography>
                  </Box>
                );
              })}
            {profile && profile.top_scores.length === 0 && (
              <Typography level="body-lg">
                Complete challenges to get scores!
              </Typography>
            )}
          </Box>
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
    </Box>
  );
}

export default Profile;
