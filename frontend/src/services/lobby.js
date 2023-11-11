// services/challenges.js
import { apiPost } from "../utils/api";

const createLobby = async (challenge_id) => {
  try {
    const response = await apiPost("/create-lobby", { challenge_id });
    return response; // contains lobby id
  } catch (error) {
    console.error("Failed to fetch challenges", error);
    throw error;
  }
};

export { createLobby };
