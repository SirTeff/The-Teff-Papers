import type { NextConfig } from "next";
import path from "node:path";
import { assertMarginEnvironmentReady } from "./src/lib/config/margin-environment";

assertMarginEnvironmentReady(process.env);

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd()),
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/studio/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
