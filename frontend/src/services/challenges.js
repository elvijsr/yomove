// services/challenges.js
import { apiGet } from "../utils/api";

const fetchChallenges = async () => {
  try {
    const response = await apiGet("/challenges");
    return response; // Contains the challenges
  } catch (error) {
    console.error("Failed to fetch challenges", error);
    throw error;
  }
};

export { fetchChallenges };
