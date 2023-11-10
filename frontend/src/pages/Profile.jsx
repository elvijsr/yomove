import { useOutletContext } from "react-router-dom";
import { Typography } from "@mui/joy";

function Profile() {
  const { username } = useOutletContext();

  return (
    <>
      <Typography level="h1">{username} profile</Typography>
    </>
  );
}

export default Profile;
