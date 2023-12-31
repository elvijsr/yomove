import React, { useState, useEffect } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Card,
  Button,
  Modal,
  CircularProgress,
} from "@mui/joy";
import {
  getLobby,
  joinLobby,
  leaveLobby,
  nextChallenge,
  finishLobby,
} from "../services/lobby";
import Invite from "../components/Invite";
import StabilityChallenge from "../components/StabilityChallege";
import JumpChallenge from "../components/JumpChallenge";
import SquatChallenge from "../components/SquatChallenge";

function Lobby() {
  const { lobbyParam } = useParams();
  const [lobbyData, setLobbyData] = useState({ lobby: {}, users: [] });
  const [challengeRecording, setChallengeRecording] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { username } = useOutletContext();
  const navigate = useNavigate();

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
      if (data.lobby.created_by === username) {
        setIsAdmin(true);
        console.log("Is admin:" + isAdmin);
      }
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

  const handleNextChallenge = async () => {
    try {
      console.log(lobbyData.lobby.id);
      await nextChallenge(lobbyData.lobby.id);
      fetchLobby();
    } catch (error) {
      console.error("Error fetching challenges:", error);
      if (error && error.message === "No new challenges available") {
        await finishLobby(lobbyData.lobby.id);
        console.log("No new challenges available");
      } else {
        // Handle other errors
        console.error("Unexpected error:", error);
      }
    }
  };

  const handleLeaveLobby = async () => {
    try {
      console.log(lobbyData.lobby.id);
      await leaveLobby(lobbyData.lobby.id);
      navigate("/");
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  };

  const handleEndLobby = async () => {
    try {
      console.log(lobbyData.lobby.id);
      await finishLobby(lobbyData.lobby.id);
      fetchLobby();
    } catch (error) {
      console.error("Error fetching challenges:", error);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const joinLobbyIfNotJoined = async () => {
    console.log("joinLobbyIfNotJoined user:");
    console.log("joinLobbyIfNotJoined lobby id:", lobbyData.lobby.id);

    // Check if the user is already in the lobby
    const userAlreadyInLobby = lobbyData.users.some(
      (user) => user.username === username
    );

    if (!userAlreadyInLobby) {
      console.log("User not in the lobby. Joining...");
      try {
        // Join the lobby and immediately fetch updated lobby data
        await joinLobby(lobbyData.lobby.id);
        console.log("Joined lobby");

        // Fetch lobby data immediately after joining
        const updatedLobbyData = await getLobby(lobbyData.lobby.id);
        setLobbyData(updatedLobbyData);
      } catch (error) {
        console.error("Error joining lobby:", error);
      }
    } else {
      console.log("User already in the lobby.");
    }
  };

  const challengeComponents = {
    1: StabilityChallenge,
    2: SquatChallenge,
    3: JumpChallenge,
    4: StabilityChallenge,
  };

  useEffect(() => {
    // Always fetch lobby data when the component mounts
    fetchLobby();

    // Set up an interval to fetch lobby data every 5 seconds
    const intervalId = setInterval(() => {
      fetchLobby();
    }, 3000);

    // Join the lobby if not joined after the initial fetch
    if (lobbyData.lobby.id) {
      joinLobbyIfNotJoined();
    }

    // Clean up the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, [lobbyData.lobby.id, username]); // Add lobbyData.lobby.id to dependency array

  return (
    <Box
      sx={{
        m: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Modal open={showInvitePopup} onClose={hideInvite}>
        <Invite lobby={lobbyData} />
      </Modal>
      {lobbyData.users.length > 0 && (
        <Card
          variant="soft"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundImage: `url(${lobbyData.lobby.current_challenge.image_source})`,
            backgroundSize: "cover",
            aspectRatio: "1/1",
            overflow: "hidden",
            "::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)", // Adjust the alpha value for darkness
            },
          }}
        >
          {!challengeRecording && <Box></Box>}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
              color: "#fff",
              textAlign: "center",
              gap: 2,
            }}
          >
            <Typography level="h1">
              {lobbyData.lobby.current_challenge.challenge_name}
            </Typography>
            <Typography level="h5" sx={{ color: "gold", textAlign: "center" }}>
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
            <Typography level="h1">
              {lobbyData.lobby.is_active ? "Players" : "Total score"}
            </Typography>
            {lobbyData.lobby.is_active && (
              <Button onClick={showInvite}>INVITE</Button>
            )}
          </Box>
          {lobbyData.lobby.is_active ? (
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
                      {user.score !== null
                        ? user.score
                        : user.score === 0
                        ? 0
                        : "WAITING"}
                    </Typography>
                  </Box>
                ))}
            </Box>
          ) : (
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
                      {user.total_score ? user.total_score : "0"}
                    </Typography>
                  </Box>
                ))}
            </Box>
          )}
          {lobbyData.lobby.is_active &&
            !lobbyData.users.some(
              (user) => user.username === username && user.score !== null
            ) && <Button onClick={recordChallenge}>START CHALLENGE</Button>}
          {lobbyData.lobby.is_active &&
            isAdmin &&
            lobbyData.users.every((user) => user.score !== null) && (
              <Button onClick={handleNextChallenge}>NEXT CHALLENGE</Button>
            )}
          {lobbyData.lobby.is_active && !isAdmin && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <CircularProgress color="success" />
              <Button sx={{ width: "100%" }} onClick={handleLeaveLobby}>
                LEAVE LOBBY
              </Button>
            </Box>
          )}
          {lobbyData.lobby.is_active && isAdmin && (
            <Button onClick={handleEndLobby}>FINISH LOBBY</Button>
          )}
          {!lobbyData.lobby.is_active && (
            <Button onClick={handleGoHome}>HOME</Button>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            gap: 2,
          }}
        >
          {lobbyData.lobby.current_challenge &&
          lobbyData.lobby.current_challenge.id in challengeComponents ? (
            React.createElement(
              challengeComponents[lobbyData.lobby.current_challenge.id],
              {
                lobby: lobbyData.lobby,
                finishChallenge: handleFinishChallenge,
              }
            )
          ) : (
            <Box>Error: Unknown Challenge</Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default Lobby;
