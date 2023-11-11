import { useEffect, useState } from "react";
import { Router, useOutletContext } from "react-router-dom";
import { Typography, Box, Card, Modal } from "@mui/joy";
import ChallengeInfo from "../components/ChallengeInfo";
import { fetchChallenges } from "../services/challenges";
import ChallengeImage from "../assets/challenges/flamingo.jpeg";
import theme from "../main.jsx";

function Home() {
  const { username } = useOutletContext();

  const [challenges, setChallenges] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const showInfo = () => {
    setShowPopup(!showPopup);
  };
  const hideInfo = () => {
    setShowPopup(false);
  };

  useEffect(() => {
    fetchChallenges()
      .then((data) => {
        // Assuming fetchChallenges returns an array of challenges
        setChallenges(data.challenges);
      })
      .catch((error) => {
        console.error("Error fetching challenges:", error);
      });
  }, []);

  return (
    <Box sx={{ m: 1 }}>
      <Modal open={showPopup} onClose={hideInfo}>
        <ChallengeInfo challenge={challenges[0]} />
      </Modal>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Typography level="h1">Daily Challenge</Typography>
        <Card
          variant="flat"
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            cursor: "pointer",
            width: "100%",
            alignItems: "flex-end",
            backgroundImage: `url(${ChallengeImage})`,
            aspectRatio: "2/1",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          onClick={showInfo}
        >
          <Box
            sx={{
              backgroundImage:
                theme.colorSchemes.light.palette.gradient.primary,
              px: 2,
              borderRadius: "md",
            }}
          >
            <Typography level="h3">{challenges[0]?.challenge_name}</Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}

export default Home;
