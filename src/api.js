import axios from "axios";

const DEFAULT_API_URL = "http://localhost:3002";

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
