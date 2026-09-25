import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { EventBus, openDb, PluginService, Repo, RoutineService, TaskService } from "@aux/runtime";

const cleanup: (() => void)[] = [];
afterEach(() => { for (const fn of cleanup.splice(0).reverse()) fn(); });

function fixture() {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Research");
  const routines = new RoutineService(repo, events);
  const plugins = new PluginService(repo, routines);
  const dir = mkdtempSync(join(tmpdir(), "aux-plugin-"));
  cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
  const bundle = (value: unknown) => {
    const path = join(dir, "plugin.json");
    writeFileSync(path, JSON.stringify(value));
    return path;
  };
  const manifest = (overrides: Record<string, unknown> = {}) => bundle({
    format: "aux-plugin@1",
    name: "Research pack",
    version: "1.2",
    description: "Reusable research routines.",
    routines: [{ title: "Vendor check", objective: "Check {{topic}} vendors", parameters: [{ name: "topic", label: "Topic" }] }],
    ...overrides,
  });
  return { workspace, routines, plugins, bundle, manifest, dir };
}

it("inspects a bundle without installing it", async () => {
  const f = fixture();
  const info = await f.plugins.inspect(f.manifest());
  expect(info).toMatchObject({ name: "Research pack", version: "1.2", routineCount: 1, routineTitles: ["Vendor check"] });
  expect(f.plugins.list()).toHaveLength(0);
  expect(f.routines.list({ workspaceId: f.workspace.workspaceId })).toHaveLength(0);
});

it("binds a reviewed plugin import to the inspected digest", async () => {
  const f = fixture();
  const path = f.manifest();
  const inspected = await f.plugins.inspect(path);
  expect(inspected.digest).toMatch(/^[a-f0-9]{64}$/);
  writeFileSync(path, JSON.stringify({ format: "aux-plugin@1", name: "Research pack",
    routines: [{ title: "Changed task", objective: "Different work" }] }));
  await expect(f.plugins.install(path, f.workspace.workspaceId, inspected.digest))
    .rejects.toThrow(/changed after review/);
  expect(f.plugins.list()).toEqual([]);
  expect(f.routines.list({ workspaceId: f.workspace.workspaceId })).toEqual([]);
});

it("rejects files that are not aux-plugin@1 bundles", async () => {
  const f = fixture();
  await expect(f.plugins.inspect(f.bundle({ format: "aux-routine@1", routines: [] }))).rejects.toThrow(/aux-plugin@1/);
  await expect(f.plugins.install(f.manifest({ format: "nope" }), f.workspace.workspaceId)).rejects.toThrow(/aux-plugin@1/);
  await expect(f.plugins.inspect(f.manifest({ routines: [] }))).rejects.toThrow(/aux-plugin@1/);
});

it("installs bundled routines into the chosen space and lists the plugin", async () => {
  const f = fixture();
  const { plugin, imported, skipped } = await f.plugins.install(f.manifest(), f.workspace.workspaceId);
  expect(imported).toBe(1);
  expect(skipped).toBe(0);
  expect(plugin.routineIds).toHaveLength(1);
  const installed = f.plugins.list({ workspaceId: f.workspace.workspaceId });
  expect(installed).toHaveLength(1);
  expect(installed[0]!.name).toBe("Research pack");
  const routine = f.routines.get(plugin.routineIds[0]!).routine;
  expect(routine.workspaceId).toBe(f.workspace.workspaceId);
  expect(routine.objective).toBe("Check {{topic}} vendors");
});

it("refuses to install the same named plugin twice in a space", async () => {
  const f = fixture();
  await f.plugins.install(f.manifest(), f.workspace.workspaceId);
  await expect(f.plugins.install(f.manifest(), f.workspace.workspaceId)).rejects.toThrow(/already installed/i);
});

it("uninstall archives the routines this plugin created and can be installed again", async () => {
  const f = fixture();
  const { plugin } = await f.plugins.install(f.manifest(), f.workspace.workspaceId);
  const { archivedRoutines } = f.plugins.uninstall(plugin.pluginId);
  expect(archivedRoutines).toBe(1);
  expect(f.routines.get(plugin.routineIds[0]!).routine.archivedAt).toBeDefined();
  expect(f.plugins.list()).toHaveLength(0);
  expect(f.plugins.list({ includeUninstalled: true })).toHaveLength(1);
  expect(() => f.plugins.uninstall(plugin.pluginId)).toThrow(/does not exist/);
  // Reinstalling skips the archived duplicate instead of creating a second copy.
  const again = await f.plugins.install(f.manifest(), f.workspace.workspaceId);
  expect(again.imported).toBe(0);
  expect(again.skipped).toBe(1);
});

it("imports Claude-format skills, MCP servers and hooks without granting execution", async () => {
  const f = fixture();
  const root = join(f.dir, "claude-plugin");
  mkdirSync(join(root, ".claude-plugin"), { recursive: true });
  mkdirSync(join(root, "skills", "research"), { recursive: true });
  mkdirSync(join(root, "hooks"), { recursive: true });
  writeFileSync(join(root, ".claude-plugin", "plugin.json"), JSON.stringify({ name: "research-kit", version: "1.0" }));
  writeFileSync(join(root, "skills", "research", "SKILL.md"), "---\nname: research\ndescription: Review sources\n---\nUse primary sources.");
  const marker = join(f.dir, "executed");
  writeFileSync(join(root, ".mcp.json"), JSON.stringify({ mcpServers: { records: { command: "sh", args: ["-c", `touch ${marker}`], env: { TOKEN: "private-token" } } } }));
  writeFileSync(join(root, "hooks", "hooks.json"), JSON.stringify({ hooks: { PostToolUse: [{ hooks: [{ type: "command", command: `touch ${marker}` }] }] } }));
  const inspected = await f.plugins.inspect(root);
  expect(inspected).toMatchObject({ format: "claude-code", routineCount: 0, assets: [
    { kind: "skill", name: "research" }, { kind: "mcp_server", name: "records" }, { kind: "hook", name: "PostToolUse" },
  ] });
  const { plugin, imported } = await f.plugins.install(root, f.workspace.workspaceId);
  expect(imported).toBe(0);
  const assets = f.plugins.assets(plugin.pluginId);
  expect(assets).toHaveLength(3);
  expect(assets.every(asset => asset.authority === "none")).toBe(true);
  expect(assets.find(asset => asset.kind === "skill")?.content).toContain("Use primary sources.");
  expect(JSON.stringify(assets)).not.toContain("private-token");
  expect(JSON.stringify(assets)).not.toContain(`touch ${marker}`);
  expect(existsSync(marker)).toBe(false);
  f.plugins.uninstall(plugin.pluginId);
  expect(() => f.plugins.assets(plugin.pluginId)).toThrow(/does not exist/);
  expect(f.plugins.list({ includeUninstalled: true })).toHaveLength(1);
  expect(f.plugins.list()).toHaveLength(0);
});

it("rejects symlinked plugin components and oversized skill content", async () => {
  const f = fixture();
  const root = join(f.dir, "claude-plugin");
  mkdirSync(join(root, ".claude-plugin"), { recursive: true });
  mkdirSync(join(root, "skills", "escape"), { recursive: true });
  writeFileSync(join(root, ".claude-plugin", "plugin.json"), JSON.stringify({ name: "safe-kit" }));
  const external = join(f.dir, "external.md");
  writeFileSync(external, "secret outside plugin");
  symlinkSync(external, join(root, "skills", "escape", "SKILL.md"));
  await expect(f.plugins.inspect(root)).rejects.toThrow(/regular file/);
  rmSync(join(root, "skills", "escape", "SKILL.md"));
  writeFileSync(join(root, "skills", "escape", "SKILL.md"), "A".repeat(64_001));
  await expect(f.plugins.install(root, f.workspace.workspaceId)).rejects.toThrow(/bounded regular file/);
  expect(f.plugins.list()).toHaveLength(0);
});
