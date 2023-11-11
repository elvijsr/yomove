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

const getLobby = async (lobby_id) => {
  try {
    const response = await apiPost("/get-lobby", { lobby_id });
    return response; // contains lobby id
  } catch (error) {
    console.error("Failed to fetch lobbies", error);
    throw error;
  }
};

export { createLobby, getLobby };
