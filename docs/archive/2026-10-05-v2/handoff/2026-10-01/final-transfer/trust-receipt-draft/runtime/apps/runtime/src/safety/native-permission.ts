import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { AuxError, EgressLeaseSchema, EffectRequestSchema, type PageTarget, type Run } from "@aux/contracts";
import type { ApprovalStore } from "./approval.js";
import type { BrowserEgress } from "./browser-egress.js";
import type { SafetyDispatchGate } from "./dispatch.js";
import type { TurnMentionService } from "../services/turn-mention-service.js";

/** Actual PermissionKeyForRequestType keys. Install, identity and system-auth requests stay in native control. */
export const NATIVE_PERMISSION_TYPES = [
  "notifications",
  "clipboard",
  "idle_detection",
  "local_fonts",
  "multiple_downloads",
  "keyboard_lock",
  "pointer_lock",
] as const;
const exactOrigin = z
  .string()
  .url()
  .max(2048)
  .refine((value) => {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && url.origin === value;
  });
export const NativePermissionRequestSchema = EgressLeaseSchema.pick({
  leaseId: true,
  isolationId: true,
  profileId: true,
  runId: true,
  taskId: true,
  taskRevision: true,
  tabId: true,
  frameId: true,
  documentToken: true,
  documentEpoch: true,
})
  .extend({
    batchId: z.string().min(1).max(160),
    requestingOrigin: exactOrigin,
    embeddingOrigin: exactOrigin,
    permissionTypes: z
      .array(z.enum(NATIVE_PERMISSION_TYPES))
      .min(1)
      .max(8)
      .refine((types) => new Set(types).size === types.length),
    requestedAt: z.number().int().nonnegative(),
  })
  .strict();
export type NativePermissionRequest = z.infer<typeof NativePermissionRequestSchema>;
export type NativePermissionResult = {
  batchId: string;
  decision: "allow" | "deny" | "pending";
  approvalId?: string;
  reservationId?: string;
};
interface Batch {
  request: NativePermissionRequest;
  digest: string;
  runId: string;
  sessionId: string;
  expiresAt: number;
  status: "pending" | "authorized" | "used" | "denied";
  reservation?: { id: string; nonce: number; fence: () => void };
  approvalId?: string;
  turn?: symbol;
}

/** Only main's authenticated internal channel invokes this controller. No renderer/model RPC route exists. */
export class NativePermissionController {
  private batches = new Map<string, Batch>();
  private authorityMutations = new Set<(runId: string) => boolean>();
  constructor(
    private deps: {
      profileId: string;
      gate: SafetyDispatchGate;
      approvals: ApprovalStore;
      egress: BrowserEgress;
      mentions: TurnMentionService;
      run(id: string): Run | undefined;
      page(id: string): PageTarget;
      sourceCheck(runId: string, pageId: string): () => void;
      standingOnly(runId: string): boolean;
      assertDispatch(runId: string): Promise<void>;
      overnightAuthority(runId: string): { windowEnd: number; requireAC: boolean } | null;
      retireReservation(input: { tabId: string; batchId: string; reservationId: string }): Promise<{ accepted: true }>;
      requiresTurn(run: Run, pageId: string): boolean;
      now?: () => number;
    },
  ) {}
  private now() {
    return this.deps.now?.() ?? Date.now();
  }
  invalidateAuthority(matches: (runId: string, origins: readonly string[]) => boolean): void {
    for (const [batchId, batch] of this.batches)
      if (matches(batch.runId, [batch.request.requestingOrigin, batch.request.embeddingOrigin])) this.invalidate(batchId);
  }
  invalidate(batchId: string): void {
    const batch = this.batches.get(batchId);
    if (!batch) return;
    batch.status = "denied";
    if (batch.approvalId) {
      try {
        this.deps.approvals.decideLocal({ decision: "cancel", approvalId: batch.approvalId }, batch.runId);
      } catch {
        /* Expired or already consumed approval cannot grant this retired batch. */
      }
    }
  }
  async request(raw: unknown): Promise<NativePermissionResult> {
    const input = NativePermissionRequestSchema.parse(raw),
      deny = (): NativePermissionResult => {
        this.invalidate(input.batchId);
        return { batchId: input.batchId, decision: "deny" };
      };
    const at = this.now();
    for (const [id, batch] of this.batches)
      if (batch.expiresAt <= at) {
        this.invalidate(id);
        this.batches.delete(id);
      }
    if (
      input.profileId !== this.deps.profileId ||
      input.requestedAt > at ||
      at - input.requestedAt >= 120_000
    )
      return deny();
    if ([...this.authorityMutations].some(matches => matches(input.runId))) return deny();
    const digest = createHash("sha256").update(JSON.stringify(input)).digest("hex");
    let batch = this.batches.get(input.batchId);
    if (batch && (batch.digest !== digest || batch.status !== "pending")) {
      this.invalidate(input.batchId);
      return deny();
    }
    if (!batch && this.batches.size >= 256) return deny();
    try {
      const run = this.deps.run(input.runId),
        page = this.deps.page(input.tabId);
      if (
        !run ||
        !["running", "planning", "needs_input"].includes(run.status) ||
        !page.sessionId ||
        run.config?.taskId !== input.taskId ||
        (run.config?.taskRevision ?? 0) !== input.taskRevision ||
        page.documentEpoch !== input.documentEpoch ||
        new URL(page.url).origin !== input.embeddingOrigin ||
        input.requestingOrigin !== input.embeddingOrigin
      )
        return deny();
      const leaseCheck = this.deps.egress.permissionAuthority(input),
        sourceCheck = this.deps.sourceCheck(input.runId, input.tabId);
      const restricted = this.deps.requiresTurn(run, input.tabId);
      const turn = restricted ? this.deps.mentions.capture(input.runId) : undefined;
      if (batch && (batch.sessionId !== page.sessionId || batch.turn !== turn)) {
        this.invalidate(input.batchId);
        return deny();
      }
      if (!batch) {
        batch = {
          request: input,
          digest,
          runId: input.runId,
          sessionId: page.sessionId,
          expiresAt: input.requestedAt + 120_000,
          status: "pending",
          turn,
        };
        this.batches.set(input.batchId, batch);
      }
      const current = batch;
      const overnightItem = run.config?.nightShiftItemId;
      const fence = () => {
        leaseCheck();
        sourceCheck();
        const nowPage = this.deps.page(input.tabId);
        const nowRun = this.deps.run(input.runId);
        if (
          [...this.authorityMutations].some(matches => matches(input.runId)) ||
          this.batches.get(input.batchId) !== current ||
          !["pending", "authorized"].includes(current.status) ||
          current.expiresAt <= this.now() ||
          nowPage.sessionId !== current.sessionId ||
          nowRun?.config?.messageRevision !== run.config?.messageRevision ||
          nowRun?.config?.nightShiftItemId !== overnightItem ||
          !nowRun ||
          !["running", "planning", "needs_input"].includes(nowRun.status) ||
          (turn && this.deps.mentions.capture(input.runId) !== turn)
        )
          throw new AuxError("permission_denied", "This permission batch or person turn was replaced.");
      };
      const dispatch = async () => {
        fence();
        await this.deps.gate.checkTrustedEffect(
          EffectRequestSchema.parse({
            profileId: input.profileId,
            scope: input.taskId
              ? { kind: "task", id: input.taskId }
              : { kind: "workspace", id: run.config?.contextWorkspaceId ?? "default" },
            actor: run.config?.implementation === "external-agent" ? "external_token" : "builtin_agent",
            effect: "write",
            category: "permission",
            action: "browser.permission.accept",
            origin: input.requestingOrigin,
            dataClasses: [],
            provenance: "page",
            invocationDigest: digest,
            turnId: input.runId,
            threadId: run.config?.chatId ?? input.runId,
            runId: input.runId,
            requestedAt: input.requestedAt,
          }),
          {
            profileId: input.profileId,
            scope: input.taskId
              ? { kind: "task", id: input.taskId }
              : { kind: "workspace", id: run.config?.contextWorkspaceId ?? "default" },
            runId: input.runId,
            turnId: input.runId,
            threadId: run.config?.chatId ?? input.runId,
            pageId: input.tabId,
            sessionId: page.sessionId,
            approvalId: current.approvalId,
            standingOnly: this.deps.standingOnly(input.runId),
          },
        );
        await this.deps.assertDispatch(input.runId);
        fence();
      };
      try {
        if (restricted)
          await this.deps.mentions.useSourcePage(input.runId, input.tabId, "act", sourceCheck, dispatch);
        else await dispatch();
      } catch (error) {
        const pending =
          error instanceof AuxError && error.code === "needs_input"
            ? z.object({ requestId: z.string().min(1) }).safeParse(error.detail)
            : undefined;
        if (pending?.success) {
          fence();
          current.approvalId = pending.data.requestId;
          return { batchId: input.batchId, decision: "pending", approvalId: current.approvalId };
        }
        throw error;
      }
      current.status = "authorized";
      current.reservation = { id: randomUUID(), nonce: 0, fence };
      return { batchId: input.batchId, decision: "allow", reservationId: current.reservation.id };
    } catch (error) {
      this.invalidate(input.batchId);
      if (error instanceof AuxError) return deny();
      throw error;
    }
  }

  /** Retire exact queued receipts before a real settings, lifecycle or ledger mutation. */
  async withAuthorityMutation<T>(matches: (runId: string) => boolean, mutation: () => Promise<T>): Promise<T> {
    this.authorityMutations.add(matches);
    try {
      const retiring = [...this.batches].filter(([, batch]) => matches(batch.runId));
      const receipts = retiring.flatMap(([batchId, batch]) => batch.status === "authorized" && batch.reservation
        ? [{ tabId: batch.request.tabId, batchId, reservationId: batch.reservation.id }] : []);
      // Runtime authority retires synchronously before crossing the native channel.
      for (const [batchId, batch] of retiring) if (batch.status === "authorized") this.invalidate(batchId);
      for (const receipt of receipts) {
        const result = await this.deps.retireReservation(receipt);
        if (result.accepted !== true) throw new AuxError("permission_denied", "Native permission retirement was not acknowledged.");
      }
      return await mutation();
    } finally { this.authorityMutations.delete(matches); }
  }

  /** Authenticated native-only fresh effect check; never consumes consent again. */
  async revalidate(raw: unknown): Promise<{ batchId: string; reservationId: string; nonce: number; decision: "allow" | "deny"; overnight?: { windowEnd: number; requireAC: boolean } }> {
    const input = z.object({ batchId: z.string().min(1).max(160), reservationId: z.string().uuid(), nonce: z.number().int().positive() }).strict().parse(raw);
    const denied = () => ({ ...input, decision: "deny" as const });
    const batch = this.batches.get(input.batchId);
    if (!batch || batch.status !== "authorized" || batch.reservation?.id !== input.reservationId || input.nonce !== batch.reservation.nonce + 1) return denied();
    const reservation = batch.reservation;
    // Reserve nonce synchronously; overlapping replies cannot redeem one attempt twice.
    reservation.nonce = input.nonce;
    try {
      reservation.fence();
      await this.deps.assertDispatch(batch.runId);
      reservation.fence();
      if (batch.reservation !== reservation || reservation.nonce !== input.nonce) return denied();
      const overnight = this.deps.overnightAuthority(batch.runId);
      if (this.deps.standingOnly(batch.runId) && !overnight)
        throw new AuxError("permission_denied", "Overnight native effects require their exact claimed window.");
      return { ...input, decision: "allow", ...(overnight ? { overnight } : {}) };
    } catch (error) {
      this.invalidate(input.batchId);
      if (error instanceof AuxError) return denied();
      throw error;
    }
  }

  /** Native finalization retires this exact reservation; no other batch is touched. */
  finalize(raw: unknown): { retired: boolean } {
    const input = z.object({ batchId: z.string().min(1).max(160), reservationId: z.string().uuid() }).strict().parse(raw);
    const batch = this.batches.get(input.batchId);
    if (!batch || batch.status !== "authorized" || batch.reservation?.id !== input.reservationId) return { retired: false };
    batch.status = "used";
    batch.reservation = undefined;
    return { retired: true };
  }

}
