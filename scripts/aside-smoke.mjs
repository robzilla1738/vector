#!/usr/bin/env node
/**
 * Boots the staged Aux Daemon.app on a throwaway home and port, then proves the contract the
 * browser relies on: health, challenge/session auth as the Chromium client, authenticated
 * tRPC, and the sidebar feed.
 *
 *   node scripts/aside-smoke.mjs [--staged <dir>]
 */
import { spawn } from "node:child_process";
import { createPrivateKey, randomInt, sign } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const staged = process.argv.includes("--staged")
  ? resolve(process.argv[process.argv.indexOf("--staged") + 1])
  : join(root, "out/aside-staged");
const home = mkdtempSync(join(tmpdir(), "aux-smoke-"));
const port = 22000 + randomInt(900);
const base = `http://127.0.0.1:${port}`;

const child = spawn(join(staged, "Aux Daemon.app/Contents/MacOS/aux-daemon"), [], {
  env: { ...process.env, ASIDE_HOME: home, ASIDE_PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});
let log = "";
child.stdout.on("data", (chunk) => (log += chunk));
child.stderr.on("data", (chunk) => (log += chunk));

async function until(check, label) {
  const deadline = Date.now() + 30_000;
  for (;;) {
    try {
      const value = await check();
      if (value) return value;
    } catch {
      /* retry */
    }
    if (Date.now() > deadline) throw new Error(`Timed out: ${label}`);
    await new Promise((done) => setTimeout(done, 250));
  }
}

async function main() {
  const health = await until(
    async () => (await fetch(`${base}/health`)).json().then((body) => body.ready && body),
    "daemon readiness",
  );
  console.log(`health ok · ${health.service} ${health.version}`);

  const pem = readFileSync(join(home, "install/sig.pem"));
  const challenge = await (await fetch(`${base}/auth/daemon/challenge?clientKind=chromium`)).json();
  const signingInput = Buffer.concat([
    Buffer.from("Aside Daemon Auth v1\0"),
    Buffer.from(challenge.challenge, "base64"),
  ]);
  const signedChallenge = sign("sha256", signingInput, createPrivateKey(pem)).toString("base64");
  const session = await (
    await fetch(`${base}/auth/daemon/session`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ challengeId: challenge.challengeId, signedChallenge }),
    })
  ).json();
  if (session.token_type !== "AsideDaemonSessionToken") {
    throw new Error(`Daemon refused the installation signature: ${JSON.stringify(session)}`);
  }
  console.log("auth ok · session token issued");

  const headers = { authorization: `AsideDaemonSessionToken ${session.access_token}` };
  const chats = await fetch(`${base}/session/for-chrome/chats`, { headers });
  if (!chats.ok) throw new Error(`Sidebar feed failed: ${chats.status}`);
  console.log("sidebar feed ok");

  const unauthenticated = await fetch(`${base}/session/for-chrome/chats`);
  if (unauthenticated.status !== 401) throw new Error("Daemon served an unauthenticated request");
  console.log("unauthenticated request rejected");

  const bridge = `http://127.0.0.1:${port + 2}/account/sign`;
  const shimRequest = (origin) =>
    fetch(bridge, {
      method: "POST",
      headers: { "content-type": "application/json", "x-aux-bridge": "1", origin },
      body: JSON.stringify({ challenge: challenge.challenge }),
    });
  const viaExtension = await shimRequest("chrome-extension://fjdhphbdlfjogobdofoaagnlnkoibdge");
  if (!viaExtension.ok || typeof (await viaExtension.json()).signedChallenge !== "string") throw new Error("Extension bridge did not sign");
  if ((await shimRequest("https://example.com")).status !== 403) throw new Error("Bridge served a web origin");
  console.log("extension bridge ok · web origin refused");
}

try {
  await main();
  console.log("smoke passed");
} catch (error) {
  console.error(`smoke failed: ${error.message}\n--- daemon log ---\n${log.slice(-3000)}`);
  process.exitCode = 1;
} finally {
  child.kill("SIGTERM");
  rmSync(home, { recursive: true, force: true });
}
