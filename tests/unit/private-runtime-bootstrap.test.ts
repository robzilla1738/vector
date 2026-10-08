import { fork } from "node:child_process";
import { randomUUID } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer, type Socket } from "node:net";
import { join } from "node:path";
import { expect, it } from "vitest";
import { RpcChannel, memoryTransportPair } from "@aux/contracts";
import { HostMethods } from "@aux/contracts/host-methods";
import { AUX_DATABASE_NAME } from "@aux/contracts/installation";
import { openDb, Repo, SettingsService, BudgetsService } from "@aux/runtime";
import { NullNativeBridge } from "../../apps/runtime/dist/native.js";
import { registerPrivateProviderBroker } from "../../apps/runtime/dist/services/private-provider.js";
import { PrivateBudgetOwner } from "../../apps/runtime/dist/services/private-budget.js";
import { CloudSettingsService } from "../../apps/runtime/dist/services/cloud-settings.js";

// The native SupportsPrivateMethod filter: exercise the real advertised private
// surface, including its intentionally absent protected persistent storage.
const denied = new Set([
  "bookmarksInvoke",
  "onBookmarksChanged",
  "organizationSnapshot",
  "organizationCommit",
  "native.spaceBindingsSet",
  "native.bookmarksInvoke",
  "native.historyClear",
  "native.historyImport",
  "native.historyRemove",
  "native.captureReadablePage",
  "native.organizationSnapshot",
  "native.liveFolderSources",
  "native.fillSavedPassword",
  "native.setCookies",
  "native.profileStorageRoot",
  "native.profileStorageFactor",
  "native.recoveryOwnerAuth",
]);
const methods = Object.keys(HostMethods).filter(
  (name) =>
    !denied.has(name) &&
    !["native.foundationModels", "native.browserImport", "native.recorder", "native.credential"].some(
      (prefix) => name.startsWith(prefix),
    ),
);

it("starts the actual private runtime through ready with the original Gateway broker and native private capabilities", async () => {
  const directory = mkdtempSync("/tmp/aux-private-bootstrap-");
  chmodSync(directory, 0o700);
  const originalDirectory = join(directory, "original", "Aux Runtime Data");
  mkdirSync(originalDirectory, { recursive: true });
  const settingsPath = join(originalDirectory, "settings.json");
  writeFileSync(settingsPath, JSON.stringify({ budgets: { dayUsd: 3, monthUsd: 20 } }));
  const db = openDb(":memory:"),
    repo = new Repo(db);
  const settings = new SettingsService(repo, settingsPath, { AI_GATEWAY_API_KEY: "synthetic-bootstrap-key" });
  const budgets = new BudgetsService(db, () => settings.budgetLimits(), {
    root: (id) => id,
    descendants: () => [],
    runLimitUsd: () => undefined,
  });
  const owner = new PrivateBudgetOwner(repo, budgets);
  const cloud = new CloudSettingsService(repo, new NullNativeBridge());
  const [ownerTransport, nativeTransport] = memoryTransportPair();
  const ownerChannel = new RpcChannel(ownerTransport),
    nativeChannel = new RpcChannel(nativeTransport);
  const stopBroker = registerPrivateProviderBroker(ownerChannel, {
    current: () => true,
    revision: () => settings.privateProviderRevision(),
    subscribe: (changed) => settings.subscribeConnectionChanges(changed),
    request: (request) => settings.privateProviderRequest(request),
    cloudRequest: (request) => cloud.privateRequest(request),
    budgetRequest: (id, request) => owner.request(id, request),
  });
  const sessionId = randomUUID(),
    token = "a".repeat(64),
    socketPath = join(directory, "host.sock");
  const phases: string[] = [],
    requests: unknown[] = [];
  const sockets = new Set<Socket>();
  const server = createServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.setEncoding("utf8");
    let buffer = "";
    socket.on("data", (chunk: string) => {
      buffer += chunk;
      for (let end = buffer.indexOf("\n"); end >= 0; end = buffer.indexOf("\n")) {
        const frame = JSON.parse(buffer.slice(0, end));
        buffer = buffer.slice(end + 1);
        if (frame.kind === "hello") {
          if (frame.token !== token) {
            socket.destroy();
            return;
          }
          socket.write(
            JSON.stringify({
              kind: "hello-ack",
              protocol: frame.protocol,
              nonce: frame.nonce,
              generation: frame.generation,
            }) + "\n",
          );
          continue;
        }
        if (frame.kind === "note" && frame.type === "startupPhase") phases.push(frame.payload.phase);
        if (frame.kind !== "req") continue;
        void (async () => {
          let result: unknown;
          switch (frame.method) {
            case "native.capabilities":
              result = {
                buildId: "fixture",
                sourceCommit: "a".repeat(40),
                methods,
                privateSession: { id: sessionId },
              };
              break;
            case "native.privateProvider":
              requests.push(frame.params);
              result = await nativeChannel.call("provider.private", { sessionId, request: frame.params });
              break;
            case "native.readSecret":
              result = {};
              break;
            case "native.listPages":
              result = { pages: [] };
              break;
            case "native.cdpReset":
              result = { reset: true };
              break;
            default:
              socket.write(
                JSON.stringify({
                  kind: "res",
                  id: frame.id,
                  error: {
                    code: "backend_unavailable",
                    message: "Native method unavailable in bootstrap fixture",
                  },
                }) + "\n",
              );
              return;
          }
          socket.write(JSON.stringify({ kind: "res", id: frame.id, result }) + "\n");
        })().catch(() =>
          socket.write(
            JSON.stringify({
              kind: "res",
              id: frame.id,
              error: { code: "backend_unavailable", message: "Synthetic original broker failed" },
            }) + "\n",
          ),
        );
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(socketPath, resolve));
  const script = join(directory, "bootstrap.mjs");
  writeFileSync(
    script,
    `
    import { startRuntime } from ${JSON.stringify(new URL("../../apps/runtime/dist/main.js", import.meta.url).href)};
    try {
      const runtime = await startRuntime();
      process.send({ ready: true });
      process.on("message", async () => { await runtime.close(); process.exit(0); });
    } catch (error) { process.send({ failed: error.message }); process.exit(1); }
  `,
  );
  const child = fork(script, [], {
    cwd: directory,
    execArgv: [],
    stdio: ["ignore", "ignore", "ignore", "ipc"],
    env: {
      AUX_DATA_DIR: join(directory, "Aux Runtime Data"),
      AUX_API_PORT: "0",
      AUX_LOAD_DOTENV: "0",
      AUX_PRIVATE_SESSION: sessionId,
      AUX_BROWSER_PROFILE_ID: `private:${sessionId}`,
      AUX_HOST_SOCKET: socketPath,
      AUX_HOST_TOKEN: token,
      AUX_HOST_GENERATION: "1",
      AUX_PRIVATE_SETTINGS_PATH: settingsPath,
    },
  });
  let startupDeadline: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await new Promise<unknown>((resolve, reject) => {
      startupDeadline = setTimeout(
        () => reject(new Error("Synthetic private runtime did not finish startup")),
        20_000,
      );
      child.once("message", resolve);
      child.once("error", reject);
      child.once("exit", (code) =>
        reject(new Error(`Synthetic private runtime exited ${code}; stages: ${phases.join(", ")}`)),
      );
    });
    clearTimeout(startupDeadline);
    expect(result, `Observed startup stages: ${phases.join(", ")}`).toEqual({ ready: true });
    expect(phases).toEqual(["connected", "proof", "settings", "services", "ready"]);
    expect(requests).toEqual([
      { operation: "describe" },
      { operation: "cloud", cloud: { operation: "describe" } },
      { operation: "budget", budget: { operation: "status" } },
    ]);
    expect(db.prepare("SELECT * FROM private_spend").all()).toEqual([]);
    expect(existsSync(join(directory, "Aux Runtime Data", AUX_DATABASE_NAME))).toBe(false);
    const exited = new Promise<number | null>((resolve) => child.once("exit", resolve));
    child.send("close");
    expect(await exited).toBe(0);
  } finally {
    clearTimeout(startupDeadline);
    if (child.exitCode === null && child.signalCode === null) {
      const exited = new Promise<void>((resolve) => child.once("exit", () => resolve()));
      child.kill();
      await exited;
    }
    for (const socket of sockets) socket.destroy();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    stopBroker();
    await cloud.close();
    owner.close();
    await settings.close();
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
