import { AuxError } from "@aux/contracts";
import { fakeTransport } from "../fixtures/mcp-transport.js";
import { expect, it } from "vitest";
import {
  EventBus,
  openDb,
  OutboundMcpService,
  Repo,
  TaskService,
  type McpTransportProvider,
} from "@aux/runtime";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, realpathSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import JSZip from "jszip";

type Transport = Awaited<ReturnType<McpTransportProvider>>;

function fixture(provider?: ConstructorParameters<typeof OutboundMcpService>[1]) {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  const tasks = new TaskService(repo, new EventBus(repo));
  const workspace = tasks.createWorkspace("MCP");
  return { db, repo, tasks, workspace, service: new OutboundMcpService(repo, provider) };
}

it("records consent for the exact source and requires native supervised transport", async () => {
  const f = fixture();
  const server = await f.service.register({
    workspaceId: f.workspace.workspaceId,
    name: "local",
    source: { kind: "local", command: "/bin/echo", args: [], cwd: "/tmp" },
  });
  expect(server.state).toBe("active");
  expect(server.sourceDigest).toBe(createHash("sha256").update(JSON.stringify(server.source)).digest("hex"));
  expect(server).toMatchObject({ toolsRevision: 0, disabledTools: [], toolNames: [] });
  await expect(f.service.listTools(server.serverId)).rejects.toThrow(/Supervised/);
  f.db.close();
});

it("inspects a bundle as inert data and pins its exact bytes", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-mcp-bundle-"));
  const f = fixture();
  try {
    writeFileSync(
      join(directory, "manifest.json"),
      JSON.stringify({ name: "Example", server: { type: "node", entry_point: "index.js" } }),
    );
    writeFileSync(join(directory, "index.js"), "process.stdin.resume();");
    const bundle = join(directory, "example.mcpb");
    execFileSync("/usr/bin/zip", ["-q", bundle, "manifest.json", "index.js"], { cwd: directory });
    const sha256 = createHash("sha256").update(readFileSync(bundle)).digest("hex");
    expect(await f.service.inspectBundle(bundle)).toMatchObject({
      path: realpathSync(bundle),
      sha256,
      format: "mcpb",
      name: "Example",
    });
    const server = await f.service.register({
      workspaceId: f.workspace.workspaceId,
      name: "bundle",
      source: { kind: "bundle", path: bundle, sha256, format: "mcpb" },
    });
    expect(server.state).toBe("active");
    await expect(
      f.service.register({
        workspaceId: f.workspace.workspaceId,
        name: "changed",
        source: { kind: "bundle", path: bundle, sha256: "0".repeat(64), format: "mcpb" },
      }),
    ).rejects.toThrow(/changed/);
    expect(
      (f.repo.db.prepare("SELECT count(*) AS n FROM outbound_mcp_servers").get() as { n: number }).n,
    ).toBe(1);
  } finally {
    f.db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

it("uses the installed archive after the original is deleted and refuses tampered copies", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-mcp-installed-"));
  const seen: Buffer[] = [];
  const f = fixture();
  try {
    const zip = new JSZip();
    zip.file(
      "manifest.json",
      JSON.stringify({ name: "Installed", server: { type: "node", entry_point: "index.js" } }),
    );
    zip.file("index.js", "process.stdin.resume();");
    const bundle = join(directory, "installed.dxt");
    const bytes = await zip.generateAsync({ type: "nodebuffer" });
    writeFileSync(bundle, bytes);
    const server = await f.service.register({
      workspaceId: f.workspace.workspaceId,
      name: "installed",
      source: {
        kind: "bundle",
        path: bundle,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        format: "dxt",
      },
    });
    expect(
      (
        f.repo.db
          .prepare("SELECT archive_base64 FROM outbound_mcp_bundles WHERE server_id=?")
          .get(server.serverId) as { archive_base64: string }
      ).archive_base64,
    ).not.toContain("manifest.json");
    f.repo.db
      .prepare("UPDATE outbound_mcp_bundles SET sha256=? WHERE server_id=?")
      .run("0".repeat(64), server.serverId);
    const tampered = new OutboundMcpService(f.repo, async () => fakeTransport([]));
    await expect(tampered.listTools(server.serverId)).rejects.toThrow(/missing or changed/);
    f.repo.db
      .prepare("UPDATE outbound_mcp_bundles SET sha256=? WHERE server_id=?")
      .run(server.source.kind === "bundle" ? server.source.sha256 : "", server.serverId);
    unlinkSync(bundle);
    const restarted = new OutboundMcpService(f.repo, async (_server, _signal, installed) => {
      if (installed) seen.push(installed);
      return fakeTransport([]);
    });

    expect(await restarted.listTools(server.serverId)).toMatchObject([{ name: "read" }]);
    expect(seen).toHaveLength(1);
    expect(seen[0]?.equals(bytes)).toBe(true);
    f.repo.db
      .prepare("UPDATE outbound_mcp_bundles SET sha256=? WHERE server_id=?")
      .run("0".repeat(64), server.serverId);
    await expect(restarted.listTools(server.serverId)).rejects.toThrow(/missing or changed/);
    restarted.revoke(server.serverId);
    expect(
      f.repo.db.prepare("SELECT 1 FROM outbound_mcp_bundles WHERE server_id=?").get(server.serverId),
    ).toBeUndefined();
  } finally {
    f.db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

it("rejects a bundle with archive path traversal before approval", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-mcp-unsafe-"));
  const f = fixture();
  try {
    const zip = new JSZip();
    zip.file(
      "manifest.json",
      JSON.stringify({ name: "Unsafe", server: { type: "node", entry_point: "index.js" } }),
    );
    zip.file("index.js", "process.stdin.resume();");
    zip.file("../escape", "unsafe");
    const path = join(directory, "unsafe.mcpb");
    writeFileSync(path, await zip.generateAsync({ type: "nodebuffer" }));
    await expect(f.service.inspectBundle(path)).rejects.toThrow(/unsafe path/);
    expect(
      (f.repo.db.prepare("SELECT count(*) AS n FROM outbound_mcp_servers").get() as { n: number }).n,
    ).toBe(0);
  } finally {
    f.db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

it("rejects an oversized source archive before registration", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-mcp-oversize-"));
  const f = fixture();
  try {
    const path = join(directory, "oversize.mcpb");
    writeFileSync(path, Buffer.alloc(20_000_001));
    await expect(f.service.inspectBundle(path)).rejects.toThrow(/under 20 MB/);
    expect(
      (f.repo.db.prepare("SELECT count(*) AS n FROM outbound_mcp_bundles").get() as { n: number }).n,
    ).toBe(0);
  } finally {
    f.db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

it("rejects MCP bundle arguments that request host substitution or missing files", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-mcp-config-deny-"));
  const f = fixture();
  try {
    const zip = new JSZip();
    zip.file("server.mjs", "process.stdin.resume();");
    const path = join(directory, "configured.mcpb");
    const check = async (args: string[]) => {
      zip.file(
        "manifest.json",
        JSON.stringify({
          name: "Configured",
          server: { type: "node", entry_point: "server.mjs", mcp_config: { command: "node", args, env: {} } },
        }),
      );
      writeFileSync(path, await zip.generateAsync({ type: "nodebuffer" }));
      return f.service.inspectBundle(path);
    };
    await expect(check(["server.mjs", "${user_config.secret}"])).rejects.toThrow(/host substitution/);
    await expect(check(["server.mjs", "${__dirname}/missing.json"])).rejects.toThrow(
      /missing or unsafe file/,
    );
    await expect(check(["--require", "server.mjs"])).rejects.toThrow(/entry point first/);
  } finally {
    f.db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

it("binds tool calls to the current task revision and rejects disabled tools without duplicate effects", async () => {
  const methods: string[] = [];
  const f = fixture(async () => fakeTransport(methods));
  const task = f.tasks.create({
    workspaceId: f.workspace.workspaceId,
    title: "Read",
    objective: "Read",
    criteria: [{ criterionId: "read", description: "Read", verification: "manual" }],
  });
  const server = await f.service.register({
    workspaceId: f.workspace.workspaceId,
    name: "server",
    source: { kind: "remote", url: "https://example.test/mcp", auth: "oauth" },
  });

  await f.service.listTools(server.serverId);
  const foreign = f.tasks.createWorkspace("Other Space");
  await expect(
    f.service.callTool(server.serverId, "read", {}, { workspaceId: foreign.workspaceId }),
  ).rejects.toThrow(/outside this Space/);
  await expect(
    f.service.callTool(
      server.serverId,
      "read",
      {},
      { workspaceId: f.workspace.workspaceId, taskId: task.taskId, revision: task.revision + 1 },
    ),
  ).rejects.toThrow(/revision changed/);
  const result = await f.service.callTool(
    server.serverId,
    "read",
    {},
    { workspaceId: f.workspace.workspaceId, taskId: task.taskId, revision: task.revision },
  );
  expect(result.status).toBe("completed");
  expect(result.output).toContain("done");
  expect(methods.filter((method) => method === "tools/call")).toHaveLength(1);
  const catalog = f.service.get(server.serverId);
  f.service.setEnabled({
    serverId: server.serverId,
    toolName: "read",
    enabled: false,
    expectedRevision: catalog.toolsRevision,
  });
  expect(() =>
    f.service.setEnabled({
      serverId: server.serverId,
      toolName: "read",
      enabled: true,
      expectedRevision: catalog.toolsRevision,
    }),
  ).toThrow(/changed/);
  await expect(
    f.service.callTool(
      server.serverId,
      "read",
      {},
      { workspaceId: f.workspace.workspaceId, taskId: task.taskId, revision: task.revision },
    ),
  ).rejects.toThrow(/access changed/);
  expect((f.repo.db.prepare("SELECT count(*) AS n FROM outbound_mcp_calls").get() as { n: number }).n).toBe(
    1,
  );
  f.db.close();
});

it("caps UTF-8 tool output by display bytes before returning it to the caller", async () => {
  const f = fixture(async () =>
    fakeTransport([], { content: [{ type: "text", text: "😀".repeat(40_000) }] }),
  );
  const server = await f.service.register({
    workspaceId: f.workspace.workspaceId,
    name: "bounded",
    source: { kind: "remote", url: "https://example.test/mcp", auth: "none" },
  });

  await f.service.listTools(server.serverId);
  const result = await f.service.callTool(
    server.serverId,
    "read",
    {},
    { workspaceId: f.workspace.workspaceId },
  );
  expect(result).toMatchObject({
    status: "completed",
    isError: true,
    output: "Tool output exceeded the display limit.",
  });
  f.db.close();
});

it("recovers interrupted calls as uncertain and never replays them", async () => {
  const f = fixture();
  const server = await f.service.register({
    workspaceId: f.workspace.workspaceId,
    name: "server",
    source: { kind: "remote", url: "https://example.test/mcp", auth: "none" },
  });

  await expect(
    f.service.callTool(server.serverId, "read", {}, { workspaceId: f.workspace.workspaceId }),
  ).rejects.toThrow(/Supervised/);
  f.repo.db
    .prepare(
      "INSERT INTO outbound_mcp_calls(call_id,server_id,tool_name,status,created_at) VALUES(?,?,?,?,?)",
    )
    .run("crashed", server.serverId, "read", "invoking", Date.now());
  new OutboundMcpService(f.repo);
  expect(
    (
      f.repo.db.prepare("SELECT status FROM outbound_mcp_calls WHERE call_id='crashed'").get() as {
        status: string;
      }
    ).status,
  ).toBe("uncertain");
  f.db.close();
});

it("marks a call uncertain if its tool is disabled while a server is responding", async () => {
  let reached!: () => void;
  const ready = new Promise<void>((resolve) => {
    reached = resolve;
  });
  const f = fixture(async () => {
    const transport = fakeTransport([]);
    const send = transport.send.bind(transport);
    transport.send = async (message, options) => {
      if ("method" in message && message.method === "tools/call") {
        reached();
        return;
      }
      return send(message, options);
    };
    return transport as unknown as Transport;
  });
  const server = await f.service.register({
    workspaceId: f.workspace.workspaceId,
    name: "server",
    source: { kind: "remote", url: "https://example.test/mcp", auth: "oauth" },
  });

  await f.service.listTools(server.serverId);
  const pending = f.service.callTool(server.serverId, "read", {}, { workspaceId: f.workspace.workspaceId });
  await ready;
  f.service.setEnabled({
    serverId: server.serverId,
    toolName: "read",
    enabled: false,
    expectedRevision: f.service.get(server.serverId).toolsRevision,
  });
  expect((await pending).status).toBe("uncertain");
  expect(
    (
      f.repo.db.prepare("SELECT status FROM outbound_mcp_calls WHERE server_id=?").get(server.serverId) as {
        status: string;
      }
    ).status,
  ).toBe("uncertain");
  f.db.close();
});

it("cancels a live tool call when its OAuth credential is disconnected", async () => {
  let reached!: () => void;
  const ready = new Promise<void>((resolve) => {
    reached = resolve;
  });
  const f = fixture(async () => {
    const transport = fakeTransport([]);
    const send = transport.send.bind(transport);
    transport.send = async (message, options) => {
      if ("method" in message && message.method === "tools/call") {
        reached();
        return;
      }
      return send(message, options);
    };
    return transport as unknown as Transport;
  });
  const server = await f.service.register({
    workspaceId: f.workspace.workspaceId,
    name: "OAuth server",
    source: { kind: "remote", url: "https://example.test/mcp", auth: "oauth" },
  });

  await f.service.listTools(server.serverId);
  const pending = f.service.callTool(server.serverId, "read", {}, { workspaceId: f.workspace.workspaceId });
  await ready;
  f.service.cancelActive(server.serverId);
  expect((await pending).status).toBe("uncertain");
  expect(f.service.get(server.serverId).state).toBe("active");
  f.db.close();
});

it("stops a Hook tool call when its owning Hook is revoked", async () => {
  let reached!: () => void;
  const ready = new Promise<void>((resolve) => {
    reached = resolve;
  });
  const f = fixture(async () => {
    const transport = fakeTransport([]);
    const send = transport.send.bind(transport);
    transport.send = async (message, options) => {
      if ("method" in message && message.method === "tools/call") {
        reached();
        return;
      }
      return send(message, options);
    };
    return transport as unknown as Transport;
  });
  const server = await f.service.register({
    workspaceId: f.workspace.workspaceId,
    name: "server",
    source: { kind: "remote", url: "https://example.test/mcp", auth: "none" },
  });

  await f.service.listTools(server.serverId);
  const controller = new AbortController();
  const pending = f.service.callTool(
    server.serverId,
    "read",
    {},
    { workspaceId: f.workspace.workspaceId },
    controller.signal,
  );
  await ready;
  controller.abort();
  expect((await pending).status).toBe("uncertain");
  f.db.close();
});

it("rechecks a tool toggle after asynchronous authorization before creating an effect ledger", async () => {
  const methods: string[] = [];
  const f = fixture(async () => fakeTransport(methods));
  let reached!: () => void;
  let release!: () => void;
  const ready = new Promise<void>((resolve) => {
    reached = resolve;
  });
  const resume = new Promise<void>((resolve) => {
    release = resolve;
  });
  try {
    const server = await f.service.register({
      workspaceId: f.workspace.workspaceId,
      name: "delayed",
      source: { kind: "remote", url: "https://example.test/mcp", auth: "none" },
    });
    await f.service.listTools(server.serverId);
    const pending = f.service.callTool(
      server.serverId,
      "read",
      {},
      { workspaceId: f.workspace.workspaceId },
      undefined,
      async () => {
        reached();
        await resume;
        return () => {};
      },
    );
    await ready;
    f.service.setEnabled({
      serverId: server.serverId,
      toolName: "read",
      enabled: false,
      expectedRevision: f.service.get(server.serverId).toolsRevision,
    });
    release();
    await expect(pending).rejects.toThrow(/access changed|cancelled/);
    expect(methods.filter((method) => method === "tools/call")).toEqual([]);
    expect(f.repo.db.prepare("SELECT count(*) AS n FROM outbound_mcp_calls").get()).toMatchObject({ n: 0 });
  } finally {
    release?.();
    f.db.close();
  }
});

it("parks an authorization request without marking an unissued MCP effect uncertain", async () => {
  const methods: string[] = [];
  const f = fixture(async () => fakeTransport(methods));
  try {
    const server = await f.service.register({
      workspaceId: f.workspace.workspaceId,
      name: "asked",
      source: { kind: "remote", url: "https://example.test/mcp", auth: "none" },
    });
    await f.service.listTools(server.serverId);
    await expect(
      f.service.callTool(
        server.serverId,
        "read",
        {},
        { workspaceId: f.workspace.workspaceId },
        undefined,
        async () => {
          throw new AuxError("needs_input", "Approve this original tool call.");
        },
      ),
    ).rejects.toMatchObject({ code: "needs_input" });
    expect(methods.filter((method) => method === "tools/call")).toEqual([]);
    expect(f.repo.db.prepare("SELECT count(*) AS n FROM outbound_mcp_calls").get()).toMatchObject({ n: 0 });
  } finally {
    f.db.close();
  }
});
