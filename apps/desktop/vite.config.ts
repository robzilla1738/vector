import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { join } from "node:path";

export default defineConfig({
  root: join(import.meta.dirname, "renderer"),
  base: "./",
  plugins: [react()],
  build: {
    outDir: join(import.meta.dirname, "dist", "renderer"),
    emptyOutDir: true,
  },
  server: {
    port: 5197,
    strictPort: true,
  },
});
