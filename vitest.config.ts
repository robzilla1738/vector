import { defineConfig } from "vitest/config";
import { join } from "node:path";

export default defineConfig({
  resolve: {
    // renderer tests import contract types from source so they run without a build
    alias: { "@vector/contracts": join(import.meta.dirname, "packages/contracts/src/index.ts") },
  },
  esbuild: { jsx: "automatic" },
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts", "apps/desktop/renderer/src/**/*.test.{ts,tsx}"],
    testTimeout: 120_000,
    hookTimeout: 90_000,
    pool: "forks",
    // fixtures + standalone chrome are per-file — run files serially to keep ports sane
    fileParallelism: false,
  },
});
