/**
 * Vector runtime entry point.
 *
 * Spawned by the Electron main process via child_process.fork with
 * ELECTRON_RUN_AS_NODE=1, or run standalone (`node dist/main.js`) for
 * tests/external-only use. Speaks JSON-RPC over fork IPC to the shell and
 * serves the versioned loopback API for external agents.
 */
import { randomUUID } from "node:crypto";
import { chmodSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { EventTypes, VectorError, type Step } from "@vector/contracts";
import { RpcChannel, type Transport } from "@vector/contracts";
import {
  AttachedChromeDriver,
  StandaloneDriver,
  VectorElectronDriver,
  VectorEngineDriver,
  type BrowserDriver,
  type EngineAvailability,
} from "@vector/engine-client";
import { dotEnvCandidates, loadConfig, loadDotEnv } from "./config.js";
import { openDb } from "./store/db.js";
import { Repo } from "./store/repo.js";
import { EventBus } from "./events.js";
import { ChannelNativeBridge, NullNativeBridge, type NativeBridge } from "./native.js";
import { PageService, type DriverSet } from "./services/pages.js";
import { Router, type NeedsChromiumEntry } from "./services/router.js";
import { SetService } from "./services/sets.js";
import { RunService } from "./services/runs.js";
import { ArtifactStore } from "./services/artifacts.js";
import { CookieService } from "./services/cookies.js";
import { SettingsService } from "./services/settings.js";
import { ResponseStore } from "./services/responses.js";
import { OperationService } from "./services/operations.js";
import { StateService } from "./services/state.js";
import { Tracer } from "./services/tracing.js";
import { makeInvoker } from "./api/handlers.js";
import { ApiServer } from "./api/server.js";
import { runBench } from "./services/bench.js";
import { compileAndAuthorize } from "./agent/action-compiler.js";
import { attachBidiRuntime } from "./services/bidi.js";

export interface RuntimeHandle {
  port: number;
  token: string;
  invoke: (method: string, params: unknown) => Promise<unknown>;
  close: () => Promise<void>;
}

export async function startRuntime(processEnv = process.env): Promise<RuntimeHandle> {
  // `.env` in the data dir, then in the cwd — real environment variables
  // always win. The README promised this; nothing loaded it before.
  const env = loadDotEnv(processEnv, dotEnvCandidates(processEnv));
  const config = loadConfig(env);
  const repo = new Repo(openDb(config.dbPath));
  repo.pruneEvents();
  const events = new EventBus(repo);
  const settings = new SettingsService(repo, config.settingsPath, env);
  const artifacts = new ArtifactStore(config.artifactsDir, repo, events);

  // ---- channel to the desktop shell (fork IPC) ----
  let channel: RpcChannel | null = null;
  if (env.VECTOR_IPC === "1" && typeof process.send === "function") {
    const transport: Transport = {
      send: (m) => {
        try {
          process.send?.(m);
        } catch {
          /* parent gone */
        }
      },
      onMessage: (cb) => process.on("message", cb),
    };
    channel = new RpcChannel(transport, "runtime->shell");
  }
  const native: NativeBridge = channel ? new ChannelNativeBridge(channel) : new NullNativeBridge();
  settings.attachNative(native);

  // Register api.invoke immediately — the renderer can call before services
  // finish booting; calls wait on the invoker promise instead of failing.
  type InvokeFn = (m: string, p: unknown) => Promise<unknown>;
  let resolveInvoker: (fn: InvokeFn) => void;
  const invokerReady = new Promise<InvokeFn>((r) => (resolveInvoker = r));
  channel?.onMethod("api.invoke", (p) => {
    const { method, params } = p as { method: string; params: unknown };
    return invokerReady.then((fn) => fn(method, params));
  });

  // ---- drivers ----
  const drivers: DriverSet = {
    vector: null,
    chrome: null,
    engine: null,
  };
  // socket drops mark the session degraded and tell the UI; the next
  // pages.open attempts a lazy reconnect and, on success, restores it
  const watchDriver = (d: BrowserDriver, sessionId: "vector" | "chrome" | "vector-engine", label: string) => {
    d.onDisconnected = () => {
      repo.upsertSession({ sessionId, backend: d.backend, label, status: "degraded", detail: "backend connection dropped — reconnecting on next use" });
      events.emit("session.changed", { backend: d.backend, status: "degraded" });
    };
    d.onReconnected = () => {
      repo.upsertSession({ sessionId, backend: d.backend, label, status: "connected" });
      events.emit("session.changed", { backend: d.backend, status: "connected" });
    };
  };
  if (config.electronCdp) {
    const d = new VectorElectronDriver(config.electronCdp);
    watchDriver(d, "vector", "Vector");
    try {
      await d.connect();
      drivers.vector = d;
      repo.upsertSession({ sessionId: "vector", backend: "vector", label: "Vector", status: "connected" });
    } catch (e) {
      repo.upsertSession({
        sessionId: "vector",
        backend: "vector",
        label: "Vector",
        status: "degraded",
        detail: `CDP connect failed: ${e instanceof Error ? e.message : e}`,
      });
    }
  } else if (env.VECTOR_STANDALONE !== "0") {
    // No Electron shell — drive a headless system Chrome so the full API still works.
    const d = new StandaloneDriver();
    watchDriver(d, "vector", "Vector (headless)");
    try {
      await d.connect();
      drivers.vector = d;
      repo.upsertSession({ sessionId: "vector", backend: "vector", label: "Vector (headless)", status: "connected" });
    } catch (e) {
      repo.upsertSession({
        sessionId: "vector",
        backend: "vector",
        label: "Vector (headless)",
        status: "degraded",
        detail: e instanceof Error ? e.message : String(e),
      });
    }
  }

  // ---- Vector Engine (architecture §11) ----
  // The native addon is loaded whenever it is present so `runtime.describe`
  // can report it; whether pages are *routed* to it is the `engineMode`
  // setting (default "auto" — engine first, Chromium fallback).
  let engineInfo: EngineAvailability = { available: false, error: "not loaded" };
  const engineMode = () => settings.engineMode();
  const routingMode = () =>
    engineMode() === "off" ? "chromium-only" : engineMode() === "always" ? "native-only" : "hybrid";
  const production =
    env.VECTOR_ENGINE_PROFILE === "production" ||
    env.VECTOR_ENGINE_PROFILE === "prod" ||
    env.VECTOR_ENGINE_STRICT === "1";
  if (env.VECTOR_ENGINE !== "0") {
    const extraAllow = (env.VECTOR_ENGINE_ALLOWLIST ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const d = new VectorEngineDriver({
      serviceAddr: env.VECTOR_BROWSER_SERVICE,
      config: {
        dataDir: config.dataDir,
        scripting: env.VECTOR_ENGINE_SCRIPTING !== "0",
        securityProfile: production ? "production" : "developer",
        isolation: production ? "requireProcess" : "auto",
        policy: {
          blockLoopback: true,
          allowFile: env.VECTOR_ENGINE_ALLOW_FILE === "1",
          allowPrivateNetwork: false,
          allowAgentEgress: env.VECTOR_ENGINE_AGENT_EGRESS === "1",
          allowlist: [
            "127.0.0.1:4810",
            "127.0.0.1:4811",
            "127.0.0.1:4812",
            "localhost:4810",
            "localhost:4811",
            "localhost:4812",
            ...extraAllow,
          ],
        },
      },
    });
    watchDriver(d, "vector-engine", "Vector Engine");
    try {
      await d.connect();
      drivers.engine = d;
      engineInfo = d.describe();
      repo.upsertSession({
        sessionId: "vector-engine",
        backend: "vector-engine",
        label: "Vector Engine",
        status: "connected",
        detail: `v${engineInfo.version ?? "?"} abi=${engineInfo.abiVersion ?? "?"} ${engineInfo.isolation ?? "in-process"} ${routingMode()}`,
        abiVersion: engineInfo.abiVersion,
        protocolVersion: engineInfo.protocolVersion,
        engineVersion: engineInfo.version,
        isolation: engineInfo.isolation,
        securityProfile: engineInfo.securityProfile,
        routingMode: routingMode(),
      });
    } catch (e) {
      engineInfo = { available: false, error: e instanceof Error ? e.message : String(e) };
      repo.upsertSession({
        sessionId: "vector-engine",
        backend: "vector-engine",
        label: "Vector Engine",
        status: "disconnected",
        detail: engineInfo.error,
        routingMode: routingMode(),
        securityProfile: production ? "production" : "developer",
      });
    }
  }
  const tracer = new Tracer(repo.db, { traceDir: join(config.dataDir, "traces") });
  const router = new Router({
    mode: () => settings.engineMode(),
    engineAvailable: () => !!drivers.engine?.isConnected(),
    nativeOnly: () => env.VECTOR_NATIVE_ONLY === "1" || production,
    store: {
      load: () => repo.loadRouterTable<NeedsChromiumEntry>(),
      save: (entries) => repo.saveRouterTable(entries),
    },
    log: (message, attrs) => {
      tracer.incr(message);
      if (env.VECTOR_ROUTER_LOG === "1") console.error(`[vector-runtime] ${message}`, JSON.stringify(attrs));
    },
  });
  const responses = new ResponseStore({ repo, events, artifacts });
  // pages↔operations are mutually dependent — late-bind via a lazy ref
  let operations!: OperationService;
  const pages = new PageService({
    repo,
    events,
    native,
    drivers: () => drivers,
    router,
    artifacts,
    responses,
    tracer,
    // unified step ledger — every execution records steps with pageId so
    // operations.compile can rebuild the trace (§10.3)
    recordStep: (s) => repo.saveStep(s),
    electronEngineView: () => env.VECTOR_ELECTRON === "1",
    grants: () => settings.effectGrants(),
    callOperation: async (name, args, pageId) => {
      const slash = name.indexOf("/");
      const siteKey = slash > 0 ? name.slice(0, slash) : new URL(pages.get(pageId).url).host;
      const opName = slash > 0 ? name.slice(slash + 1) : name;
      const r = await operations.invoke({ siteKey, name: opName, inputs: args, pageId });
      if (r.status === "failed") throw new VectorError("step_failed", r.error ?? `operation ${opName} failed`);
      return r.result;
    },
  });
  attachBidiRuntime({
    navigate: (context, url) => {
      void pages.navigate(context, url);
      return { url, pageId: context };
    },
    performActions: (actions) => {
      const list = Array.isArray(actions) ? actions : [];
      const first = list[0] as { pageId?: string; context?: string; steps?: Step[] } | undefined;
      const pageId = first?.pageId ?? first?.context;
      if (!pageId || !first?.steps?.length) return { accepted: false };
      const steps = first.steps;
      void (async () => {
        const obs = await pages.observe(pageId, {});
        const live = pages.get(pageId);
        const prepared = compileAndAuthorize({
          pageId,
          documentEpoch: live.documentEpoch ?? obs.documentEpoch,
          observedEpoch: obs.documentEpoch,
          steps,
          observation: obs.content,
          url: live.url ?? obs.content.url,
          grants: () => settings.effectGrants(),
        });
        if ("program" in prepared) await pages.execute(prepared.program, { allowEval: false });
      })();
      return { accepted: true };
    },
  });
  const sets = new SetService(repo, events, pages);

  const refLookup = (pageId: string, ref: string) =>
    drivers.vector?.refEntry?.(pageId, ref) ?? drivers.chrome?.refEntry?.(pageId, ref) ?? drivers.engine?.refEntry?.(pageId, ref);
  const translateSteps = (pageId: string, steps: Step[]): Step[] =>
    steps
      .filter((s) => s.op !== "navigate")
      .map((s) => {
        if ("target" in s && typeof s.target === "string" && /^r\d+$/.test(s.target)) {
          const el = refLookup(pageId, s.target);
          const sel = el?.selector;
          if (sel?.role) {
            return { ...s, target: `role=${sel.role.role}${sel.role.name ? `[name=${sel.role.name}]` : ""}` };
          }
          if (sel?.css) return { ...s, target: `css:${sel.css}` };
        }
        return s;
      });

  operations = new OperationService({
    repo,
    events,
    pages,
    translateSteps,
    egressAllowlist: () =>
      (env.VECTOR_ENGINE_ALLOWLIST ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
  });
  const state = new StateService({ repo, pages, operations });

  const runs = new RunService({
    repo,
    events,
    pages,
    sets,
    settings,
    artifacts,
    translateSteps,
    nativeAvailable: () => native.available(),
    tracer,
  });

  events.subscribe((e) => {
    if (e.type !== EventTypes.PageTakeover) return;
    const pageId = e.payload.pageId;
    const controller = e.payload.controller;
    if (typeof pageId !== "string" || typeof controller !== "string") return;
    for (const run of repo.listRuns(200)) {
      if (!run.pageIds.includes(pageId)) continue;
      if (controller === "human") {
        if (run.status === "running" || run.status === "planning") runs.pause(run.runId);
      } else if (run.status === "paused") {
        runs.resume(run.runId);
      }
    }
  });

  // ---- chrome attach ----
  const chromeAttach = async (port: number) => {
    if (drivers.chrome?.isConnected()) {
      return repo.listSessions().find((s) => s.backend === "chrome");
    }
    const d = new AttachedChromeDriver(`http://127.0.0.1:${port}`);
    watchDriver(d, "chrome", `Chrome :${port}`);
    await d.connect();
    drivers.chrome = d;
    repo.upsertSession({
      sessionId: "chrome",
      backend: "chrome",
      label: `Chrome :${port}`,
      status: "connected",
      detail: "attached via CDP — borrowed tabs keep their session",
    });
    events.emit("session.changed", { backend: "chrome", status: "connected" });
    return repo.listSessions().find((s) => s.backend === "chrome");
  };
  const chromeDetach = async () => {
    await drivers.chrome?.disconnect();
    drivers.chrome = null;
    repo.upsertSession({ sessionId: "chrome", backend: "chrome", label: "Chrome", status: "disconnected" });
    events.emit("session.changed", { backend: "chrome", status: "disconnected" });
    return { ok: true };
  };
  const chromeTabs = async () => drivers.chrome?.listTargets() ?? [];
  const cookies = new CookieService({ drivers: () => drivers, native });

  const invoke = makeInvoker({
    pages,
    sets,
    runs,
    artifacts,
    settings,
    events,
    repo,
    responses,
    operations,
    state,
    tracer,
    drivers: () => drivers,
    router,
    engine: () => engineInfo,
    chromeAttach,
    chromeDetach,
    chromeTabs,
    importCookies: (o) => cookies.importCookies(o),
    benchRun: async (task, repeats) =>
      runBench({
        pages,
        url: task ?? env.VECTOR_BENCH_URL ?? "http://127.0.0.1:4810/records",
        repeats: repeats ?? 10,
        dir: config.benchmarksDir,
      }),
  });

  // ---- loopback API ----
  const token = config.apiToken || randomUUID();
  const api = new ApiServer({ token, invoke, events });
  const port = await api.listen(config.apiPort);
  // the bearer token lives here — owner-only, and re-chmod'd because
  // writeFileSync's mode applies only when the file is first created
  const runtimeFile = join(config.dataDir, "runtime.json");
  writeFileSync(runtimeFile, JSON.stringify({ port, token, pid: process.pid }), { mode: 0o600 });
  try {
    chmodSync(runtimeFile, 0o600);
  } catch {
    /* non-POSIX fs */
  }

  // ---- channel surface for the shell ----
  resolveInvoker!(invoke);
  // forward the event stream so the shell renderer can subscribe over IPC
  events.subscribe((e) => channel?.notify("event", e));
  channel?.onNotify((type, payload) => {
    const pl = (payload ?? {}) as Record<string, unknown>;
    const str = (v: unknown) => (v === undefined || v === null ? undefined : String(v));
    const truthy = (v: unknown) => v === true || v === "true";
    switch (type) {
      case "view.navigated": return pages.onNativeNavigated(str(pl.pageId)!, str(pl.url)!);
      case "view.titleChanged": return pages.onNativeTitle(str(pl.pageId)!, str(pl.title) ?? "");
      case "view.faviconChanged": return pages.onNativeFavicon(str(pl.pageId)!, str(pl.favicon) ?? "");
      case "view.navState": return pages.onNativeNavState(str(pl.pageId)!, truthy(pl.canGoBack), truthy(pl.canGoForward));
      case "view.loading": return pages.onNativeLoading(str(pl.pageId)!, truthy(pl.loading));
      case "view.crashed": return pages.onNativeCrashed(str(pl.pageId)!);
      case "view.takeover": return pages.onNativeTakeover(str(pl.pageId)!);
      case "view.engineInput":
        void pages.onEngineInput(str(pl.pageId)!, {
          type: str(pl.type) ?? "",
          x: Number(pl.x ?? 0),
          y: Number(pl.y ?? 0),
          button: Number(pl.button ?? 0),
          key: str(pl.key),
          text: str(pl.text),
          start: pl.start === undefined ? undefined : Number(pl.start),
          end: pl.end === undefined ? undefined : Number(pl.end),
          width: pl.width === undefined ? undefined : Number(pl.width),
          height: pl.height === undefined ? undefined : Number(pl.height),
          name: str(pl.name),
        });
        return;
      case "view.downloadStarted":
        return pages.onNativeDownloadStarted(str(pl.pageId), {
          id: str(pl.id) ?? `dl_${Date.now()}`,
          filename: str(pl.filename) ?? "download",
          path: str(pl.path) ?? "",
          size: Number(pl.size ?? 0),
          totalBytes: pl.totalBytes ? Number(pl.totalBytes) : undefined,
          startedAt: Number(pl.startedAt ?? Date.now()),
        });
      case "view.downloadFinished":
        return pages.onNativeDownload(str(pl.pageId), {
          id: str(pl.id) ?? `dl_${Date.now()}`,
          filename: str(pl.filename) ?? "download",
          path: str(pl.path) ?? "",
          state: str(pl.state) ?? "completed",
          size: Number(pl.size ?? 0),
          totalBytes: pl.totalBytes ? Number(pl.totalBytes) : undefined,
          startedAt: Number(pl.startedAt ?? Date.now()),
          endedAt: pl.endedAt ? Number(pl.endedAt) : undefined,
        });
      case "view.popup":
        // a native window/tab appeared outside pages.open (window.open allowed)
        void pages.registerExternal({
          marker: str(pl.marker)!,
          url: str(pl.url) ?? "about:blank",
          backend: "vector",
        }).catch(() => {});
        return;
      case "view.removed": return pages.onNativeRemoved(str(pl.pageId)!);
      case "app.closing": return pages.shuttingDown();
    }
  });

  let closed = false;
  const shutdown = async () => {
    if (closed) return;
    closed = true;
    process.off("unhandledRejection", onUnhandledRejection);
    process.off("uncaughtException", onUncaughtException);
    runs.coordinator.markInterrupted();
    await drivers.vector?.disconnect().catch(() => {});
    await drivers.chrome?.disconnect().catch(() => {});
    await drivers.engine?.disconnect().catch(() => {});
    await api.close().catch(() => {});
    tracer.close();
    repo.db.close();
  };
  process.on("SIGTERM", () => void shutdown().then(() => process.exit(0)));
  process.on("SIGINT", () => void shutdown().then(() => process.exit(0)));

  // Process-level faults (P1-10). Node would otherwise exit on an unhandled
  // rejection, taking every tab and run with it and leaving runs 'running'
  // in the ledger. Log, fail the active runs with the fault as their error,
  // and keep serving. An uncaught exception is not recoverable in-process:
  // fail runs, flush, and exit non-zero so the shell can respawn.
  const describeFault = (e: unknown) => (e instanceof Error ? `${e.name}: ${e.message}` : String(e));
  const onUnhandledRejection = (reason: unknown) => {
    if (closed) return;
    console.error("[vector-runtime] unhandled rejection:", reason instanceof Error ? reason.stack ?? reason.message : reason);
    try {
      const failed = runs.coordinator.failActive(`runtime fault — unhandled rejection: ${describeFault(reason)}`);
      if (failed.length) console.error(`[vector-runtime] marked ${failed.length} active run(s) failed`);
    } catch {
      /* the ledger itself may be the thing that failed */
    }
  };
  const onUncaughtException = (err: Error) => {
    if (closed) return;
    console.error("[vector-runtime] uncaught exception:", err.stack ?? err.message);
    try {
      runs.coordinator.failActive(`runtime fault — uncaught exception: ${describeFault(err)}`);
    } catch {
      /* best effort */
    }
    void shutdown().finally(() => process.exit(1));
  };
  process.on("unhandledRejection", onUnhandledRejection);
  process.on("uncaughtException", onUncaughtException);

  // recover from an unclean stop: anything still "live" never completed.
  // Invocation rows persisted 'running' before dispatch (§13.3) reconcile
  // to 'interrupted' with unknown effect — never assumed applied or not.
  runs.coordinator.markInterrupted();
  repo.markRunningInvocationsInterrupted();

  // bring back the tabs that were open when the app last quit
  void pages.restoreTabs().catch(() => {});

  channel?.notify("runtime.ready", { port });
  return {
    port,
    token,
    invoke: (m, p) => invoke(m, p),
    close: shutdown,
  };
}

const isDirectRun = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isDirectRun || process.env.VECTOR_RUNTIME_AUTOSTART === "1") {
  startRuntime().then((h) => {
    console.log(`[vector-runtime] api=http://127.0.0.1:${h.port}`);
  }).catch((e) => {
    console.error("[vector-runtime] failed:", e);
    process.exit(1);
  });
}
