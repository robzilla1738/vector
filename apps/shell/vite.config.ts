import { realpathSync } from "node:fs";
import { contractSchemaPurityPlugin } from "../../scripts/contract-schema-purity.mjs";
import { preloadPathPrefix } from "../../scripts/preload-path-prefix.mjs";
import { reactNamedValueAliases } from "../../scripts/react-named-value-aliases.mjs";
import { reactConstructorAliases } from "../../scripts/react-constructor-aliases.mjs";
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
  process.env.AUX_CHROMIUM_SHELL_BUILD === "1"
    ? "script-src 'self' chrome://resources"
    : "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https: http:",
  "font-src 'self' data:",
  "media-src 'self' data: blob:",
  // search suggestions and cloud terminal sessions
  "connect-src 'self' https: wss:",
  // Chromium's SurfaceEmbed plugin has no src. Keep objects disabled in Electron.
  process.env.AUX_CHROMIUM_SHELL_BUILD === "1" ? "object-src 'self'" : "object-src 'none'",
  "frame-src aux-result:",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

const shellCsp = (): Plugin => ({
  name: "aux-shell-csp",
  apply: "build",
  transformIndexHtml: () => [{ tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: SHELL_CSP }, injectTo: "head-prepend" }],
});

const chromiumHostBootstrap = (): Plugin => ({
  name: "aux-chromium-host-bootstrap",
  apply: "build",
  transformIndexHtml: () => process.env.AUX_CHROMIUM_SHELL_BUILD === "1"
    ? [{ tag: "script", attrs: { type: "module", src: "/aux_host_bootstrap.js" }, injectTo: "head-prepend" }]
    : [],
});

/**
 * main.tsx imports App dynamically so a failed chunk still shows a recoverable
 * boot screen. Preload App and its static imports from the document so they
 * download beside the entry instead of after it runs.
 */
const preloadApp = (): Plugin => ({
  name: "aux-preload-app",
  apply: "build",
  transformIndexHtml: {
    order: "post",
    handler: (_html, ctx) => {
      const chunks = Object.values(ctx.bundle ?? {}).filter(item => item.type === "chunk");
      const app = chunks.find(chunk => chunk.moduleIds.some(id => id.endsWith("/src/App.tsx")));
      if (!app) return [];
      const entries = new Set(chunks.filter(chunk => chunk.isEntry).map(chunk => chunk.fileName));
      return [app.fileName, ...app.imports.filter(file => !entries.has(file))].map(file => ({ tag: "link", attrs: { rel: "modulepreload", crossorigin: true, href: `/${file}` }, injectTo: "head" as const }));
    },
  },
});

export default defineConfig({
  root: import.meta.dirname,
  base: "/",
  resolve: {
    // Emitted .js siblings must not shadow the TypeScript the typechecker ships.
    extensions: [".mjs", ".mts", ".ts", ".tsx", ".jsx", ".js", ".json"],
  },
  plugins: [preloadPathPrefix(), reactConstructorAliases(), reactNamedValueAliases(join(import.meta.dirname, "src")), react(), chromiumHostBootstrap(), shellCsp(), preloadApp(), contractSchemaPurityPlugin(realpathSync(join(import.meta.dirname, "../../packages/contracts/dist")))],
  build: {
    outDir: join(import.meta.dirname, "dist"),
    emptyOutDir: true,
    // Match the packaged browser. Electron preview still targets its Chromium 150.
    target: process.env.AUX_CHROMIUM_SHELL_BUILD === "1" ? "chrome154" : "chrome150",
    // scripts/check-budgets.mjs walks the manifest to measure startup bytes
    manifest: true,
    rollupOptions: { output: { chunkFileNames: chunk => ["App", "MockPage", "xterm"].includes(chunk.name) ? "assets/[name]-[hash].js" : "assets/[hash].js" } },
  },
  server: {
    port: 5197,
    strictPort: true,
  },
});
