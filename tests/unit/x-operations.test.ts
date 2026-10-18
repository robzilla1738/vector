import { randomUUID } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import { XInvokeParamsSchema, type XInvoke, type XOperation } from "@aux/contracts/x";
import type { AgentPolicySettings } from "@aux/contracts";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { decide, DecisionJournal } from "../../apps/runtime/src/safety/decide.js";
import { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";
import { SuspensionStore } from "../../apps/runtime/src/safety/suspensions.js";
import { xAuthorizer } from "../../apps/runtime/src/services/x-governance.js";
import { DurableWriteLedger } from "@aux/runtime";
import { XGrantService } from "../../apps/runtime/src/services/x-grants.js";
import { XOperationService, type XDispatch } from "../../apps/runtime/src/services/x-operations.js";
import { xSourceHash } from "../../apps/runtime/src/services/x-rest.js";
import { xFixture } from "../fixtures/x.js";
const closes: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of closes.splice(0)) await close();
});
function fixture(operation: XOperation = "posts.create") {
  const f = xFixture(),
    account = f.accounts.account(f.record.connectionId),
    grants = new XGrantService(f.repo, f.accounts);
  const grant = grants.create({
    taskId: f.task.taskId,
    taskRevision: f.task.revision,
    workspaceId: f.workspace.workspaceId,
    connectionId: account.connectionId,
    accountRevision: account.revision,
    operations: [operation],
  });
  const runId = randomUUID();
  f.repo.saveRun({
    runId,
    status: "running",
    goal: "Fixture",
    pageIds: [],
    config: { taskId: f.task.taskId, taskRevision: 1, contextWorkspaceId: f.workspace.workspaceId },
    createdAt: 1,
  });
  const network = vi
    .fn<typeof fetch>()
    .mockResolvedValue(Response.json({ data: { id: "456", text: "Exact original post" } }));
  const authorize = vi
      .fn<(input: XDispatch, signal: AbortSignal) => Promise<() => void>>()
      .mockImplementation(async () => () => {}),
    writes = new DurableWriteLedger(f.repo.db),
    service = new XOperationService({
      repo: f.repo,
      accounts: f.accounts,
      grants,
      writes,
      authorize,
      fetch: network,
    });
  closes.push(async () => {
    await service.close();
    await f.accounts.close();
    f.repo.close();
  });
  const input = {
    runId,
    taskId: grant.taskId,
    taskRevision: grant.taskRevision,
    workspaceId: grant.workspaceId,
    grantId: grant.grantId,
    connectionId: grant.connectionId,
    accountRevision: grant.accountRevision,
    actionId: randomUUID(),
    operation,
    args: operation === "posts.create" ? { text: "Exact original post" } : {},
  } as XInvoke;
  return { ...f, account, grant, grants, service, authorize, writes, network, input };
}
it("captures immutable exact content and persists its intent before one original write; retries cannot replay it", async () => {
  const f = fixture();
  f.network.mockImplementationOnce(async (_url, options) => {
    expect(f.repo.db.prepare("SELECT status FROM action_intents").get()).toMatchObject({ status: "pending" });
    expect(options!.body).toBe(JSON.stringify({ text: "Exact original post" }));
    return Response.json({ data: { id: "456", text: "Exact original post" } });
  });
  f.authorize.mockImplementationOnce(async () => {
    (f.input.args as { text: string }).text = "Mutated caller text";
    return () => {};
  });
  const original = { ...f.input, args: { ...f.input.args } } as XInvoke;
  const output = await f.service.invoke(f.input, new AbortController().signal);
  expect(output.receiptId).toBeTruthy();
  expect(f.network).toHaveBeenCalledOnce();
  expect(f.repo.db.prepare("SELECT status FROM action_intents").get()).toMatchObject({ status: "confirmed" });
  await expect(f.service.invoke(original, new AbortController().signal)).rejects.toMatchObject({
    code: "conflict",
  });
  expect(f.network).toHaveBeenCalledOnce();
  expect(f.authorize.mock.calls[0]![0]).toMatchObject({
    effect: "send",
    source: { userId: f.account.userId },
    request: { body: JSON.stringify({ text: "Exact original post" }) },
  });
});
it("retains uncertain writes and refuses automatic replay after network ambiguity", async () => {
  const f = fixture();
  f.network.mockRejectedValueOnce(new TypeError("fixture connection lost"));
  await expect(f.service.invoke(f.input, new AbortController().signal)).rejects.toThrow(/may have completed/);
  expect(f.repo.db.prepare("SELECT status FROM action_intents").get()).toMatchObject({ status: "uncertain" });
  await expect(f.service.invoke(f.input, new AbortController().signal)).rejects.toMatchObject({
    code: "conflict",
  });
  expect(f.network).toHaveBeenCalledOnce();
});
it("withholds dispatch after grant/account replacement during approval", async () => {
  const f = fixture();
  f.authorize.mockImplementationOnce(async () => {
    f.records.save({ ...f.record, epoch: randomUUID() });
    return () => {};
  });
  await expect(f.service.invoke(f.input, new AbortController().signal)).rejects.toThrow();
  expect(f.network).not.toHaveBeenCalled();
});
it("checks original reply source both before and after approval and exposes exact source hashes on reads", async () => {
  const f = fixture("posts.reply"),
    post = { id: "456", text: "Original source", author_id: "17" };
  f.input = {
    ...f.input,
    operation: "posts.reply",
    args: { postId: "456", text: "Exact reply", expectedSourceSha256: xSourceHash(post) },
  };
  let changed = false;
  f.network.mockImplementation(async () =>
    Response.json({ data: [{ ...post, ...(changed ? { text: "Changed source" } : {}) }] }),
  );
  f.authorize.mockImplementation(async (request) => {
    if (request.effect === "send") changed = true;
    return () => {};
  });
  await expect(f.service.invoke(f.input, new AbortController().signal)).rejects.toMatchObject({
    code: "conflict",
  });
  expect(f.network.mock.calls.every(([, init]) => init!.method === "GET")).toBe(true);
  expect(f.repo.db.prepare("SELECT status FROM action_intents").get()).toMatchObject({
    status: "not_applied",
  });
  const r = fixture("posts.read");
  r.input = { ...r.input, operation: "posts.read", args: { postIds: ["456"] } };
  r.network.mockResolvedValueOnce(
    Response.json({ data: [post], errors: [{ title: "Another source unavailable" }] }),
  );
  const output = await r.service.invoke(r.input, new AbortController().signal);
  expect(output.result).toMatchObject({
    postSources: [{ postId: "456", sha256: xSourceHash(post) }],
    errors: [{ title: "Another source unavailable" }],
  });
});
it("joins original cancellation and grant retirement without publishing a late result", async () => {
  const f = fixture(),
    controller = new AbortController();
  f.network.mockImplementationOnce(
    async (_url, options) =>
      new Promise<never>((_resolve, reject) =>
        options!.signal!.addEventListener("abort", () => reject(options!.signal!.reason), { once: true }),
      ),
  );
  const pending = f.service.invoke(f.input, controller.signal);
  const rejected = pending.then(
    () => undefined,
    (error: unknown) => error,
  );
  await vi.waitFor(() => expect(f.network).toHaveBeenCalledOnce());
  f.grants.revoke(f.task.taskId, f.grant.grantId);
  expect(await rejected).toBeInstanceOf(Error);
  expect(f.network.mock.calls[0]![1]!.signal!.aborted).toBe(true);
  expect(f.repo.db.prepare("SELECT status FROM action_intents").get()).toMatchObject({ status: "uncertain" });
});
it("requires write acknowledgements and keeps API account/rate denials honest without retries", async () => {
  for (const operation of ["bookmarks.add", "follows.add", "messages.send"] as const) {
    const f = fixture(operation);
    f.input = {
      ...f.input,
      operation,
      args:
        operation === "bookmarks.add"
          ? { postId: "456" }
          : operation === "follows.add"
            ? { targetUserId: "17" }
            : { participantId: "17", text: "Exact message" },
    } as XInvoke;
    f.network.mockResolvedValueOnce(Response.json({ data: {} }));
    await expect(f.service.invoke(f.input, new AbortController().signal)).rejects.toThrow(/did not confirm/);
    expect(f.repo.db.prepare("SELECT status FROM action_intents").get()).toMatchObject({
      status: "uncertain",
    });
  }
  const denied = fixture("posts.search");
  denied.input = { ...denied.input, operation: "posts.search", args: { query: "fixture", limit: 25 } };
  denied.network.mockResolvedValueOnce(Response.json({}, { status: 403 }));
  await expect(denied.service.invoke(denied.input, new AbortController().signal)).rejects.toMatchObject({
    code: "permission_denied",
  });
  expect(denied.network).toHaveBeenCalledOnce();
});

function governedFixture(operation: XOperation, args: unknown) {
  const f = fixture(operation);
  f.input = XInvokeParamsSchema.parse({ ...f.input, args });
  const run = f.repo.getRun(f.input.runId)!;
  f.repo.saveRun({
    ...run,
    config: { ...run.config, xGrantIds: [f.grant.grantId], nativeTurnContext: randomUUID() },
  });
  const settings: AgentPolicySettings = { agentMode: "ask", agentPolicyRevision: 0, agentPolicies: [] };
  const approvals = new ApprovalStore(
    f.repo.db,
    () => {},
    undefined,
    () => settings,
    (id) => f.repo.getRun(id),
    f.repo,
  );
  const suspensions = new SuspensionStore(f.repo.db);
  const policy = {
    approvals,
    journal: new DecisionJournal(f.repo.db),
    managedRules: () => [],
    agentPolicy: () => settings,
    audit: () => {},
  };
  const decisions = vi.fn<Parameters<typeof xAuthorizer>[0]["decide"]>((request, options) =>
    decide(request, policy, { phase: "dispatch", runId: request.runId, ...options }),
  );
  f.authorize.mockImplementation(
    xAuthorizer({
      repo: f.repo,
      profileId: "disposable-x-fixture",
      privateProfile: false,
      closed: () => false,
      grants: f.grants,
      gate: new SafetyDispatchGate({ ...policy, suspensions }),
      decide: decisions,
    }),
  );
  return { ...f, approvals, suspensions, decisions };
}

async function approveOriginal(f: ReturnType<typeof governedFixture>, input = f.input) {
  const dispatched = f.network.mock.calls.length;
  await expect(f.service.invoke(input, new AbortController().signal)).rejects.toMatchObject({
    code: "needs_input",
    detail: { park: { kind: "approval" } },
  });
  expect(f.network).toHaveBeenCalledTimes(dispatched);
  const pending = f.approvals.pending(input.runId);
  expect(pending).toHaveLength(1);
  const original = pending[0]!;
  expect(original.action).toMatchObject({
    runId: input.runId,
    scope: { kind: "task", id: f.task.taskId },
    reviewedActions: [{ action: input.operation, arguments: JSON.stringify(input.args) }],
  });
  expect(f.suspensions.pending(input.runId)?.request.approvalId).toBe(original.approvalId);
  f.approvals.decideLocal({ approvalId: original.approvalId, decision: "accept" }, input.runId);
  f.suspensions.resolve(f.suspensions.pending(input.runId)!.suspensionId, "answered");
  return original;
}

const writeCases = [
  { operation: "bookmarks.add", args: { postId: "456" }, objectId: "456", data: { bookmarked: true } },
  { operation: "bookmarks.remove", args: { postId: "456" }, objectId: "456", data: { bookmarked: false } },
  { operation: "follows.add", args: { targetUserId: "17" }, objectId: "17", data: { following: true } },
  { operation: "follows.add", args: { targetUserId: "18" }, objectId: "18", data: { pending_follow: true } },
  { operation: "follows.remove", args: { targetUserId: "17" }, objectId: "17", data: { following: false } },
  {
    operation: "messages.send",
    args: { participantId: "17", text: "Exact reviewed message" },
    objectId: "17",
    data: { dm_event_id: "901", dm_conversation_id: "123456789-17" },
  },
  {
    operation: "messages.reply",
    args: { conversationId: "123456789-17", text: "Exact reviewed reply" },
    objectId: "123456789-17",
    data: { dm_event_id: "902", dm_conversation_id: "123456789-17" },
  },
] satisfies { operation: XOperation; args: unknown; objectId: string; data: Record<string, unknown> }[];

it.each(writeCases)(
  "confirms governed $operation for exact object $objectId only after its one-use original approval and actual acknowledgement",
  async ({ operation, args, objectId, data }) => {
    const f = governedFixture(operation, args);
    const original = await approveOriginal(f);
    f.network.mockImplementationOnce(async (_url, options) => {
      expect(f.repo.db.prepare("SELECT status FROM action_intents").all()).toEqual([
        expect.objectContaining({ status: "pending" }),
      ]);
      expect(f.repo.db.prepare("SELECT state FROM safety_approval_requests").all()).toEqual([
        { state: "consumed" },
      ]);
      expect(options).toMatchObject({ redirect: "error" });
      expect(new Headers(options?.headers).get("authorization")).toBe("Bearer fixture-never-live-access");
      return Response.json({ data });
    });
    const output = await f.service.invoke(f.input, new AbortController().signal);
    expect(f.network).toHaveBeenCalledOnce();
    expect(output.result).toEqual({ data });
    expect(output.source).toMatchObject({
      connectionId: f.account.connectionId,
      accountRevision: f.account.revision,
      userId: f.account.userId,
      username: f.account.username,
      operation,
      objectId,
    });
    expect(original.action.recipient).toBe(`${f.account.connectionId}:${objectId}`);
    expect(original.action.reviewedActions?.[0]?.target).toBe(`${f.account.username} / ${objectId}`);
    expect(f.repo.db.prepare("SELECT id,status,evidence FROM action_intents").get()).toMatchObject({
      id: output.receiptId,
      status: "confirmed",
      evidence: JSON.stringify({
        requestDigest: original.action.invocationDigest,
        providerResultHash: xSourceHash({ data }),
        objectId,
      }),
    });
    expect(
      f.repo.db
        .prepare("SELECT status,effect_outcome FROM operation_invocations ORDER BY rowid DESC LIMIT 1")
        .get(),
    ).toMatchObject({
      status: "completed",
      effect_outcome: "applied",
    });
    expect(f.decisions.mock.calls.at(-1)![1].policyCategories).toEqual([
      operation.startsWith("messages.") ? "send" : "external_tool",
    ]);
  },
);

it.each([
  { operation: "bookmarks.list", args: {}, objectId: "123456789" },
  { operation: "follows.following", args: { userId: "17" }, objectId: "17" },
  { operation: "follows.followers", args: { userId: "17" }, objectId: "17" },
  { operation: "messages.list", args: {}, objectId: "123456789" },
  { operation: "messages.conversation", args: { conversationId: "123456789-17" }, objectId: "123456789-17" },
] satisfies { operation: XOperation; args: Record<string, string>; objectId: string }[])(
  "retains paginated $operation results under the same original account/task without creating a write receipt",
  async ({ operation, args, objectId }) => {
    const f = governedFixture(operation, { ...args, limit: 10 });
    const pages = [
      { data: [{ id: "1001" }], meta: { next_token: "opaque+original-cursor", result_count: 1 } },
      { data: [{ id: "1002" }], meta: { result_count: 1 }, errors: [{ title: "One source unavailable" }] },
    ];
    f.network.mockResolvedValueOnce(Response.json(pages[0])).mockResolvedValueOnce(Response.json(pages[1]));
    const first = await f.service.invoke(f.input, new AbortController().signal);
    const secondInput = XInvokeParamsSchema.parse({
      ...f.input,
      actionId: randomUUID(),
      args: { ...args, limit: 10, pageToken: (first.result.meta as { next_token: string }).next_token },
    });
    const second = await f.service.invoke(secondInput, new AbortController().signal);
    expect([first.result, second.result]).toEqual(pages);
    expect([first.source, second.source]).toEqual([
      expect.objectContaining({
        connectionId: f.account.connectionId,
        accountRevision: f.account.revision,
        userId: f.account.userId,
        operation,
        objectId,
      }),
      expect.objectContaining({
        connectionId: f.account.connectionId,
        accountRevision: f.account.revision,
        userId: f.account.userId,
        operation,
        objectId,
      }),
    ]);
    expect(first).not.toHaveProperty("receiptId");
    expect(second).not.toHaveProperty("receiptId");
    expect(f.repo.db.prepare("SELECT count(*) AS n FROM action_intents").get()).toEqual({ n: 0 });
    expect(f.repo.db.prepare("SELECT count(*) AS n FROM safety_approval_requests").get()).toEqual({ n: 0 });
    expect(f.network).toHaveBeenCalledTimes(2);
    expect(new URL(String(f.network.mock.calls[1]![0])).searchParams.get("pagination_token")).toBe(
      "opaque+original-cursor",
    );
    expect(f.decisions.mock.calls.map(([request]) => request.effect)).toEqual([
      "egress",
      "read",
      "egress",
      "read",
    ]);
    expect(
      f.decisions.mock.calls.every(
        ([request]) => request.scope.id === f.task.taskId && request.runId === f.input.runId,
      ),
    ).toBe(true);
    f.records.save({ ...f.record, epoch: randomUUID() });
    await expect(f.service.invoke(secondInput, new AbortController().signal)).rejects.toMatchObject({
      code: "permission_denied",
    });
    expect(f.network).toHaveBeenCalledTimes(2);
  },
);

it.each([
  {
    operation: "bookmarks.add",
    args: { postId: "456" },
    result: { data: { bookmarked: true }, errors: [{ title: "Partial failure" }] },
  },
  { operation: "follows.remove", args: { targetUserId: "17" }, result: { data: { following: true } } },
  {
    operation: "messages.reply",
    args: { conversationId: "123456789-17", text: "Exact reviewed reply" },
    result: { data: { dm_event_id: "902", dm_conversation_id: "wrong-conversation" } },
  },
] satisfies { operation: XOperation; args: unknown; result: Record<string, unknown> }[])(
  "keeps ambiguous $operation acknowledgements uncertain and blocks a newly approved replacement action without replay",
  async ({ operation, args, result }) => {
    const f = governedFixture(operation, args);
    await approveOriginal(f);
    f.network.mockResolvedValueOnce(Response.json(result));
    await expect(f.service.invoke(f.input, new AbortController().signal)).rejects.toThrow("did not confirm");
    const intent = f.repo.db.prepare("SELECT id,status FROM action_intents").get();
    expect(intent).toMatchObject({ status: "uncertain" });
    expect(f.network).toHaveBeenCalledOnce();
    const replacement = XInvokeParamsSchema.parse({ ...f.input, actionId: randomUUID() });
    await approveOriginal(f, replacement);
    await expect(f.service.invoke(replacement, new AbortController().signal)).rejects.toMatchObject({
      code: "conflict",
    });
    expect(f.network).toHaveBeenCalledOnce();
    expect(f.repo.db.prepare("SELECT id,status FROM action_intents").all()).toEqual([intent]);
  },
);
