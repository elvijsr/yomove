import { useEffect, useState } from "react";
import { fetchScores } from "../services/leaderboard";
import ChallengeLeaderboard from "./ChallengeLeaderboard";
import { Tabs, TabList, Tab, TabPanel, Button, Box } from "@mui/joy";
import { useNavigate } from "react-router-dom";

function Leaderboard() {
  const [allScores, setAllScores] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(-1);
  };

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const getData = async () => {
    const scores = await fetchScores();
    setAllScores(convertToMap(scores));
  };

  function convertToMap(scores) {
    const result = {};

    scores.forEach((entry) => {
      const { challenge_name, scores } = entry;
      result[challenge_name] = scores;
    });

    return result;
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <Box sx={{ m: 1 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Tabs value={selectedTab} onChange={handleChange}>
          <TabList>
            {Object.keys(allScores).map((challengeName, index) => (
              <Tab key={index} label={challengeName}>
                {challengeName}
              </Tab>
            ))}
          </TabList>
          {Object.keys(allScores).map(
            (challengeName, index) =>
              selectedTab === index && (
                <TabPanel key={index} value={selectedTab} index={index}>
                  {selectedTab === index && (
                    <ChallengeLeaderboard scores={allScores[challengeName]} />
                  )}
                </TabPanel>
              )
          )}
        </Tabs>

        <Button onClick={handleClick} variant="soft" sx={{maxWidth: '45px', maxHeight: '45px', minWidth: '45px', minHeight: '45px'}}>&lt;</Button>
      </Box>
    </Box>
  );
}

export default Leaderboard;
