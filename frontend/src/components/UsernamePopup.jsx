import { useState } from "react";
import { Sheet, Input, Button, Typography, Box } from "@mui/joy";
import FormControl from "@mui/joy/FormControl";
import FormHelperText from "@mui/joy/FormHelperText";
import Logo from "../assets/Logo.svg";

// eslint-disable-next-line react/prop-types
function UsernamePopup({ onSubmit }) {
  const [inputValue, setInputValue] = useState("");
  const [inputValueValid, setInputValueValid] = useState(true);

  const handleInput = (value) => {
    if (value.length >= 3) {
      setInputValueValid(true);
    } else {
      setInputValueValid(false);
    }
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    if (inputValueValid) {
      onSubmit(inputValue);
    }
  };

  return (
    <Sheet
      sx={{
        borderRadius: "md",
        maxWidth: "400px",
        mx: 4,
        my: 4,
        mt: 20,
        p: 3,
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
            onChange={(e) => {
              setInputValue(e.target.value);
              handleInput(e.target.value);
            }}
            autoFocus
          />
          <FormHelperText sx={{ display: inputValueValid ? "none" : "flex" }}>
            Enter 3 or more characters
          </FormHelperText>
        </Box>
      </FormControl>
      <Button sx={{ fontSize: 30 }} onClick={handleSubmit}>
        GO
      </Button>
    </Sheet>
  );
}

export default UsernamePopup;
