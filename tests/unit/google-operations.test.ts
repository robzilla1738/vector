import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ArtifactStore } from "../../apps/runtime/src/services/artifacts.js";
import {
  listPdfSources,
  withPdfSources,
  type PdfSourceDependencies,
} from "../../apps/runtime/src/services/pdf-sources.js";
import { createHash, randomUUID } from "node:crypto";
import type { AgentPolicySettings } from "@aux/contracts";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { decide, DecisionJournal } from "../../apps/runtime/src/safety/decide.js";
import { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";
import { SuspensionStore } from "../../apps/runtime/src/safety/suspensions.js";
import { googleAuthorizer } from "../../apps/runtime/src/services/google-governance.js";
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
import {
  GOOGLE_OPERATIONS,
  GoogleScopeSchema,
  type GoogleAccount,
  type GoogleOperation,
} from "@aux/contracts/google";
const closes: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of closes.splice(0)) await close();
});
function fixture(
  operations: GoogleOperation[] = ["gmail.send"],
  initialConfig: Record<string, unknown> = {},
  extra: Partial<ConstructorParameters<typeof GoogleOperationService>[0]> = {},
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
    scopes: GoogleScopeSchema.array().parse([
      ...new Set([
        ...operations.flatMap((operation) => GOOGLE_OPERATIONS[operation].scopes),
        ...(operations.some((operation) => operation === "gmail.reply" || operation === "gmail.replyAll")
          ? ["https://www.googleapis.com/auth/gmail.readonly"]
          : []),
      ]),
    ]),
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
      scopes: readonly string[],
      signal: AbortSignal,
      op: (access: unknown) => Promise<unknown>,
    ) => {
      if (id !== account.connectionId || revision !== account.revision) throw Error("retired account");
      if (!scopes.some((scope) => account.scopes.some((granted) => granted === scope)))
        throw Error("missing fixture account scope");
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
    saveAttachment: ({ bytes, mediaType, checkCurrent }) => {
      checkCurrent();
      return { artifactId: "saved-attachment", mediaType, size: bytes.length };
    },
    ...extra,
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
it.each(["RAW", "USER_ENTERED"] as const)(
  "verifies %s Sheet writes with trailing empty cells and real parsed values",
  async (valueInputOption) => {
    const f = fixture(["sheets.write"]);
    const { googleValuesHash } = await import("../../apps/runtime/src/services/google-rest.js");
    const values = valueInputOption === "RAW" ? [["42", "literal"]] : [[42, "=SUM(1,2)"]];
    const observed = { range: "'Sheet1'!A1:B2", majorDimension: "ROWS", values };
    f.http
      .mockResolvedValueOnce(Response.json({ values: [] }))
      .mockResolvedValueOnce(Response.json({ values: [] }))
      .mockResolvedValueOnce(
        Response.json({
          spreadsheetId: "sheet1",
          responses: [{ spreadsheetId: "sheet1", updatedData: observed }],
        }),
      )
      .mockResolvedValueOnce(Response.json(observed));
    await f.service.invoke(
      f.input("sheets.write", {
        spreadsheetId: "sheet1",
        range: "Sheet1!A1:B2",
        values: [
          ["42", valueInputOption === "RAW" ? "literal" : "=SUM(1,2)"],
          ["", ""],
        ],
        expectedValuesSha256: googleValuesHash([]),
        valueInputOption,
      }),
      new AbortController().signal,
    );
    expect(f.repo.db.prepare("SELECT status FROM action_intents").all()).toEqual([
      expect.objectContaining({ status: "confirmed" }),
    ]);
    const writes = f.http.mock.calls.filter(([, init]) => init?.method === "POST");
    expect(writes).toHaveLength(1);
    expect(JSON.parse(String(writes[0]![1]!.body)).responseValueRenderOption).toBe(
      valueInputOption === "RAW" ? "UNFORMATTED_VALUE" : "FORMULA",
    );
  },
);
it("keeps missing parsed Sheet write acknowledgements uncertain and never replays them", async () => {
  const f = fixture(["sheets.write"]);
  const { googleValuesHash } = await import("../../apps/runtime/src/services/google-rest.js");
  f.http
    .mockResolvedValueOnce(Response.json({ values: [] }))
    .mockResolvedValueOnce(Response.json({ values: [] }))
    .mockResolvedValueOnce(Response.json({ spreadsheetId: "sheet1" }))
    .mockResolvedValueOnce(Response.json({ range: "Sheet1!A1", values: [[42]] }));
  const input = f.input("sheets.write", {
    spreadsheetId: "sheet1",
    range: "Sheet1!A1",
    values: [["42"]],
    expectedValuesSha256: googleValuesHash([]),
    valueInputOption: "USER_ENTERED",
  });
  await expect(f.service.invoke(input, new AbortController().signal)).rejects.toThrow(
    /could not be verified/,
  );
  expect(f.repo.db.prepare("SELECT status FROM action_intents").all()).toEqual([
    expect.objectContaining({ status: "uncertain" }),
  ]);
  await expect(f.service.invoke(input, new AbortController().signal)).rejects.toThrow();
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

function docs(text: string, revisionId = "revision-1", bold = false) {
  return {
    documentId: "doc1",
    revisionId,
    tabs: [
      {
        tabProperties: { tabId: "tab1" },
        documentTab: {
          body: {
            content: [
              { startIndex: 0, endIndex: 1, sectionBreak: {} },
              {
                startIndex: 1,
                endIndex: text.length + 1,
                paragraph: {
                  elements: [
                    {
                      startIndex: 1,
                      endIndex: text.length + 1,
                      textRun: { content: text, textStyle: { bold } },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    ],
  };
}
it("confirms Docs edits only after exact revision preflight and text/style readback", async () => {
  const f = fixture(["docs.edit"]);
  f.http
    .mockResolvedValueOnce(Response.json(docs("A\n")))
    .mockResolvedValueOnce(Response.json(docs("A\n")))
    .mockResolvedValueOnce(Response.json({ documentId: "doc1", replies: [{}] }))
    .mockResolvedValueOnce(Response.json(richDocs([{ text: "x", style: { bold: true } }, { text: "A\n" }])));
  const result = await f.service.invoke(
    f.input("docs.edit", {
      documentId: "doc1",
      requiredRevisionId: "revision-1",
      edits: [{ kind: "insert", index: 1, text: "x", bold: true, tabId: "tab1" }],
    }),
    new AbortController().signal,
  );
  expect(result.result).toMatchObject({
    verification: {
      scope: "api-body-ranges",
      revisionId: "revision-2",
      tabIds: ["tab1"],
      sha256: expect.stringMatching(/^[a-f0-9]{64}$/),
    },
  });
  expect(f.http.mock.calls.map((call) => call[1]?.method)).toEqual(["GET", "GET", "POST", "GET"]);
  expect(f.repo.db.prepare("SELECT status FROM action_intents").all()).toEqual([
    expect.objectContaining({ status: "confirmed" }),
  ]);
});
it.each(["text", "style", "unavailable"])(
  "retains uncertain Docs writes without replay on %s readback failure",
  async (failure) => {
    const f = fixture(["docs.edit"]),
      input = f.input("docs.edit", {
        documentId: "doc1",
        requiredRevisionId: "revision-1",
        edits: [{ kind: "insert", index: 1, text: "x", bold: true }],
      });
    f.http
      .mockResolvedValueOnce(Response.json(docs("A\n")))
      .mockResolvedValueOnce(Response.json(docs("A\n")))
      .mockResolvedValueOnce(Response.json({ documentId: "doc1" }))
      .mockResolvedValueOnce(
        failure === "unavailable"
          ? new Response("Unavailable", { status: 503 })
          : Response.json(docs(failure === "text" ? "wrong\n" : "xA\n", "revision-2", false)),
      );
    await expect(f.service.invoke(input, new AbortController().signal)).rejects.toThrow();
    expect(f.repo.db.prepare("SELECT status FROM action_intents").all()).toEqual([
      expect.objectContaining({ status: "uncertain" }),
    ]);
    await expect(f.service.invoke(input, new AbortController().signal)).rejects.toMatchObject({
      code: "conflict",
    });
    expect(f.http.mock.calls.filter((call) => call[1]?.method === "POST")).toHaveLength(1);
  },
);
it("refuses stale revisions and unsupported Docs structure before write dispatch", async () => {
  const f = fixture(["docs.edit"]);
  f.http.mockResolvedValueOnce(Response.json(docs("A\n", "another-revision")));
  await expect(
    f.service.invoke(
      f.input("docs.edit", {
        documentId: "doc1",
        requiredRevisionId: "revision-1",
        edits: [{ kind: "insert", index: 1, text: "x" }],
      }),
      new AbortController().signal,
    ),
  ).rejects.toMatchObject({ code: "conflict" });
  expect(f.repo.db.prepare("SELECT * FROM action_intents").all()).toEqual([]);
  expect(f.http.mock.calls.some((call) => call[1]?.method === "POST")).toBe(false);
});
it("does not broaden values-only task grants to notes and formatting grid reads", async () => {
  const f = fixture(["sheets.read"]);
  await expect(
    f.service.invoke(
      f.input("sheets.grid.read", {
        spreadsheetId: "sheet1",
        range: "Tab!A1:A2",
      }),
      new AbortController().signal,
    ),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.http).not.toHaveBeenCalled();
  const allowed = fixture(["sheets.grid.read"]);
  allowed.http.mockResolvedValueOnce(
    Response.json({
      spreadsheetId: "sheet1",
      sheets: [
        {
          properties: { sheetId: 0, title: "Tab" },
          data: [
            {
              rowData: [
                {
                  values: [
                    {
                      note: "Original",
                      userEnteredValue: { formulaValue: "=1+2" },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  );
  const result = await allowed.service.invoke(
    allowed.input("sheets.grid.read", {
      spreadsheetId: "sheet1",
      range: "Tab!A1:A2",
    }),
    new AbortController().signal,
  );
  expect(result.result).toMatchObject({
    cells: [{ note: "Original", userEnteredValue: { formulaValue: "=1+2" } }],
    concurrency: "observed-range-not-an-atomic-revision",
  });
  expect(allowed.http.mock.calls[0]?.[1]?.method).toBe("GET");
});
it.each(["unsupported", "mismatched-hash", "missing-inspector"])(
  "preserves sanitized original attachment bytes after %s inspection",
  async (failure) => {
    const bytes = Buffer.from("%PDF-1.7 original bytes"),
      saved = vi.fn();
    const f = fixture(
      ["gmail.attachment"],
      {},
      {
        inspectAttachment:
          failure === "missing-inspector"
            ? undefined
            : async () => {
                if (failure === "unsupported") throw Error("Decoder unavailable");
                return {
                  mediaType: "application/pdf",
                  sourceSha256: "0".repeat(64),
                };
              },
        saveAttachment: (value) => {
          saved({ ...value, bytes: Buffer.from(value.bytes) });
          return {
            artifactId: "original",
            mediaType: value.mediaType,
            size: value.bytes.length,
          };
        },
      },
    );
    f.http
      .mockResolvedValueOnce(
        Response.json({
          size: bytes.length,
          data: bytes.toString("base64url"),
        }),
      )
      .mockResolvedValueOnce(
        Response.json({
          id: "message1",
          payload: {
            parts: [
              {
                filename: "../Report\u202e.pdf",
                mimeType: "application/pdf",
                body: { attachmentId: "attachment1", size: bytes.length },
              },
            ],
          },
        }),
      );
    const result = await f.service.invoke(
      f.input("gmail.attachment", {
        messageId: "message1",
        attachmentId: "attachment1",
      }),
      new AbortController().signal,
    );
    expect(result.result).toMatchObject({
      filename: ".._Report.pdf",
      mediaType: "application/octet-stream",
      admission: { status: "unsupported" },
    });
    expect(saved.mock.calls[0]?.[0].bytes).toEqual(bytes);
    expect(f.http.mock.calls[1]?.[0]).toMatch(/messages\/message1\?/);
  },
);
it("does not publish attachments when the original owner retires during inspection", async () => {
  const bytes = Buffer.from("%PDF-1.7 original"),
    saved = vi.fn();
  let retire!: () => void, enter!: () => void;
  const waiting = new Promise<void>((resolve) => {
      enter = resolve;
    }),
    resumed = new Promise<void>((resolve) => {
      retire = resolve;
    });
  const f = fixture(
    ["gmail.attachment"],
    {},
    {
      inspectAttachment: async (input) => {
        enter();
        await resumed;
        input.checkCurrent();
        return { sourceSha256: input.sha256, mediaType: "application/pdf" };
      },
      saveAttachment: saved,
    },
  );
  f.http
    .mockResolvedValueOnce(Response.json({ size: bytes.length, data: bytes.toString("base64url") }))
    .mockResolvedValueOnce(
      Response.json({
        id: "message1",
        payload: {
          filename: "report.pdf",
          mimeType: "application/pdf",
          body: { attachmentId: "attachment1", size: bytes.length },
        },
      }),
    );
  const pending = f.service.invoke(
    f.input("gmail.attachment", {
      messageId: "message1",
      attachmentId: "attachment1",
    }),
    new AbortController().signal,
  );
  await waiting;
  f.repo.db.prepare("UPDATE tasks SET state='archived' WHERE task_id=?").run(f.task.taskId);
  retire();
  await expect(pending).rejects.toThrow();
  expect(saved).not.toHaveBeenCalled();
});
it("makes inspected Gmail PDF originals available to the owned pdf_sources route without altering bytes", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-google-pdf-fixture-"));
  const objects = [
    "<</Type /Catalog /Pages 2 0 R>>",
    "<</Type /Pages /Kids [3 0 R] /Count 1>>",
    "<</Type /Page /Parent 2 0 R /MediaBox [0 0 100 100] /Resources <<>> /Contents 4 0 R>>",
    "<</Length 0>>\nstream\n\nendstream",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 5\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("")}trailer\n<</Size 5 /Root 1 0 R>>\nstartxref\n${xref}\n%%EOF\n`;
  const bytes = Buffer.from(pdf);
  let artifacts!: ArtifactStore;
  const inspect = vi.fn(async (input: { sha256: string }) => ({
    sourceSha256: input.sha256,
    mediaType: "application/pdf",
  }));
  const f = fixture(
    ["gmail.attachment"],
    {},
    {
      inspectAttachment: inspect,
      saveAttachment: (input) => {
        input.checkCurrent();
        return artifacts.save({
          runId: input.runId,
          label: input.filename,
          buffer: Buffer.from(input.bytes),
          mediaType: input.mediaType,
        });
      },
    },
  );
  artifacts = new ArtifactStore(dir, f.repo, new EventBus(f.repo));
  closes.push(async () => rmSync(dir, { recursive: true, force: true }));
  f.http
    .mockResolvedValueOnce(Response.json({ size: bytes.length, data: bytes.toString("base64url") }))
    .mockResolvedValueOnce(
      Response.json({
        id: "message1",
        payload: {
          filename: "Original.pdf",
          mimeType: "application/pdf",
          body: { attachmentId: "attachment1", size: bytes.length },
        },
      }),
    );
  const result = await f.service.invoke(
    f.input("gmail.attachment", {
      messageId: "message1",
      attachmentId: "attachment1",
    }),
    new AbortController().signal,
  );
  expect(result.result).toMatchObject({
    filename: "Original.pdf",
    mediaType: "application/pdf",
    admission: { status: "verified" },
  });
  const deps = { repo: f.repo } as PdfSourceDependencies,
    run = f.repo.getRun(f.input().runId)!;
  const owner = {
    run,
    signal: new AbortController().signal,
    checkCurrent() {},
  };
  const inventory = await listPdfSources(deps, {}, owner);
  expect(inventory.sources).toMatchObject([
    {
      status: "available",
      source: { kind: "artifact", artifactId: result.result.artifactId },
    },
  ]);
  await withPdfSources(
    deps,
    [{ kind: "artifact", artifactId: result.result.artifactId as string }],
    owner,
    async (admitted) => {
      expect(admitted[0]?.bytes).toEqual(bytes);
      expect(readFileSync(f.repo.getArtifact(result.result.artifactId as string)!.path)).toEqual(bytes);
    },
  );
  expect(inspect).toHaveBeenCalledTimes(1);
});

function richDocs(parts: { text: string; style?: Record<string, unknown> }[], revision = "revision-2") {
  const result = docs(parts.map((part) => part.text).join(""), revision);
  let index = 1;
  result.tabs[0]!.documentTab.body.content[1]!.paragraph!.elements = parts.map((part) => {
    const startIndex = index;
    index += part.text.length;
    return {
      startIndex,
      endIndex: index,
      textRun: { content: part.text, textStyle: part.style ?? { bold: false } },
    };
  }) as never;
  return result;
}
it.each(["set", "clear"])(
  "confirms rich Docs link %s only after original-revision GET and exact style readback",
  async (operation) => {
    const f = fixture(["docs.edit"]),
      link = operation === "set" ? "https://example.test/" : null;
    f.http
      .mockResolvedValueOnce(Response.json(docs("A\n")))
      .mockResolvedValueOnce(Response.json(docs("A\n")))
      .mockResolvedValueOnce(Response.json({ documentId: "doc1" }))
      .mockResolvedValueOnce(
        Response.json(
          richDocs([
            { text: "😀x", style: { underline: false, ...(link ? { link: { url: link } } : {}) } },
            { text: "A\n" },
          ]),
        ),
      );
    await f.service.invoke(
      f.input("docs.edit", {
        documentId: "doc1",
        requiredRevisionId: "revision-1",
        edits: [{ kind: "insert", index: 1, text: "😀x", underline: false, link, tabId: "tab1" }],
      }),
      new AbortController().signal,
    );
    expect(f.repo.db.prepare("SELECT status FROM action_intents").all()).toEqual([
      expect.objectContaining({ status: "confirmed" }),
    ]);
    expect(f.http.mock.calls.map((call) => call[1]?.method)).toEqual(["GET", "GET", "POST", "GET"]);
  },
);
it.each([
  "missing-link",
  "wrong-link",
  "partial-link",
  "missing-underline",
  "wrong-underline",
  "clear-failed",
  "read-error",
])("leaves rich Docs %s readback uncertain and never replays it", async (failure) => {
  const f = fixture(["docs.edit"]),
    link = failure === "clear-failed" ? null : "https://example.test/";
  const good = { underline: false, link: { url: "https://example.test/" } };
  let parts: { text: string; style?: Record<string, unknown> }[] = [
    { text: "😀x", style: good },
    { text: "A\n" },
  ];
  if (failure === "missing-link") parts[0]!.style = { underline: false };
  if (failure === "wrong-link") parts[0]!.style = { ...good, link: { url: "https://wrong.test/" } };
  if (failure === "missing-underline") parts[0]!.style = { link: good.link };
  if (failure === "wrong-underline") parts[0]!.style = { ...good, underline: true };
  if (failure === "partial-link")
    parts = [{ text: "😀", style: good }, { text: "x", style: { underline: false } }, { text: "A\n" }];
  f.http
    .mockResolvedValueOnce(Response.json(docs("A\n")))
    .mockResolvedValueOnce(Response.json(docs("A\n")))
    .mockResolvedValueOnce(Response.json({ documentId: "doc1" }))
    .mockResolvedValueOnce(
      failure === "read-error"
        ? new Response("Unavailable", { status: 503 })
        : Response.json(richDocs(parts)),
    );
  const input = f.input("docs.edit", {
    documentId: "doc1",
    requiredRevisionId: "revision-1",
    edits: [{ kind: "insert", index: 1, text: "😀x", underline: false, link, tabId: "tab1" }],
  });
  await expect(f.service.invoke(input, new AbortController().signal)).rejects.toThrow();
  expect(f.repo.db.prepare("SELECT status FROM action_intents").all()).toEqual([
    expect.objectContaining({ status: "uncertain" }),
  ]);
  await expect(f.service.invoke(input, new AbortController().signal)).rejects.toMatchObject({
    code: "conflict",
  });
  expect(f.http.mock.calls.filter((call) => call[1]?.method === "POST")).toHaveLength(1);
});
it("refuses a rich edit if the original revision changes at the final pre-dispatch read", async () => {
  const f = fixture(["docs.edit"]);
  f.http
    .mockResolvedValueOnce(Response.json(docs("A\n")))
    .mockResolvedValueOnce(Response.json(docs("A\n", "retired-revision")));
  await expect(
    f.service.invoke(
      f.input("docs.edit", {
        documentId: "doc1",
        requiredRevisionId: "revision-1",
        edits: [{ kind: "insert", index: 1, text: "x", link: "https://example.test/", underline: true }],
      }),
      new AbortController().signal,
    ),
  ).rejects.toThrow();
  expect(f.http.mock.calls.filter((call) => call[1]?.method === "POST")).toHaveLength(0);
});

it.each([
  {
    operation: "gmail.thread",
    args: { threadId: "thread-fixture" },
    data: { id: "thread-fixture", messages: [{ id: "message-fixture", snippet: "Bounded original thread" }] },
  },
  {
    operation: "people.batch",
    args: { resourceNames: ["people/first", "people/unavailable"] },
    data: {
      responses: [
        {
          requestedResourceName: "people/first",
          person: { resourceName: "people/first", names: [{ displayName: "Fixture contact" }] },
        },
        { requestedResourceName: "people/unavailable", status: { code: 404, message: "Not found" } },
      ],
    },
  },
  {
    operation: "youtube.search",
    args: { query: "Fixture video", pageToken: "page-one" },
    data: {
      items: [{ id: { videoId: "abcdefghijk" }, snippet: { title: "Fixture video" } }],
      nextPageToken: "page-two",
    },
  },
  {
    operation: "youtube.videos",
    args: { videoIds: ["abcdefghijk"] },
    data: { items: [{ id: "abcdefghijk", contentDetails: { duration: "PT1M" } }] },
  },
  {
    operation: "youtube.comments",
    args: { videoId: "abcdefghijk", pageToken: "page-one" },
    data: { items: [{ id: "thread-one", snippet: { totalReplyCount: 2 } }], nextPageToken: "page-two" },
  },
  {
    operation: "youtube.replies",
    args: { parentId: "comment-parent", pageToken: "page-one" },
    data: {
      items: [{ id: "reply-one", snippet: { parentId: "comment-parent", textDisplay: "Fixture reply" } }],
      nextPageToken: "page-two",
    },
  },
] satisfies { operation: GoogleOperation; args: unknown; data: Record<string, unknown> }[])(
  "publishes $operation only with original account/task sources and preserves provider partial data",
  async ({ operation, args, data }) => {
    const f = fixture([operation]);
    f.http.mockImplementation(async (_url, init) => {
      expect(f.authorize).toHaveBeenCalledOnce();
      expect(init).toMatchObject({ method: "GET", redirect: "error" });
      expect(new Headers(init?.headers).get("authorization")).toBe("Bearer fixture-never-live");
      return Response.json(data);
    });
    const output = await f.service.invoke(f.input(operation, args), new AbortController().signal);
    expect(output.result).toEqual(data);
    expect(output).not.toHaveProperty("receiptId");
    expect(output.source).toMatchObject({
      connectionId: f.account.connectionId,
      accountRevision: f.account.revision,
      accountKey: f.account.accountKey,
      operation,
    });
    expect(f.authorize.mock.calls[0]![0]).toMatchObject({
      operation,
      effect: "read",
      taskId: f.task.taskId,
      taskRevision: f.task.revision,
      workspaceId: f.space.workspaceId,
      grantId: f.grant.grantId,
      source: f.account,
    });
    expect(f.http).toHaveBeenCalledOnce();
    expect(f.repo.db.prepare("SELECT count(*) AS count FROM action_intents").get()).toMatchObject({
      count: 0,
    });
  },
);

it("joins a paginated YouTube read to the same original grant and refuses a later task revision", async () => {
  const f = fixture(["youtube.comments"]);
  f.http
    .mockResolvedValueOnce(Response.json({ items: [{ id: "first" }], nextPageToken: "next-page" }))
    .mockResolvedValueOnce(Response.json({ items: [{ id: "second" }] }));
  const first = await f.service.invoke(
    f.input("youtube.comments", { videoId: "abcdefghijk" }),
    new AbortController().signal,
  );
  const second = await f.service.invoke(
    f.input("youtube.comments", { videoId: "abcdefghijk", pageToken: first.result.nextPageToken }),
    new AbortController().signal,
  );
  expect(second.result).toEqual({ items: [{ id: "second" }] });
  expect(
    f.authorize.mock.calls.every(
      ([input]) => input.grantId === f.grant.grantId && input.accountRevision === f.account.revision,
    ),
  ).toBe(true);
  await expect(
    f.service.invoke(
      { ...f.input("youtube.comments", { videoId: "abcdefghijk" }), taskRevision: f.task.revision + 1 },
      new AbortController().signal,
    ),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.http).toHaveBeenCalledTimes(2);
});

it("records and authorizes the exact Drive comment before its single write acknowledgement", async () => {
  const f = fixture(["docs.comment"]);
  const args = { documentId: "doc-fixture", content: "Reviewed comment", quotedText: "Exact source quote" };
  f.http.mockImplementation(async (_url, init) => {
    expect(f.repo.db.prepare("SELECT status FROM action_intents").get()).toMatchObject({ status: "pending" });
    expect(f.authorize.mock.calls[0]![0]).toMatchObject({
      operation: "docs.comment",
      effect: "write",
      source: f.account,
      request: { objectId: args.documentId },
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      content: args.content,
      quotedFileContent: { mimeType: "text/plain", value: args.quotedText },
    });
    return Response.json({ id: "comment-fixture", content: args.content });
  });
  const output = await f.service.invoke(f.input("docs.comment", args), new AbortController().signal);
  expect(output).toMatchObject({
    result: { id: "comment-fixture", content: args.content },
    source: { operation: "docs.comment", objectId: args.documentId },
  });
  expect(output.receiptId).toBeTypeOf("string");
  expect(f.repo.db.prepare("SELECT status FROM action_intents").get()).toMatchObject({ status: "confirmed" });
  expect(f.http).toHaveBeenCalledOnce();
});

it("keeps an unacknowledged Drive comment uncertain and does not retry the original write", async () => {
  const f = fixture(["docs.comment"]);
  f.http.mockResolvedValue(Response.json({ content: "No provider comment identity" }));
  await expect(
    f.service.invoke(
      f.input("docs.comment", { documentId: "doc-fixture", content: "Reviewed comment" }),
      new AbortController().signal,
    ),
  ).rejects.toThrow(/did not confirm/);
  expect(f.repo.db.prepare("SELECT status FROM action_intents").get()).toMatchObject({ status: "uncertain" });
  expect(f.http).toHaveBeenCalledOnce();
});

it("preserves a YouTube account access denial and withholds a People batch after account retirement", async () => {
  const denied = fixture(["youtube.comments"]);
  denied.http.mockResolvedValue(
    Response.json({ error: { message: "Fixture comments unavailable" } }, { status: 403 }),
  );
  await expect(
    denied.service.invoke(
      denied.input("youtube.comments", { videoId: "abcdefghijk" }),
      new AbortController().signal,
    ),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(denied.http).toHaveBeenCalledOnce();
  const retired = fixture(["people.batch"]);
  retired.http.mockImplementation(async () => {
    retired.account.revision = "b".repeat(64);
    return Response.json({
      responses: [
        { requestedResourceName: "people/first", person: { names: [{ displayName: "Late result" }] } },
      ],
    });
  });
  await expect(
    retired.service.invoke(
      retired.input("people.batch", { resourceNames: ["people/first"] }),
      new AbortController().signal,
    ),
  ).rejects.toThrow(/retired/);
  expect(retired.http).toHaveBeenCalledOnce();
  expect(retired.repo.db.prepare("SELECT status FROM operation_invocations").get()).toMatchObject({
    status: "failed",
  });
});

it.each(["paragraph", "list"] as const)(
  "dispatches revision-bound Docs %s formatting with exact reviewed bytes and independently confirmed structure",
  async (kind) => {
    const f = fixture(["docs.edit"]);
    const after = docs("A\n", "revision-2");
    if (kind === "paragraph")
      Object.assign(after.tabs[0]!.documentTab.body.content[1]!.paragraph!, {
        paragraphStyle: { namedStyleType: "HEADING_1", alignment: "CENTER" },
      });
    else {
      Object.assign(after.tabs[0]!.documentTab.body.content[1]!.paragraph!, {
        bullet: { listId: "actual-list" },
      });
      Object.assign(after.tabs[0]!.documentTab, {
        lists: {
          "actual-list": {
            listProperties: { nestingLevels: [{ glyphType: "DECIMAL", glyphFormat: "%0." }] },
          },
        },
      });
    }
    f.http
      .mockResolvedValueOnce(Response.json(docs("A\n")))
      .mockResolvedValueOnce(Response.json(docs("A\n")))
      .mockResolvedValueOnce(Response.json({ documentId: "doc1" }))
      .mockResolvedValueOnce(Response.json(after));
    const input = f.input("docs.edit", {
      documentId: "doc1",
      requiredRevisionId: "revision-1",
      edits: [
        {
          kind,
          tabId: "tab1",
          startIndex: 1,
          endIndex: 3,
          ...(kind === "paragraph"
            ? { namedStyleType: "HEADING_1", alignment: "CENTER" }
            : { preset: "NUMBERED_DECIMAL_ALPHA_ROMAN" }),
        },
      ],
    });
    const result = await f.service.invoke(input, new AbortController().signal);
    expect(result.result).toMatchObject({
      verification: {
        formatting: {
          truncated: false,
          paragraphs: [
            {
              tabId: "tab1",
              startIndex: 1,
              endIndex: 3,
              ...(kind === "paragraph"
                ? { paragraphStyle: { namedStyleType: "HEADING_1", alignment: "CENTER" } }
                : { bullet: { listId: "actual-list" } }),
            },
          ],
        },
      },
    });
    expect(f.http.mock.calls.map((call) => call[1]?.method)).toEqual(["GET", "GET", "POST", "GET"]);
    const approved = f.authorize.mock.calls.find(([input]) => input.request.method === "POST")![0];
    expect(approved.source.connectionId).toBe(f.account.connectionId);
    expect(approved.source.revision).toBe(f.account.revision);
    expect(approved.args).toEqual(input.args);
    expect(approved.request.body).toBe(f.http.mock.calls[2]![1]?.body);
    expect(f.repo.db.prepare("SELECT status FROM action_intents").get()).toMatchObject({
      status: "confirmed",
    });
  },
);
it.each(["paragraph", "list"] as const)(
  "keeps sent Docs %s formatting unverified and inspect-only when returned structure does not match",
  async (kind) => {
    const f = fixture(["docs.edit"]);
    f.http
      .mockResolvedValueOnce(Response.json(docs("A\n")))
      .mockResolvedValueOnce(Response.json(docs("A\n")))
      .mockResolvedValueOnce(Response.json({ documentId: "doc1" }))
      .mockResolvedValueOnce(Response.json(docs("A\n", "revision-2")));
    const input = f.input("docs.edit", {
      documentId: "doc1",
      requiredRevisionId: "revision-1",
      edits: [
        {
          kind,
          tabId: "tab1",
          startIndex: 1,
          endIndex: 3,
          ...(kind === "paragraph"
            ? { namedStyleType: "HEADING_1" }
            : { preset: "BULLET_DISC_CIRCLE_SQUARE" }),
        },
      ],
    });
    await expect(f.service.invoke(input, new AbortController().signal)).rejects.toMatchObject({
      code: "conflict",
    });
    expect(f.repo.db.prepare("SELECT status FROM action_intents").get()).toMatchObject({
      status: "uncertain",
    });
    await expect(f.service.invoke(input, new AbortController().signal)).rejects.toMatchObject({
      code: "conflict",
    });
    expect(f.http.mock.calls.filter((call) => call[1]?.method === "POST")).toHaveLength(1);
  },
);

function observedTableDocument(columns = 1) {
  return {
    documentId: "doc1",
    revisionId: "revision-2",
    tabs: [
      {
        tabProperties: { tabId: "tab1" },
        documentTab: {
          body: {
            content: [
              { startIndex: 0, endIndex: 1, sectionBreak: {} },
              {
                startIndex: 1,
                endIndex: 2,
                paragraph: {
                  elements: [{ startIndex: 1, endIndex: 2, textRun: { content: "\n", textStyle: {} } }],
                },
              },
              {
                startIndex: 2,
                endIndex: 8,
                table: {
                  rows: 1,
                  columns,
                  tableRows: [
                    {
                      startIndex: 3,
                      endIndex: 7,
                      tableCells: [
                        {
                          startIndex: 4,
                          endIndex: 7,
                          tableCellStyle: { rowSpan: 1, columnSpan: 1 },
                          content: [
                            {
                              startIndex: 5,
                              endIndex: 6,
                              paragraph: {
                                elements: [
                                  { startIndex: 5, endIndex: 6, textRun: { content: "\n", textStyle: {} } },
                                ],
                              },
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
              {
                startIndex: 8,
                endIndex: 10,
                paragraph: {
                  elements: [
                    { startIndex: 8, endIndex: 10, textRun: { content: "A\n", textStyle: { bold: false } } },
                  ],
                },
              },
            ],
          },
        },
      },
    ],
  };
}
function tableWriteFixture(columns: number) {
  const f = fixture(["docs.edit"]);
  f.http
    .mockResolvedValueOnce(Response.json(docs("A\n")))
    .mockResolvedValueOnce(Response.json(docs("A\n")))
    .mockResolvedValueOnce(Response.json({ documentId: "doc1" }))
    .mockResolvedValueOnce(Response.json(observedTableDocument(columns)));
  const input = f.input("docs.edit", {
    documentId: "doc1",
    requiredRevisionId: "revision-1",
    edits: [{ kind: "table", tabId: "tab1", index: 1, rows: 1, columns: 1 }],
  });
  return { ...f, originalInput: input };
}
it("confirms an empty Docs table only from independently matching actual structure", async () => {
  const f = tableWriteFixture(1);
  await f.service.invoke(f.originalInput, new AbortController().signal);
  expect(f.repo.db.prepare("SELECT status FROM action_intents").get()).toMatchObject({ status: "confirmed" });
  expect(f.http.mock.calls.filter((call) => call[1]?.method === "POST")).toHaveLength(1);
  expect(JSON.parse(String(f.http.mock.calls.find((call) => call[1]?.method === "POST")![1]?.body))).toEqual({
    writeControl: { requiredRevisionId: "revision-1" },
    requests: [{ insertTable: { location: { index: 1, tabId: "tab1" }, rows: 1, columns: 1 } }],
  });
});
it("retains an unverified Docs table as uncertain and does not replay insertion", async () => {
  const f = tableWriteFixture(2);
  await expect(f.service.invoke(f.originalInput, new AbortController().signal)).rejects.toMatchObject({
    code: "conflict",
  });
  expect(f.repo.db.prepare("SELECT status FROM action_intents").get()).toMatchObject({ status: "uncertain" });
  await expect(f.service.invoke(f.originalInput, new AbortController().signal)).rejects.toMatchObject({
    code: "conflict",
  });
  expect(f.http.mock.calls.filter((call) => call[1]?.method === "POST")).toHaveLength(1);
});

it.each(["document-title", "tab-title", "section-style"] as const)(
  "keeps a Docs alignment write uncertain when independent readback changes unrelated %s",
  async (field) => {
    const f = fixture(["docs.edit"]);
    const source = docs("A\n");
    Object.assign(source, { title: "Original document" });
    Object.assign(source.tabs[0]!.tabProperties, { title: "Original tab", index: 0 });
    Object.assign(source.tabs[0]!.documentTab.body.content[0]!.sectionBreak!, {
      sectionStyle: { sectionType: "CONTINUOUS" },
    });
    const after = structuredClone(source);
    after.revisionId = "revision-2";
    Object.assign(after.tabs[0]!.documentTab.body.content[1]!.paragraph!, {
      paragraphStyle: { alignment: "CENTER" },
    });
    if (field === "document-title") Object.assign(after, { title: "Unapproved document" });
    if (field === "tab-title") Object.assign(after.tabs[0]!.tabProperties, { title: "Unapproved tab" });
    if (field === "section-style")
      Object.assign(after.tabs[0]!.documentTab.body.content[0]!.sectionBreak!, {
        sectionStyle: { sectionType: "NEXT_PAGE" },
      });
    f.http
      .mockResolvedValueOnce(Response.json(source))
      .mockResolvedValueOnce(Response.json(source))
      .mockResolvedValueOnce(Response.json({ documentId: "doc1" }))
      .mockResolvedValueOnce(Response.json(after));
    const input = f.input("docs.edit", {
      documentId: "doc1",
      requiredRevisionId: "revision-1",
      edits: [{ kind: "paragraph", tabId: "tab1", startIndex: 1, endIndex: 3, alignment: "CENTER" }],
    });
    await expect(f.service.invoke(input, new AbortController().signal)).rejects.toMatchObject({
      code: "conflict",
    });
    expect(f.repo.db.prepare("SELECT status FROM action_intents").get()).toMatchObject({
      status: "uncertain",
    });
    await expect(f.service.invoke(input, new AbortController().signal)).rejects.toMatchObject({
      code: "conflict",
    });
    expect(f.http.mock.calls.filter((call) => call[1]?.method === "POST")).toHaveLength(1);
  },
);

function governGoogle(f: ReturnType<typeof fixture>, grantIds = [f.grant.grantId]) {
  const run = f.repo.getRun(f.input().runId)!;
  f.repo.saveRun({
    ...run,
    config: { ...run.config, googleGrantIds: grantIds, nativeTurnContext: randomUUID() },
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
  const decisions = vi.fn<Parameters<typeof googleAuthorizer>[0]["decide"]>((request, options) =>
    decide(request, policy, { phase: "dispatch", runId: request.runId, ...options }),
  );
  f.authorize.mockImplementation(
    googleAuthorizer({
      repo: f.repo,
      profileId: "disposable-google-fixture",
      privateProfile: false,
      closed: () => false,
      grants: f.grants,
      gate: new SafetyDispatchGate({ ...policy, suspensions }),
      decide: decisions,
    }),
  );
  return { ...f, approvals, suspensions, decisions };
}

async function approveGoogle(f: ReturnType<typeof governGoogle>, input: GoogleInvoke) {
  const originalIntents = f.repo.db.prepare("SELECT id,status FROM action_intents ORDER BY rowid").all();
  await expect(f.service.invoke(input, new AbortController().signal)).rejects.toMatchObject({
    code: "needs_input",
    detail: { park: { kind: "approval" } },
  });
  expect(f.repo.db.prepare("SELECT id,status FROM action_intents ORDER BY rowid").all()).toEqual(
    originalIntents,
  );
  const pending = f.approvals.pending(input.runId);
  expect(pending).toHaveLength(1);
  const original = pending[0]!;
  expect(original.action).toMatchObject({
    runId: input.runId,
    scope: { kind: "task", id: f.task.taskId },
    reviewedActions: [{ action: input.operation }],
  });
  expect(f.suspensions.pending(input.runId)?.request.approvalId).toBe(original.approvalId);
  f.approvals.decideLocal({ approvalId: original.approvalId, decision: "accept" }, input.runId);
  f.suspensions.resolve(f.suspensions.pending(input.runId)!.suspensionId, "answered");
  return original;
}

const draftBytesHash = (raw: string) =>
  createHash("sha256").update(Buffer.from(raw, "base64url")).digest("hex");

it("creates, reads, updates and sends the same original Gmail draft using separately granted drafting and sending and one-use reviewed actions", async () => {
  const base = fixture(["gmail.draft.create", "gmail.draft.read", "gmail.draft.update", "gmail.draft.send"]);
  base.grants.revoke(base.task.taskId, base.grant.grantId);
  const grant = (operations: GoogleOperation[]) =>
    base.grants.create({
      taskId: base.task.taskId,
      taskRevision: base.task.revision,
      workspaceId: base.space.workspaceId,
      connectionId: base.account.connectionId,
      accountRevision: base.account.revision,
      operations,
    });
  const drafting = grant(["gmail.draft.create", "gmail.draft.read", "gmail.draft.update"]);
  const sending = grant(["gmail.draft.send"]);
  const f = governGoogle(base, [drafting.grantId, sending.grantId]);
  let raw = "";
  const sent: {
    method: string;
    body: Record<string, unknown>;
    pending: unknown;
    authorization: string | null;
  }[] = [];
  f.http.mockImplementation(async (_url, init) => {
    if (init?.method === "GET")
      return Response.json({ id: "draft-original", message: { id: "draft-message", raw } });
    const body = JSON.parse(String(init?.body));
    sent.push({
      method: init!.method!,
      body,
      pending: f.repo.db.prepare("SELECT status FROM action_intents ORDER BY rowid DESC LIMIT 1").get(),
      authorization: new Headers(init?.headers).get("authorization"),
    });
    if (body.message?.raw) {
      raw = body.message.raw;
      return Response.json({
        id: "draft-original",
        message: { id: "draft-message", threadId: "original-thread" },
      });
    }
    return Response.json({ id: "sent-original", threadId: "original-thread" });
  });
  const originalMessage = {
    to: ["recipient@example.test"],
    subject: "Reviewed draft",
    text: "Original reviewed body",
  };
  const create = { ...f.input("gmail.draft.create", originalMessage), grantId: drafting.grantId };
  const createApproval = await approveGoogle(f, create);
  const created = await f.service.invoke(create, new AbortController().signal);
  const read = { ...f.input("gmail.draft.read", { draftId: "draft-original" }), grantId: drafting.grantId };
  const originalRead = await f.service.invoke(read, new AbortController().signal);
  const originalRaw = (originalRead.result.message as { raw: string }).raw;
  expect(originalRead.source).toMatchObject({
    connectionId: f.account.connectionId,
    accountRevision: f.account.revision,
    objectId: "draft-original",
    operation: "gmail.draft.read",
  });
  expect(originalRead).not.toHaveProperty("receiptId");
  const updatedMessage = { ...originalMessage, text: "Updated reviewed body" };
  const update = {
    ...f.input("gmail.draft.update", {
      draftId: "draft-original",
      expectedMessageSha256: draftBytesHash(originalRaw),
      message: updatedMessage,
    }),
    grantId: drafting.grantId,
  };
  const updateApproval = await approveGoogle(f, update);
  const updated = await f.service.invoke(update, new AbortController().signal);
  const latestRead = await f.service.invoke(
    { ...read, actionId: randomUUID() },
    new AbortController().signal,
  );
  const send = f.input("gmail.draft.send", {
    draftId: "draft-original",
    expectedMessageSha256: draftBytesHash((latestRead.result.message as { raw: string }).raw),
  });
  const beforeUnauthorizedSend = f.http.mock.calls.length;
  await expect(
    f.service.invoke({ ...send, grantId: drafting.grantId }, new AbortController().signal),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.http).toHaveBeenCalledTimes(beforeUnauthorizedSend);
  const sendInput = { ...send, grantId: sending.grantId };
  const sendApproval = await approveGoogle(f, sendInput);
  const result = await f.service.invoke(sendInput, new AbortController().signal);
  expect(sent).toHaveLength(3);
  expect(sent.map(({ method, pending, authorization }) => ({ method, pending, authorization }))).toEqual([
    { method: "POST", pending: { status: "pending" }, authorization: "Bearer fixture-never-live" },
    { method: "PUT", pending: { status: "pending" }, authorization: "Bearer fixture-never-live" },
    { method: "POST", pending: { status: "pending" }, authorization: "Bearer fixture-never-live" },
  ]);
  expect(sent[2]!.body).toEqual({ id: "draft-original" });
  expect(Buffer.from((sent[0]!.body.message as { raw: string }).raw, "base64url").toString()).toContain(
    Buffer.from(originalMessage.text).toString("base64"),
  );
  expect(Buffer.from((sent[1]!.body.message as { raw: string }).raw, "base64url").toString()).toContain(
    Buffer.from(updatedMessage.text).toString("base64"),
  );
  expect(createApproval.action.reviewedActions?.[0]?.arguments).toContain("Original reviewed body");
  expect(updateApproval.action.reviewedActions?.[0]?.arguments).toContain("Updated reviewed body");
  expect(sendApproval.action.recipient).toBe(`${f.account.connectionId}:draft-original`);
  expect([created, updated, result].map((output) => output.receiptId)).toEqual([
    expect.any(String),
    expect.any(String),
    expect.any(String),
  ]);
  expect(result).toMatchObject({
    result: { id: "sent-original", threadId: "original-thread" },
    source: {
      accountKey: f.account.accountKey,
      connectionId: f.account.connectionId,
      accountRevision: f.account.revision,
      objectId: "draft-original",
      operation: "gmail.draft.send",
    },
  });
  expect(f.repo.db.prepare("SELECT status FROM action_intents ORDER BY rowid").all()).toEqual([
    { status: "confirmed" },
    { status: "confirmed" },
    { status: "confirmed" },
  ]);
  expect(f.repo.db.prepare("SELECT state FROM safety_approval_requests ORDER BY rowid").all()).toEqual([
    { state: "consumed" },
    { state: "consumed" },
    { state: "consumed" },
  ]);
});

it.each(["gmail.draft.update", "gmail.draft.send"] as const)(
  "refuses $0 when the original draft changes after actual review without sending replacement bytes",
  async (operation) => {
    const f = governGoogle(fixture([operation]));
    let raw = Buffer.from("To: original@example.test\r\n\r\nOriginal draft").toString("base64url");
    f.http.mockImplementation(async () => Response.json({ id: "draft-original", message: { raw } }));
    const args = {
      draftId: "draft-original",
      expectedMessageSha256: draftBytesHash(raw),
      ...(operation === "gmail.draft.update"
        ? { message: { to: ["recipient@example.test"], subject: "Updated", text: "Reviewed update" } }
        : {}),
    };
    const input = f.input(operation, args);
    await approveGoogle(f, input);
    raw = Buffer.from("To: different@example.test\r\n\r\nOwner changed the draft").toString("base64url");
    await expect(f.service.invoke(input, new AbortController().signal)).rejects.toMatchObject({
      code: "conflict",
    });
    expect(f.http.mock.calls.every(([, init]) => init?.method === "GET")).toBe(true);
    expect(f.repo.db.prepare("SELECT count(*) AS n FROM action_intents").get()).toEqual({ n: 0 });
  },
);

const gridWrites = [
  {
    operation: "sheets.format",
    args: {
      spreadsheetId: "original-sheet",
      sheetId: 7,
      startRowIndex: 1,
      endRowIndex: 2,
      startColumnIndex: 2,
      endColumnIndex: 4,
      bold: true,
    },
    fields: "userEnteredFormat.textFormat.bold",
    gridRange: { sheetId: 7, startRowIndex: 1, endRowIndex: 2, startColumnIndex: 2, endColumnIndex: 4 },
    observed: {
      sheets: [
        {
          properties: { sheetId: 7 },
          data: [
            {
              startRow: 1,
              startColumn: 2,
              rowData: [
                {
                  values: [
                    {
                      note: "Keep first note",
                      userEnteredFormat: {
                        textFormat: { bold: true, italic: true },
                        numberFormat: { type: "NUMBER", pattern: "0.00" },
                      },
                    },
                    {
                      note: "Keep second note",
                      userEnteredFormat: { textFormat: { bold: true, italic: false } },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    operation: "sheets.notes",
    args: {
      spreadsheetId: "original-sheet",
      sheetId: 7,
      rowIndex: 3,
      columnIndex: 4,
      note: "Exact reviewed note",
    },
    fields: "note",
    gridRange: { sheetId: 7, startRowIndex: 3, endRowIndex: 4, startColumnIndex: 4, endColumnIndex: 5 },
    observed: {
      sheets: [
        {
          properties: { sheetId: 7 },
          data: [
            {
              startRow: 3,
              startColumn: 4,
              rowData: [
                {
                  values: [
                    {
                      note: "Exact reviewed note",
                      userEnteredFormat: {
                        textFormat: { bold: false },
                        numberFormat: { type: "NUMBER", pattern: "0.00" },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
] satisfies {
  operation: GoogleOperation;
  args: Record<string, unknown>;
  fields: string;
  gridRange: Record<string, number>;
  observed: Record<string, unknown>;
}[];

it.each(gridWrites)(
  "confirms $operation only after original approval, one field-bounded write and independent original-grid readback",
  async ({ operation, args, fields, gridRange, observed }) => {
    const f = governGoogle(fixture([operation]));
    const input = f.input(operation, args);
    const original = await approveGoogle(f, input);
    f.http
      .mockResolvedValueOnce(Response.json({ spreadsheetId: "original-sheet", replies: [{}] }))
      .mockResolvedValueOnce(Response.json(observed));
    const result = await f.service.invoke(input, new AbortController().signal);
    expect(f.http).toHaveBeenCalledTimes(2);
    const write = JSON.parse(String(f.http.mock.calls[0]![1]?.body)).requests[0];
    const change = write.repeatCell ?? write.updateCells;
    expect(change).toMatchObject({ range: gridRange, fields });
    expect(Object.keys(write)).toHaveLength(1);
    expect(new URL(String(f.http.mock.calls[0]![0])).pathname).toBe(
      "/v4/spreadsheets/original-sheet:batchUpdate",
    );
    const verification = f.http.mock.calls[1]!;
    expect(new URL(String(verification[0])).pathname).toBe("/v4/spreadsheets/original-sheet:getByDataFilter");
    expect(JSON.parse(String(verification[1]?.body))).toEqual({
      dataFilters: [{ gridRange }],
      includeGridData: true,
    });
    expect(original.action.recipient).toBe(`${f.account.connectionId}:original-sheet`);
    expect(original.action.reviewedActions?.[0]?.arguments).toBe(JSON.stringify(args));
    expect(result.source).toMatchObject({
      connectionId: f.account.connectionId,
      accountRevision: f.account.revision,
      accountKey: f.account.accountKey,
      operation,
      objectId: "original-sheet",
    });
    expect(f.repo.db.prepare("SELECT id,status,evidence FROM action_intents").get()).toMatchObject({
      id: result.receiptId,
      status: "confirmed",
      evidence: JSON.stringify({
        operation,
        requestDigest: original.action.invocationDigest,
        providerObjectId: "original-sheet",
        verificationSha256: createHash("sha256").update(JSON.stringify(observed)).digest("hex"),
      }),
    });
    expect(f.repo.db.prepare("SELECT state FROM safety_approval_requests").get()).toEqual({
      state: "consumed",
    });
  },
);

it.each(gridWrites)(
  "withholds $operation results and retains uncertainty when original account retires during independent readback",
  async ({ operation, args, observed }) => {
    const f = governGoogle(fixture([operation]));
    const input = f.input(operation, args);
    await approveGoogle(f, input);
    f.http
      .mockResolvedValueOnce(Response.json({ spreadsheetId: "original-sheet", replies: [{}] }))
      .mockImplementationOnce(async () => {
        f.account.revision = "b".repeat(64);
        return Response.json(observed);
      });
    await expect(f.service.invoke(input, new AbortController().signal)).rejects.toThrow();
    expect(f.http).toHaveBeenCalledTimes(2);
    expect(f.repo.db.prepare("SELECT status FROM action_intents").get()).toEqual({ status: "uncertain" });
    expect(
      f.repo.db
        .prepare("SELECT status,effect_outcome FROM operation_invocations ORDER BY rowid DESC LIMIT 1")
        .get(),
    ).toEqual({ status: "failed", effect_outcome: "unknown" });
  },
);

it.each(gridWrites)(
  "does not confirm or replay $operation when readback identifies a different original grid",
  async ({ operation, args, observed }) => {
    const f = governGoogle(fixture([operation]));
    const input = f.input(operation, args);
    await approveGoogle(f, input);
    const mismatched = structuredClone(observed) as { sheets: { properties: { sheetId: number } }[] };
    mismatched.sheets[0]!.properties.sheetId = 8;
    f.http
      .mockResolvedValueOnce(Response.json({ spreadsheetId: "original-sheet", replies: [{}] }))
      .mockResolvedValueOnce(Response.json(mismatched));
    await expect(f.service.invoke(input, new AbortController().signal)).rejects.toThrow(
      "resulting range could not be verified",
    );
    expect(f.repo.db.prepare("SELECT status FROM action_intents").get()).toEqual({ status: "uncertain" });
    expect(f.http).toHaveBeenCalledTimes(2);
    const replacement = { ...input, actionId: randomUUID() };
    await approveGoogle(f, replacement);
    await expect(f.service.invoke(replacement, new AbortController().signal)).rejects.toMatchObject({
      code: "conflict",
    });
    expect(f.http).toHaveBeenCalledTimes(2);
  },
);
