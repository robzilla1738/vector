import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { join } from "node:path";

/**
 * The shell holds the privileged `aux` bridge and renders model- and
 * page-derived markdown, so the packaged document gets a strict CSP. Dev
 * builds skip it: the Vite client and React Refresh need inline script.
 */
const SHELL_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https: http:",
  "font-src 'self' data:",
  "media-src 'self' data: blob:",
  // search suggestions and cloud terminal sessions
  "connect-src 'self' https: wss:",
  "object-src 'none'",
  "frame-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

const shellCsp = (): Plugin => ({
  name: "aux-shell-csp",
  apply: "build",
  transformIndexHtml: () => [{ tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: SHELL_CSP }, injectTo: "head-prepend" }],
});

export default defineConfig({
  root: join(import.meta.dirname, "renderer"),
  base: "./",
  resolve: {
    // Emitted .js siblings must not shadow the TypeScript the typechecker ships.
    extensions: [".mjs", ".mts", ".ts", ".tsx", ".jsx", ".js", ".json"],
  },
  plugins: [react(), shellCsp()],
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
