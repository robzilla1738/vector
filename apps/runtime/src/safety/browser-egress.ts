import { browserContextPage } from "../services/browser-context-page.js";
import { createHash } from "node:crypto";
import {
  AuxError, EgressContextSchema, EgressRequestSchema,
  type EgressDecision, type EgressLease, type EgressRequest, type AgentPageCreate, type AgentPageIsolation,
} from "@aux/contracts";
import type { NativeBridge } from "../native.js";
import { AgentEgressGuard, type EgressAuditEvidence, type ProtectedClass } from "./egress.js";

interface RunIdentity {
  taskId?: string; taskRevision: number; threadId: string;
}
interface PageIdentity { agentIsolation?: AgentPageIsolation; url: string; documentEpoch: number; controller?: string; viewStatus?: string }
interface ActivePage {
  runId: string; pageId: string; url: string; epoch: number; lease: EgressLease;
  timer?: ReturnType<typeof setInterval>; released: boolean;
}

export interface BrowserEgressDeps {
  profileId: string;
  native: NativeBridge;
  run(runId: string): RunIdentity | null;
  page(pageId: string): PageIdentity;
  ownsPage(runId: string, pageId: string): boolean;
  audit(decision: EgressDecision, evidence: EgressAuditEvidence): void;
  /** Must approve the exact ephemeral request digest, never a standing grant. */
  approve(input: {
    runId: string; threadId: string; taskId?: string; digest: string;
    sourceOrigin: string; destinationOrigin: string; pageContent: boolean;
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
  private readonly bindingSources = new Map<string, { runId: string; origin: string }>();
  private readonly pending = new Map<string, AbortController>();
  private readonly seen = new Map<string, number>();
  private readonly now: () => number;
  private closed = false;

  constructor(private readonly deps: BrowserEgressDeps) {
    this.now = deps.now ?? Date.now;
    this.guard = new AgentEgressGuard({
      now: this.now,
      currentTaskRevision: runId => deps.run(runId)?.taskRevision ?? null,
      audit: deps.audit,
    });
  }

  /** Private creation authority; source transfers its URL only, never page state. */
  async creationScope(runId: string, sourcePageId?: string): Promise<Omit<AgentPageCreate, "windowId" | "background">> {
    const run = this.deps.run(runId);
    if (this.closed || !run || !this.deps.native.createAgentPage)
      throw new AuxError("capability_unsupported", "This browser cannot open a protected temporary tab. Update Aux before continuing.");
    const identity = { profileId: this.deps.profileId, runId, taskId: run.taskId, taskRevision: run.taskRevision };
    if (!sourcePageId) return identity;
    const sourcePage = () => browserContextPage(() => this.deps.page(sourcePageId));
    const page = { ...sourcePage() };
    const url = new URL(page.url);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password)
      throw new AuxError("permission_denied", "Choose a website to open in a separate signed-out tab.");
    if (!this.deps.native.egressContext)
      throw new AuxError("capability_unsupported", "The source document cannot be verified.");
    const context = EgressContextSchema.parse(await this.deps.native.egressContext({ tabId: sourcePageId, expectedUrl: page.url }));
    const after = sourcePage(), currentRun = this.deps.run(runId);
    if (context.profileId !== identity.profileId || context.tabId !== sourcePageId || context.sourceOrigin !== url.origin
      || !currentRun || currentRun.taskId !== run.taskId || currentRun.taskRevision !== run.taskRevision
      || after.url !== page.url || after.documentEpoch !== page.documentEpoch
      || ["detached", "crashed"].includes(after.viewStatus ?? ""))
      throw new AuxError("ref_stale", "The selected source tab changed. Review it before continuing.");
    return { ...identity, source: { tabId: sourcePageId, expectedUrl: page.url, documentToken: context.documentToken } };
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
    const source = this.deps.page(pageId).url;
    this.bindingSources.set(pageId, { runId, origin: source === "about:blank" ? "aux://blank" : new URL(source).origin });
    const work = this.bind(runId, pageId, initialDestination, authorityVersion);
    this.preparing.set(pageId, work);
    try { await work; }
    finally { if (this.preparing.get(pageId) === work) { this.preparing.delete(pageId); this.bindingSources.delete(pageId); } }
  }

  private async bind(runId: string, pageId: string, initialDestination: string | undefined, authorityVersion: number): Promise<void> {
    const run = this.deps.run(runId);
    const page = { ...this.deps.page(pageId) };
    if (this.closed || !run || !this.deps.ownsPage(runId, pageId) || page.controller === "human"
      || page.viewStatus === "detached" || page.viewStatus === "crashed")
      throw new AuxError("permission_denied", "Browser transmission requires a current run-owned page.");
    const existing = this.pages.get(pageId);
    if (existing && this.current(existing) && existing.lease.expiresAt > this.now()) return;
    this.revokePage(pageId);
    const { egressContext, egressInstall, egressRevoke } = this.deps.native;
    if (!egressContext || !egressInstall || !egressRevoke)
      throw new AuxError("capability_unsupported", "This browser cannot enforce agent transmission authority.");
    const native = EgressContextSchema.parse(await egressContext.call(this.deps.native, {
      tabId: pageId, expectedUrl: page.url,
    }));
    if ((this.authorityVersions.get(pageId) ?? 0) !== authorityVersion)
      throw new AuxError("permission_denied", "Browser authority changed while reading its native document.");
    const isolation = native.isolation;
    if (!isolation || isolation.runId !== runId || isolation.taskId !== run.taskId || isolation.taskRevision !== run.taskRevision
      || page.agentIsolation?.isolationId && page.agentIsolation.isolationId !== isolation.isolationId)
      throw new AuxError("permission_denied", "This is not this run’s protected temporary tab. Open a fresh tab for the task; sign in there separately. Existing cookies cannot be copied.");
    const after = this.deps.page(pageId), currentRun = this.deps.run(runId);
    if (!this.deps.ownsPage(runId, pageId) || !currentRun
      || currentRun.taskId !== run.taskId || currentRun.taskRevision !== run.taskRevision
      || after.url !== page.url || after.documentEpoch !== page.documentEpoch || after.controller === "human"
      || native.profileId !== this.deps.profileId || native.tabId !== pageId
      || native.sourceOrigin !== (page.url === "about:blank" ? "aux://blank" : new URL(page.url).origin))
      throw new AuxError("ref_stale", "The page changed while preparing protected browser requests.");
    const lease = this.guard.issue({
      profileId: native.profileId, tabId: native.tabId, frameId: native.frameId,
      documentToken: native.documentToken, sourceOrigin: native.sourceOrigin, isolationId: isolation.isolationId,
      runId, taskId: run.taskId, taskRevision: run.taskRevision,
      documentEpoch: page.documentEpoch, recipientOrigins: [],
      ...(initialDestination ? { initialDestination } : {}),
    });
    const active: ActivePage = { runId, pageId, url: page.url, epoch: page.documentEpoch, lease, released: false };
    this.pages.set(pageId, active);
    try {
      const installed = await egressInstall.call(this.deps.native, { lease, expectedUrl: page.url });
      if (installed?.accepted !== true) throw new AuxError("permission_denied", "Native browser request protection was not accepted.");
      if ((this.authorityVersions.get(pageId) ?? 0) !== authorityVersion || !this.current(active)) throw new AuxError("ref_stale", "The page changed while installing request protection.");
      active.timer = setInterval(() => { void this.renew(active); }, 10_000);
      active.timer.unref();
    } catch (error) {
      if (this.pages.get(pageId) === active) this.retire(active);
      // Installation may have acknowledged after its authority was retired.
      await this.deps.native.egressRevoke?.({ leaseId: lease.leaseId });
      throw error;
    }
  }

  private current(active: ActivePage): boolean {
    if (active.released || this.pages.get(active.pageId) !== active
      || !this.deps.ownsPage(active.runId, active.pageId)) return false;
    const run = this.deps.run(active.runId);
    let page: PageIdentity;
    try { page = this.deps.page(active.pageId); } catch { return false; }
    return page.controller !== "human" && page.viewStatus !== "detached" && page.viewStatus !== "crashed"
      && !!run && run.taskId === active.lease.taskId && run.taskRevision === active.lease.taskRevision
      && page.url === active.url && page.documentEpoch === active.epoch;
  }

  private async renew(active: ActivePage): Promise<void> {
    if (!this.current(active)) { this.revokePage(active.pageId, active.runId); return; }
    try {
      active.lease = this.guard.renew(active.lease.leaseId);
      const renewed = await this.deps.native.egressInstall!({ lease: active.lease, expectedUrl: active.url });
      if (renewed?.accepted !== true) throw new AuxError("permission_denied", "Native browser request protection renewal was not accepted.");
      if (!this.current(active)) await this.deps.native.egressRevoke!({ leaseId: active.lease.leaseId });
    } catch { this.revokePage(active.pageId, active.runId); }
  }

  protect(runId: string, value: string, dataClass: ProtectedClass): void {
    if (!this.deps.run(runId)) throw new AuxError("permission_denied", "Protected context requires a current run.");
    if (dataClass === "memory") {
      try { this.guard.protectRunMemory(runId, value); }
      catch (error) { this.revokeRun(runId); throw error; }
      return;
    }
    const active = [...this.pages.values()].filter(page => page.runId === runId && this.current(page));
    if (!active.length) throw new AuxError("permission_denied", "Protected context requires an active browser lease.");
    try {
      for (const page of active) {
        this.guard.taint(page.lease.leaseId, value, dataClass);
      }
    } catch (error) { this.revokeRun(runId); throw error; }
  }

  notePageText(runId: string, pageId: string, text: string, observedUrl = this.deps.page(pageId).url): void {
    if (!this.deps.run(runId) || !this.deps.ownsPage(runId, pageId))
      throw new AuxError("permission_denied", "Page evidence requires its current browser lease.");
    if (!text) return;
    try { this.guard.noteRunPageText(runId, new URL(observedUrl).origin, text); }
    catch (error) { this.revokeRun(runId); throw error; }
  }

  /** Permission prompts borrow only the exact already installed frame/document lease. */
  permissionAuthority(evidence: Pick<EgressLease, "leaseId" | "isolationId" | "profileId" | "runId" | "taskId" | "taskRevision" | "tabId" | "frameId" | "documentToken" | "documentEpoch">): () => void {
    const active = this.pages.get(evidence.tabId);
    const fields = ["leaseId", "isolationId", "profileId", "runId", "taskId", "taskRevision", "tabId", "frameId", "documentToken", "documentEpoch"] as const;
    const check = () => {
      if (!active || !this.current(active) || active.lease.expiresAt <= this.now() ||
        fields.some(field => active.lease[field] !== evidence[field]))
        throw new AuxError("permission_denied", "This permission prompt has no current frame/document lease.");
    };
    check();
    return check;
  }

  async request(input: unknown): Promise<{ requestId: string; decision: EgressDecision }> {
    const parsed = EgressRequestSchema.safeParse(input);
    if (!parsed.success) {
      if (process.env.AUX_EGRESS_DIAGNOSTIC === "1")
        console.error(`AUX_EGRESS_SCHEMA paths=${parsed.error.issues.map(issue => issue.path.join(".")).join(",")}`);
      throw new AuxError("invalid_params", "Native browser request evidence has an invalid shape.");
    }
    const request = parsed.data;
    const evidence = request.evidence;
    const result = (decision: EgressDecision) => ({ requestId: request.requestId, decision });
    const denied = (reason: EgressDecision["reason"]) => {
      const decision: EgressDecision = { status: "deny", reason, leaseId: evidence.leaseId };
      this.deps.audit(decision, { leaseId: evidence.leaseId, profileId: evidence.profileId,
        runId: evidence.runId, kind: evidence.kind, method: evidence.method, byteCount: evidence.byteCount });
      return result(decision);
    };
    for (const [id, expiry] of this.seen) if (expiry <= this.now()) this.seen.delete(id);
    if (this.seen.has(request.requestId) || this.seen.size >= 4096) return denied("stale_lease");
    this.seen.set(request.requestId, this.now() + 150_000);
    const active = this.pages.get(evidence.tabId);
    if (!active || !this.current(active) || active.lease.leaseId !== evidence.leaseId) return denied("revoked_lease");
    const decision = this.guard.decide(evidence, "", false, request.projection);
    if (decision.status === "allow" || !["recipient_denied", "page_content_overlap"].includes(decision.reason)) return result(decision);
    if (this.pending.has(active.runId)) return denied("approval_declined");
    const run = this.deps.run(active.runId);
    if (!run) return denied("revoked_lease");
    const controller = new AbortController();
    this.pending.set(active.runId, controller);
    const timer = setTimeout(() => controller.abort(), 120_000);
    timer.unref();
    try {
      const digest = requestDigest(request);
      const approved = await this.deps.approve({
        runId: active.runId, threadId: run.threadId, taskId: run.taskId, digest,
        sourceOrigin: decision.sourceOrigin!, destinationOrigin: decision.destinationOrigin!,
        pageContent: decision.reason === "page_content_overlap", signal: controller.signal,
      });
      if (controller.signal.aborted) return denied("approval_expired");
      if (!approved) return denied("approval_declined");
      if (!this.current(active)) return denied("revoked_lease");
      // Recheck every bound field and protected fingerprint after user delay.
      return result(this.guard.decide({ ...evidence, observedAt: this.now() }, "", true, request.projection));
    } finally {
      clearTimeout(timer);
      if (this.pending.get(active.runId) === controller) this.pending.delete(active.runId);
    }
  }

  private retire(active: ActivePage): void {
    active.released = true;
    clearInterval(active.timer);
    if (this.pages.get(active.pageId) === active) this.pages.delete(active.pageId);
    this.pending.get(active.runId)?.abort();
    this.guard.revoke(active.lease.leaseId);
  }

  /** Retire runtime authority synchronously; await the exact native tombstones before replying. */
  invalidateAuthority(matches: (runId: string, origins: readonly string[]) => boolean): Promise<void> {
    const leases: EgressLease[] = [];
    const affected = new Set<string>();
    for (const active of this.pages.values()) {
      if (!matches(active.runId, [active.lease.sourceOrigin, ...active.lease.recipientOrigins])) continue;
      affected.add(active.pageId);
      leases.push(active.lease);
      this.retire(active);
    }
    for (const [pageId, source] of this.bindingSources)
      if (matches(source.runId, [source.origin])) affected.add(pageId);
    for (const pageId of affected)
      this.authorityVersions.set(pageId, (this.authorityVersions.get(pageId) ?? 0) + 1);
    return Promise.all(leases.map(lease => this.deps.native.egressRevoke!({ leaseId: lease.leaseId }))).then(() => {});
  }

  revokePage(pageId: string, runId?: string): void {
    const active = this.pages.get(pageId);
    if (!active || runId && active.runId !== runId) return;
    this.retire(active);
    // Native retains a denied document tombstone; it must not revert to bypass.
    void this.deps.native.egressRevoke?.({ leaseId: active.lease.leaseId }).catch(() => {});
  }

  /** Pausing drops network authority but the run still remembers protected context. */
  suspendRun(runId: string): void {
    for (const page of this.pages.values()) if (page.runId === runId) this.revokePage(page.pageId, runId);
    this.pending.get(runId)?.abort();
  }

  revokeRun(runId: string): void {
    this.suspendRun(runId);
    this.guard.revokeRun(runId);
  }

  close(): void {
    this.closed = true;
    for (const runId of new Set([...this.pages.values()].map(page => page.runId))) this.revokeRun(runId);
    this.seen.clear();
  }
}

function requestDigest(request: EgressRequest): string {
  return createHash("sha256").update(JSON.stringify([
    request.requestId, request.evidence, request.projection,
  ])).digest("hex");
}
