import { createHash } from "node:crypto";
import {
  AuxError, EgressContextSchema, EgressRequestSchema,
  type EgressDecision, type EgressLease, type EgressRequest,
} from "@aux/contracts";
import type { NativeBridge } from "../native.js";
import { AgentEgressGuard, type EgressAuditEvidence, type ProtectedClass } from "./egress.js";

interface RunIdentity {
  taskId?: string; taskRevision: number; threadId: string;
}
interface PageIdentity { url: string; documentEpoch: number; controller?: string; viewStatus?: string }
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

  /** Called after the durable page claim and before observation or dispatch. */
  async acquire(runId: string, pageId: string, initialDestination?: string): Promise<() => void> {
    await this.ensure(runId, pageId, initialDestination);
    return () => this.revokePage(pageId, runId);
  }

  /** A changed document needs a new native identity before the next action. */
  async ensure(runId: string, pageId: string, initialDestination?: string): Promise<void> {
    const pending = this.preparing.get(pageId);
    if (pending) {
      await pending.catch(() => {});
      const current = this.pages.get(pageId);
      if (current?.runId === runId && this.current(current)) return;
      // A navigation can commit while context/install is in flight. Re-read
      // native identity for that document instead of stranding its subresources.
      if (this.preparing.get(pageId) === pending) this.preparing.delete(pageId);
      return this.ensure(runId, pageId, initialDestination);
    }
    const work = this.bind(runId, pageId, initialDestination);
    this.preparing.set(pageId, work);
    try { await work; }
    finally { if (this.preparing.get(pageId) === work) this.preparing.delete(pageId); }
  }

  private async bind(runId: string, pageId: string, initialDestination?: string): Promise<void> {
    const run = this.deps.run(runId);
    const page = this.deps.page(pageId);
    if (this.closed || !run || !this.deps.ownsPage(runId, pageId) || page.controller === "human"
      || page.viewStatus === "detached" || page.viewStatus === "crashed")
      throw new AuxError("permission_denied", "Browser transmission requires a current run-owned page.");
    const existing = this.pages.get(pageId);
    if (existing && this.current(existing) && existing.lease.expiresAt > this.now()) return;
    this.revokePage(pageId);
    const { egressContext, egressInstall } = this.deps.native;
    if (!egressContext || !egressInstall)
      throw new AuxError("capability_unsupported", "This browser cannot enforce agent transmission authority.");
    const native = EgressContextSchema.parse(await egressContext.call(this.deps.native, {
      tabId: pageId, expectedUrl: page.url,
    }));
    const after = this.deps.page(pageId);
    if (!this.deps.ownsPage(runId, pageId) || !this.deps.run(runId)
      || after.url !== page.url || after.documentEpoch !== page.documentEpoch || after.controller === "human"
      || native.profileId !== this.deps.profileId || native.tabId !== pageId
      || native.sourceOrigin !== (page.url === "about:blank" ? "aux://blank" : new URL(page.url).origin))
      throw new AuxError("ref_stale", "The page changed while preparing protected browser requests.");
    const lease = this.guard.issue({
      ...native, runId, taskId: run.taskId, taskRevision: run.taskRevision,
      documentEpoch: page.documentEpoch, recipientOrigins: [],
      ...(initialDestination ? { initialDestination } : {}),
    });
    const active: ActivePage = { runId, pageId, url: page.url, epoch: page.documentEpoch, lease, released: false };
    this.pages.set(pageId, active);
    try {
      const installed = await egressInstall.call(this.deps.native, { lease, expectedUrl: page.url });
      if (installed?.accepted !== true) throw new AuxError("permission_denied", "Native browser request protection was not accepted.");
      if (!this.current(active)) throw new AuxError("ref_stale", "The page changed while installing request protection.");
      active.timer = setInterval(() => { void this.renew(active); }, 10_000);
      active.timer.unref();
    } catch (error) {
      this.revokePage(pageId, runId);
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
      if (!this.current(active)) this.revokePage(active.pageId, active.runId);
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

  revokePage(pageId: string, runId?: string): void {
    const active = this.pages.get(pageId);
    if (!active || runId && active.runId !== runId) return;
    active.released = true;
    clearInterval(active.timer);
    this.pages.delete(pageId);
    this.pending.get(active.runId)?.abort();
    this.guard.revoke(active.lease.leaseId);
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
