#!/usr/bin/env node
/**
 * `pnpm dev` starts the Aux desktop with Chromium-backed browsing.
 */
import { spawn, spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const procs = [];
const stop = () => procs.forEach((p) => p.kill());
process.on("SIGINT", () => { stop(); process.exit(0); });
process.on("SIGTERM", () => { stop(); process.exit(0); });

const tsc = join(root, "node_modules", ".bin", "tsc");
console.log("▸ build workspace (Electron hybrid)");
const b = spawnSync(tsc, ["-b", "tsconfig.json"], { cwd: root, stdio: "inherit" });
if (b.status !== 0) process.exit(b.status ?? 1);
// Desktop builds overwrite tsc output with self-contained entrypoints. Always
// regenerate them from source; incremental tsc may otherwise leave stale code,
// or emit a preload that cannot import workspace modules inside the sandbox.
const desktop = spawnSync(process.execPath, [join(root, "apps/desktop/bundle.mjs")], { cwd: root, stdio: "inherit" });
if (desktop.status !== 0) process.exit(desktop.status ?? 1);

console.log("▸ vite dev server :5197");
const vite = spawn(join(root, "apps/desktop/node_modules/.bin/vite"), ["--host", "127.0.0.1", "--strictPort"], {
  cwd: join(root, "apps/desktop"),
  stdio: ["ignore", "pipe", "pipe"],
});
procs.push(vite);
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Renderer startup timed out on port 5197.")), 30_000);
    const failed = (code) => { clearTimeout(timer); reject(new Error(`Renderer exited before startup (${code}). Check whether port 5197 is already in use.`)); };
    vite.once("exit", failed);
    vite.once("error", error => { clearTimeout(timer); reject(error); });
    let output = "";
    vite.stderr.on("data", chunk => process.stderr.write(chunk));
    vite.stdout.on("data", chunk => {
      process.stdout.write(chunk);
      output = (output + chunk.toString()).slice(-4096);
      if (output.includes("http://127.0.0.1:5197/")) {
        clearTimeout(timer); vite.off("exit", failed); resolve();
      }
    });
  });
} catch (error) {
  console.error(`Aux could not start: ${error.message}`);
  stop(); process.exit(1);
}
vite.on("exit", code => { stop(); process.exit(code || 1); });

console.log("▸ Aux desktop");
const electronBin = join(root, "apps/desktop/node_modules/.bin/electron");
const { ELECTRON_RUN_AS_NODE: _drop, ...parentEnv } = process.env;
const app = spawn(electronBin, [".", ...process.argv.slice(2).filter(arg => arg === "--use-mock-keychain")], {
  cwd: join(root, "apps/desktop"),
  stdio: "inherit",
  env: { ...parentEnv, VITE_DEV_SERVER_URL: "http://127.0.0.1:5197" },
});
procs.push(app);
app.on("error", error => { console.error(`Aux could not start: ${error.message}`); stop(); process.exit(1); });
app.on("exit", (code) => {
  stop();
  process.exit(code ?? 0);
});
