import { mkdtempSync, writeFileSync } from "node:fs";
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
  return { workspace, routines, plugins, bundle, manifest };
}

it("inspects a bundle without installing it", async () => {
  const f = fixture();
  const info = await f.plugins.inspect(f.manifest());
  expect(info).toMatchObject({ name: "Research pack", version: "1.2", routineCount: 1, routineTitles: ["Vendor check"] });
  expect(f.plugins.list()).toHaveLength(0);
  expect(f.routines.list({ workspaceId: f.workspace.workspaceId })).toHaveLength(0);
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
