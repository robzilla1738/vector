import { randomUUID } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import { Repo, openDb, EventBus, TaskService } from "@aux/runtime";
import { DurableWriteLedger } from "../../apps/runtime/src/agent/durable.js";
import { GoogleGrantService } from "../../apps/runtime/src/services/google-grants.js";
import {
  GoogleOperationService,
  type GoogleInvoke,
  type GoogleDispatch,
} from "../../apps/runtime/src/services/google-operations.js";
import type { GoogleAccountService } from "../../apps/runtime/src/services/google-accounts.js";
import { type GoogleAccount, type GoogleOperation } from "@aux/contracts/google";
const closes: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of closes.splice(0)) await close();
});
function fixture(
  operations: GoogleOperation[] = ["gmail.send"],
  initialConfig: Record<string, unknown> = {},
) {
  const repo = new Repo(openDb(":memory:"));
  const tasks = new TaskService(repo, new EventBus(repo));
  const space = tasks.createWorkspace("Google fixture");
  const task = tasks.create({
    workspaceId: space.workspaceId,
    title: "Google work",
    objective: "Do explicitly authorized fixture work",
    criteria: [{ criterionId: "done", description: "Verified fixture", verification: "manual" }],
  });
  const account: GoogleAccount = {
    connectionId: randomUUID(),
    accountKey: "me@example.test",
    label: "Fixture",
    revision: "a".repeat(64),
    scopes: ["https://www.googleapis.com/auth/gmail.send"],
    state: "active",
    operations,
    createdAt: 1,
    updatedAt: 1,
  };
  repo.db
    .prepare(
      "INSERT INTO calendar_connections(connection_id,provider,account_key,account_key_lookup,label,secret_name,scopes,state,created_at,updated_at) VALUES(?,'google','fixture','fixture','fixture','fixture','[]','active',1,1)",
    )
    .run(account.connectionId);
  const accounts = {
    account: (id: string) => {
      if (id !== account.connectionId) throw Error("wrong account");
      return structuredClone(account);
    },
    withAccess: async (
      id: string,
      revision: string,
      _scopes: readonly string[],
      signal: AbortSignal,
      op: (access: unknown) => Promise<unknown>,
    ) => {
      if (id !== account.connectionId || revision !== account.revision) throw Error("retired account");
      return op({
        token: "fixture-never-live",
        signal,
        source: structuredClone(account),
        checkCurrent: () => {
          if (revision !== account.revision) throw Error("retired account");
          signal.throwIfAborted();
        },
      });
    },
  } as unknown as GoogleAccountService;
  const grants = new GoogleGrantService(repo, accounts),
    writes = new DurableWriteLedger(repo.db);
  const grant = grants.create({
    taskId: task.taskId,
    taskRevision: task.revision,
    workspaceId: space.workspaceId,
    connectionId: account.connectionId,
    accountRevision: account.revision,
    operations,
  });
  const runId = randomUUID();
  repo.saveRun({
    runId,
    goal: "Google fixture",
    status: "running",
    pageIds: [],
    config: {
      ...initialConfig,
      taskId: task.taskId,
      taskRevision: task.revision,
      contextWorkspaceId: space.workspaceId,
    },
    createdAt: 1,
  });
  const http = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ id: "sent1" })),
    authorize = vi.fn<(input: GoogleDispatch, signal: AbortSignal) => Promise<() => void>>(
      async () => () => {},
    );
  const service = new GoogleOperationService({
    repo,
    accounts,
    grants,
    writes,
    authorize,
    fetch: http,
    saveAttachment: ({ bytes, checkCurrent }) => {
      checkCurrent();
      return { artifactId: "saved-attachment", mediaType: "application/octet-stream", size: bytes.length };
    },
  });
  closes.push(async () => {
    await service.close();
    repo.close();
  });
  const input = (
    operation: GoogleOperation = operations[0]!,
    args: unknown = { to: ["person@example.test"], subject: "Fixture", text: "Original" },
  ): GoogleInvoke => ({
    runId,
    taskId: task.taskId,
    taskRevision: task.revision,
    workspaceId: space.workspaceId,
    grantId: grant.grantId,
    connectionId: account.connectionId,
    accountRevision: account.revision,
    operation,
    args,
    actionId: randomUUID(),
  });
  return { repo, tasks, space, task, account, grants, grant, writes, http, authorize, service, input };
}
it("separates draft/send grants and denies mismatched Space, account, task revision, and retired task", async () => {
  const f = fixture(["gmail.draft.create"]);
  for (const input of [
    f.input("gmail.send"),
    { ...f.input(), workspaceId: randomUUID() },
    { ...f.input(), connectionId: randomUUID() },
    { ...f.input(), taskRevision: 2 },
  ])
    await expect(f.service.invoke(input, new AbortController().signal)).rejects.toMatchObject({
      code: "permission_denied",
    });
  expect(f.http).not.toHaveBeenCalled();
  expect(f.authorize).not.toHaveBeenCalled();
  f.repo.db.prepare("UPDATE tasks SET state='archived' WHERE task_id=?").run(f.task.taskId);
  expect(() => f.grants.require(f.input())).toThrow(/retired/);
});
it("captures original write bytes before asynchronous approval and persists one receipt before sending", async () => {
  const f = fixture();
  const input = f.input();
  let approved!: () => void;
  const ready = new Promise<void>((resolve) => (approved = resolve));
  let entered!: () => void;
  const waiting = new Promise<void>((resolve) => (entered = resolve));
  f.authorize.mockImplementationOnce(async () => {
    entered();
    await ready;
    return () => {};
  });
  f.http.mockImplementationOnce(async (_url, init) => {
    expect(f.repo.db.prepare("SELECT status FROM action_intents").all()).toEqual([
      expect.objectContaining({ status: "pending" }),
    ]);
    const raw = Buffer.from(JSON.parse(String(init?.body)).raw, "base64url").toString("utf8");
    expect(raw).toContain(Buffer.from("Original").toString("base64"));
    expect(raw).not.toContain(Buffer.from("Mutated").toString("base64"));
    return Response.json({ id: "sent1" });
  });
  const pending = f.service.invoke(input, new AbortController().signal);
  await waiting;
  (input.args as { text: string }).text = "Mutated";
  approved();
  const result = await pending;
  expect(result.receiptId).toBeTruthy();
  // Same original action cannot send twice, even when supplied changed content.
  await expect(f.service.invoke(input, new AbortController().signal)).rejects.toMatchObject({
    code: "conflict",
  });
  expect(f.http).toHaveBeenCalledTimes(1);
  expect(f.repo.db.prepare("SELECT status FROM action_intents").all()).toEqual([
    expect.objectContaining({ status: "confirmed" }),
  ]);
  const durable = JSON.stringify(f.repo.db.prepare("SELECT inputs FROM operation_invocations").all());
  expect(durable).not.toContain("person@example.test");
});
it("keeps a sent-but-unconfirmed write uncertain and never automatically retries", async () => {
  const f = fixture();
  f.http.mockRejectedValue(new TypeError("network lost"));
  const input = f.input();
  await expect(f.service.invoke(input, new AbortController().signal)).rejects.toThrow(/may have completed/);
  expect(f.repo.db.prepare("SELECT status FROM action_intents").all()).toEqual([
    expect.objectContaining({ status: "uncertain" }),
  ]);
  await expect(f.service.invoke(input, new AbortController().signal)).rejects.toMatchObject({
    code: "conflict",
  });
  expect(f.http).toHaveBeenCalledTimes(1);
});
it("revoking an original grant during approval prevents any dispatch", async () => {
  const f = fixture();
  f.authorize.mockImplementationOnce(async () => {
    f.grants.revoke(f.task.taskId, f.grant.grantId);
    return () => {};
  });
  await expect(f.service.invoke(f.input(), new AbortController().signal)).rejects.toMatchObject({
    code: "cancelled",
  });
  expect(f.http).not.toHaveBeenCalled();
  expect(f.repo.db.prepare("SELECT * FROM action_intents").all()).toEqual([]);
});
it("cancels and joins an active original request on grant retirement without publishing its late response", async () => {
  const f = fixture(["gmail.search"]);
  let started!: () => void;
  const ready = new Promise<void>((resolve) => (started = resolve));
  f.http.mockImplementationOnce(
    async (_url, init) =>
      new Promise((_resolve, reject) => {
        started();
        init?.signal?.addEventListener("abort", () => reject(new DOMException("retired", "AbortError")), {
          once: true,
        });
      }),
  );
  const pending = f.service.invoke(
    f.input("gmail.search", { query: "in:inbox", limit: 10 }),
    new AbortController().signal,
  );
  await ready;
  f.grants.revoke(f.task.taskId, f.grant.grantId);
  await expect(pending).rejects.toMatchObject({ code: "cancelled" });
  await f.service.close();
});
it("performs governed People warmup before search and preserves bounded provider pagination", async () => {
  const f = fixture(["people.search"]);
  f.http.mockImplementation(async () => Response.json({ results: [], nextPageToken: "next" }));
  const result = await f.service.invoke(
    f.input("people.search", { query: "Alice", limit: 5 }),
    new AbortController().signal,
  );
  expect(new URL(String(f.http.mock.calls[0]![0])).searchParams.get("query")).toBe("");
  expect(new URL(String(f.http.mock.calls[1]![0])).searchParams.get("query")).toBe("Alice");
  expect(f.authorize).toHaveBeenCalledTimes(2);
  expect(result.result.nextPageToken).toBe("next");
});
it("checks preflight hashes again after approval and refuses a changed Sheet before dispatch", async () => {
  const f = fixture(["sheets.write"]);
  f.http
    .mockResolvedValueOnce(Response.json({ values: [] }))
    .mockResolvedValueOnce(Response.json({ values: [["Changed"]] }));
  const { googleValuesHash } = await import("../../apps/runtime/src/services/google-rest.js");
  await expect(
    f.service.invoke(
      f.input("sheets.write", {
        spreadsheetId: "sheet1",
        range: "Sheet1!A1",
        values: [["New"]],
        expectedValuesSha256: googleValuesHash([]),
      }),
      new AbortController().signal,
    ),
  ).rejects.toMatchObject({ code: "conflict" });
  expect(f.http.mock.calls.every(([, init]) => init?.method === "GET")).toBe(true);
  expect(f.repo.db.prepare("SELECT status FROM action_intents").all()).toEqual([
    expect.objectContaining({ status: "not_applied" }),
  ]);
});
it("does not confirm a write whose returned provider object identity is absent", async () => {
  const f = fixture();
  f.http.mockResolvedValueOnce(Response.json({}));
  await expect(f.service.invoke(f.input(), new AbortController().signal)).rejects.toThrow(/identity/);
  expect(f.repo.db.prepare("SELECT status FROM action_intents").all()).toEqual([
    expect.objectContaining({ status: "uncertain" }),
  ]);
});
it("binds reply approval to original source recipients and rejects stale source before any send", async () => {
  const f = fixture(["gmail.replyAll"]);
  const source = {
    id: "original1",
    threadId: "thread1",
    payload: {
      headers: [
        { name: "From", value: "other@example.test" },
        { name: "To", value: "me@example.test, friend@example.test" },
        { name: "Subject", value: "Topic" },
        { name: "Message-ID", value: "<original@example.test>" },
      ],
    },
  };
  const { googleMessageHash } = await import("../../apps/runtime/src/services/google-mail.js");
  const args = { messageId: "original1", expectedSourceSha256: googleMessageHash(source), text: "Reply" };
  f.http.mockResolvedValueOnce(Response.json(source)).mockResolvedValueOnce(Response.json({ id: "reply1" }));
  await f.service.invoke(f.input("gmail.replyAll", args), new AbortController().signal);
  const approved = f.authorize.mock.calls[1]![0] as unknown as { effect: string; request: { body: string } };
  expect(approved.effect).toBe("send");
  const raw = Buffer.from(JSON.parse(approved.request.body).raw, "base64url").toString("utf8");
  expect(raw).toContain("To: other@example.test\r\nCc: friend@example.test");
  expect(f.http).toHaveBeenCalledTimes(2);
  const second = fixture(["gmail.replyAll"]);
  second.http.mockResolvedValue(Response.json({ ...source, threadId: "different" }));
  await expect(
    second.service.invoke(second.input("gmail.replyAll", args), new AbortController().signal),
  ).rejects.toMatchObject({ code: "conflict" });
  expect(second.http).toHaveBeenCalledTimes(1);
  expect(second.repo.db.prepare("SELECT * FROM action_intents").all()).toEqual([]);
});
it("keeps Sheet result mismatches uncertain instead of reporting a successful write", async () => {
  const f = fixture(["sheets.write"]);
  const { googleValuesHash } = await import("../../apps/runtime/src/services/google-rest.js");
  f.http
    .mockResolvedValueOnce(Response.json({ values: [] }))
    .mockResolvedValueOnce(Response.json({ values: [] }))
    .mockResolvedValueOnce(Response.json({ spreadsheetId: "sheet1" }))
    .mockResolvedValueOnce(Response.json({ values: [["Different"]] }));
  await expect(
    f.service.invoke(
      f.input("sheets.write", {
        spreadsheetId: "sheet1",
        range: "Sheet1!A1",
        values: [["New"]],
        expectedValuesSha256: googleValuesHash([]),
      }),
      new AbortController().signal,
    ),
  ).rejects.toThrow(/could not be verified/);
  expect(f.repo.db.prepare("SELECT status FROM action_intents").all()).toEqual([
    expect.objectContaining({ status: "uncertain" }),
  ]);
  expect(f.http.mock.calls.filter(([, init]) => init?.method === "POST")).toHaveLength(1);
});
it("rejects protected grant index tampering and a changed reserved operation registration", async () => {
  const f = fixture();
  f.repo.db.prepare("UPDATE google_task_grants SET task_revision=99 WHERE grant_id=?").run(f.grant.grantId);
  await expect(f.service.invoke(f.input(), new AbortController().signal)).rejects.toThrow(/indexes changed/);
  expect(f.http).not.toHaveBeenCalled();
  const other = fixture();
  other.repo.saveOperation({
    operationId: "wrong-reserved-id",
    siteKey: "aux.connector.google",
    name: "gmail.send",
    effectClass: "read",
  });
  await expect(other.service.invoke(other.input(), new AbortController().signal)).rejects.toThrow(
    /registration changed/,
  );
  expect(other.http).not.toHaveBeenCalled();
});

it("passes original cancellation into pending governance and joins it on retirement", async () => {
  const f = fixture();
  let started!: () => void;
  const ready = new Promise<void>((resolve) => (started = resolve));
  f.authorize.mockImplementationOnce(
    async (_input, signal) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(new DOMException("retired", "AbortError")), {
          once: true,
        });
        started();
      }),
  );
  const pending = f.service.invoke(f.input(), new AbortController().signal);
  await ready;
  f.grants.revoke(f.task.taskId, f.grant.grantId);
  await expect(pending).rejects.toMatchObject({ code: "cancelled" });
  await f.service.close();
  expect(f.http).not.toHaveBeenCalled();
});
it("does not let private tasks, read-only subagents or a tool-restricted profile use granted writes", async () => {
  for (const patch of [
    { privateTask: true },
    { subagentProfile: "read_only" },
    { agentProfile: { tools: ["observe"] } },
  ]) {
    const f = fixture(["gmail.send"], patch);
    await expect(f.service.invoke(f.input(), new AbortController().signal)).rejects.toMatchObject({
      code: "permission_denied",
    });
    expect(f.http).not.toHaveBeenCalled();
  }
});

it("saves verified attachment bytes as an inert owned artifact instead of sending base64 into model context", async () => {
  const f = fixture(["gmail.attachment"]),
    bytes = Buffer.from([0, 255, 1, 254]);
  f.http.mockResolvedValueOnce(Response.json({ size: bytes.length, data: bytes.toString("base64url") }));
  const result = await f.service.invoke(
    f.input("gmail.attachment", { messageId: "message1", attachmentId: "attachment1" }),
    new AbortController().signal,
  );
  expect(result.result).toMatchObject({
    artifactId: "saved-attachment",
    size: 4,
    mediaType: "application/octet-stream",
    sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
  });
  expect(result.result).not.toHaveProperty("data");
  const invalid = fixture(["gmail.attachment"]);
  invalid.http.mockResolvedValueOnce(Response.json({ size: 999, data: bytes.toString("base64url") }));
  await expect(
    invalid.service.invoke(
      invalid.input("gmail.attachment", { messageId: "message1", attachmentId: "attachment1" }),
      new AbortController().signal,
    ),
  ).rejects.toThrow(/byte size/);
});
