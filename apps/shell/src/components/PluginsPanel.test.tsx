// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { PluginsPanel } from "./PluginsPanel";

vi.mock("../use-feature", () => ({ useFeature: () => false }));

const rpc = vi.hoisted(() => vi.fn());
const openDirectory = vi.hoisted(() => vi.fn());
vi.mock("../bridge", () => ({
  bridge: {
    invoke: rpc,
    openPluginDirectory: openDirectory,
    openFile: vi.fn(async () => null),
  },
}));

let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
const workspaceId = "11111111-1111-4111-8111-111111111111";
const pluginId = "22222222-2222-4222-8222-222222222222";
const digest = "a".repeat(64);
const plugin = {
  pluginId,
  workspaceId,
  name: "research-kit",
  version: "1.0",
  routineIds: [],
  installedAt: 1000,
};
const inspection = {
  name: "research-kit",
  version: "1.0",
  routineCount: 0,
  routineTitles: [],
  format: "claude-code",
  digest,
  assets: [
    { kind: "skill", name: "research" },
    { kind: "mcp_server", name: "records" },
    { kind: "hook", name: "PostToolUse" },
  ],
};

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}
function button(label: string) {
  const found = [...container.querySelectorAll("button")].find((item) => item.textContent?.trim() === label);
  if (!found) throw new Error(`Missing ${label}`);
  return found;
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  rpc.mockReset();
  openDirectory.mockReset();
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

it("reviews compatible components, binds install to the digest, and shows zero authority", async () => {
  let installed = false;
  openDirectory.mockResolvedValue("/synthetic/research-kit");
  rpc.mockImplementation(async (method: string, params: Record<string, unknown>) => {
    if (method === "workspaces.list") return [{ workspaceId, name: "Research" }];
    if (method === "plugins.list") return installed ? [plugin] : [];
    if (method === "plugins.inspect") return inspection;
    if (method === "plugins.install") {
      installed = true;
      return { plugin, imported: 0, skipped: 0 };
    }
    if (method === "plugins.assets")
      return [
        {
          assetId: "asset",
          pluginId,
          kind: "mcp_server",
          name: "records",
          authority: "none",
          digest,
          importedAt: 1000,
        },
      ];
    if (method === "plugins.skills.grants") return [];
    throw new Error(`Unexpected ${method} ${JSON.stringify(params)}`);
  });
  await act(async () => root.render(<PluginsPanel />));
  await flush();
  await act(async () => button("Choose compatible folder…").click());
  await flush();
  expect(container.textContent).toContain("Nothing runs or connects on import.");
  expect(container.textContent).toContain("PostToolUse");
  await act(async () => button("Install into this Space").click());
  await flush();
  expect(rpc).toHaveBeenCalledWith("plugins.install", {
    path: "/synthetic/research-kit",
    workspaceId,
    expectedDigest: digest,
  });
  expect(container.textContent).toContain("No authority");
  expect(rpc).not.toHaveBeenCalledWith("mcp.servers.register", expect.anything());
});

it("grants and revokes one reviewed imported Skill from Settings", async () => {
  const assetId = "33333333-3333-4333-8333-333333333333";
  const grantId = "44444444-4444-4444-8444-444444444444";
  let grant:
    | {
        grantId: string;
        assetId: string;
        assetDigest: string;
        scope: { kind: "workspace"; workspaceId: string };
        createdAt: number;
        revokedAt?: number;
      }
    | undefined;
  rpc.mockImplementation(async (method: string) => {
    if (method === "workspaces.list") return [{ workspaceId, name: "Research" }];
    if (method === "plugins.list") return [plugin];
    if (method === "plugins.assets")
      return [
        {
          assetId,
          pluginId,
          kind: "skill",
          name: "research",
          content: "Use cited evidence.",
          authority: "none",
          digest,
          importedAt: 1000,
        },
      ];
    if (method === "plugins.skills.grants") return grant ? [grant] : [];
    if (method === "plugins.skills.grant") {
      grant = {
        grantId,
        assetId,
        assetDigest: digest,
        scope: { kind: "workspace", workspaceId },
        createdAt: 1000,
      };
      return grant;
    }
    if (method === "plugins.skills.revoke") {
      grant = { ...grant!, revokedAt: 2000 };
      return grant;
    }
    throw new Error(`Unexpected ${method}`);
  });
  await act(async () => root.render(<PluginsPanel />));
  await flush();
  await act(async () => button("research-kit1.0 · 0 Skills").click());
  await flush();
  expect(container.textContent).toContain("No authority");
  await act(async () => button("Grant Skill to this Space").click());
  expect(rpc).toHaveBeenCalledWith("plugins.skills.grant", {
    assetId,
    expectedDigest: digest,
    scope: { kind: "workspace", workspaceId },
  });
  expect(container.textContent).toContain("Granted in this Space");
  await act(async () => button("Revoke Skill access").click());
  expect(rpc).toHaveBeenCalledWith("plugins.skills.revoke", { grantId });
  expect(container.textContent).toContain("No authority");
});
