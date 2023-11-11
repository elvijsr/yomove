// services/challenges.js
import { apiGet, apiPost } from "../utils/api";

const fetchChallenges = async () => {
  try {
    const response = await apiGet("/challenges");
    return response; // Contains the challenges
  } catch (error) {
    console.error("Failed to fetch challenges", error);
    throw error;
  }
};

const submitResult = async ({ lobby_id, challenge_id, score }) => {
  try {
    const response = await apiPost("/submit-results", {
      lobby_id,
      challenge_id,
      score,
    });
    return response;
  } catch (error) {
    console.error("Failed to set next challenge", error);
    throw error;
  }
};

export { fetchChallenges, submitResult };
