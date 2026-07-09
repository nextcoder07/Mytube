// src/config/index.ts
import dotenv from "dotenv";
import path from "path";

// Try loading from multiple possible locations
const possiblePaths = [
  path.resolve(process.cwd(), ".env"), // Current working directory
  path.resolve(__dirname, "../.env"), // Relative to src/config
  path.resolve(__dirname, "../../.env"), // Relative to backend root
];

let loaded = false;
for (const envPath of possiblePaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log(`[Config] Loaded .env from: ${envPath}`);
    loaded = true;
    break;
  }
}

if (!loaded) {
  console.warn("[Config] Warning: .env file not found. Using environment variables or defaults.");
}

export const config = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  // Firebase
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "your-firebase-project-id",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || "service-account@your-project.iam.gserviceaccount.com",
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "YOUR_PRIVATE_KEY",
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL || "https://your-supabase-url.supabase.co",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "your-supabase-service-role-key",
  // Redis
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  // JWT
  jwtSecret: process.env.JWT_SECRET || "your-jwt-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  // AI Provider
  aiProvider: process.env.AI_PROVIDER || "gemini",
  geminiApiKey: process.env.GEMINI_API_KEY || "your-gemini-api-key",
  openrouterApiKey: process.env.OPENROUTER_API_KEY || "your-openrouter-api-key",
  openrouterModel: process.env.OPENROUTER_MODEL || "openai/gpt-4o",
  // Google Custom Search Engine (optional, for website provider)
  googleCseApiKey: process.env.GOOGLE_CSE_API_KEY || "",
  googleCseCx: process.env.GOOGLE_CSE_CX || "",
};

export default config;
