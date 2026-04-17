import axios from "axios";

const DEFAULT_API_URL = "https://real-time-fintech-trading-engine-backend-5ao3.onrender.com";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || DEFAULT_API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
