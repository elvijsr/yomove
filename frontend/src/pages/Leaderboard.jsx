import { useEffect, useState } from "react";
import { fetchScores } from "../services/leaderboard";
import ChallengeLeaderboard from "./ChallengeLeaderBoard";
import { Tabs, TabList, Tab, TabPanel } from "@mui/joy";

function Leaderboard() {
  const [allScores, setAllScores] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

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
    <>
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
    </>
  );
}

export default Leaderboard;
