import { defineConfig } from "vitest/config";
import { join } from "node:path";

const resolve = {
  // renderer tests import contract types from source so they run without a build
  alias: [
    { find: /^@aux\/contracts\/(.+)$/, replacement: join(import.meta.dirname, "packages/contracts/src/$1.ts") },
    { find: /^@aux\/contracts$/, replacement: join(import.meta.dirname, "packages/contracts/src/index.ts") },
  ],
};

export default defineConfig({
 cacheDir:"/tmp/l10-task-receipt-edit-cache",
  resolve,
  esbuild: { jsx: "automatic" },
  test: {
    pool: "forks",
    projects: [
      {
        resolve,
        esbuild: { jsx: "automatic" },
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts", "apps/shell/src/**/*.test.{ts,tsx}"],
          pool: "forks",
          testTimeout: 30_000,
          hookTimeout: 30_000,
        },
      },
      {
        resolve,
        esbuild: { jsx: "automatic" },
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          pool: "forks",
          testTimeout: 120_000,
          hookTimeout: 90_000,
          // fixtures + standalone chrome are per-file — run files serially to keep ports sane
          fileParallelism: false,
        },
      },
    ],
  },
});
