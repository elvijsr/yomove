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
    try {
      const data = await getLobby(lobbyParam);
      setLobbyData(data);
      console.log("Fetching lobby:", data.lobby.id);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
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
    console.log("joinLobbyIfNotJoined user:", currentUser);
    console.log("joinLobbyIfNotJoined lobby id:", lobbyData.lobby.id);

    // Check if the user is already in the lobby
    const userAlreadyInLobby = lobbyData.users.some(
      (user) => user.username === currentUser
    );

    if (!userAlreadyInLobby) {
      console.log("User not in the lobby. Joining...");
      try {
        await joinLobby(lobbyData.lobby.id);
        console.log("Joined lobby");
        // No need to fetchLobby here; it will be automatically fetched in the next render
      } catch (error) {
        console.error("Error joining lobby:", error);
      }
    } else {
      console.log("User already in the lobby.");
    }
  };

  useEffect(() => {
    // Always fetch lobby data when the component mounts
    fetchLobby();

    // Set up an interval to fetch lobby data every 5 seconds
    const intervalId = setInterval(() => {
      fetchLobby();
    }, 5000);

    // Join the lobby if not joined after the initial fetch
    if (lobbyData.lobby.id) {
      joinLobbyIfNotJoined();
    }

    // Clean up the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [lobbyData.lobby.id]); // Add lobbyData.lobby.id to dependency array

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
                  key={user.id}
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
