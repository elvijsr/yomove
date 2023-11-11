import { useState } from "react";
import { Sheet, Input, Button, Typography, Box, Card } from "@mui/joy";
import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import ModalClose from "@mui/joy/ModalClose";
import ChallangeImage from "../assets/challenges/flamingo.jpeg";

// eslint-disable-next-line react/prop-types
function ChallengeInfo({ challenge, onClose }) {
  const [inputValue, setInputValue] = useState("");

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
            backgroundImage: `url(${ChallangeImage})`,
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
          <Typography level="h3">{challenge.description}</Typography>
        </Box>
      </Card>

      <Button sx={{ fontSize: 30 }}>START CHALLANGE</Button>
    </Sheet>
  );
}

export default ChallengeInfo;
