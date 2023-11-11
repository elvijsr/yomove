import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Layout from "./pages/Layout.jsx";
import Profile from "./pages/Profile.jsx";
import StabilityChallenge from "./components/StabilityChallege.jsx";
import Home from "./pages/Home.jsx";
import Lobby from "./pages/Lobby.jsx";
import { Typography } from "@mui/joy";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import "@fontsource/nunito/900-italic.css";
import SquatChallenge from "./components/SquatChallenge.jsx";
import JumpChallenge from "./components/JumpChallenge.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";

const theme = extendTheme({
  typography: {
    h1: {
      background:
        "linear-gradient(90deg, rgba(255,179,71,1) 0%, rgba(255,204,51,1) 100%);",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    h3: {
      color: "white",
    },
    h2: {
      background:
        "linear-gradient(90deg, rgba(255,179,71,1) 0%, rgba(255,204,51,1) 100%);",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    h4: {
      background:
        "linear-gradient(90deg, rgba(255,179,71,1) 0%, rgba(255,204,51,1) 100%);",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  },
  fontFamily: {
    display: "'Nunito', sans-serif",
    body: "'Nunito', sans-serif",
  },
  colorSchemes: {
    light: {
      palette: {
        main: {
          secondary: "#000000",
        },
        gradient: {
          primary:
            "linear-gradient(90deg, rgba(255,179,71,1) 0%, rgba(255,204,51,1) 100%);",
        },
      },
    },
  },
  components: {
    JoyButton: {
      styleOverrides: {
        root: {
          backgroundImage:
            "linear-gradient(90deg, rgba(255,179,71,1) 0%, rgba(255,204,51,1) 100%)",
        },
      },
    },
  },
});

export default theme;

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "/test",
        element: <App />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/stable",
        element: <StabilityChallenge />,
      },
      {
        path: "/squat",
        element: <SquatChallenge />,
      },
      {
        path: "/lobby/:lobbyParam",
        element: <Lobby />,
      },
      {
        path: "/jump",
        element: <JumpChallenge />,
      },
      {
        path: "/leaderboard",
        element: <Leaderboard />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CssVarsProvider theme={theme}>
      <RouterProvider router={router} />
    </CssVarsProvider>
  </React.StrictMode>
);
