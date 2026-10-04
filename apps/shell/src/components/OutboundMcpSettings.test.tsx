// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { OutboundMcpGrantSchema, OutboundMcpServerSchema } from "@aux/contracts";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { OutboundMcpSettings } from "./OutboundMcpSettings";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("../store", () => ({ call: rpc }));
vi.mock("../bridge", () => ({ bridge: { openFile: vi.fn(), openExternal: vi.fn() } }));

let container: HTMLDivElement;
let root: Root;
const serverId = "11111111-1111-4111-8111-111111111111";
const digest = "a".repeat(64);
const server = () => ({
  serverId,
  workspaceId: "workspace-1",
  name: "Research tools",
  source: { kind: "remote", url: "https://tools.example/mcp", auth: "oauth" },
  state: "pending",
  sourceDigest: digest,
  createdAt: 1,
  updatedAt: 1,
});

function button(label: string) {
  const found = [...container.querySelectorAll("button")].find((item) => item.textContent?.trim() === label);
  if (!found) throw new Error(`Button ${label} is missing`);
  return found;
}
async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  rpc.mockReset();
  vi.mocked(bridge.openFile).mockReset();
  vi.mocked(bridge.openExternal).mockReset();
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

it("requires exact server-source review and a separate tool, scope and limit grant", async () => {
  let current = server();
  let grants: unknown[] = [];
  rpc.mockImplementation(async (method: string, params: Record<string, unknown>) => {
    if (method === "workspaces.list") return [{ workspaceId: "workspace-1", name: "Research" }];
    if (method === "tasks.list") return [];
    if (method === "mcp.servers.list") return [current];
    if (method === "mcp.grants.list") return grants;
    if (method === "mcp.servers.approve") {
      current = { ...current, state: "approved" };
      return current;
    }
    if (method === "mcp.oauth.status") return { connected: true, expiresAt: Date.now() + 60_000 };
    if (method === "mcp.oauth.start")
      return {
        state: "authorization",
        url: "https://auth.example.test/authorize",
        expiresAt: Date.now() + 60_000,
      };
    if (method === "mcp.oauth.clear") return { connected: false };
    if (method === "mcp.tools.list")
      return [{ name: "search", description: "Search a fixture", inputSchema: {} }];
    if (method === "mcp.grants.create") {
      grants = [{ ...params, grantId: "grant-1", createdAt: 1 }];
      return grants[0];
    }
    if (method === "mcp.tools.call")
      return { callId: "call-1", status: "completed", output: "Fixture result", isError: false };
    if (method === "mcp.grants.revoke") {
      grants = grants.map((grant) => ({ ...(grant as object), revokedAt: 2 }));
      return grants[0];
    }
    if (method === "mcp.servers.revoke") {
      current = { ...current, state: "revoked" };
      return current;
    }
    throw new Error(`Unexpected RPC ${method}`);
  });

  await act(async () => root.render(<OutboundMcpSettings />));
  await flush();
  await flush();
  expect(container.textContent).toContain("https://tools.example/mcp");
  expect(container.textContent).toContain(digest);
  expect(container.textContent).toContain("Server approval alone never grants tool access.");
  await act(async () => button("Approve this server source").click());
  await flush();
  expect(rpc).toHaveBeenCalledWith("mcp.servers.approve", { serverId, expectedDigest: digest });

  await flush();
  expect(container.textContent).toContain("Connected in this Profile");
  await act(async () => button("Disconnect OAuth").click());
  expect(rpc).toHaveBeenCalledWith("mcp.oauth.clear", { serverId });
  await act(async () => button("Connect OAuth").click());
  expect(bridge.openExternal).not.toHaveBeenCalled();
  expect(container.textContent).toContain("https://auth.example.test/authorize");
  await act(async () => button("Open reviewed authorization page").click());
  expect(bridge.openExternal).toHaveBeenCalledWith("https://auth.example.test/authorize");

  await act(async () => button("Load available tools").click());
  await flush();
  const tool = container.querySelector<HTMLSelectElement>('select[aria-label="MCP tool"]')!;
  const scope = container.querySelector<HTMLSelectElement>('select[aria-label="MCP tool scope"]')!;
  const mode = container.querySelector<HTMLSelectElement>('select[aria-label="MCP grant duration"]')!;
  act(() => {
    tool.value = "search";
    tool.dispatchEvent(new Event("change", { bubbles: true }));
  });
  act(() => {
    scope.value = "workspace";
    scope.dispatchEvent(new Event("change", { bubbles: true }));
  });
  act(() => {
    mode.value = "standing";
    mode.dispatchEvent(new Event("change", { bubbles: true }));
  });
  act(() => button("Review tool grant").click());
  expect(container.textContent).toContain("Every task in Research");
  expect(container.textContent).toContain("2,000 tokens");
  await act(async () => button("Approve tool grant").click());
  await flush();
  expect(rpc).toHaveBeenCalledWith("mcp.grants.create", {
    serverId,
    toolName: "search",
    scope: { kind: "workspace", workspaceId: "workspace-1" },
    mode: "standing",
    outputTokenLimit: 2000,
  });
  act(() => button("Call tool…").click());
  await act(async () => button("Run approved tool").click());
  await flush();
  expect(rpc).toHaveBeenCalledWith("mcp.tools.call", {
    grantId: "grant-1",
    arguments: {},
    context: { workspaceId: "workspace-1" },
  });
  expect(container.textContent).toContain("Fixture result");
  await act(async () => button("Revoke tool").click());
  await flush();
  expect(rpc).toHaveBeenCalledWith("mcp.grants.revoke", { grantId: "grant-1" });
  await act(async () => button("Revoke server and grants").click());
  await flush();
  expect(rpc).toHaveBeenCalledWith("mcp.servers.revoke", { serverId });
  expect(container.textContent).toContain("This server is revoked.");
});

it("inspects a bundle before registration and submits its reviewed file fingerprint", async () => {
  const path = "/tmp/research.mcpb";
  const sha256 = "b".repeat(64);
  const inspection = {
    path,
    sha256,
    format: "mcpb",
    name: "Research bundle",
    server: { type: "node", entry_point: "server.js" },
  };
  let registered: Record<string, unknown> | null = null;
  vi.mocked(bridge.openFile).mockResolvedValue(path);
  rpc.mockImplementation(async (method: string) => {
    if (method === "workspaces.list") return [{ workspaceId: "workspace-1", name: "Research" }];
    if (method === "tasks.list") return [];
    if (method === "mcp.servers.list") return registered ? [registered] : [];
    if (method === "mcp.bundles.inspect") return inspection;
    if (method === "mcp.servers.register") {
      registered = {
        ...server(),
        name: inspection.name,
        source: { kind: "bundle", path, sha256, format: "mcpb" },
      };
      return registered;
    }
    if (method === "mcp.grants.list") return [];
    throw new Error(`Unexpected RPC ${method}`);
  });

  await act(async () => root.render(<OutboundMcpSettings />));
  await flush();
  const source = container.querySelector<HTMLSelectElement>('select[aria-label="MCP source type"]')!;
  act(() => {
    source.value = "bundle";
    source.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await act(async () => button("Choose and inspect bundle…").click());
  await flush();
  expect(rpc).toHaveBeenCalledWith("mcp.bundles.inspect", { path });
  expect(container.textContent).toContain("server.js");
  expect(container.textContent).toContain(sha256);
  await act(async () => button("Save server for review").click());
  await flush();
  expect(rpc).toHaveBeenCalledWith("mcp.servers.register", {
    workspaceId: "workspace-1",
    name: inspection.name,
    source: { kind: "bundle", path, sha256, format: "mcpb" },
  });
  expect(container.textContent).toContain("Approve this server source");
});

it("contains full long tool and Space names in the original grant row without altering actions", async () => {
  const toolName = "tool_" + "x".repeat(180),
    spaceName = "Research_" + "y".repeat(80);
  const approved = OutboundMcpServerSchema.parse({ ...server(), state: "approved" });
  const grant = OutboundMcpGrantSchema.parse({
    grantId: "22222222-2222-4222-8222-222222222222",
    serverId,
    toolName,
    scope: { kind: "workspace", workspaceId: "workspace-1" },
    mode: "standing",
    outputTokenLimit: 1024,
    createdAt: 1,
  });
  rpc.mockImplementation(async (method: string) => {
    if (method === "workspaces.list") return [{ workspaceId: "workspace-1", name: spaceName }];
    if (method === "tasks.list" || method === "mcp.tools.list") return [];
    if (method === "mcp.servers.list") return [approved];
    if (method === "mcp.oauth.status") return { connected: true };
    if (method === "mcp.grants.list") return [grant];
    throw new Error(`Unexpected long-label read ${method}`);
  });
  await act(async () => root.render(<OutboundMcpSettings />));
  await flush();
  await flush();
  const row = container.querySelector<HTMLElement>(".mcp-grant-row")!;
  expect(row.querySelector("strong")?.textContent).toBe(toolName);
  expect(row.querySelector(".hint")?.textContent).toContain(spaceName);
  const require = createRequire(import.meta.url),
    postcss = createRequire(require.resolve("vite"))("postcss");
  const css = readFileSync(new URL("./OutboundMcpSettings.css", new URL(import.meta.url)), "utf8"),
    sheet = postcss.parse(css);
  let originalRule = "";
  sheet.walkRules((rule: { selector: string; toString(): string }) => {
    if (rule.selector === ".outbound-mcp .mcp-grant-row > div") originalRule = rule.toString();
  });
  const style = document.createElement("style");
  style.textContent = originalRule;
  document.head.append(style);
  try {
    const text = row.firstElementChild as HTMLElement,
      computed = getComputedStyle(text);
    expect(computed.maxWidth).toBe("100%");
    expect(computed.overflowWrap).toBe("anywhere");
    expect(computed.display).toBe("grid");
    const actions = [...row.querySelectorAll("button")];
    expect(actions.map((action) => action.textContent?.trim())).toEqual(["Call tool…", "Revoke tool"]);
    expect(actions.every((action) => !action.disabled)).toBe(true);
    actions[0]!.focus();
    expect(document.activeElement).toBe(actions[0]);
    expect(
      rpc.mock.calls.some(([method]) =>
        ["mcp.grants.create", "mcp.tools.call", "mcp.grants.revoke"].includes(method),
      ),
    ).toBe(false);
  } finally {
    style.remove();
  }
});
