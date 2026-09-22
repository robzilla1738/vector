import { defineConfig } from "vitest/config";
import { join } from "node:path";

/** Renderer unit + component tests. Run via `pnpm -C apps/desktop test` or the root `pnpm test:unit`. */
export default defineConfig({
  resolve: {
    alias: [
      { find: /^@aux\/contracts\/(.+)$/, replacement: join(import.meta.dirname, "../../packages/contracts/src/$1.ts") },
      { find: /^@aux\/contracts$/, replacement: join(import.meta.dirname, "../../packages/contracts/src/index.ts") },
    ],
  },
  esbuild: { jsx: "automatic" },
  test: {
    include: ["renderer/src/**/*.test.{ts,tsx}"],
    environment: "node",
  },
});
