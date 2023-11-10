import { useState } from "react";
import { Sheet, Input, Button } from "@mui/joy";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";

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
      <FormControl>
        <FormLabel>Enter your username</FormLabel>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
        />
      </FormControl>
      <Button onClick={handleSubmit}>Submit</Button>
    </Sheet>
  );
}

export default UsernamePopup;
