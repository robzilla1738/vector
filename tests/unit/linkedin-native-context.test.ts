import { expect, it, vi } from "vitest";
import type { BrowserContext, Page } from "playwright-core";
import { AuxWorld } from "../../packages/chromium-driver/src/aux-world.js";
import type { LinkedInActionPrecondition } from "@aux/contracts/linkedin";

const context: LinkedInActionPrecondition = {
  kind: "linkedin",
  recipientUrl: "https://www.linkedin.com/in/alex/",
  exactContent: "Requested text",
  targetRef: "r3",
  effect: "draft",
  actionId: "original-operation",
  source: {
    authorityDigest: "a".repeat(64),
    profileId: "profile",
    runId: "run",
    workspaceId: "space",
    sessionId: "session",
    pageId: "page",
    url: "https://www.linkedin.com/messaging/",
    documentEpoch: 2,
    observationId: "observation",
    observationRevision: 4,
  },
  context: { rootRef: "r1", recipientRef: "r2", editorRef: "r3", actionRef: "r3", beforeContent: "Old text" },
};
async function fixture() {
  let state: unknown = "applied",
    supported = true,
    lost = false;
  const send = vi.fn(async (method: string, params: Record<string, unknown> = {}): Promise<unknown> => {
    if (method === "Page.getFrameTree") return { frameTree: { frame: { id: "main" } } };
    if (method === "Page.createIsolatedWorld") return { executionContextId: 7 };
    if (method === "Runtime.evaluate") {
      const ref = /\("(r\d+)"\)/.exec(String(params.expression))?.[1];
      return { result: ref ? { objectId: ref } : {} };
    }
    if (method === "DOM.describeNode")
      return { node: { backendNodeId: Number(String(params.objectId).slice(1)) } };
    if (method === "Input.prepareAuxContextAction") {
      if (!supported) throw new Error("Method not found");
      return { token: "A".repeat(32) };
    }
    if (method === "Input.applyAuxContextAction") {
      if (lost) throw new Error("Original native socket closed after dispatch");
      return state === null ? null : { state };
    }
    return {};
  });
  const session = { on: vi.fn(), send, detach: vi.fn(async () => {}) };
  const browser = { newCDPSession: async () => session } as unknown as BrowserContext;
  const world = await AuxWorld.open(browser, {} as Page);
  return {
    world,
    send,
    state: (value: typeof state) => (state = value),
    unsupported: () => (supported = false),
    lost: () => (lost = true),
  };
}
it("prepares fixed four-node evidence, immutable exact text and actual server action without a JS writer", async () => {
  const f = await fixture();
  const proof = await (await f.world.captureContextAction(context)).prepare();
  expect(f.send).toHaveBeenCalledWith("Input.prepareAuxContextAction", {
    context: expect.objectContaining({
      rootNodeId: 1,
      recipientNodeId: 2,
      editorNodeId: 3,
      actionNodeId: 3,
      beforeText: "Old text",
      text: "Requested text",
      operation: "fill",
      actionId: "original-operation",
    }),
  });
  expect(
    f.send.mock.calls
      .filter(([method]) => method === "Runtime.evaluate")
      .every(([, params]) =>
        /^globalThis\.__auxStore\?\.refs\.get\("r[1-9][0-9]*"\)$/.test(String(params?.expression)),
      ),
  ).toBe(true);
  await proof.apply();
  expect(f.send).toHaveBeenCalledWith("Input.applyAuxContextAction", { token: "A".repeat(32) });
  expect(JSON.stringify(proof)).not.toContain("A".repeat(32));
  await expect(proof.apply()).rejects.toMatchObject({ code: "ref_stale" });
});
it.each(["refused", "uncertain"] as const)(
  "preserves actual native %s outcome and never falls back to DOM filling",
  async (state) => {
    const f = await fixture();
    f.state(state);
    const proof = await (await f.world.captureContextAction(context)).prepare();
    await expect(proof.apply()).rejects.toMatchObject({
      code: "ref_stale",
      detail: { browserInputDispatched: state === "uncertain" },
    });
    expect(
      f.send.mock.calls.some(
        ([method]) => method === "Input.insertText" || method === "Input.dispatchMouseEvent",
      ),
    ).toBe(false);
  },
);
it("treats lost native completion as uncertain and consumes before awaiting the response", async () => {
  const f = await fixture();
  const proof = await (await f.world.captureContextAction(context)).prepare();
  f.lost();
  await expect(proof.apply()).rejects.toMatchObject({
    code: "target_detached",
    detail: { browserInputDispatched: true },
  });
  await expect(proof.apply()).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.send.mock.calls.filter(([method]) => method === "Input.applyAuxContextAction")).toHaveLength(1);
});
it.each([null, "unexpected"])("keeps malformed native completion %s uncertain", async (state) => {
  const f = await fixture();
  f.state(state);
  const proof = await (await f.world.captureContextAction(context)).prepare();
  await expect(proof.apply()).rejects.toMatchObject({ detail: { browserInputDispatched: true } });
  await expect(proof.apply()).rejects.toMatchObject({ code: "ref_stale" });
});
it("retires a proof without input and refuses later use", async () => {
  const f = await fixture();
  const proof = await (await f.world.captureContextAction(context)).prepare();
  await proof.retire();
  expect(f.send).toHaveBeenCalledWith("Input.retireAuxContextAction", { token: "A".repeat(32) });
  await expect(proof.apply()).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.send.mock.calls.some(([method]) => method === "Input.applyAuxContextAction")).toBe(false);
});
it("refuses unsupported native production without synthesizing a proof or any input", async () => {
  const f = await fixture();
  f.unsupported();
  await expect(f.world.captureContextAction(context)).rejects.toMatchObject({
    code: "capability_unsupported",
    detail: { browserInputDispatched: false },
  });
  expect(f.send.mock.calls.some(([method]) => method === "Input.applyAuxContextAction")).toBe(false);
});
it("rejects selectors and missing original operation before native proof production", async () => {
  const f = await fixture();
  await expect(f.world.captureContextAction({ ...context, actionId: undefined })).rejects.toMatchObject({
    code: "capability_unsupported",
  });
  await expect(
    f.world.captureContextAction({ ...context, context: { ...context.context!, rootRef: "css:body" } }),
  ).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.send.mock.calls.some(([method]) => method === "Input.prepareAuxContextAction")).toBe(false);
});

it("uses the normal driver consumer, rejects changed operation parameters and retires on errors", async () => {
  const { PlaywrightDriverPage } = await import("@aux/chromium-driver");
  const { RefRegistry } = await import("@aux/chromium-driver");
  const fallback = vi.fn(() => {
    throw new Error("An admitted input must never fall back");
  });
  const page = { on: vi.fn(), mainFrame: () => ({}), locator: fallback, isClosed: () => false };
  const driver = new PlaywrightDriverPage({
    page: page as unknown as ConstructorParameters<typeof PlaywrightDriverPage>[0]["page"],
    context: {} as BrowserContext,
    identity: { pageId: "page", targetId: "target", backend: "aux" },
    refs: new RefRegistry(),
  });
  const apply = vi.fn(async () => {}),
    retire = vi.fn(async () => {});
  const proof = {
    actionId: "original-operation",
    sourceDigest: "a".repeat(64),
    target: "r3",
    operation: "fill" as const,
    text: "Exact text",
    apply,
    retire,
  };
  await expect(
    driver.withContextAction(proof, () => driver.fill("r3", "Changed text")),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(apply).not.toHaveBeenCalled();
  expect(retire).toHaveBeenCalledOnce();
  await driver.withContextAction(proof, () => driver.fill("r3", "Exact text"));
  expect(apply).toHaveBeenCalledOnce();
  expect(retire).toHaveBeenCalledTimes(2);
  expect(fallback).not.toHaveBeenCalled();
});

it("uses normal exact-recipient approval for an actual native admission and refuses another action", async () => {
  const { openDb } = await import("@aux/runtime");
  const { ApprovalStore } = await import("../../apps/runtime/src/safety/approval.js");
  const { DecisionJournal } = await import("../../apps/runtime/src/safety/decide.js");
  const { SafetyDispatchGate } = await import("../../apps/runtime/src/safety/dispatch.js");
  const db = openDb(":memory:");
  try {
    const approvals = new ApprovalStore(db);
    const gate = new SafetyDispatchGate({
      approvals,
      journal: new DecisionJournal(db),
      managedRules: () => [],
      agentPolicy: () => ({
        agentMode: "ask",
        agentPolicyRevision: 0,
        agentPolicies: [{ category: "input", access: "ask" }],
      }),
      audit: () => {},
    });
    const f = await fixture();
    const native = await (await f.world.captureContextAction(context)).prepare();
    const safetyContext = {
      profileId: "profile",
      scope: { kind: "workspace" as const, id: "space" },
      turnId: "run",
      threadId: "chat",
      runId: "run",
      pageId: "page",
      sessionId: "session",
      documentEpoch: 2,
      actor: "builtin_agent" as const,
      linkedInPrecondition: context,
      nativeContextAction: native,
    };
    const step = { id: "draft", op: "fill" as const, target: "r3", value: "Requested text" };
    await expect(
      gate.check({ step, origin: "https://www.linkedin.com", context: safetyContext, phase: "preflight" }),
    ).rejects.toMatchObject({ code: "needs_input" });
    const pending = approvals.pending("chat");
    expect(pending).toHaveLength(1);
    const approvalId = pending[0]!.approvalId;
    expect(pending[0]!.action).toMatchObject({
      recipient: context.recipientUrl,
      reviewedActions: [{ target: context.recipientUrl, arguments: context.exactContent }],
    });
    approvals.decideLocal({ approvalId, decision: "accept" }, "run");
    await expect(
      gate.check({
        step,
        origin: "https://www.linkedin.com",
        context: { ...safetyContext, approvalId },
        phase: "dispatch",
      }),
    ).resolves.toMatchObject({ authorizedBy: "approval", approvalId });
    expect(f.send.mock.calls.some(([method]) => method === "Input.applyAuxContextAction")).toBe(false);
    await expect(
      gate.check({
        step,
        origin: "https://www.linkedin.com",
        context: {
          ...safetyContext,
          nativeContextAction: { ...native, actionId: "another-action" },
        },
        phase: "dispatch",
      }),
    ).rejects.toMatchObject({ code: "ref_stale" });
    await native.retire();
  } finally {
    db.close();
  }
});
