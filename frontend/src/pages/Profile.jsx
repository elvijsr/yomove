import { useOutletContext } from "react-router-dom";
import { Typography, Box } from "@mui/joy";

function Profile() {
  const { username } = useOutletContext();

  return (
    <Box>
      <Typography level="h4">{username} profile</Typography>
    </Box>
  );
}

export default Profile;
