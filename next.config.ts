import type { NextConfig } from "next";
import path from "node:path";
import { assertMarginEnvironmentReady } from "./src/lib/config/margin-environment";

assertMarginEnvironmentReady(process.env);

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd()),
};

export default nextConfig;
