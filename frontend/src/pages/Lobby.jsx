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
  const [challengeRecording, setChallengeRecording] = useState(false);

  const recordChallenge = () => {
    setChallengeRecording(true);
  };

  const handleFinishChallenge = () => {
    setChallengeRecording(false);
    getLobby(lobbyParam);
  };

  useEffect(() => {
    getLobby(lobbyParam)
      .then((data) => {
        setLobbyData(data);
      })
      .catch((error) => {
        console.error("Error fetching challenges:", error);
      });
  }, [lobbyParam]);

  return (
    <Box
      sx={{ m: 1, height: "100%", display: "flex", flexDirection: "column" }}
    >
      {lobbyData.users.length > 0 && (
        <Card variant="flat">
          {!challengeRecording && (
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
          )}
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
      {!challengeRecording ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: 2,
          }}
        >
          <Typography level="h1">Players</Typography>
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              justifyContent: "space-between",
            }}
          >
            {lobbyData.users.length > 0 &&
              lobbyData.users.map((user) => (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography key={user.id} level="h2">
                    {user.username}
                  </Typography>
                  <Typography key={user.id} level="h2">
                    {JSON.stringify(user.score)}
                  </Typography>
                </Box>
              ))}
          </Box>
          <Button sx={{ fontSize: 30 }} onClick={recordChallenge}>
            LET'S GO
          </Button>
        </Box>
      ) : (
        <StabilityChallenge
          lobby={lobbyData.lobby}
          finishChallenge={handleFinishChallenge}
        />
      )}
    </Box>
  );
}

export default Lobby;
