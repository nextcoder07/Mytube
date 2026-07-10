// src/lib/api.ts
import axios from "axios";
import auth from "./firebase";
import { useAuthStore } from "../store/auth.store";
import { API_BASE_URL } from "./config";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically inject a fresh Firebase ID token from the client.
// If Firebase is available client-side, use the current authenticated user's token.
api.interceptors.request.use(
  async (config) => {
    let token = useAuthStore.getState().token;
    if (typeof window !== "undefined" && auth.currentUser) {
      try {
        token = await auth.currentUser.getIdToken(true);
        useAuthStore.getState().setToken(token);
      } catch (err) {
        console.warn("Failed to refresh Firebase token for API request:", err);
      }
    }
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
