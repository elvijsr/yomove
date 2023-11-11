import { Router, useOutletContext, useParams } from "react-router-dom";
import { Typography, Box, Card, Modal } from "@mui/joy";

function Lobby() {
  const { username } = useOutletContext();
  const { lobbyId } = useParams();

  return (
    <Box sx={{ m: 1 }}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography level="h1">Lobby {lobbyId}</Typography>
      </Box>
    </Box>
  );
}

export default Lobby;
