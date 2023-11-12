// services/challenges.js
import { apiPost, apiGet } from "../utils/api";

const createLobby = async (challenge_id) => {
  try {
    const response = await apiPost("/create-lobby", { challenge_id });
    return response; // contains lobby id
  } catch (error) {
    console.error("Failed to fetch challenges", error);
    throw error;
  }
};

const getLobby = async (lobby_name) => {
  try {
    const response = await apiPost("/get-lobby", { lobby_name });
    return response;
  } catch (error) {
    console.error("Failed to fetch lobbies", error);
    throw error;
  }
};

const joinLobby = async (lobby_id) => {
  try {
    const response = await apiPost("/join-lobby", { lobby_id });
    return response;
  } catch (error) {
    console.error("Failed to join lobby", error);
    throw error;
  }
};

const leaveLobby = async (lobby_id) => {
  try {
    const response = await apiPost("/leave-lobby", { lobby_id });
    return response;
  } catch (error) {
    console.error("Failed to leave lobby", error);
    throw error;
  }
};

const finishLobby = async (lobby_id) => {
  try {
    const response = await apiPost("/finish-lobby", { lobby_id });
    return response;
  } catch (error) {
    console.error("Failed to finish lobby", error);
    throw error;
  }
};

const nextChallenge = async (lobby_id) => {
  try {
    const response = await apiPost("/next-challenge", { lobby_id });
    return response;
  } catch (error) {
    console.error("Failed to set next challenge", error);
    throw error;
  }
};

const getProgression = async () => {
  try {
    const response = await apiGet("/progressionstatus");
    return response;
  } catch (error) {
    console.error("Failed to get progression", error);
    throw error;
  }
};

export {
  createLobby,
  getLobby,
  joinLobby,
  leaveLobby,
  finishLobby,
  nextChallenge,
  getProgression,
};
