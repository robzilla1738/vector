import { afterEach, expect, it, vi } from "vitest";
import { AuxError, type OutboundMcpServer } from "@aux/contracts";
import {
  createMcpTransportProvider,
  EventBus,
  openDb,
  OutboundMcpService,
  Repo,
  TaskService,
} from "@aux/runtime";

const closes: (() => void)[] = [];
afterEach(() => closes.splice(0).forEach((close) => close()));
const providerTools = {
  notion: ["notion-search", "notion-create-pages", "notion-create-attachment"],
  slack: ["slack_search", "slack_send_message", "slack_get_file_upload_url", "slack_complete_file_upload"],
} as const;

/** Synthetic returned catalogs exercise the real SDK/transport; they do not attest a live provider's current schema. */
async function fixture(provider: keyof typeof providerTools) {
  const repo = new Repo(openDb(":memory:"));
  closes.push(() => repo.close());
  const tasks = new TaskService(repo, new EventBus(repo));
  const space = tasks.createWorkspace("Official MCP fixture");
  const task = tasks.create({
    workspaceId: space.workspaceId,
    title: "Explicit connector work",
    objective: "Use only the returned fixture tools",
    criteria: [{ criterionId: "done", description: "Fixture result", verification: "manual" }],
  });
  let generation = 0;
  const token = vi.fn(async (server: OutboundMcpServer) => {
    expect(server.source).toEqual({ kind: "remote", auth: "oauth", url: `https://mcp.${provider}.com/mcp` });
    return "synthetic-fixture-token";
  });
  const calls: { name: string; arguments: Record<string, unknown> }[] = [];
  let result: Record<string, unknown> = { content: [{ type: "text", text: "Fixture result" }] };
  let failCall = false;
  let beforeResult = () => {};
  const network = vi.fn<typeof fetch>(async (input, init) => {
    expect(String(input instanceof Request ? input.url : input)).toBe(`https://mcp.${provider}.com/mcp`);
    expect(init?.redirect).toBe("error");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer synthetic-fixture-token");
    if (init?.method === "GET") return new Response(null, { status: 405 });
    const body = JSON.parse(String(init?.body));
    if (body.id === undefined) return new Response(null, { status: 202 });
    let response: unknown;
    if (body.method === "initialize")
      response = {
        protocolVersion: body.params.protocolVersion,
        capabilities: { tools: {} },
        serverInfo: { name: provider, version: "fixture" },
      };
    else if (body.method === "tools/list")
      response = {
        tools: providerTools[provider].map((name) => ({
          name,
          inputSchema: { type: "object", properties: {} },
        })),
      };
    else if (body.method === "tools/call") {
      calls.push(structuredClone(body.params));
      if (failCall) throw new Error("Fixture response lost after dispatch");
      beforeResult();
      response = result;
    } else throw new Error(`Unexpected fixture method ${body.method}`);
    return Response.json({ jsonrpc: "2.0", id: body.id, result: response });
  });
  const service = new OutboundMcpService(
    repo,
    createMcpTransportProvider({ authorizationGeneration: () => generation, token }, network),
  );
  const server = await service.register({
    workspaceId: space.workspaceId,
    name: provider,
    source: { kind: "remote", auth: "oauth", url: `https://mcp.${provider}.com/mcp` },
  });
  const catalog = await service.listTools(server.serverId);
  const context = { workspaceId: space.workspaceId, taskId: task.taskId, revision: task.revision };
  const authorize = vi.fn(async () => {
    const original = service.get(server.serverId).toolsRevision;
    return () => {
      if (service.get(server.serverId).toolsRevision !== original)
        throw new AuxError("conflict", "Original tool authority changed");
    };
  });
  return {
    repo,
    tasks,
    space,
    task,
    service,
    server,
    catalog,
    calls,
    token,
    network,
    context,
    authorize,
    setResult: (value: Record<string, unknown>) => {
      result = value;
    },
    loseResponse: () => {
      failCall = true;
    },
    beforeResult: (action: () => void) => {
      beforeResult = action;
    },
    retireCredential: () => {
      generation++;
      service.invalidateAuthorization(server.serverId);
    },
  };
}

it.each(["notion", "slack"] as const)(
  "preserves %s search restrictions, notices and actual partial results through the SDK",
  async (provider) => {
    const f = await fixture(provider);
    const name = providerTools[provider][0];
    const args = { query: "Quarterly planning" };
    const partial = {
      content: [{ type: "text", text: "Partial fixture matches; requested filter unavailable" }],
      structuredContent: {
        results: [
          {
            id: "source-1",
            url:
              provider === "notion"
                ? "https://notion.so/source-1"
                : "https://example.slack.com/archives/channel/p1",
          },
        ],
        notices: [{ code: "filter_not_supported", filter: "created_time" }],
        access: { fullWorkspaceSearch: "not_available" },
        nextCursor: "next-page",
      },
    };
    f.setResult(partial);
    const output = await f.service.callTool(f.server.serverId, name, args, f.context, undefined, f.authorize);
    expect(output).toMatchObject({ status: "completed", isError: false });
    expect(JSON.parse(output.output)).toEqual(partial);
    expect(f.calls).toEqual([{ name, arguments: args }]);
    expect(f.authorize).toHaveBeenCalledOnce();
    expect(f.catalog.find((tool) => tool.name === name)?.effect).toBe(
      provider === "notion" ? "read" : "unknown",
    );
    expect(f.repo.db.prepare("SELECT status FROM outbound_mcp_calls").get()).toMatchObject({
      status: "completed",
    });
  },
);

it.each(["notion", "slack"] as const)(
  "binds %s named writes to exact task authority and keeps provider refusal explicit",
  async (provider) => {
    const f = await fixture(provider);
    const name = providerTools[provider][1];
    const args =
      provider === "notion"
        ? { pages: [{ properties: { title: "Reviewed fixture page" } }] }
        : { channel_id: "C_FIXTURE", text: "Reviewed fixture message" };
    const denied = {
      isError: true,
      content: [{ type: "text", text: "Fixture permission denied for this object" }],
    };
    await expect(
      f.service.callTool(
        f.server.serverId,
        name,
        args,
        { ...f.context, revision: f.context.revision + 1 },
        undefined,
        f.authorize,
      ),
    ).rejects.toThrow(/revision/);
    expect(f.calls).toHaveLength(0);
    f.setResult({
      content: [{ type: "text", text: "Fixture write acknowledged" }],
      structuredContent: { id: "write-fixture" },
    });
    const acknowledged = await f.service.callTool(
      f.server.serverId,
      name,
      args,
      f.context,
      undefined,
      f.authorize,
    );
    expect(acknowledged).toMatchObject({ status: "completed", isError: false });
    expect(JSON.parse(acknowledged.output).structuredContent.id).toBe("write-fixture");
    f.setResult(denied);
    const output = await f.service.callTool(f.server.serverId, name, args, f.context, undefined, f.authorize);
    expect(output).toMatchObject({ status: "completed", isError: true });
    expect(JSON.parse(output.output)).toEqual(denied);
    expect(f.calls).toEqual([
      { name, arguments: args },
      { name, arguments: args },
    ]);
    expect(f.catalog.find((tool) => tool.name === name)?.effect).not.toBe("read");
  },
);

it("retains Notion file capability limits and refuses tools absent from the returned catalog", async () => {
  const f = await fixture("notion");
  f.setResult({
    content: [{ type: "text", text: "Fixture attachment allocated" }],
    structuredContent: { file_id: "file-fixture", status: "pending_upload" },
  });
  const allocated = await f.service.callTool(
    f.server.serverId,
    "notion-create-attachment",
    { filename: "fixture.txt" },
    f.context,
    undefined,
    f.authorize,
  );
  expect(JSON.parse(allocated.output).structuredContent).toEqual({
    file_id: "file-fixture",
    status: "pending_upload",
  });
  const unsupported = {
    isError: true,
    content: [{ type: "text", text: "Fixture workspace does not permit attachment creation" }],
    structuredContent: { notice: "file_creation_unsupported", accepted: false },
  };
  f.setResult(unsupported);
  const output = await f.service.callTool(
    f.server.serverId,
    "notion-create-attachment",
    { filename: "fixture.txt" },
    f.context,
    undefined,
    f.authorize,
  );
  expect(JSON.parse(output.output)).toEqual(unsupported);
  expect(output.isError).toBe(true);
  await expect(
    f.service.callTool(
      f.server.serverId,
      "notion-download-attachment",
      {},
      f.context,
      undefined,
      f.authorize,
    ),
  ).rejects.toThrow(/catalog|enabled|access/);
  expect(f.calls).toHaveLength(2);
});

it("keeps Slack upload allocation and completion as separate governed writes with provider results", async () => {
  const f = await fixture("slack");
  f.setResult({
    content: [{ type: "text", text: "Allocated fixture upload" }],
    structuredContent: { file_id: "F_FIXTURE", upload_url: "https://files.slack.com/upload/fixture" },
  });
  const allocated = await f.service.callTool(
    f.server.serverId,
    "slack_get_file_upload_url",
    { filename: "fixture.txt", length: 12 },
    f.context,
    undefined,
    f.authorize,
  );
  expect(JSON.parse(allocated.output).structuredContent.file_id).toBe("F_FIXTURE");
  f.setResult({
    content: [{ type: "text", text: "Fixture completion acknowledged" }],
    structuredContent: { files: [{ id: "F_FIXTURE" }] },
  });
  const completed = await f.service.callTool(
    f.server.serverId,
    "slack_complete_file_upload",
    { files: [{ id: "F_FIXTURE" }], channel_id: "C_FIXTURE" },
    f.context,
    undefined,
    f.authorize,
  );
  expect(JSON.parse(completed.output).structuredContent.files).toEqual([{ id: "F_FIXTURE" }]);
  expect(f.calls.map((call) => call.name)).toEqual([
    "slack_get_file_upload_url",
    "slack_complete_file_upload",
  ]);
  expect(f.authorize).toHaveBeenCalledTimes(2);
  expect(
    f.catalog.filter((tool) => tool.name.includes("upload")).every((tool) => tool.effect === "write"),
  ).toBe(true);
});

it.each(["notion", "slack"] as const)(
  "does not dispatch %s writes when authority retires during approval, or replay lost responses",
  async (provider) => {
    const f = await fixture(provider);
    const name = providerTools[provider][1];
    const authorize = async () => {
      f.retireCredential();
      return () => {};
    };
    await expect(
      f.service.callTool(f.server.serverId, name, {}, f.context, undefined, authorize),
    ).rejects.toThrow(/revoked|changed|cancel/);
    expect(f.calls).toHaveLength(0);
    expect(f.repo.db.prepare("SELECT count(*) AS count FROM outbound_mcp_calls").get()).toMatchObject({
      count: 0,
    });
    f.loseResponse();
    const output = await f.service.callTool(f.server.serverId, name, {}, f.context, undefined, f.authorize);
    expect(output).toMatchObject({ status: "uncertain", isError: true });
    expect(f.calls).toHaveLength(1);
    expect(f.repo.db.prepare("SELECT status FROM outbound_mcp_calls").get()).toMatchObject({
      status: "uncertain",
    });
  },
);

it.each(["notion", "slack"] as const)(
  "withholds late %s results when the original credential retires",
  async (provider) => {
    const f = await fixture(provider);
    f.beforeResult(f.retireCredential);
    const output = await f.service.callTool(
      f.server.serverId,
      providerTools[provider][0],
      {},
      f.context,
      undefined,
      f.authorize,
    );
    expect(output).toMatchObject({ status: "uncertain", isError: true });
    expect(output.output).not.toContain("Fixture result");
    expect(f.calls).toHaveLength(1);
  },
);

it.each(["notion", "slack"] as const)(
  "does not connect %s without an available OAuth credential service",
  async (provider) => {
    const repo = new Repo(openDb(":memory:"));
    closes.push(() => repo.close());
    const workspaceId = new TaskService(repo, new EventBus(repo)).createWorkspace(
      "Unconfigured fixture",
    ).workspaceId;
    const network = vi.fn<typeof fetch>();
    const service = new OutboundMcpService(repo, createMcpTransportProvider(undefined, network));
    const server = await service.register({
      workspaceId,
      name: provider,
      source: { kind: "remote", url: `https://mcp.${provider}.com/mcp`, auth: "oauth" },
    });
    await expect(service.listTools(server.serverId)).rejects.toThrow(/OAuth/);
    expect(network).not.toHaveBeenCalled();
    expect(service.get(server.serverId)).toMatchObject({ state: "active", toolNames: [] });
  },
);

it("keeps a Slack upload allocation explicit when completion is uncertain without repeating the write", async () => {
  const f = await fixture("slack");
  f.setResult({
    content: [{ type: "text", text: "Fixture allocation" }],
    structuredContent: { file_id: "F_PENDING", status: "pending_upload" },
  });
  const allocated = await f.service.callTool(
    f.server.serverId,
    "slack_get_file_upload_url",
    { filename: "fixture.txt", length: 12 },
    f.context,
    undefined,
    f.authorize,
  );
  expect(JSON.parse(allocated.output).structuredContent).toEqual({
    file_id: "F_PENDING",
    status: "pending_upload",
  });
  f.loseResponse();
  const completion = await f.service.callTool(
    f.server.serverId,
    "slack_complete_file_upload",
    { files: [{ id: "F_PENDING" }], channel_id: "C_FIXTURE" },
    f.context,
    undefined,
    f.authorize,
  );
  expect(completion).toMatchObject({ status: "uncertain", isError: true });
  expect(f.calls.map((call) => call.name)).toEqual([
    "slack_get_file_upload_url",
    "slack_complete_file_upload",
  ]);
  expect(f.repo.db.prepare("SELECT status FROM outbound_mcp_calls ORDER BY created_at, rowid").all()).toEqual(
    [{ status: "completed" }, { status: "uncertain" }],
  );
});
