// services/challenges.js
import { apiPost } from "../utils/api";

const login = async (username) => {
  try {
    const response = await apiPost("/login", { username });
    return response; // Contains the challenges
  } catch (error) {
    console.error("Failed to fetch challenges", error);
    throw error;
  }
};

export { login };
