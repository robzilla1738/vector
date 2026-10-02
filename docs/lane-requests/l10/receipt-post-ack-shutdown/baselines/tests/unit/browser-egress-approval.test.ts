import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuxEvent, OriginRule, Run } from "@aux/contracts";
import type { EventBus } from "../../apps/runtime/src/events.js";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { SuspensionStore } from "../../apps/runtime/src/safety/suspensions.js";
import { DecisionJournal } from "../../apps/runtime/src/safety/decide.js";
import { browserEgressApproval } from "../../apps/runtime/src/safety/browser-egress-approval.js";
import { safetyMethods } from "../../apps/runtime/src/api/methods/safety.js";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => { for (const db of databases.splice(0)) db.close(); });

function fixture(statusBoundary?: () => Promise<void>) {
  const db = openDb(":memory:"); databases.push(db);
  const approvals = new ApprovalStore(db), suspensions = new SuspensionStore(db);
  const listeners = new Set<(event: AuxEvent) => void>();
  const emitted: { type: string; payload: Record<string, unknown>; runId?: string }[] = [];
  const events = {
    emit(type: string, payload: Record<string, unknown>, runId?: string) {
      emitted.push({ type, payload, runId });
      const event = { type, payload, runId, seq: emitted.length, streamId: "events", ts: Date.now() };
      for (const listener of listeners) listener(event);
      return event;
    },
    subscribe(listener: (event: AuxEvent) => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  } as EventBus;
  const run: Run = { runId: "run", goal: "Fixture", status: "running", pageIds: ["tab"], createdAt: Date.now() };
  const rules: OriginRule[] = [];
  const approve = browserEgressApproval({
    profileId: "profile", events, suspensions, run: () => run,
    setStatus: async (_, status, message) => { await statusBoundary?.(); run.status = status; run.statusMessage = message; events.emit("run.status", { status }, "run"); },
    decide: { approvals, journal: new DecisionJournal(db), managedRules: () => [], userRules: () => rules,
      localCeiling: () => "always", audit: () => {} },
  });
  const abort = new AbortController();
  const input = { runId: "run", threadId: "thread", digest: "a".repeat(64), sourceOrigin: "https://source.test",
    destinationOrigin: "https://recipient.test", pageContent: true, signal: abort.signal };
  const answer = (accept: boolean) => {
    const pending = suspensions.pending("run")!;
    const approvalId = pending.request.approvalId!;
    approvals.decideLocal({ decision: accept ? "accept" : "decline", approvalId }, "run");
    suspensions.resolveByApprovalId(approvalId, accept ? "answered" : "cancelled");
    run.status = "running";
    events.emit("run.status", { status: "running" }, "run");
  };
  return { approve, input, answer, abort, approvals, suspensions, emitted, rules, listeners, run, events };
}

describe("browser transmission approval", () => {
  it("shows source→recipient and consumes one local decision for the exact digest", async () => {
    const f = fixture();
    const pending = f.approve(f.input);
    await vi.waitFor(() => expect(f.suspensions.pending("run")).toBeDefined());
    expect(f.emitted.find(event => event.type === "safety.confirmation")?.payload.instruction)
      .toBe("Allow content from https://source.test to be sent to https://recipient.test?");
    f.answer(true);
    expect(await pending).toBe(true);
    expect(f.listeners.size).toBe(0);
    const again = f.approve({ ...f.input, digest: "b".repeat(64) });
    await vi.waitFor(() => expect(f.suspensions.pending("run")).toBeDefined());
    f.answer(false);
    expect(await again).toBe(false);
  });

  it("resumes the in-flight native request without queuing a future planner answer", async () => {
    const f = fixture();
    const pending = f.approve(f.input);
    await vi.waitFor(() => expect(f.suspensions.pending("run")).toBeDefined());
    const approvalId = f.suspensions.pending("run")!.request.approvalId!;
    const answer = vi.fn();
    await safetyMethods["safety.approvals.decide"]!({
      approvals: f.approvals, suspensions: f.suspensions, client: { external: false },
      params: { expectedTurnId: "run", decision: { decision: "accept", approvalId } },
      s: { repo: { getRun: () => f.run }, runs: { coordinator: { answer,
        setStatus: (_: string, status: Run["status"]) => {
          f.run.status = status; f.events.emit("run.status", { status }, "run");
        },
      } } },
    } as never);
    expect(await pending).toBe(true);
    expect(answer).not.toHaveBeenCalled();
  });

  it("cancels an outstanding request without an acceptance or leaked event listener", async () => {
    const f = fixture();
    const pending = f.approve(f.input);
    await vi.waitFor(() => expect(f.suspensions.pending("run")).toBeDefined());
    f.abort.abort();
    expect(await pending).toBe(false);
    expect(f.suspensions.pending("run")).toBeUndefined();
    expect(f.approvals.pending("thread")).toEqual([]);
    expect(f.listeners.size).toBe(0);
  });
});

it("waits for actual asynchronous status retirement before advertising confirmation", async () => {
  let release!: () => void;
  const f = fixture(() => new Promise<void>(resolve => { release = resolve; }));
  const pending = f.approve(f.input);
  await vi.waitFor(() => expect(release).toBeTypeOf("function"));
  expect(f.emitted.some(event => event.type === "safety.confirmation")).toBe(false);
  expect(f.listeners.size).toBe(0);
  release();
  await vi.waitFor(() => expect(f.emitted.some(event => event.type === "safety.confirmation")).toBe(true));
  f.answer(true); expect(await pending).toBe(true);
});

it("cancels the exact approval and suspension when retirement rejects before a confirmation waiter exists", async () => {
  const f = fixture(async () => { throw new Error("Native retirement was not acknowledged"); });
  await expect(f.approve(f.input)).rejects.toThrow("Native retirement was not acknowledged");
  expect(f.suspensions.pending("run")).toBeUndefined();
  expect(f.approvals.pending("thread")).toEqual([]);
  expect(f.listeners.size).toBe(0);
  expect(f.emitted.some(event => event.type === "safety.confirmation")).toBe(false);
});
