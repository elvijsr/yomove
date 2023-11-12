import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, Input, Button, Typography, Box, Card } from "@mui/joy";
import ModalClose from "@mui/joy/ModalClose";
import { createLobby } from "../services/lobby";

// eslint-disable-next-line react/prop-types
function ChallengeInfo({ challenge }) {
  const [inputValue, setInputValue] = useState("");
  const [lobbyName, setLobbyName] = useState("");
  const navigate = useNavigate();

  const handleStartLobby = async () => {
    try {
      const response = await createLobby(challenge.id);
      // Assuming the response contains the lobby ID
      setLobbyName(response.lobbyName);
      navigate(`/lobby/${response.lobbyName}`);
    } catch (error) {
      console.error("Error creating lobby:", error);
      // Handle the error, e.g., show an error message to the user
    }
  };

  return (
    <Sheet
      sx={{
        borderRadius: "md",
        maxWidth: "400px",
        mx: "auto", // Margin left & right auto for centering
        my: 4, // Margin top & bottom
        p: 3, // Padding
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
      variant="outlined"
      role="form"
    >
      <Box sx={{ display: "flex", justifyContent: "end", m: 1 }}>
        <ModalClose color="black" size="lg" />
      </Box>
      <Card>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundImage: `url(${challenge.image_source})`,
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
          <Typography level="h1">{challenge.challenge_name}</Typography>
          <Typography level="h4">{challenge.description}</Typography>
        </Box>
      </Card>

      <Button sx={{ fontSize: 30 }} onClick={handleStartLobby}>
        START CHALLENGE
      </Button>
    </Sheet>
  );
}

export default ChallengeInfo;
