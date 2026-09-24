import { RpcChannel, type Transport } from "@aux/contracts";
import type { ChildProcess } from "node:child_process";
import { chmodSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CDP_PORT_FILE, DATA_DIR, PRIMARY_WINDOW_ID, USE_INTERNAL_CDP, log } from "../app/bootstrap.js";
import { exitApproved } from "../app/exit.js";
import { flushExternalUrls } from "../app/external-urls.js";
import { browserProfiles, registry } from "../app/services.js";
import { profileSession } from "../native-views.js";
import { spawnRuntime } from "../runtime-proc.js";
import { pausedAgent, scheduleIdleFreeze, wakePage } from "../tabs/lifecycle-controller.js";
import { runtimeLiveTabs, runtimeTabWindow } from "../tabs/publish.js";
import { pageWindowOwners, regularWindows } from "../windows/registry.js";
import { waitForCdpPort } from "./cdp-port.js";
import { InternalCdpBroker } from "./internal-cdp.js";
import { registerNativeHandlers } from "./native/index.js";

export let runtimeReady = false;

export let channel: RpcChannel | null = null;
export let runtimeProcess: ChildProcess | null = null;
export let runtimeGeneration = 0;
export let runtimeRestartAttempt = 0;
export let runtimeRestartTimer: NodeJS.Timeout | null = null;
export let runtimeCdpPort = 0;
let internalBroker: InternalCdpBroker | null = null;
let brokerClosing: Promise<void> | null = null;
let brokerStarting = false;
const useInternalCdp = USE_INTERNAL_CDP;

function closeInternalBroker(): Promise<void> {
  const broker = internalBroker;
  internalBroker = null;
  if (!broker) return brokerClosing ?? Promise.resolve();
  const closing = broker.close().catch(error => { log("internal CDP broker close failed", String(error)); });
  brokerClosing = closing;
  void closing.finally(() => { if (brokerClosing === closing) brokerClosing = null; });
  return closing;
}

export function reportRuntimeStatus(connected: boolean, detail?: string) {
  for (const state of regularWindows.values()) state.shellView.webContents.send("runtime-status", { connected, detail });
}

export function sendRuntimeEvent(event: unknown) {
  const value = event as { type?: string; payload?: { pageId?: string; page?: { pageId?: string; windowId?: string }; run?: { pageIds?: string[]; status?: string } }; runId?: string };
  // A paused run releases its pages — they become freezable; a resumed run's
  // pages wake before the next driver command reaches them.
  if (value.type === "run.updated" && value.payload?.run) {
    for (const left of pausedAgent.observe(value.runId, value.payload.run.pageIds, value.payload.run.status)) void wakePage(registry.get(left));
    if (value.payload.run.status === "paused") for (const id of value.payload.run.pageIds ?? []) { const entry = registry.get(id); if (entry) scheduleIdleFreeze(entry); }
  }
  const pageId = value.payload?.page?.pageId ?? value.payload?.pageId;
  const windowId = value.payload?.page?.windowId ?? (pageId ? pageWindowOwners.get(pageId) : undefined);
  const owner = windowId ? regularWindows.get(windowId) : undefined;
  if (owner && value.type !== "page.moved") owner.shellView.webContents.send("event", event);
  else for (const state of regularWindows.values()) state.shellView.webContents.send("event", event);
  if (value.type === "page.removed" && pageId) { pageWindowOwners.delete(pageId); runtimeLiveTabs.delete(pageId); }
  else if (value.type === "page.added" && pageId) runtimeLiveTabs.add(pageId);
}

export function scheduleRuntimeRestart(delayMs?: number) {
  if (exitApproved || runtimeRestartTimer) return;
  const delay = delayMs ?? Math.min(15_000, 750 * 2 ** Math.min(runtimeRestartAttempt++, 5));
  runtimeRestartTimer = setTimeout(() => {
    runtimeRestartTimer = null;
    startRuntimeProcess();
  }, delay);
}

/** Start after the primary native-page host exists; the legacy path also waits for Chromium's port. */
export function startRuntimeWhenReady(primaryWindow: Promise<void>) {
  if (useInternalCdp) {
    void primaryWindow.then(() => startRuntimeProcess()).catch(error => log("runtime not started:", String(error)));
    return;
  }
  void Promise.all([waitForCdpPort(), primaryWindow]).then(([cdpPort]) => {
    runtimeCdpPort = cdpPort;
    log("cdp port", cdpPort);
    try {
      writeFileSync(join(DATA_DIR, CDP_PORT_FILE), String(cdpPort), { mode: 0o600 });
      chmodSync(join(DATA_DIR, CDP_PORT_FILE), 0o600);
    } catch {
      /* non-POSIX fs */
    }
    startRuntimeProcess();
  }).catch(error => log("runtime not started:", String(error)));
}

export function startRuntimeProcess() {
  if (useInternalCdp) { void startInternalRuntimeProcess(); return; }
  if (exitApproved || runtimeProcess || !runtimeCdpPort) return;
  launchRuntimeProcess();
}

async function startInternalRuntimeProcess() {
  if (exitApproved || runtimeProcess || brokerStarting) return;
  brokerStarting = true;
  try {
    if (brokerClosing) await brokerClosing;
    const root = regularWindows.get(PRIMARY_WINDOW_ID)?.shellView.webContents;
    if (!root || root.isDestroyed()) throw new Error("Primary Aux shell is unavailable");
    const broker = await InternalCdpBroker.start(root, registry, profileSession());
    if (exitApproved || runtimeProcess) { await broker.close(); return; }
    internalBroker = broker;
    log("internal CDP broker listening", broker.port());
    launchRuntimeProcess();
  } catch (error) {
    await closeInternalBroker();
    log("internal CDP broker failed", String(error));
    scheduleRuntimeRestart();
  } finally {
    brokerStarting = false;
  }
}

function launchRuntimeProcess() {
  if (exitApproved || runtimeProcess || (!useInternalCdp && !runtimeCdpPort)) return;
  runtimeLiveTabs.clear();
  runtimeTabWindow.clear();
  const generation = ++runtimeGeneration;
  runtimeReady = false;
  reportRuntimeStatus(false, runtimeRestartAttempt ? "Reconnecting to the Aux runtime…" : undefined);
  const runtime = spawnRuntime({
    dataDir: DATA_DIR,
    profileId: browserProfiles.currentId,
    cdpPort: runtimeCdpPort,
    internalCdp: useInternalCdp,
    onExit: code => {
      if (generation !== runtimeGeneration) return;
      runtimeProcess = null;
      runtimeReady = false;
      channel = null;
      log("runtime exited", code);
      reportRuntimeStatus(false, "The Aux runtime stopped. Browsing remains available while it reconnects.");
      void closeInternalBroker().finally(() => scheduleRuntimeRestart());
    },
  });
  runtimeProcess = runtime.proc;
  if (useInternalCdp) runtime.proc.once("disconnect", () => {
    if (generation !== runtimeGeneration) return;
    void closeInternalBroker();
    if (runtime.proc.exitCode === null) runtime.proc.kill("SIGTERM");
  });
  const transport: Transport = {
    send: message => {
      if (!runtime.proc.connected) throw new Error("runtime IPC disconnected");
      runtime.proc.send(message as never);
    },
    onMessage: callback => runtime.proc.on("message", callback),
    onClose: callback => {
      let closed = false;
      const once = () => { if (!closed) { closed = true; callback(); } };
      runtime.proc.once("disconnect", once);
      runtime.proc.once("exit", once);
    },
  };
  const next = new RpcChannel(transport, "shell->runtime");
  channel = next;
  if (useInternalCdp) next.onMethod("cdp.capability", () => {
    if (generation !== runtimeGeneration || !internalBroker) throw new Error("Runtime capability expired");
    return internalBroker.endpoint();
  });
  registerNativeHandlers(next);
  next.onNotify((type, payload) => {
    if (generation !== runtimeGeneration) return;
    if (type === "runtime.ready") {
      runtimeReady = true;
      runtimeRestartAttempt = 0;
      log("runtime ready", JSON.stringify(payload));
      reportRuntimeStatus(true);
      void flushExternalUrls();
    }
    if (type === "event") sendRuntimeEvent(payload);
  });
}

// ---------- native.* surface (called by the runtime) ----------

/** A desktop-user api.invoke on the runtime; rejects while it is offline. */
export async function runtimeInvoke<T = unknown>(method: string, params: unknown = {}, timeoutMs?: number): Promise<T> {
  if (!channel) throw new Error("The Aux runtime is not connected.");
  return channel.call<T>("api.invoke", { method, params, desktopUser: true }, timeoutMs);
}

export function requireRuntime(message = "The Aux runtime is not connected.") {
  if (!channel) throw new Error(message);
}

export function notifyRuntime(type: string, payload: unknown) {
  channel?.notify(type, payload);
}
