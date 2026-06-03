// utils/api.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: "http://10.0.1.51:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Aggiunge automaticamente il token ad ogni richiesta
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;