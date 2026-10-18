// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ReviewedConnectors } from "./ReviewedConnectors";

const rpc = vi.hoisted(() => vi.fn());
const openTask = vi.hoisted(() => vi.fn());
vi.mock("../store", () => ({ call: rpc }));
vi.mock("../task-navigation", () => ({ openSavedTask: openTask }));

let container: HTMLDivElement;
let root: Root;
const workspaceId = "11111111-1111-4111-8111-111111111111";
const taskId = "22222222-2222-4222-8222-222222222222";
const projectId = "33333333-3333-4333-8333-333333333333";
const connectionId = "44444444-4444-4444-8444-444444444444";
const grantId = "55555555-5555-4555-8555-555555555555";
const serverId = "66666666-6666-4666-8666-666666666666";

const task = {
  taskId,
  workspaceId,
  title: "Release review",
  revision: 2,
  state: "open",
  resources: [
    {
      resourceId: "repo",
      kind: "repository",
      projectId,
      label: "Web app",
      locator: "/synthetic/web",
      access: "read",
    },
  ],
};
const entries = [
  {
    kind: "calendar",
    connectorId: `calendar:${connectionId}`,
    connectionId,
    label: "Team Calendar",
    accountKey: "team@example.test",
    revision: "a".repeat(64),
    state: "active",
    authority: "calendar_account",
  },
  {
    kind: "mcp",
    connectorId: `mcp:${serverId}`,
    serverId,
    sourceDigest: "b".repeat(64),
    toolsRevision: 3,
    label: "Research tools",
    state: "active",
    authority: "connected_server",
  },
];

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}
function button(label: string) {
  const found = [...container.querySelectorAll("button")].find((item) => item.textContent?.trim() === label);
  if (!found) throw new Error(`Button ${label} is missing`);
  return found;
}
function selectConnector(id: string) {
  const found = [...container.querySelectorAll<HTMLButtonElement>(".reviewed-connectors-list button")].find(
    (item) => item.textContent?.includes(id),
  );
  if (!found) throw new Error(`Connector ${id} is missing`);
  act(() => found.click());
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  rpc.mockReset();
  openTask.mockReset();
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

it("reviews Calendar grants and revocation against the runtime catalog", async () => {
  let granted = false;
  rpc.mockImplementation(async (method: string, params: Record<string, unknown>) => {
    if (method === "workspaces.list") return [{ workspaceId, name: "Product" }];
    if (method === "tasks.list") return [task];
    if (method === "connectors.catalog")
      return {
        entries,
        bindings: {},
        access: granted
          ? [
              {
                kind: "calendar",
                connectorId: `calendar:${connectionId}`,
                taskId,
                taskRevision: 2,
                grantId,
                authority: "calendar_task_grant",
              },
            ]
          : [],
      };
    if (method === "calendar.taskGrants.create") {
      granted = true;
      return { grantId };
    }
    if (method === "calendar.taskGrants.revoke") {
      granted = false;
      return { ok: true };
    }
    throw new Error(`Unexpected RPC ${method} ${JSON.stringify(params)}`);
  });
  await act(async () => root.render(<ReviewedConnectors onManage={vi.fn()} />));
  await flush();
  await flush();
  expect(container.textContent).toContain("Team Calendar");
  expect(container.textContent).toContain("No access for this task revision.");
  act(() => button("Review Calendar grant").click());
  expect(container.textContent).toContain("This task and its scoped agents may read events");
  expect(rpc).not.toHaveBeenCalledWith("calendar.taskGrants.create", expect.anything());
  await act(async () => button("Grant account").click());
  await flush();
  expect(rpc).toHaveBeenCalledWith("calendar.taskGrants.create", {
    taskId,
    expectedRevision: 2,
    connectionId,
  });
  expect(container.textContent).toContain("Granted to Release review · revision 2");
  act(() => button("Review revocation").click());
  expect(container.textContent).toContain("Further task reads through this grant will stop immediately.");
  await act(async () => button("Revoke grant").click());
  await flush();
  expect(rpc).toHaveBeenCalledWith("calendar.taskGrants.revoke", { taskId, grantId });
  expect(container.textContent).toContain("No access for this task revision.");
});

it("shows MCP authority and opens its management surface", async () => {
  const onManage = vi.fn();
  openTask.mockResolvedValue(undefined);
  rpc.mockImplementation(async (method: string) => {
    if (method === "workspaces.list") return [{ workspaceId, name: "Product" }];
    if (method === "tasks.list") return [task];
    if (method === "connectors.catalog")
      return {
        entries,
        bindings: {},
        access: [
          {
            kind: "mcp",
            connectorId: `mcp:${serverId}`,
            taskId,
            taskRevision: 2,
            toolsRevision: 3,
            toolName: "search",
            authority: "enabled_mcp_tool",
          },
        ],
      };
    throw new Error(`Unexpected RPC ${method}`);
  });
  await act(async () => root.render(<ReviewedConnectors onManage={onManage} />));
  await flush();
  await flush();
  selectConnector("Research tools");
  expect(container.textContent).toContain("search · enabled · tools revision 3");
  expect(container.querySelector(".reviewed-connectors-state")?.textContent).toBe("Registered");
  expect(container.textContent).toContain("Required authorization and tool discovery");
  act(() => button("Manage server and tools").click());
  expect(onManage).toHaveBeenCalledWith("mcp");
  expect(rpc).not.toHaveBeenCalledWith("mcp.grants.create", expect.anything());
});

it("does not show a grant when the runtime rejects a stale task revision", async () => {
  rpc.mockImplementation(async (method: string) => {
    if (method === "workspaces.list") return [{ workspaceId, name: "Product" }];
    if (method === "tasks.list") return [task];
    if (method === "connectors.catalog") return { entries, access: [], bindings: {} };
    if (method === "calendar.taskGrants.create")
      throw new Error("Task revision changed. Review access again.");
    throw new Error(`Unexpected RPC ${method}`);
  });
  await act(async () => root.render(<ReviewedConnectors onManage={vi.fn()} />));
  await flush();
  await flush();
  act(() => button("Review Calendar grant").click());
  await act(async () => button("Grant account").click());
  expect(container.querySelector('[role="alert"]')?.textContent).toContain("Task revision changed");
  expect(container.textContent).toContain("No access for this task revision.");
});

it("distinguishes a loaded empty catalog from an unavailable catalog without inventing connections", async () => {
  let unavailable = false;
  rpc.mockImplementation(async (method: string) => {
    if (method === "workspaces.list") return [{ workspaceId, name: "Product" }];
    if (method === "tasks.list") return [];
    if (method === "connectors.catalog") {
      if (unavailable) throw new Error("Runtime unavailable");
      return { entries: [], access: [], bindings: {} };
    }
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () => root.render(<ReviewedConnectors onManage={vi.fn()} />));
  await flush();
  expect(container.textContent).toContain("No connections yet.");
  expect(container.textContent).not.toContain("Choose a connection to review.");
  expect(container.querySelector('[aria-label="Reviewed connections"]')).toBeNull();
  unavailable = true;
  await act(async () => button("Refresh").click());
  await flush();
  expect(container.textContent).not.toContain("No connections yet.");
  expect(container.textContent).toContain("Connection access could not be loaded.");
  expect(container.querySelector('[role="alert"]')?.textContent).toContain("Runtime unavailable");
});

it("keeps an unconfigured MCP registration distinct from a connected account", async () => {
  rpc.mockImplementation(async (method: string) => {
    if (method === "workspaces.list") return [{ workspaceId, name: "Product" }];
    if (method === "tasks.list") return [task];
    if (method === "connectors.catalog") return { entries, bindings: {}, access: [] };
    throw new Error(`Unexpected RPC ${method}`);
  });
  await act(async () => root.render(<ReviewedConnectors onManage={vi.fn()} />));
  await flush();
  await flush();
  expect(container.querySelector(".reviewed-connectors-state")?.textContent).toBe("Connected");
  selectConnector("Research tools");
  expect(container.querySelector(".reviewed-connectors-state")?.textContent).toBe("Registered");
  expect(container.textContent).toContain("No access for this task revision.");
  expect(rpc.mock.calls.map(([method]) => method)).not.toContain("mcp.oauth.start");
});
