// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Hooks } from "./Hooks";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("../store", () => ({ call: rpc }));
let root: Root;
let container: HTMLDivElement;
const serverId = "11111111-1111-4111-8111-111111111111";
const hookId = "33333333-3333-4333-8333-333333333333";
const digest = "a".repeat(64);

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  rpc.mockReset();
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
function button(label: string) {
  const found = [...container.querySelectorAll("button")].find((item) => item.textContent?.trim() === label);
  if (!found) throw new Error(`Missing ${label}`);
  return found;
}
function change(selector: string, value: string) {
  const field = container.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    selector,
  )!;
  const prototype =
    field instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : field instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value")!.set!.call(field, value);
  field.dispatchEvent(new Event("change", { bubbles: true }));
  field.dispatchEvent(new Event("input", { bubbles: true }));
}

it("creates a selected run-start Hook with the exact enabled tool and no second approval", async () => {
  let hook: Record<string, unknown> | undefined;
  rpc.mockImplementation(async (method: string, params: Record<string, unknown>) => {
    if (method === "hooks.list") return hook ? [hook] : [];
    if (method === "mcp.servers.list")
      return [{ serverId, workspaceId: "space-1", name: "Fixture", state: "active" }];
    if (method === "mcp.tools.list") return [{ name: "record", enabled: true, inputSchema: {} }];
    if (method === "workspaces.folders.list") return [];
    if (method === "hooks.register") {
      hook = { hookId, ...params, handlerDigest: digest, trust: "approved" };
      return hook;
    }
    if (method === "hooks.invocations") return [];
    if (method === "hooks.test")
      return { hookId, eventId: "manual:test", state: "completed", createdAt: Date.now() };
    if (method === "hooks.revoke") {
      hook = { ...hook, trust: "revoked" };
      return hook;
    }
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () => root.render(<Hooks workspaceId="space-1" />));
  await act(async () => change('select[aria-label="Hook run event"]', "run.start"));
  await act(async () => change('select[aria-label="Hook MCP tool"]', JSON.stringify([serverId, "record"])));
  await act(async () => button("Create Hook").click());
  expect(rpc).toHaveBeenCalledWith("hooks.register", {
    workspaceId: "space-1",
    event: "run.start",
    handler: { type: "mcp_tool", serverId, toolName: "record", arguments: {} },
  });
  expect(container.textContent).toContain(digest);
  expect(container.textContent).not.toContain("Approve exact Hook");
  await act(async () => button("Test Hook now").click());
  expect(rpc).toHaveBeenCalledWith("hooks.test", { hookId });
  await act(async () => button("Revoke Hook").click());
  expect(rpc).toHaveBeenCalledWith("hooks.revoke", { hookId });
});

it("reviews a command Hook in an already bound writable Space folder", async () => {
  let hook: Record<string, unknown> | undefined;
  rpc.mockImplementation(async (method: string, params: Record<string, unknown>) => {
    if (method === "hooks.list") return hook ? [hook] : [];
    if (method === "mcp.servers.list") return [];
    if (method === "workspaces.folders.list")
      return [{ folderId: "folder-1", path: "/tmp/project", access: "readWrite", workspaceId: "space-1" }];
    if (method === "hooks.register") {
      hook = { hookId, ...params, handlerDigest: digest, trust: "approved" };
      return hook;
    }
    if (method === "hooks.invocations") return [];
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () => root.render(<Hooks workspaceId="space-1" />));
  await act(async () => change('select[aria-label="Hook handler"]', "command"));
  await act(async () => change('select[aria-label="Hook command folder"]', "/tmp/project"));
  await act(async () => change('textarea[aria-label="Hook command"]', "pwd"));
  await act(async () => button("Create Hook").click());
  expect(rpc).toHaveBeenCalledWith("hooks.register", {
    workspaceId: "space-1",
    event: "run.end",
    handler: { type: "command", command: "pwd", workdir: "/tmp/project" },
  });
  expect(container.textContent).toContain("Command");
  expect(container.textContent).toContain("/tmp/project");
});
