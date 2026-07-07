export const DEFAULT_API_BASE_URL = "https://mytube-backend-7icy.onrender.com/api";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || DEFAULT_API_BASE_URL;
