import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose", "mongoose-field-encryption"],
};

export default nextConfig;
