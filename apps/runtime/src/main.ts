import { BrowsingMemory } from "./services/browsing-memory.js";
import { ContentMemoryStore } from "./services/content-memory.js";
import { MemoryPipeline } from "./services/memory-pipeline.js";
import { createMcpTransportProvider } from "./services/mcp-transport-provider.js";
/**
 * Aux runtime entry point.
 *
 * Spawned by the Electron main process via child_process.fork, connected to
 * the Chromium host over an authenticated local socket, or run standalone.
 * The same runtime and versioned agent API serve each native host.
 */
import { randomUUID } from "node:crypto";
import { chmodSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { EventTypes, AuxError, OriginRuleSchema, ZapSnapshotParamsSchema, auxFeatureEnabled, isElementRef, normalizeAuxEnvironment, type Step } from "@aux/contracts";
import { RpcChannel, type Transport } from "@aux/contracts";
import {
  AttachedChromeDriver,
  StandaloneDriver,
  ManagedChromiumDriver,
  type BrowserDriver,
} from "@aux/chromium-driver";
import { dotEnvCandidates, loadConfig, loadDotEnv } from "./config.js";
import { openDb } from "./store/db.js";
import { PrivacyCheckpoint } from "./store/privacy-checkpoint.js";
import { Repo } from "./store/repo.js";
import { EventBus } from "./events.js";
import { ChannelNativeBridge, NullNativeBridge, type NativeBridge } from "./native.js";
import { NativeCdpBroker } from "./native-cdp-broker.js";
import { PageService, type DriverSet } from "./services/pages.js";
import { SetService } from "./services/sets.js";
import { RunService } from "./services/runs.js";
import { handlePageTakeover } from "./services/page-takeover.js";
import { ArtifactStore } from "./services/artifacts.js";
import { minimizeLegacyObservationArtifacts } from "./services/observation-artifact-migration.js";
import { CookieService } from "./services/cookies.js";
import { SettingsService } from "./services/settings.js";
import { ResponseStore } from "./services/responses.js";
import { OperationService } from "./services/operations.js";
import { StateService } from "./services/state.js";
import { Tracer } from "./services/tracing.js";
import { makeInvoker } from "./api/handlers.js";
import { ApiServer } from "./api/server.js";
import { AgentConnectionService } from "./services/agent-connections.js";
import { CalendarConnectionService } from "./services/calendar-connections.js";
import { ZapService } from "./services/zap.js";
import { ContentBlockingService } from "./services/content-blocking.js";
import { runBench } from "./services/bench.js";
import { compileAndAuthorize } from "./agent/action-compiler.js";
import { attachBidiRuntime } from "./services/bidi.js";
import { VaultService } from "./services/vault.js";
import { DurableWriteLedger } from "./agent/durable.js";
import { modelCallCost } from "./agent/model-client.js";
import { ApprovalStore } from "./safety/approval.js";
import { SafetyAuditStore } from "./safety/audit.js";
import { SafetyDispatchGate } from "./safety/dispatch.js";
import { createGuardianJudge } from "./safety/guardian-model.js";
import { markCloudDesktopClosed } from "./services/cloud-environments.js";
import { connectHostSocket, type HostSocketTransport } from "./host-socket.js";

export interface RuntimeHandle {
  port: number;
  token: string;
  invoke: (method: string, params: unknown) => Promise<unknown>;
  close: () => Promise<void>;
}

export async function startRuntime(processEnv = process.env): Promise<RuntimeHandle> {
  // `.env` in the data dir, then in the cwd — real environment variables
  // always win. The README promised this; nothing loaded it before.
  const configured = normalizeAuxEnvironment(processEnv);
  const env = configured.AUX_LOAD_DOTENV === "0" ? configured : loadDotEnv(processEnv, dotEnvCandidates(processEnv));
  const config = loadConfig(env);
  const repo = new Repo(openDb(config.dbPath));
  if (env.AUX_HOST_SOCKET && env.AUX_BROWSER_PROFILE_ID) repo.requireChromiumHistory();
  const privacyCheckpoint = new PrivacyCheckpoint(config.dbPath, error =>
    process.stderr.write(`[runtime] privacy checkpoint failed: ${error.message}\n`));
  repo.pruneEvents();
  setTimeout(() => { try { repo.pruneRetention(); } catch { /* retried next start */ } }, 10_000).unref();
  const events = new EventBus(repo);
  const settings = new SettingsService(repo, config.settingsPath, env);
  const durableWrites = new DurableWriteLedger(repo.db);
  const safetyAudit = new SafetyAuditStore(repo.db);
  const approvals = new ApprovalStore(repo.db, event => safetyAudit.record(event));
  const safetyGate = env.AUX_HOST_SOCKET ? new SafetyDispatchGate({
    approvals,
    managedRules: () => OriginRuleSchema.array().parse(repo.getSetting("managedOriginPolicies") ?? []),
    userRules: () => settings.originPolicies(),
    localCeiling: action => settings.safetyCeiling(action.effect),
    audit: event => safetyAudit.record({ ...event }),
    judge: createGuardianJudge({
      model: () => settings.model(), modelId: () => settings.plannerModel(),
      recordAttempt: (attempt, modelId, error) => repo.saveModelCall({
        callId: randomUUID(), role: "guardian", modelId, durationMs: attempt.durationMs,
        inputTokens: attempt.inputTokens, outputTokens: attempt.outputTokens,
        providerMetadata: attempt.providerMetadata,
        ...modelCallCost(modelId, attempt), ...(error ? { error } : {}), createdAt: Date.now(),
      }),
    }),
  }) : undefined;
  const artifacts = new ArtifactStore(config.artifactsDir, repo, events);
  setTimeout(() => { void minimizeLegacyObservationArtifacts(repo, config.artifactsDir).catch(error =>
    process.stderr.write(`[runtime] observation artifact maintenance failed: ${error instanceof Error ? error.message : String(error)}\n`)); }, 10_000).unref();

  // ---- channel to the native browser host ----
  let channel: RpcChannel | null = null;
  let hostSocket: HostSocketTransport | null = null;
  if (env.AUX_HOST_SOCKET) {
    hostSocket = await connectHostSocket(env.AUX_HOST_SOCKET, env.AUX_HOST_TOKEN ?? "");
    channel = new RpcChannel(hostSocket, "runtime->chromium-host");
  } else if (env.AUX_IPC === "1" && typeof process.send === "function") {
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
  const blocking = env.AUX_HOST_SOCKET
    ? new ContentBlockingService(config.dataDir, native, env.AUX_BROWSER_PROFILE_ID ?? "default") : null;
  const blockingBoot = blocking?.boot();
  if (blocking) {
    for (const method of ["blocking.status", "blocking.privacy", "blocking.update", "blocking.add",
      "blocking.remove", "blocking.setSourceEnabled", "blocking.setEnabled",
      "blocking.setSiteAllowed", "blocking.removeAllowedHost"]) {
      channel?.onMethod(method, params => blockingBoot!.then(() => blocking.handle(method, params)));
    }
    void blockingBoot?.then(() => blocking.maintain()).catch(error =>
      process.stderr.write(`[runtime] content blocking unavailable: ${String(error)}\n`));
    const filterTimer = setInterval(() => {
      void blocking.maintain().catch(error =>
        process.stderr.write(`[runtime] filter refresh failed: ${String(error)}\n`));
    }, 60 * 60 * 1000);
    filterTimer.unref?.();
  }
  const zap = new ZapService(repo, native, env.AUX_BROWSER_PROFILE_ID ?? "default");
  // Register before service boot so the host can preload styles before restoring tabs.
  channel?.onMethod("zap.snapshot", params => {
    const profileId = ZapSnapshotParamsSchema.parse(params).profileId;
    const host = env.AUX_HOST_SOCKET ? "chromium-fork" : "electron";
    const overrides = repo.getSetting<import("@aux/contracts").AuxFeatureOverrides>(`auxFeatures:${host}:${profileId}`) ?? {};
    const snapshot = zap.snapshot(profileId);
    return auxFeatureEnabled("zapAndUserCss", host, overrides) ? snapshot : [];
  });
  settings.attachNative(native);

  // Register api.invoke immediately — the renderer can call before services
  // finish booting; calls wait on the invoker promise instead of failing.
  type InvokeFn = (m: string, p: unknown, client?: { external: boolean; connectionId?: string; scope?: import("@aux/contracts").AgentConnectionScope }) => Promise<unknown>;
  let resolveInvoker: (fn: InvokeFn) => void;
  const invokerReady = new Promise<InvokeFn>((r) => (resolveInvoker = r));
  channel?.onMethod("api.invoke", (p) => {
    const { method, params, desktopUser } = p as { method: string; params: unknown; desktopUser?: boolean };
    return invokerReady.then((fn) => fn(method, params, { external: desktopUser !== true }));
  });
  await settings.initializeCredentials();

  // ---- drivers ----
  const drivers: DriverSet = {
    aux: null,
    chrome: null,
  };
  // socket drops mark the session degraded and tell the UI; the next
  // pages.open attempts a lazy reconnect and, on success, restores it
  const watchDriver = (d: BrowserDriver, sessionId: "aux" | "chrome", label: string) => {
    d.onDisconnected = () => {
      repo.upsertSession({ sessionId, backend: d.backend, label, status: "degraded", detail: "backend connection dropped — reconnecting on next use" });
      events.emit("session.changed", { backend: d.backend, status: "degraded" });
    };
    d.onReconnected = () => {
      repo.upsertSession({ sessionId, backend: d.backend, label, status: "connected" });
      events.emit("session.changed", { backend: d.backend, status: "connected" });
    };
  };
  const nativeCdp = env.AUX_HOST_SOCKET && channel
    ? await NativeCdpBroker.start(channel, env.AUX_HOST_SOCKET)
    : null;
  const hostCdp = nativeCdp?.endpoint() ?? (env.AUX_INTERNAL_CDP === "1" && channel
    ? await channel.call<string>("cdp.capability", {}, 15_000).catch(() => null)
    : config.hostCdp);
  if (hostCdp) {
    const d = new ManagedChromiumDriver(hostCdp, {
      trustedPages: native.listPages ? async () => (await native.listPages!()).pages : undefined,
    });
    watchDriver(d, "aux", "Aux");
    try {
      await d.connect();
      drivers.aux = d;
      repo.upsertSession({ sessionId: "aux", backend: "aux", label: "Aux", status: "connected" });
    } catch (e) {
      repo.upsertSession({
        sessionId: "aux",
        backend: "aux",
        label: "Aux",
        status: "degraded",
        detail: `CDP connect failed: ${e instanceof Error ? e.message : e}`,
      });
    }
  } else if (!channel && env.AUX_STANDALONE !== "0") {
    // No native shell — drive a headless system Chrome so the full API still works.
    const d = new StandaloneDriver();
    watchDriver(d, "aux", "Aux (headless)");
    try {
      await d.connect();
      drivers.aux = d;
      repo.upsertSession({ sessionId: "aux", backend: "aux", label: "Aux (headless)", status: "connected" });
    } catch (e) {
      repo.upsertSession({
        sessionId: "aux",
        backend: "aux",
        label: "Aux (headless)",
        status: "degraded",
        detail: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const tracer = new Tracer(repo.db, { traceDir: join(config.dataDir, "traces") });
  const responses = new ResponseStore({ repo, events, artifacts });
  const vault = new VaultService(repo, native);
  const contentMemory = native.available() && env.AUX_BROWSER_PROFILE_ID
    ? new ContentMemoryStore(repo, native, env.AUX_BROWSER_PROFILE_ID, Date.now, events) : undefined;
  const memoryPipeline = native.available() && env.AUX_BROWSER_PROFILE_ID
    ? new MemoryPipeline(repo, native, join(config.dataDir, "space-memory"), env.AUX_BROWSER_PROFILE_ID) : undefined;
  // pages↔operations are mutually dependent — late-bind via a lazy ref
  let operations!: OperationService;
  const pages = new PageService({
    repo,
    profileId: env.AUX_BROWSER_PROFILE_ID,
    events,
    native,
    nativePasswordFillEnabled: !!env.AUX_HOST_SOCKET,
    drivers: () => drivers,
    artifacts,
    responses,
    tracer,
    durableWrites,
    safetyGate,
    // unified step ledger — every execution records steps with pageId so
    // operations.compile can rebuild the trace (§10.3)
    recordStep: (s) => repo.saveStep(s),
    grants: () => settings.effectGrants(),
    grantsForRun: () => settings.effectGrantsForRun(),
    callOperation: async (name, args, pageId) => {
      const slash = name.indexOf("/");
      const siteKey = slash > 0 ? name.slice(0, slash) : new URL(pages.get(pageId).url).host;
      const opName = slash > 0 ? name.slice(slash + 1) : name;
      const r = await operations.invoke({ siteKey, name: opName, inputs: args, pageId });
      if (r.status === "failed") throw new AuxError("step_failed", r.error ?? `operation ${opName} failed`);
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
    drivers.aux?.refEntry?.(pageId, ref) ?? drivers.chrome?.refEntry?.(pageId, ref);
  const translateSteps = (pageId: string, steps: Step[]): Step[] =>
    steps
      .filter((s) => s.op !== "navigate")
      .map((s) => {
        if ("target" in s && typeof s.target === "string" && isElementRef(s.target)) {
          const el = refLookup(pageId, s.target);
          const sel = el?.selector;
          if (sel?.role) {
            return { ...s, target: `role=${sel.role.role}${sel.role.name ? `[name=${sel.role.name}]` : ""}` };
          }
          if (sel?.css) return { ...s, target: `css:${sel.css}` };
        }
        return s;
      });

  const calendar = new CalendarConnectionService({ repo, native, clientId: env.AUX_GOOGLE_CALENDAR_CLIENT_ID, profileId: env.AUX_BROWSER_PROFILE_ID,
    onChange: () => events.emit("settings.changed", { category: "calendar" }) });
  operations = new OperationService({
    repo,
    events,
    pages,
    translateSteps,
    durableWrites,
    calendar,
    grants: () => settings.effectGrants(),
    egressAllowlist: () =>
      (env.AUX_EGRESS_ALLOWLIST ?? "")
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
    vault,
    calendar,
    contentMemory,
    memoryPipeline,
    operations,
    durableWrites,
  });

  const extractingRuns = new Set<string>();
  events.subscribe(event => {
    if (event.type !== EventTypes.RunUpdated || !memoryPipeline) return;
    const run = event.payload.run;
    if (!run || typeof run !== "object" || !("status" in run) || run.status !== "completed" ||
      !("runId" in run) || typeof run.runId !== "string" || extractingRuns.has(run.runId)) return;
    const workspaceId = "config" in run && run.config && typeof run.config === "object" &&
      "contextWorkspaceId" in run.config ? run.config.contextWorkspaceId : undefined;
    if (typeof workspaceId !== "string" || !memoryPipeline.policy(workspaceId).enabled) return;
    const runId = run.runId;
    extractingRuns.add(runId);
    void memoryPipeline.extractRun(workspaceId, runId).then(result => {
      if (result.extracted) events.emit("workspace.memory.updated", { workspaceId, runId });
    }).catch(() => events.emit("memory.pipeline.failed", { workspaceId, runId }))
      .finally(() => extractingRuns.delete(runId));
  });

  events.subscribe((e) => {
    if (e.type !== EventTypes.PageTakeover) return;
    const pageId = e.payload.pageId;
    const controller = e.payload.controller;
    if (typeof pageId !== "string" || typeof controller !== "string") return;
    handlePageTakeover(pageId, controller, repo, runs);
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
  const agentConnections = new AgentConnectionService(repo);

  const invoke = makeInvoker({
    featureHost: env.AUX_HOST_SOCKET ? "chromium-fork" : "electron",
    featureProfileId: env.AUX_BROWSER_PROFILE_ID ?? "default",
    native,
    zap,
    contentMemory,
    memoryPipeline,
    mcpTransportProvider: createMcpTransportProvider(native),
    checkpointDeletedData: () => privacyCheckpoint.request(),
    pages,
    sets,
    runs,
    artifacts,
    settings,
    events,
    repo,
    agentConnections,
    calendar,
    responses,
    operations,
    state,
    tracer,
    vault,
    drivers: () => drivers,
    chromeAttach,
    chromeDetach,
    chromeTabs,
    importCookies: (o) => cookies.importCookies(o),
    benchRun: async (task, repeats) =>
      runBench({
        pages,
        url: task ?? env.AUX_BENCH_URL ?? "http://127.0.0.1:4810/records",
        repeats: repeats ?? 10,
        dir: config.benchmarksDir,
      }),
  });
  // Authenticated Chromium host messages are internal; the loopback API still
  // denies these projection methods to external and scoped clients.
  channel?.onMethod("history.projectSnapshot", params => invoke("history.projectSnapshot", params, { external: false }));
  channel?.onMethod("history.projectDelta", params => invoke("history.projectDelta", params, { external: false }));
  // Native notification/page-change/Calendar adapters submit provenance here;
  // external and scoped API clients cannot mint automation events.
  channel?.onMethod("routines.ingestEvent", params => invoke("routines.ingestEvent", params, { external: false }));

  // ---- loopback API ----
  const token = config.apiToken || randomUUID();
  const api = new ApiServer({ token, invoke, events, authorizeScopedToken: scopedToken => agentConnections.authorize(scopedToken) });
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
  const dueTimer = setInterval(() => {
    void invoke("routines.due", {}, { external: false }).catch(() => undefined);
  }, 60_000);
  dueTimer.unref?.();
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
      case "view.windowFocused": return pages.onNativeWindowFocused(str(pl.pageId)!, str(pl.windowId)!);
      case "view.navState": return pages.onNativeNavState(str(pl.pageId)!, truthy(pl.canGoBack), truthy(pl.canGoForward));
      case "view.loading": return pages.onNativeLoading(str(pl.pageId)!, truthy(pl.loading));
      case "view.navigationError": return pages.onNativeNavigationError(str(pl.pageId)!, pl.error as { url: string; code: number; message: string } | null);
      case "view.crashed": return pages.onNativeCrashed(str(pl.pageId)!);
      case "view.takeover": return pages.onNativeTakeover(str(pl.pageId)!);
      case "view.downloadStarted":
        return pages.onNativeDownloadStarted(str(pl.pageId), {
          id: str(pl.id) ?? `dl_${Date.now()}`,
          sourceUrl: str(pl.sourceUrl),
          filename: str(pl.filename) ?? "download",
          path: str(pl.path) ?? "",
          size: Number(pl.size ?? 0),
          totalBytes: pl.totalBytes ? Number(pl.totalBytes) : undefined,
          startedAt: Number(pl.startedAt ?? Date.now()),
        });
      case "view.downloadFinished":
        return pages.onNativeDownload(str(pl.pageId), {
          id: str(pl.id) ?? `dl_${Date.now()}`,
          sourceUrl: str(pl.sourceUrl),
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
          pageId: str(pl.pageId),
          windowId: str(pl.windowId),
          marker: str(pl.marker)!,
          url: str(pl.url) ?? "about:blank",
          title: str(pl.title),
          backend: "aux",
          active: pl.activate === true,
          showBlankDocument: pl.showBlankDocument === true,
        }).then(page => pl.activate === true ? pages.activate(page.pageId) : undefined).catch(() => {});
        return;
      case "view.removed": return pages.onNativeRemoved(str(pl.pageId)!, true, pl.discarded === true);
      // Main-owned tab catalog patches — presence/focus/placement truth for
      // human tabs; field convergence still rides view.* above (§7.1/§7.2).
      case "tabs.catalog": return pages.syncCatalog(payload as Parameters<typeof pages.syncCatalog>[0]);
      case "native.bookmarksChanged": {
        void invoke("bookmarks.list", {}, { external: false }).then(bookmarks => {
          events.emit("bookmarks.changed", { bookmarks });
        }).catch(error => console.error("Chromium bookmarks refresh failed", error));
        return;
      }
      case "app.closing": return pages.shuttingDown();
    }
  });

  let closed = false;
  const browsingMemory = new BrowsingMemory(repo);
  const memoryExpiry = setInterval(() => { try { browsingMemory.prune(); } catch (error) { console.error("Browsing memory cleanup failed", error); } }, 60_000);
  const pruneContent = () => { try {
    const pruned = contentMemory?.prune();
    for (const workspaceId of pruned?.workspaceIds ?? []) runs.redactForgottenArticleOutputs(workspaceId);
    if (pruned?.workspaceIds.length) privacyCheckpoint.request();
  } catch (error) { console.error("Page-content memory cleanup failed", error); } };
  pruneContent();
  const contentExpiry = setInterval(pruneContent, 60_000);
  memoryExpiry.unref();
  contentExpiry.unref();
  const shutdown = async () => {
    clearInterval(memoryExpiry);
    clearInterval(contentExpiry);
    contentMemory?.close();
    clearInterval(dueTimer);
    if (closed) return;
    closed = true;
    process.off("unhandledRejection", onUnhandledRejection);
    process.off("uncaughtException", onUncaughtException);
    await runs.messages.stop();
    runs.coordinator.markInterrupted();
    try { markCloudDesktopClosed(repo); } catch { /* local records only */ }
    await api.close().catch(() => {});
    await invoke.dispose().catch(() => {});
    await drivers.aux?.disconnect().catch(() => {});
    await drivers.chrome?.disconnect().catch(() => {});
    await nativeCdp?.close();
    await calendar.close();
    hostSocket?.close();
    tracer.close();
    await privacyCheckpoint.close();
    repo.close();
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
    console.error("[aux-runtime] unhandled rejection:", reason instanceof Error ? reason.stack ?? reason.message : reason);
    try {
      const failed = runs.coordinator.failActive(`runtime fault — unhandled rejection: ${describeFault(reason)}`);
      if (failed.length) console.error(`[aux-runtime] marked ${failed.length} active run(s) failed`);
    } catch {
      /* the ledger itself may be the thing that failed */
    }
  };
  const onUncaughtException = (err: Error) => {
    if (closed) return;
    console.error("[aux-runtime] uncaught exception:", err.stack ?? err.message);
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
  await pages.restoreTabs().catch(() => {});
  runs.messages.resumePending();

  channel?.notify("runtime.ready", { port });
  return {
    port,
    token,
    invoke: (m, p) => invoke(m, p),
    close: shutdown,
  };
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun || normalizeAuxEnvironment(process.env).AUX_RUNTIME_AUTOSTART === "1") {
  startRuntime().then((h) => {
    console.log(`[aux-runtime] api=http://127.0.0.1:${h.port}`);
  }).catch((e) => {
    console.error("[aux-runtime] failed:", e);
    process.exit(1);
  });
}
