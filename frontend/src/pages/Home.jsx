import { useEffect, useState } from "react";
import { Router, useOutletContext } from "react-router-dom";
import { Typography, Box, Card, Modal, IconButton } from "@mui/joy";
import ChallengeInfo from "../components/ChallengeInfo";
import { fetchChallenges } from "../services/challenges";
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Typography level="h1">Challenges</Typography>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2,
          }}
        >
          {challenges.map((challenge) => (
            <Card
              variant="soft"
              sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                cursor: "pointer",
                alignItems: "center",
                backgroundImage: `url(${challenge.image_source})`,
                aspectRatio: "1/1",
                backgroundSize: "cover",
                backgroundPosition: "center",
                borderBottom: "10px solid rgba(0,0,0,0.25)",
              }}
              onClick={showInfo}
            >
              <Modal open={showPopup} onClose={hideInfo}>
                <ChallengeInfo challenge={challenge} />
              </Modal>
              <Box
                sx={{
                  backgroundImage:
                    theme.colorSchemes.light.palette.gradient.primary,
                  px: 2,
                  borderRadius: "md",
                }}
              >
                <Typography level="h3">{challenge?.challenge_name}</Typography>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default Home;
