import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: 'dist',
  trailingSlash: true,
  output: 'export',
  images: {
    unoptimized: true
  },
  env: {
    CANISTER_ID_BACKEND: process.env.CANISTER_ID_BACKEND || 'uxrrr-q7777-77774-qaaaq-cai',
    CANISTER_ID_INTERNET_IDENTITY: process.env.CANISTER_ID_INTERNET_IDENTITY || 'uzt4z-lp777-77774-qaabq-cai',
  }
};

export default nextConfig;
