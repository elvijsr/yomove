import { useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Typography, Box, Card, Modal, Button } from "@mui/joy";
import ChallengeInfo from "../components/ChallengeInfo";
import { fetchChallenges } from "../services/challenges";
import theme from "../main.jsx";

function Home() {
  const { username } = useOutletContext();

  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/leaderboard");
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

  const openChallengeInfoModal = (challenge) => {
    setSelectedChallenge(challenge);
    setIsModalOpen(true);
  };

  const closeChallengeInfoModal = () => {
    setSelectedChallenge(null);
    setIsModalOpen(false);
  };

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
            mb: 1
          }}
        >
          <Typography level="h1">Challenges</Typography>
          <Button onClick={handleClick} variant="soft">
          🏆
          </Button>
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
              key={challenge.id}
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
              onClick={() => openChallengeInfoModal(challenge)}
            >
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
        <Modal open={isModalOpen} onClose={closeChallengeInfoModal}>
          <ChallengeInfo challenge={selectedChallenge} />
        </Modal>
      </Box>
    </Box>
  );
}

export default Home;
