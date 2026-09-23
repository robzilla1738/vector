import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { join } from "node:path";

export default defineConfig({
  root: join(import.meta.dirname, "renderer"),
  base: "./",
  resolve: {
    // Emitted .js siblings must not shadow the TypeScript the typechecker ships.
    extensions: [".mjs", ".mts", ".ts", ".tsx", ".jsx", ".js", ".json"],
  },
  plugins: [react()],
  build: {
    outDir: join(import.meta.dirname, "dist", "renderer"),
    emptyOutDir: true,
    // scripts/check-budgets.mjs walks the manifest to measure startup bytes
    manifest: true,
  },
  server: {
    port: 5197,
    strictPort: true,
  },
});
