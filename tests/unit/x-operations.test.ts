import { randomUUID } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import type { XInvoke, XOperation } from "@aux/contracts/x";
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
