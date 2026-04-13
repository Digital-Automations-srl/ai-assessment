import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/send-report": ["./src/assets/**/*"],
  },
};

export default nextConfig;
