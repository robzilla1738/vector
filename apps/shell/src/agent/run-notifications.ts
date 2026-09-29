import type { Run, Suspension } from "@aux/contracts";

export type OwnerNoticeKind = "completed" | "question" | "handoff";
export type OwnerNotice = { kind: OwnerNoticeKind; runId: string; title: string; body: string; tag: string };
export type NoticePreference = "off" | "background" | "all";
export type NoticeContext = {
  preference: NoticePreference;
  focusMode: boolean;
  windowFocused: boolean;
  foregroundRunId?: string | null;
};
export type DurableRunState = { run: Run; suspension?: Suspension | null };

const COPY: Record<OwnerNoticeKind, Pick<OwnerNotice, "title" | "body">> = {
  completed: { title: "Aux finished a task", body: "Open Aux to review the result." },
  question: { title: "Aux needs your answer", body: "Open Aux to review a question." },
  handoff: { title: "Your turn in Aux", body: "Open Aux to finish a browser step." },
};
const THROTTLE_MS = 5_000;

/** Delivery policy for a host-owned notification adapter. No page, task, or secret text crosses this boundary. */
export class RunNotificationGate {
  private readonly delivered = new Set<string>();
  private readonly pending = new Set<string>();
  private readonly pendingKinds = new Set<OwnerNoticeKind>();
  private readonly lastByKind = new Map<OwnerNoticeKind, number>();

  constructor(private readonly deps: {
    getRun(runId: string): Promise<DurableRunState>;
    emit(notice: OwnerNotice): Promise<void> | void;
    now?: () => number;
  }) {}

  async consider(previous: Run | undefined, candidate: Run, getContext: () => NoticeContext): Promise<OwnerNotice | null> {
    if (!previous || previous.runId !== candidate.runId || this.suppressed(candidate.runId, getContext())) return null;
    if (candidate.status !== "completed" && candidate.status !== "needs_input") return null;
    if (candidate.status === "completed" && previous.status === "completed") return null;
    if (candidate.status === "needs_input" && previous.status === "needs_input") return null;
    const current = await this.deps.getRun(candidate.runId);
    if (current.run.runId !== candidate.runId || current.run.status !== candidate.status) return null;
    if (this.suppressed(candidate.runId, getContext())) return null;
    let kind: OwnerNoticeKind;
    let identity: string;
    if (current.run.status === "completed") {
      kind = "completed";
      identity = current.run.runId;
    } else {
      const suspension = current.suspension;
      if (!suspension || suspension.runId !== candidate.runId || suspension.turnId !== candidate.runId
        || suspension.state !== "pending") return null;
      if (suspension.kind === "ask-user-question") kind = "question";
      else if (suspension.kind === "handoff") kind = "handoff";
      else return null;
      identity = suspension.suspensionId;
    }
    const key = `${kind}:${candidate.runId}:${identity}`;
    const now = this.deps.now?.() ?? Date.now();
    if (this.delivered.has(key) || this.pending.has(key) || this.pendingKinds.has(kind)
      || now - (this.lastByKind.get(kind) ?? -Infinity) < THROTTLE_MS) return null;
    const notice: OwnerNotice = { kind, runId: candidate.runId, ...COPY[kind], tag: `aux-${kind}-${candidate.runId}` };
    this.pending.add(key);
    this.pendingKinds.add(kind);
    try {
      await this.deps.emit(notice);
      this.delivered.add(key);
      this.lastByKind.set(kind, now);
      return notice;
    } finally { this.pending.delete(key); this.pendingKinds.delete(kind); }
  }

  private suppressed(runId: string, context: NoticeContext): boolean {
    return context.preference === "off" || context.focusMode
      || (context.windowFocused && (context.preference === "background" || context.foregroundRunId === runId));
  }
}
