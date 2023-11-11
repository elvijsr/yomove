import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Modal, Box, Button, Typography } from "@mui/joy";
import UsernamePopup from "../components/UsernamePopup";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";
import { login } from "../services/login";

function Layout() {
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [showPopup, setShowPopup] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(typeof DeviceMotionEvent.requestPermission !== "function");

  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/profile");
  };

  useEffect(() => {
    if (!username) {
      setShowPopup(true);
    }
  }, [username]);

  const handleUsernameSubmit = async (newUsername) => {
    try {
      await login(newUsername);
      localStorage.setItem("username", newUsername);
      setUsername(newUsername);

      await handleGrantingPermissions();

      setShowPopup(false);
      toast.success(`Hi ${newUsername}`, { icon: "👏" });
    } catch (error) {
      toast.error(`${error.message}`);
    }
  };

  const handleGrantingPermissions = async () => {
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      const permissionState = await DeviceMotionEvent.requestPermission();
      setPermissionsGranted(permissionState === "granted");
    } else {
      setPermissionsGranted(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("username"); // Remove username from local storage
    setUsername(""); // Reset username state
    setShowPopup(true); // Show the popup again to allow login
  };

  return (
    <>
      <Modal open={showPopup}>
        <UsernamePopup onSubmit={handleUsernameSubmit} />
      </Modal>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {username && (
          <>
            <Box onClick={handleClick} sx={{ cursor: "pointer" }}>
              <Typography level="h4">{username}</Typography>
            </Box>
            <Button variant="outlined" onClick={handleLogout}>
              Logout
            </Button>
            {!permissionsGranted && (
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
