import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Modal, Box, Button, Typography, Avatar } from "@mui/joy";
import UsernamePopup from "../components/UsernamePopup";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { login, fetchProfile } from "../services/login";

function Layout() {
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [userProfile, setUserProfile] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(
    localStorage.getItem("permissionGranted") ||
      typeof DeviceMotionEvent.requestPermission !== "function"
  );

  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/profile");
  };

  const getUserProfile = async () => {
    const userProfile = await fetchProfile();
    setUserProfile(userProfile);
  };

  const findAvatarUrl = (userProfile) => {
    const avatars = userProfile.data.avatars;
    const avatarId = parseInt(userProfile.data.avatar_id);

    const avatar = avatars.find((avatar) => avatar.avatar_id === avatarId);

    return avatar ? avatar.url : null;
  };

  useEffect(() => {
    if (!username) {
      setShowPopup(true);
    } else {
      getUserProfile();
    }
  }, [username]);

  const handleUsernameSubmit = async (newUsername) => {
    try {
      await login(newUsername);
      localStorage.setItem("username", newUsername);
      setUsername(newUsername);

      setShowPopup(false);
      toast.success(`Hi ${newUsername}`, { icon: "👏" });
    } catch (error) {
      toast.error(`${error.message}`);
    }
  };

  const handleGrantingPermissions = async () => {
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      const permissionState = await DeviceMotionEvent.requestPermission();
      localStorage.setItem("permissionGranted", permissionState === "granted");
      setPermissionGranted(permissionState === "granted");
    } else {
      setPermissionGranted(true);
      localStorage.setItem("permissionGranted", true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username"); // Remove username from local storage
    setUsername(""); // Reset username state
    setShowPopup(true); // Show the popup again to allow login
  };

  const adjustAvatarUrl = (avatarSrc) => {
    const urlParts = avatarSrc.split("/");

    const publicId = urlParts[urlParts.length - 1].split(".")[0];
    const version = urlParts[urlParts.length - 2];

    const newUrl = `https://res.cloudinary.com/dpajrrxiq/image/upload/w_100,h_100,c_fill,q_70/${version}/${publicId}.png`;

    return newUrl;
  };

  return (
    <>
      <Modal open={showPopup}>
        <UsernamePopup onSubmit={handleUsernameSubmit} />
      </Modal>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {username && (
          <>
            <Box onClick={handleClick} sx={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
              {userProfile !== null && (
                <Avatar src={adjustAvatarUrl(findAvatarUrl(userProfile))} />
              )}
              <Typography level="h4">{username}</Typography>
            </Box>
            <Button variant="outlined" onClick={handleLogout}>
              Logout
            </Button>
            {!permissionGranted && (
              <Button variant="outlined" onClick={handleGrantingPermissions}>
                Enable sensor data
              </Button>
            )}
          </>
        )}
      </Box>
      <Outlet context={{ username }} />
      <Toaster position="bottom-center" />
    </>
  );
}

export default Layout;
