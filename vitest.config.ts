import { defineConfig } from "vitest/config";
import { join } from "node:path";
import { availableParallelism } from "node:os";

const unitWorkers = Math.min(10, availableParallelism());

const resolve = {
  // renderer tests import contract types from source so they run without a build
  alias: [
    {
      find: /^@aux\/contracts\/(.+)$/,
      replacement: join(import.meta.dirname, "packages/contracts/src/$1.ts"),
    },
    { find: /^@aux\/contracts$/, replacement: join(import.meta.dirname, "packages/contracts/src/index.ts") },
  ],
};

export default defineConfig({
  // Isolate optimized editable contracts even when worktrees share dependencies.
  cacheDir: join(import.meta.dirname, "node_modules/.aux-vitest"),
  resolve,
  esbuild: { jsx: "automatic" },
  test: {
    // Recycle isolated worker threads instead of starting one Node process per file.
    pool: "threads",
    maxWorkers: unitWorkers,
    minWorkers: unitWorkers,
    // Browser tests must use jsdom storage, not Node's unrelated experimental
    // global, which is unavailable without a filesystem-backed storage flag.
    poolOptions: { threads: { isolate: true, execArgv: ["--no-experimental-webstorage"] } },
    projects: [
      {
        cacheDir: join(import.meta.dirname, "node_modules/.aux-vitest/unit"),
        resolve,
        esbuild: { jsx: "automatic" },
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts", "apps/shell/src/**/*.test.{ts,tsx}"],
          pool: "threads",
          deps: {
            optimizer: {
              // Contracts resolve to editable source. Rebuild once per run, then
              // share the bundled graph across isolated workers without stale schemas.
              web: { enabled: true, include: ["@aux/contracts", "zod"], force: true },
              ssr: { enabled: true, include: ["@aux/contracts", "zod"], force: true },
            },
          },
          testTimeout: 30_000,
          hookTimeout: 30_000,
        },
      },
      {
        cacheDir: join(import.meta.dirname, "node_modules/.aux-vitest/integration"),
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
