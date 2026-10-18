// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { OutboundMcpServerSchema } from "@aux/contracts";
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
  state: "active",
  toolsRevision: 7,
  toolNames: ["search"],
  disabledTools: [] as string[],
  sourceDigest: digest,
  createdAt: 1,
  updatedAt: 1,
});

function button(label: string) {
  const found = [...document.querySelectorAll("button")].find((item) => item.textContent?.trim() === label);
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

it("preserves OAuth review and revision-bound tool toggles and exact call context", async () => {
  let current = server();
  rpc.mockImplementation(async (method: string, params: Record<string, unknown>) => {
    if (method === "workspaces.list") return [{ workspaceId: "workspace-1", name: "Research" }];
    if (method === "tasks.list") return [];
    if (method === "mcp.servers.list") return [current];
    if (method === "mcp.oauth.status") return { connected: true };
    if (method === "mcp.oauth.clear") return { connected: false };
    if (method === "mcp.oauth.start")
      return {
        state: "authorization",
        url: "https://auth.example.test/authorize",
        expiresAt: Date.now() + 60_000,
      };
    if (method === "mcp.tools.list") {
      current = { ...current, toolsRevision: 8 };
      return [{ name: "search", description: "Search a fixture", inputSchema: {}, enabled: true }];
    }
    if (method === "mcp.tools.setEnabled") {
      current = {
        ...current,
        toolsRevision: current.toolsRevision + 1,
        disabledTools: params.enabled ? [] : ["search"],
      };
      return current;
    }
    if (method === "mcp.tools.call")
      return { callId: "call-1", status: "completed", output: "Fixture result", isError: false };
    if (method === "mcp.servers.revoke") {
      current = { ...current, state: "revoked" };
      return current;
    }
    throw new Error(`Unexpected RPC ${method}`);
  });
  await act(async () => root.render(<OutboundMcpSettings />));
  await flush();
  await flush();
  expect(container.textContent).toContain(digest);
  expect(container.textContent).toContain("Connected in this Profile");
  await act(async () => button("Disconnect OAuth").click());
  expect(rpc).toHaveBeenCalledWith("mcp.oauth.clear", { serverId });
  await act(async () => button("Connect OAuth").click());
  expect(bridge.openExternal).not.toHaveBeenCalled();
  await act(async () => button("Open reviewed authorization page").click());
  expect(bridge.openExternal).toHaveBeenCalledWith("https://auth.example.test/authorize");
  await act(async () => button("Load available tools").click());
  await flush();
  const toggle = container.querySelector<HTMLInputElement>('input[aria-label="Enable search"]')!;
  await act(async () => toggle.click());
  expect(rpc).toHaveBeenCalledWith("mcp.tools.setEnabled", {
    serverId,
    toolName: "search",
    enabled: false,
    expectedRevision: 8,
  });
  expect(button("Call tool…").disabled).toBe(true);
  await act(async () => toggle.click());
  expect(rpc).toHaveBeenCalledWith("mcp.tools.setEnabled", {
    serverId,
    toolName: "search",
    enabled: true,
    expectedRevision: 9,
  });
  act(() => button("Call tool…").click());
  await act(async () => button("Run tool").click());
  expect(rpc).toHaveBeenCalledWith("mcp.tools.call", {
    serverId,
    toolName: "search",
    arguments: {},
    context: { workspaceId: "workspace-1" },
  });
  expect(container.textContent).toContain("Fixture result");
  await act(async () => button("Disconnect server").click());
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
    throw new Error(`Unexpected RPC ${method}`);
  });

  await act(async () => root.render(<OutboundMcpSettings />));
  await flush();
  await act(async () => button("＋ Add server…").click());
  const source = document.querySelector<HTMLSelectElement>('select[aria-label="MCP source type"]')!;
  act(() => {
    source.value = "bundle";
    source.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await act(async () => button("Choose and inspect bundle…").click());
  await flush();
  expect(rpc).toHaveBeenCalledWith("mcp.bundles.inspect", { path });
  expect(document.body.textContent).toContain("server.js");
  expect(document.body.textContent).toContain(sha256);
  await act(async () => button("Add server").click());
  await flush();
  expect(rpc).toHaveBeenCalledWith("mcp.servers.register", {
    workspaceId: "workspace-1",
    name: inspection.name,
    source: { kind: "bundle", path, sha256, format: "mcpb" },
  });
  expect(container.textContent).toContain("active");
});

it("wraps full long tool names and retains keyboard access to actual controls", async () => {
  const toolName = "tool_" + "x".repeat(180),
    spaceName = "Research_" + "y".repeat(80);
  const active = OutboundMcpServerSchema.parse(server());
  rpc.mockImplementation(async (method: string) => {
    if (method === "workspaces.list") return [{ workspaceId: "workspace-1", name: spaceName }];
    if (method === "tasks.list") return [];
    if (method === "mcp.tools.list") return [{ name: toolName, inputSchema: {}, enabled: true }];
    if (method === "mcp.servers.list") return [active];
    if (method === "mcp.oauth.status") return { connected: true };
    throw new Error(`Unexpected long-label read ${method}`);
  });
  await act(async () => root.render(<OutboundMcpSettings />));
  await flush();
  await flush();
  await act(async () => button("Load available tools").click());
  const row = container.querySelector<HTMLElement>(".mcp-tool-access-row")!;
  expect(row.querySelector("strong")?.textContent).toBe(toolName);
  expect(container.querySelector('select[aria-label="MCP Space"]')?.textContent).toContain(spaceName);
  const require = createRequire(import.meta.url),
    postcss = createRequire(require.resolve("vite"))("postcss");
  const sheet = postcss.parse(
    readFileSync(new URL("../features/mcp/ToolAccess.css", new URL(import.meta.url)), "utf8"),
  );
  let originalRule = "";
  sheet.walkRules((rule: { selector: string; toString(): string }) => {
    if (rule.selector === ".mcp-tool-access-row label > span") originalRule = rule.toString();
  });
  const style = document.createElement("style");
  style.textContent = originalRule;
  document.head.append(style);
  try {
    const computed = getComputedStyle(row.querySelector("label > span")!);
    expect(computed.overflowWrap).toBe("anywhere");
    expect(computed.display).toBe("grid");
    const action = button("Call tool…");
    expect(action.disabled).toBe(false);
    action.focus();
    expect(document.activeElement).toBe(action);
    expect(
      rpc.mock.calls.some(([method]) => method === "mcp.tools.call" || method === "mcp.tools.setEnabled"),
    ).toBe(false);
  } finally {
    style.remove();
  }
});

async function openRemoteServerEditor() {
  await act(async () => root.render(<OutboundMcpSettings />));
  await flush();
  const opener = button("＋ Add server…");
  await act(async () => opener.click());
  const dialog = document.querySelector<HTMLDialogElement>('dialog[aria-label="Add an MCP server"]')!;
  const field = (name: string) =>
    [...dialog.querySelectorAll("label")]
      .find((label) => label.textContent?.trim() === name)!
      .querySelector("input")!;
  await act(async () => {
    for (const [name, value] of [
      ["Server name", "Fixture server"],
      ["HTTPS endpoint", "https://fixture.example/mcp"],
    ] as const) {
      const input = field(name);
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });
  return { dialog, opener };
}

it("uses one Cancel/Add footer and keeps failed registration open without submitting twice", async () => {
  let rejectRegistration!: (error: Error) => void;
  rpc.mockImplementation(async (method: string) => {
    if (method === "workspaces.list") return [{ workspaceId: "workspace-1", name: "Research" }];
    if (method === "tasks.list" || method === "mcp.servers.list") return [];
    if (method === "mcp.servers.register")
      return new Promise((_, reject) => {
        rejectRegistration = reject;
      });
    throw new Error(`Unexpected RPC ${method}`);
  });
  const { dialog } = await openRemoteServerEditor();
  const footer = dialog.querySelector("footer")!;
  expect([...footer.querySelectorAll("button")].map((item) => item.textContent)).toEqual([
    "Cancel",
    "Add server",
  ]);
  expect(dialog.textContent).not.toContain("Done");
  expect(footer.querySelectorAll('[data-control-size="32"]')).toHaveLength(2);
  await act(async () => button("Add server").click());
  expect(button("Adding…").disabled).toBe(true);
  expect(button("Cancel").disabled).toBe(true);
  await act(async () =>
    dialog.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
  expect(rpc.mock.calls.filter(([method]) => method === "mcp.servers.register")).toHaveLength(1);
  await act(async () => rejectRegistration(new Error("Fixture registration refused")));
  expect(document.querySelector('dialog[aria-label="Add an MCP server"]')).toBe(dialog);
  expect(dialog.querySelector('[role="alert"]')?.textContent).toBe("Fixture registration refused");
  expect(button("Add server").disabled).toBe(false);
  await act(async () => button("Cancel").click());
  expect(document.querySelector('dialog[aria-label="Add an MCP server"]')).toBeNull();
});

it("does not let a late successful registration close a replacement editor", async () => {
  let complete!: (value: unknown) => void;
  rpc.mockImplementation(async (method: string) => {
    if (method === "workspaces.list") return [{ workspaceId: "workspace-1", name: "Research" }];
    if (method === "tasks.list" || method === "mcp.servers.list") return [];
    if (method === "mcp.servers.register")
      return new Promise((resolve) => {
        complete = resolve;
      });
    throw new Error(`Unexpected RPC ${method}`);
  });
  const { dialog, opener } = await openRemoteServerEditor();
  await act(async () => button("Add server").click());
  await act(async () => dialog.dispatchEvent(new Event("cancel", { bubbles: false, cancelable: true })));
  expect(document.querySelector('dialog[aria-label="Add an MCP server"]')).toBeNull();
  await act(async () => opener.click());
  const replacement = document.querySelector('dialog[aria-label="Add an MCP server"]');
  expect(replacement).not.toBe(dialog);
  await act(async () => complete(server()));
  await flush();
  expect(document.querySelector('dialog[aria-label="Add an MCP server"]')).toBe(replacement);
  expect(rpc.mock.calls.filter(([method]) => method === "mcp.servers.register")).toHaveLength(1);
});

it("holds the exact local arguments and disables every source field until registration settles", async () => {
  let complete!: (value: unknown) => void;
  rpc.mockImplementation(async (method: string) => {
    if (method === "workspaces.list") return [{ workspaceId: "workspace-1", name: "Research" }];
    if (method === "tasks.list" || method === "mcp.servers.list") return [];
    if (method === "mcp.servers.register")
      return new Promise((resolve) => {
        complete = resolve;
      });
    throw new Error(`Unexpected RPC ${method}`);
  });
  const { dialog } = await openRemoteServerEditor();
  const source = dialog.querySelector<HTMLSelectElement>('[aria-label="MCP source type"]')!;
  await act(async () => {
    source.value = "local";
    source.dispatchEvent(new Event("change", { bubbles: true }));
  });
  const argumentField = dialog.querySelector<HTMLTextAreaElement>("textarea")!;
  await act(async () => {
    for (const [label, value] of [
      ["Executable path", "/fixture/node"],
      ["Working directory", "/fixture/work"],
    ] as const) {
      const input = [...dialog.querySelectorAll("label")]
        .find((item) => item.textContent?.trim() === label)!
        .querySelector("input")!;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!.call(
      argumentField,
      "--fixture\nserver.js",
    );
    argumentField.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await act(async () => button("Add server").click());
  expect(argumentField.disabled).toBe(true);
  expect(
    [
      ...dialog.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        "input,select,textarea",
      ),
    ].every((field) => field.disabled),
  ).toBe(true);
  expect(rpc).toHaveBeenCalledWith("mcp.servers.register", {
    workspaceId: "workspace-1",
    name: "Fixture server",
    source: {
      kind: "local",
      command: "/fixture/node",
      cwd: "/fixture/work",
      args: ["--fixture", "server.js"],
    },
  });
  await act(async () =>
    complete({
      ...server(),
      source: {
        kind: "local",
        command: "/fixture/node",
        cwd: "/fixture/work",
        args: ["--fixture", "server.js"],
      },
    }),
  );
  await flush();
  expect(document.querySelector('dialog[aria-label="Add an MCP server"]')).toBeNull();
  expect(rpc.mock.calls.filter(([method]) => method === "mcp.servers.register")).toHaveLength(1);
});
