import { useOutletContext } from "react-router-dom";
import { Typography, Box, Button } from "@mui/joy";

function Profile() {
  const { username } = useOutletContext();

  const handleLogout = () => {
    localStorage.removeItem("username"); // Remove username from local storage
  };

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
        <Button backgroundColor="red" onClick={handleLogout}>
          DELETE PROFILE
        </Button>
      </Box>
    </Box>
  );
}

export default Profile;
