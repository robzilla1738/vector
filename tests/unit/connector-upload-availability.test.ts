import type { DocumentOriginal } from "@aux/contracts/document-original";
import { createHash } from "node:crypto";
import { expect, it, vi } from "vitest";
import { AuxError, type OutboundMcpServer, type Run } from "@aux/contracts";
import { connectorUploadAvailable } from "../../apps/runtime/src/services/connector-upload-availability.js";

/** Publication boundaries only. Real SDK catalog creation and byte-transfer authority have separate fixtures. */
function fixture(provider: "slack" | "notion" = "slack") {
  const controller = new AbortController();
  const serverId = "e2566c37-fc28-45a9-9aca-8117fbda9469";
  const reference = { chatId: "chat", attachmentId: "attachment", sha256: "a".repeat(64) };
  const run = {
    runId: "run",
    status: "running",
    config: {
      contextAttachmentRefs: [reference],
      mentions: [{ kind: "connector", connectorId: `mcp:${serverId}` }],
    },
  } as Run;
  let included = true;
  const metadata = vi.fn(() => ({
    original: { kind: "capture", chunks: 1 } as DocumentOriginal | undefined,
    document: { format: "pdf", filename: "fixture.pdf", sourceBytes: 100, sourceSha256: "b".repeat(64) },
  }));
  const source = { kind: "remote", auth: "oauth", url: `https://mcp.${provider}.com/mcp` } as const;
  const allocationTool = provider === "slack" ? "slack_get_file_upload_url" : "notion-create-file-upload";
  const completionTool = provider === "slack" ? "slack_complete_file_upload" : undefined;
  const server: OutboundMcpServer = {
    serverId,
    workspaceId: "space",
    name: provider,
    source,
    state: "active",
    sourceDigest: createHash("sha256").update(JSON.stringify(source)).digest("hex"),
    catalogDigest: "d".repeat(64),
    toolsRevision: 1,
    disabledTools: [],
    toolNames: [allocationTool, ...(completionTool ? [completionTool] : [])],
    fileUpload: {
      catalogDigest: "d".repeat(64),
      allocationTool,
      ...(completionTool ? { completionTool } : {}),
    },
    createdAt: 1,
    updatedAt: 1,
  };
  const check = () => controller.signal.throwIfAborted();
  const checkConnector = vi.fn();
  const listTools = vi.fn(() => {
    throw new Error("Readiness must never discover over transport");
  });
  const status = vi.fn(() => {
    throw new Error("Readiness must never read OAuth credentials");
  });
  const get = vi.fn(() => server);
  const deps = {
    repo: { getRun: () => run },
    documents: { metadata },
    attachments: { referenceMetadata: () => ({ included, removed: false }) },
    owner: () => ({ run, signal: controller.signal, identity: "c".repeat(64), checkCurrent: check }),
    checkConnector,
    mcp: { get, listTools },
    oauth: { status },
  } as unknown as Parameters<typeof connectorUploadAvailable>[0];
  return {
    run,
    deps,
    server,
    get,
    listTools,
    status,
    metadata,
    controller,
    checkConnector,
    input: { runId: "run", signal: controller.signal, checkOwner: check },
    remove: () => {
      included = false;
    },
  };
}

it.each(["slack", "notion"] as const)(
  "publishes %s from current cached proof with zero network or credential reads",
  async (provider) => {
    const f = fixture(provider);
    await expect(connectorUploadAvailable(f.deps, f.input)).resolves.toBe(true);
    expect(f.listTools).not.toHaveBeenCalled();
    expect(f.status).not.toHaveBeenCalled();
    expect(f.checkConnector).toHaveBeenCalledWith(
      "run",
      f.server.serverId,
      f.server.fileUpload!.allocationTool,
    );
  },
);

it("checks Slack completion authority as well as allocation authority", async () => {
  const f = fixture("slack");
  await expect(connectorUploadAvailable(f.deps, f.input)).resolves.toBe(true);
  expect(f.checkConnector).toHaveBeenCalledWith("run", f.server.serverId, "slack_complete_file_upload");
});

it("requires a selected original and does not probe a provider without one", async () => {
  const f = fixture();
  f.remove();
  await expect(connectorUploadAvailable(f.deps, f.input)).resolves.toBe(false);
  f.run.config!.contextAttachmentRefs = [];
  await expect(connectorUploadAvailable(f.deps, f.input)).resolves.toBe(false);
  expect(f.get).not.toHaveBeenCalled();
});

it("does not turn cached discovery into a captured connector grant", async () => {
  const f = fixture();
  f.checkConnector.mockImplementation(() => {
    throw new AuxError("permission_denied", "Original mention retired");
  });
  await expect(connectorUploadAvailable(f.deps, f.input)).resolves.toBe(false);
});

it.each([
  "legacy",
  "stale_catalog",
  "revoked",
  "disabled_allocation",
  "missing_completion",
  "disabled_completion",
  "wrong_source",
] as const)("omits %s cached capability", async (state) => {
  const f = fixture();
  if (state === "legacy") delete f.server.fileUpload;
  if (state === "stale_catalog") f.server.catalogDigest = "e".repeat(64);
  if (state === "revoked") f.server.state = "revoked";
  if (state === "disabled_allocation") f.server.disabledTools = ["slack_get_file_upload_url"];
  if (state === "missing_completion") f.server.toolNames = ["slack_get_file_upload_url"];
  if (state === "disabled_completion") f.server.disabledTools = ["slack_complete_file_upload"];
  if (state === "wrong_source")
    f.server.source = { kind: "remote", auth: "oauth", url: "https://mcp.slack.com/other" };
  await expect(connectorUploadAvailable(f.deps, f.input)).resolves.toBe(false);
  expect(f.listTools).not.toHaveBeenCalled();
  expect(f.status).not.toHaveBeenCalled();
});

it("checks captured permission for the separate Slack completion phase", async () => {
  const f = fixture();
  f.checkConnector.mockImplementation((_run, _server, tool) => {
    if (tool === "slack_complete_file_upload") throw new AuxError("permission_denied", "Completion excluded");
  });
  await expect(connectorUploadAvailable(f.deps, f.input)).resolves.toBe(false);
});

it("rejects a source removed during final cached publication checks", async () => {
  const f = fixture();
  f.checkConnector.mockImplementation(() => f.remove());
  await expect(connectorUploadAvailable(f.deps, f.input)).rejects.toMatchObject({ code: "ref_stale" });
});

it.each(["txt", "image", "html"])("does not advertise unsupported original %s bytes", async (format) => {
  const f = fixture();
  f.metadata.mockReturnValue({
    original: { kind: "capture", chunks: 1 },
    document: { format, filename: `fixture.${format}`, sourceBytes: 100, sourceSha256: "b".repeat(64) },
  });
  await expect(connectorUploadAvailable(f.deps, f.input)).resolves.toBe(false);
  expect(f.get).not.toHaveBeenCalled();
});

it("rejects original run cancellation rather than publishing or swallowing it", async () => {
  const f = fixture();
  f.get.mockImplementation(() => {
    f.controller.abort(new AuxError("cancelled", "Original run stopped"));
    return f.server;
  });
  await expect(connectorUploadAvailable(f.deps, f.input)).rejects.toMatchObject({ code: "cancelled" });
  expect(f.listTools).not.toHaveBeenCalled();
  expect(f.status).not.toHaveBeenCalled();
});

it("omits a legacy text-only snapshot even when its document retains PDF byte metadata", async () => {
  const f = fixture();
  f.metadata.mockReturnValue({ ...f.metadata(), original: undefined });
  await expect(connectorUploadAvailable(f.deps, f.input)).resolves.toBe(false);
  expect(f.get).not.toHaveBeenCalled();
});

it("omits an original whose channel attachment has already retired", async () => {
  const f = fixture();
  const { Repo, openDb } = await import("@aux/runtime");
  const repo = new Repo(openDb(":memory:"));
  try {
    f.deps.repo = Object.assign(repo, { getRun: () => f.run });
    f.metadata.mockReturnValue({
      ...f.metadata(),
      original: {
        kind: "channel",
        connectionId: "retired-connection",
        connectionRevision: "retired-revision",
        messageKey: "message",
        providerMessageId: "message",
        peerKey: "peer",
        authorityId: "retired-authority",
        attachmentKey: "removed-attachment",
      },
    });
    await expect(connectorUploadAvailable(f.deps, f.input)).resolves.toBe(false);
    expect(f.get).not.toHaveBeenCalled();
  } finally {
    repo.close();
  }
});
