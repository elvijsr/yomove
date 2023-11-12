import { apiGet } from "../utils/api";

const fetchScores = async () => {
  try {
    const response = await apiGet("/getallscores");
    return response;
  } catch (error) {
    console.error("Failed to fetch scores", error);
    throw error;
  }
};

export { fetchScores };
