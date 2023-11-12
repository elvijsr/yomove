import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Card,
  Modal,
  Button,
  FormControl,
  Input,
} from "@mui/joy";
import ChallengeInfo from "../components/ChallengeInfo";
import { fetchChallenges } from "../services/challenges";
import { fetchLobbies } from "../services/login.js";
import theme from "../main.jsx";
import toast from "react-hot-toast";

function Home() {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [lobby, setLobby] = useState(null);

  const [inputValue, setInputValue] = useState("");
  const [inputValueValid, setInputValueValid] = useState(true);

  const handleInput = (value) => {
    if (value.length === 5) {
      setInputValueValid(true);
    } else {
      setInputValueValid(false);
    }
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    if (inputValueValid) {
      console.log(inputValue);
      navigate(`/lobby/${inputValue}`);
    } else {
      toast.error("Invite code should be 5 digits");
    }
  };

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

    const loadLobbies = async () => {
      try {
        const lobbyData = await fetchLobbies();
        if (lobbyData.lobbies.length > 0) {
          const activeLobbies = lobbyData.lobbies.filter(
            (lobby) => lobby.is_active
          );
          if (activeLobbies.length > 0) {
            const activeLobbyWithLargestId = activeLobbies.reduce(
              (prev, current) => {
                return prev.id > current.id ? prev : current;
              },
              { id: -Infinity }
            );
            setLobby(activeLobbyWithLargestId);
          }
        }
      } catch (error) {
        console.error("Failed to fetch lobby:", error);
      }
    };

    loadLobbies();
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
            mb: 1,
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
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            mt: 4,
            gap: 1,
          }}
        >
          <FormControl sx={{ gap: 1 }}>
            <Box>
              <Typography level="h4">Join existing lobby</Typography>
              <Input
                value={inputValue}
                placeholder="Enter 5 digit code"
                onChange={(e) => {
                  setInputValue(e.target.value);
                  handleInput(e.target.value);
                }}
              />
            </Box>
          </FormControl>
          <Button onClick={handleSubmit}>JOIN</Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            mt: 2,
          }}
        >
          {lobby && (
            <Button
              sx={{ width: "100%" }}
              onClick={() => navigate(`/lobby/${lobby.lobby_name}`)}
              variant="soft"
            >
              <Typography level="h3">REJOIN LOBBY</Typography>
            </Button>
          )}
        </Box>
        <Modal open={isModalOpen} onClose={closeChallengeInfoModal}>
          <ChallengeInfo challenge={selectedChallenge} />
        </Modal>
      </Box>
    </Box>
  );
}

export default Home;
