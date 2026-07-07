// src/store/auth.store.ts
import { create } from "zustand";
import { User } from "../types/user";
import axios from "axios";
import { API_BASE_URL } from "../lib/config";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  login: (idToken: string) => Promise<User>;
  register: (idToken: string) => Promise<User>;
  logout: () => void;
  fetchCurrentUser: () => Promise<User | null>;
  setToken: (token: string | null) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  initialized: false,

  setToken: (token) => set({ token }),
  setInitialized: (initialized) => set({ initialized }),

  login: async (idToken: string) => {
    set({ loading: true });
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { idToken });
      const { user, token } = res.data.data;
      set({ user, token, loading: false });
      return user;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  register: async (idToken: string) => {
    set({ loading: true });
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, { idToken });
      const { user } = res.data.data;
      set({ user, token: idToken, loading: false });
      return user;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    set({ user: null, token: null });
  },

  fetchCurrentUser: async () => {
    const token = get().token;
    if (!token) return null;

    set({ loading: true });
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = res.data.data;
      set({ user, loading: false });
      return user;
    } catch (err) {
      console.error("Failed to fetch current user profile:", err);
      set({ user: null, token: null, loading: false });
      return null;
    }
  },
}));
export default useAuthStore;
