import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    testTimeout: 120_000,
    hookTimeout: 90_000,
    pool: "forks",
    // fixtures + standalone chrome are per-file — run files serially to keep ports sane
    fileParallelism: false,
  },
});
