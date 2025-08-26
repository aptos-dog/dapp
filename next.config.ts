import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["i.postimg.cc"], // ✅ allow your external PNG host
  },
};

export default nextConfig;
