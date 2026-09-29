import { expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { createCipheriv, createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
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
    async profileStorageRoot() {
      const name = `aux_root_v1_${createHash("sha256").update("profile-one").digest("hex").slice(0, 24)}`;
      if (!secrets.has(name)) secrets.set(name, randomBytes(32).toString("base64"));
      return { value: secrets.get(name)! };
    },
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
    expect(await f.pipeline.sources(f.workspace.workspaceId)).toEqual([]);
    expect((await f.pipeline.inbox(f.workspace.workspaceId))).toHaveLength(2);
    expect((await f.pipeline.overview(f.workspace.workspaceId)).claimCount).toBe(0);
    expect(await f.pipeline.search(f.workspace.workspaceId, "green fixture")).toEqual([]);
    const [first, second] = await f.pipeline.inbox(f.workspace.workspaceId);
    expect(second?.source).toEqual({ kind: "run-report", quote: second?.text,
      quoteSha256: createHash("sha256").update(second!.text).digest("hex") });
    await f.pipeline.review(f.workspace.workspaceId, first!.claimId, "discard");
    await f.pipeline.review(f.workspace.workspaceId, second!.claimId, "accept");
    const overview = await f.pipeline.overview(f.workspace.workspaceId);
    expect(overview.claimCount).toBe(1);
    expect(await f.pipeline.history(f.workspace.workspaceId)).toMatchObject([{ claimCount: 1 }]);
    expect(await f.pipeline.inbox(f.workspace.workspaceId)).toEqual([]);
    expect(overview.summary.length).toBeLessThan(10_000);
    expect(await f.pipeline.search(f.workspace.workspaceId, "green fixture")).toHaveLength(1);
    expect(overview.summary).toContain(`#${second!.source!.quoteSha256.slice(0, 12)}`);
    const profileDir = join(f.directory, readdirSync(f.directory)[0]!);
    const spaceDir = join(profileDir, readdirSync(profileDir)[0]!);
    const history = execFileSync("git", ["-C", spaceDir, "log", "--all", "-p"], { encoding: "utf8" });
    expect(history).not.toContain("green fixture");
    const manifest = JSON.parse(readFileSync(join(spaceDir, "manifest.json"), "utf8")) as { generation: string };
    expect(readdirSync(join(spaceDir, manifest.generation))).toEqual(expect.arrayContaining(["inbox.json.enc", "history.json.enc", "summary.md.enc", "handbook.md.enc", "rollouts"]));
  } finally { f.close(); }
});

it("reverts accepted memory and scrubs forgotten claims from every recoverable revision", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    f.save("run-one", "The private amber fixture was present in the first report.");
    f.save("run-two", "The durable violet fixture was present in the second report.");
    for (const runId of ["run-one", "run-two"]) {
      await f.pipeline.extractRun(f.workspace.workspaceId, runId);
      const note = (await f.pipeline.inbox(f.workspace.workspaceId)).find(item => item.sourceRunId === runId)!;
      await f.pipeline.review(f.workspace.workspaceId, note.claimId, "accept");
    }
    const history = await f.pipeline.history(f.workspace.workspaceId);
    expect(history.map(item => item.claimCount)).toEqual([2, 1]);
    await f.pipeline.revert(f.workspace.workspaceId, history[1]!.revisionId);
    expect(await f.pipeline.search(f.workspace.workspaceId, "violet")).toEqual([]);
    await f.pipeline.revert(f.workspace.workspaceId, history[0]!.revisionId);
    expect(await f.pipeline.search(f.workspace.workspaceId, "violet")).toHaveLength(1);
    await f.pipeline.forget({ workspaceId: f.workspace.workspaceId, sourceRunId: "run-one" });
    const restarted = new MemoryPipeline(f.repo, f.native, f.directory, "profile-one");
    for (const revision of await restarted.history(f.workspace.workspaceId)) {
      expect(revision.summary).not.toContain("amber");
      await restarted.revert(f.workspace.workspaceId, revision.revisionId);
      expect(await restarted.search(f.workspace.workspaceId, "amber")).toEqual([]);
    }
  } finally { f.close(); }
});

it("forgets a claim that exists only in an older revision and preserves the pre-restore state", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    f.save("run-one", "The original amber fixture belongs to this Space.");
    f.save("run-two", "The current violet fixture belongs to this Space.");
    for (const runId of ["run-one", "run-two"]) {
      await f.pipeline.extractRun(f.workspace.workspaceId, runId);
      const note = (await f.pipeline.inbox(f.workspace.workspaceId)).find(item => item.sourceRunId === runId)!;
      await f.pipeline.review(f.workspace.workspaceId, note.claimId, "accept");
    }
    const earlier = (await f.pipeline.history(f.workspace.workspaceId)).find(revision => revision.claimCount === 1)!;
    await f.pipeline.revert(f.workspace.workspaceId, earlier.revisionId);
    expect(await f.pipeline.search(f.workspace.workspaceId, "violet")).toEqual([]);
    expect((await f.pipeline.history(f.workspace.workspaceId))[0]?.summary).toContain("violet");
    expect((await f.pipeline.history(f.workspace.workspaceId))[0]?.sourceRunIds).toContain("run-two");
    expect(await f.pipeline.forget({ workspaceId: f.workspace.workspaceId, sourceRunId: "run-two" }))
      .toEqual({ forgotten: 1, remaining: 1 });
    const restarted = new MemoryPipeline(f.repo, f.native, f.directory, "profile-one");
    for (const revision of await restarted.history(f.workspace.workspaceId)) {
      expect(revision.summary).not.toContain("violet");
      expect(revision.sourceRunIds).not.toContain("run-two");
      await restarted.revert(f.workspace.workspaceId, revision.revisionId);
      expect(await restarted.search(f.workspace.workspaceId, "violet")).toEqual([]);
    }
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
    for (const note of await f.pipeline.inbox(f.workspace.workspaceId))
      await f.pipeline.review(f.workspace.workspaceId, note.claimId, "accept");
    expect(f.secrets.size).toBe(2);
    const oldKey = [...f.secrets.keys()].find(name => name.startsWith("mem_"))!;
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

it("migrates legacy encrypted generations without exposing or restoring forgotten claims", async () => {
  const f = fixture();
  try {
    const workspaceId = f.workspace.workspaceId;
    f.pipeline.setPolicy(workspaceId, true);
    const pathPart = (value: string) => createHash("sha256").update(value).digest("hex").slice(0, 24);
    const directory = join(f.directory, pathPart("profile-one"), pathPart(workspaceId));
    const generation = `g-${randomUUID()}`;
    const keyName = "mem_abc123";
    const key = randomBytes(32);
    mkdirSync(join(directory, generation), { recursive: true });
    await f.native.storeSecret(keyName, key.toString("base64"));
    const claim = { claimId: randomUUID(), sourceRunId: "legacy-run",
      text: "A legacy amber fixture belongs to this Space.", capturedAt: 1 };
    const legacySeal = (name: string, value: unknown) => {
      const iv = randomBytes(12);
      const cipher = createCipheriv("aes-256-gcm", key, iv);
      cipher.setAAD(Buffer.from(`profile-one\0${workspaceId}\0${name}`));
      return Buffer.concat([iv, cipher.update(JSON.stringify(value)), cipher.final(), cipher.getAuthTag()]);
    };
    for (const [name, value] of Object.entries({ "claims.json.enc": [claim],
      "inbox.json.enc": [], "history.json.enc": [{ revisionId: randomUUID(), capturedAt: 1, claims: [claim] }] }))
      writeFileSync(join(directory, generation, name), legacySeal(name, value));
    writeFileSync(join(directory, "manifest.json"), JSON.stringify({ generation, keyName }));
    // Historical encrypted claims without an available source run are kept for
    // reviewed removal, but never presented as attributable recall.
    expect(await f.pipeline.search(workspaceId, "amber")).toEqual([]);
    await f.pipeline.forget({ workspaceId, all: true });
    expect(JSON.parse(readFileSync(join(directory, "manifest.json"), "utf8")).version).toBe(2);
    expect(f.secrets.has(keyName)).toBe(false);
    expect([...f.secrets.keys()].some(name => name.startsWith("aux_root_v1_"))).toBe(true);
    const restarted = new MemoryPipeline(f.repo, f.native, f.directory, "profile-one");
    expect(await restarted.search(workspaceId, "amber")).toEqual([]);
    expect((await restarted.history(workspaceId)).every(revision => !revision.sourceRunIds.includes("legacy-run"))).toBe(true);
  } finally { f.close(); }
});

it("keeps the prior generation readable if credential erasure fails", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    f.save("run-one", "The copper fixture is still required after a failed erasure.");
    await f.pipeline.extractRun(f.workspace.workspaceId, "run-one");
    await f.pipeline.review(f.workspace.workspaceId, (await f.pipeline.inbox(f.workspace.workspaceId))[0]!.claimId, "accept");
    const originalKey = [...f.secrets.keys()].find(name => name.startsWith("mem_"))!;
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
    expect(f.secrets.size).toBe(2);
  } finally { f.close(); }
});

it("advances managed recovery before removal and preserves claims when advance fails", async () => {
  const f = fixture();
  try {
    const workspaceId = f.workspace.workspaceId;
    f.pipeline.setPolicy(workspaceId, true);
    f.save("run-one", "The retained bronze fixture is in this report.");
    await f.pipeline.extractRun(workspaceId, "run-one");
    const note = (await f.pipeline.inbox(workspaceId))[0]!;
    await f.pipeline.review(workspaceId, note.claimId, "accept");
    let advances = 0;
    await expect(f.pipeline.forget({ workspaceId, all: true }, () => {
      advances++;
      throw new Error("Recovery anchor unavailable");
    })).rejects.toThrow(/Recovery anchor unavailable/);
    expect(advances).toBe(1);
    expect(await f.pipeline.search(workspaceId, "bronze fixture")).toHaveLength(1);
    await f.pipeline.forget({ workspaceId, all: true }, () => { advances++; });
    expect(advances).toBe(2);
    expect(await f.pipeline.search(workspaceId, "bronze fixture")).toEqual([]);
    await f.pipeline.forget({ workspaceId, all: true }, () => { advances++; });
    expect(advances).toBe(2);
  } finally { f.close(); }
});

it("persists pending notes across restart and never re-extracts discarded or forgotten sources", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    f.save("run-one", "The private silver sentinel is awaiting review.");
    expect(await f.pipeline.sources(f.workspace.workspaceId)).toMatchObject([{ runId: "run-one" }]);
    await f.pipeline.extractRun(f.workspace.workspaceId, "run-one");
    const restarted = new MemoryPipeline(f.repo, f.native, f.directory, "profile-one");
    expect((await restarted.inbox(f.workspace.workspaceId))[0]?.text).toContain("silver sentinel");
    expect((await restarted.overview(f.workspace.workspaceId)).summary).toBe("");
    const pending = (await restarted.inbox(f.workspace.workspaceId))[0]!;
    await restarted.review(f.workspace.workspaceId, pending.claimId, "discard");
    expect((await restarted.extractRun(f.workspace.workspaceId, "run-one")).extracted).toBe(0);
    expect(await restarted.inbox(f.workspace.workspaceId)).toEqual([]);
    expect(await restarted.sources(f.workspace.workspaceId)).toEqual([]);
  } finally { f.close(); }
});

it("rejects stale evidence and concurrent consolidation before approving a note", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    f.save("run-one", "The verified orange fixture was present in the source report.");
    f.repo.db.prepare("INSERT INTO memory_pipeline_leases(workspace_id,owner,expires_at) VALUES(?,?,?)")
      .run(f.workspace.workspaceId, "other-worker", Date.now() + 60_000);
    await expect(f.pipeline.extractRun(f.workspace.workspaceId, "run-one")).rejects.toThrow(/being updated/);
    f.repo.db.prepare("DELETE FROM memory_pipeline_leases WHERE workspace_id=?").run(f.workspace.workspaceId);
    await f.pipeline.extractRun(f.workspace.workspaceId, "run-one");
    const note = (await f.pipeline.inbox(f.workspace.workspaceId))[0]!;
    f.save("run-one", "The source report no longer supports that note.");
    await expect(f.pipeline.review(f.workspace.workspaceId, note.claimId, "accept")).rejects.toThrow(/no longer verifies/);
    expect((await f.pipeline.overview(f.workspace.workspaceId)).claimCount).toBe(0);
    expect(await f.pipeline.inbox(f.workspace.workspaceId)).toHaveLength(1);
  } finally { f.close(); }
});

it("removes an approved report quote from recall when its source changes", async () => {
  const f = fixture();
  try {
    const workspaceId = f.workspace.workspaceId;
    f.pipeline.setPolicy(workspaceId, true);
    f.save("run-one", "The verified copper fixture came from this source report.");
    await f.pipeline.extractRun(workspaceId, "run-one");
    const note = (await f.pipeline.inbox(workspaceId))[0]!;
    await f.pipeline.review(workspaceId, note.claimId, "accept");
    expect(await f.pipeline.search(workspaceId, "copper fixture")).toHaveLength(1);
    f.save("run-one", "This changed report no longer supports the prior note.");
    const restarted = new MemoryPipeline(f.repo, f.native, f.directory, "profile-one");
    expect(await restarted.search(workspaceId, "copper fixture")).toEqual([]);
    expect((await restarted.overview(workspaceId)).summary).toBe("");
  } finally { f.close(); }
});

it("omits a neutral-URL run when its report contains personal account content", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    f.save("account-run", "Your account balance is $4,000. Review the detailed transaction history.");
    expect(await f.pipeline.sources(f.workspace.workspaceId)).toEqual([]);
    await expect(f.pipeline.extractRun(f.workspace.workspaceId, "account-run")).rejects.toThrow(/sensitive/);
    expect((await f.pipeline.overview(f.workspace.workspaceId)).summary).toBe("");
  } finally { f.close(); }
});

it("omits sensitive and excluded page sources before extraction", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    const page = (pageId: string, url: string, title: string) => f.repo.upsertPage({ pageId, backend: "aux",
      targetId: pageId, url, title, documentEpoch: 1, lastRevision: 1, viewStatus: "visible",
      controller: "human", controllerEpoch: 0, ownedByRuntime: false, createdAt: 1, lastActiveAt: 1 });
    const run = (runId: string, pageId: string) => f.repo.saveRun({ runId, goal: "Research",
      status: "completed", pageIds: [pageId], config: { contextWorkspaceId: f.workspace.workspaceId },
      result: { report: "The visible page informed this verified report." }, createdAt: 1, endedAt: 1 });
    page("bank-page", "https://bank.example/account", "Account");
    run("bank-run", "bank-page");
    page("article-page", "https://example.test/article", "Ordinary article");
    run("article-run", "article-page");
    expect((await f.pipeline.sources(f.workspace.workspaceId)).map(item => item.runId)).toEqual(["article-run"]);
    await expect(f.pipeline.extractRun(f.workspace.workspaceId, "bank-run")).rejects.toThrow(/sensitive/);
    f.repo.setSetting(`workspaceMemory:${f.workspace.workspaceId}`, { excludedOrigins: ["https://example.test"] });
    expect(await f.pipeline.sources(f.workspace.workspaceId)).toEqual([]);
    await expect(f.pipeline.extractRun(f.workspace.workspaceId, "article-run")).rejects.toThrow(/excluded/);
  } finally { f.close(); }
});
