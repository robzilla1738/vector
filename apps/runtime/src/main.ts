import { PrivateRuntimeSession } from "./services/private-session.js";
import type { HostCapabilities } from "@aux/contracts/host-methods";
import { modelCapabilities } from "@aux/contracts/model-registry";
import { coderWorktreePolicy } from "./services/coder-worktree-policy.js";
import { memoryContentSensitivityReason } from "@aux/contracts/memory-sensitivity";
import { pageDerivativeCache } from "./services/ai-result-cache.js";
import { AgentTurnTabs } from "./agent/turn-tabs.js";
import { deferRuntimeWork, isRuntimeIdle } from "./services/idle.js";
import { markInterruptedRuns, activeRunIds } from "./services/startup-recovery.js";
import { createServiceContainer, type ServiceContainer } from "./services/container.js";
import { navigateControlledPage } from "./services/pages/controlled-navigation.js";
import { registerNativeSubagentWorkload } from "./services/native-subagent-workload.js";
import { registerNativeProjectPreview } from "./services/native-project-preview.js";
import { runtimeShutdown, RuntimeShutdownAdmission } from "./services/runtime-shutdown.js";
import { withRunAuthorityMutation } from "./services/overnight-authority.js";
import { lineageRuns, overnightRoot, runAncestry, runRoot } from "./services/run-lineage.js";
import { installBrowserAuthority, installOvernightAuthority } from "./services/overnight-authority.js";
import { checkNightShiftDispatch, nightShiftEffectAuthority } from "./features/overnight-review/service.js";
import { z } from "zod";
import { createClock } from "@aux/contracts";
import { bootRuntimeFeatures } from "./features/registry.js";
import type { Services } from "./api/methods/context.js";
import { ConnectionRecovery } from "./connection-recovery.js";
import { readRuntimeIdentity } from "./api/runtime-identity.js";
import { BrowsingMemory } from "./services/browsing-memory.js";
import { ContentMemoryStore, contentMemoryExcerpt } from "./services/content-memory.js";
import { MemoryPipeline } from "./services/memory-pipeline.js";
import { createMcpTransportProvider } from "./services/mcp-transport-provider.js";
import { McpOAuthService } from "./services/mcp-oauth.js";
import { OutboundMcpService } from "./services/outbound-mcp.js";
import { HookService, type HookExecutor } from "./services/hooks.js";
import { installRunEndHooks } from "./services/hook-dispatch.js";
import { WorkspaceFolderService } from "./services/workspace-folders.js";
import { FilesystemAccessService } from "./services/filesystem-access.js";
import { codingEffectRequest } from "./services/coding-authorization.js";
import { requireFilesystemPath } from "./services/filesystem-policy.js";
import { resolveNativeUserDataDir } from "@aux/contracts/installation";
import { BrowserBookmarkLedger } from "./services/browser-bookmark-ledger.js";
import { CommandRankingStore } from "./services/command-ranking.js";
import { registerNativeCommandRanking } from "./services/command-ranking-native.js";
import { registerNativeDeviceConfirmation } from "./services/native-device-confirmation.js";
import { resumeApproval } from "./services/approval-continuation.js";
import { registerNativeReceiptChannel } from "./services/native-receipt-channel.js";
import { BrowserEgress } from "./safety/browser-egress.js";
import { MEMORY_WINDOW } from "./safety/egress-projection.js";
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
  isElementRef,
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
import { buildToolManifest } from "./agent/loop/tools.js";
import { resolveAgentProfile, subagentPageScope } from "./services/agent-profiles.js";
import { AuxPackageLibrary } from "./services/aux-package-library.js";
import { shippedAuxPackageDirectories } from "./services/shipped-aux-packages.js";
import { CoderWorktreeOperations } from "./services/coder-worktree-operations.js";
import {
  worktreeAuthority,
  startCoderWorktree,
  recoverCoderWorktree,
} from "./services/coder-worktree-runtime.js";
import {
  CodingFilesService,
  type CodingFileAuthorization,
  type CodingFileContext,
} from "./services/coding-files.js";
import { CodingProcesses } from "./services/coding-processes.js";
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
import type { CopilotServices } from "./services/copilot-services.js";
import { ResponseStore } from "./services/responses.js";
import { OperationService } from "./services/operations.js";
import { StateService } from "./services/state.js";
import { Tracer } from "./services/tracing.js";
import { makeInvoker } from "./api/invoke.js";
import { ApiServer } from "./api/server.js";
import { AgentConnectionService } from "./services/agent-connections.js";
import { nativeAgentClients, nativeAgentConfig } from "./services/native-agent-connections.js";
import { TerminalService } from "./services/terminals.js";
import { ProjectsService } from "./services/projects.js";
import { BrowserImporter } from "./services/browser-import.js";
import type { VercelSandboxExecutor } from "./services/vercel-sandbox-executor.js";
import type { CloudExecutionContext } from "./services/cloud-execution.js";
import type { CloudRunAdmission } from "./services/cloud-run-admission.js";
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
        processElapsedMs: Math.round(process.uptime() * 100000) / 100,
      })}\n`,
    );
    phaseStarted = at;
  };
  const shutdownAdmission = new RuntimeShutdownAdmission();
  // `.env` in the data dir, then in the cwd — real environment variables
  // always win. The README promised this; nothing loaded it before.
  const configured = normalizeAuxEnvironment(processEnv);
  const privateSession = PrivateRuntimeSession.fromEnvironment(configured);
  const env =
    configured.AUX_LOAD_DOTENV === "0" ? configured : loadDotEnv(processEnv, dotEnvCandidates(processEnv));
  const config = loadConfig(env, { ephemeral: !!privateSession });
  const bashScratch = join(config.artifactsDir, "bash-tmp");
  mkdirSync(bashScratch, { recursive: true });
  const developmentIdentity = developmentPeerIdentity();
  // Port 0 asks the kernel for a free port, so there is no incumbent to review.
  if (config.apiPort !== 0 && (await loopbackPortTaken(config.apiPort))) {
    await takeoverOrDecline(config.dataDir, config.apiPort, developmentIdentity);
  }
  if (!privateSession)
    await applyPendingRuntimeRestore(config.dataDir, config.dbPath, env.AUX_BROWSER_PROFILE_ID);
  bootPhase("restore");
  const db = openDb(config.dbPath);
  bootPhase("database");
  let channel: RpcChannel | null = null;
  let hostSocket: HostSocketTransport | null = null;
  let releaseHostStartup: (() => void) | undefined;
  let columnCipher: FieldCodec | undefined;
  let bootstrapIdentity: HostCapabilities | undefined;
  try {
    if (env.AUX_HOST_SOCKET) {
      const generation = env.AUX_HOST_GENERATION ?? "";
      if (!/^[1-9][0-9]*$/.test(generation)) throw new Error("Aux host generation is missing");
      hostSocket = await connectHostSocket(env.AUX_HOST_SOCKET, env.AUX_HOST_TOKEN ?? "", 15_000, generation);
      const startup = startupHostChannel(hostSocket);
      channel = startup.channel;
      releaseHostStartup = startup.release;
      const native = new ChannelNativeBridge(channel);
      if (privateSession) {
        bootstrapIdentity = await native.capabilities();
        privateSession.admit(bootstrapIdentity);
      } else {
        columnCipher = await initializeFieldCodec(db, native, env.AUX_BROWSER_PROFILE_ID ?? "");
      }
    }
  } catch (error) {
    db.close();
    hostSocket?.close();
    throw error;
  }
  bootPhase("protection");
  const repo = new Repo(db, columnCipher);
  try {
    privateSession?.seedSettings(repo);
  } catch (error) {
    db.close();
    hostSocket?.close();
    throw error;
  }
  let closed = false;
  let cliInstallTail = Promise.resolve();
  const cliInstallWork = new Set<Promise<unknown>>();
  const agentInstallWork = new Set<Promise<unknown>>();
  let stopNativeDeviceConfirmation: (() => void) | undefined;
  let stopNativeProjectPreview: (() => void) | undefined;
  let stopRunEndHooks: (() => void) | undefined;
  type RuntimeServices = Services & {
    workspaceFolders: WorkspaceFolderService;
    filesystem: FilesystemAccessService;
    coderWorktrees: CoderWorktreeOperations;
    auxPackages: AuxPackageLibrary;
    codingFiles: CodingFilesService;
    codingProcesses: CodingProcesses;
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
    terminals: TerminalService;
    projects: ProjectsService;
    externalSessions: ExternalSessionService;
    turnTabs: AgentTurnTabs;
    pageChangeWatches: RoutineService;
    browsingMemory: BrowsingMemory;
    tasks: TaskService;
    blocking: ContentBlockingService | null;
    commandRanking: CommandRankingStore;
  };
  const serviceContainer: ServiceContainer<RuntimeServices> = createServiceContainer<RuntimeServices>({
    workspaceFolders: () => new WorkspaceFolderService(repo, () => [config.dataDir]),
    filesystem: () =>
      new FilesystemAccessService({
        runPolicy: (runId, policy) => {
          const worktree = runId ? repo.getRun(runId)?.config?.coderWorktree : undefined;
          const shippedPackages = [
            ...shippedAuxPackageDirectories(),
            ...(repo.getSetting<{ path: string; shipped?: boolean }[]>("auxPackageDirectories") ?? []),
          ]
            .filter((item) => item.shipped)
            .map((item) => item.path);
          const metadataRoots = runId
            ? folderRootsForRun(runId, "read").map((root) => join(root, ".git"))
            : [];
          policy = {
            ...policy,
            protectedRoots: [...policy.protectedRoots, ...shippedPackages],
            deniedRoots: [...policy.deniedRoots, ...metadataRoots],
          };
          if (!worktree) return policy;
          return coderWorktreePolicy(policy, worktree, {
            scratch: join(bashScratch, runId!),
            artifacts: join(config.artifactsDir, runId!),
          });
        },
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
        (action, scope) => runtimeServices.settings.allowAgentSite(action, scope),
        () => runtimeServices.settings.agentPolicy(),
        (runId) => repo.getRun(runId),
        repo,
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
    tracer: () =>
      new Tracer(repo.db, privateSession ? undefined : { traceDir: join(config.dataDir, "traces") }),
    responses: () => new ResponseStore({ repo, events, artifacts: runtimeServices.artifacts }),
    vault: () => new VaultService(repo, native),
    contentMemory: () =>
      !privateSession && native.available() && env.AUX_BROWSER_PROFILE_ID
        ? new ContentMemoryStore(repo, native, env.AUX_BROWSER_PROFILE_ID, Date.now, events)
        : undefined,
    memoryPipeline: () =>
      !privateSession && native.available() && env.AUX_BROWSER_PROFILE_ID
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
        if (
          server.state !== "active" ||
          server.workspaceId !== workspaceId ||
          !server.toolNames.includes(handler.toolName) ||
          server.disabledTools.includes(handler.toolName)
        )
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
        translateSteps,
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
        privateBrowserProfile: !!privateSession,
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
        turnSourceContext: async (token) => {
          if (!native.turnSourceContext)
            throw new AuxError("backend_unavailable", "Original window source authority is unavailable.");
          return native.turnSourceContext(token);
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
        privateBrowserProfile: !!privateSession,
        resolveCodingContext: async (input) => {
          const roots = input.workspaceId
            ? runtimeServices.workspaceFolders.roots(input.workspaceId).write
            : [];
          const projectRoot = input.projectRoot ?? (roots.length === 1 ? roots[0] : undefined);
          if (projectRoot && !roots.includes(projectRoot))
            throw new AuxError("permission_denied", "Choose a reviewed read/write project in this Space.");
          const selected = input.packageNames ?? runtimeServices.auxPackages.defaults();
          let auxPackages = await runtimeServices.auxPackages.resolve(selected);
          const agentProfile = input.profile ? resolveAgentProfile(input.profile, auxPackages) : undefined;
          const extraPackages = (agentProfile?.packages ?? []).filter((name) => !selected.includes(name));
          auxPackages = [...auxPackages, ...(await runtimeServices.auxPackages.resolve(extraPackages))];
          if (agentProfile?.workspace === "isolated" && !projectRoot)
            throw new AuxError("invalid_params", "Attach a coding project before starting a coder.");
          return { projectRoot, auxPackages, agentProfile };
        },
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
    goals: () => new GoalService(repo, runtimeServices.runs),
    coderWorktrees: () =>
      new CoderWorktreeOperations(runtimeServices.subagents, runtimeServices.codingFiles, (context) =>
        worktreeAuthority({
          repo,
          filesystem: runtimeServices.filesystem,
          directory: join(config.artifactsDir, "coder-worktrees"),
          projectRoot: repo.getRun(context.runId)?.config?.projectRoot,
          runId: context.runId,
          checkOriginal: context.original,
          checkOwner: () => {
            if (context.actor !== "user") checkCodingOwner(context.runId);
            else if (closed || !repo.getRun(context.runId))
              throw new AuxError("cancelled", "The original coding run is unavailable.");
          },
          authorize: async (actionId, details) => {
            await context.original?.();
            const destructive =
              details[0] === "coder_worktree_archive" || details[0] === "coder_worktree_retire";
            const input = details[1] as {
              root: string;
              digest?: string;
              fileCount?: number;
              files?: { path: string; contentBase64: string | null; mode?: number; version: string | null }[];
            };
            const before = input.files?.map((file) => {
              const bytes =
                file.contentBase64 === null ? undefined : Buffer.from(file.contentBase64, "base64");
              const text = bytes?.toString("utf8");
              const binary =
                bytes !== undefined &&
                text !== undefined &&
                (text.includes("\0") || !Buffer.from(text).equals(bytes));
              return {
                path: join(input.root, file.path),
                content: binary ? null : (text ?? null),
                contentBase64: binary ? file.contentBase64! : undefined,
                mode: file.mode,
                version: file.version,
              };
            }) ?? [
              {
                path: input.root,
                content: `Aux-owned worktree. Snapshot ${input.digest ?? ""}`,
                version: input.digest ?? actionId,
              },
            ];
            const review: CodingFileAuthorization | undefined = destructive
              ? {
                  category: "file_delete",
                  actionId,
                  paths: before.map((file) => file.path),
                  before,
                  after: before.map((file) => ({ path: file.path, content: null, version: null })),
                }
              : undefined;
            return authorizeCodingAction(
              context.runId,
              destructive ? "file_delete" : details[0] === "coder_worktree_inspect" ? "read" : "file_write",
              actionId,
              details,
              review,
              context.actor,
            );
          },
        }),
      ),
    auxPackages: () =>
      new AuxPackageLibrary(repo, runtimeServices.filesystem, new Set(Object.keys(buildToolManifest()))),
    codingFiles: () => new CodingFilesService(repo, runtimeServices.filesystem, authorizeCodingFiles),
    codingProcesses: () =>
      new CodingProcesses({
        repo,
        artifacts: runtimeServices.artifacts,
        seatbelt: runtimeServices.bashSeatbelt,
        directory: join(config.artifactsDir, "processes"),
        authorize: async (input, context) => {
          const workdir =
            input.workdir ??
            repo.getRun(context.runId)?.config?.projectRoot ??
            join(bashScratch, context.runId);
          const network =
            input.network ??
            runtimeServices.approvals.effectivePolicy(runtimeServices.settings.agentPolicy(), context.runId)
              .agentMode !== "ask";
          return authorizeCodingAction(
            context.runId,
            "bash",
            context.actionId,
            [input.command, workdir, network],
            undefined,
            undefined,
            [
              {
                action: "bash",
                target: workdir,
                arguments: input.command,
                destination: network ? "network allowed" : "network blocked",
              },
            ],
          );
        },
        authorizeAccess: (operation, processId, context) =>
          authorizeCodingAction(
            context.runId,
            operation === "stop" ? "bash" : "read",
            context.actionId,
            [operation, processId],
            undefined,
            undefined,
            operation === "stop"
              ? [
                  {
                    action: "stop process",
                    target: processId,
                    arguments: "Stop this run-owned process",
                    destination: "local process",
                  },
                ]
              : undefined,
          ),
        checkOwner: (context) => {
          checkCodingOwner(context.runId);
          if (repo.getRun(context.runId)?.config?.executionTarget === "cloud")
            throw new AuxError("capability_unsupported", "Local processes are unavailable in a cloud run.");
        },
        authorityFence: (context) => runtimeServices.safetyGate.policyFence(context.runId),
      }),
    subagents: () =>
      new SubagentService(
        repo,
        events,
        runtimeServices.runs,
        {
          recover: (parentRunId, childRunId) =>
            recoverCoderWorktree(repo, join(config.artifactsDir, "coder-worktrees"), parentRunId, childRunId),
          create: (parentRoot, parentRunId, childRunId) =>
            startCoderWorktree(
              {
                repo,
                filesystem: runtimeServices.filesystem,
                directory: join(config.artifactsDir, "coder-worktrees"),
                projectRoot: parentRoot,
                runId: parentRunId,
                checkOwner: () => checkCodingOwner(parentRunId),
                authorize: (actionId, details) =>
                  authorizeCodingAction(parentRunId, "file_write", actionId, details),
              },
              parentRoot,
              childRunId,
            ),
        },
        ["webfetch", "websearch"],
      ),
    bashSeatbelt: () =>
      new BashSeatbelt({
        filesystemPolicy: (ctx) => runtimeServices.filesystem.codingPolicy(ctx?.runId),
        networkDefault: (ctx) =>
          runtimeServices.approvals.effectivePolicy(runtimeServices.settings.agentPolicy(), ctx?.runId)
            .agentMode !== "ask",
        scratchDir: bashScratch,
        directoriesForRun: (ctx) => ({
          scratchDir: join(bashScratch, ctx.runId),
          workdir: repo.getRun(ctx.runId)?.config?.projectRoot ?? join(bashScratch, ctx.runId),
        }),
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
    terminals: () => new TerminalService(native, runtimeServices.workspaceFolders),
    projects: () => new ProjectsService(native, runtimeServices.workspaceFolders, runtimeServices.filesystem),
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
      cliInstallTail = work.then(
        () => undefined,
        () => undefined,
      );
      cliInstallWork.add(work);
      void work.finally(() => cliInstallWork.delete(work)).catch(() => {});
      return work;
    },
    installAgentConnection: () => (input, owner) => {
      const work = Promise.resolve().then(async () => {
        if (closed || !native?.turnSourceContext)
          throw new AuxError("backend_unavailable", "Original client setup window is unavailable.");
        const original = await native.turnSourceContext(owner);
        if (closed) throw new AuxError("cancelled", "Original client setup window retired.");
        const { installAgentClient } = await import("./services/agent-client-install.js");
        const result = await installAgentClient(input, {
          connections: runtimeServices.agentConnections,
          dataDir: config.dataDir,
          current: async () => {
            if (closed) throw new AuxError("ref_stale", "Original client setup window retired.");
            const current = await native.turnSourceContext!(owner);
            if (closed || current.windowId !== original.windowId)
              throw new AuxError("ref_stale", "Original client setup window changed.");
          },
        });
        if (result.replacedConnectionId)
          await runtimeServices.externalSessions.end(
            result.replacedConnectionId,
            "cancelled",
            "Connection replaced",
          );
        return result;
      });
      agentInstallWork.add(work);
      void work.finally(() => agentInstallWork.delete(work)).catch(() => {});
      return work;
    },
    turnTabs: () =>
      new AgentTurnTabs(runtimeServices.pages, (page) => {
        repo.upsertPage({ ...page, ownedByRuntime: false });
        page.ownedByRuntime = false;
        void runtimeServices.pages
          .activate(page.pageId)
          .catch((error) => console.error("Released task tab activation failed", error));
      }),
    externalSessions: () =>
      new ExternalSessionService(
        repo,
        events,
        runtimeServices.turnMentions,
        async (connectionId, sessionRunId) => {
          const pending = runtimeServices.suspensions.pending(sessionRunId);
          if (pending) runtimeServices.approvals.retireTurn(pending.turnId, pending.threadId);
          runtimeServices.suspensions.resolveRun(sessionRunId, "cancelled");
          const original = repo.getRun(sessionRunId);
          runtimeServices.approvals.retireTurn(sessionRunId, original?.config?.chatId ?? sessionRunId);
          const owned = repo.db
            .prepare(
              "SELECT run_id AS runId FROM run_lookup WHERE json_extract(config,'$.externalConnectionId')=?",
            )
            .all(connectionId) as { runId: string }[];
          repo.transaction(() => {
            for (const id of new Set(owned.flatMap(({ runId }) => lineageRuns(repo, runId)))) {
              const run = repo.getRun(id);
              if (!run) continue;
              const suspension = runtimeServices.suspensions.pending(id);
              if (suspension) runtimeServices.approvals.retireTurn(suspension.turnId, suspension.threadId);
              runtimeServices.approvals.retireTurn(id, run.config?.chatId ?? id);
              runtimeServices.suspensions.resolveRun(id, "cancelled");
            }
          });
          const results = await Promise.allSettled(
            owned
              .filter(
                ({ runId }) =>
                  runId !== sessionRunId &&
                  ["queued", "planning", "running", "paused", "needs_input"].includes(
                    repo.getRun(runId)?.status ?? "",
                  ),
              )
              .map(({ runId }) => runtimeServices.runs.cancel(runId, "Original external connection retired")),
          );
          const failures = results
            .filter((result): result is PromiseRejectedResult => result.status === "rejected")
            .map((result) => result.reason);
          try {
            await runtimeServices.runs.retireExternalUtilityOperations(sessionRunId);
          } catch (error) {
            failures.push(error);
          }
          try {
            await invoke.endConnection(connectionId);
          } catch (error) {
            failures.push(error);
          }
          if (failures.length)
            throw new AggregateError(
              failures,
              "Original external run or tab retirement awaits acknowledgement.",
            );
        },
      ),
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
    browserImport: () =>
      new BrowserImporter({ repo, native, emit: (type, payload) => events.emit(type, payload) }),
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
  const nativeIdentity = env.AUX_HOST_SOCKET
    ? bootstrapIdentity
      ? Promise.resolve(bootstrapIdentity)
      : native.capabilities!()
    : undefined;
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
  await runtimeServices.settings.initializeCredentials([runtimeServices.settings.modelProvider()]);

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
        networkDefault: (ctx) =>
          runtimeServices.approvals.effectivePolicy(runtimeServices.settings.agentPolicy(), ctx?.runId)
            .agentMode !== "ask",
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
    phase: "preflight" | "dispatch" = "dispatch",
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
    const decision = await decide(request, decideDeps, { phase, headless, runId: ctx.runId });
    if (decision.status === "ask") runtimeServices.safetyGate.park(request, request, decision.suspension);
    return decision;
  };
  const loopEgressGate = async (
    ctx: { runId: string; threadId: string; turnId: string },
    url: string,
    action: string,
    phase: "preflight" | "dispatch" = "dispatch",
  ): Promise<URL | { park: import("./agent/loop/types.js").LoopPark }> => {
    const decision = await decideLoopEgress(ctx, permittedWebUrl(url), action, false, phase);
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
  const prepareWebRead = async (
    url: string,
    ctx: import("./agent/loop/types.js").WebToolContext,
    action: string,
  ): Promise<import("./agent/loop/types.js").PreparedRead> => {
    const original = repo.getRun(ctx.runId);
    if (!original || original.status !== "running")
      throw new AuxError("cancelled", "The original web run ended.");
    const source = runtimeServices.turnMentions.capture(ctx.runId);
    const configuration = JSON.stringify(original.config);
    const checkOwner = () => {
      ctx.signal?.throwIfAborted();
      const current = repo.getRun(ctx.runId);
      if (
        !current ||
        current.status !== "running" ||
        JSON.stringify(current.config) !== configuration ||
        runtimeServices.turnMentions.capture(ctx.runId) !== source
      )
        throw new AuxError("cancelled", "The original web source changed.");
    };
    checkOwner();
    const token = original.config?.nativeTurnContext;
    const windowId =
      token && native.turnSourceContext ? (await native.turnSourceContext(token)).windowId : undefined;
    const checkWindow = async () => {
      checkOwner();
      if (token && native.turnSourceContext && (await native.turnSourceContext(token)).windowId !== windowId)
        throw new AuxError("cancelled", "The original web window retired.");
      checkOwner();
    };
    // Preparing a later read may park the whole batch. Spend a once grant only
    // when this exact destination is actually dispatched, using the same digest.
    const gated = await loopEgressGate(ctx, url, action, "preflight");
    await checkWindow();
    if ("park" in gated) return gated;
    return {
      execute: async () => {
        await checkWindow();
        const web = new AgentWebTools(async (hop) => {
          await checkWindow();
          const decision = await decideLoopEgress(
            ctx,
            hop,
            hop.href === gated.href ? action : `${action}.hop`,
            true,
          );
          await checkWindow();
          return decision.status === "allow";
        });
        const output = await web.fetch(gated.href, ctx.signal);
        await checkWindow();
        return { output };
      },
    };
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
    const decision = await decide(request, decideDeps, { phase: "dispatch", runId: ctx.runId });
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
  const checkCodingOwner = (runId: string) => {
    const run = repo.getRun(runId);
    if (closed || !run || !["running", "planning", "needs_input"].includes(run.status))
      throw new AuxError("cancelled", "The original coding run retired.");
    if (
      runtimeServices.suspensions.pending(runId)?.kind === "budget" ||
      runtimeServices.suspensions.pending(runRoot(repo, runId, true))?.kind === "budget"
    )
      throw new AuxError("permission_denied", "Continue the current budget before running coding processes.");
  };
  const authorizeCodingAction = async (
    runId: string,
    category: "read" | "file_write" | "file_delete" | "bash",
    actionId: string,
    details: unknown[],
    review?: CodingFileAuthorization,
    actor?: "user",
    reviewedActions?: import("@aux/contracts").SafetyAction["reviewedActions"],
  ) => {
    if (actor === "user") {
      if (closed || !repo.getRun(runId))
        throw new AuxError("cancelled", "The original coding run is unavailable.");
    } else checkCodingOwner(runId);
    const run = repo.getRun(runId)!;
    const request = codingEffectRequest({
      profileId: env.AUX_BROWSER_PROFILE_ID ?? "default",
      scope: { kind: "workspace", id: run.config?.contextWorkspaceId ?? "default" },
      actor: actor ?? "builtin_agent",
      effect:
        category === "read"
          ? "read"
          : category === "file_delete" || review?.categories?.includes("file_delete")
            ? "destructive"
            : category === "file_write"
              ? "write"
              : "external_tool",
      category,
      action: `agent.coding.${category}`,
      recipient: run.config?.projectRoot ?? "filesystem",
      dataClasses: [],
      provenance: actor === "user" ? "user" : "template",
      invocationDigest: createHash("sha256")
        .update(JSON.stringify([actionId, ...details]))
        .digest("hex"),
      turnId: runId,
      threadId: run.config?.chatId ?? runId,
      runId,
      requestedAt: Date.now(),
    });
    const decision = await decide(request, decideDeps, {
      phase: "dispatch",
      runId,
      trustedUserAction: actor === "user",
      policyCategories: review?.categories,
      reviewedActions,
      reviewedChanges: review?.before?.map((before) => {
        const after = review.after?.find((after) => after.path === before.path);
        return {
          path: before.path,
          before: before.content,
          after: after?.content ?? null,
          kind:
            after?.version === null
              ? ("delete" as const)
              : before.version === null
                ? ("create" as const)
                : ("edit" as const),
          beforeMode: before.mode,
          afterMode: after?.mode,
          binary: before.contentBase64 !== undefined || after?.contentBase64 !== undefined,
        };
      }),
    });
    if (decision.status === "deny") throw new AuxError("permission_denied", decision.guidance);
    if (decision.status === "ask") {
      runtimeServices.safetyGate.park(request, request, decision.suspension);
      throw new AuxError("needs_input", decision.suspension.instruction, {
        park: {
          kind: decision.suspension.kind,
          instruction: decision.suspension.instruction,
          approvalId: decision.suspension.approvalId,
        },
      });
    }
    if (actor !== "user") checkCodingOwner(runId);
    return runtimeServices.safetyGate.policyFence(runId);
  };
  const authorizeCodingFiles = (request: CodingFileAuthorization, context: CodingFileContext) => {
    if (repo.getRun(context.runId)?.config?.executionTarget === "cloud")
      throw new AuxError("capability_unsupported", "Local coding files are unavailable in a cloud run.");
    return authorizeCodingAction(
      context.runId,
      request.category,
      request.actionId,
      [request.paths, request.before, request.after],
      request,
      context.actor,
    );
  };
  const agentLoop: AgentLoopHostDeps = {
    modelLimits: (modelId) => {
      const candidates = runtimeServices.settings.candidatesForModel(modelId);
      const ids = candidates.length ? candidates.map((route) => route.modelId) : [modelId];
      const models = runtimeServices.settings.registryModels();
      const limits = ids.map((id) => modelCapabilities(id, models));
      return {
        contextTokens: Math.min(...limits.map((model) => model?.contextTokens ?? 64_000)),
        maxOutputTokens: Math.min(4000, ...limits.map((model) => model?.maxOutputTokens ?? 4000)),
      };
    },
    get coderWorktrees() {
      return runtimeServices.coderWorktrees;
    },
    get codingFiles() {
      return runtimeServices.codingFiles;
    },
    get codingProcesses() {
      return runtimeServices.codingProcesses;
    },
    authorizeModelDestination: async (runId, destination) => {
      const original = repo.getRun(runId);
      if (!original || original.status !== "running" || !original.config?.nativeTurnContext)
        throw new AuxError("cancelled", "The original model run or window retired.");
      const source = runtimeServices.turnMentions.capture(runId);
      const config = JSON.stringify(original.config);
      const threadId = original.config.chatId ?? runId;
      const request = EffectRequestSchema.parse({
        profileId: env.AUX_BROWSER_PROFILE_ID ?? "default",
        scope: original.config.taskId
          ? { kind: "task", id: original.config.taskId }
          : {
              kind: "workspace",
              id: original.config.contextWorkspaceId ?? "default",
            },
        actor: "builtin_agent",
        effect: "egress",
        category: "external_tool",
        action: "agent.model.account",
        origin: destination,
        destination,
        dataClasses: [],
        provenance: "template",
        invocationDigest: createHash("sha256")
          .update(
            JSON.stringify([
              runId,
              original.goal,
              config,
              destination,
              runtimeServices.settings.modelCacheGeneration(),
            ]),
          )
          .digest("hex"),
        turnId: runId,
        threadId,
        runId,
        requestedAt: Date.now(),
      });
      await runtimeServices.safetyGate.checkTrustedEffect(request, {
        profileId: request.profileId,
        scope: request.scope,
        actor: request.actor,
        turnId: runId,
        threadId,
        runId,
      });
      const current = repo.getRun(runId);
      if (
        !current ||
        current.status !== "running" ||
        JSON.stringify(current.config) !== config ||
        runtimeServices.turnMentions.capture(runId) !== source
      )
        throw new AuxError("cancelled", "The original model source changed during admission.");
    },
    prepareWaitingPhrase: (input) =>
      runtimeServices.runs.prepareWaitingPhrase({
        ...input,
        authorize: async (route) => {
          input.checkOwner();
          const run = repo.getRun(input.runId);
          if (!run || run.status !== "running")
            throw new AuxError("cancelled", "The original waiting request ended.");
          if (route.kind === "on-device") return;
          const threadId = run.config?.chatId ?? input.runId;
          const request = EffectRequestSchema.parse({
            profileId: env.AUX_BROWSER_PROFILE_ID ?? "default",
            scope: run.config?.taskId
              ? { kind: "task", id: run.config.taskId }
              : { kind: "workspace", id: run.config?.contextWorkspaceId ?? "default" },
            actor: "builtin_agent",
            effect: "egress",
            category: "external_tool",
            action: "agent.utility.waiting",
            origin: route.destination,
            destination: route.destination,
            dataClasses: [],
            provenance: "template",
            invocationDigest: createHash("sha256")
              .update(
                JSON.stringify([
                  "waiting",
                  input.runId,
                  run.goal,
                  route.modelId,
                  runtimeServices.settings.modelCacheGeneration(),
                ]),
              )
              .digest("hex"),
            turnId: input.runId,
            threadId,
            runId: input.runId,
            requestedAt: Date.now(),
          });
          await runtimeServices.safetyGate.checkTrustedEffect(request, {
            profileId: request.profileId,
            scope: request.scope,
            actor: request.actor,
            turnId: input.runId,
            threadId,
            runId: input.runId,
          });
          input.checkOwner();
        },
      }),
    generateImage: (input) =>
      runtimeServices.runs.generateImage({
        ...input,
        authorize: async (runId) => {
          input.checkOwner();
          const run = repo.getRun(runId);
          if (!run) throw new AuxError("cancelled", "The original image run ended.");
          const threadId = run.config?.chatId ?? runId;
          const request = EffectRequestSchema.parse({
            profileId: env.AUX_BROWSER_PROFILE_ID ?? "default",
            scope: run.config?.taskId
              ? { kind: "task", id: run.config.taskId }
              : { kind: "workspace", id: run.config?.contextWorkspaceId ?? "default" },
            actor: "builtin_agent",
            effect: "egress",
            category: "external_tool",
            action: "agent.images.generate",
            origin: "https://ai-gateway.vercel.sh",
            destination: "https://ai-gateway.vercel.sh/",
            dataClasses: [],
            provenance: "template",
            invocationDigest: createHash("sha256")
              .update(
                JSON.stringify([
                  "image-generation",
                  runId,
                  input.prompt,
                  runtimeServices.settings.imageModel(),
                  runtimeServices.settings.modelCacheGeneration(),
                ]),
              )
              .digest("hex"),
            turnId: runId,
            threadId,
            runId,
            requestedAt: Date.now(),
          });
          await runtimeServices.safetyGate.checkTrustedEffect(request, {
            profileId: request.profileId,
            scope: request.scope,
            actor: request.actor,
            turnId: runId,
            threadId,
            runId,
          });
          input.checkOwner();
        },
      }),
    summarizePage: (input) =>
      runtimeServices.runs.summarizePage({
        ...input,
        cache: pageDerivativeCache(
          {
            repo,
            settings: runtimeServices.settings,
            pages: runtimeServices.pages,
            contentMemory: runtimeServices.contentMemory,
            native,
          },
          [input.observation.pageId],
        ),
        authorize: async (route) => {
          input.checkOwner();
          const run = repo.getRun(input.runId);
          if (!run || run.status !== "running")
            throw new AuxError("cancelled", "The original summary request ended.");
          if (route.kind === "on-device") return;
          const threadId = run.config?.chatId ?? input.runId;
          const request = EffectRequestSchema.parse({
            profileId: env.AUX_BROWSER_PROFILE_ID ?? "default",
            scope: run.config?.taskId
              ? { kind: "task", id: run.config.taskId }
              : { kind: "workspace", id: run.config?.contextWorkspaceId ?? "default" },
            actor: "builtin_agent",
            effect: "egress",
            category: "external_tool",
            action: "agent.pageSummary",
            origin: route.destination,
            destination: route.destination,
            dataClasses: memoryContentSensitivityReason(input.observation.content.text)
              ? ["sensitive"]
              : ["none"],
            provenance: "page",
            invocationDigest: createHash("sha256")
              .update(
                JSON.stringify([
                  "page-summary",
                  input.observation.pageId,
                  input.observation.observationId,
                  input.observation.documentEpoch,
                  input.observation.revision,
                  input.focus ?? "",
                  input.runId,
                  run.goal,
                  route.modelId,
                  runtimeServices.settings.modelCacheGeneration(),
                ]),
              )
              .digest("hex"),
            turnId: input.runId,
            threadId,
            runId: input.runId,
            requestedAt: Date.now(),
          });
          await runtimeServices.safetyGate.checkTrustedEffect(request, {
            profileId: request.profileId,
            scope: request.scope,
            actor: request.actor,
            turnId: input.runId,
            threadId,
            runId: input.runId,
          });
          input.checkOwner();
        },
      }),

    workspaceContext: (workspaceId) => runtimeServices.workspaceFolders.context(workspaceId),
    prepareWebFetch: (url, ctx) => prepareWebRead(url, ctx, "agent.web.fetch"),
    prepareWebSearch: async (query, ctx) => {
      const engine = native.available()
        ? await native.searchEngineGet?.()
        : runtimeServices.settings.searchEngine();
      if (!engine) throw new AuxError("backend_unavailable", "Profile search engine is unavailable.");
      return prepareWebRead(engine.replaceAll("%s", encodeURIComponent(query)), ctx, "agent.web.search");
    },
    webFetch: async (url, ctx) => {
      const prepared = await agentLoop.prepareWebFetch!(url, ctx);
      return "park" in prepared ? prepared : prepared.execute();
    },
    webSearch: async (query, ctx) => {
      const prepared = await agentLoop.prepareWebSearch!(query, ctx);
      return "park" in prepared ? prepared : prepared.execute();
    },
    recall: async (_query, ctx) => {
      ctx.signal.throwIfAborted();
      const empty = async () => ({ hits: [], admit: () => false });
      const original = repo.getRun(ctx.runId);
      const workspaceId = original?.config?.contextWorkspaceId;
      const memory = runtimeServices.contentMemory;
      if (
        !original ||
        original.status !== "running" ||
        !workspaceId ||
        !memory ||
        original.config?.privateTask ||
        repo.conversationPrivateTask(ctx.threadId)
      )
        return empty;
      const query = original.goal;
      const configuration = JSON.stringify(original.config);
      const source = runtimeServices.turnMentions.capture(ctx.runId);
      const policy = memory.policy(workspaceId);
      const workspace = runtimeServices.tasks.workspaceMemory(workspaceId);
      const browsingPolicy = runtimeServices.browsingMemory.policy(workspaceId);
      if (!policy.enabled || !workspace.enabled || !browsingPolicy.enabled) return empty;
      let invalidated = false;
      const unsubscribe = events.subscribe((event) => {
        if (
          event.payload.workspaceId === workspaceId &&
          (event.type === "workspace.memory.updated" ||
            event.type === "workspace.browsingMemory.updated" ||
            (event.type === "workspace.contentMemory.updated" && event.payload.policyChanged))
        )
          invalidated = true;
      });
      ctx.signal.addEventListener("abort", unsubscribe, { once: true });
      const current = () => {
        if (
          invalidated ||
          ctx.signal.aborted ||
          !repo.getWorkspace(workspaceId) ||
          !runtimeServices.turnMentions.has(ctx.runId)
        )
          return false;
        const run = repo.getRun(ctx.runId);
        if (
          run?.status !== "running" ||
          run.goal !== query ||
          JSON.stringify(run.config) !== configuration ||
          repo.conversationPrivateTask(ctx.threadId) ||
          runtimeServices.turnMentions.capture(ctx.runId) !== source
        )
          return false;
        if (original.config?.taskId) {
          const task = repo.db
            .prepare("SELECT revision FROM tasks WHERE task_id=?")
            .get(original.config.taskId);
          if (task?.revision !== original.config.taskRevision) return false;
        }
        return (
          runtimeServices.tasks.workspaceMemory(workspaceId).revision === workspace.revision &&
          JSON.stringify(memory.policy(workspaceId)) === JSON.stringify(policy) &&
          JSON.stringify(runtimeServices.browsingMemory.policy(workspaceId)) ===
            JSON.stringify(browsingPolicy)
        );
      };
      const token = original.config?.nativeTurnContext;
      const window = token && native.turnSourceContext ? await native.turnSourceContext(token) : undefined;
      if (!current()) return empty;
      const sourceRow = repo.db.prepare(`SELECT ciphertext,expires_at,captured_at FROM content_memory
        WHERE memory_id=? AND profile_id=? AND workspace_id=?`);
      const stamp = (memoryId: string) => {
        const row = sourceRow.get(memoryId, env.AUX_BROWSER_PROFILE_ID!, workspaceId) as
          { ciphertext: string; expires_at: number; captured_at: number } | undefined;
        return row &&
          row.expires_at > Date.now() &&
          row.captured_at > Date.now() - policy.retentionDays * 86_400_000
          ? createHash("sha256").update(row.ciphertext).digest("hex")
          : undefined;
      };
      // Retain only encrypted-source identities; excerpts are hydrated afresh for each provider request.
      const references = (await memory.search(workspaceId, query, 5, ctx.signal)).flatMap(({ memoryId }) => {
        const version = stamp(memoryId);
        return version ? [{ memoryId, version }] : [];
      });
      if (!current()) return empty;
      return async (signal) => {
        const absent = { hits: [], admit: () => false };
        if (!current() || signal.aborted) return absent;
        if (window && token && native.turnSourceContext) {
          const latest = await native.turnSourceContext(token);
          if (
            latest.windowId !== window.windowId ||
            latest.layout?.window.activeSpaceId !== window.layout?.window.activeSpaceId ||
            !latest.layout?.shared.spaces.some(
              (space) =>
                space.id === latest.layout?.window.activeSpaceId &&
                !space.archived &&
                space.workspaceId === workspaceId,
            )
          )
            return absent;
        }
        if (!current() || signal.aborted) return absent;
        const hits: { title: string; url: string; text: string }[] = [];
        const used: typeof references = [];
        for (const ref of references) {
          if (stamp(ref.memoryId) !== ref.version) continue;
          const page = await memory.get(workspaceId, ref.memoryId);
          if (!current() || signal.aborted) return absent;
          if (!page || stamp(ref.memoryId) !== ref.version) continue;
          const text = contentMemoryExcerpt(page.text, query);
          if (text.normalize("NFKC").replace(/\s+/gu, " ").length < MEMORY_WINDOW) continue;
          hits.push({ title: page.title, url: page.url, text });
          used.push(ref);
        }
        return {
          hits,
          admit: () => {
            if (!current() || signal.aborted || used.some((ref) => stamp(ref.memoryId) !== ref.version))
              return false;
            for (const hit of hits) browserEgress?.protect(ctx.runId, hit.text, "memory");
            return true;
          },
        };
      };
    },
    // 06-X history_search / memory_search — the same projections the shell uses.
    historySearch: async (query, limit, context) => {
      if (!context.checkOwner || !context.signal)
        throw new AuxError("permission_denied", "History search requires its original execution owner.");
      const checkOwner = context.checkOwner;
      checkOwner();
      const original = repo.getRun(context.runId);
      const workspaceId = original?.config?.contextWorkspaceId;
      const permitted = () => {
        checkOwner();
        const current = repo.getRun(context.runId);
        return (
          !!workspaceId &&
          current?.status === "running" &&
          current.config?.contextWorkspaceId === workspaceId &&
          !current.config?.privateTask &&
          !repo.conversationPrivateTask(current.config?.chatId ?? current.runId) &&
          runtimeServices.browsingMemory.policy(workspaceId).enabled
        );
      };
      if (!permitted())
        return {
          mode: "lexical" as const,
          message: "History recall is disabled for this original task or Space.",
          entries: [],
        };
      const memory = runtimeServices.contentMemory;
      if (!memory) throw new AuxError("capability_unsupported", "Local history recall is unavailable.");
      return memory.semanticHistory(workspaceId!, query, limit, context.signal, () => {
        if (!permitted()) throw new AuxError("cancelled", "The original history task or Space changed.");
      });
    },
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
          nativeTurnContext: run.config?.nativeTurnContext,
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
      let groupId = replGroups.get(ctx.runId) ?? runtimeServices.subagents.groupForParent(ctx.runId)?.groupId;
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
      if (!profile.success) throw new AuxError("invalid_params", "Choose an Aux agent profile name.");
      const agent = await runtimeServices.subagents.spawn(
        {
          groupId,
          goal: input.goal,
          profile: profile.data,
          pageIds: subagentPageScope(
            resolveAgentProfile(profile.data, run.config?.auxPackages),
            input.pageIds,
            run.pageIds,
          ),
          tokenAllocation: 0,
          costAllocationUsd: 0,
          maxModelCalls: 0,
        },
        ctx.toolCallId,
      );
      return { cellId: agent.agentId, state: agent.state, recovery: agent.recovery };
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
          const fence = runtimeServices.safetyGate.policyFence(ctx.runId);
          const defaultNetwork =
            runtimeServices.approvals.effectivePolicy(runtimeServices.settings.agentPolicy(), ctx.runId)
              .agentMode !== "ask";
          const network = input.network ?? defaultNetwork;
          try {
            await authorizeCodingAction(
              ctx.runId,
              "bash",
              createHash("sha256")
                .update(JSON.stringify([ctx, input]))
                .digest("hex"),
              [input.command, input.workdir, network],
            );
          } catch (error) {
            if (
              error instanceof AuxError &&
              error.code === "needs_input" &&
              error.detail &&
              typeof error.detail === "object" &&
              "park" in error.detail
            )
              return { park: error.detail.park as LoopPark };
            throw error;
          }
          await owner(ctx);
          fence();
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
    recoverReview: async (ctx, request, target) => {
      const { executor, admission } = await getCloudRuntime();
      await admission.restoreOriginal(ctx);
      return executor.recoverReview(ctx, request, target);
    },
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
        : await runtimeServices.codingProcesses.run(input, {
            ...ctx,
            signal: input.signal,
            actionId:
              ctx.actionId ??
              ctx.toolCallId ??
              createHash("sha256")
                .update(JSON.stringify([ctx.runId, input]))
                .digest("hex"),
          });
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
      run &&
      typeof run === "object" &&
      "runId" in run &&
      typeof run.runId === "string" &&
      "status" in run &&
      ["completed", "failed", "cancelled"].includes(String(run.status))
    )
      void serviceContainer
        .peek("codingProcesses")
        ?.closeRun(run.runId)
        .catch((error) => console.error("[aux-runtime] coding process cleanup failed", error));
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
        if (!closed && result.extracted) events.emit("workspace.memory.updated", { workspaceId, runId });
      })
      .catch(() => {
        if (!closed) events.emit("memory.pipeline.failed", { workspaceId, runId });
      })
      .finally(() => extractingRuns.delete(runId));
  });

  const takeoverRuns: Parameters<typeof handlePageTakeover>[3] = {
    cancel: (...args) => runtimeServices.runs.cancel(...args),
    pauseForTakeover: async (...args) => {
      const original = repo.getRun(args[0]);
      const connectionId = original?.config?.externalConnectionId;
      if (!connectionId) return runtimeServices.runs.pauseForTakeover(...args);
      runtimeServices.agentConnections.revoke(connectionId);
      await runtimeServices.externalSessions.end(
        connectionId,
        "cancelled",
        "You took control of the external agent's page",
      );
      return runtimeServices.runs.coordinator.get(args[0]);
    },
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
  channel?.onMethod("agent.revoke", async (params) => {
    const connectionId = (params as { connectionId?: unknown })?.connectionId;
    if (typeof connectionId !== "string") throw new Error("Invalid connection identity");
    const revoked = runtimeServices.agentConnections!.revoke(connectionId);
    await runtimeServices.externalSessions.end(connectionId, "cancelled", "Connection revoked");
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
    stopNativeProjectPreview = registerNativeProjectPreview(channel, {
      current: () => !closed,
      terminals: () => runtimeServices.terminals,
    });
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
  const sweepExternalSessions = async () => {
    try {
      await runtimeServices.externalSessions.sweepIdle();
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
      await runtimeServices.settings.initializeCredentials();
      if (closed) return;
      events.emit(EventTypes.SettingsChanged, { settings: runtimeServices.settings.all() });
      void runtimeServices.settings.listModels().catch(() => {
        if (!closed) process.stderr.write("[runtime] model catalog refresh unavailable\n");
      });
      if (env.AUX_HOST_SOCKET) {
        void ensureBlocking()
          .then(() => {
            if (!closed) return runtimeServices.blocking?.maintain();
          })
          .catch((error: unknown) => {
            const diagnostic = {
              code: error instanceof AuxError ? error.code : "internal",
              message:
                error instanceof Error ? error.message.slice(0, 512) : "Unknown initialization failure",
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
      stopNativeProjectPreview?.();
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
          Promise.allSettled(agentInstallWork),
          serviceContainer.peek("blocking")?.close(),
          serviceContainer.peek("terminals")?.dispose(),
          serviceContainer.peek("codingProcesses")?.close(),
          serviceContainer.peek("projects")?.dispose(),
          serviceContainer.peek("browserImport")?.close(),
          (async () => {
            await serviceContainer.peek("memoryPipeline")?.close();
            await serviceContainer.peek("contentMemory")?.close();
          })(),
          serviceContainer.peek("copilot")?.then((services) => services.close()),
          serviceContainer.peek("externalSessions")?.dispose(),
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
        ]);
        const failures = results
          .filter((result): result is PromiseRejectedResult => result.status === "rejected")
          .map((result) => result.reason);
        const turnTabs = serviceContainer.peek("turnTabs");
        if (turnTabs) {
          try {
            await turnTabs.endAll();
          } catch (error) {
            failures.push(error);
          } finally {
            turnTabs.dispose();
          }
        }
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
        run: () => serviceContainer.peek("contentMemory")?.close(),
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
    stopNativeProjectPreview?.();
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
  const liveRunIds = new Set(activeRunIds(repo));
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
