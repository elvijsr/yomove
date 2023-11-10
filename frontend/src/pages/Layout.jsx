import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Modal, Box, Button } from "@mui/joy";
import UsernamePopup from "../components/UsernamePopup";

function Layout() {
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!username) {
      setShowPopup(true);
    }
  }, [username]);

  const handleUsernameSubmit = (newUsername) => {
    localStorage.setItem("username", newUsername);
    setUsername(newUsername);
    setShowPopup(false);
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
            <Box>{username}</Box>
            <Button variant="outlined" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </Box>
      <Outlet context={{ username }} />
    </>
  );
}

export default Layout;
