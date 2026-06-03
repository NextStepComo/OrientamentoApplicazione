// utils/api.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const api = axios.create({
  baseURL: "http://10.0.1.51:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        try {
          const refreshToken = await SecureStore.getItemAsync("refresh_token");
          const response = await axios.post("http://10.0.1.51:8000/refresh", {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`
            }
          });
          const { access_token, refresh_token } = response.data;
          await SecureStore.setItemAsync("token", access_token);
          if (refresh_token) {
            await SecureStore.setItemAsync("refresh_token", refresh_token);
          }          
          original.headers.Authorization = `Bearer ${access_token}`;
          return api(original);
        } catch {
          await SecureStore.deleteItemAsync("token");
          await SecureStore.deleteItemAsync("refresh_token");
        }
      }
      return Promise.reject(error);
    }
  );
  
  export default api;