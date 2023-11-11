import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import Layout from "./pages/Layout.jsx";
import Profile from "./pages/Profile.jsx";
import StabilityChallenge from "./components/StabilityChallege.jsx";
import { Typography } from "@mui/joy";
import { CssVarsProvider, extendTheme } from "@mui/joy/styles";
import "@fontsource/nunito/900-italic.css";

const theme = extendTheme({
  typography: {
    h1: {
      background:
        "linear-gradient(90deg, rgba(255,179,71,1) 0%, rgba(255,204,51,1) 100%);",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    h2: {
      background:
        "linear-gradient(90deg, rgba(255,179,71,1) 0%, rgba(255,204,51,1) 100%);",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  },
  fontFamily: {
    display: "Nunito",
    body: "Nunito",
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
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
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CssVarsProvider theme={theme}>
      <Typography
        sx={{ color: theme.colorSchemes.light.palette.gradient.primary }}
        level="h1"
      >
        YoMove!
      </Typography>
      <RouterProvider router={router} />
    </CssVarsProvider>
  </React.StrictMode>
);
