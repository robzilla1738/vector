import { MethodSchemas } from "@aux/contracts";
import { app } from "electron";
import { type ChildProcess, spawn as spawnProcess } from "node:child_process";
import { filterOps, privacy } from "../privacy/state.js";
import { requireRuntime, runtimeInvoke } from "../runtime/supervisor.js";
import { DATA_DIR } from "./bootstrap.js";

export const privateChildren = new Map<ChildProcess, { ready: boolean }>();
export let privateControlSequence = 0;

export function openPrivateWindow() {
  const args = app.isPackaged ? ["--aux-private"] : [app.getAppPath(), "--aux-private"];
  const child = spawnProcess(app.getPath("exe"), args, {
    detached: true, stdio: ["ignore", "ignore", "ignore", "ipc"],
    env: {
      ...process.env,
      // Never inherit debug channels — the private process must stay
      // undiscoverable through the shared/regular debugging endpoint.
      NODE_OPTIONS: undefined,
      ELECTRON_EXTRA_LAUNCH_ARGS: undefined,
      // Read-only config handoff: the private process never writes these back.
      AUX_PRIVATE_DATA_DIR: DATA_DIR,
      AUX_PRIVATE_TRACKER_BLOCK: privacy.trackerBlock ? "1" : "0",
      AUX_PRIVATE_ALLOWED: privacy.allowedHosts.join(","),
      AUX_PRIVATE_HTTPS_UPGRADE: privacy.httpsUpgrade ? "1" : "0",
    },
  });
  privateChildren.set(child, { ready: false });
  child.on("message", message => {
    const value = message as { type?: string; requestId?: string; method?: string; params?: unknown };
    if (value?.type === "aux-private-ready") {
      const state = privateChildren.get(child);
      if (state) state.ready = true;
    } else if (value?.type === "aux-private-closing") {
      privateChildren.delete(child);
    } else if (value?.type === "aux-private-translate" && value.requestId) {
      // Private pages translate through the regular runtime's model provider.
      // Only translate methods proxy — the private process never gains access
      // to regular runtime data, and page text stays in memory.
      void (async () => {
        let payload: { ok: boolean; result?: unknown; error?: string };
        try {
          const method = value.method;
          if (method !== "translate.page" && method !== "translate.text") throw new Error("Unsupported method.");
          requireRuntime("Translation is unavailable while the runtime is offline.");
          const params = MethodSchemas[method].parse(value.params ?? {});
          payload = { ok: true, result: await runtimeInvoke(method, params) };
        } catch (error) {
          payload = { ok: false, error: error instanceof Error ? error.message : String(error) };
        }
        try { child.send({ type: "aux-private-translate-result", requestId: value.requestId, ...payload }, () => {}); } catch {}
      })();
    } else if (value?.type === "aux-private-filters" && value.requestId) {
      // Filter-list mutations run here so the shared cache stays single-writer.
      const action = (value as { action?: string }).action;
      const payloadArgs = (value as { args?: Record<string, unknown> }).args ?? {};
      void (async () => {
        let payload: { ok: boolean; result?: unknown; error?: string };
        try {
          if (action === "update") payload = { ok: true, result: await filterOps.update() };
          else if (action === "add") payload = { ok: true, result: await filterOps.add(payloadArgs.name, payloadArgs.url) };
          else if (action === "remove") payload = { ok: true, result: await filterOps.remove(payloadArgs.id) };
          else if (action === "setEnabled") payload = { ok: true,
            result: await filterOps.setEnabled(payloadArgs.id, payloadArgs.enabled) };
          else throw new Error("Unsupported filter action.");
        } catch (error) {
          payload = { ok: false, error: error instanceof Error ? error.message : String(error) };
        }
        try { child.send({ type: "aux-private-filters-result", requestId: value.requestId, ...payload }, () => {}); } catch {}
      })();
    }
  });
  const forget = () => privateChildren.delete(child);
  child.once("exit", forget);
  child.unref();
  child.channel?.unref();
}

export function privateChildRunning(child: ChildProcess) {
  if (child.exitCode !== null || !child.pid) return false;
  try { process.kill(child.pid, 0); return true; } catch { return false; }
}

export function requestPrivateControl(child: ChildProcess, action: "prepare" | "validate", timeoutMs = 20000): Promise<boolean | null> {
  if (!privateChildRunning(child)) return Promise.resolve(null);
  // A live window with a lost control channel must veto whole-app Quit. Treating
  // it as gone could strand a visible private process after the regular app exits.
  if (!child.connected) return Promise.resolve(false);
  return new Promise(resolve => {
    let settled = false;
    const requestId = `${process.pid}:${++privateControlSequence}`;
    const finish = (result: boolean | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.removeListener("message", onMessage);
      child.removeListener("exit", onExit);
      resolve(result);
    };
    const onMessage = (message: unknown) => {
      const value = message as { type?: string; requestId?: string; ok?: boolean };
      if (value?.type === "aux-private-control-result" && value.requestId === requestId) finish(value.ok === true);
    };
    const onExit = () => finish(null);
    const timer = setTimeout(() => finish(false), timeoutMs);
    child.on("message", onMessage);
    child.once("exit", onExit);
    child.send({ type: "aux-private-control", requestId, action }, error => { if (error) finish(null); });
  });
}

export function signalPrivateControl(child: ChildProcess, action: "commit" | "abort") {
  if (!privateChildRunning(child)) { privateChildren.delete(child); return; }
  if (!child.connected) return;
  child.send({ type: "aux-private-control", requestId: `${process.pid}:${++privateControlSequence}`, action }, error => {
    if (error) privateChildren.delete(child);
  });
}

export async function preparePrivateWindows(): Promise<ChildProcess[] | null> {
  const prepared: ChildProcess[] = [];
  for (const child of privateChildren.keys()) {
    const result = await requestPrivateControl(child, "prepare");
    if (result === null) { privateChildren.delete(child); continue; }
    if (!result) {
      for (const accepted of prepared) signalPrivateControl(accepted, "abort");
      return null;
    }
    prepared.push(child);
  }
  for (const child of prepared) {
    const result = await requestPrivateControl(child, "validate");
    if (result === null) { privateChildren.delete(child); continue; }
    if (!result) {
      for (const accepted of prepared) signalPrivateControl(accepted, "abort");
      return null;
    }
  }
  return prepared;
}
