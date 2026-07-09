import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images (e.g. Supabase storage, user avatars)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  // Env vars available at build time (set real values in Netlify/Vercel UI)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;

