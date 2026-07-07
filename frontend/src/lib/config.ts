export const DEFAULT_API_BASE_URL = "https://mytube-backend-7icy.onrender.com/api";

// During local development, prefer the local backend if no NEXT_PUBLIC_API_URL is provided.
const DEV_LOCAL_BASE = "http://localhost:4000/api";

export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
	(process.env.NODE_ENV === "development" ? DEV_LOCAL_BASE : DEFAULT_API_BASE_URL);
