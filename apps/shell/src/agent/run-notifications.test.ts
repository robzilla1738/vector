import { describe, expect, it, vi } from "vitest";
import type { Suspension, SuspensionKind } from "@aux/contracts";
import { makeRun } from "../mock/fixtures";
import {
  deliverRunAttention,
  matchesRunAttentionActivation,
  RunNotificationGate,
  type NoticeContext,
  type OwnerNotice,
} from "./run-notifications";

const context: NoticeContext = { preference: "all", focusMode: false, windowFocused: false };
const running = makeRun({ runId: "run-1", status: "running", goal: "Private page title and secret" });
const completed = { ...running, status: "completed" as const, result: { report: "Private result" } };
const parked = { ...running, status: "needs_input" as const, statusMessage: "Private question and secret" };
function suspension(kind: SuspensionKind, id = "s1"): Suspension {
  return {
    suspensionId: id,
    runId: running.runId,
    threadId: "thread",
    turnId: running.runId,
    kind,
    request: { kind, instruction: "Private instruction and secret", guidance: "Wait" },
    state: "pending",
    createdAt: 1,
  };
}

describe("owner notification gate", () => {
  it("keeps generic in-app attention when native permission is denied", async () => {
    const notice: OwnerNotice = {
      kind: "question",
      runId: "run-1",
      identity: "s1",
      title: "Aux needs your answer",
      body: "Open Aux to review a question.",
      tag: "aux-question-run-1",
    };
    const showInApp = vi.fn();
    const native = vi.fn(async () => {
      throw new Error("denied");
    });
    await deliverRunAttention(notice, {
      showInApp,
      native,
      systemEnabled: true,
      focusMode: false,
      windowFocused: false,
      windowId: "window-1",
    });
    expect(showInApp).toHaveBeenCalledWith(notice);
    expect(native).toHaveBeenCalledWith({
      kind: "question",
      runId: "run-1",
      identity: "s1",
      windowId: "window-1",
    });
    await deliverRunAttention(notice, {
      showInApp,
      native,
      systemEnabled: true,
      focusMode: true,
      windowFocused: false,
      windowId: "window-1",
    });
    await deliverRunAttention(notice, {
      showInApp,
      native,
      systemEnabled: true,
      focusMode: false,
      windowFocused: true,
      windowId: "window-1",
    });
    expect(native).toHaveBeenCalledTimes(1);
  });
  it("opens only the exact live run or pending suspension after native activation", () => {
    const activation = { runId: running.runId, identity: "s1", windowId: "main" };
    expect(
      matchesRunAttentionActivation({ run: parked, suspension: suspension("ask-user-question") }, activation),
    ).toBe(true);
    expect(
      matchesRunAttentionActivation({ run: parked, suspension: suspension("handoff") }, activation),
    ).toBe(true);
    expect(
      matchesRunAttentionActivation({ run: parked, suspension: suspension("approval") }, activation),
    ).toBe(true);
    expect(
      matchesRunAttentionActivation(
        { run: parked, suspension: { ...suspension("ask-user-question"), state: "answered" } },
        activation,
      ),
    ).toBe(false);
    expect(
      matchesRunAttentionActivation(
        { run: parked, suspension: suspension("ask-user-question", "s2") },
        activation,
      ),
    ).toBe(false);
    expect(
      matchesRunAttentionActivation({ run: completed }, { ...activation, identity: running.runId }),
    ).toBe(true);
    expect(matchesRunAttentionActivation({ run: completed }, activation)).toBe(false);
  });
  it("requires a durable completion transition and emits only generic copy once", async () => {
    const emit = vi.fn(async (_notice: OwnerNotice) => {});
    const gate = new RunNotificationGate({
      getRun: async () => ({ run: completed }),
      emit,
      now: () => 10_000,
    });
    expect(await gate.consider(undefined, completed, () => context)).toBeNull();
    expect(
      await gate.consider(running, completed, () => ({
        ...context,
        foregroundRunId: running.runId,
        windowFocused: true,
      })),
    ).toBeNull();
    expect(
      await gate.consider(running, completed, () => ({
        ...context,
        preference: "background",
        windowFocused: true,
      })),
    ).toBeNull();
    expect(await gate.consider(running, completed, () => ({ ...context, focusMode: true }))).toBeNull();
    expect(await gate.consider(running, completed, () => context)).toMatchObject({
      kind: "completed",
      runId: "run-1",
    });
    expect(await gate.consider(running, completed, () => context)).toBeNull();
    expect(emit).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(emit.mock.calls)).not.toMatch(/Private|secret/);
  });

  it("notifies only pending typed questions and handoffs, with per-kind throttling", async () => {
    let current = suspension("ask-user-question");
    let clock = 10_000;
    const emit = vi.fn(async (_notice: OwnerNotice) => {});
    const gate = new RunNotificationGate({
      getRun: async () => ({ run: parked, suspension: current }),
      emit,
      now: () => clock,
    });
    expect(await gate.consider(running, parked, () => context)).toMatchObject({ kind: "question" });
    current = suspension("ask-user-question", "s2");
    expect(await gate.consider(running, parked, () => context)).toBeNull();
    current = suspension("handoff", "s3");
    expect(await gate.consider(running, parked, () => context)).toMatchObject({ kind: "handoff" });
    current = suspension("approval", "s4");
    expect(await gate.consider(running, parked, () => context)).toBeNull();
    current = suspension("action-confirmation", "s5");
    expect(await gate.consider(running, parked, () => context)).toBeNull();
    current = suspension("ask-user-question", "s2");
    clock += 5_000;
    expect(await gate.consider(running, parked, () => context)).toMatchObject({ kind: "question" });
    expect(emit).toHaveBeenCalledTimes(3);
    expect(JSON.stringify(emit.mock.calls)).not.toMatch(/Private|secret/);
  });

  it.each(["approval", "action-confirmation", "touch-id"] as const)(
    "notifies a pending %s with generic copy and exact activation identity",
    async (kind) => {
      const pending = suspension(kind);
      const emit = vi.fn(async (_notice: OwnerNotice) => {});
      const gate = new RunNotificationGate({
        getRun: async () => ({ run: parked, suspension: pending }),
        emit,
        now: () => 10_000,
      });
      expect(await gate.consider(running, parked, () => context)).toMatchObject({
        kind: "question",
        identity: pending.suspensionId,
      });
      expect(
        matchesRunAttentionActivation(
          { run: parked, suspension: pending },
          { runId: parked.runId, identity: pending.suspensionId, windowId: "original" },
        ),
      ).toBe(true);
      expect(JSON.stringify(emit.mock.calls)).not.toMatch(/Private|secret/);
    },
  );

  it("refuses stale status or resolved suspensions and coalesces concurrent events", async () => {
    let current = { run: parked, suspension: suspension("ask-user-question") };
    const emit = vi.fn(async (_notice: OwnerNotice) => {});
    const gate = new RunNotificationGate({ getRun: async () => current, emit, now: () => 10_000 });
    current = { run: running as typeof parked, suspension: suspension("ask-user-question") };
    expect(await gate.consider(running, parked, () => context)).toBeNull();
    current = {
      run: parked,
      suspension: { ...suspension("ask-user-question"), state: "answered" } as Suspension,
    };
    expect(await gate.consider(running, parked, () => context)).toBeNull();
    current = { run: parked, suspension: suspension("ask-user-question") };
    const outcomes = await Promise.all([
      gate.consider(running, parked, () => context),
      gate.consider(running, parked, () => context),
    ]);
    expect(outcomes.filter(Boolean)).toHaveLength(1);
    expect(emit).toHaveBeenCalledTimes(1);
  });

  it("rechecks foreground focus after the durable read before delivery", async () => {
    let release!: (value: { run: typeof completed }) => void;
    const getRun = () =>
      new Promise<{ run: typeof completed }>((resolve) => {
        release = resolve;
      });
    const emit = vi.fn(async (_notice: OwnerNotice) => {});
    const gate = new RunNotificationGate({ getRun, emit });
    let focused = false;
    const pending = gate.consider(running, completed, () => ({
      ...context,
      windowFocused: focused,
      foregroundRunId: running.runId,
    }));
    focused = true;
    release({ run: completed });
    expect(await pending).toBeNull();
    expect(emit).not.toHaveBeenCalled();
  });
});

it("filters completions independently from questions and rechecks choices after durable lookup", async () => {
  const emit = vi.fn();
  const settings = { ...context, kinds: { attention: true, completion: false } };
  const getRun = vi.fn(async () => ({ run: completed }));
  const gate = new RunNotificationGate({ getRun, emit });
  expect(await gate.consider(running, completed, () => settings)).toBeNull();
  expect(emit).not.toHaveBeenCalled();
  settings.kinds.completion = true;
  expect(await gate.consider(running, completed, () => settings)).toMatchObject({ kind: "completed" });
  const questionGate = new RunNotificationGate({
    getRun: async () => {
      settings.kinds.attention = false;
      return { run: parked, suspension: suspension("approval") };
    },
    emit,
  });
  expect(await questionGate.consider(running, parked, () => settings)).toBeNull();
  expect(emit).toHaveBeenCalledTimes(1);
});

it("filters routine completions by durable provenance without hiding their questions", async () => {
  const routine = { ...completed, config: { ...completed.config, routineId: "routine-1" } };
  const emit = vi.fn();
  const kinds = { attention: true, completion: false, routine: true };
  const gate = new RunNotificationGate({ getRun: async () => ({ run: routine }), emit });
  expect(await gate.consider(running, completed, () => ({ ...context, kinds }))).toMatchObject({
    routine: true,
  });
  const ordinary = new RunNotificationGate({ getRun: async () => ({ run: completed }), emit });
  expect(await ordinary.consider(running, completed, () => ({ ...context, kinds }))).toBeNull();
  kinds.completion = true;
  kinds.routine = false;
  const muted = new RunNotificationGate({ getRun: async () => ({ run: routine }), emit });
  expect(await muted.consider(running, completed, () => ({ ...context, kinds }))).toBeNull();
  const question = new RunNotificationGate({
    getRun: async () => ({
      run: { ...parked, config: routine.config },
      suspension: suspension("approval"),
    }),
    emit,
  });
  expect(await question.consider(running, parked, () => ({ ...context, kinds }))).toMatchObject({
    kind: "question",
    routine: true,
  });
});
