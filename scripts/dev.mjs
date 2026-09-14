#!/usr/bin/env node
/**
 * `pnpm dev` — build everything, start fixtures, start the Vite dev server,
 * launch Electron against it. Set VECTOR_NO_FIXTURES=1 to skip fixtures.
 */
import { spawn, spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { startFixturesIfNeeded, waitForFixtures } from "./fixtures.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tsc = join(root, "node_modules", ".bin", "tsc");

console.log("▸ build workspace");
const b = spawnSync(tsc, ["-b", "tsconfig.json"], { cwd: root, stdio: "inherit" });
if (b.status !== 0) process.exit(b.status ?? 1);

const procs = [];
const stop = () => procs.forEach((p) => p.kill());
process.on("SIGINT", () => { stop(); process.exit(0); });
process.on("SIGTERM", () => { stop(); process.exit(0); });

if (process.env.VECTOR_NO_FIXTURES !== "1") {
  procs.push(...(await startFixturesIfNeeded()));
  await waitForFixtures();
  console.log("▸ fixtures up on :4810 :4811 :4812");
}

console.log("▸ vite dev server :5197");
const vite = spawn(join(root, "apps/desktop/node_modules/.bin/vite"), ["--host", "127.0.0.1", "--strictPort"], {
  cwd: join(root, "apps/desktop"),
  stdio: "inherit",
});
procs.push(vite);
await new Promise((r) => setTimeout(r, 1500));

console.log("▸ electron");
const electronBin = join(root, "apps/desktop/node_modules/.bin/electron");
// ELECTRON_RUN_AS_NODE makes the Electron binary boot as plain Node — it must
// never reach the desktop process (it's only set, deliberately, for the
// forked runtime child inside the app).
const { ELECTRON_RUN_AS_NODE: _drop, ...parentEnv } = process.env;
const app = spawn(electronBin, ["."], {
  cwd: join(root, "apps/desktop"),
  stdio: "inherit",
  env: { ...parentEnv, VITE_DEV_SERVER_URL: "http://127.0.0.1:5197" },
});
procs.push(app);
app.on("exit", (code) => {
  stop();
  process.exit(code ?? 0);
});
