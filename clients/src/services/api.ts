import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: async (username: string, password: string) => {
    const response = await api.post("/auth/register", { username, password });
    return response.data;
  },
  login: async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

export const gameApi = {
  getGame: async (gameId: string) => {
    const response = await api.get(`/game/${gameId}`);
    return response.data;
  },
  getMyActiveGame: async () => {
    const response = await api.get("/game/active/me");
    return response.data;
  },
};

export const leaderboardApi = {
  getLeaderboard: async (limit: number = 100) => {
    const response = await api.get(`/leaderboard?limit=${limit}`);
    return response.data;
  },
  getPlayerStats: async (playerId: string) => {
    const response = await api.get(`/leaderboard/player/${playerId}`);
    return response.data;
  },
  getTopPlayers: async (limit: number = 10) => {
    const response = await api.get(`/leaderboard/top?limit=${limit}`);
    return response.data;
  },
  getBestStreaks: async (limit: number = 10) => {
    const response = await api.get(`/leaderboard/streaks?limit=${limit}`);
    return response.data;
  },
};

export default api;



