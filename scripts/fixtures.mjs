#!/usr/bin/env node
/** Start the three fixture servers. Used by dev.mjs and tests. */
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export const FIXTURES = [
  { name: "records-app", script: "fixtures/records-app/serve.ts", port: 4810 },
  { name: "forms-app", script: "fixtures/forms-app/serve.ts", port: 4811 },
  { name: "interaction-lab", script: "fixtures/interaction-lab/serve.ts", port: 4812 },
];

async function listening(url) {
  try {
    await fetch(url);
    return true;
  } catch {
    return false;
  }
}

/** Skip spawning a fixture whose port is already serving (avoids EADDRINUSE noise). */
export async function startFixturesIfNeeded(env = {}) {
  const procs = [];
  for (const f of FIXTURES) {
    if (await listening(`http://127.0.0.1:${f.port}/`)) continue;
    procs.push(spawnOne(f, env));
  }
  return procs;
}

function spawnOne(f, env = {}) {
  const proc = spawn(process.execPath, [join(root, f.script)], {
    env: { ...process.env, PORT: String(f.port), ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  proc.stdout.on("data", (d) => process.stdout.write(`[${f.name}] ${d}`));
  proc.stderr.on("data", (d) => process.stderr.write(`[${f.name}!] ${d}`));
  return proc;
}

export function startFixtures(env = {}) {
  return FIXTURES.map((f) => {
    const proc = spawn(process.execPath, [join(root, f.script)], {
      env: { ...process.env, PORT: String(f.port), ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    proc.stdout.on("data", (d) => process.stdout.write(`[${f.name}] ${d}`));
    proc.stderr.on("data", (d) => process.stderr.write(`[${f.name}!] ${d}`));
    return proc;
  });
}

export async function waitForFixtures(timeoutMs = 10_000) {
  const deadline = Date.now() + timeoutMs;
  for (const f of FIXTURES) {
    const url = `http://127.0.0.1:${f.port}/`;
    for (;;) {
      try {
        await fetch(url); // any status means the port is listening
        break;
      } catch {
        /* not up yet */
      }
      if (Date.now() > deadline) throw new Error(`${f.name} did not start on :${f.port}`);
      await new Promise((r) => setTimeout(r, 150));
    }
  }
}

const isMain = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const procs = await startFixturesIfNeeded();
  await waitForFixtures();
  console.log("fixtures up:", FIXTURES.map((f) => `http://127.0.0.1:${f.port}`).join("  "));
  const stop = () => procs.forEach((p) => p.kill());
  process.on("SIGINT", () => { stop(); process.exit(0); });
  process.on("SIGTERM", () => { stop(); process.exit(0); });
}
