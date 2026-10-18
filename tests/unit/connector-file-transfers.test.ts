import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { AuxError, type Run } from "@aux/contracts";
import {
  createMcpTransportProvider,
  DurableWriteLedger,
  EventBus,
  openDb,
  OutboundMcpService,
  Repo,
  TaskService,
} from "@aux/runtime";
import { FieldCodec } from "../../apps/runtime/src/store/field-codec.js";
import { ArtifactStore } from "../../apps/runtime/src/services/artifacts.js";
import {
  ConnectorFileTransfers,
  type ConnectorUploadEffect,
  type ConnectorUploadAuthorization,
} from "../../apps/runtime/src/services/connector-file-transfers.js";
import {
  prepareConnectorUpload,
  type ConnectorUploadSender,
} from "../../apps/runtime/src/services/connector-upload-network.js";
import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import { ConversationDocuments } from "../../apps/runtime/src/services/conversation-documents.js";
import { captureOriginalPdf } from "../support/pdf-original.js";
import { profileSecrets } from "../support/profile-secrets.js";
const cleanup: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
});
const notionOutputSchema = {
  type: "object",
  properties: {
    upload_url: { type: "string" },
    upload_method: { const: "POST" },
    upload_headers: { type: "object", additionalProperties: { type: "string" } },
    upload_form_field: { type: "string" },
    file_upload_id: { type: "string" },
  },
  required: ["upload_url", "upload_method", "upload_headers", "upload_form_field"],
};
/** Synthetic discovered schemas prove the supported wire shape, not a live Notion server's current schema. */
async function fixture(provider: "slack" | "notion" = "slack", notionSchema = true) {
  const dir = mkdtempSync(join(tmpdir(), "aux-mcp-bytes-"));
  const codec = await FieldCodec.create(
    profileSecrets("mcp-upload-fixture").native,
    "mcp-upload-fixture",
    true,
  );
  const repo = new Repo(openDb(":memory:"), codec);
  const events = new EventBus(repo),
    tasks = new TaskService(repo, events);
  const space = tasks.createWorkspace("Synthetic file workflow"),
    task = tasks.create({
      workspaceId: space.workspaceId,
      title: "Reviewed file",
      objective: "Upload this exact fixture only",
      criteria: [{ criterionId: "done", description: "Receipt", verification: "manual" }],
    });
  const run: Run = {
    runId: "original-transfer-run",
    goal: "Send reviewed fixture bytes",
    status: "running",
    pageIds: [],
    createdAt: 1,
    config: { taskId: task.taskId, taskRevision: task.revision, contextWorkspaceId: space.workspaceId },
  };
  repo.saveRun(run);
  const documents = new DocumentSnapshots(repo),
    attachments = new ConversationDocuments(repo, documents);
  const capture = captureOriginalPdf(180);
  capture.document.filename = "reviewed.pdf";
  await attachments.importDocument(run.runId, capture.input, capture.source, {
    signal: new AbortController().signal,
    checkCurrent() {},
  });
  run.config = { ...run.config, contextAttachmentRefs: attachments.references(run.runId) };
  repo.saveRun(run);
  const selected = run.config.contextAttachmentRefs![0]!;
  const reference = { kind: "attachment" as const, attachmentId: selected.attachmentId };
  const artifacts = new ArtifactStore(dir, repo, events),
    bytes = capture.bytes;
  const source = artifacts.save({
    runId: run.runId,
    buffer: bytes,
    label: "reviewed.pdf",
    mediaType: "application/pdf",
  });
  let heldCatalog: { started(): void; finished: boolean } | undefined;
  let epoch = 0,
    loseCompletion = false,
    unsupportedAllocation = false;
  const calls: { name: string; arguments: Record<string, unknown> }[] = [],
    phases: string[] = [];
  const network = vi.fn<typeof fetch>(async (input, init) => {
    expect(String(input instanceof Request ? input.url : input)).toBe(`https://mcp.${provider}.com/mcp`);
    expect(init?.redirect).toBe("error");
    if (init?.method === "GET") return new Response(null, { status: 405 });
    const body = JSON.parse(String(init?.body));
    if (body.id === undefined) return new Response(null, { status: 202 });
    let result: unknown;
    if (body.method === "initialize")
      result = {
        protocolVersion: body.params.protocolVersion,
        capabilities: { tools: {} },
        serverInfo: { name: provider, version: "fixture" },
      };
    else if (body.method === "tools/list") {
      if (heldCatalog) {
        const held = heldCatalog,
          signal = init?.signal;
        if (!signal) throw new Error("Original catalog transport has no cancellation signal");
        held.started();
        try {
          await new Promise<void>((_resolve, reject) => {
            const abort = () => reject(signal.reason);
            signal.addEventListener("abort", abort, { once: true });
            if (signal.aborted) abort();
          });
        } finally {
          held.finished = true;
        }
      }
      result = {
        tools: (provider === "slack"
          ? ["slack_get_file_upload_url", "slack_complete_file_upload"]
          : ["notion-create-file-upload"]
        ).map((name) => ({
          name,
          inputSchema: {
            type: "object",
            properties: { filename: { type: "string" }, content_type: { type: "string" } },
          },
          ...(provider === "notion" && notionSchema ? { outputSchema: notionOutputSchema } : {}),
        })),
      };
    } else if (body.method === "tools/call") {
      calls.push(structuredClone(body.params));
      phases.push(body.params.name);
      if (body.params.name === "slack_complete_file_upload") {
        if (loseCompletion) throw new Error("Completion response lost after dispatch");
        result = { content: [], structuredContent: { ok: true, files: [{ id: "F_FIXTURE" }] } };
      } else
        result = {
          content: [],
          structuredContent:
            provider === "slack"
              ? {
                  ok: true,
                  file_id: "F_FIXTURE",
                  upload_url: "https://files.slack.com/upload/synthetic-signed-path",
                }
              : unsupportedAllocation
                ? { unsupported: "not an upload instruction" }
                : {
                    upload_url: "https://uploads.notion.so/synthetic-signed-path",
                    upload_method: "POST",
                    upload_headers: { "x-upload-proof": "synthetic-signed-value" },
                    upload_form_field: "file",
                    file_upload_id: "fixture-file",
                  },
        };
    } else throw new Error(`Unexpected fixture method ${body.method}`);
    return Response.json({ jsonrpc: "2.0", id: body.id, result });
  });
  const mcp = new OutboundMcpService(
    repo,
    createMcpTransportProvider(
      { authorizationGeneration: () => epoch, token: async () => "synthetic-fixture-token" },
      network,
    ),
    () => epoch,
  );
  const server = await mcp.register({
    workspaceId: space.workspaceId,
    name: provider,
    source: { kind: "remote", auth: "oauth", url: `https://mcp.${provider}.com/mcp` },
  });
  await mcp.listTools(server.serverId);
  let ownerIdentity = createHash("sha256").update("original-fixture-control-and-signal").digest("hex");
  const captured = mcp.get(server.serverId),
    control = new AbortController();
  const checkCurrent = vi.fn(() => {
    control.signal.throwIfAborted();
  });
  const checkConnector = vi.fn(() => {
    if (
      mcp.get(server.serverId).sourceDigest !== captured.sourceDigest ||
      mcp.get(server.serverId).toolsRevision !== captured.toolsRevision
    )
      throw new AuxError("permission_denied", "Original catalog retired");
  });
  const effects: ConnectorUploadEffect[] = [];
  let authorize: (effect: ConnectorUploadEffect) => Promise<ConnectorUploadAuthorization> = async () => ({
    state: "allowed",
    checkCurrent,
  });
  const sent: { body: Buffer; headers: Record<string, string>; url: string }[] = [];
  let send: ConnectorUploadSender = async (request, signal, check, dispatch) => {
    signal.throwIfAborted();
    check();
    dispatch();
    sent.push({ body: Buffer.from(request.body), headers: { ...request.headers }, url: request.url.href });
    phases.push("byte-post");
    return {
      status: 200,
      body:
        provider === "slack"
          ? "ok"
          : JSON.stringify({ suggested_markdown: "[reviewed.pdf](attachment:fixture-file)" }),
    };
  };
  const writes = new DurableWriteLedger(repo.db);
  const service = new ConnectorFileTransfers({
    repo,
    documents,
    attachments,
    mcp,
    writes,
    owner: () => ({ identity: ownerIdentity, run, signal: control.signal, checkCurrent }),
    checkConnector,
    authorize: async (effect) => {
      effects.push(structuredClone(effect));
      return authorize(effect);
    },
    send: (...args) => send(...args),
  });
  const start = () =>
    service.invoke(run.runId, {
      action: "start",
      serverId: server.serverId,
      reference,
      ...(provider === "slack"
        ? { slack: { channelId: "C_FIXTURE", initialComment: "Exact reviewed comment" } }
        : {}),
    });
  cleanup.push(() => {
    repo.close();
    rmSync(dir, { recursive: true, force: true });
  });
  cleanup.push(() => documents.close());
  cleanup.push(() => service.close());
  return {
    dir,
    repo,
    service,
    mcp,
    run,
    source,
    bytes,
    writes,
    server,
    calls,
    phases,
    sent,
    effects,
    start,
    control,
    holdCatalog: () => {
      let start!: () => void;
      const started = new Promise<void>((resolve) => {
        start = resolve;
      });
      const held = { started: start, finished: false };
      heldCatalog = held;
      return { started, joined: () => held.finished };
    },
    replaceOwner: () => {
      ownerIdentity = createHash("sha256").update("replacement-fixture-control-and-signal").digest("hex");
    },
    artifacts,
    documents,
    attachments,
    reference,
    setAuthorize: (value: typeof authorize) => {
      authorize = value;
    },
    setSend: (value: ConnectorUploadSender) => {
      send = value;
    },
    retireCredential: () => {
      epoch++;
      mcp.invalidateAuthorization(server.serverId);
    },
    loseCompletion: () => {
      loseCompletion = true;
    },
    unsupportedAllocation: () => {
      unsupportedAllocation = true;
    },
  };
}
it("POSTs exact immutable Slack bytes before completing the original file and retains durable phase receipts", async () => {
  const f = await fixture();
  const result = await f.start();
  expect(result).toMatchObject({
    state: "completed",
    fileId: "F_FIXTURE",
    source: { sha256: createHash("sha256").update(f.bytes).digest("hex") },
  });
  expect(f.phases).toEqual(["slack_get_file_upload_url", "byte-post", "slack_complete_file_upload"]);
  expect(f.sent[0]!.body).toEqual(f.bytes);
  expect(f.sent[0]!.headers).toEqual({
    "content-type": "application/pdf",
    "content-length": String(f.bytes.length),
  });
  expect(f.calls[1]!.arguments).toEqual({
    files: [{ id: "F_FIXTURE", title: "reviewed.pdf" }],
    channel_id: "C_FIXTURE",
    initial_comment: "Exact reviewed comment",
  });
  expect(readFileSync(f.source.path)).toEqual(f.bytes);
  expect(f.repo.db.prepare("SELECT status FROM action_intents ORDER BY rowid").all()).toEqual([
    { status: "confirmed" },
    { status: "confirmed" },
    { status: "confirmed" },
  ]);
  const encrypted = String(f.repo.db.prepare("SELECT body FROM connector_file_transfers").get()!.body);
  expect(encrypted).not.toContain("synthetic-signed-path");
  expect(encrypted).not.toContain("reviewed.pdf");
  await f.start();
  expect(f.calls).toHaveLength(2);
  expect(f.sent).toHaveLength(1);
});
it("encodes the supported discovered Notion multipart shape and reports upload acknowledgement rather than a page write", async () => {
  const f = await fixture("notion");
  expect(await f.start()).toMatchObject({
    state: "uploaded",
    suggestedMarkdown: "[reviewed.pdf](attachment:fixture-file)",
  });
  const request = f.sent[0]!;
  const boundary = request.headers["content-type"]!.split("boundary=")[1]!;
  expect(request.body).toEqual(
    Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="reviewed.pdf"\r\nContent-Type: application/pdf\r\n\r\n`,
      ),
      f.bytes,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]),
  );
  expect(request.headers["x-upload-proof"]).toBe("synthetic-signed-value");
  expect(request.headers.authorization).toBeUndefined();
  expect(f.calls.map((call) => call.name)).toEqual(["notion-create-file-upload"]);
});
it("does not fabricate Notion schema support or transfer bytes for an unknown allocation response", async () => {
  const absent = await fixture("notion", false);
  await expect(absent.start()).rejects.toMatchObject({ code: "capability_unsupported" });
  expect(absent.calls).toHaveLength(0);
  expect(absent.sent).toHaveLength(0);
  const unknown = await fixture("notion");
  unknown.unsupportedAllocation();
  const result = await unknown.start();
  expect(result).toMatchObject({ state: "failed", allocationCallId: expect.any(String) });
  expect(unknown.sent).toHaveLength(0);
});
it("parks and resumes the same sealed byte POST without reallocating or changing the approval digest", async () => {
  const f = await fixture();
  let accepted = false;
  let digest: string | undefined;
  f.setAuthorize(async (effect) => {
    if (effect.job.phase !== "upload" || accepted) return { state: "allowed", checkCurrent() {} };
    digest = effect.digest;
    return {
      state: "waiting",
      approvalId: "original-approval",
      identity: "a".repeat(64),
      park: {
        kind: "approval",
        approvalId: "original-approval",
        instruction: "Review exact fixture bytes",
      },
    };
  });
  expect(await f.start()).toHaveProperty("park");
  expect(f.sent).toHaveLength(0);
  const job = f.service.store.list(f.run.runId)[0]!;
  expect(job.state).toBe("waiting");
  accepted = true;
  expect(await f.start()).toMatchObject({ transferId: job.transferId, state: "completed" });
  expect(f.effects.filter((effect) => effect.job.phase === "upload").map((effect) => effect.digest)).toEqual([
    digest,
    digest,
  ]);
  expect(f.calls).toHaveLength(2);
});
it.each(["upload", "completion"] as const)(
  "keeps a lost %s inspect-only across new calls/jobs and the existing task barrier",
  async (phase) => {
    const f = await fixture();
    if (phase === "upload")
      f.setSend(async (_request, _signal, _check, dispatch) => {
        dispatch();
        throw new Error("Response lost after byte dispatch");
      });
    else f.loseCompletion();
    const result = await f.start();
    expect(result).toMatchObject({ state: "uncertain", phase });
    const calls = f.calls.length;
    await f.start();
    expect(f.calls).toHaveLength(calls);
    expect(f.writes.unresolved(f.run.runId)).toHaveLength(1);
    const second = captureOriginalPdf(190);
    await f.attachments.importDocument(f.run.runId, second.input, second.source, {
      signal: new AbortController().signal,
      checkCurrent() {},
    });
    f.run.config = { ...f.run.config, contextAttachmentRefs: f.attachments.references(f.run.runId) };
    f.repo.saveRun(f.run);
    const secondRef = f.run.config.contextAttachmentRefs!.at(-1)!;
    expect(
      await f.service.invoke(f.run.runId, {
        action: "start",
        serverId: f.server.serverId,
        reference: { kind: "attachment", attachmentId: secondRef.attachmentId },
      }),
    ).toMatchObject({ state: "failed", error: expect.stringContaining("Durable effect") });
    expect(f.calls).toHaveLength(calls);
    expect(f.writes.unresolved(f.run.runId)).toHaveLength(1);
  },
);
it("rejects changed source bytes after review and retains the allocation without sending", async () => {
  const f = await fixture();
  f.setAuthorize(async (effect) =>
    effect.job.phase === "upload"
      ? {
          state: "waiting",
          approvalId: "original-approval",
          identity: "b".repeat(64),
          park: { kind: "approval", approvalId: "original-approval", instruction: "Review file" },
        }
      : { state: "allowed", checkCurrent() {} },
  );
  await f.start();
  f.attachments.update(f.run.runId, f.reference.attachmentId, { included: false });
  f.setAuthorize(async () => ({ state: "allowed", checkCurrent() {} }));
  await expect(f.start()).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.sent).toHaveLength(0);
  expect(f.calls).toHaveLength(1);
});
it("aborts and joins the original POST on account retirement; Forget removes only sealed derived state", async () => {
  const f = await fixture();
  let begin!: () => void;
  const started = new Promise<void>((resolve) => {
    begin = resolve;
  });
  let finished = false;
  f.setSend(async (_request, signal, _check, dispatch) => {
    dispatch();
    begin();
    await new Promise<void>((_resolve, reject) =>
      signal.addEventListener(
        "abort",
        () => {
          finished = true;
          reject(signal.reason);
        },
        { once: true },
      ),
    );
    return { status: 200, body: "ok" };
  });
  const operation = f.start();
  await started;
  f.retireCredential();
  await expect(operation).rejects.toThrow();
  expect(finished).toBe(true);
  expect(f.service.store.list(f.run.runId)[0]).toMatchObject({ state: "uncertain" });
  expect(f.writes.unresolved(f.run.runId)).toHaveLength(1);
  await f.service.forget([f.run.runId]);
  expect(f.service.store.list(f.run.runId)).toEqual([]);
  expect(readFileSync(f.source.path)).toEqual(f.bytes);
});
it("retires recovered authority without replay and detects encrypted record identity tampering", async () => {
  const f = await fixture();
  f.setAuthorize(async () => ({
    state: "waiting",
    approvalId: "original-approval",
    identity: "c".repeat(64),
    park: { kind: "approval", approvalId: "original-approval", instruction: "Review file" },
  }));
  await f.start();
  f.service.store.retireRestored();
  expect(f.service.store.list(f.run.runId)[0]).toMatchObject({ state: "retired" });
  expect(f.calls).toHaveLength(0);
  f.repo.db.prepare("UPDATE connector_file_transfers SET state='completed'").run();
  expect(() => f.service.store.list(f.run.runId)).toThrow(/identity changed/);
  f.repo.db.prepare("UPDATE connector_file_transfers SET state='retired'").run();
});
it("rejects nonpublic destinations, forged headers and multipart boundary collisions before transport", () => {
  const source = { filename: "reviewed.pdf", mediaType: "text/plain" },
    bytes = Buffer.from("fixture");
  for (const url of [
    "http://example.com/u",
    "https://127.0.0.1/u",
    "https://user:secret@example.com/u",
    "https://example.com:8443/u",
  ])
    expect(() =>
      prepareConnectorUpload({ url, headers: {}, encoding: { kind: "raw" } }, bytes, source),
    ).toThrow();
  expect(() =>
    prepareConnectorUpload(
      { url: "https://files.slack.com/u", headers: { Cookie: "ambient=secret" }, encoding: { kind: "raw" } },
      bytes,
      source,
    ),
  ).toThrow();
  expect(() =>
    prepareConnectorUpload(
      {
        url: "https://uploads.notion.so/u",
        headers: {},
        encoding: { kind: "multipart", field: "file", boundary: "x".repeat(30) },
      },
      Buffer.from("x".repeat(30)),
      source,
    ),
  ).toThrow();
});

it("uses the real encrypted approval codec and ordinary governed decision for one-use original phase continuation", async () => {
  const f = await fixture();
  const { ApprovalStore } = await import("../../apps/runtime/src/safety/approval.js");
  const { DecisionJournal } = await import("../../apps/runtime/src/safety/decide.js");
  const { SafetyDispatchGate } = await import("../../apps/runtime/src/safety/dispatch.js");
  const { SuspensionStore } = await import("../../apps/runtime/src/safety/suspensions.js");
  const { connectorUploadAuthorizer } =
    await import("../../apps/runtime/src/services/connector-upload-authorization.js");
  const settings = { agentMode: "ask" as const, agentPolicyRevision: 0, agentPolicies: [] };
  const approvals = new ApprovalStore(
    f.repo.db,
    () => {},
    undefined,
    () => settings,
    (id) => f.repo.getRun(id),
    f.repo,
  );
  const suspensions = new SuspensionStore(f.repo.db);
  const decide = {
    approvals,
    journal: new DecisionJournal(f.repo.db),
    managedRules: () => [],
    agentPolicy: () => settings,
    audit: () => {},
  };
  const gate = new SafetyDispatchGate({ ...decide, suspensions });
  const authorize = connectorUploadAuthorizer({
    decide,
    gate,
    retireUnemittedApproval: (id, owner, digest) => approvals.retireUnemittedRequest(id, owner, digest),
    context: () => ({
      profileId: "disposable-fixture",
      turnId: f.run.runId,
      threadId: f.run.runId,
      checkCurrent() {
        if (f.repo.getRun(f.run.runId)?.status !== "running")
          throw new AuxError("cancelled", "Original controller retired");
      },
    }),
  });
  f.setAuthorize((effect) => authorize(effect, f.control.signal));
  let result = await f.start();
  let reviewed = 0;
  while ("park" in result) {
    const id = result.park.approvalId!;
    const job = f.service.store.list(f.run.runId)[0]!;
    expect(job.approval).toEqual({
      approvalId: id,
      digest: f.effects.at(-1)!.digest,
      identity: approvals.continuation(id, {
        runId: f.run.runId,
        turnId: f.run.runId,
        threadId: f.run.runId,
      })!.identity,
    });
    expect(suspensions.pending(f.run.runId)?.request.approvalId).toBe(id);
    const pending = approvals.pending(f.run.runId).find((entry) => entry.approvalId === id)!;
    expect(pending.action.reviewedActions?.[0]?.arguments).toContain(job.source.sha256);
    approvals.decideLocal({ decision: "accept", approvalId: id }, f.run.runId);
    const saved = suspensions.pending(f.run.runId)!;
    suspensions.resolve(saved.suspensionId, "answered");
    result = await f.start();
    reviewed++;
    if (reviewed > 3) throw new Error("Approval loop recreated an original file phase");
  }
  expect(reviewed).toBe(3);
  expect(result).toMatchObject({ state: "completed" });
  expect(f.calls).toHaveLength(2);
  expect(f.sent).toHaveLength(1);
  expect(f.repo.db.prepare("SELECT state FROM safety_approval_requests ORDER BY rowid").all()).toEqual([
    { state: "consumed" },
    { state: "consumed" },
    { state: "consumed" },
  ]);
  const decisionRows = JSON.stringify(f.repo.db.prepare("SELECT request_json FROM safety_decisions").all());
  expect(decisionRows).not.toContain("synthetic-signed-path");
  expect(
    String(f.repo.db.prepare("SELECT action_json FROM safety_approval_requests LIMIT 1").get()!.action_json),
  ).not.toContain("reviewed.pdf");
});
it("withholds a byte POST when the admitted document is forgotten during authorization", async () => {
  const f = await fixture();
  f.setAuthorize(async (effect) => {
    if (effect.job.phase === "upload")
      f.repo.saveRun({ ...f.run, config: { ...f.run.config, contextMemoryRevoked: true } });
    return { state: "allowed", checkCurrent() {} };
  });
  await expect(f.start()).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.service.store.list(f.run.runId)[0]).toMatchObject({ state: "failed" });
  expect(f.sent).toHaveLength(0);
  expect(f.calls).toHaveLength(1);
});

it("retires an expired original allocation without regenerating its URL or reallocating on a new call", async () => {
  const f = await fixture();
  f.setAuthorize(async (effect) =>
    effect.job.phase === "upload"
      ? {
          state: "waiting",
          approvalId: "original-approval",
          identity: "e".repeat(64),
          park: { kind: "approval", approvalId: "original-approval", instruction: "Review original bytes" },
        }
      : { state: "allowed", checkCurrent() {} },
  );
  await f.start();
  const job = f.service.store.list(f.run.runId)[0]!;
  f.service.store.save({ ...job, allocation: { ...job.allocation!, expiresAt: Date.now() - 1 } });
  expect(await f.start()).toMatchObject({ state: "retired", transferId: job.transferId });
  expect(await f.start()).toMatchObject({ state: "retired", transferId: job.transferId });
  expect(f.calls).toHaveLength(1);
  expect(f.sent).toHaveLength(0);
});
it("refuses raw generic artifact and unselected document IDs before allocating or uploading", async () => {
  const f = await fixture();
  expect(() =>
    f.service.invoke(
      f.run.runId,
      JSON.parse(
        JSON.stringify({ action: "start", serverId: f.server.serverId, artifactId: f.source.artifactId }),
      ),
    ),
  ).toThrow();
  await expect(
    f.service.invoke(f.run.runId, {
      action: "start",
      serverId: f.server.serverId,
      reference: { kind: "attachment", attachmentId: "not-selected" },
    }),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.calls).toHaveLength(0);
  expect(f.sent).toHaveLength(0);
});

it.each(["slack", "notion"] as const)(
  "does not publish completed %s source data through inspect or repeated start after original removal",
  async (provider) => {
    const f = await fixture(provider);
    const result = await f.start();
    if ("park" in result) throw new Error("Fixture expected confirmed original transfer");
    const calls = f.calls.length;
    f.attachments.update(f.run.runId, f.reference.attachmentId, { included: false });
    await expect(
      f.service.invoke(f.run.runId, { action: "inspect", transferId: result.transferId }),
    ).rejects.toMatchObject({ code: "ref_stale" });
    await expect(f.start()).rejects.toMatchObject({ code: "ref_stale" });
    expect(f.calls).toHaveLength(calls);
    expect(f.sent).toHaveLength(1);
    expect(f.writes.unresolved(f.run.runId)).toEqual([]);
  },
);
it("inspects an undispatched approval without consuming, allocating or posting bytes", async () => {
  const f = await fixture();
  f.setAuthorize(async () => ({
    state: "waiting",
    approvalId: "original-approval",
    identity: "a".repeat(64),
    park: { kind: "approval", approvalId: "original-approval", instruction: "Review original bytes" },
  }));
  await f.start();
  const job = f.service.store.list(f.run.runId)[0]!;
  expect(
    await f.service.invoke(f.run.runId, { action: "inspect", transferId: job.transferId }),
  ).toMatchObject({ state: "waiting", transferId: job.transferId });
  expect(f.effects).toHaveLength(1);
  expect(f.calls).toHaveLength(0);
  expect(f.sent).toHaveLength(0);
});
it("refuses original approval continuation when the actual private controller identity changes", async () => {
  const f = await fixture();
  f.setAuthorize(async (effect) =>
    effect.job.phase === "upload"
      ? {
          state: "waiting",
          approvalId: "original-approval",
          identity: "a".repeat(64),
          park: { kind: "approval", approvalId: "original-approval", instruction: "Review original file" },
        }
      : { state: "allowed", checkCurrent() {} },
  );
  await f.start();
  const job = f.service.store.list(f.run.runId)[0]!;
  expect(job.ownerIdentity).toMatch(/^[a-f0-9]{64}$/);
  f.replaceOwner();
  await expect(
    f.service.invoke(f.run.runId, { action: "continue", transferId: job.transferId }),
  ).rejects.toMatchObject({ code: "permission_denied" });
  await expect(
    f.service.invoke(f.run.runId, { action: "inspect", transferId: job.transferId }),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.service.store.get(job.transferId).approval).toEqual(job.approval);
  expect(f.calls).toHaveLength(1);
  expect(f.sent).toHaveLength(0);
});
it("never binds a completed transfer or its source projection to a replacement controller", async () => {
  const f = await fixture("notion");
  const result = await f.start();
  if ("park" in result) throw new Error("Expected actual uploaded fixture");
  const job = f.service.store.get(result.transferId);
  const { connectorUploadDigest } =
    await import("../../apps/runtime/src/services/connector-upload-provider.js");
  expect(connectorUploadDigest(job, {})).not.toBe(
    connectorUploadDigest({ ...job, ownerIdentity: "f".repeat(64) }, {}),
  );
  f.replaceOwner();
  await expect(f.start()).rejects.toMatchObject({ code: "permission_denied" });
  await expect(
    f.service.invoke(f.run.runId, { action: "inspect", transferId: result.transferId }),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.calls).toHaveLength(1);
  expect(f.sent).toHaveLength(1);
});
it("checks the private original owner again after asynchronous phase authorization", async () => {
  const f = await fixture();
  f.setAuthorize(async (effect) => {
    if (effect.job.phase === "upload") f.replaceOwner();
    return { state: "allowed", checkCurrent() {} };
  });
  await expect(f.start()).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.sent).toHaveLength(0);
  expect(f.calls).toHaveLength(1);
});
it("retires only an un-emitted replacement Ask after expiry without adopting it or overwriting original approval", async () => {
  const f = await fixture();
  const { ApprovalStore } = await import("../../apps/runtime/src/safety/approval.js");
  const { DecisionJournal } = await import("../../apps/runtime/src/safety/decide.js");
  const { SafetyDispatchGate } = await import("../../apps/runtime/src/safety/dispatch.js");
  const { connectorUploadAuthorizer } =
    await import("../../apps/runtime/src/services/connector-upload-authorization.js");
  const settings = { agentMode: "ask" as const, agentPolicyRevision: 0, agentPolicies: [] };
  const approvals = new ApprovalStore(
    f.repo.db,
    () => {},
    undefined,
    () => settings,
    (id) => f.repo.getRun(id),
    f.repo,
  );
  let expire = false;
  const decide = {
    approvals,
    journal: new DecisionJournal(f.repo.db),
    managedRules: () => [],
    agentPolicy: () => settings,
    audit: () => {},
    now: () => Date.now() + (expire ? 24 * 60 * 60_000 : 0),
  };
  const gate = new SafetyDispatchGate(decide);
  const retired = vi.fn(
    (id: string, owner: { runId: string; turnId: string; threadId: string }, digest: string) =>
      approvals.retireUnemittedRequest(id, owner, digest),
  );
  const authorize = connectorUploadAuthorizer({
    decide,
    gate,
    retireUnemittedApproval: retired,
    context: () => ({
      profileId: "disposable-fixture",
      turnId: f.run.runId,
      threadId: f.run.runId,
      checkCurrent() {},
    }),
  });
  f.setAuthorize((effect) => authorize(effect, f.control.signal));
  const first = await f.start();
  if (!("park" in first)) throw new Error("Expected real original Ask");
  const original = f.service.store.list(f.run.runId)[0]!.approval!;
  const owner = { runId: f.run.runId, turnId: f.run.runId, threadId: f.run.runId };
  const other = approvals.pending(f.run.runId)[0]!;
  const unrelated = approvals.issue(
    { ...other.action, invocationDigest: "e".repeat(64), action: "unrelated.fixture" },
    "turn",
  );
  expect(
    approvals.retireUnemittedRequest(unrelated, { ...owner, runId: "foreign-run" }, "e".repeat(64)),
  ).toBe(false);
  expect(approvals.retireUnemittedRequest(unrelated, owner, "f".repeat(64))).toBe(false);
  approvals.decideLocal({ decision: "accept", approvalId: first.park.approvalId! }, f.run.runId);
  expire = true;
  expect(await f.start()).toMatchObject({ state: "failed" });
  expect(retired).toHaveBeenCalledOnce();
  const replacement = retired.mock.calls[0]![0];
  expect(replacement).not.toBe(original.approvalId);
  expect(
    f.repo.db
      .prepare("SELECT state,decision FROM safety_approval_requests WHERE approval_id=?")
      .get(replacement),
  ).toEqual({ state: "cancelled", decision: null });
  expect(
    f.repo.db.prepare("SELECT state FROM safety_approval_requests WHERE approval_id=?").get(unrelated),
  ).toEqual({ state: "pending" });
  expect(approvals.retireUnemittedRequest(original.approvalId, owner, original.digest)).toBe(false);
  expect(f.service.store.list(f.run.runId)[0]!.approval).toEqual(original);
  expect(f.calls).toHaveLength(0);
  expect(f.sent).toHaveLength(0);
  expect(approvals.runAuthorityRevision(f.run.runId)).toBe(0);
});
it("cancels and joins the actual original catalog transport when Forget retires a preparing workflow", async () => {
  const f = await fixture();
  const held = f.holdCatalog();
  const pending = f.start().then(
    () => {
      throw new Error("A held catalog cannot complete normally");
    },
    (error: unknown) => error,
  );
  await held.started;
  await f.service.forget([f.run.runId]);
  expect(held.joined()).toBe(true);
  expect(await pending).toBeInstanceOf(Error);
  expect(f.service.store.list(f.run.runId)).toEqual([]);
  expect(f.calls).toHaveLength(0);
  expect(f.sent).toHaveLength(0);
});
