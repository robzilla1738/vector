import { overnightRoot } from "./services/run-lineage.js";
import { saveAuthorizedModelCall } from "./services/model-call-authority.js";
import { installOvernightAuthority } from "./services/overnight-authority.js";
import { checkNightShiftDispatch, nightShiftEffectAuthority } from "./features/overnight-review/service.js";
import { SafetyAuthorityRevocation } from "./safety/authority-revocation.js";
import { z } from "zod";
import { createClock } from "@aux/contracts";
import { bootRuntimeFeatures } from "./features/registry.js";
import type { Services } from "./api/methods/context.js";
import { ConnectionRecovery } from "./connection-recovery.js";
import { readRuntimeIdentity } from "./api/runtime-identity.js";
import { developmentAcceptanceStages } from "./api/development-acceptance.js";
import { BrowsingMemory } from "./services/browsing-memory.js";
import { ContentMemoryStore } from "./services/content-memory.js";
import { MemoryPipeline } from "./services/memory-pipeline.js";
import { createMcpTransportProvider } from "./services/mcp-transport-provider.js";
import { McpOAuthService } from "./services/mcp-oauth.js";
import { OutboundMcpService } from "./services/outbound-mcp.js";
import { HookService, type HookExecutor } from "./services/hooks.js";
import { installRunEndHooks } from "./services/hook-dispatch.js";
import { WorkspaceFolderService } from "./services/workspace-folders.js";
import { BrowserBookmarkLedger } from "./services/browser-bookmark-ledger.js";
import { CommandRankingStore } from "./services/command-ranking.js";
import { registerNativeCommandRanking } from "./services/command-ranking-native.js";
import { registerNativeReceiptChannel } from "./services/native-receipt-channel.js";
import { BrowserEgress } from "./safety/browser-egress.js";
import { browserEgressApproval } from "./safety/browser-egress-approval.js";
/**
 * Aux runtime entry point.
 *
 * Spawned by the Electron main process via child_process.fork, connected to
 * the Chromium host over an authenticated local socket, or run standalone.
 * The same runtime and versioned agent API serve each native host.
 */
import { createHash, randomUUID } from "node:crypto";
import { chmodSync, mkdirSync, realpathSync, renameSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  EventTypes,
  AuxError,
  EffectRequestSchema,
  OriginRuleSchema,
  RoutinePageChangeTargetParamsSchema,
  TaskSchema,
  SubagentProfileSchema,
  ZapSnapshotParamsSchema,
  auxFeatureEnabled,
  isElementRef,
  normalizeAuxEnvironment,
  type Step,
} from "@aux/contracts";
import { RpcChannel, type Transport } from "@aux/contracts";
import {
  AttachedChromeDriver,
  StandaloneDriver,
  ManagedChromiumDriver,
  type BrowserDriver,
} from "@aux/chromium-driver";
import { dotEnvCandidates, loadConfig, loadDotEnv } from "./config.js";
import { openDb, SCHEMA_VERSION } from "./store/db.js";
import { prepareProtectedDatabase } from "./store/protected-startup.js";
import {
  bootstrapWatchdog,
  developmentPeerIdentity,
  isAddrInUse,
  resolvePortInUse,
  type DevelopmentPeerIdentity,
} from "./lifecycle.js";
import { PrivacyCheckpoint } from "./store/privacy-checkpoint.js";
import { Repo } from "./store/repo.js";
import { EventBus } from "./events.js";
import { ChannelNativeBridge, NullNativeBridge, type NativeBridge } from "./native.js";
import { featureStagesFor } from "./api/feature-stages.generated.js";
import { NativeCdpBroker } from "./native-cdp-broker.js";
import { PageService, type DriverSet } from "./services/pages.js";
import { TurnMentionService } from "./services/turn-mention-service.js";
import { NativePermissionController } from "./safety/native-permission.js";
import { ConnectorCatalogService } from "./services/connectors.js";
import { RoutineService } from "./services/routines.js";
import { SetService } from "./services/sets.js";
import { RunService } from "./services/runs.js";
import { TaskService } from "./services/tasks.js";
import { GoalService } from "./services/goals.js";
import { CommandEscalationService } from "./services/command-escalation.js";
import { SubagentService } from "./services/subagents.js";
import { BudgetsService } from "./services/budgets.js";
import { handlePageTakeover } from "./services/page-takeover.js";
import { registerNativeControlChannel } from "./services/native-control-channel.js";
import { ArtifactStore } from "./services/artifacts.js";
import { artifactExportDescriptor, renderWorkbookForNativeExport } from "./services/native-file-export.js";
import { minimizeLegacyObservationArtifacts } from "./services/observation-artifact-migration.js";
import { applyPendingRuntimeRestore } from "./services/runtime-backup.js";
import { CookieService } from "./services/cookies.js";
import { SettingsService } from "./services/settings.js";
import { ResponseStore } from "./services/responses.js";
import { OperationService } from "./services/operations.js";
import { StateService } from "./services/state.js";
import { Tracer } from "./services/tracing.js";
import { makeInvoker } from "./api/invoke.js";
import { ApiServer } from "./api/server.js";
import { AgentConnectionService } from "./services/agent-connections.js";
import { nativeAgentClients, nativeAgentConfig } from "./services/native-agent-connections.js";
import { ExternalSessionService } from "./services/external-sessions.js";
import { CalendarConnectionService } from "./services/calendar-connections.js";
import { pollCalendarRoutines } from "./services/calendar-routine-poll.js";
import { ZapService } from "./services/zap.js";
import { ContentBlockingService } from "./services/content-blocking.js";
import { runBench } from "./services/bench.js";
import { compileAndAuthorize } from "./agent/action-compiler.js";
import { AgentWebTools, permittedWebUrl } from "./agent/web-tools.js";
import type { AgentLoopHostDeps } from "./agent/loop/host.js";
import { BashSeatbelt } from "./agent/loop/bash.js";
import type { LoopPark } from "./agent/loop/types.js";
import { runWebmcp, webmcpTurn } from "./agent/webmcp.js";
import { attachBidiRuntime } from "./services/bidi.js";
import { VaultService } from "./services/vault.js";
import { DurableWriteLedger, PageClaimStore } from "./agent/durable.js";
import { modelCallCost } from "./agent/model-client.js";
import { ApprovalStore } from "./safety/approval.js";
import { SafetyAuditStore } from "./safety/audit.js";
import { decide, DecisionJournal, type DecideDeps } from "./safety/decide.js";
import { SafetyDispatchGate } from "./safety/dispatch.js";
import { SuspensionStore } from "./safety/suspensions.js";
import { createGuardianJudge } from "./safety/guardian-model.js";
import { connectHostSocket, type HostSocketTransport } from "./host-socket.js";
import { startupHostChannel } from "./startup-host-channel.js";

export interface RuntimeHandle {
  port: number;
  token: string;
  invoke: (method: string, params: unknown) => Promise<unknown>;
  close: () => Promise<void>;
}

function loopbackPortTaken(port: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    const onError = (error: Error) => {
      if (isAddrInUse(error)) resolve(true);
      else reject(error);
    };
    server.once("error", onError);
    server.listen(port, "127.0.0.1", () => {
      server.removeListener("error", onError);
      server.close((error) => (error ? reject(error) : resolve(false)));
    });
  });
}

/**
 * Take over only a strictly older daemon with the same unsigned development
 * identity. A busy older peer gets the idle wait. A foreign, changed, or
 * unverifiable peer is left running. The database stays closed until this
 * returns: opening it migrates, and that lock makes a live peer look changed.
 */
async function takeoverOrDecline(
  dataDir: string,
  port: number,
  identity: DevelopmentPeerIdentity,
): Promise<void> {
  const outcome = await resolvePortInUse({
    dataDir,
    ourSchema: SCHEMA_VERSION,
    boundPort: port,
    identity,
  });
  process.stderr.write(`[runtime] ${outcome.action}: ${outcome.reason}\n`);
  if (outcome.action === "peer-serves" || outcome.action === "defer") {
    throw new Error(`runtime port takeover declined: ${outcome.reason}`);
  }
}

export async function startRuntime(processEnv = process.env): Promise<RuntimeHandle> {
  // `.env` in the data dir, then in the cwd — real environment variables
  // always win. The README promised this; nothing loaded it before.
  const configured = normalizeAuxEnvironment(processEnv);
  const env =
    configured.AUX_LOAD_DOTENV === "0" ? configured : loadDotEnv(processEnv, dotEnvCandidates(processEnv));
  const config = loadConfig(env);
  const developmentIdentity = developmentPeerIdentity();
  // Port 0 asks the kernel for a free port, so there is no incumbent to review.
  if (config.apiPort !== 0 && await loopbackPortTaken(config.apiPort)) {
    await takeoverOrDecline(config.dataDir, config.apiPort, developmentIdentity);
  }
  await applyPendingRuntimeRestore(config.dataDir, config.dbPath, env.AUX_BROWSER_PROFILE_ID);
  const db = openDb(config.dbPath);
  let channel: RpcChannel | null = null;
  let hostSocket: HostSocketTransport | null = null;
  let releaseHostStartup: (() => void) | undefined;
  let columnCipher: Awaited<ReturnType<typeof prepareProtectedDatabase>> | undefined;
  try {
    if (env.AUX_HOST_SOCKET) {
      const generation = env.AUX_HOST_GENERATION ?? "";
      if (!/^[1-9][0-9]*$/.test(generation)) throw new Error("Aux host generation is missing");
      hostSocket = await connectHostSocket(env.AUX_HOST_SOCKET, env.AUX_HOST_TOKEN ?? "", 15_000, generation);
      const startup = startupHostChannel(hostSocket);
      channel = startup.channel;
      releaseHostStartup = startup.release;
      const native = new ChannelNativeBridge(channel);
      columnCipher = await prepareProtectedDatabase(db, native, env.AUX_BROWSER_PROFILE_ID ?? "");
    }
  } catch (error) {
    db.close();
    hostSocket?.close();
    throw error;
  }
  const repo = new Repo(db, columnCipher);
  const workspaceFolders = new WorkspaceFolderService(repo, () => [config.dataDir]);
  const folderRootsForRun = (runId?: string, access: "read" | "write" = "write") => {
    const workspaceId = runId ? repo.getRun(runId)?.config?.contextWorkspaceId : undefined;
    return workspaceId ? workspaceFolders.roots(workspaceId)[access] : [];
  };
  if (env.AUX_HOST_SOCKET && env.AUX_BROWSER_PROFILE_ID) repo.requireChromiumHistory();
  const privacyCheckpoint = new PrivacyCheckpoint(config.dbPath, (error) =>
    process.stderr.write(`[runtime] privacy checkpoint failed: ${error.message}\n`),
  );
  repo.pruneEvents();
  setTimeout(() => {
    try {
      repo.pruneRetention();
    } catch {
      /* retried next start */
    }
  }, 10_000).unref();
  const events = new EventBus(repo);

  // ---- loopback API, bound early behind the readiness gate ----
  // 06-T: the port binds before the service tree finishes building so early
  // callers get a real 503 readiness answer instead of ECONNREFUSED; the
  // bootstrap watchdog exits if the tree stalls before setReady().
  type InvokeFn = (
    m: string,
    p: unknown,
    client?: {
      external: boolean;
      connectionId?: string;
      scope?: import("@aux/contracts").AgentConnectionScope;
    },
  ) => Promise<unknown>;
  let resolveInvoker: (fn: InvokeFn) => void;
  const invokerReady = new Promise<InvokeFn>((r) => (resolveInvoker = r));
  let invokeRef: ReturnType<typeof makeInvoker> | undefined;
  let agentConnections: AgentConnectionService | undefined;
  const disarmWatchdog = bootstrapWatchdog();
  const token = config.apiToken || randomUUID();
  const peerIdentity = { instanceId: randomUUID(), pid: process.pid, schema: SCHEMA_VERSION,
    startedAt: Date.now() };
  const api = new ApiServer({
    token,
    peerIdentity,
    invoke: (method, params, client) => invokerReady.then((fn) => fn(method, params, client)),
    events,
    authorizeScopedToken: (scopedToken) => agentConnections?.authorize(scopedToken) ?? null,
    closedScopedToken: (scopedToken) => agentConnections?.closedClient(scopedToken) ?? null,
    filterEvent: (client, event) =>
      client.scope ? (invokeRef?.eventVisible(client.scope, client.connectionId, event) ?? false) : true,
  });
  try {
    await api.listen(config.apiPort);
  } catch (error) {
    if (!isAddrInUse(error)) throw error;
    // The port was free at the preflight and was taken while the database
    // opened. Review it again before replacing the listener.
    await takeoverOrDecline(config.dataDir, config.apiPort, developmentIdentity);
    await api.listen(config.apiPort);
  }
  const port = api.port;
  // the bearer token lives here — owner-only, and re-chmod'd because
  // writeFileSync's mode applies only when the file is first created
  const runtimeFile = join(config.dataDir, "runtime.json");
  const descriptorTemp = `${runtimeFile}.${peerIdentity.instanceId}.tmp`;
  writeFileSync(
    descriptorTemp,
    JSON.stringify({
      port,
      token,
      pid: peerIdentity.pid,
      instanceId: peerIdentity.instanceId,
      version: { schema: SCHEMA_VERSION },
      startedAt: peerIdentity.startedAt,
      uid: developmentIdentity.uid,
      executable: developmentIdentity.executable,
    }),
    { mode: 0o600 },
  );
  try {
    chmodSync(descriptorTemp, 0o600);
  } catch {
    /* non-POSIX fs */
  }
  renameSync(descriptorTemp, runtimeFile);
  // The descriptor is public before the service tree exists. Hold the gate
  // across a short timer so a client that just read runtime.json can observe
  // the not-ready /health body; one microtask is not a long enough window
  // for that HTTP round trip (06-T).
  await new Promise((resolve) => setTimeout(resolve, 50));

  const settings = new SettingsService(repo, config.settingsPath, env);
  const durableWrites = new DurableWriteLedger(repo.db);
  const safetyAudit = new SafetyAuditStore(repo.db, repo.columnCipher);
  const approvals = new ApprovalStore(repo.db, (event) => safetyAudit.record(event), repo.columnCipher);
  const suspensions = new SuspensionStore(repo.db, (event) => safetyAudit.record(event));
  // Shared claim ledger — the page dialog decision reads it before `runs`
  // exists, so it lives here and flows into RunService deps.
  const pageClaims = new PageClaimStore(repo.db);
  const decideDeps: DecideDeps = {
    approvals,
    journal: new DecisionJournal(repo.db),
    managedRules: () => OriginRuleSchema.array().parse(repo.getSetting("managedOriginPolicies") ?? []),
    userRules: () => settings.originPolicies(),
    localCeiling: (action) => settings.safetyCeiling(action.effect),
    settingsGrants: () => settings.effectGrants(),
    audit: (event) => safetyAudit.record({ ...event }),
  };
  const safetyGate = new SafetyDispatchGate({
        ...decideDeps,
        suspensions,
        onConfirmation: (confirmation) => events.emit("safety.confirmation", confirmation),
        ...(env.AUX_HOST_SOCKET ? { judge: createGuardianJudge({
          model: () => settings.model(),
          modelId: () => settings.plannerModel(),
          beforeCall: async runId => {
            if (runId) { await checkNightShiftDispatch(repo, runId); budgets.assertWithin({ runId }); }
          },
          recordAttempt: async (attempt, modelId, error, runId) =>
            saveAuthorizedModelCall(repo, {
              ...(runId ? { runId } : {}),
              callId: randomUUID(),
              role: "guardian",
              modelId,
              durationMs: attempt.durationMs,
              inputTokens: attempt.inputTokens,
              outputTokens: attempt.outputTokens,
              providerMetadata: attempt.providerMetadata,
              ...modelCallCost(modelId, attempt),
              ...(error ? { error } : {}),
              createdAt: Date.now(),
            }),
        }) } : {}),
      });
  /**
   * Runtime-side egress (operation session requests) goes through the same
   * decide() boundary as page effects. There is no approval UI mid-request,
   * so asks collapse to deny-with-refusal; grants and rules are the consent.
   */
  const decideEgress = async (input: { url: URL; method: string; runId?: string }) => {
    const run = input.runId ? repo.getRun(input.runId) : undefined;
    const taskId = run?.config?.taskId;
    const upper = input.method.toUpperCase();
    const category = ["GET", "HEAD", "OPTIONS"].includes(upper)
      ? "read"
      : upper === "DELETE"
        ? "delete"
        : "send";
    const decision = await decide(
      EffectRequestSchema.parse({
        profileId: env.AUX_BROWSER_PROFILE_ID ?? "default",
        scope: taskId
          ? { kind: "task", id: taskId }
          : { kind: "workspace", id: run?.config?.contextWorkspaceId ?? "default" },
        actor: "builtin_agent",
        effect: "egress",
        category,
        action: `operation.request.${upper}`,
        origin: input.url.origin,
        destination: input.url.href.slice(0, 2048),
        dataClasses: [],
        provenance: "template",
        invocationDigest: createHash("sha256")
          .update(JSON.stringify(["operation.request", input.url.href, upper]))
          .digest("hex"),
        turnId: input.runId ?? "runtime",
        threadId: run?.config?.chatId ?? "runtime",
        ...(input.runId ? { runId: input.runId } : {}),
        requestedAt: Date.now(),
      }),
      decideDeps,
      { phase: "dispatch", headless: true },
    );
    if (decision.status !== "allow")
      throw new AuxError(
        "permission_denied",
        decision.status === "deny"
          ? decision.guidance
          : "Egress requires an approval that must be granted in Aux.",
        decision.status === "deny" ? { refusalId: decision.refusalId } : undefined,
      );
  };
  const artifacts = new ArtifactStore(config.artifactsDir, repo, events);
  let observationMaintenance: Promise<number> | null = null;
  const observationMaintenanceTimer = setTimeout(() => {
    observationMaintenance = minimizeLegacyObservationArtifacts(repo, config.artifactsDir);
    void observationMaintenance.catch((error) =>
      process.stderr.write(
        `[runtime] observation artifact maintenance failed: ${error instanceof Error ? error.message : String(error)}\n`,
      ),
    );
  }, 10_000).unref();

  // ---- channel to the native browser host ----
  if (!env.AUX_HOST_SOCKET && env.AUX_IPC === "1" && typeof process.send === "function") {
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
  const runtimeIdentity = readRuntimeIdentity(import.meta.url);
  const nativeIdentity = env.AUX_HOST_SOCKET ? native.capabilities!() : undefined;
  const featureStages = nativeIdentity
    ? nativeIdentity
        .then((capabilities) => developmentAcceptanceStages(
          featureStagesFor(capabilities.methods,
            runtimeIdentity && !runtimeIdentity.dirty && runtimeIdentity.label === capabilities.sourceCommit
              ? capabilities.qualifiedFeatures : []),
          config.dataDir, capabilities.sourceCommit, env.AUX_DEV_ACCEPTANCE_TOKEN))
        .catch((error) => {
          process.stderr.write(`[runtime] native capabilities unavailable: ${String(error)}\n`);
          return featureStagesFor([], []);
        })
    : undefined;
  const blocking = env.AUX_HOST_SOCKET
    ? new ContentBlockingService(config.dataDir, native, env.AUX_BROWSER_PROFILE_ID ?? "default")
    : null;
  const blockingBoot = blocking?.boot();
  if (blocking) {
    for (const method of [
      "blocking.status",
      "blocking.privacy",
      "blocking.update",
      "blocking.add",
      "blocking.remove",
      "blocking.setSourceEnabled",
      "blocking.setEnabled",
      "blocking.setSiteAllowed",
      "blocking.removeAllowedHost",
    ]) {
      channel?.onMethod(method, (params) => blockingBoot!.then(() => blocking.handle(method, params)));
    }
    void blockingBoot
      ?.then(() => blocking.maintain())
      .catch((error) => process.stderr.write(`[runtime] content blocking unavailable: ${String(error)}\n`));
    const filterTimer = setInterval(
      () => {
        void blocking
          .maintain()
          .catch((error) => process.stderr.write(`[runtime] filter refresh failed: ${String(error)}\n`));
      },
      60 * 60 * 1000,
    );
    filterTimer.unref?.();
  }
  const zap = new ZapService(repo, native, env.AUX_BROWSER_PROFILE_ID ?? "default");
  // Register before service boot so the host can preload styles before restoring tabs.
  channel?.onMethod("zap.snapshot", async (params) => {
    const profileId = ZapSnapshotParamsSchema.parse(params).profileId;
    const host = env.AUX_HOST_SOCKET ? "chromium-fork" : "electron";
    const stages = await featureStages;
    const snapshot = zap.snapshot(profileId);
    return auxFeatureEnabled("zapAndUserCss", host, stages) ? snapshot : [];
  });
  settings.attachNative(native);

  // These authenticated host-only methods prepare local files for native save dialogs.
  channel?.onMethod("artifact.exportDescriptor", (params) => {
    const artifactId = (params as { artifactId?: unknown })?.artifactId;
    if (typeof artifactId !== "string") throw new Error("Invalid artifact identity");
    return artifactExportDescriptor(repo, artifactId, config.artifactsDir);
  });
  channel?.onMethod("workbook.renderExport", (params) => {
    const request = params as { content?: unknown; format?: unknown };
    if (typeof request?.content !== "string" ||
        (request.format !== undefined && request.format !== "snapshot" && request.format !== "csv"))
      throw new Error("Invalid workbook export request");
    return renderWorkbookForNativeExport(request.content, request.format as "snapshot" | "csv" | undefined);
  });

  // Register api.invoke immediately — the renderer can call before services
  // finish booting; calls wait on the invoker promise instead of failing.
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
      repo.upsertSession({
        sessionId,
        backend: d.backend,
        label,
        status: "degraded",
        detail: "backend connection dropped — reconnecting on next use",
      });
      events.emit("session.changed", { backend: d.backend, status: "degraded" });
    };
    d.onReconnected = () => {
      repo.upsertSession({ sessionId, backend: d.backend, label, status: "connected" });
      events.emit("session.changed", { backend: d.backend, status: "connected" });
    };
  };
  const nativeCdp = env.AUX_HOST_SOCKET && channel ? await NativeCdpBroker.start(channel) : null;
  let auxRecovery: ConnectionRecovery | undefined;
  const hostCdp =
    nativeCdp?.endpoint() ??
    (env.AUX_INTERNAL_CDP === "1" && channel
      ? await channel.call<string>("cdp.capability", {}, 15_000).catch(() => null)
      : config.hostCdp);
  if (hostCdp) {
    const d = new ManagedChromiumDriver(hostCdp, {
      trustedPages: native.listPages ? async () => (await native.listPages!()).pages : undefined,
    });
    watchDriver(d, "aux", "Aux");
    // Keep the driver available even if the first handshake times out.
    drivers.aux = d;
    let initialConnectionFailed = false;
    auxRecovery = new ConnectionRecovery({
      reconnect: () => d.reconnect(),
      isConnected: () => d.isConnected(),
      onReady: () => {
        // Later drops emit onReconnected from the driver itself.
        if (initialConnectionFailed) {
          initialConnectionFailed = false;
          d.onReconnected?.();
        }
      },
    });
    const reportDisconnected = d.onDisconnected;
    d.onDisconnected = () => {
      reportDisconnected?.();
      auxRecovery?.retry();
    };
    try {
      await d.connect();
      repo.upsertSession({ sessionId: "aux", backend: "aux", label: "Aux", status: "connected" });
    } catch (e) {
      repo.upsertSession({
        sessionId: "aux",
        backend: "aux",
        label: "Aux",
        status: "degraded",
        detail: `CDP connect failed: ${e instanceof Error ? e.message : e}`,
      });
      initialConnectionFailed = true;
      auxRecovery.retry();
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
  const contentMemory =
    native.available() && env.AUX_BROWSER_PROFILE_ID
      ? new ContentMemoryStore(repo, native, env.AUX_BROWSER_PROFILE_ID, Date.now, events)
      : undefined;
  const memoryPipeline =
    native.available() && env.AUX_BROWSER_PROFILE_ID
      ? new MemoryPipeline(repo, native, join(config.dataDir, "space-memory"), env.AUX_BROWSER_PROFILE_ID)
      : undefined;
  // pages↔operations are mutually dependent — late-bind via a lazy ref
  let operations!: OperationService;
  let turnMentions!: TurnMentionService;
  let browserEgress: BrowserEgress | undefined;
  const pages = new PageService({
    get turnMentions() { return turnMentions; },
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
    prepareAgentEgress: (runId, pageId) => browserEgress?.ensure(runId, pageId) ?? Promise.resolve(),
    recordAgentObservation: (pageId, url, text) => {
      const runId = pageClaims.activeForPage(pageId)?.runId;
      // Owner/API reads can hold a short page claim without an agent run.
      // Only a durable run may taint its protected egress context.
      if (runId && repo.getRun(runId)) browserEgress?.notePageText(runId, pageId, text, url);
    },
    // unified step ledger — every execution records steps with pageId so
    // operations.compile can rebuild the trace (§10.3)
    recordStep: (s) => repo.saveStep(s),
    grants: () => settings.effectGrants(),
    grantsForRun: () => settings.effectGrantsForRun(),
    // Upload reads are confined to runtime-owned storage plus paths the user
    // attached to the task (file/repository resource locators).
    uploadRoots: ({ taskId }) => {
      const roots = [config.artifactsDir, config.downloadsDir, config.previewsDir];
      if (taskId) {
        try {
          const row = repo.db.prepare("SELECT json FROM tasks WHERE task_id=?").get(taskId) as
            { json: string } | undefined;
          const task = row ? TaskSchema.parse(JSON.parse(repo.taskJson(taskId, row.json))) : undefined;
          for (const resource of task?.resources ?? [])
            if (resource.kind === "file" || resource.kind === "repository") roots.push(resource.locator);
        } catch {
          /* task deleted — session roots still apply */
        }
      }
      return roots;
    },
    callOperation: async (name, args, pageId) => {
      const slash = name.indexOf("/");
      const siteKey = slash > 0 ? name.slice(0, slash) : new URL(pages.get(pageId).url).host;
      const opName = slash > 0 ? name.slice(slash + 1) : name;
      const r = await operations.invoke({ siteKey, name: opName, inputs: args, pageId });
      if (r.status === "failed") throw new AuxError("step_failed", r.error ?? `operation ${opName} failed`);
      return r.result;
    },
    downloadsDir: config.downloadsDir,
    // Un-armed dialogs are decided by decide() against the page's active
    // claim (S4): deny dismisses, allow keeps the default handling, ask
    // parks the run's suspension and leaves the dialog open until it resumes.
    decideDialog: async ({ pageId, type, message }) => {
      const claim = pageClaims.activeForPage(pageId);
      if (!claim) return undefined;
      const run = repo.getRun(claim.runId);
      const decision = await decide(
        EffectRequestSchema.parse({
          profileId: env.AUX_BROWSER_PROFILE_ID ?? "default",
          scope: run?.config?.taskId
            ? { kind: "task", id: run.config.taskId }
            : { kind: "workspace", id: run?.config?.contextWorkspaceId ?? "default" },
          actor: "builtin_agent",
          effect: "write",
          category: "dialog",
          action: `dialog.${type}`,
          origin: (() => {
            try {
              return new URL(pages.get(pageId).url).origin;
            } catch {
              return claim.pageId;
            }
          })(),
          dataClasses: [],
          provenance: "page",
          invocationDigest: createHash("sha256")
            .update(JSON.stringify(["dialog", pageId, type, message]))
            .digest("hex"),
          turnId: claim.runId,
          threadId: run?.config?.chatId ?? claim.runId,
          runId: claim.runId,
          requestedAt: Date.now(),
        }),
        decideDeps,
        { phase: "dispatch" },
      );
      if (decision.status === "deny") return "dismiss";
      if (decision.status === "ask") {
        suspensions.park({
          runId: claim.runId,
          threadId: run?.config?.chatId ?? claim.runId,
          turnId: claim.runId,
          kind: decision.suspension.kind,
          request: decision.suspension,
        });
        return "leave";
      }
      return undefined;
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

  const mcpOAuth = new McpOAuthService(native);
  const mcpTransportProvider = createMcpTransportProvider(mcpOAuth);
  const outboundMcp = new OutboundMcpService(repo, mcpTransportProvider);
  const hookScratch = join(config.artifactsDir, "hook-tmp");
  mkdirSync(hookScratch, { recursive: true });
  const authorizeHookCommand = (workdir: string, workspaceId: string) => {
    let actual: string;
    try { actual = realpathSync(workdir); }
    catch { throw new AuxError("permission_denied", "Hook working folder is unavailable."); }
    if (!workspaceFolders.roots(workspaceId).write.includes(actual))
      throw new AuxError("permission_denied", "Bind this exact writable folder to the Space before approving a command Hook.");
    return actual;
  };
  const hooks = new HookService(repo, (handler, workspaceId) => {
    if (handler.type === "command") { authorizeHookCommand(handler.workdir, workspaceId); return; }
    if (handler.type !== "mcp_tool") throw new AuxError("capability_unsupported", "Hook handler is unavailable.");
    const server = outboundMcp.get(handler.serverId);
    const grant = outboundMcp.getGrant(handler.grantId);
    if (server.state !== "approved" || server.workspaceId !== workspaceId ||
      grant.serverId !== handler.serverId || grant.toolName !== handler.toolName ||
      grant.scope.kind !== "workspace" || grant.scope.workspaceId !== workspaceId ||
      grant.mode !== "standing" || grant.revokedAt || grant.consumedAt)
      throw new AuxError("permission_denied", "Approve a standing Space grant for this exact MCP tool first.");
  });
  const hookExecutor: HookExecutor = async (handler, context, signal) => {
    if (signal.aborted) throw new AuxError("permission_denied", "Hook was revoked.");
    if (handler.type === "command") {
      const workdir = authorizeHookCommand(handler.workdir, context.workspaceId);
      const seatbelt = new BashSeatbelt({ writableRoots: () => [config.artifactsDir, workdir],
        readableRoots: () => [workdir], scratchDir: hookScratch,
        extraDenyRead: () => [config.dataDir, "/private/var/db/dslocal", "/private/var/db/shadow", "/private/etc/sudoers"] });
      const result = await seatbelt.run({ command: handler.command, workdir, signal },
        { runId: context.runId ?? `hook:${context.eventId}`, threadId: context.runId ?? context.eventId,
          turnId: context.eventId });
      if ("park" in result || result.timedOut || result.exitCode !== 0 || signal.aborted)
        throw new AuxError("step_failed", "Command Hook did not complete successfully.");
      return;
    }
    if (handler.type !== "mcp_tool") throw new AuxError("capability_unsupported", "Hook handler is unavailable.");
    const result = await outboundMcp.callTool(handler.grantId, handler.arguments ?? {},
      { workspaceId: context.workspaceId }, signal);
    if (signal.aborted || result.status !== "completed" || result.isError)
      throw new AuxError("step_failed", "MCP hook tool did not complete successfully.");
  };
  const stopRunEndHooks = installRunEndHooks(events, hooks, hookExecutor);
  const loopbackServicesUrl = (await nativeIdentity?.catch(() => undefined))?.loopbackServicesUrl;
  const calendar = new CalendarConnectionService({
    repo,
    native,
    clientId: loopbackServicesUrl ? "aux-loopback-calendar-client" : env.AUX_GOOGLE_CALENDAR_CLIENT_ID,
    ...(loopbackServicesUrl ? { endpoints: {
      auth: `${loopbackServicesUrl}calendar/auth`, token: `${loopbackServicesUrl}calendar/token`,
      revoke: `${loopbackServicesUrl}calendar/revoke`, calendar: `${loopbackServicesUrl}calendar/v3`,
    } } : {}),
    profileId: env.AUX_BROWSER_PROFILE_ID,
    onChange: () => events.emit("settings.changed", { category: "calendar" }),
  });
  operations = new OperationService({
    repo,
    events,
    pages,
    translateSteps,
    durableWrites,
    calendar,
    authorizeConnector: (runId, connectorId, tool, dispatch) => turnMentions.useConnector(runId, connectorId, tool, dispatch),
    decideEgress,
    grants: () => settings.effectGrants(),
    egressAllowlist: () =>
      (env.AUX_EGRESS_ALLOWLIST ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
  });
  const state = new StateService({ repo, pages, operations });

  /**
   * Built-in loop web tools (S5): every destination goes through decide() as
   * builtin_agent — `allow` runs cookie-free, `ask` parks the run's suspension
   * (the loop resumes with the answer), `deny` throws a refusal. Redirect hops
   * are headless-decided: an approval cannot park mid-fetch, so asks collapse.
   */
  const decideLoopEgress = async (
    ctx: { runId: string; threadId: string; turnId: string },
    dest: URL,
    action: string,
    headless: boolean,
  ) => {
    const run = repo.getRun(ctx.runId);
    return decide(
      EffectRequestSchema.parse({
        profileId: env.AUX_BROWSER_PROFILE_ID ?? "default",
        scope: run?.config?.taskId
          ? { kind: "task", id: run.config.taskId }
          : { kind: "workspace", id: run?.config?.contextWorkspaceId ?? "default" },
        actor: "builtin_agent",
        effect: "egress",
        category: "read",
        action,
        origin: dest.origin,
        destination: dest.href.slice(0, 2048),
        dataClasses: [],
        provenance: "template",
        invocationDigest: createHash("sha256")
          .update(JSON.stringify(["loop.egress", dest.href, action]))
          .digest("hex"),
        turnId: ctx.runId,
        threadId: ctx.threadId,
        runId: ctx.runId,
        requestedAt: Date.now(),
      }),
      decideDeps,
      { phase: "dispatch", headless },
    );
  };
  const loopEgressGate = async (
    ctx: { runId: string; threadId: string; turnId: string },
    url: string,
    action: string,
  ): Promise<URL | { park: import("./agent/loop/types.js").LoopPark }> => {
    const decision = await decideLoopEgress(ctx, permittedWebUrl(url), action, false);
    if (decision.status === "deny") {
      throw new AuxError("permission_denied", decision.guidance, { refusalId: decision.refusalId });
    }
    if (decision.status === "ask") {
      suspensions.park({
        runId: ctx.runId,
        threadId: ctx.threadId,
        turnId: ctx.runId,
        kind: decision.suspension.kind,
        request: decision.suspension,
      });
      return {
        park: {
          kind: decision.suspension.kind,
          instruction: decision.suspension.instruction,
          ...(decision.suspension.approvalId ? { approvalId: decision.suspension.approvalId } : {}),
        },
      };
    }
    return permittedWebUrl(url);
  };
  /**
   * Recipient-scoped decide() (06-X): effects addressed at a local service, not
   * a page origin — `routine_update` and `bash network`. Recipient requests
   * always confirm at action time; an `ask` parks the run's suspension and the
   * loop resumes into the answer like any gated tool.
   */
  const decideLoopRecipient = async (
    ctx: { runId: string; threadId: string; turnId: string },
    input: { action: string; recipient: string; digestParts: unknown[] },
  ) => {
    const run = repo.getRun(ctx.runId);
    return decide(
      EffectRequestSchema.parse({
        profileId: env.AUX_BROWSER_PROFILE_ID ?? "default",
        scope: run?.config?.taskId
          ? { kind: "task", id: run.config.taskId }
          : { kind: "workspace", id: run?.config?.contextWorkspaceId ?? "default" },
        actor: "builtin_agent",
        effect: "external_tool",
        category: "external_tool",
        action: input.action,
        recipient: input.recipient,
        dataClasses: [],
        provenance: "template",
        invocationDigest: createHash("sha256").update(JSON.stringify(input.digestParts)).digest("hex"),
        turnId: ctx.runId,
        threadId: ctx.threadId,
        runId: ctx.runId,
        requestedAt: Date.now(),
      }),
      decideDeps,
      { phase: "dispatch" },
    );
  };
  const recipientGate = async (
    ctx: { runId: string; threadId: string; turnId: string },
    input: { action: string; recipient: string; digestParts: unknown[] },
  ): Promise<"allow" | { park: LoopPark }> => {
    const decision = await decideLoopRecipient(ctx, input);
    if (decision.status === "deny")
      throw new AuxError("permission_denied", decision.guidance, { refusalId: decision.refusalId });
    if (decision.status === "ask") {
      suspensions.park({
        runId: ctx.runId,
        threadId: ctx.threadId,
        turnId: ctx.runId,
        kind: decision.suspension.kind,
        request: decision.suspension,
      });
      return {
        park: {
          kind: decision.suspension.kind,
          instruction: decision.suspension.instruction,
          ...(decision.suspension.approvalId ? { approvalId: decision.suspension.approvalId } : {}),
        },
      };
    }
    return "allow";
  };
  const agentLoop: AgentLoopHostDeps = {
    workspaceContext: workspaceId => workspaceFolders.context(workspaceId),
    webFetch: async (url, ctx) => {
      const gated = await loopEgressGate(ctx, url, "agent.web.fetch");
      if ("park" in gated) return { park: gated.park };
      const web = new AgentWebTools(
        async (hop) => (await decideLoopEgress(ctx, hop, "agent.web.fetch.hop", true)).status === "allow",
      );
      return { output: await web.fetch(gated.href) };
    },
    webSearch: async (query, ctx) => {
      const engine = settings.searchEngine();
      if (!engine) throw new AuxError("backend_unavailable", "Profile search engine is unavailable.");
      const gated = await loopEgressGate(
        ctx,
        engine.replaceAll("%s", encodeURIComponent(query)),
        "agent.web.search",
      );
      if ("park" in gated) return { park: gated.park };
      const web = new AgentWebTools(
        async (hop) => (await decideLoopEgress(ctx, hop, "agent.web.search.hop", true)).status === "allow",
      );
      return { output: await web.search(query, engine) };
    },
    // Auto-recall (06-Z): search protected page memory under the run's workspace policy.
    recall: async (query, ctx) => {
      const ws = repo.getRun(ctx.runId)?.config?.contextWorkspaceId;
      if (!ws || !contentMemory) return [];
      const hits = await contentMemory.search(ws, query, 5);
      for (const hit of hits) browserEgress?.protect(ctx.runId, hit.snippet, "memory");
      return hits.map((hit) => ({ title: hit.title, url: hit.url, text: hit.snippet }));
    },
    // 06-X history_search / memory_search — the same projections the shell uses.
    historySearch: async (query, limit) =>
      repo.listHistory(query, Math.min(Math.max(1, Math.floor(limit)), 50)),
    memorySearch: async (query, ctx) => {
      const ws = repo.getRun(ctx.runId)?.config?.contextWorkspaceId;
      if (!ws || !contentMemory) return [];
      const hits = await contentMemory.search(ws, query, 8);
      for (const hit of hits) browserEgress?.protect(ctx.runId, hit.snippet, "memory");
      return hits.map((hit) => ({
        title: hit.title,
        url: hit.url,
        text: hit.snippet,
        capturedAt: hit.capturedAt,
      }));
    },
    // 06-X notification — a durable notice on the run's event stream.
    notify: async ({ text }, ctx) => {
      events.emit(EventTypes.RunNotice, { text }, ctx.runId);
    },
    repl: {
      bookmark: async (pageId, ctx) => {
        const page = pages.get(pageId);
        const url = permittedWebUrl(page.url);
        const run = repo.getRun(ctx.runId);
        const decision = await decide(EffectRequestSchema.parse({
          profileId: env.AUX_BROWSER_PROFILE_ID ?? "default",
          scope: run?.config?.taskId ? { kind: "task", id: run.config.taskId }
            : { kind: "workspace", id: run?.config?.contextWorkspaceId ?? "default" },
          actor: "code_mode", effect: "write", category: "interact", action: "agent.bookmark.add",
          origin: url.origin, dataClasses: ["none"], provenance: "page",
          invocationDigest: createHash("sha256").update(JSON.stringify([pageId, url.href, page.title])).digest("hex"),
          turnId: ctx.runId, threadId: ctx.threadId, runId: ctx.runId, requestedAt: Date.now(),
        }), decideDeps, { phase: "dispatch" });
        if (decision.status === "deny")
          throw new AuxError("permission_denied", decision.guidance, { refusalId: decision.refusalId });
        if (decision.status === "ask") {
          suspensions.park({ runId: ctx.runId, threadId: ctx.threadId, turnId: ctx.runId,
            kind: decision.suspension.kind, request: decision.suspension });
          return { park: { kind: decision.suspension.kind, instruction: decision.suspension.instruction,
            ...(decision.suspension.approvalId ? { approvalId: decision.suspension.approvalId } : {}) } };
        }
        return { output: await new BrowserBookmarkLedger(repo, native).save(ctx.runId, pageId,
          url.href, page.title || url.hostname) };
      },
      // Authorize the intended target; native additionally inspects its exact
      // first navigation after blank-page binding without a duplicate prompt.
      openTab: async (url, ctx) => {
        const gated = await loopEgressGate(ctx, url, "agent.tab.open");
        if ("park" in gated) return { park: gated.park };
        return { output: { url: gated.href } };
      },
      webmcp: async (pageId, action, ctx) => {
        const page = pages.get(pageId);
        let origin = "";
        try {
          origin = new URL(page.url).origin;
        } catch {
          origin = "";
        }
        const run = repo.getRun(ctx.runId);
        const name = action.op === "call" ? action.name : "list";
        const outcome = await runWebmcp(
          native,
          action.op === "call"
            ? { pageId, op: "call", name: action.name, input: JSON.stringify(action.input ?? {}) }
            : { pageId, op: "tools" },
          {
            profileId: env.AUX_BROWSER_PROFILE_ID ?? "default",
            scope: run?.config?.taskId
              ? { kind: "task", id: run.config.taskId }
              : { kind: "workspace", id: run?.config?.contextWorkspaceId ?? "default" },
            actor: "code_mode",
            ...webmcpTurn(pageId, name),
            runId: ctx.runId,
          },
          decideDeps,
          origin,
        );
        if (outcome.status === "ask") {
          events.emit("safety.confirmation", {
            approvalId: outcome.approvalId,
            turnId: outcome.turnId,
            threadId: outcome.threadId,
            instruction: outcome.instruction,
            action: outcome.action,
            origin: outcome.origin,
          });
          suspensions.park({
            runId: ctx.runId,
            threadId: outcome.threadId,
            turnId: outcome.turnId,
            kind: "approval",
            request: {
              kind: "approval",
              approvalId: outcome.approvalId,
              instruction: outcome.instruction,
              guidance:
                "Pause this action and request approval from the user. Do not dispatch or retry while approval is pending.",
            },
          });
        }
        return outcome;
      },
      fsRoots: (runId, access) => [config.artifactsDir, config.downloadsDir, config.previewsDir,
        ...folderRootsForRun(runId, access)],
      outputDir: config.artifactsDir,
    },
  };

  // User budgets per run/day/routine (D11): limits from settings, actuals
  // from the model_calls ledger — the coordinator and loop host gate each
  // model call through this before spending.
  const budgets = new BudgetsService(repo.db, () => settings.budgetLimits());

  if (env.AUX_HOST_SOCKET && env.AUX_BROWSER_PROFILE_ID) {
    browserEgress = new BrowserEgress({
      profileId: env.AUX_BROWSER_PROFILE_ID,
      native,
      run: runId => {
        const run = repo.getRun(runId);
        if (!run || !["queued", "running", "planning", "needs_input"].includes(run.status)) return null;
        if (run.config?.taskId) {
          try {
            if (new TaskService(repo, events).get(run.config.taskId).revision !== run.config.taskRevision) return null;
          } catch { return null; }
        }
        return { taskId: run.config?.taskId, taskRevision: run.config?.taskRevision ?? 0,
          threadId: run.config?.chatId ?? run.runId };
      },
      page: pageId => pages.get(pageId),
      ownsPage: (runId, pageId) => pageClaims.activeForPage(pageId)?.runId === runId,
      audit: (decision, evidence) => safetyAudit.record({ ...decision, ...evidence, kind: "browser_egress", requestKind: evidence.kind, at: Date.now() }),
      approve: browserEgressApproval({
        profileId: env.AUX_BROWSER_PROFILE_ID, decide: decideDeps, suspensions, events,
        run: runId => repo.getRun(runId),
        setStatus: (runId, status, message) => runs.coordinator.setStatus(runId, status, message),
      }),
    });
    channel!.onMethod("egress.request", params => browserEgress!.request(params));
    events.subscribe(event => {
      const pageId = typeof event.payload.pageId === "string" ? event.payload.pageId : undefined;
      if (pageId && [EventTypes.PageRemoved, EventTypes.PageTakeover, EventTypes.PageCrashed].includes(event.type as typeof EventTypes.PageRemoved))
        browserEgress!.revokePage(pageId);
      if (event.type === EventTypes.PageUpdated && pageId && typeof event.payload.documentEpoch === "number") {
        browserEgress!.revokePage(pageId);
        const runId = pageClaims.activeForPage(pageId)?.runId;
        if (runId) void browserEgress!.ensure(runId, pageId).catch(() => {});
      }
      const changedRun = event.type === "run.updated" ? event.payload.run as { runId?: string; status?: string } | undefined : undefined;
      const runId = changedRun?.runId ?? event.runId;
      const status = changedRun?.status ?? (event.type === EventTypes.RunStatus ? event.payload.status : undefined);
      if (runId && typeof status === "string" && !["queued", "running", "planning", "needs_input"].includes(status)) {
        if (status === "paused") browserEgress!.suspendRun(runId);
        else browserEgress!.revokeRun(runId);
      }
    });
  }
  const mentionRoutines = new RoutineService(repo, events);
  const mentionConnectors = new ConnectorCatalogService({ repo, tasks: new TaskService(repo, events), settings, calendar, mcp: outboundMcp });
  turnMentions = new TurnMentionService({
    authorizeRead: (runId, pageId, taskRead) => pages.authorizeAgentRead(runId, pageId, "page.read", taskRead),
    page: pageId => {
      try { return pages.get(pageId); }
      catch (error) { if (error instanceof AuxError && error.code === "not_found") return undefined; throw error; }
    },
    organization: async () => {
      if (!native.organizationSnapshot) throw new AuxError("backend_unavailable", "Profile source authority is unavailable.");
      return native.organizationSnapshot();
    },
    routine: routineId => {
      try { return mentionRoutines.get(routineId).routine; }
      catch (error) { if (error instanceof AuxError && error.code === "not_found") return undefined; throw error; }
    },
    connectors: context => {
      if (!context.workspaceId) throw new AuxError("permission_denied", "Connector mentions require a current Space.");
      return mentionConnectors.list({ workspaceId: context.workspaceId, taskId: context.taskId, expectedRevision: context.taskRevision });
    },
  });
  let nativePermissions: NativePermissionController | undefined;
  if (channel && browserEgress && env.AUX_BROWSER_PROFILE_ID) {
    nativePermissions = new NativePermissionController({
      profileId: env.AUX_BROWSER_PROFILE_ID,
      gate: safetyGate,
      approvals,
      egress: browserEgress,
      mentions: turnMentions,
      run: runId => repo.getRun(runId),
      page: pageId => pages.get(pageId),
      standingOnly: runId => !!overnightRoot(repo, runId),
      assertDispatch: async runId => { await checkNightShiftDispatch(repo, runId); budgets.assertWithin({ runId }); },
      overnightAuthority: runId => nightShiftEffectAuthority(repo, runId),
      retireReservation: input => native.permissionRetire(input),
      requiresTurn: (run, pageId) => run.config?.implementation !== "external-agent" ||
        !!run.config?.mentions?.length || turnMentions.ownedPages(run.runId).includes(pageId),
      sourceCheck: (runId, pageId) => {
        const before = repo.getRun(runId);
        const claim = pageClaims.activeForPage(pageId);
        const taskId = before?.config?.taskId;
        const taskRevision = before?.config?.taskRevision;
        const task = taskId ? new TaskService(repo, events).get(taskId) : undefined;
        const check = () => {
          const current = repo.getRun(runId);
          const currentClaim = pageClaims.activeForPage(pageId);
          if (!before || !current || !claim || claim.runId !== runId ||
              currentClaim?.claimId !== claim.claimId || currentClaim?.runId !== runId ||
              current.config?.taskId !== taskId || current.config?.taskRevision !== taskRevision ||
              current.config?.messageRevision !== before.config?.messageRevision ||
              !["running", "planning", "needs_input"].includes(current.status))
            throw new AuxError("permission_denied", "This browser permission source claim changed.");
          if (taskId) {
            const currentTask = new TaskService(repo, events).get(taskId);
            if (!task || task.revision !== taskRevision || currentTask.revision !== taskRevision ||
                currentTask.state !== "open" || currentTask.sourceOrigin !== task.sourceOrigin)
              throw new AuxError("permission_denied", "This browser permission task approval changed.");
          }
        };
        check();
        return check;
      },
    });
    installOvernightAuthority(repo, nativePermissions);
    channel.onMethod("permission.request", params => nativePermissions!.request(params));
    channel.onMethod("permission.revalidate", params => nativePermissions!.revalidate(params));
    channel.onMethod("permission.finalize", params => nativePermissions!.finalize(params));
    channel.onMethod("permission.invalidate", params => {
      const input = z.object({ batchId: z.string().min(1).max(160) }).strict().parse(params);
      nativePermissions!.invalidate(input.batchId);
      return { batchId: input.batchId, decision: "deny" };
    });
  }
  const safetyAuthority = new SafetyAuthorityRevocation({
    profileId: env.AUX_BROWSER_PROFILE_ID ?? "default",
    runScope: runId => {
      const run = repo.getRun(runId);
      if (!run) return undefined;
      return run.config?.taskId ? { kind: "task", id: run.config.taskId }
        : { kind: "workspace", id: run.config?.contextWorkspaceId ?? "default" };
    },
    invalidate: matches => {
      nativePermissions?.invalidateAuthority(matches);
      return browserEgress ? browserEgress.invalidateAuthority(matches) : Promise.resolve();
    },
  });
  const runs = new RunService({
    turnMentions,
    taskSource: taskId => { const task = new TaskService(repo, events).get(taskId); return { revision: task.revision, state: task.state, sourceOrigin: task.sourceOrigin }; },
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
    pageClaims,
    budgets,
    agentLoop,
    browserEgress,
  });
  const goals = new GoalService(repo, runs, async () => settings.registryModels());
  const commandEscalations = new CommandEscalationService(repo,
    (workspaceId, workdir) => workspaceFolders.scopeDigest(workspaceId, workdir));
  agentLoop.goalUpdate = async (input, ctx) => goals.report(ctx.runId, input.status, input.blocker, ctx.goalTurn);
  agentLoop.goalBudget = {
    reserve: (runId, request) => goals.reserveModelCall(runId, request),
    settle: (runId, reservationId, attempts) => goals.settleModelCall(runId, reservationId, attempts),
  };

  // Subagent cells (06-Y): the service is shared with the RPC invoker; the
  // REPL spawns cells under a lazily created group per parent run.
  const subagents = new SubagentService(repo, events, runs);
  const replGroups = new Map<string, string>();
  agentLoop.subagents = {
    spawnCell: async (input, ctx) => {
      const run = repo.getRun(ctx.runId);
      if (!run) throw new AuxError("not_found", "The parent run does not exist.");
      let groupId = replGroups.get(ctx.runId);
      if (!groupId) {
        const group = subagents.createGroup({
          parentRunId: ctx.runId,
          tokenBudget: Math.min(Math.max(1_000, run.config?.maxTokens ?? 200_000), 1_000_000),
          costBudgetUsd: Math.min(run.config?.maxCostUsd ?? 5, 50),
          timeBudgetMs: Math.min(Math.max(1_000, run.config?.deadlineMs ?? 600_000), 86_400_000),
        });
        groupId = group.groupId;
        replGroups.set(ctx.runId, groupId);
      }
      const profile = SubagentProfileSchema.safeParse(input.profile ?? "default");
      if (!profile.success)
        throw new AuxError("invalid_params", "profile must be explorer, read_only or default.");
      const agent = await subagents.spawn({
        groupId,
        goal: input.goal,
        profile: profile.data,
        pageIds: input.pageIds?.length ? input.pageIds : run.pageIds,
        tokenAllocation: 50_000,
        costAllocationUsd: 1,
        maxModelCalls: 8,
      });
      return { cellId: agent.agentId };
    },
    waitCell: (cellId, timeoutMs) => subagents.waitFor(cellId, timeoutMs),
    sendCell: async (cellId, text) => {
      const agent = subagents.get(cellId);
      if (!agent.runId) throw new AuxError("conflict", "This cell has not started yet.");
      subagents.sendMessage(cellId, agent.runId, text);
    },
    cancelCell: async (cellId) => {
      subagents.cancel(cellId);
    },
  };

  // 06-X bash under the macOS seatbelt: writes confined to the same session
  // roots the REPL fs uses, network off by default — `network: true` takes the
  // recipient-scoped decide() (always confirms, can park).
  const bashScratch = join(config.artifactsDir, "bash-tmp");
  mkdirSync(bashScratch, { recursive: true });
  const bashSeatbelt = new BashSeatbelt({
    writableRoots: ctx => [config.artifactsDir, config.downloadsDir, config.previewsDir,
      ...folderRootsForRun(ctx?.runId, "write")],
    readableRoots: ctx => folderRootsForRun(ctx?.runId, "read"),
    scratchDir: bashScratch,
    // Reads stay broad for tool usability, minus the runtime data dir (API
    // token, cookies, history DBs) and OS credential stores; /Users is denied
    // by the profile itself and the session roots are re-allowed after it.
    extraDenyRead: () => [
      config.dataDir,
      join(config.dataDir, "runtime.json"),
      "/private/var/db/dslocal",
      "/private/var/db/shadow",
      "/private/etc/sudoers",
    ],
    networkGate: (command, ctx) =>
      recipientGate(ctx, {
        action: "agent.bash.network",
        recipient: "process:network",
        digestParts: ["agent.bash.network", command],
      }),
    escalationGate: async (input, ctx) => {
      const run = repo.getRun(ctx.runId);
      if (!run) throw new AuxError("not_found", "Escalated run does not exist.");
      return commandEscalations.authorize({ ...input, runId: ctx.runId,
        workspaceId: run.config?.contextWorkspaceId ?? "default" });
    },
    escalationRecheck: ({ workdir, scopeDigest, requestIds }, ctx) => {
      const run = repo.getRun(ctx.runId);
      if (!run) throw new AuxError("not_found", "Escalated run does not exist.");
      commandEscalations.assertDispatch(run.config?.contextWorkspaceId ?? "default",
        workdir, scopeDigest, requestIds);
    },
  });
  agentLoop.bash = async (input, ctx) => {
    const result = await bashSeatbelt.run(input, ctx);
    return "park" in result ? result : { output: result };
  };
  // 06-X routine_update: a model-proposed automation change confirms with the
  // user (recipient-scoped decide()), then lands through the routines API —
  // workspace-scoped to the run and optimistic-concurrency protected.
  agentLoop.routineUpdate = async (input, ctx) => {
    const requireMentionedSkill = () => {
      const result = turnMentions.requireSkill(ctx.runId, input.routineId);
      if (result.status === "unavailable") throw new AuxError("permission_denied", result.reason);
    };
    const run = repo.getRun(ctx.runId);
    const messageRevision = run?.config?.messageRevision;
    const mentionTurn = run?.config?.mentions?.length ? turnMentions.capture(ctx.runId) : undefined;
    if (mentionTurn) requireMentionedSkill();
    const current = (await invoke("routines.get", { routineId: input.routineId }, { external: false })) as {
      workspaceId: string;
      revision: number;
    };
    const ws = run?.config?.contextWorkspaceId;
    if (ws && current.workspaceId !== ws)
      throw new AuxError("permission_denied", "This routine belongs to another Space.");
    const patch = Object.fromEntries(
      Object.entries(input).filter(
        ([key, value]) => key !== "routineId" && key !== "expectedRevision" && value !== undefined,
      ),
    );
    if (!Object.keys(patch).length) throw new AuxError("invalid_params", "Name one field to update.");
    const expectedRevision = input.expectedRevision ?? current.revision;
    const gated = await recipientGate(ctx, {
      action: "agent.routine.update",
      recipient: `routine:${input.routineId}`,
      digestParts: ["agent.routine.update", input.routineId, expectedRevision, patch],
    });
    if (gated !== "allow") return gated;
    if (repo.getRun(ctx.runId)?.config?.messageRevision !== messageRevision ||
      mentionTurn && turnMentions.capture(ctx.runId) !== mentionTurn)
      throw new AuxError("permission_denied", "This routine update belongs to a replaced person turn.");
    if (mentionTurn) requireMentionedSkill();
    const updated = await invoke(
      "routines.update",
      { routineId: input.routineId, expectedRevision, ...patch },
      { external: false },
    );
    return { output: updated };
  };

  const extractingRuns = new Set<string>();
  events.subscribe((event) => {
    if (event.type !== EventTypes.RunUpdated || !memoryPipeline) return;
    const run = event.payload.run;
    if (
      !run ||
      typeof run !== "object" ||
      !("status" in run) ||
      run.status !== "completed" ||
      !("runId" in run) ||
      typeof run.runId !== "string" ||
      extractingRuns.has(run.runId)
    )
      return;
    const workspaceId =
      "config" in run && run.config && typeof run.config === "object" && "contextWorkspaceId" in run.config
        ? run.config.contextWorkspaceId
        : undefined;
    if (typeof workspaceId !== "string" || !memoryPipeline.policy(workspaceId).enabled) return;
    const runId = run.runId;
    extractingRuns.add(runId);
    void memoryPipeline
      .extractRun(workspaceId, runId)
      .then((result) => {
        if (result.extracted) events.emit("workspace.memory.updated", { workspaceId, runId });
      })
      .catch(() => events.emit("memory.pipeline.failed", { workspaceId, runId }))
      .finally(() => extractingRuns.delete(runId));
  });

  events.subscribe((e) => {
    if (e.type !== EventTypes.PageTakeover) return;
    const pageId = e.payload.pageId;
    const controller = e.payload.controller;
    if (typeof pageId !== "string" || typeof controller !== "string") return;
    void handlePageTakeover(pageId, controller, repo, runs).catch(error => console.error("[aux-runtime] page takeover retirement failed", error));
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
  agentConnections = new AgentConnectionService(repo);
  const externalSessions = new ExternalSessionService(repo, events, turnMentions);
  channel?.onMethod("agent.connections", () => agentConnections!.list());
  channel?.onMethod("agent.clients", () => nativeAgentClients());
  channel?.onMethod("agent.config", (params) => nativeAgentConfig(agentConnections!, params, config.dataDir));
  channel?.onMethod("agent.revoke", (params) => {
    const connectionId = (params as { connectionId?: unknown })?.connectionId;
    if (typeof connectionId !== "string") throw new Error("Invalid connection identity");
    const revoked = agentConnections!.revoke(connectionId);
    externalSessions.end(connectionId, "cancelled", "Connection revoked");
    return revoked;
  });

  const services: Services = {
    budgets,
    clock: createClock((await nativeIdentity?.catch(() => undefined))?.testClockScale),
    featureHost: env.AUX_HOST_SOCKET ? "chromium-fork" : "electron",
    featureProfileId: env.AUX_BROWSER_PROFILE_ID ?? "default",
    featureStages,
    nativeIdentity,
    runtimeIdentity,
    native,
    downloadsDir: config.downloadsDir,
    zap,
    contentMemory,
    memoryPipeline,
    mcpTransportProvider,
    outboundMcp,
    hooks,
    hookExecutor,
    workspaceFolders,
    mcpOAuth,
    checkpointDeletedData: () => privacyCheckpoint.request(),
    safetyAuthority,
    turnMentions,
    pages,
    sets,
    runs,
    goals,
    commandEscalations,
    artifacts,
    settings,
    events,
    repo,
    agentConnections,
    externalSessions,
    subagents,
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
  };
  const invoke = makeInvoker(services);
  const stopFeatures = await bootRuntimeFeatures(services, invoke);
  // Authenticated Chromium host messages are internal; the loopback API still
  // denies these projection methods to external and scoped clients.
  channel?.onMethod("history.projectSnapshot", (params) =>
    invoke("history.projectSnapshot", params, { external: false }),
  );
  channel?.onMethod("history.projectDelta", (params) =>
    invoke("history.projectDelta", params, { external: false }),
  );
  if (channel) {
    registerNativeReceiptChannel(channel, repo, () => pages.list());
    registerNativeCommandRanking(channel, pages, new CommandRankingStore(repo, services.featureProfileId ?? "default"));
  }
  // Native notification/page-change/Calendar adapters submit provenance here;
  // external and scoped API clients cannot mint automation events.
  channel?.onMethod("routines.ingestEvent", (params) =>
    invoke("routines.ingestEvent", params, { external: false }),
  );
  const pageChangeWatches = new RoutineService(repo, events);
  channel?.onMethod("routines.pageChangeTarget", (params) => {
    const { pageId, url } = RoutinePageChangeTargetParamsSchema.parse(params);
    return pageChangeWatches.pageChangeTarget(pageId, url);
  });

  // ---- channel surface for the shell ----
  // The loopback port has been bound since bootstrap began; flipping the
  // readiness gate is the last step — callers were 503'd until now.
  invokeRef = invoke;
  resolveInvoker!(invoke);
  const sweepExternalSessions = () => {
    try {
      externalSessions.sweepIdle();
    } catch (error) {
      console.error("External session sweep failed", error);
    }
  };
  sweepExternalSessions();
  const calendarAutomationAvailable = !featureStages || (await featureStages).connectors === "on";
  const calendarScanAbort = new AbortController();
  let calendarScan: Promise<void> | undefined;
  const scanCalendar = () => {
    if (!calendarAutomationAvailable || calendarScan || calendarScanAbort.signal.aborted || !calendar.list().available) return;
    const watches = pageChangeWatches.calendarWatches();
    if (!watches.length) return;
    calendarScan = pollCalendarRoutines(watches, calendar, (event) =>
      invoke("routines.ingestEvent", event, { external: false }), Date.now(), calendarScanAbort.signal)
      .catch((error) => { if (!calendarScanAbort.signal.aborted) console.error("Calendar automation scan failed", error); })
      .finally(() => { calendarScan = undefined; });
  };
  void scanCalendar();
  const dueTimer = setInterval(() => {
    sweepExternalSessions();
    void invoke("routines.due", {}, { external: false }).catch(() => undefined);
    void scanCalendar();
  }, 60_000);
  dueTimer.unref?.();
  // forward the event stream so the shell renderer can subscribe over IPC
  events.subscribe((e) => channel?.notify("event", e));
  if (channel) registerNativeControlChannel(channel, pages, code =>
    console.error("Native takeover notification failed", code));
  channel?.onNotify((type, payload) => {
    const pl = (payload ?? {}) as Record<string, unknown>;
    const str = (v: unknown) => (v === undefined || v === null ? undefined : String(v));
    const truthy = (v: unknown) => v === true || v === "true";
    switch (type) {
      case "view.navigated":
        return pages.onNativeNavigated(str(pl.pageId)!, str(pl.url)!);
      case "view.titleChanged":
        return pages.onNativeTitle(str(pl.pageId)!, str(pl.title) ?? "");
      case "view.faviconChanged":
        return pages.onNativeFavicon(str(pl.pageId)!, str(pl.favicon) ?? "");
      case "view.windowFocused":
        return pages.onNativeWindowFocused(str(pl.pageId)!, str(pl.windowId)!);
      case "view.navState":
        return pages.onNativeNavState(str(pl.pageId)!, truthy(pl.canGoBack), truthy(pl.canGoForward));
      case "view.loading":
        return pages.onNativeLoading(str(pl.pageId)!, truthy(pl.loading));
      case "view.navigationError":
        return pages.onNativeNavigationError(
          str(pl.pageId)!,
          pl.error as { url: string; code: number; message: string; upgradedFrom?: string } | null,
        );
      case "view.crashed":
        return pages.onNativeCrashed(str(pl.pageId)!);
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
        void pages
          .registerExternal({
            pageId: str(pl.pageId),
            windowId: str(pl.windowId),
            marker: str(pl.marker)!,
            url: str(pl.url) ?? "about:blank",
            title: str(pl.title),
            backend: "aux",
            active: pl.activate === true,
            showBlankDocument: pl.showBlankDocument === true,
          })
          .then((page) => (pl.activate === true ? pages.activate(page.pageId) : undefined))
          .catch(() => {});
        return;
      case "view.removed":
        return pages.onNativeRemoved(str(pl.pageId)!, true, pl.discarded === true);
      // Main-owned tab catalog patches — presence/focus/placement truth for
      // human tabs; field convergence still rides view.* above (§7.1/§7.2).
      case "tabs.catalog":
        return pages.syncCatalog(payload as Parameters<typeof pages.syncCatalog>[0]);
      case "native.bookmarksChanged": {
        void invoke("bookmarks.list", {}, { external: false })
          .then((bookmarks) => {
            events.emit("bookmarks.changed", { bookmarks });
          })
          .catch((error) => console.error("Chromium bookmarks refresh failed", error));
        return;
      }
      case "app.closing":
        return pages.shuttingDown();
    }
  });

  releaseHostStartup?.();
  api.setReady();
  disarmWatchdog();

  let closed = false;
  const browsingMemory = new BrowsingMemory(repo);
  const memoryExpiry = setInterval(() => {
    try {
      browsingMemory.prune();
    } catch (error) {
      console.error("Browsing memory cleanup failed", error);
    }
  }, 60_000);
  let contentPruning = false;
  const pruneContent = async () => {
    if (contentPruning) return;
    contentPruning = true;
    try {
      const pruned = await contentMemory?.prune();
      for (const workspaceId of pruned?.workspaceIds ?? []) await runs.redactForgottenArticleOutputs(workspaceId);
      if (pruned?.workspaceIds.length) privacyCheckpoint.request();
    } catch (error) {
      console.error("Page-content memory cleanup failed", error);
    } finally {
      contentPruning = false;
    }
  };
  void pruneContent();
  const contentExpiry = setInterval(() => { void pruneContent(); }, 60_000);
  memoryExpiry.unref();
  contentExpiry.unref();
  const shutdown = async () => {
    browserEgress?.close();
    clearTimeout(observationMaintenanceTimer);
    clearInterval(memoryExpiry);
    clearInterval(contentExpiry);
    calendarScanAbort.abort();
    await calendarScan;
    contentMemory?.close();
    clearInterval(dueTimer);
    if (closed) return;
    closed = true;
    process.off("unhandledRejection", onUnhandledRejection);
    process.off("uncaughtException", onUncaughtException);
    await runs.messages.stop();
    await runs.coordinator.markInterrupted();
    await stopFeatures();
    await api.close().catch(() => {});
    await invoke.dispose().catch(() => {});
    await auxRecovery?.stop();
    await drivers.aux?.disconnect().catch(() => {});
    await drivers.chrome?.disconnect().catch(() => {});
    await nativeCdp?.close();
    await calendar.close();
    mcpOAuth.close();
    stopRunEndHooks();
    hostSocket?.close();
    tracer.close();
    await privacyCheckpoint.close();
    await observationMaintenance?.catch(() => {});
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
  const onUnhandledRejection = async (reason: unknown) => {
    if (closed) return;
    console.error(
      "[aux-runtime] unhandled rejection:",
      reason instanceof Error ? (reason.stack ?? reason.message) : reason,
    );
    try {
      const failed = await runs.coordinator.failActive(
        `runtime fault — unhandled rejection: ${describeFault(reason)}`,
      );
      if (failed.length) console.error(`[aux-runtime] marked ${failed.length} active run(s) failed`);
    } catch {
      /* the ledger itself may be the thing that failed */
    }
  };
  const onUncaughtException = async (err: Error) => {
    if (closed) return;
    console.error("[aux-runtime] uncaught exception:", err.stack ?? err.message);
    try {
      await runs.coordinator.failActive(`runtime fault — uncaught exception: ${describeFault(err)}`);
    } catch {
      /* best effort */
    }
    void shutdown().finally(() => process.exit(1));
  };
  process.on("unhandledRejection", onUnhandledRejection);
  process.on("uncaughtException", onUncaughtException);
  // The native host owns this helper. A closed authenticated socket means its
  // owner has exited; finish the journal and release the Profile database.
  hostSocket?.onClose?.(() => {
    if (!closed) void shutdown().finally(() => process.exit(0));
  });

  // recover from an unclean stop: anything still "live" never completed.
  // Invocation rows persisted 'running' before dispatch (§13.3) reconcile
  // to 'interrupted' with unknown effect — never assumed applied or not.
  await runs.coordinator.markInterrupted();
  repo.markRunningInvocationsInterrupted();
  // Suspensions parked by runs that did not survive the restart expire; a
  // still-parked suspension belongs to a resumable run and resurfaces for UI.
  const liveRunIds = new Set(
    repo
      .listRuns(200)
      .filter((run) => ["queued", "planning", "running", "paused", "needs_input"].includes(run.status))
      .map((run) => run.runId),
  );
  suspensions.expireOrphans(liveRunIds);
  // The same for durable page claims: a dead run cannot still own a tab.
  runs.pageClaims.releaseOrphans(liveRunIds);

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
  startRuntime()
    .then((h) => {
      console.log(`[aux-runtime] api=http://127.0.0.1:${h.port}`);
    })
    .catch((e) => {
      console.error("[aux-runtime] failed:", e);
      process.exit(1);
    });
}
