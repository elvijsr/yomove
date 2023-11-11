import { useState } from "react";
import { useEffect } from "react";
import { Router, useOutletContext, useParams } from "react-router-dom";
import { Typography, Box, Card, Button, Modal } from "@mui/joy";
import { getLobby, joinLobby } from "../services/lobby";
import Invite from "../components/Invite";
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
    fetchLobby();
  };

  const fetchLobby = async () => {
    getLobby(lobbyParam)
      .then((data) => {
        setLobbyData(data);
      })
      .catch((error) => {
        console.error("Error fetching challenges:", error);
      });
  };

  const [showInvitePopup, setShowInvitePopup] = useState(false);

  const showInvite = () => {
    setShowInvitePopup(!showInvitePopup);
  };
  const hideInvite = () => {
    setShowInvitePopup(false);
  };

  const joinLobbyIfNotJoined = async () => {
    const currentUser = localStorage.getItem("username");

    if (
      lobbyData.users.length > 0 &&
      !lobbyData.users.some((user) => user.username === currentUser)
    ) {
      try {
        await joinLobby(lobbyData.lobby.id); // Call your joinLobby function here
        fetchLobby(); // Fetch lobby data after joining
      } catch (error) {
        console.error("Error joining lobby:", error);
      }
    }
  };

  useEffect(() => {
    fetchLobby();
    joinLobbyIfNotJoined(); // Call the function when the component mounts
  }, [lobbyParam]);

  useEffect(() => {
    fetchLobby();
  }, [lobbyParam]);

  return (
    <Box
      sx={{ m: 1, height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Modal open={showInvitePopup} onClose={hideInvite}>
        <Invite lobby={lobbyData} />
      </Modal>
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
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography level="h1">Players</Typography>
            <Button onClick={showInvite}>INVITE</Button>
          </Box>
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
                    {user.score ? user.score : "WAITING"}
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
