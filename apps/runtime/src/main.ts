import { ProjectsService } from "./services/projects.js";
import type { VercelSandboxExecutor } from "./services/vercel-sandbox-executor.js";
import type { CloudExecutionContext } from "./services/cloud-execution.js";
import type { CloudRunAdmission } from "./services/cloud-run-admission.js";
import type { CopilotServices } from "./services/copilot-services.js";
import { deferRuntimeWork, isRuntimeIdle } from "./services/idle.js";
import { markInterruptedRuns } from "./services/startup-recovery.js";
import { createServiceContainer, type ServiceContainer } from "./services/container.js";
import { navigateControlledPage } from "./services/pages/controlled-navigation.js";
import { registerNativeSubagentWorkload } from "./services/native-subagent-workload.js";
import { runtimeShutdown, RuntimeShutdownAdmission } from "./services/runtime-shutdown.js";
import { withRunAuthorityMutation } from "./services/overnight-authority.js";
import { overnightRoot, runAncestry, runRoot, lineageRuns } from "./services/run-lineage.js";
import { installBrowserAuthority, installOvernightAuthority } from "./services/overnight-authority.js";
import { checkNightShiftDispatch, nightShiftEffectAuthority } from "./features/overnight-review/service.js";
import { z } from "zod";
import { createClock } from "@aux/contracts";
import { bootRuntimeFeatures } from "./features/registry.js";
import type { Services } from "./api/methods/context.js";
import { ConnectionRecovery } from "./connection-recovery.js";
import { readRuntimeIdentity } from "./api/runtime-identity.js";
import { BrowsingMemory } from "./services/browsing-memory.js";
import { ContentMemoryStore } from "./services/content-memory.js";
import { MemoryPipeline } from "./services/memory-pipeline.js";
import { createMcpTransportProvider } from "./services/mcp-transport-provider.js";
import { McpOAuthService } from "./services/mcp-oauth.js";
import { OutboundMcpService } from "./services/outbound-mcp.js";
import { HookService, type HookExecutor } from "./services/hooks.js";
import { installRunEndHooks } from "./services/hook-dispatch.js";
import { WorkspaceFolderService } from "./services/workspace-folders.js";
import { FilesystemAccessService } from "./services/filesystem-access.js";
import { requireFilesystemPath } from "./services/filesystem-policy.js";
import { resolveNativeUserDataDir } from "@aux/contracts/installation";
import { BrowserBookmarkLedger } from "./services/browser-bookmark-ledger.js";
import { CommandRankingStore } from "./services/command-ranking.js";
import { registerNativeCommandRanking } from "./services/command-ranking-native.js";
import { registerNativeDeviceConfirmation } from "./services/native-device-confirmation.js";
import { resumeApproval } from "./services/approval-continuation.js";
import { registerNativeReceiptChannel } from "./services/native-receipt-channel.js";
import { BrowserEgress } from "./safety/browser-egress.js";
import { browserEgressApproval } from "./safety/browser-egress-approval.js";
/**
 * Aux runtime entry point.
 *
 * Spawned by the native Chromium host over an authenticated local socket.
 * The same runtime and versioned agent API also support external-only use.
 */
import { createHash, randomUUID } from "node:crypto";
import { chmodSync, mkdirSync, renameSync, writeFileSync } from "node:fs";
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
  normalizeAuxEnvironment,
  type Step,
} from "@aux/contracts";
import type { RpcChannel } from "@aux/contracts";
import { ManagedChromiumDriver, type BrowserDriver } from "@aux/chromium-driver";
import { dotEnvCandidates, loadConfig, loadDotEnv } from "./config.js";
import { openDb, SCHEMA_VERSION } from "./store/db.js";
import { FieldCodec, initializeFieldCodec } from "./store/field-codec.js";
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
import { featureAvailabilityFor } from "@aux/contracts";
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
import { SubagentService } from "./services/subagents.js";
import { BudgetsService } from "./services/budgets.js";
import { handlePageTakeover } from "./services/page-takeover.js";
import { registerNativeControlChannel } from "./services/native-control-channel.js";
import { applyNativePageTakeover } from "./services/native-page-takeover.js";
import { ArtifactStore } from "./services/artifacts.js";
import { artifactExportDescriptor, renderWorkbookForNativeExport } from "./services/native-file-export.js";
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
import { ApprovalStore } from "./safety/approval.js";
import { SafetyAuditStore } from "./safety/audit.js";
import { decide, DecisionJournal, type DecideDeps } from "./safety/decide.js";
import { SafetyDispatchGate } from "./safety/dispatch.js";
import { SuspensionStore } from "./safety/suspensions.js";
import { connectHostSocket, type HostSocketTransport } from "./host-socket.js";
import { registerDownloadNamingChannel, startupHostChannel } from "./startup-host-channel.js";

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
 * returns: opening it initializes schema, and that lock makes a live peer look changed.
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
  const bootStarted = performance.now();
  let phaseStarted = bootStarted;
  const bootPhase = (phase: string) => {
    const at = performance.now();
    process.stderr.write(
      `[runtime] boot ${JSON.stringify({
        phase,
        durationMs: Math.round((at - phaseStarted) * 100) / 100,
        elapsedMs: Math.round((at - bootStarted) * 100) / 100,
      })}\n`,
    );
    phaseStarted = at;
  };
  const shutdownAdmission = new RuntimeShutdownAdmission();
  // `.env` in the data dir, then in the cwd — real environment variables
  // always win. The README promised this; nothing loaded it before.
  const configured = normalizeAuxEnvironment(processEnv);
  const env =
    configured.AUX_LOAD_DOTENV === "0" ? configured : loadDotEnv(processEnv, dotEnvCandidates(processEnv));
  const config = loadConfig(env);
  const bashScratch = join(config.artifactsDir, "bash-tmp");
  mkdirSync(bashScratch, { recursive: true });
  const developmentIdentity = developmentPeerIdentity();
  // Port 0 asks the kernel for a free port, so there is no incumbent to review.
  if (config.apiPort !== 0 && (await loopbackPortTaken(config.apiPort))) {
    await takeoverOrDecline(config.dataDir, config.apiPort, developmentIdentity);
  }
  await applyPendingRuntimeRestore(config.dataDir, config.dbPath, env.AUX_BROWSER_PROFILE_ID);
  bootPhase("restore");
  const db = openDb(config.dbPath);
  bootPhase("database");
  let channel: RpcChannel | null = null;
  let hostSocket: HostSocketTransport | null = null;
  let releaseHostStartup: (() => void) | undefined;
  let columnCipher: FieldCodec | undefined;
  try {
    if (env.AUX_HOST_SOCKET) {
      const generation = env.AUX_HOST_GENERATION ?? "";
      if (!/^[1-9][0-9]*$/.test(generation)) throw new Error("Aux host generation is missing");
      hostSocket = await connectHostSocket(env.AUX_HOST_SOCKET, env.AUX_HOST_TOKEN ?? "", 15_000, generation);
      const startup = startupHostChannel(hostSocket);
      channel = startup.channel;
      releaseHostStartup = startup.release;
      const native = new ChannelNativeBridge(channel);
      columnCipher = await initializeFieldCodec(db, native, env.AUX_BROWSER_PROFILE_ID ?? "");
    }
  } catch (error) {
    db.close();
    hostSocket?.close();
    throw error;
  }
  bootPhase("protection");
  const repo = new Repo(db, columnCipher);
  let closed = false;
  let cliInstallTail = Promise.resolve();
  const cliInstallWork = new Set<Promise<unknown>>();
  let stopNativeDeviceConfirmation: (() => void) | undefined;
  let stopRunEndHooks: (() => void) | undefined;
  type RuntimeServices = Services & {
    workspaceFolders: WorkspaceFolderService;
    projects: ProjectsService;
    filesystem: FilesystemAccessService;
    settings: SettingsService;
    copilot: Promise<CopilotServices>;
    durableWrites: DurableWriteLedger;
    safetyAudit: SafetyAuditStore;
    decisions: DecisionJournal;
    approvals: ApprovalStore;
    suspensions: SuspensionStore;
    pageClaims: PageClaimStore;
    safetyGate: SafetyDispatchGate;
    artifacts: ArtifactStore;
    zap: ZapService;
    tracer: Tracer;
    responses: ResponseStore;
    vault: VaultService;
    contentMemory: ContentMemoryStore | undefined;
    memoryPipeline: MemoryPipeline | undefined;
    pages: PageService;
    sets: SetService;
    mcpOAuth: McpOAuthService;
    mcpTransportProvider: ReturnType<typeof createMcpTransportProvider>;
    outboundMcp: OutboundMcpService;
    hooks: HookService;
    calendar: CalendarConnectionService;
    operations: OperationService;
    state: StateService;
    budgets: BudgetsService;
    mentionRoutines: RoutineService;
    mentionConnectors: ConnectorCatalogService;
    turnMentions: TurnMentionService;
    runs: RunService;
    goals: GoalService;
    subagents: SubagentService;
    bashSeatbelt: BashSeatbelt;
    cookies: CookieService;
    agentConnections: AgentConnectionService;
    externalSessions: ExternalSessionService;
    pageChangeWatches: RoutineService;
    browsingMemory: BrowsingMemory;
    tasks: TaskService;
    blocking: ContentBlockingService | null;
    commandRanking: CommandRankingStore;
  };
  const serviceContainer: ServiceContainer<RuntimeServices> = createServiceContainer<RuntimeServices>({
    workspaceFolders: () => new WorkspaceFolderService(repo, () => [config.dataDir]),
    projects: () => new ProjectsService(native, runtimeServices.workspaceFolders, runtimeServices.filesystem),
    filesystem: () =>
      new FilesystemAccessService({
        internalRoots: [config.artifactsDir, config.downloadsDir, config.previewsDir],
        scratchDir: bashScratch,
        protectedRoots: [config.dataDir, resolveNativeUserDataDir(env)],
        settings: () => runtimeServices.settings.fileAccess(),
        reviewedRoots: (runId) => {
          const read = folderRootsForRun(runId, "read");
          const taskId = runId ? repo.getRun(runId)?.config?.taskId : undefined;
          const task = taskId
            ? repo.db.prepare("SELECT json FROM tasks WHERE task_id=?").get(taskId)
            : undefined;
          if (task && typeof task.json === "string")
            for (const resource of TaskSchema.parse(JSON.parse(task.json)).resources ?? [])
              if (resource.kind === "file" || resource.kind === "repository") read.push(resource.locator);
          return { read, write: folderRootsForRun(runId, "write") };
        },
      }),
    settings: () => new SettingsService(repo, config.settingsPath, env),
    copilot: async () => {
      if (closed) throw new AuxError("cancelled", "Copilot construction retired.");
      const { CopilotServices } = await import("./services/copilot-services.js");
      if (closed) throw new AuxError("cancelled", "Copilot construction retired.");
      const settings = runtimeServices.settings;
      const services = new CopilotServices({
        native,
        dataDir: config.dataDir,
        hostId: settings.copilotHostId(),
        registration: () => settings.copilotRegistration(),
        generation: () => settings.copilotGeneration(),
        checkOwner: (original, requester) => settings.checkCopilotOwner(original, requester),
        activate: (account, check) => settings.activateCopilotAccount(account, check),
        deactivate: (accountId, check) => settings.deactivateCopilotAccount(accountId, check),
      });
      return services;
    },
    durableWrites: () => new DurableWriteLedger(repo.db),
    safetyAudit: () => new SafetyAuditStore(repo.db),
    decisions: () => new DecisionJournal(repo.db),
    approvals: () =>
      new ApprovalStore(
        repo.db,
        (event) => runtimeServices.safetyAudit.record(event),
        (action) => runtimeServices.settings.allowAgentSite(action),
        () => runtimeServices.settings.agentPolicy(),
      ),
    suspensions: () => new SuspensionStore(repo.db, (event) => runtimeServices.safetyAudit.record(event)),
    pageClaims: () => new PageClaimStore(repo.db),
    safetyGate: () =>
      new SafetyDispatchGate({
        ...decideDeps,
        suspensions: runtimeServices.suspensions,
        onConfirmation: (confirmation) => events.emit("safety.confirmation", confirmation),
      }),
    artifacts: () => new ArtifactStore(config.artifactsDir, repo, events),
    zap: () => new ZapService(repo, native, env.AUX_BROWSER_PROFILE_ID ?? "default"),
    tracer: () => new Tracer(repo.db, { traceDir: join(config.dataDir, "traces") }),
    responses: () => new ResponseStore({ repo, events, artifacts: runtimeServices.artifacts }),
    vault: () => new VaultService(repo, native),
    contentMemory: () =>
      native.available() && env.AUX_BROWSER_PROFILE_ID
        ? new ContentMemoryStore(repo, native, env.AUX_BROWSER_PROFILE_ID, Date.now, events)
        : undefined,
    memoryPipeline: () =>
      native.available() && env.AUX_BROWSER_PROFILE_ID
        ? new MemoryPipeline(repo, native, env.AUX_BROWSER_PROFILE_ID)
        : undefined,
    pages: () =>
      new PageService({
        get turnMentions() {
          return runtimeServices.turnMentions;
        },
        repo,
        profileId: env.AUX_BROWSER_PROFILE_ID,
        events,
        native,
        nativePasswordFillEnabled: !!env.AUX_HOST_SOCKET,
        drivers: () => drivers,
        get artifacts() {
          return runtimeServices.artifacts;
        },
        get responses() {
          return runtimeServices.responses;
        },
        get tracer() {
          return runtimeServices.tracer;
        },
        get durableWrites() {
          return runtimeServices.durableWrites;
        },
        get safetyGate() {
          return runtimeServices.safetyGate;
        },
        prepareAgentEgress: (runId, pageId) => browserEgress?.ensure(runId, pageId) ?? Promise.resolve(),
        retireCreatedPage: (runId, pageId) => {
          if (!browserEgress)
            throw new AuxError("capability_unsupported", "Authenticated native cleanup is unavailable.");
          return browserEgress.retireCreatorPage(runId, pageId);
        },
        navigateControlled: (input, registry) => {
          if (!browserEgress || !nativeCdp)
            throw new AuxError("capability_unsupported", "Authenticated native navigation is unavailable.");
          return navigateControlledPage(input, registry, browserEgress, nativeCdp);
        },
        recordAgentObservation: (pageId, url, text) => {
          const runId = runtimeServices.pageClaims.activeForPage(pageId)?.runId;
          // Owner/API reads can hold a short page claim without an agent run.
          // Only a durable run may taint its protected egress context.
          if (runId && repo.getRun(runId)) browserEgress?.notePageText(runId, pageId, text, url);
        },
        // unified step ledger — every execution records steps with pageId so
        // operations.compile can rebuild the trace (§10.3)
        recordStep: (s) => repo.saveStep(s),
        uploadRead: (path, input) => runtimeServices.filesystem.readUpload(path, input.runId, input.signal),
        callOperation: async (name, args, pageId) => {
          const slash = name.indexOf("/");
          const siteKey =
            slash > 0 ? name.slice(0, slash) : new URL(runtimeServices.pages.get(pageId).url).host;
          const opName = slash > 0 ? name.slice(slash + 1) : name;
          const r = await runtimeServices.operations.invoke({ siteKey, name: opName, inputs: args, pageId });
          if (r.status === "failed")
            throw new AuxError("step_failed", r.error ?? `operation ${opName} failed`);
          return r.result;
        },
        downloadsDir: config.downloadsDir,
        // Un-armed dialogs are decided by decide() against the page's active
        // claim (S4): deny dismisses, allow keeps the default handling, ask
        // parks the run's suspension and leaves the dialog open until it resumes.
        decideDialog: async ({ pageId, type, message }) => {
          const claim = runtimeServices.pageClaims.activeForPage(pageId);
          if (!claim) return undefined;
          const run = repo.getRun(claim.runId);
          const page = runtimeServices.pages.get(pageId);
          const request = EffectRequestSchema.parse({
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
                return new URL(runtimeServices.pages.get(pageId).url).origin;
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
          });
          const decision = await decide(request, decideDeps, { phase: "dispatch" });
          const current = runtimeServices.pages.get(pageId);
          if (
            runtimeServices.pageClaims.activeForPage(pageId)?.claimId !== claim.claimId ||
            current.documentEpoch !== page.documentEpoch ||
            current.url !== page.url ||
            current.controller !== page.controller
          )
            return "dismiss";
          if (decision.status === "deny") return "dismiss";
          if (decision.status === "ask") {
            runtimeServices.safetyGate.park(request, { ...request, pageId }, decision.suspension);
            return "leave";
          }
          return undefined;
        },
      }),
    sets: () => new SetService(repo, events, runtimeServices.pages),
    mcpOAuth: () => new McpOAuthService(native),
    mcpTransportProvider: () => createMcpTransportProvider(runtimeServices.mcpOAuth),
    outboundMcp: () => new OutboundMcpService(repo, runtimeServices.mcpTransportProvider),
    hooks: () =>
      new HookService(repo, (handler, workspaceId) => {
        if (handler.type === "command") {
          requireFilesystemPath(hookFilesystemPolicy(workspaceId), handler.workdir, "read");
          return;
        }
        if (handler.type !== "mcp_tool")
          throw new AuxError("capability_unsupported", "Hook handler is unavailable.");
        const server = runtimeServices.outboundMcp.get(handler.serverId);
        if (server.state !== "active" || server.workspaceId !== workspaceId ||
            !server.toolNames.includes(handler.toolName) || server.disabledTools.includes(handler.toolName))
          throw new AuxError("permission_denied", "Connect this MCP server and enable its tool first.");
      }),
    calendar: () =>
      new CalendarConnectionService({
        repo,
        native,
        clientId: loopbackServicesUrl ? "aux-loopback-calendar-client" : env.AUX_GOOGLE_CALENDAR_CLIENT_ID,
        ...(loopbackServicesUrl
          ? {
              endpoints: {
                auth: `${loopbackServicesUrl}calendar/auth`,
                token: `${loopbackServicesUrl}calendar/token`,
                revoke: `${loopbackServicesUrl}calendar/revoke`,
                calendar: `${loopbackServicesUrl}calendar/v3`,
              },
            }
          : {}),
        profileId: env.AUX_BROWSER_PROFILE_ID,
        onChange: () => events.emit("settings.changed", { category: "calendar" }),
      }),
    operations: () =>
      new OperationService({
        repo,
        events,
        pages: runtimeServices.pages,
        durableWrites: runtimeServices.durableWrites,
        calendar: runtimeServices.calendar,
        authorizeConnector: (runId, connectorId, tool, dispatch) =>
          runtimeServices.turnMentions.useConnector(runId, connectorId, tool, dispatch),
        decideEgress,
        egressAllowlist: () =>
          (env.AUX_EGRESS_ALLOWLIST ?? "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
      }),
    state: () =>
      new StateService({ repo, pages: runtimeServices.pages, operations: runtimeServices.operations }),
    budgets: () =>
      new BudgetsService(repo.db, () => runtimeServices.settings.budgetLimits(), {
        root: (runId) => runRoot(repo, runId),
        runLimitUsd: (rootRunId) => repo.getRun(rootRunId)?.config?.maxCostUsd,
        descendants: (runId) => lineageRuns(repo, runId),
      }),
    mentionRoutines: () => new RoutineService(repo, events),
    mentionConnectors: () =>
      new ConnectorCatalogService({
        repo,
        tasks: runtimeServices.tasks,
        settings: runtimeServices.settings,
        calendar: runtimeServices.calendar,
        mcp: runtimeServices.outboundMcp,
      }),
    turnMentions: () =>
      new TurnMentionService({
        prepareReadPage: (pageId) => runtimeServices.pages.prepareReadPage(pageId),
        authorizeRead: (runId, pageId, taskRead) =>
          runtimeServices.pages.authorizeAgentRead(runId, pageId, "page.read", taskRead),
        page: (pageId) => {
          try {
            return runtimeServices.pages.get(pageId);
          } catch (error) {
            if (error instanceof AuxError && error.code === "not_found") return undefined;
            throw error;
          }
        },
        organization: async () => {
          if (!native.organizationSnapshot)
            throw new AuxError("backend_unavailable", "Profile source authority is unavailable.");
          return native.organizationSnapshot();
        },
        routine: (routineId) => {
          try {
            return runtimeServices.mentionRoutines.get(routineId).routine;
          } catch (error) {
            if (error instanceof AuxError && error.code === "not_found") return undefined;
            throw error;
          }
        },
        connectors: (context) => {
          if (!context.workspaceId)
            throw new AuxError("permission_denied", "Connector mentions require a current Space.");
          return runtimeServices.mentionConnectors.list({
            workspaceId: context.workspaceId,
            taskId: context.taskId,
            expectedRevision: context.taskRevision,
          });
        },
      }),
    runs: () => {
      const runs = new RunService({
        approvals: runtimeServices.approvals,
        suspensions: runtimeServices.suspensions,
        turnMentions: runtimeServices.turnMentions,
        taskSource: (taskId) => {
          const task = runtimeServices.tasks.get(taskId);
          return { revision: task.revision, state: task.state, sourceOrigin: task.sourceOrigin };
        },
        repo,
        events,
        pages: runtimeServices.pages,
        sets: runtimeServices.sets,
        settings: runtimeServices.settings,
        artifacts: runtimeServices.artifacts,
        nativeAvailable: () => native.available(),
        tracer: runtimeServices.tracer,
        vault: runtimeServices.vault,
        calendar: runtimeServices.calendar,
        contentMemory: runtimeServices.contentMemory,
        memoryPipeline: runtimeServices.memoryPipeline,
        operations: runtimeServices.operations,
        durableWrites: runtimeServices.durableWrites,
        pageClaims: runtimeServices.pageClaims,
        budgets: runtimeServices.budgets,
        agentLoop,
        browserEgress,
      });
      stopRunEndHooks = installRunEndHooks(events, runtimeServices.hooks, hookExecutor);
      return runs;
    },
    goals: () =>
      new GoalService(repo, runtimeServices.runs),
    subagents: () => new SubagentService(repo, events, runtimeServices.runs),
    bashSeatbelt: () =>
      new BashSeatbelt({
        filesystemPolicy: (ctx) => runtimeServices.filesystem.snapshot(ctx?.runId),
        networkDefault: () => runtimeServices.settings.agentPolicy().agentMode !== "ask",
        scratchDir: bashScratch,
        networkGate: (command, ctx) =>
          recipientGate(ctx, {
            action: "agent.bash.network",
            recipient: "process:network",
            digestParts: ["agent.bash.network", command],
          }),
      }),
    blocking: () =>
      env.AUX_HOST_SOCKET
        ? new ContentBlockingService(config.dataDir, native, env.AUX_BROWSER_PROFILE_ID ?? "default")
        : null,
    commandRanking: () => new CommandRankingStore(repo, env.AUX_BROWSER_PROFILE_ID ?? "default"),
    tasks: () => new TaskService(repo, events),
    cookies: () => new CookieService({ native }),
    agentConnections: () => new AgentConnectionService(repo),
    installCli: () => (owner) => {
      if (closed) return Promise.reject(new AuxError("cancelled", "CLI installation stopped."));
      const work = cliInstallTail.then(async () => {
        if (closed || !native?.turnSourceContext)
          throw new AuxError("backend_unavailable", "Original CLI setup window is unavailable.");
        const original = await native.turnSourceContext(owner);
        if (closed) throw new AuxError("cancelled", "Original CLI setup window retired.");
        const { installCli } = await import("./services/cli-install.js");
        return installCli({
          current: async () => {
            if (closed) throw new AuxError("ref_stale", "Original CLI setup window retired.");
            const current = await native.turnSourceContext!(owner);
            if (closed || current.windowId !== original.windowId)
              throw new AuxError("ref_stale", "Original CLI setup window changed or retired.");
          },
        });
      });
      cliInstallTail = work.then(() => undefined, () => undefined);
      cliInstallWork.add(work);
      void work.finally(() => cliInstallWork.delete(work)).catch(() => {});
      return work;
    },
    externalSessions: () => new ExternalSessionService(repo, events, runtimeServices.turnMentions),
    pageChangeWatches: () => new RoutineService(repo, events),
    browsingMemory: () => new BrowsingMemory(repo),
    clock: () => runtimeClock,
    serviceAvailable: () => (name) => name in runtimeServices,
    featureHost: () => (env.AUX_HOST_SOCKET ? "chromium-fork" : undefined),
    featureProfileId: () => env.AUX_BROWSER_PROFILE_ID ?? "default",
    featureStages: () => featureStages,
    nativeIdentity: () => nativeIdentity,
    runtimeIdentity: () => runtimeIdentity,
    native: () => native,
    downloadsDir: () => config.downloadsDir,
    hookExecutor: () => hookExecutor,
    checkpointDeletedData: () => () => privacyCheckpoint.request(),
    events: () => events,
    repo: () => repo,
    drivers: () => () => drivers,
    importCookies: () => (o) => runtimeServices.cookies.importCookies(o),
    benchRun: () => async (task, repeats) =>
      runBench({
        pages: runtimeServices.pages,
        url: task ?? env.AUX_BENCH_URL ?? "http://127.0.0.1:4810/records",
        repeats: repeats ?? 10,
        dir: config.benchmarksDir,
      }),
    routines: () => undefined,
    browserImport: () => undefined,
  });
  const runtimeServices: RuntimeServices = serviceContainer.services;

  const folderRootsForRun = (runId?: string, access: "read" | "write" = "write") => {
    const workspaceId = runId ? repo.getRun(runId)?.config?.contextWorkspaceId : undefined;
    return workspaceId ? runtimeServices.workspaceFolders.roots(workspaceId)[access] : [];
  };
  if (env.AUX_HOST_SOCKET && env.AUX_BROWSER_PROFILE_ID) repo.requireChromiumHistory();
  const privacyCheckpoint = new PrivacyCheckpoint(config.dbPath, (error) =>
    process.stderr.write(`[runtime] privacy checkpoint failed: ${error.message}\n`),
  );
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
      nativePersonResume?: string;
      nativeRunResume?: string;
      nativeTurnContext?: string;
    },
  ) => Promise<unknown>;
  let resolveInvoker: (fn: InvokeFn) => void;
  const invokerReady = new Promise<InvokeFn>((r) => (resolveInvoker = r));
  let invokeRef: ReturnType<typeof makeInvoker> | undefined;

  const disarmWatchdog = bootstrapWatchdog();
  const token = config.apiToken || randomUUID();
  const peerIdentity = {
    instanceId: randomUUID(),
    pid: process.pid,
    schema: SCHEMA_VERSION,
    startedAt: Date.now(),
  };
  const api = new ApiServer({
    token,
    peerIdentity,
    invoke: (method, params, client) => invokerReady.then((fn) => fn(method, params, client)),
    events,
    authorizeScopedToken: (scopedToken) => runtimeServices.agentConnections?.authorize(scopedToken) ?? null,
    closedScopedToken: (scopedToken) => runtimeServices.agentConnections?.closedClient(scopedToken) ?? null,
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
  bootPhase("listener");
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

  // Shared claim ledger — the page dialog decision reads it before `runs`
  // exists, so it lives here and flows into RunService deps.

  const decideDeps: DecideDeps = {
    approvals: runtimeServices.approvals,
    journal: runtimeServices.decisions,
    managedRules: () => OriginRuleSchema.array().parse(repo.getSetting("managedOriginPolicies") ?? []),
    agentPolicy: () => runtimeServices.settings.agentPolicy(),
    audit: (event) => runtimeServices.safetyAudit.record({ ...event }),
  };

  /**
   * Operation requests use the same live agent policy as page effects.
   * A request awaiting consent is parked before any transport dispatch.
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
    const request = EffectRequestSchema.parse({
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
    });
    const decision = await decide(request, decideDeps, { phase: "dispatch", headless: true });
    if (decision.status === "ask") {
      runtimeServices.safetyGate.park(
        request,
        {
          turnId: request.turnId,
          threadId: request.threadId,
          ...(input.runId ? { runId: input.runId } : {}),
        },
        decision.suspension,
      );
      throw new AuxError("needs_input", decision.suspension.instruction);
    }
    if (decision.status === "deny")
      throw new AuxError("permission_denied", decision.guidance, { refusalId: decision.refusalId });
  };

  // ---- authenticated channel to the native browser host ----
  const native: NativeBridge = channel ? new ChannelNativeBridge(channel) : new NullNativeBridge();
  const runtimeIdentity = readRuntimeIdentity(import.meta.url);
  const nativeIdentity = env.AUX_HOST_SOCKET ? native.capabilities!() : undefined;
  const featureStages = nativeIdentity
    ? nativeIdentity
        .then((capabilities) => featureAvailabilityFor(capabilities.methods))
        .catch((error) => {
          process.stderr.write(`[runtime] native capabilities unavailable: ${String(error)}\n`);
          return featureAvailabilityFor([]);
        })
    : Promise.resolve(featureAvailabilityFor([]));
  let blockingBoot: Promise<void> | undefined;
  const ensureBlocking = () => {
    if (closed) throw new AuxError("cancelled", "Content filtering construction retired.");
    const blocking = runtimeServices.blocking;
    if (!blocking) return Promise.resolve();
    if (blockingBoot) return blockingBoot;
    const pending = blocking.boot();
    blockingBoot = pending;
    void pending.then(undefined, () => {
      // A later explicit admission may retry the original native readiness.
      // Never replace another attempt or claim the failed one became ready.
      if (!closed && blockingBoot === pending) blockingBoot = undefined;
    });
    return pending;
  };
  if (env.AUX_HOST_SOCKET) {
    for (const method of [
      "blocking.status",
      "blocking.privacy",
      "blocking.update",
      "blocking.add",
      "blocking.remove",
      "blocking.setSourceEnabled",
      "blocking.toggleStart",
      "blocking.toggleStatus",
      "blocking.toggleCancel",
      "blocking.toggleRelease",
      "blocking.setSiteAllowed",
      "blocking.removeAllowedHost",
    ]) {
      channel?.onMethod(method, (params) =>
        ensureBlocking().then(() => runtimeServices.blocking!.handle(method, params)),
      );
    }
  }
  // Register before service boot so the host can preload styles before restoring tabs.
  channel?.onMethod("zap.snapshot", async (params) => {
    const profileId = ZapSnapshotParamsSchema.parse(params).profileId;
    const host = "chromium-fork";
    const stages = await featureStages;
    const snapshot = runtimeServices.zap.snapshot(profileId);
    return auxFeatureEnabled("zapAndUserCss", host, stages) ? snapshot : [];
  });
  runtimeServices.settings.attachNative(native);
  runtimeServices.settings.attachCopilotServices(() => runtimeServices.copilot);

  // These authenticated host-only methods prepare local files for native save dialogs.
  channel?.onMethod("artifact.exportDescriptor", (params) => {
    const artifactId = (params as { artifactId?: unknown })?.artifactId;
    if (typeof artifactId !== "string") throw new Error("Invalid artifact identity");
    return artifactExportDescriptor(repo, artifactId, config.artifactsDir);
  });
  channel?.onMethod("workbook.renderExport", (params) => {
    const request = params as { content?: unknown; format?: unknown };
    if (
      typeof request?.content !== "string" ||
      (request.format !== undefined && request.format !== "snapshot" && request.format !== "csv")
    )
      throw new Error("Invalid workbook export request");
    return renderWorkbookForNativeExport(request.content, request.format as "snapshot" | "csv" | undefined);
  });

  // Register api.invoke immediately — the renderer can call before services
  // finish booting; calls wait on the invoker promise instead of failing.
  channel?.onMethod("api.invoke", (p) => {
    const { method, params, desktopUser, nativePersonResume, nativeRunResume, nativeTurnContext } = p as {
      method: string;
      params: unknown;
      desktopUser?: boolean;
      nativePersonResume?: unknown;
      nativeRunResume?: unknown;
      nativeTurnContext?: unknown;
    };
    const receipt =
      method === "pages.resume" &&
      desktopUser === true &&
      typeof nativePersonResume === "string" &&
      nativePersonResume.length > 0 &&
      nativePersonResume.length <= 128
        ? nativePersonResume
        : undefined;
    const runReceipt =
      method === "runs.resume" &&
      desktopUser === true &&
      typeof nativeRunResume === "string" &&
      nativeRunResume.length > 0 &&
      nativeRunResume.length <= 128
        ? nativeRunResume
        : undefined;
    return invokerReady.then((fn) =>
      fn(method, params, {
        external: desktopUser !== true,
        ...(desktopUser === true &&
        typeof nativeTurnContext === "string" &&
        /^[0-9a-f-]{36}$/.test(nativeTurnContext)
          ? { nativeTurnContext }
          : {}),
        ...(receipt ? { nativePersonResume: receipt } : {}),
        ...(runReceipt ? { nativeRunResume: runReceipt } : {}),
      }),
    );
  });
  if (channel) registerDownloadNamingChannel(channel, invokerReady);
  await runtimeServices.settings.initializeCredentials();

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
  let browserEgress: BrowserEgress | undefined;
  const nativeCdp =
    env.AUX_HOST_SOCKET && channel
      ? await NativeCdpBroker.start(channel, (pageId, lease) => {
          if (!browserEgress)
            throw new AuxError("permission_denied", "Browser authority is not initialized.");
          return browserEgress.captureCdpAuthority(pageId, lease);
        })
      : null;
  let auxRecovery: ConnectionRecovery | undefined;
  const hostCdp = nativeCdp?.endpoint();
  if (hostCdp) {
    const d = new ManagedChromiumDriver(hostCdp, {
      trustedPages: native.listPages ? async () => (await native.listPages!()).pages : undefined,
      onConnected: () =>
        repo.upsertSession({ sessionId: "aux", backend: "aux", label: "Aux", status: "connected" }),
    });
    watchDriver(d, "aux", "Aux");
    drivers.aux = d;
    auxRecovery = new ConnectionRecovery({
      reconnect: () => d.reconnect(),
      isConnected: () => d.isConnected(),
    });
    const reportDisconnected = d.onDisconnected;
    d.onDisconnected = () => {
      reportDisconnected?.();
      auxRecovery?.retry();
    };
  }

  attachBidiRuntime({
    navigate: (context, url) => {
      void runtimeServices.pages.navigate(context, url);
      return { url, pageId: context };
    },
    performActions: (actions) => {
      const list = Array.isArray(actions) ? actions : [];
      const first = list[0] as { pageId?: string; context?: string; steps?: Step[] } | undefined;
      const pageId = first?.pageId ?? first?.context;
      if (!pageId || !first?.steps?.length) return { accepted: false };
      const steps = first.steps;
      void (async () => {
        const obs = await runtimeServices.pages.observe(pageId, {});
        const live = runtimeServices.pages.get(pageId);
        const prepared = compileAndAuthorize({
          pageId,
          documentEpoch: live.documentEpoch ?? obs.documentEpoch,
          observedEpoch: obs.documentEpoch,
          steps,
          observation: obs.content,
          url: live.url ?? obs.content.url,
        });
        if ("program" in prepared)
          await runtimeServices.pages.execute(prepared.program, { allowEval: false });
      })();
      return { accepted: true };
    },
  });

  const hookScratch = join(config.artifactsDir, "hook-tmp");
  mkdirSync(hookScratch, { recursive: true });
  const hookFilesystemPolicy = (workspaceId: string, runId?: string) => {
    const policy = runtimeServices.filesystem.snapshot(runId);
    const reviewed = runtimeServices.workspaceFolders.roots(workspaceId);
    return {
      ...policy,
      readRoots: [...new Set([...policy.readRoots, ...reviewed.read, ...reviewed.write])],
      writeRoots: [
        ...new Set([...policy.writeRoots, ...(policy.mode === "read-only" ? [] : reviewed.write)]),
      ],
    };
  };

  const hookExecutor: HookExecutor = async (handler, context, signal) => {
    if (signal.aborted) throw new AuxError("permission_denied", "Hook was revoked.");
    if (handler.type === "command") {
      const workdir = handler.workdir;
      const seatbelt = new BashSeatbelt({
        filesystemPolicy: () => hookFilesystemPolicy(context.workspaceId, context.runId),
        networkDefault: () => runtimeServices.settings.agentPolicy().agentMode !== "ask",
        scratchDir: hookScratch,
      });
      const result = await seatbelt.run(
        { command: handler.command, workdir, signal },
        {
          runId: context.runId ?? `hook:${context.eventId}`,
          threadId: context.runId ?? context.eventId,
          turnId: context.eventId,
        },
      );
      if ("park" in result || result.timedOut || result.exitCode !== 0 || signal.aborted)
        throw new AuxError("step_failed", "Command Hook did not complete successfully.");
      return;
    }
    if (handler.type !== "mcp_tool")
      throw new AuxError("capability_unsupported", "Hook handler is unavailable.");
    const result = await runtimeServices.outboundMcp.callTool(
      handler.serverId,
      handler.toolName,
      handler.arguments ?? {},
      { workspaceId: context.workspaceId },
      signal,
    );
    if (signal.aborted || result.status !== "completed" || result.isError)
      throw new AuxError("step_failed", "MCP hook tool did not complete successfully.");
  };

  const loopbackServicesUrl = (await nativeIdentity?.catch(() => undefined))?.loopbackServicesUrl;

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
    const request = EffectRequestSchema.parse({
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
    });
    const decision = await decide(request, decideDeps, { phase: "dispatch", headless });
    if (decision.status === "ask") runtimeServices.safetyGate.park(request, request, decision.suspension);
    return decision;
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
   * Local service effects use the same agent mode and category policy.
   * Required consent parks the run until its exact suspension is answered.
   */
  const decideLoopRecipient = async (
    ctx: { runId: string; threadId: string; turnId: string },
    input: { action: string; recipient: string; digestParts: unknown[] },
  ) => {
    const run = repo.getRun(ctx.runId);
    const request = EffectRequestSchema.parse({
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
    });
    const decision = await decide(request, decideDeps, { phase: "dispatch" });
    if (decision.status === "ask") runtimeServices.safetyGate.park(request, request, decision.suspension);
    return decision;
  };
  const recipientGate = async (
    ctx: { runId: string; threadId: string; turnId: string },
    input: { action: string; recipient: string; digestParts: unknown[] },
  ): Promise<"allow" | { park: LoopPark }> => {
    const decision = await decideLoopRecipient(ctx, input);
    if (decision.status === "deny")
      throw new AuxError("permission_denied", decision.guidance, { refusalId: decision.refusalId });
    if (decision.status === "ask") {
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
    workspaceContext: (workspaceId) => runtimeServices.workspaceFolders.context(workspaceId),
    webFetch: async (url, ctx) => {
      const gated = await loopEgressGate(ctx, url, "agent.web.fetch");
      if ("park" in gated) return { park: gated.park };
      const web = new AgentWebTools(
        async (hop) => (await decideLoopEgress(ctx, hop, "agent.web.fetch.hop", true)).status === "allow",
      );
      return { output: await web.fetch(gated.href) };
    },
    webSearch: async (query, ctx) => {
      const engine = runtimeServices.settings.searchEngine();
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
      if (!ws || !runtimeServices.contentMemory) return [];
      const hits = await runtimeServices.contentMemory.search(ws, query, 5);
      for (const hit of hits) browserEgress?.protect(ctx.runId, hit.snippet, "memory");
      return hits.map((hit) => ({ title: hit.title, url: hit.url, text: hit.snippet }));
    },
    // 06-X history_search / memory_search — the same projections the shell uses.
    historySearch: async (query, limit) =>
      repo.listHistory(query, Math.min(Math.max(1, Math.floor(limit)), 50)),
    memorySearch: async (query, ctx) => {
      const ws = repo.getRun(ctx.runId)?.config?.contextWorkspaceId;
      if (!ws || !runtimeServices.contentMemory) return [];
      const hits = await runtimeServices.contentMemory.search(ws, query, 8);
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
        const page = runtimeServices.pages.get(pageId);
        const url = permittedWebUrl(page.url);
        const run = repo.getRun(ctx.runId);
        const request = EffectRequestSchema.parse({
          profileId: env.AUX_BROWSER_PROFILE_ID ?? "default",
          scope: run?.config?.taskId
            ? { kind: "task", id: run.config.taskId }
            : { kind: "workspace", id: run?.config?.contextWorkspaceId ?? "default" },
          actor: "code_mode",
          effect: "write",
          category: "interact",
          action: "agent.bookmark.add",
          origin: url.origin,
          dataClasses: ["none"],
          provenance: "page",
          invocationDigest: createHash("sha256")
            .update(JSON.stringify([pageId, url.href, page.title]))
            .digest("hex"),
          turnId: ctx.runId,
          threadId: ctx.threadId,
          runId: ctx.runId,
          requestedAt: Date.now(),
        });
        const decision = await decide(request, decideDeps, { phase: "dispatch" });
        if (decision.status === "deny")
          throw new AuxError("permission_denied", decision.guidance, { refusalId: decision.refusalId });
        if (decision.status === "ask") {
          runtimeServices.safetyGate.park(request, request, decision.suspension);
          return {
            park: {
              kind: decision.suspension.kind,
              instruction: decision.suspension.instruction,
              ...(decision.suspension.approvalId ? { approvalId: decision.suspension.approvalId } : {}),
            },
          };
        }
        return {
          output: await new BrowserBookmarkLedger(repo, native).save(
            ctx.runId,
            pageId,
            url.href,
            page.title || url.hostname,
          ),
        };
      },
      // Authorize the intended target; native additionally inspects its exact
      // first navigation after blank-page binding without a duplicate prompt.
      openTab: async (url, ctx) => {
        const gated = await loopEgressGate(ctx, url, "agent.tab.open");
        if ("park" in gated) return { park: gated.park };
        return { output: { url: gated.href } };
      },
      webmcp: async (pageId, action, ctx) => {
        const page = runtimeServices.pages.get(pageId);
        const identityKeys = [
          "sessionId",
          "documentEpoch",
          "url",
          "controller",
          "backend",
          "ownedByRuntime",
          "windowKind",
          "workspaceId",
        ] as const;
        const originalDocument = identityKeys.map((key) => page[key]);
        const current = () => {
          const target = runtimeServices.pages.get(pageId);
          if (
            ["detached", "crashed"].includes(target.viewStatus) ||
            identityKeys.some((key, index) => target[key] !== originalDocument[index]) ||
            !["running", "planning"].includes(repo.getRun(ctx.runId)?.status ?? "")
          )
            throw new AuxError("ref_stale", "The original site-tool document changed.");
        };
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
          current,
        );
        if (outcome.status === "ask")
          runtimeServices.safetyGate.park(
            outcome.request,
            { ...outcome.request, runId: ctx.runId, pageId },
            outcome.suspension,
          );
        return outcome;
      },
      get filesystem() {
        return runtimeServices.filesystem;
      },
      outputDir: config.artifactsDir,
    },
  };

  // User budgets per run/day/routine (D11): limits from settings, actuals
  // from the model_calls ledger — the coordinator and loop host gate each
  // model call through this before spending.

  if (env.AUX_HOST_SOCKET && env.AUX_BROWSER_PROFILE_ID) {
    browserEgress = new BrowserEgress({
      runAncestry: (runId) => runAncestry(repo, runId, true),
      profileId: env.AUX_BROWSER_PROFILE_ID,
      native,
      run: (runId) => {
        const run = repo.getRun(runId);
        if (!run || !["queued", "running", "planning", "needs_input"].includes(run.status)) return null;
        if (run.config?.taskId) {
          try {
            if (runtimeServices.tasks.get(run.config.taskId).revision !== run.config.taskRevision)
              return null;
          } catch {
            return null;
          }
        }
        return {
          privateTask: run.config?.privateTask ?? false,
          taskId: run.config?.taskId,
          taskRevision: run.config?.taskRevision ?? 0,
          threadId: run.config?.chatId ?? run.runId,
        };
      },
      page: (pageId) => runtimeServices.pages.get(pageId),
      ownsPage: (runId, pageId) => runtimeServices.pageClaims.activeForPage(pageId)?.runId === runId,
      audit: (decision, evidence) =>
        runtimeServices.safetyAudit.record({
          ...decision,
          ...evidence,
          kind: "browser_egress",
          requestKind: evidence.kind,
          at: Date.now(),
        }),
      approve: browserEgressApproval({
        profileId: env.AUX_BROWSER_PROFILE_ID,
        decide: decideDeps,
        suspensions: runtimeServices.suspensions,
        events,
        run: (runId) => repo.getRun(runId),
        setStatus: (runId, status, message) =>
          runtimeServices.runs.coordinator.setStatus(runId, status, message),
      }),
    });
    installBrowserAuthority(repo, browserEgress);
    channel!.onMethod("egress.request", (params) => browserEgress!.request(params));
    events.subscribe((event) => {
      const pageId = typeof event.payload.pageId === "string" ? event.payload.pageId : undefined;
      if (
        pageId &&
        [EventTypes.PageRemoved, EventTypes.PageTakeover, EventTypes.PageCrashed].includes(
          event.type as typeof EventTypes.PageRemoved,
        )
      )
        browserEgress!.revokePage(pageId);
      if (
        event.type === EventTypes.PageUpdated &&
        pageId &&
        typeof event.payload.documentEpoch === "number"
      ) {
        browserEgress!.revokePage(pageId);
        const runId = runtimeServices.pageClaims.activeForPage(pageId)?.runId;
        if (runId) void browserEgress!.ensure(runId, pageId).catch(() => {});
      }
      const changedRun =
        event.type === "run.updated"
          ? (event.payload.run as { runId?: string; status?: string } | undefined)
          : undefined;
      const runId = changedRun?.runId ?? event.runId;
      const status =
        changedRun?.status ?? (event.type === EventTypes.RunStatus ? event.payload.status : undefined);
      if (
        runId &&
        typeof status === "string" &&
        !["queued", "running", "planning", "needs_input"].includes(status)
      ) {
        if (status === "paused") browserEgress!.suspendRun(runId);
        else browserEgress!.revokeRun(runId);
      }
    });
  }

  let nativePermissions: NativePermissionController | undefined;
  if (channel && browserEgress && env.AUX_BROWSER_PROFILE_ID) {
    nativePermissions = new NativePermissionController({
      profileId: env.AUX_BROWSER_PROFILE_ID,
      gate: runtimeServices.safetyGate,
      approvals: runtimeServices.approvals,
      egress: browserEgress,
      mentions: runtimeServices.turnMentions,
      run: (runId) => repo.getRun(runId),
      page: (pageId) => runtimeServices.pages.get(pageId),
      standingOnly: (runId) => !!overnightRoot(repo, runId),
      assertDispatch: async (runId) => {
        await checkNightShiftDispatch(repo, runId);
        runtimeServices.budgets.assertWithin({ runId });
      },
      overnightAuthority: (runId) => nightShiftEffectAuthority(repo, runId),
      retireReservation: (input) => native.permissionRetire(input),
      requiresTurn: (run, pageId) =>
        run.config?.implementation !== "external-agent" ||
        !!run.config?.mentions?.length ||
        runtimeServices.turnMentions.ownedPages(run.runId).includes(pageId),
      sourceCheck: (runId, pageId) => {
        shutdownAdmission.assertOpen();
        const before = repo.getRun(runId);
        const claim = runtimeServices.pageClaims.activeForPage(pageId);
        const taskId = before?.config?.taskId;
        const taskRevision = before?.config?.taskRevision;
        const task = taskId ? runtimeServices.tasks.get(taskId) : undefined;
        const check = () => {
          shutdownAdmission.assertOpen();
          const current = repo.getRun(runId);
          const currentClaim = runtimeServices.pageClaims.activeForPage(pageId);
          if (
            !before ||
            !current ||
            !claim ||
            claim.runId !== runId ||
            currentClaim?.claimId !== claim.claimId ||
            currentClaim?.runId !== runId ||
            current.config?.taskId !== taskId ||
            current.config?.taskRevision !== taskRevision ||
            current.config?.messageRevision !== before.config?.messageRevision ||
            !["running", "planning", "needs_input"].includes(current.status)
          )
            throw new AuxError("permission_denied", "This browser permission source claim changed.");
          if (taskId) {
            const currentTask = runtimeServices.tasks.get(taskId);
            if (
              !task ||
              task.revision !== taskRevision ||
              currentTask.revision !== taskRevision ||
              currentTask.state !== "open" ||
              currentTask.sourceOrigin !== task.sourceOrigin
            )
              throw new AuxError("permission_denied", "This browser permission task approval changed.");
          }
        };
        check();
        return check;
      },
    });
    installOvernightAuthority(repo, nativePermissions);
    channel.onMethod("permission.request", (params) => nativePermissions!.request(params));
    channel.onMethod("permission.revalidate", (params) => nativePermissions!.revalidate(params));
    channel.onMethod("permission.finalize", (params) => nativePermissions!.finalize(params));
    channel.onMethod("permission.invalidate", (params) => {
      const input = z
        .object({ batchId: z.string().min(1).max(160) })
        .strict()
        .parse(params);
      nativePermissions!.invalidate(input.batchId);
      return { batchId: input.batchId, decision: "deny" };
    });
  }

  agentLoop.goalUpdate = async (input, ctx) =>
    runtimeServices.goals.report(ctx.runId, input.status, input.blocker, ctx.goalTurn);

  // Subagent cells (06-Y): the service is shared with the RPC invoker; the
  // REPL spawns cells under a lazily created group per parent run.

  const replGroups = new Map<string, string>();
  agentLoop.subagents = {
    spawnCell: async (input, ctx) => {
      const run = repo.getRun(ctx.runId);
      if (!run) throw new AuxError("not_found", "The parent run does not exist.");
      let groupId = replGroups.get(ctx.runId);
      if (!groupId) {
        const group = runtimeServices.subagents.createGroup({
          parentRunId: ctx.runId,
          tokenBudget: 0,
          costBudgetUsd: 0,
          timeBudgetMs: 0,
        });
        groupId = group.groupId;
        replGroups.set(ctx.runId, groupId);
      }
      const profile = SubagentProfileSchema.safeParse(input.profile ?? "default");
      if (!profile.success)
        throw new AuxError("invalid_params", "profile must be explorer, read_only or default.");
      const agent = await runtimeServices.subagents.spawn({
        groupId,
        goal: input.goal,
        profile: profile.data,
        pageIds: input.pageIds?.length ? input.pageIds : run.pageIds,
        tokenAllocation: 0,
        costAllocationUsd: 0,
        maxModelCalls: 0,
      });
      return { cellId: agent.agentId };
    },
    waitCell: (cellId, timeoutMs) => runtimeServices.subagents.cellControls().waitCell(cellId, timeoutMs),
    sendCell: (cellId, text) => runtimeServices.subagents.cellControls().sendCell(cellId, text),
    cancelCell: (cellId) => runtimeServices.subagents.cellControls().cancelCell(cellId),
  };


  let cloudRuntime: Promise<{ executor: VercelSandboxExecutor; admission: CloudRunAdmission }> | undefined;
  let cloudExecutor: VercelSandboxExecutor | undefined;
  const getCloudRuntime = () => {
    shutdownAdmission.assertOpen();
    if (cloudRuntime) return cloudRuntime;
    const pending = (async () => {
      const [execution, authority, settings] = await Promise.all([
        import("./services/vercel-sandbox-executor.js"),
        import("./services/cloud-run-admission.js"),
        import("./services/cloud-settings.js"),
      ]);
      shutdownAdmission.assertOpen();
      const admission = new authority.CloudRunAdmission({
        repo,
        native,
        turns: runtimeServices.turnMentions,
        profileId: env.AUX_BROWSER_PROFILE_ID ?? "default",
        taskRevision: (taskId) => runtimeServices.tasks.get(taskId).revision,
        checkMoney: async (request) => {
          await runtimeServices.safetyGate.checkTrustedEffect(request, {
            profileId: request.profileId,
            scope: request.scope,
            actor: request.actor,
            turnId: request.turnId,
            threadId: request.threadId,
            runId: request.runId,
          });
        },
      });
      const owner = async (ctx: CloudExecutionContext, parked = false) => {
        const current = () => {
          shutdownAdmission.assertOpen();
          const control = runtimeServices.runs.coordinator.controls.get(ctx.runId);
          if (!control || control.abort.signal.aborted || (!parked && control.dispatchAbort?.signal.aborted))
            throw new AuxError("cancelled", "The original cloud dispatch stopped.");
        };
        current();
        if (parked) await admission.assertOriginal(ctx);
        else await admission.assertOwner(ctx);
        current();
      };
      const executor = new execution.VercelSandboxExecutor({
        repo,
        funding: runtimeServices.runs.funding,
        configuration: () => settings.cloudSettingsFor(repo, native).configuration(),
        assertOwner: (ctx) => owner(ctx),
        assertOriginal: (ctx) => owner(ctx, true),
        resourceScopes: (runId) => runtimeServices.budgets.resourceFundingScopes(runId),
        pauseForResourceFunding: (error, current) =>
          runtimeServices.runs.coordinator.pauseForResourceFunding(error, current),
        authorizeCreate: (ctx, quote, quoteDigest) => admission.authorizeCreate(ctx, quote, quoteDigest),
        authorizeBash: async (ctx, input) => {
          await owner(ctx);
          const before = JSON.stringify(runtimeServices.settings.agentPolicy());
          const defaultNetwork = runtimeServices.settings.agentPolicy().agentMode !== "ask";
          const network = input.network ?? defaultNetwork;
          if (network && !defaultNetwork) {
            const verdict = await recipientGate(ctx, {
              action: "agent.bash.network",
              recipient: "process:network",
              digestParts: ["agent.bash.network", input.command],
            });
            if (verdict !== "allow") return verdict;
          }
          await owner(ctx);
          if (JSON.stringify(runtimeServices.settings.agentPolicy()) !== before)
            throw new AuxError("ref_stale", "Permissions changed before cloud command dispatch.");
          return network;
        },
      });
      cloudExecutor = executor;
      return { executor, admission };
    })();
    cloudRuntime = pending;
    void pending.catch(() => {
      if (cloudRuntime === pending) cloudRuntime = undefined;
    });
    return pending;
  };
  agentLoop.cloudExecutor = {
    selected: (runId) => repo.getRun(runId)?.config?.executionTarget === "cloud",
    eval: async (ctx, deps, code, options) =>
      (await getCloudRuntime()).executor.eval(ctx, deps, code, options),
    wait: async (ctx, cellId, yieldTimeMs, terminate) =>
      (await getCloudRuntime()).executor.wait(ctx, cellId, yieldTimeMs, terminate),
    hasOpen: (runId) => cloudExecutor?.hasOpen(runId) ?? false,
    closeRun: async (runId) => {
      if (!cloudRuntime) return;
      const { executor, admission } = await cloudRuntime;
      await executor.closeRun(runId);
      if (!runtimeServices.runs.coordinator.controls.has(runId)) admission.release(runId);
    },
  };
  agentLoop.bash = async (input, ctx) => {
    const result =
      repo.getRun(ctx.runId)?.config?.executionTarget === "cloud"
        ? await (await getCloudRuntime()).executor.bash(input, ctx)
        : await runtimeServices.bashSeatbelt.run(input, ctx);
    return "park" in result ? result : { output: result };
  };
  // 06-X routine_update: a model-proposed automation change confirms with the
  // user (recipient-scoped decide()), then lands through the routines API —
  // workspace-scoped to the run and optimistic-concurrency protected.
  agentLoop.routineUpdate = async (input, ctx) => {
    const requireMentionedSkill = () => {
      const result = runtimeServices.turnMentions.requireSkill(ctx.runId, input.routineId);
      if (result.status === "unavailable") throw new AuxError("permission_denied", result.reason);
    };
    const run = repo.getRun(ctx.runId);
    const messageRevision = run?.config?.messageRevision;
    const mentionTurn = run?.config?.mentions?.length
      ? runtimeServices.turnMentions.capture(ctx.runId)
      : undefined;
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
    if (
      repo.getRun(ctx.runId)?.config?.messageRevision !== messageRevision ||
      (mentionTurn && runtimeServices.turnMentions.capture(ctx.runId) !== mentionTurn)
    )
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
    if (closed || event.type !== EventTypes.RunUpdated) return;
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
    if (
      typeof workspaceId !== "string" ||
      !runtimeServices.memoryPipeline ||
      !runtimeServices.memoryPipeline.policy(workspaceId).enabled
    )
      return;
    const runId = run.runId;
    extractingRuns.add(runId);
    void runtimeServices.memoryPipeline
      .extractRun(workspaceId, runId)
      .then((result) => {
        if (result.extracted) events.emit("workspace.memory.updated", { workspaceId, runId });
      })
      .catch(() => events.emit("memory.pipeline.failed", { workspaceId, runId }))
      .finally(() => extractingRuns.delete(runId));
  });

  const takeoverRuns: Parameters<typeof handlePageTakeover>[3] = {
    cancel: (...args) => runtimeServices.runs.cancel(...args),
    pauseForTakeover: (...args) => runtimeServices.runs.pauseForTakeover(...args),
    resumeAfterTakeover: (...args) => runtimeServices.runs.resumeAfterTakeover(...args),
    interruptProgramForTakeover: (...args) => runtimeServices.runs.interruptProgramForTakeover(...args),
  };
  events.subscribe((e) => {
    if (closed || e.type !== EventTypes.PageTakeover || typeof e.payload.nativeRunId === "string") return;
    const pageId = e.payload.pageId;
    const controller = e.payload.controller;
    if (typeof pageId !== "string" || typeof controller !== "string") return;
    void handlePageTakeover(pageId, controller, repo, takeoverRuns).catch((error) =>
      console.error("[aux-runtime] page takeover retirement failed", error),
    );
  });

  channel?.onMethod("agent.connections", () => runtimeServices.agentConnections!.list());
  channel?.onMethod("agent.clients", () => nativeAgentClients());
  channel?.onMethod("agent.config", (params) =>
    nativeAgentConfig(runtimeServices.agentConnections!, params, config.dataDir),
  );
  channel?.onMethod("agent.revoke", (params) => {
    const connectionId = (params as { connectionId?: unknown })?.connectionId;
    if (typeof connectionId !== "string") throw new Error("Invalid connection identity");
    const revoked = runtimeServices.agentConnections!.revoke(connectionId);
    runtimeServices.externalSessions.end(connectionId, "cancelled", "Connection revoked");
    return revoked;
  });

  const runtimeClock = createClock((await nativeIdentity?.catch(() => undefined))?.testClockScale);
  const services: Services = runtimeServices;
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
    stopNativeDeviceConfirmation = registerNativeDeviceConfirmation(channel, {
      get approvals() {
        return runtimeServices.approvals;
      },
      profileId: env.AUX_BROWSER_PROFILE_ID ?? "default",
      current: () => !closed,
      policyRevision: () => runtimeServices.settings.agentPolicy().agentPolicyRevision,
      confirmed: (action, approvalId) => resumeApproval(runtimeServices, action, approvalId),
    });
    registerNativeReceiptChannel(channel, repo, () => runtimeServices.pages.list());
    registerNativeSubagentWorkload(channel, {
      repo,
      get runs() {
        return runtimeServices.runs;
      },
      get subagents() {
        return runtimeServices.subagents;
      },
      get pages() {
        return runtimeServices.pages;
      },
      get tasks() {
        return runtimeServices.tasks;
      },
    });
    registerNativeCommandRanking(
      channel,
      { get: (id) => runtimeServices.pages.get(id), livePageIds: () => runtimeServices.pages.livePageIds() },
      { record: (...args) => runtimeServices.commandRanking.record(...args) },
    );
  }
  // Native notification/page-change/Calendar adapters submit provenance here;
  // external and scoped API clients cannot mint automation events.
  channel?.onMethod("routines.ingestEvent", (params) =>
    invoke("routines.ingestEvent", params, { external: false }),
  );

  channel?.onMethod("routines.pageChangeTarget", (params) => {
    const { pageId, url } = RoutinePageChangeTargetParamsSchema.parse(params);
    return runtimeServices.pageChangeWatches.pageChangeTarget(pageId, url);
  });

  // ---- channel surface for the shell ----
  // The loopback port has been bound since bootstrap began; flipping the
  // readiness gate is the last step — callers were 503'd until now.
  invokeRef = invoke;
  resolveInvoker!(invoke);
  const sweepExternalSessions = () => {
    try {
      runtimeServices.externalSessions.sweepIdle();
    } catch (error) {
      console.error("External session sweep failed", error);
    }
  };
  const calendarAutomationAvailable = !featureStages || (await featureStages).connectors === "on";
  const calendarScanAbort = new AbortController();
  let calendarScan: Promise<void> | undefined;
  const scanCalendar = () => {
    if (
      !calendarAutomationAvailable ||
      calendarScan ||
      calendarScanAbort.signal.aborted ||
      !runtimeServices.calendar.list().available
    )
      return;
    const watches = runtimeServices.pageChangeWatches.calendarWatches();
    if (!watches.length) return;
    calendarScan = pollCalendarRoutines(
      watches,
      runtimeServices.calendar,
      (event) => invoke("routines.ingestEvent", event, { external: false }),
      Date.now(),
      calendarScanAbort.signal,
    )
      .catch((error) => {
        if (!calendarScanAbort.signal.aborted) console.error("Calendar automation scan failed", error);
      })
      .finally(() => {
        calendarScan = undefined;
      });
  };
  let dueTimer: NodeJS.Timeout | undefined;
  // forward the event stream so the shell renderer can subscribe over IPC
  events.subscribe((e) => channel?.notify("event", e));
  if (channel)
    registerNativeControlChannel(
      channel,
      (input) => {
        if (!browserEgress || !nativePermissions)
          throw new AuxError("permission_denied", "Native control retirement is unavailable.");
        return applyNativePageTakeover(input, {
          egress: browserEgress,
          permissions: nativePermissions,
          page: (pageId) => runtimeServices.pages.get(pageId),
          takeover: (pageId, runId) => runtimeServices.pages.takeoverFromNative(pageId, runId),
          interrupt: (pageId, runId) => handlePageTakeover(pageId, "human", repo, takeoverRuns, runId),
        });
      },
      (code) => console.error("Native takeover notification failed", code),
    );
  channel?.onNotify((type, payload) => {
    const pl = (payload ?? {}) as Record<string, unknown>;
    const str = (v: unknown) => (v === undefined || v === null ? undefined : String(v));
    const truthy = (v: unknown) => v === true || v === "true";
    switch (type) {
      case "view.navigated":
        return runtimeServices.pages.onNativeNavigated(str(pl.pageId)!, str(pl.url)!);
      case "view.titleChanged":
        return runtimeServices.pages.onNativeTitle(str(pl.pageId)!, str(pl.title) ?? "");
      case "view.faviconChanged":
        return runtimeServices.pages.onNativeFavicon(str(pl.pageId)!, str(pl.favicon) ?? "");
      case "view.windowFocused":
        return runtimeServices.pages.onNativeWindowFocused(str(pl.pageId)!, str(pl.windowId)!);
      case "view.navState":
        return runtimeServices.pages.onNativeNavState(
          str(pl.pageId)!,
          truthy(pl.canGoBack),
          truthy(pl.canGoForward),
        );
      case "view.loading":
        return runtimeServices.pages.onNativeLoading(str(pl.pageId)!, truthy(pl.loading));
      case "view.navigationError":
        return runtimeServices.pages.onNativeNavigationError(
          str(pl.pageId)!,
          pl.error as { url: string; code: number; message: string; upgradedFrom?: string } | null,
        );
      case "view.crashed":
        return runtimeServices.pages.onNativeCrashed(str(pl.pageId)!);
      case "view.downloadStarted":
        return runtimeServices.pages.onNativeDownloadStarted(str(pl.pageId), {
          id: str(pl.id) ?? `dl_${Date.now()}`,
          sourceUrl: str(pl.sourceUrl),
          filename: str(pl.filename) ?? "download",
          path: str(pl.path) ?? "",
          size: Number(pl.size ?? 0),
          totalBytes: pl.totalBytes ? Number(pl.totalBytes) : undefined,
          startedAt: Number(pl.startedAt ?? Date.now()),
        });
      case "view.downloadFinished":
        return runtimeServices.pages.onNativeDownload(str(pl.pageId), {
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
        void runtimeServices.pages
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
          .then((page) => (pl.activate === true ? runtimeServices.pages.activate(page.pageId) : undefined))
          .catch(() => {});
        return;
      case "view.removed":
        return runtimeServices.pages.onNativeRemoved(str(pl.pageId)!, true, pl.discarded === true);
      // Main-owned tab catalog patches — presence/focus/placement truth for
      // human tabs; field convergence still rides view.* above (§7.1/§7.2).
      case "tabs.catalog":
        return runtimeServices.pages.syncCatalog(
          payload as Parameters<typeof runtimeServices.pages.syncCatalog>[0],
        );
      case "native.bookmarksChanged": {
        void invoke("bookmarks.list", {}, { external: false })
          .then((bookmarks) => {
            events.emit("bookmarks.changed", { bookmarks });
          })
          .catch((error) => console.error("Chromium bookmarks refresh failed", error));
        return;
      }
      case "app.closing":
        return runtimeServices.pages.shuttingDown();
    }
  });

  releaseHostStartup?.();
  api.setReady();
  disarmWatchdog();
  bootPhase("ready");
  channel?.notify("runtime.ready", { port });

  let filterTimer: NodeJS.Timeout | undefined;
  let memoryExpiry: NodeJS.Timeout | undefined;
  let contentExpiry: NodeJS.Timeout | undefined;
  let contentPruning: Promise<void> | undefined;
  const pruneContent = () => {
    if (closed || contentPruning) return contentPruning;
    contentPruning = (async () => {
      try {
        const pruned = await runtimeServices.contentMemory?.prune();
        if (closed) return;
        for (const workspaceId of pruned?.workspaceIds ?? []) {
          if (closed) return;
          await runtimeServices.runs.redactForgottenArticleOutputs(workspaceId);
        }
        if (pruned?.workspaceIds.length) privacyCheckpoint.request();
      } catch {
        console.error("Page-content memory cleanup failed");
      } finally {
        contentPruning = undefined;
      }
    })();
    return contentPruning;
  };
  const stopDeferred = deferRuntimeWork(
    () => !closed && isRuntimeIdle(repo),
    async () => {
      if (env.AUX_HOST_SOCKET) {
        void ensureBlocking()
          .then(() => {
            if (!closed) return runtimeServices.blocking?.maintain();
          })
          .catch((error: unknown) => {
            const diagnostic = {
              code: error instanceof AuxError ? error.code : "internal",
              message: error instanceof Error ? error.message.slice(0, 512) : "Unknown initialization failure",
            };
            process.stderr.write(`[runtime] content blocking unavailable ${JSON.stringify(diagnostic)}\n`);
          });
        filterTimer = setInterval(
          () => {
            if (closed || !isRuntimeIdle(repo)) return;
            void runtimeServices.blocking
              ?.maintain()
              .catch(() => process.stderr.write("[runtime] filter refresh failed\n"));
          },
          60 * 60 * 1000,
        );
        filterTimer.unref();
      }
      sweepExternalSessions();
      void invoke("routines.due", {}, { external: false }).catch(() => undefined);
      void scanCalendar();
      dueTimer = setInterval(() => {
        if (closed || !isRuntimeIdle(repo)) return;
        sweepExternalSessions();
        void invoke("routines.due", {}, { external: false }).catch(() => undefined);
        void scanCalendar();
      }, 60_000);
      dueTimer.unref();
      try {
        repo.pruneEvents();
        repo.pruneRetention();
        runtimeServices.browsingMemory.prune();
      } catch {
        console.error("Retention cleanup failed");
      }
      void pruneContent();
      memoryExpiry = setInterval(() => {
        if (closed || !isRuntimeIdle(repo)) return;
        try {
          runtimeServices.browsingMemory.prune();
        } catch {
          console.error("Browsing memory cleanup failed");
        }
      }, 60_000);
      contentExpiry = setInterval(() => {
        if (!closed && isRuntimeIdle(repo)) void pruneContent();
      }, 60_000);
      memoryExpiry.unref();
      contentExpiry.unref();
      if (repo.pendingRunMessageChats().length) runtimeServices.runs.messages.resumePending();
    },
  );
  const shutdown = runtimeShutdown({
    quiesce: () => {
      shutdownAdmission.beginShutdown();
      closed = true;
      stopNativeDeviceConfirmation?.();
      stopDeferred();
      clearInterval(filterTimer);
      clearInterval(memoryExpiry);
      clearInterval(contentExpiry);
      clearInterval(dueTimer);
      calendarScanAbort.abort();
      process.off("SIGTERM", onTerminationSignal);
      process.off("SIGINT", onTerminationSignal);
      process.off("unhandledRejection", onUnhandledRejection);
      process.off("uncaughtException", onUncaughtException);
    },
    retireAuthority: async () => {
      try {
        const results = await Promise.allSettled([
          Promise.allSettled(cliInstallWork),
          (async () => {
            const failures: unknown[] = [];
            try {
              await serviceContainer.peek("runs")?.close();
            } catch (error) {
              failures.push(error);
            }
            try {
              await cloudRuntime?.then(({ executor }) => executor.close());
            } catch (error) {
              failures.push(error);
            }
            if (failures.length)
              throw new AggregateError(failures, "Run and cloud resource cleanup awaits acknowledgement.");
          })(),
          import("./services/cloud-settings.js").then(({ closeCloudSettings }) => closeCloudSettings(repo)),
          serviceContainer.peek("projects")?.dispose(),
          serviceContainer.peek("blocking")?.close(),
          serviceContainer.peek("copilot")?.then((services) => services.close()),
        ]);
        const failures = results
          .filter((result): result is PromiseRejectedResult => result.status === "rejected")
          .map((result) => result.reason);
        if (failures.length)
          throw new AggregateError(failures, "Runtime process retirement awaits acknowledgement.");
      } finally {
        await withRunAuthorityMutation(repo, async () => {});
      }
    },
    closeEgress: () => {
      browserEgress?.close();
    },
    disconnectAuthority: () => {
      hostSocket?.close();
    },
    stopMessages: async () => {
      await serviceContainer.peek("runs")?.messages.stop();
    },
    markInterrupted: () => markInterruptedRuns(repo),
    stopFeatures,
    reportFailure: (stage, error) => {
      console.error(`[aux-runtime] shutdown ${stage} failed:`, error);
      runtimeServices.safetyAudit.record({
        kind: "runtime_shutdown",
        action: stage,
        status: "refused",
        reason: "Shutdown boundary was not acknowledged.",
        at: Date.now(),
      });
    },
    cleanup: [
      { stage: "calendar-scan", run: () => calendarScan },
      { stage: "content-pruning", run: () => contentPruning },
      {
        stage: "content-memory",
        run: () => {
          serviceContainer.peek("contentMemory")?.close();
        },
      },
      { stage: "model-discovery", run: () => serviceContainer.peek("settings")?.close() },
      { stage: "api", run: () => api.close() },
      { stage: "invocations", run: () => invoke.dispose() },
      {
        stage: "aux-recovery",
        run: async () => {
          await auxRecovery?.stop();
        },
      },
      {
        stage: "aux-driver",
        run: async () => {
          await drivers.aux?.disconnect();
        },
      },
      {
        stage: "chrome-driver",
        run: async () => {
          await drivers.chrome?.disconnect();
        },
      },
      {
        stage: "native-cdp",
        run: async () => {
          await nativeCdp?.close();
        },
      },
      { stage: "calendar", run: () => serviceContainer.peek("calendar")?.close() },
      {
        stage: "mcp-oauth",
        run: () => {
          serviceContainer.peek("mcpOAuth")?.close();
        },
      },
      { stage: "run-hooks", run: () => stopRunEndHooks?.() },
      {
        stage: "host-socket",
        run: () => {
          hostSocket?.close();
        },
      },
      {
        stage: "tracer",
        run: () => {
          serviceContainer.peek("tracer")?.close();
        },
      },
      { stage: "privacy-checkpoint", run: () => privacyCheckpoint.close() },
      { stage: "repository", run: () => repo.close() },
    ],
  });
  const onTerminationSignal = () =>
    void shutdown().then(
      () => process.exit(0),
      () => process.exit(1),
    );
  process.on("SIGTERM", onTerminationSignal);
  process.on("SIGINT", onTerminationSignal);

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
      const failed = await serviceContainer
        .peek("runs")
        ?.coordinator.failActive(`runtime fault — unhandled rejection: ${describeFault(reason)}`);
      if (failed?.length) console.error(`[aux-runtime] marked ${failed.length} active run(s) failed`);
    } catch {
      /* the ledger itself may be the thing that failed */
    }
  };
  const onUncaughtException = async (err: Error) => {
    if (closed) return;
    console.error("[aux-runtime] uncaught exception:", err.stack ?? err.message);
    try {
      await serviceContainer
        .peek("runs")
        ?.coordinator.failActive(`runtime fault — uncaught exception: ${describeFault(err)}`);
    } catch {
      /* best effort */
    }
    void shutdown().then(
      () => process.exit(1),
      () => process.exit(1),
    );
  };
  process.on("unhandledRejection", onUnhandledRejection);
  process.on("uncaughtException", onUncaughtException);
  // The native host owns this helper. A closed authenticated socket means its
  // owner has exited; finish the journal and release the Profile database.
  hostSocket?.onClose?.(() => {
    stopNativeDeviceConfirmation?.();
    if (!closed)
      void shutdown().then(
        () => process.exit(0),
        () => process.exit(1),
      );
  });

  // recover from an unclean stop: anything still "live" never completed.
  // Invocation rows persisted 'running' before dispatch (§13.3) reconcile
  // to 'interrupted' with unknown effect — never assumed applied or not.
  await markInterruptedRuns(repo);
  repo.markRunningInvocationsInterrupted();
  // Suspensions parked by runs that did not survive the restart expire; a
  // still-parked suspension belongs to a resumable run and resurfaces for UI.
  const liveRunIds = new Set(
    repo
      .listRuns(200)
      .filter((run) => ["queued", "planning", "running", "paused", "needs_input"].includes(run.status))
      .map((run) => run.runId),
  );
  runtimeServices.suspensions.expireOrphans(liveRunIds);
  // The same for durable page claims: a dead run cannot still own a tab.
  runtimeServices.pageClaims.releaseOrphans(liveRunIds);

  // bring back the tabs that were open when the app last quit
  await runtimeServices.pages.restoreTabs().catch(() => {});

  bootPhase("restored-tabs");
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
