import { useState } from "react";
import { Sheet, Input, Button, Typography, Box } from "@mui/joy";
import FormControl from "@mui/joy/FormControl";
import Logo from "../assets/Logo.svg";

// eslint-disable-next-line react/prop-types
function UsernamePopup({ onSubmit }) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(inputValue);
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
      <FormControl sx={{ gap: 3 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img src={Logo} style={{ width: "70%" }} />
        </div>
        <Box>
          <Typography level="h2">Enter your username</Typography>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            autoFocus
          />
        </Box>
      </FormControl>
      <Button sx={{ fontSize: 30 }} onClick={handleSubmit}>
        GO
      </Button>
    </Sheet>
  );
}

export default UsernamePopup;
