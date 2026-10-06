import type { Run, Suspension } from "@aux/contracts";

export type OwnerNoticeKind = "completed" | "question" | "handoff";
export type OwnerNotice = {
  kind: OwnerNoticeKind;
  runId: string;
  identity: string;
  title: string;
  body: string;
  tag: string;
};
export type NoticePreference = "off" | "background" | "all";
export type NoticeContext = {
  preference: NoticePreference;
  focusMode: boolean;
  windowFocused: boolean;
  foregroundRunId?: string | null;
};
export type DurableRunState = { run: Run; suspension?: Suspension | null };
export type NativeAttentionPayload = {
  kind: OwnerNoticeKind;
  runId: string;
  identity: string;
  windowId: string;
};
/** Keep in-app attention even when macOS permission or the native bridge rejects delivery. */
export async function deliverRunAttention(
  notice: OwnerNotice,
  options: {
    showInApp(notice: OwnerNotice): void;
    native?: (payload: NativeAttentionPayload) => Promise<{ queued: boolean }>;
    systemEnabled: boolean;
    focusMode: boolean;
    windowFocused: boolean;
    windowId: string;
  },
): Promise<void> {
  options.showInApp(notice);
  if (!options.native || !options.systemEnabled || options.focusMode || options.windowFocused) return;
  try {
    await options.native({
      kind: notice.kind,
      runId: notice.runId,
      identity: notice.identity,
      windowId: options.windowId,
    });
  } catch {
    /* In-app attention remains available. */
  }
}
export type RunAttentionActivation = { runId: string; identity: string; windowId: string };
export function matchesRunAttentionActivation(
  current: DurableRunState,
  activation: RunAttentionActivation,
): boolean {
  const { run, suspension } = current;
  if (run.runId !== activation.runId) return false;
  if (run.status === "completed") return activation.identity === run.runId;
  return (
    run.status === "needs_input" &&
    !!suspension &&
    suspension.state === "pending" &&
    suspension.runId === run.runId &&
    suspension.turnId === run.runId &&
    suspension.suspensionId === activation.identity &&
    ["ask-user-question", "approval", "action-confirmation", "touch-id", "budget", "handoff"].includes(
      suspension.kind,
    )
  );
}
export type RunView = {
  mode: string;
  overlay: string | null;
  conversationId: string | null;
  railOpen: boolean;
  railView: { kind: string; runId?: string };
  runs: readonly Run[];
};

/** A selected chat counts as viewing its newest turn; an overlay hides the run beneath it. */
export function foregroundRunId(view: RunView): string | null {
  if (view.overlay) return null;
  if (view.mode === "conversation" && view.conversationId) {
    const latest = view.runs
      .filter((run) => (run.config?.chatId ?? run.runId) === view.conversationId)
      .sort((a, b) => b.createdAt - a.createdAt || b.runId.localeCompare(a.runId))[0];
    return latest?.runId ?? null;
  }
  return view.railOpen && view.railView.kind === "run" ? (view.railView.runId ?? null) : null;
}

const COPY: Record<OwnerNoticeKind, Pick<OwnerNotice, "title" | "body">> = {
  completed: { title: "Aux finished a task", body: "Open Aux to review the result." },
  question: { title: "Aux needs your input", body: "Open Aux to review the request." },
  handoff: { title: "Your turn in Aux", body: "Open Aux to finish a browser step." },
};
const THROTTLE_MS = 5_000;

/** Delivery policy for a host-owned notification adapter. No page, task, or secret text crosses this boundary. */
export class RunNotificationGate {
  private readonly delivered = new Set<string>();
  private readonly pending = new Set<string>();
  private readonly pendingKinds = new Set<OwnerNoticeKind>();
  private readonly lastByKind = new Map<OwnerNoticeKind, number>();

  constructor(
    private readonly deps: {
      getRun(runId: string): Promise<DurableRunState>;
      emit(notice: OwnerNotice): Promise<void> | void;
      now?: () => number;
    },
  ) {}

  async consider(
    previous: Run | undefined,
    candidate: Run,
    getContext: () => NoticeContext,
  ): Promise<OwnerNotice | null> {
    if (!previous || previous.runId !== candidate.runId || this.suppressed(candidate.runId, getContext()))
      return null;
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
      if (
        !suspension ||
        suspension.runId !== candidate.runId ||
        suspension.turnId !== candidate.runId ||
        suspension.state !== "pending"
      )
        return null;
      if (
        ["ask-user-question", "approval", "action-confirmation", "touch-id", "budget"].includes(
          suspension.kind,
        )
      )
        kind = "question";
      else if (suspension.kind === "handoff") kind = "handoff";
      else return null;
      identity = suspension.suspensionId;
    }
    const key = `${kind}:${candidate.runId}:${identity}`;
    const now = this.deps.now?.() ?? Date.now();
    if (
      this.delivered.has(key) ||
      this.pending.has(key) ||
      this.pendingKinds.has(kind) ||
      now - (this.lastByKind.get(kind) ?? -Infinity) < THROTTLE_MS
    )
      return null;
    const notice: OwnerNotice = {
      kind,
      runId: candidate.runId,
      identity,
      ...COPY[kind],
      tag: `aux-${kind}-${candidate.runId}`,
    };
    this.pending.add(key);
    this.pendingKinds.add(kind);
    try {
      await this.deps.emit(notice);
      this.delivered.add(key);
      this.lastByKind.set(kind, now);
      return notice;
    } finally {
      this.pending.delete(key);
      this.pendingKinds.delete(kind);
    }
  }

  private suppressed(runId: string, context: NoticeContext): boolean {
    return (
      context.preference === "off" ||
      context.focusMode ||
      (context.windowFocused && (context.preference === "background" || context.foregroundRunId === runId))
    );
  }
}
