import { RpcChannel, type Transport } from "@aux/contracts";
import type { ChildProcess } from "node:child_process";
import { chmodSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CDP_PORT_FILE, DATA_DIR, log } from "../app/bootstrap.js";
import { exitApproved } from "../app/exit.js";
import { flushExternalUrls } from "../app/external-urls.js";
import { registry } from "../app/services.js";
import { spawnRuntime } from "../runtime-proc.js";
import { pausedAgent, scheduleIdleFreeze, wakePage } from "../tabs/lifecycle-controller.js";
import { runtimeLiveTabs, runtimeTabWindow } from "../tabs/publish.js";
import { pageWindowOwners, regularWindows } from "../windows/registry.js";
import { waitForCdpPort } from "./cdp-port.js";
import { registerNativeHandlers } from "./native/index.js";

export let runtimeReady = false;

export let channel: RpcChannel | null = null;
export let runtimeProcess: ChildProcess | null = null;
export let runtimeGeneration = 0;
export let runtimeRestartAttempt = 0;
export let runtimeRestartTimer: NodeJS.Timeout | null = null;
export let runtimeCdpPort = 0;

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

/** The runtime forks once Chromium publishes its DevTools port and the primary window (its native-page host) exists. */
export function startRuntimeWhenReady(primaryWindow: Promise<void>) {
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
  if (exitApproved || runtimeProcess || !runtimeCdpPort) return;
  runtimeLiveTabs.clear();
  runtimeTabWindow.clear();
  const generation = ++runtimeGeneration;
  runtimeReady = false;
  reportRuntimeStatus(false, runtimeRestartAttempt ? "Reconnecting to the Aux runtime…" : undefined);
  const runtime = spawnRuntime({
    dataDir: DATA_DIR,
    cdpPort: runtimeCdpPort,
    onExit: code => {
      if (generation !== runtimeGeneration) return;
      runtimeProcess = null;
      runtimeReady = false;
      channel = null;
      log("runtime exited", code);
      reportRuntimeStatus(false, "The Aux runtime stopped. Browsing remains available while it reconnects.");
      scheduleRuntimeRestart();
    },
  });
  runtimeProcess = runtime.proc;
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
