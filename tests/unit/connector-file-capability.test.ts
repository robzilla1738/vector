import { createHash } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import type { OutboundMcpServer, OutboundMcpTool } from "@aux/contracts";
import {
  createMcpTransportProvider,
  EventBus,
  openDb,
  OutboundMcpService,
  Repo,
  TaskService,
} from "@aux/runtime";
import {
  fileUploadCapability,
  discoveredFileUploadCapability,
} from "../../apps/runtime/src/services/connector-file-capability.js";
import { allocationArguments } from "../../apps/runtime/src/services/connector-upload-provider.js";
const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const close of cleanup.splice(0)) close();
});
const notion = (): OutboundMcpTool => ({
  name: "notion-create-file-upload",
  enabled: true,
  inputSchema: {
    type: "object",
    properties: { filename: { type: "string" }, content_type: { type: "string" } },
  },
  outputSchema: {
    type: "object",
    properties: {
      upload_url: { type: "string", description: "never persist schemas or temporary URLs here" },
      upload_method: { const: "POST" },
      upload_headers: { type: "object" },
      upload_form_field: { type: "string" },
    },
  },
});
const slack = (): OutboundMcpTool[] =>
  ["slack_get_file_upload_url", "slack_complete_file_upload"].map((name) => ({
    name,
    enabled: true,
    inputSchema: { type: "object", properties: {} },
  }));
async function fixture(
  provider: "slack" | "notion" = "slack",
  options: { auth?: "oauth" | "none"; url?: string; missingOAuth?: boolean } = {},
) {
  const repo = new Repo(openDb(":memory:"));
  cleanup.push(() => repo.close());
  const workspaceId = new TaskService(repo, new EventBus(repo)).createWorkspace(
    "Synthetic cached catalog",
  ).workspaceId;
  let catalog = provider === "slack" ? slack() : [notion()];
  let beforeList = () => {};
  const url = options.url ?? `https://mcp.${provider}.com/mcp`,
    auth = options.auth ?? "oauth";
  const token = vi.fn(async () => "synthetic-token");
  const network = vi.fn<typeof fetch>(async (input, init) => {
    expect(String(input instanceof Request ? input.url : input)).toBe(url);
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
      beforeList();
      result = { tools: catalog.map(({ enabled: _enabled, ...tool }) => tool) };
    } else throw new Error("Capability discovery must not invoke a provider write");
    return Response.json({ jsonrpc: "2.0", id: body.id, result });
  });
  const service = new OutboundMcpService(
    repo,
    createMcpTransportProvider(
      options.missingOAuth ? undefined : { authorizationGeneration: () => 0, token },
      network,
    ),
  );
  const server = await service.register({
    workspaceId,
    name: provider,
    source: { kind: "remote", url, auth },
  });
  return {
    repo,
    service,
    server,
    token,
    network,
    setCatalog: (value: OutboundMcpTool[]) => {
      catalog = value;
    },
    beforeList: (action: () => void) => {
      beforeList = action;
    },
  };
}
it.each(["slack", "notion"] as const)(
  "persists only actual discovered %s file metadata and reads it after reload without credentials/network",
  async (provider) => {
    const f = await fixture(provider);
    expect(fileUploadCapability(f.service.get(f.server.serverId))).toBeUndefined();
    await f.service.listTools(f.server.serverId);
    const server = f.service.get(f.server.serverId);
    expect(fileUploadCapability(server)).toEqual({
      catalogDigest: server.catalogDigest,
      allocationTool: provider === "slack" ? "slack_get_file_upload_url" : "notion-create-file-upload",
      ...(provider === "slack" ? { completionTool: "slack_complete_file_upload" } : {}),
    });
    const calls = f.network.mock.calls.length,
      tokens = f.token.mock.calls.length;
    const reloaded = new OutboundMcpService(f.repo);
    expect(fileUploadCapability(reloaded.get(server.serverId))).toEqual(server.fileUpload);
    expect(f.network).toHaveBeenCalledTimes(calls);
    expect(f.token).toHaveBeenCalledTimes(tokens);
    const stored = JSON.parse(
      String(
        f.repo.db.prepare("SELECT body FROM outbound_mcp_servers WHERE server_id=?").get(server.serverId)!
          .body,
      ),
    );
    expect(Object.keys(stored.fileUpload).sort()).toEqual(
      provider === "slack"
        ? ["allocationTool", "catalogDigest", "completionTool"]
        : ["allocationTool", "catalogDigest"],
    );
    expect(JSON.stringify(stored)).not.toContain("temporary URLs");
    expect(JSON.stringify(stored)).not.toContain("synthetic-token");
    expect(stored.inputSchema).toBeUndefined();
    expect(stored.outputSchema).toBeUndefined();
  },
);
it("uses one canonical Notion schema predicate and clears proof when an actual refreshed shape becomes unsupported", async () => {
  const f = await fixture("notion");
  const unsupported = notion();
  delete unsupported.outputSchema;
  f.setCatalog([unsupported]);
  await f.service.listTools(f.server.serverId);
  expect(fileUploadCapability(f.service.get(f.server.serverId))).toBeUndefined();
  expect(() =>
    allocationArguments("notion", unsupported, {
      filename: "reviewed.pdf",
      size: 12,
      mediaType: "application/pdf",
    }),
  ).toThrow();
  f.setCatalog([notion()]);
  await f.service.listTools(f.server.serverId);
  const supported = f.service.get(f.server.serverId);
  expect(fileUploadCapability(supported)).toBeDefined();
  const changed = notion();
  changed.outputSchema = { type: "object", properties: { upload_url: { type: "string" } } };
  f.setCatalog([changed]);
  await f.service.listTools(f.server.serverId);
  const latest = f.service.get(f.server.serverId);
  expect(latest.fileUpload).toBeUndefined();
  expect(latest.toolsRevision).toBeGreaterThan(supported.toolsRevision);
});
it("requires both returned Slack phases and derives current tool toggles without losing structural discovery", async () => {
  const f = await fixture();
  f.setCatalog(slack().slice(0, 1));
  await f.service.listTools(f.server.serverId);
  expect(fileUploadCapability(f.service.get(f.server.serverId))).toBeUndefined();
  f.setCatalog(slack());
  await f.service.listTools(f.server.serverId);
  let current = f.service.get(f.server.serverId);
  const proof = current.fileUpload;
  current = f.service.setEnabled({
    serverId: current.serverId,
    toolName: "slack_complete_file_upload",
    enabled: false,
    expectedRevision: current.toolsRevision,
  });
  expect(current.fileUpload).toEqual(proof);
  expect(fileUploadCapability(current)).toBeUndefined();
  const calls = f.network.mock.calls.length;
  current = f.service.setEnabled({
    serverId: current.serverId,
    toolName: "slack_complete_file_upload",
    enabled: true,
    expectedRevision: current.toolsRevision,
  });
  expect(fileUploadCapability(current)).toEqual(proof);
  expect(f.network).toHaveBeenCalledTimes(calls);
});
it.each([{ auth: "none" as const }, { url: "https://mcp.slack.com.example.test/mcp" }])(
  "does not infer official OAuth capabilities for $auth $url",
  async (options) => {
    const f = await fixture("slack", options);
    await f.service.listTools(f.server.serverId);
    expect(f.service.get(f.server.serverId).fileUpload).toBeUndefined();
  },
);
it("does not produce proof when real credential setup is missing or actual discovery is cancelled", async () => {
  const missing = await fixture("slack", { missingOAuth: true });
  await expect(missing.service.listTools(missing.server.serverId)).rejects.toThrow(/OAuth/);
  expect(missing.service.get(missing.server.serverId).fileUpload).toBeUndefined();
  expect(missing.network).not.toHaveBeenCalled();
  const f = await fixture();
  f.beforeList(() => f.service.invalidateAuthorization(f.server.serverId));
  await expect(f.service.listTools(f.server.serverId)).rejects.toThrow();
  expect(f.service.get(f.server.serverId).fileUpload).toBeUndefined();
});
it("clears cached proof on OAuth retirement and revoke, and restores only from another actual successful catalog", async () => {
  const f = await fixture();
  await f.service.listTools(f.server.serverId);
  const original = f.service.get(f.server.serverId);
  expect(original.fileUpload).toBeDefined();
  f.service.invalidateAuthorization(original.serverId);
  const retired = f.service.get(original.serverId);
  expect(retired.fileUpload).toBeUndefined();
  expect(fileUploadCapability(retired)).toBeUndefined();
  await f.service.listTools(original.serverId);
  const refreshed = f.service.get(original.serverId);
  expect(refreshed.fileUpload).toEqual(original.fileUpload);
  expect(refreshed.toolsRevision).toBeGreaterThan(retired.toolsRevision);
  expect(f.service.revoke(original.serverId).fileUpload).toBeUndefined();
  expect(fileUploadCapability(f.service.get(original.serverId))).toBeUndefined();
});
it("refuses legacy, stale catalog, wrong source digest/provider and missing returned tool anchors without I/O", async () => {
  const f = await fixture();
  await f.service.listTools(f.server.serverId);
  const server = f.service.get(f.server.serverId);
  const calls = f.network.mock.calls.length;
  const invalid: OutboundMcpServer[] = [
    { ...server, fileUpload: undefined },
    { ...server, catalogDigest: "a".repeat(64) },
    { ...server, sourceDigest: "b".repeat(64) },
    { ...server, toolNames: [] },
  ];
  const source: OutboundMcpServer["source"] = {
    kind: "remote",
    url: "https://mcp.notion.com/mcp",
    auth: "oauth",
  };
  invalid.push({
    ...server,
    source,
    sourceDigest: createHash("sha256").update(JSON.stringify(source)).digest("hex"),
  });
  for (const item of invalid) expect(fileUploadCapability(item)).toBeUndefined();
  expect(f.network).toHaveBeenCalledTimes(calls);
  expect(
    discoveredFileUploadCapability(server.source, [...slack(), slack()[0]!], server.catalogDigest!),
  ).toBeUndefined();
});
