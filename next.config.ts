import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverActions: {
    bodySizeLimit: "50mb",
  },
};

export default nextConfig;
