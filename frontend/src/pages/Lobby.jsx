import { useState } from "react";
import { useEffect } from "react";
import { Router, useOutletContext, useParams } from "react-router-dom";
import { Typography, Box, Card, Button } from "@mui/joy";
import { getLobby } from "../services/lobby";
import ChallengeImage from "../assets/challenges/flamingo.jpeg";
import StabilityChallenge from "../components/StabilityChallege";

function Lobby() {
  const { lobbyParam } = useParams();
  const [lobbyData, setLobbyData] = useState({ lobby: {}, users: [] });
  const [challengeStarted, setChallengeStarted] = useState(false);

  const startChallenge = () => {
    setChallengeStarted(true);
  };

  useEffect(() => {
    getLobby(lobbyParam)
      .then((data) => {
        setLobbyData(data);
      })
      .catch((error) => {
        console.error("Error fetching challenges:", error);
      });
  }, []);

  return (
    <Box sx={{ m: 1 }}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {lobbyData.users.length > 0 && (
          <Card>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundImage: `url(${ChallengeImage})`,
                backgroundSize: "cover",
                aspectRatio: "1/1",
              }}
            ></Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography level="h1">
                {lobbyData.lobby.current_challenge.challenge_name}
              </Typography>
              <Typography level="h4">
                {lobbyData.lobby.current_challenge.description}
              </Typography>
            </Box>
          </Card>
        )}
        {!challengeStarted ? (
          <Box
            sx={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              width: "100%",
            }}
          >
            <Typography level="h1">Players</Typography>
            {lobbyData.users.length > 0 &&
              lobbyData.users.map((user) => (
                <Typography level="h2">{user.username}</Typography>
              ))}
            <Button sx={{ fontSize: 30 }} onClick={startChallenge}>
              LET'S GO
            </Button>
          </Box>
        ) : (
          <StabilityChallenge />
        )}
      </Box>
    </Box>
  );
}

export default Lobby;
