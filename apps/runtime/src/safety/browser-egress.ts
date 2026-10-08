import { browserContextPage } from "../services/browser-context-page.js";
import { createHash } from "node:crypto";
import {
  HostMethods,
  AuxError,
  EgressContextSchema,
  EgressLeaseSchema,
  EgressRequestSchema,
  NativeCdpNavigationReceiptSchema,
  type NativeCdpNavigationReceipt,
  type EgressDecision,
  type EgressLease,
  type EgressRequest,
  type AgentPageCreate,
  type AgentPageIsolation,
  type NativePageTakeover,
} from "@aux/contracts";
import type { NativeBridge } from "../native.js";
import { AgentEgressGuard, type EgressAuditEvidence, type ProtectedClass } from "./egress.js";

interface RunIdentity {
  privateTask?: boolean;
  nativeTurnContext?: string;
  taskId?: string;
  taskRevision: number;
  threadId: string;
}
function runSnapshot(run: RunIdentity | null | undefined) {
  return run ? { ...run } : run;
}

interface PageIdentity {
  agentIsolation?: AgentPageIsolation;
  sessionId?: string;
  url: string;
  documentEpoch: number;
  controller?: string;
  controllerEpoch?: number;
  viewStatus?: string;
}
interface BindingSource {
  runId: string;
  origin: string;
  run: RunIdentity;
  page: PageIdentity;
  version: number;
  /** Present only for an original installed continuation, never preparing Install. */
  retirement?: AbortController;
}
interface ActivePage {
  mode: AgentPageIsolation["mode"];
  runId: string;
  pageId: string;
  url: string;
  epoch: number;
  lease: EgressLease;
  timer?: ReturnType<typeof setInterval>;
  released: boolean;
  installed: boolean;
  acknowledgedExpiresAt: number;
  renewing?: boolean;
}

export interface BrowserEgressDeps {
  profileId: string;
  native: NativeBridge;
  run(runId: string): RunIdentity | null;
  page(pageId: string): PageIdentity;
  ownsPage(runId: string, pageId: string): boolean;
  /** Actual durable child-to-root ancestry, revalidated by the trusted producer. */
  runAncestry(runId: string): string[];
  prepareSessionPage?(pageId: string): Promise<void>;
  admitSessionPage?(input: {
    pageId: string;
    source: Pick<PageIdentity, "url" | "documentEpoch" | "controllerEpoch" | "sessionId">;
    isolation: AgentPageIsolation;
    current(): boolean;
  }): Promise<void>;
  retireSessionPage?(pageId: string, isolation: AgentPageIsolation): Promise<void>;
  audit(decision: EgressDecision, evidence: EgressAuditEvidence): void;
  /** Must approve the exact ephemeral request digest, never a standing grant. */
  approve(input: {
    runId: string;
    threadId: string;
    taskId?: string;
    digest: string;
    sourceOrigin: string;
    destinationOrigin: string;
    pageContent: boolean;
    signal: AbortSignal;
  }): Promise<boolean>;
  now?: () => number;
}

/**
 * Native request-path authority. Only the authenticated host calls request().
 * Renderer/model params never create, refresh, approve, or revoke these leases.
 */
export class BrowserEgress {
  private readonly guard: AgentEgressGuard;
  private readonly pages = new Map<string, ActivePage>();
  private readonly preparing = new Map<string, Promise<void>>();
  private readonly authorityVersions = new Map<string, number>();
  private readonly bindingSources = new Map<string, BindingSource>();
  private readonly pending = new Map<string, { active: ActivePage; controller: AbortController }>();
  private readonly runModes = new Map<string, AgentPageIsolation["mode"]>();
  private readonly seen = new Map<string, number>();
  private readonly retirementDebt = new Map<string, EgressLease>();
  private readonly borrowedSessions = new Map<
    string,
    { isolation: AgentPageIsolation; ancestry: string[] }
  >();
  private readonly mutationBarriers = new Set<(runId: string) => boolean>();
  private readonly now: () => number;
  private closed = false;

  constructor(private readonly deps: BrowserEgressDeps) {
    this.now = deps.now ?? Date.now;
    this.guard = new AgentEgressGuard({
      now: this.now,
      currentTaskRevision: (runId) => deps.run(runId)?.taskRevision ?? null,
      audit: deps.audit,
    });
  }

  /** Called only from the actual repository lifecycle mutation boundary. */
  async retireTerminalRegistrations(runIds: string[]): Promise<void> {
    if (!runIds.length) return;
    if (!this.deps.native.egressRunTerminal)
      throw new AuxError("capability_unsupported", "Native terminal-run retirement is unavailable.");
    for (const runId of runIds) {
      await Promise.allSettled(
        [...this.preparing]
          .filter(([pageId]) => {
            const source = this.bindingSources.get(pageId);
            return source && this.deps.runAncestry(source.runId).includes(runId);
          })
          .map(([, pending]) => pending),
      );
      HostMethods["native.egressRunTerminal"].result.parse(
        await this.deps.native.egressRunTerminal({ runId }),
      );
      for (const [pageId, original] of this.borrowedSessions) {
        if (!original.ancestry.includes(runId)) continue;
        await this.deps.retireSessionPage?.(pageId, original.isolation);
        if (this.borrowedSessions.get(pageId) === original) this.borrowedSessions.delete(pageId);
      }
    }
  }

  private retainRunMode(runId: string, run: RunIdentity): AgentPageIsolation["mode"] {
    const mode = run.privateTask ? "private" : "session";
    const original = this.runModes.get(runId);
    if (original && original !== mode)
      throw new AuxError("permission_denied", "The run’s original browser storage mode changed.");
    this.runModes.set(runId, mode);
    return mode;
  }

  /** Private creation authority; source transfers its URL only, never page state. */
  async creationScope(
    runId: string,
    sourcePageId?: string,
  ): Promise<Omit<AgentPageCreate, "windowId" | "background">> {
    const run = runSnapshot(this.deps.run(runId));
    if (this.closed || !run || !this.deps.native.createAgentPage)
      throw new AuxError(
        "capability_unsupported",
        "This browser cannot open a protected temporary tab. Update Aux before continuing.",
      );
    const ancestry = this.deps.runAncestry(runId);
    if (
      ancestry[0] !== runId ||
      ancestry.length === 0 ||
      ancestry.length > 32 ||
      new Set(ancestry).size !== ancestry.length
    )
      throw new AuxError("permission_denied", "The original run ancestry is unavailable.");
    const identity = {
      mode: this.retainRunMode(runId, run),
      profileId: this.deps.profileId,
      runId,
      taskId: run.taskId,
      taskRevision: run.taskRevision,
      ancestry,
    };
    if (!sourcePageId) return identity;
    const sourcePage = () => browserContextPage(() => this.deps.page(sourcePageId));
    const page = { ...sourcePage() };
    const url = new URL(page.url);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password)
      throw new AuxError("permission_denied", "Choose a website to open in a separate signed-out tab.");
    if (!this.deps.native.egressContext)
      throw new AuxError("capability_unsupported", "The source document cannot be verified.");
    const context = EgressContextSchema.parse(
      await this.deps.native.egressContext({ tabId: sourcePageId, expectedUrl: page.url }),
    );
    const after = sourcePage(),
      currentRun = this.deps.run(runId);
    if (
      JSON.stringify(this.deps.runAncestry(runId)) !== JSON.stringify(ancestry) ||
      context.profileId !== identity.profileId ||
      context.tabId !== sourcePageId ||
      context.sourceOrigin !== url.origin ||
      !currentRun ||
      currentRun.taskId !== run.taskId ||
      currentRun.taskRevision !== run.taskRevision ||
      !!currentRun.privateTask !== !!run.privateTask ||
      after.url !== page.url ||
      after.documentEpoch !== page.documentEpoch ||
      ["detached", "crashed"].includes(after.viewStatus ?? "")
    )
      throw new AuxError("ref_stale", "The selected source tab changed. Review it before continuing.");
    return {
      ...identity,
      source: { tabId: sourcePageId, expectedUrl: page.url, documentToken: context.documentToken },
    };
  }

  /** Called after the durable page claim and before observation or dispatch. */
  async acquire(runId: string, pageId: string, initialDestination?: string): Promise<() => void> {
    await this.ensure(runId, pageId, initialDestination);
    return () => this.revokePage(pageId, runId);
  }

  /** A changed document needs a new native identity before the next action. */
  async ensure(runId: string, pageId: string, initialDestination?: string): Promise<void> {
    const authorityVersion = this.authorityVersions.get(pageId) ?? 0;
    const pending = this.preparing.get(pageId);
    if (pending) {
      await pending.catch(() => {});
      if ((this.authorityVersions.get(pageId) ?? 0) !== authorityVersion)
        throw new AuxError("permission_denied", "Browser authority changed while preparing this page.");
      const current = this.pages.get(pageId);
      if (current?.runId === runId && this.current(current)) return;
      // A navigation can commit while context/install is in flight. Re-read
      // native identity for that document instead of stranding its subresources.
      if (this.preparing.get(pageId) === pending) this.preparing.delete(pageId);
      return this.ensure(runId, pageId, initialDestination);
    }
    const page = { ...this.deps.page(pageId) };
    const run = runSnapshot(this.deps.run(runId));
    if (!run) throw new AuxError("permission_denied", "The original task is no longer active.");
    const source = page.url;
    this.bindingSources.set(pageId, {
      runId,
      origin: source === "about:blank" ? "aux://blank" : new URL(source).origin,
      run: { ...run },
      page,
      version: authorityVersion,
    });
    const work = this.bind(runId, pageId, initialDestination, authorityVersion);
    this.preparing.set(pageId, work);
    try {
      await work;
    } finally {
      if (this.preparing.get(pageId) === work) {
        this.preparing.delete(pageId);
        this.bindingSources.delete(pageId);
      }
    }
  }

  private async bind(
    runId: string,
    pageId: string,
    initialDestination: string | undefined,
    authorityVersion: number,
  ): Promise<void> {
    const run = runSnapshot(this.deps.run(runId));
    const page = { ...this.deps.page(pageId) };
    if (
      this.closed ||
      this.blocked(runId) ||
      !run ||
      !this.deps.ownsPage(runId, pageId) ||
      page.controller === "human" ||
      page.viewStatus === "detached" ||
      page.viewStatus === "crashed"
    )
      throw new AuxError("permission_denied", "Browser transmission requires a current run-owned page.");
    this.retainRunMode(runId, run);
    const existing = this.pages.get(pageId);
    if (existing && this.current(existing) && existing.lease.expiresAt > this.now()) return;
    this.revokePage(pageId);
    await this.repay([...this.retirementDebt.values()].filter((lease) => lease.tabId === pageId));
    if (this.blocked(runId)) throw new AuxError("permission_denied", "Browser authority is being retired.");
    const { egressContext, egressInstall, egressRevoke } = this.deps.native;
    if (!egressContext || !egressInstall || !egressRevoke)
      throw new AuxError(
        "capability_unsupported",
        "This browser cannot enforce agent transmission authority.",
      );
    let native = EgressContextSchema.parse(
      await egressContext.call(this.deps.native, {
        tabId: pageId,
        expectedUrl: page.url,
      }),
    );
    if (this.blocked(runId) || (this.authorityVersions.get(pageId) ?? 0) !== authorityVersion)
      throw new AuxError("permission_denied", "Browser authority changed while reading its native document.");
    if (native.personControlled)
      throw new AuxError(
        "permission_denied",
        "The person holds this native document. Return control explicitly before running the task.",
      );
    if (!native.isolation && !run.privateTask) {
      if (!run.nativeTurnContext)
        throw new AuxError(
          "permission_denied",
          "An original native window is required to admit this session tab.",
        );
      if (!this.deps.native.adoptSessionPage)
        throw new AuxError("capability_unsupported", "This browser cannot admit the original session tab.");
      if (!this.deps.prepareSessionPage || !this.deps.admitSessionPage || !this.deps.retireSessionPage)
        throw new AuxError("capability_unsupported", "Original session reader admission is unavailable.");
      // Join the selected person-read session to the native document token.
      // Adoption checks that same token again after this fresh native readback.
      await this.deps.prepareSessionPage(pageId);
      const source = this.deps.page(pageId);
      if (
        !page.sessionId ||
        source.sessionId !== page.sessionId ||
        source.url !== page.url ||
        source.documentEpoch !== page.documentEpoch ||
        source.controllerEpoch !== page.controllerEpoch ||
        this.blocked(runId) ||
        (this.authorityVersions.get(pageId) ?? 0) !== authorityVersion
      )
        throw new AuxError("ref_stale", "The selected session document changed before admission.");
      const ancestry = this.deps.runAncestry(runId);
      if (
        ancestry[0] !== runId ||
        !ancestry.length ||
        ancestry.length > 32 ||
        new Set(ancestry).size !== ancestry.length ||
        native.profileId !== this.deps.profileId ||
        native.tabId !== pageId ||
        native.sourceOrigin !== new URL(page.url).origin
      )
        throw new AuxError("permission_denied", "The original session source changed before admission.");
      native = EgressContextSchema.parse(
        await this.deps.native.adoptSessionPage({
          profileId: this.deps.profileId,
          runId,
          taskId: run.taskId,
          taskRevision: run.taskRevision,
          ancestry,
          token: run.nativeTurnContext,
          source: { tabId: pageId, expectedUrl: page.url, documentToken: native.documentToken },
        }),
      );
      if (native.isolation?.runId === runId)
        this.borrowedSessions.set(pageId, { isolation: native.isolation, ancestry });
      if (
        this.blocked(runId) ||
        (this.authorityVersions.get(pageId) ?? 0) !== authorityVersion ||
        JSON.stringify(this.deps.runAncestry(runId)) !== JSON.stringify(ancestry)
      )
        throw new AuxError("ref_stale", "Original session admission was retired.");
    }
    const isolation = native.isolation;
    if (
      !isolation ||
      isolation.runId !== runId ||
      isolation.taskId !== run.taskId ||
      isolation.taskRevision !== run.taskRevision ||
      isolation.mode !== (run.privateTask ? "private" : "session") ||
      (page.agentIsolation && page.agentIsolation.mode !== isolation.mode) ||
      (page.agentIsolation?.isolationId && page.agentIsolation.isolationId !== isolation.isolationId)
    )
      throw new AuxError(
        "permission_denied",
        "This tab does not match the run’s original browser storage mode. Open a new Agent tab for this task.",
      );
    const after = this.deps.page(pageId),
      currentRun = this.deps.run(runId);
    if (
      !this.deps.ownsPage(runId, pageId) ||
      !currentRun ||
      currentRun.taskId !== run.taskId ||
      currentRun.taskRevision !== run.taskRevision ||
      !!currentRun.privateTask !== !!run.privateTask ||
      currentRun.nativeTurnContext !== run.nativeTurnContext ||
      after.url !== page.url ||
      after.documentEpoch !== page.documentEpoch ||
      after.controller === "human" ||
      native.profileId !== this.deps.profileId ||
      native.tabId !== pageId ||
      native.sourceOrigin !== (page.url === "about:blank" ? "aux://blank" : new URL(page.url).origin)
    )
      throw new AuxError("ref_stale", "The page changed while preparing protected browser requests.");
    const lease = this.guard.issue({
      profileId: native.profileId,
      tabId: native.tabId,
      frameId: native.frameId,
      documentToken: native.documentToken,
      sourceOrigin: native.sourceOrigin,
      isolationId: isolation.isolationId,
      controlGeneration: native.controlGeneration,
      runId,
      taskId: run.taskId,
      taskRevision: run.taskRevision,
      documentEpoch: page.documentEpoch,
      recipientOrigins: [],
      ...(initialDestination ? { initialDestination } : {}),
    });
    const active: ActivePage = {
      mode: isolation.mode,
      runId,
      pageId,
      url: page.url,
      epoch: page.documentEpoch,
      lease,
      released: false,
      installed: false,
      acknowledgedExpiresAt: 0,
    };
    this.pages.set(pageId, active);
    try {
      const installed = await egressInstall.call(this.deps.native, { lease, expectedUrl: page.url });
      if (installed?.accepted !== true)
        throw new AuxError("permission_denied", "Native browser request protection was not accepted.");
      if ((this.authorityVersions.get(pageId) ?? 0) !== authorityVersion || !this.current(active))
        throw new AuxError("ref_stale", "The page changed while installing request protection.");
      active.installed = true;
      active.acknowledgedExpiresAt = lease.expiresAt;
      if (this.borrowedSessions.get(pageId)?.isolation.isolationId === isolation.isolationId)
        await this.deps.admitSessionPage?.({
          pageId,
          source: page,
          isolation,
          current: () =>
            !this.closed &&
            (this.authorityVersions.get(pageId) ?? 0) === authorityVersion &&
            this.current(active),
        });
      if (!this.current(active))
        throw new AuxError("ref_stale", "The original session changed while attaching its reader.");
      active.timer = setInterval(() => {
        void this.renew(active);
      }, 10_000);
      active.timer.unref();
    } catch (error) {
      // A missing/rejected Install reply does not prove the browser omitted
      // its effect. Retain that exact lease until native retirement ACK.
      this.owe(active);
      try {
        await this.repay([active.lease]);
      } catch (cleanupError) {
        throw new AggregateError(
          [error, cleanupError],
          "Browser authority installation and retirement failed",
          { cause: error },
        );
      }
      throw error;
    }
  }

  /** Capture the original acknowledged lease for one native CDP attachment.
   * The closure never adopts a replacement row or a receive-time run identity.
   */
  captureCdpAuthority(
    pageId: string,
    nativeLease: EgressLease,
  ): {
    lease: Readonly<Omit<EgressLease, "recipientOrigins">> & { readonly recipientOrigins: readonly string[] };
    current(): boolean;
    acknowledgedExpiresAt(): number;
  } {
    const original = EgressLeaseSchema.parse(nativeLease);
    const active = this.pages.get(pageId);
    const matches = () =>
      !!active &&
      !this.closed &&
      active.installed &&
      this.current(active) &&
      active.acknowledgedExpiresAt > this.now() &&
      active.lease.expiresAt > this.now() &&
      ![...this.retirementDebt.values()].some((lease) => lease.tabId === pageId) &&
      sameCdpLease(original, active.lease);
    if (!matches())
      throw new AuxError(
        "permission_denied",
        "The original acknowledged browser attachment authority is unavailable.",
      );
    const lease = Object.freeze({
      ...original,
      recipientOrigins: Object.freeze([...original.recipientOrigins]),
    });
    return Object.freeze({
      lease,
      current: matches,
      acknowledgedExpiresAt: () => {
        if (!matches() || !active)
          throw new AuxError("permission_denied", "Original CDP acknowledged authority retired.");
        return active.acknowledgedExpiresAt;
      },
    });
  }

  /** Original controlled-command continuation. No model/RPC input can
   * manufacture this closure; native TAKE plus fresh Install remain required. */
  captureControlledNavigation(runId: string, pageId: string, validateSource: () => void) {
    validateSource();
    const original = this.pages.get(pageId);
    if (
      !original ||
      original.runId !== runId ||
      !original.installed ||
      !this.current(original) ||
      original.acknowledgedExpiresAt <= this.now() ||
      this.preparing.has(pageId) ||
      this.bindingSources.has(pageId) ||
      [...this.retirementDebt.values()].some((lease) => lease.tabId === pageId)
    )
      throw new AuxError(
        "permission_denied",
        "Controlled navigation needs its original installed browser authority.",
      );
    const originalLease = EgressLeaseSchema.parse(original.lease);
    const commandExpiry = original.acknowledgedExpiresAt;
    let effectExpiry = commandExpiry;
    const originalPage = { ...this.deps.page(pageId) };
    const run = runSnapshot(this.deps.run(runId));
    if (!run) throw new AuxError("permission_denied", "The original navigation run is unavailable.");
    const version = this.authorityVersions.get(pageId) ?? 0;
    const retirement = new AbortController();
    const binding: BindingSource = {
      runId,
      origin: originalLease.sourceOrigin,
      run: { ...run },
      page: originalPage,
      version,
      retirement,
    };
    const retirementTimer = setTimeout(() => retirement.abort(), Math.max(0, commandExpiry - this.now()));
    retirementTimer.unref();
    let protection: ReturnType<AgentEgressGuard["captureDocumentContinuation"]> | undefined;
    this.bindingSources.set(pageId, binding);
    let consumed = false,
      completed = false,
      published = false,
      staged: { url: string; epoch: number } | undefined;
    let replacement: ActivePage | undefined;
    const check = (validateOriginal = true) => {
      if (validateOriginal) validateSource();
      const currentRun = this.deps.run(runId),
        page = this.deps.page(pageId);
      if (
        retirement.signal.aborted ||
        this.closed ||
        this.blocked(runId) ||
        this.now() >= effectExpiry ||
        !this.deps.ownsPage(runId, pageId) ||
        !currentRun ||
        currentRun.taskId !== run.taskId ||
        currentRun.taskRevision !== run.taskRevision ||
        !!currentRun.privateTask !== !!run.privateTask ||
        this.bindingSources.get(pageId) !== binding ||
        (this.authorityVersions.get(pageId) ?? 0) !== version ||
        page.controller === "human" ||
        page.controllerEpoch !== originalPage.controllerEpoch ||
        page.url !== (staged?.url ?? originalPage.url) ||
        page.documentEpoch !== (staged?.epoch ?? originalPage.documentEpoch)
      )
        throw new AuxError("ref_stale", "The original controlled navigation source or authority changed.");
    };
    return {
      signal: retirement.signal,
      expiresAt: commandExpiry,
      check,
      install: async (
        raw: NativeCdpNavigationReceipt,
        stage: (document: { url: string; documentEpoch: number }) => void,
        deadline: number,
      ) => {
        if (!Number.isSafeInteger(deadline) || deadline <= this.now() || deadline > commandExpiry)
          throw new AuxError(
            "ref_stale",
            "The original navigation command deadline is unavailable or expired.",
          );
        effectExpiry = deadline;
        check();
        if (consumed || this.pages.get(pageId) !== original)
          throw new AuxError("ref_stale", "The original navigation authority was already consumed.");
        consumed = true;
        const receipt = NativeCdpNavigationReceiptSchema.parse(raw);
        const context = receipt.context,
          isolation = context.isolation;
        const url = new URL(receipt.url);
        if (
          !["http:", "https:"].includes(url.protocol) ||
          url.username ||
          url.password ||
          receipt.originalLeaseId !== originalLease.leaseId ||
          context.tabId !== pageId ||
          context.profileId !== originalLease.profileId ||
          context.personControlled ||
          context.documentToken === originalLease.documentToken ||
          context.controlGeneration === originalLease.controlGeneration ||
          context.sourceOrigin !== url.origin ||
          !isolation ||
          isolation.isolationId !== originalLease.isolationId ||
          isolation.runId !== runId ||
          isolation.taskId !== run.taskId ||
          isolation.taskRevision !== run.taskRevision ||
          isolation.mode !== original.mode ||
          isolation.mode !== (run.privateTask ? "private" : "session")
        )
          throw new AuxError(
            "ref_stale",
            "The native navigation receipt belongs to another source or document.",
          );
        // Snapshot the final actual taint and retire the old guard in this
        // same synchronous section. No late taint can fall between them.
        protection = this.guard.captureDocumentContinuation(originalLease.leaseId);
        this.owe(original);
        await this.repay([original.lease]);
        check();
        staged = { url: receipt.url, epoch: originalPage.documentEpoch + 1 };
        stage({ url: staged.url, documentEpoch: staged.epoch });
        check();
        const lease = protection.issue({
          profileId: context.profileId,
          tabId: pageId,
          frameId: context.frameId,
          documentToken: context.documentToken,
          controlGeneration: context.controlGeneration,
          isolationId: isolation.isolationId,
          runId,
          taskId: run.taskId,
          taskRevision: run.taskRevision,
          sourceOrigin: context.sourceOrigin,
          documentEpoch: staged.epoch,
          recipientOrigins: [],
          expiresAt: effectExpiry,
        });
        replacement = {
          mode: isolation.mode,
          runId,
          pageId,
          url: staged.url,
          epoch: staged.epoch,
          lease,
          released: false,
          installed: false,
          acknowledgedExpiresAt: 0,
        };
        this.pages.set(pageId, replacement);
        try {
          if (!this.deps.native.egressInstall)
            throw new AuxError(
              "permission_denied",
              "Native navigation authority installation is unavailable.",
            );
          const installed = await this.deps.native.egressInstall({
            lease,
            expectedUrl: staged.url,
            navigationTransitionId: receipt.navigationTransitionId,
          });
          check();
          if (
            installed.accepted !== true ||
            this.pages.get(pageId) !== replacement ||
            !this.current(replacement)
          )
            throw new AuxError(
              "ref_stale",
              "The navigation's fresh native installation was not acknowledged.",
            );
          replacement.installed = true;
          replacement.acknowledgedExpiresAt = lease.expiresAt;
          return lease;
        } catch (error) {
          this.owe(replacement);
          try {
            await this.repay([replacement.lease]);
          } catch (cleanupError) {
            throw new AggregateError([error, cleanupError], "Navigation installation and retirement failed", {
              cause: error,
            });
          }
          throw error;
        }
      },
      complete: () => {
        check();
        if (
          completed ||
          !protection ||
          !replacement?.installed ||
          this.pages.get(pageId) !== replacement ||
          !this.current(replacement)
        )
          throw new AuxError("ref_stale", "The fresh navigation authority is not current.");
        completed = true;
        protection.discard();
      },
      publish: (validatePublication: () => void) => {
        validatePublication();
        check(false);
        if (
          !completed ||
          published ||
          !replacement?.installed ||
          this.pages.get(pageId) !== replacement ||
          !this.current(replacement)
        )
          throw new AuxError(
            "ref_stale",
            "The completed navigation is unavailable for original publication.",
          );
        published = true;
        clearTimeout(retirementTimer);
        this.bindingSources.delete(pageId);
        const interval = Math.max(
          1,
          Math.min(10_000, Math.floor((replacement.acknowledgedExpiresAt - this.now()) / 2)),
        );
        replacement.timer = setInterval(() => {
          void this.renew(replacement!);
        }, interval);
        replacement.timer.unref();
      },
      cancel: async () => {
        retirement.abort();
        clearTimeout(retirementTimer);
        protection?.discard();
        if (this.pages.get(pageId) === replacement && replacement) this.owe(replacement);
        else if (this.pages.get(pageId) === original) this.owe(original);
        try {
          await this.repay([...this.retirementDebt.values()].filter((lease) => lease.tabId === pageId));
        } finally {
          if (this.bindingSources.get(pageId) === binding) this.bindingSources.delete(pageId);
        }
      },
    };
  }

  private current(active: ActivePage): boolean {
    if (
      this.blocked(active.runId) ||
      active.released ||
      this.pages.get(active.pageId) !== active ||
      !this.deps.ownsPage(active.runId, active.pageId)
    )
      return false;
    const run = this.deps.run(active.runId);
    let page: PageIdentity;
    try {
      page = this.deps.page(active.pageId);
    } catch {
      return false;
    }
    return (
      page.controller !== "human" &&
      page.viewStatus !== "detached" &&
      page.viewStatus !== "crashed" &&
      !!run &&
      run.taskId === active.lease.taskId &&
      run.taskRevision === active.lease.taskRevision &&
      active.mode === (run.privateTask ? "private" : "session") &&
      (!page.agentIsolation || page.agentIsolation.mode === active.mode) &&
      page.url === active.url &&
      page.documentEpoch === active.epoch
    );
  }

  private async renew(active: ActivePage): Promise<void> {
    if (active.renewing) return;
    active.renewing = true;
    try {
      if (!this.current(active)) {
        this.owe(active);
        await this.repay([active.lease]).catch(() => {});
        return;
      }
      const previousAcknowledgedExpiry = active.acknowledgedExpiresAt;
      let renewedLease: EgressLease;
      try {
        renewedLease = this.guard.renew(active.lease.leaseId);
        active.lease = renewedLease;
        const renewed = await this.deps.native.egressInstall!({
          lease: renewedLease,
          expectedUrl: active.url,
        });
        if (renewed?.accepted !== true)
          throw new AuxError(
            "permission_denied",
            "Native browser request protection renewal was not accepted.",
          );
      } catch {
        this.owe(active);
        await this.repay([active.lease]).catch(() => {});
        return;
      }
      if (!this.current(active) || previousAcknowledgedExpiry <= this.now()) {
        // An ACK cannot resurrect an expired or replaced original row.
        this.owe(active);
        await this.repay([active.lease]).catch(() => {});
        return;
      }
      active.acknowledgedExpiresAt = renewedLease.expiresAt;
    } finally {
      active.renewing = false;
    }
  }

  protect(runId: string, value: string, dataClass: ProtectedClass): void {
    if (!this.deps.run(runId))
      throw new AuxError("permission_denied", "Protected context requires a current run.");
    if (dataClass === "memory") {
      try {
        this.guard.protectRunMemory(runId, value);
      } catch (error) {
        this.revokeRun(runId);
        throw error;
      }
      return;
    }
    const active = [...this.pages.values()].filter((page) => page.runId === runId && this.current(page));
    if (!active.length)
      throw new AuxError("permission_denied", "Protected context requires an active browser lease.");
    try {
      for (const page of active) {
        this.guard.taint(page.lease.leaseId, value, dataClass);
      }
    } catch (error) {
      this.revokeRun(runId);
      throw error;
    }
  }

  notePageText(runId: string, pageId: string, text: string, observedUrl = this.deps.page(pageId).url): void {
    if (!this.deps.run(runId) || !this.deps.ownsPage(runId, pageId))
      throw new AuxError("permission_denied", "Page evidence requires its current browser lease.");
    if (!text) return;
    try {
      this.guard.noteRunPageText(runId, new URL(observedUrl).origin, text);
    } catch (error) {
      this.revokeRun(runId);
      throw error;
    }
  }

  /** Capture only the original installed row or a genuine in-flight binding.
   * The returned check is run inside the serialized control mutation, before
   * retirement and again after its native ACK. It never adopts a new run/doc.
   */
  nativeTakeoverValidation(input: NativePageTakeover): {
    validate(): Promise<void>;
    validateRetired(): Promise<void>;
  } {
    const { scope } = input;
    const active = this.pages.get(scope.tabId);
    const binding = this.bindingSources.get(scope.tabId);
    const run = runSnapshot(this.deps.run(scope.runId));
    const page = { ...this.deps.page(scope.tabId) };
    const version = this.authorityVersions.get(scope.tabId) ?? 0;
    const reject = () => {
      throw new AuxError("ref_stale", "The original native input belongs to a changed task or document.");
    };
    if (
      !run ||
      scope.profileId !== this.deps.profileId ||
      run.taskId !== scope.taskId ||
      run.taskRevision !== scope.taskRevision ||
      this.runModes.get(scope.runId) !== (run.privateTask ? "private" : "session") ||
      !this.deps.ownsPage(scope.runId, scope.tabId)
    )
      reject();
    if (input.phase === "installed") {
      if (
        !active ||
        active.runId !== scope.runId ||
        active.mode !== (run?.privateTask ? "private" : "session") ||
        active.lease.leaseId !== input.lease.leaseId ||
        (
          [
            "leaseId",
            "controlGeneration",
            "isolationId",
            "profileId",
            "runId",
            "taskRevision",
            "taskId",
            "tabId",
            "frameId",
            "documentToken",
            "documentEpoch",
            "sourceOrigin",
            "initialDestination",
            "recipientOrigins",
            "issuedAt",
            "expiresAt",
          ] as const
        ).some((field) => {
          return field === "recipientOrigins"
            ? JSON.stringify(active.lease.recipientOrigins) !== JSON.stringify(input.lease.recipientOrigins)
            : active.lease[field] !== input.lease[field];
        })
      )
        reject();
    } else if (
      !binding ||
      binding.runId !== scope.runId ||
      binding.run.taskId !== scope.taskId ||
      binding.run.taskRevision !== scope.taskRevision ||
      !!binding.run.privateTask !== !!run?.privateTask ||
      binding.version !== version ||
      binding.page.url !== page.url ||
      binding.page.documentEpoch !== page.documentEpoch
    )
      reject();
    const local = (retired: boolean) => {
      const currentRun = this.deps.run(scope.runId),
        currentPage = this.deps.page(scope.tabId);
      if (
        this.closed ||
        !currentRun ||
        currentRun.taskId !== scope.taskId ||
        currentRun.taskRevision !== scope.taskRevision ||
        !!currentRun.privateTask !== !!run?.privateTask ||
        !this.deps.ownsPage(scope.runId, scope.tabId) ||
        currentPage.url !== page.url ||
        currentPage.documentEpoch !== page.documentEpoch ||
        currentPage.controller !== page.controller ||
        currentPage.controllerEpoch !== page.controllerEpoch ||
        ["detached", "crashed"].includes(currentPage.viewStatus ?? "") ||
        currentPage.agentIsolation?.isolationId !== page.agentIsolation?.isolationId ||
        currentPage.agentIsolation?.mode !== page.agentIsolation?.mode
      )
        reject();
      const current = this.pages.get(scope.tabId);
      if (retired) {
        if (current || (this.authorityVersions.get(scope.tabId) ?? 0) !== version + 1) reject();
      } else if (
        (this.authorityVersions.get(scope.tabId) ?? 0) !== version ||
        (input.phase === "installed"
          ? current !== active || active?.released
          : this.bindingSources.get(scope.tabId) !== binding)
      )
        reject();
    };
    const check = async (retired: boolean) => {
      local(retired);
      if (!this.deps.native.egressContext)
        throw new AuxError("permission_denied", "Native input document verification is unavailable.");
      const native = EgressContextSchema.parse(
        await this.deps.native.egressContext({ tabId: scope.tabId, expectedUrl: page.url }),
      );
      local(retired);
      if (
        !native.personControlled ||
        native.controlGeneration !== scope.retiredControlGeneration ||
        native.profileId !== scope.profileId ||
        native.tabId !== scope.tabId ||
        native.frameId !== scope.frameId ||
        native.documentToken !== scope.documentToken ||
        native.sourceOrigin !== scope.sourceOrigin ||
        native.isolation?.isolationId !== scope.isolationId ||
        native.isolation.runId !== scope.runId ||
        native.isolation.taskId !== scope.taskId ||
        native.isolation.taskRevision !== scope.taskRevision ||
        native.isolation.mode !== (run?.privateTask ? "private" : "session")
      )
        reject();
    };
    return { validate: () => check(false), validateRetired: () => check(true) };
  }

  /** Permission prompts borrow only the exact already installed frame/document lease. */
  permissionAuthority(
    evidence: Pick<
      EgressLease,
      | "leaseId"
      | "isolationId"
      | "profileId"
      | "runId"
      | "taskId"
      | "taskRevision"
      | "tabId"
      | "frameId"
      | "documentToken"
      | "documentEpoch"
    >,
  ): () => void {
    const active = this.pages.get(evidence.tabId);
    const fields = [
      "leaseId",
      "isolationId",
      "profileId",
      "runId",
      "taskId",
      "taskRevision",
      "tabId",
      "frameId",
      "documentToken",
      "documentEpoch",
    ] as const;
    const check = () => {
      if (
        this.closed ||
        !active ||
        !active.installed ||
        !this.current(active) ||
        active.acknowledgedExpiresAt <= this.now() ||
        active.lease.expiresAt <= this.now() ||
        [...this.retirementDebt.values()].some((lease) => lease.tabId === evidence.tabId) ||
        fields.some((field) => active.lease[field] !== evidence[field])
      )
        throw new AuxError(
          "permission_denied",
          "This permission prompt has no current frame/document lease.",
        );
    };
    check();
    return check;
  }

  async request(input: unknown): Promise<{ requestId: string; decision: EgressDecision }> {
    const parsed = EgressRequestSchema.safeParse(input);
    if (!parsed.success) {
      if (process.env.AUX_EGRESS_DIAGNOSTIC === "1")
        console.error(
          `AUX_EGRESS_SCHEMA paths=${parsed.error.issues.map((issue) => issue.path.join(".")).join(",")}`,
        );
      throw new AuxError("invalid_params", "Native browser request evidence has an invalid shape.");
    }
    const request = parsed.data;
    const evidence = request.evidence;
    const result = (decision: EgressDecision) => ({ requestId: request.requestId, decision });
    const denied = (reason: EgressDecision["reason"]) => {
      const decision: EgressDecision = { status: "deny", reason, leaseId: evidence.leaseId };
      this.deps.audit(decision, {
        leaseId: evidence.leaseId,
        profileId: evidence.profileId,
        runId: evidence.runId,
        kind: evidence.kind,
        method: evidence.method,
        byteCount: evidence.byteCount,
      });
      return result(decision);
    };
    for (const [id, expiry] of this.seen) if (expiry <= this.now()) this.seen.delete(id);
    if (this.seen.has(request.requestId) || this.seen.size >= 4096) return denied("stale_lease");
    this.seen.set(request.requestId, this.now() + 150_000);
    const active = this.pages.get(evidence.tabId);
    if (!active || !this.current(active) || active.lease.leaseId !== evidence.leaseId)
      return denied("revoked_lease");
    const decision = this.guard.decide(evidence, "", false, request.projection);
    if (
      decision.status === "allow" ||
      !["recipient_denied", "page_content_overlap"].includes(decision.reason)
    )
      return result(decision);
    if (this.pending.has(active.runId)) return denied("approval_declined");
    const run = this.deps.run(active.runId);
    if (!run) return denied("revoked_lease");
    const controller = new AbortController();
    this.pending.set(active.runId, { active, controller });
    const timer = setTimeout(() => controller.abort(), 120_000);
    timer.unref();
    try {
      const digest = requestDigest(request);
      const approved = await this.deps.approve({
        runId: active.runId,
        threadId: run.threadId,
        taskId: run.taskId,
        digest,
        sourceOrigin: decision.sourceOrigin!,
        destinationOrigin: decision.destinationOrigin!,
        pageContent: decision.reason === "page_content_overlap",
        signal: controller.signal,
      });
      if (controller.signal.aborted) return denied("approval_expired");
      if (!approved) return denied("approval_declined");
      if (!this.current(active)) return denied("revoked_lease");
      // Recheck every bound field and protected fingerprint after user delay.
      return result(this.guard.decide({ ...evidence, observedAt: this.now() }, "", true, request.projection));
    } finally {
      clearTimeout(timer);
      if (this.pending.get(active.runId)?.controller === controller) this.pending.delete(active.runId);
    }
  }

  private retire(active: ActivePage): void {
    active.released = true;
    clearInterval(active.timer);
    if (this.pages.get(active.pageId) === active) this.pages.delete(active.pageId);
    const pending = this.pending.get(active.runId);
    if (pending?.active === active) pending.controller.abort();
    this.guard.revoke(active.lease.leaseId);
  }

  /** Retire runtime authority synchronously; await the exact native tombstones before replying. */
  invalidateAuthority(matches: (runId: string, origins: readonly string[]) => boolean): Promise<void> {
    const affected = new Set<string>();
    for (const active of this.pages.values()) {
      if (!matches(active.runId, [active.lease.sourceOrigin, ...active.lease.recipientOrigins])) continue;
      affected.add(active.pageId);
      this.owe(active);
    }
    for (const [pageId, source] of this.bindingSources)
      if (matches(source.runId, [source.origin])) {
        source.retirement?.abort();
        affected.add(pageId);
      }
    for (const pageId of affected)
      this.authorityVersions.set(pageId, (this.authorityVersions.get(pageId) ?? 0) + 1);
    // A prior failed acknowledgement remains a real debt after the active
    // page was retired. Subsequent mutations must retry that exact identity.
    return this.repay(
      [...this.retirementDebt.values()].filter((lease) =>
        matches(lease.runId, [lease.sourceOrigin, ...lease.recipientOrigins]),
      ),
    );
  }

  /** Destruction-only cleanup retires original effects and repays real native debt first. */
  async retireCreatorPage(runId: string, pageId: string): Promise<void> {
    const active = this.pages.get(pageId);
    if (active && active.runId !== runId)
      throw new AuxError("ref_stale", "A different run controls this temporary page.");
    const binding = this.bindingSources.get(pageId);
    if (binding && binding.runId !== runId)
      throw new AuxError("ref_stale", "A different original navigation owns this temporary page.");
    if (binding?.retirement) {
      binding.retirement.abort(new AuxError("cancelled", "The original creator is cleaning up this page."));
    }
    if (active) this.owe(active);
    await this.repay(
      [...this.retirementDebt.values()].filter((lease) => lease.runId === runId && lease.tabId === pageId),
    );
  }

  private owe(active: ActivePage): void {
    this.retirementDebt.set(active.lease.leaseId, active.lease);
    this.retire(active);
  }

  private blocked(runId: string): boolean {
    return [...this.mutationBarriers].some((matches) => matches(runId));
  }

  private async repay(leases: readonly EgressLease[]): Promise<void> {
    await Promise.all(
      leases.map(async (lease) => {
        if (!this.deps.native.egressRevoke)
          throw new AuxError("permission_denied", "Native browser authority retirement is unavailable.");
        const reply = await this.deps.native.egressRevoke({ lease });
        if (reply.accepted !== true)
          throw new AuxError(
            "permission_denied",
            "Native browser authority retirement was not acknowledged.",
          );
        if (this.retirementDebt.get(lease.leaseId) === lease) this.retirementDebt.delete(lease.leaseId);
      }),
    );
  }

  /** Called inside the existing controller's serialized lifecycle boundary. */
  async withAuthorityMutation<T>(
    matches: (runId: string) => boolean,
    mutation: () => Promise<T>,
  ): Promise<T> {
    // Each nested caller owns its own barrier, even when its predicate matches.
    const barrier = (runId: string) => matches(runId);
    this.mutationBarriers.add(barrier);
    try {
      await this.invalidateAuthority((runId) => matches(runId));
      return await mutation();
    } finally {
      this.mutationBarriers.delete(barrier);
    }
  }

  revokePage(pageId: string, runId?: string): void {
    const binding = this.bindingSources.get(pageId);
    if (binding?.retirement && (!runId || binding.runId === runId)) {
      binding.retirement.abort();
      this.authorityVersions.set(pageId, (this.authorityVersions.get(pageId) ?? 0) + 1);
    }
    const active = this.pages.get(pageId);
    if (!active || (runId && active.runId !== runId)) return;
    this.owe(active);
    // Failure retains the original identity for the next acknowledged mutation.
    void this.repay([active.lease]).catch(() => {});
  }

  /** Pausing drops network authority but the run still remembers protected context. */
  suspendRun(runId: string): void {
    // During the genuine old-lease handoff there may be no ActivePage row.
    // The original continuation remains independently revocable in that gap.
    for (const [pageId, source] of this.bindingSources)
      if (source.runId === runId) {
        source.retirement?.abort();
        this.authorityVersions.set(pageId, (this.authorityVersions.get(pageId) ?? 0) + 1);
      }
    for (const page of this.pages.values()) if (page.runId === runId) this.revokePage(page.pageId, runId);
    this.pending.get(runId)?.controller.abort();
  }

  revokeRun(runId: string): void {
    this.suspendRun(runId);
    this.guard.revokeRun(runId);
  }

  close(): void {
    this.closed = true;
    for (const source of this.bindingSources.values()) source.retirement?.abort();
    for (const runId of new Set([...this.pages.values()].map((page) => page.runId))) this.revokeRun(runId);
    this.seen.clear();
  }
}

function requestDigest(request: EgressRequest): string {
  return createHash("sha256")
    .update(JSON.stringify([request.requestId, request.evidence, request.projection]))
    .digest("hex");
}

function sameCdpLease(original: EgressLease, current: EgressLease): boolean {
  // Schema parsing supplies a stable field order and rejects unknown authority.
  const { expiresAt: originalExpiry, ...left } = EgressLeaseSchema.parse(original);
  const { expiresAt: currentExpiry, ...right } = EgressLeaseSchema.parse(current);
  return originalExpiry > 0 && currentExpiry > 0 && JSON.stringify(left) === JSON.stringify(right);
}
