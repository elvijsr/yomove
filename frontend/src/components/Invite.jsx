import { Sheet, Input, Button, Typography, Box, Card } from "@mui/joy";
import ModalClose from "@mui/joy/ModalClose";
import toast from "react-hot-toast";

// eslint-disable-next-line react/prop-types
function Invite({ lobby }) {
  const handleCopyInvite = () => {
    navigator.clipboard.writeText(window.location.toString());
    toast.success("Invite link copied!");
  };

  return (
    <Sheet
      sx={{
        borderRadius: "md",
        maxWidth: "400px",
        mx: 4, // Margin left & right auto for centering
        mt: 20, // Margin top & bottom
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
