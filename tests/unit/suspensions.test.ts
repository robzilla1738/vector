import { afterEach, describe, expect, it } from "vitest";
import type { SuspensionRequest } from "@aux/contracts";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { SuspensionStore } from "../../apps/runtime/src/safety/suspensions.js";
import { classifyRepair } from "../../apps/runtime/src/agent/repair.js";
import { refusalGuidance, REFUSAL_REGISTRY } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});

const request = (over: Partial<SuspensionRequest> = {}): SuspensionRequest => ({
  kind: "ask-user-question",
  instruction: "Which account should I use?",
  guidance: "Wait for the user.",
  ...over,
});

function store() {
  const db = openDb(":memory:");
  databases.push(db);
  return new SuspensionStore(db);
}

const base = { runId: "run-1", threadId: "thread-1", turnId: "run-1" };

describe("S3 durable suspensions", () => {
  it("parks one pending suspension per run and reuses an identical re-park", () => {
    const s = store();
    const first = s.park({ ...base, kind: "ask-user-question", request: request() });
    const second = s.park({ ...base, kind: "ask-user-question", request: request() });
    expect(second.suspensionId).toBe(first.suspensionId);
    expect(s.pendingAll()).toHaveLength(1);
  });

  it("a different re-park supersedes the pending suspension", () => {
    const s = store();
    const first = s.park({ ...base, kind: "ask-user-question", request: request() });
    const second = s.park({
      ...base,
      kind: "handoff",
      request: request({ kind: "handoff", instruction: "Finish the captcha in the page." }),
    });
    expect(second.suspensionId).not.toBe(first.suspensionId);
    expect(s.pending("run-1")?.suspensionId).toBe(second.suspensionId);
    expect(s.pendingAll()).toHaveLength(1);
  });

  it("resolves pending suspensions as answered, cancelled or expired", () => {
    const s = store();
    const a = s.park({ ...base, kind: "ask-user-question", request: request() });
    s.resolve(a.suspensionId, "answered");
    expect(s.pending("run-1")).toBeUndefined();
    const b = s.park({
      ...base,
      runId: "run-2",
      kind: "approval",
      request: request({ kind: "approval", approvalId: "ap-1" }),
    });
    s.resolveRun("run-2", "cancelled");
    expect(s.pending("run-2")).toBeUndefined();
    expect(s.pendingAll()).toHaveLength(0);
    expect(b.state).toBe("pending"); // the returned snapshot predates resolution
  });

  it("resolves an approval suspension through the approval id", () => {
    const s = store();
    s.park({ ...base, kind: "approval", request: request({ kind: "approval", approvalId: "ap-9" }) });
    expect(s.pending("run-1")?.request.approvalId).toBe("ap-9");
    s.resolveByApprovalId("ap-9", "answered");
    expect(s.pending("run-1")).toBeUndefined();
  });

  it("expires suspensions whose runs did not survive restart", () => {
    const s = store();
    s.park({ ...base, runId: "live", kind: "approval", request: request({ kind: "approval" }) });
    s.park({ ...base, runId: "dead", kind: "handoff", request: request({ kind: "handoff" }) });
    expect(s.expireOrphans(new Set(["live"]))).toBe(1);
    expect(s.pending("live")).toBeTruthy();
    expect(s.pending("dead")).toBeUndefined();
  });

  it("validates the stored record against the contract schema", () => {
    const s = store();
    const parked = s.park({
      ...base,
      kind: "action-confirmation",
      request: request({ kind: "action-confirmation" }),
    });
    const pending = s.pending("run-1");
    expect(pending).toMatchObject({
      suspensionId: parked.suspensionId,
      kind: "action-confirmation",
      state: "pending",
      request: { instruction: "Which account should I use?" },
    });
  });
});

describe("S3 suspension classification", () => {
  it("classifies needs_input as suspended, not auth", () => {
    expect(classifyRepair(new AuxError("needs_input", "Complete this action directly in the site."))).toBe(
      "suspended",
    );
    expect(
      classifyRepair(new AuxError("permission_denied", "permission denied for click (effect:write)")),
    ).toBe("auth");
  });
});

describe("S3 refusal registry", () => {
  it("has model-readable guidance for every refusal id", () => {
    for (const id of Object.keys(REFUSAL_REGISTRY) as (keyof typeof REFUSAL_REGISTRY)[]) {
      const text = refusalGuidance(id);
      expect(text).toContain(REFUSAL_REGISTRY[id].outcome);
      expect(text).toContain(REFUSAL_REGISTRY[id].noRetryUntil);
      expect(text).toContain(REFUSAL_REGISTRY[id].instead);
      expect(text).toContain(REFUSAL_REGISTRY[id].retryWhen);
    }
  });
});
