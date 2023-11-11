const BASE_URL = "https://yomove.xyz/api"; // Replace with your actual base URL
//const BASE_URL = "http://127.0.0.1:56579";

const getHeaders = () => {
  const username = localStorage.getItem("username");
  // if (!username) {
  //   throw new Error("Username not found in localStorage");
  // }

  return {
    "Content-Type": "application/json",
    "X-Username": username,
  };
};

const fetchWithUsername = async (
  endpoint,
  method,
  data = null,
  customHeaders = {}
) => {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { ...getHeaders(), ...customHeaders };

  const config = {
    method,
    headers,
    body: method !== "GET" ? JSON.stringify(data) : undefined,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(errorBody.error);
  }

  return response.json();
};

export const apiGet = (endpoint, headers) =>
  fetchWithUsername(endpoint, "GET", null, headers);
export const apiPost = (endpoint, data, headers) =>
  fetchWithUsername(endpoint, "POST", data, headers);
