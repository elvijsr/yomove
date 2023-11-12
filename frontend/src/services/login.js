// services/challenges.js
import { apiPost, apiGet } from "../utils/api";

const login = async (username) => {
  try {
    const response = await apiPost("/login", { username });
    return response; // Contains the challenges
  } catch (error) {
    console.error("Failed to fetch challenges", error);
    throw error;
  }
};

const fetchProfile = async () => {
  try {
    const response = await apiGet("/me");
    return response;
  } catch (error) {
    console.error("Failed to fetch challenges", error);
    throw error;
  }
};

const fetchLobbies = async () => {
  try {
    const response = await apiGet("/my-lobbies");
    return response;
  } catch (error) {
    console.error("Failed to fetch lobbies", error);
    throw error;
  }
};

export { login, fetchProfile, fetchLobbies };
