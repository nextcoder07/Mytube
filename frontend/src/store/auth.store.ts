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
  user: typeof window !== 'undefined' && localStorage.getItem('mt_user') ? JSON.parse(localStorage.getItem('mt_user') || 'null') : null,
  token: typeof window !== 'undefined' ? (localStorage.getItem('mt_token') || null) : null,
  loading: false,
  initialized: false,

  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('mt_token', token);
      else localStorage.removeItem('mt_token');
    }
    set({ token });
  },
  setInitialized: (initialized) => set({ initialized }),

  login: async (idToken: string) => {
    set({ loading: true });
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { idToken });
      const { user, token } = res.data.data;
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('mt_user', JSON.stringify(user)); } catch {}
        localStorage.setItem('mt_token', token);
      }
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
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('mt_user', JSON.stringify(user)); } catch {}
        localStorage.setItem('mt_token', idToken);
      }
      set({ user, token: idToken, loading: false });
      return user;
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mt_user');
      localStorage.removeItem('mt_token');
    }
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
