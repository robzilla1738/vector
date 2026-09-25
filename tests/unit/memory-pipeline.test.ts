import { expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EventBus, MemoryPipeline, openDb, Repo, TaskService } from "@aux/runtime";

function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "aux-memory-pipeline-"));
  const db = openDb(":memory:");
  const repo = new Repo(db);
  const workspace = new TaskService(repo, new EventBus(repo)).createWorkspace("Memory");
  const secrets = new Map<string, string>();
  const native = {
    async storeSecret(name: string, value: string) { if (value) secrets.set(name, value); else secrets.delete(name); return { ok: true as const }; },
    async readSecret(name: string) { return { value: secrets.get(name) }; },
  };
  const pipeline = new MemoryPipeline(repo, native, directory, "profile-one");
  const save = (runId: string, report: string) => repo.saveRun({ runId, goal: "Research", status: "completed", pageIds: [],
    config: { contextWorkspaceId: workspace.workspaceId }, result: { report }, createdAt: Date.now(), endedAt: Date.now() });
  return { directory, db, repo, workspace, native, secrets, pipeline, save,
    close: () => { db.close(); rmSync(directory, { recursive: true, force: true }); } };
}

it("extracts completed Space runs only after opt-in and exposes bounded progressive views", async () => {
  const f = fixture();
  try {
    f.save("run-one", "The blue fixture has three items.\n\nThe green fixture has four items.");
    await expect(f.pipeline.extractRun(f.workspace.workspaceId, "run-one")).rejects.toThrow(/Enable/);
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    expect((await f.pipeline.extractRun(f.workspace.workspaceId, "run-one")).extracted).toBe(2);
    expect((await f.pipeline.extractRun(f.workspace.workspaceId, "run-one")).extracted).toBe(0);
    const overview = await f.pipeline.overview(f.workspace.workspaceId);
    expect(overview.claimCount).toBe(2);
    expect(overview.summary.length).toBeLessThan(10_000);
    expect(await f.pipeline.search(f.workspace.workspaceId, "green fixture")).toHaveLength(1);
    const profileDir = join(f.directory, readdirSync(f.directory)[0]!);
    const spaceDir = join(profileDir, readdirSync(profileDir)[0]!);
    const history = execFileSync("git", ["-C", spaceDir, "log", "--all", "-p"], { encoding: "utf8" });
    expect(history).not.toContain("green fixture");
    const manifest = JSON.parse(readFileSync(join(spaceDir, "manifest.json"), "utf8")) as { generation: string };
    expect(readdirSync(join(spaceDir, manifest.generation))).toEqual(expect.arrayContaining(["summary.md.enc", "handbook.md.enc", "rollouts"]));
  } finally { f.close(); }
});

it("rebuilds derived claims on Forget, erases old keys, and stays forgotten after restart", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    f.save("run-one", "The private amber sentinel belongs to run one.");
    f.save("run-two", "The durable violet sentinel belongs to run two.");
    await f.pipeline.extractRun(f.workspace.workspaceId, "run-one");
    await f.pipeline.extractRun(f.workspace.workspaceId, "run-two");
    expect(f.secrets.size).toBe(1);
    const oldKey = [...f.secrets.keys()][0]!;
    const forgotten = await f.pipeline.forget({ workspaceId: f.workspace.workspaceId, sourceRunId: "run-one" });
    expect(forgotten).toEqual({ forgotten: 1, remaining: 1 });
    expect(f.secrets.has(oldKey)).toBe(false);
    const restarted = new MemoryPipeline(f.repo, f.native, f.directory, "profile-one");
    expect(await restarted.search(f.workspace.workspaceId, "amber")).toEqual([]);
    expect(await restarted.search(f.workspace.workspaceId, "violet")).toHaveLength(1);
    expect((await restarted.overview(f.workspace.workspaceId)).summary).not.toContain("amber");
    expect(await restarted.forget({ workspaceId: f.workspace.workspaceId, all: true })).toEqual({ forgotten: 1, remaining: 0 });
    expect((await new MemoryPipeline(f.repo, f.native, f.directory, "profile-one").overview(f.workspace.workspaceId)).claimCount).toBe(0);
  } finally { f.close(); }
});

it("keeps the prior generation readable if credential erasure fails", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    f.save("run-one", "The copper fixture is still required after a failed erasure.");
    await f.pipeline.extractRun(f.workspace.workspaceId, "run-one");
    const originalKey = [...f.secrets.keys()][0]!;
    const failingNative = {
      ...f.native,
      async storeSecret(name: string, value: string) {
        if (name === originalKey && !value) throw new Error("credential store unavailable");
        return f.native.storeSecret(name, value);
      },
    };
    const pipeline = new MemoryPipeline(f.repo, failingNative, f.directory, "profile-one");
    await expect(pipeline.forget({ workspaceId: f.workspace.workspaceId, all: true })).rejects.toThrow(/credential store/);
    expect(await f.pipeline.search(f.workspace.workspaceId, "copper fixture")).toHaveLength(1);
    expect(f.secrets.size).toBe(1);
  } finally { f.close(); }
});
