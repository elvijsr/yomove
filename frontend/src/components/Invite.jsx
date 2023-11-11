import { useNavigate } from "react-router-dom";
import { Sheet, Input, Button, Typography, Box, Card } from "@mui/joy";
import ModalClose from "@mui/joy/ModalClose";

// eslint-disable-next-line react/prop-types
function Invite({ lobby }) {
  const navigate = useNavigate();

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(window.location.toString());
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
          }}
        >
          <Typography level="h1">{lobby.lobby.lobby_name}</Typography>
        </Box>
      </Card>

      <Button sx={{ fontSize: 30 }} onClick={handleCopyInvite}>
        COPY INVITE
      </Button>
    </Sheet>
  );
}

export default Invite;
