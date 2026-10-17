import { expect, it } from "vitest";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
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
    async storeSecret(name: string, value: string) {
      if (value) secrets.set(name, value);
      else secrets.delete(name);
      return { ok: true as const };
    },
    async readSecret(name: string) {
      return { value: secrets.get(name) };
    },
    async profileStorageRoot() {
      const name = `aux_root_v1_${createHash("sha256").update("profile-one").digest("hex").slice(0, 24)}`;
      if (!secrets.has(name)) secrets.set(name, randomBytes(32).toString("base64"));
      return { value: secrets.get(name)! };
    },
  };
  const pipeline = new MemoryPipeline(repo, native, "profile-one");
  const save = (runId: string, report: string) =>
    repo.saveRun({
      runId,
      goal: "Research",
      status: "completed",
      pageIds: [],
      config: { contextWorkspaceId: workspace.workspaceId },
      result: { report },
      createdAt: Date.now(),
      endedAt: Date.now(),
    });
  return {
    directory,
    db,
    repo,
    workspace,
    native,
    secrets,
    pipeline,
    save,
    close: () => {
      db.close();
      rmSync(directory, { recursive: true, force: true });
    },
  };
}

it("extracts completed Space runs by default while respecting explicit pause and exposes bounded progressive views", async () => {
  const f = fixture();
  try {
    f.save("run-one", "The blue fixture has three items.\n\nThe green fixture has four items.");
    expect(f.pipeline.policy(f.workspace.workspaceId).enabled).toBe(true);
    f.pipeline.setPolicy(f.workspace.workspaceId, false);
    await expect(f.pipeline.extractRun(f.workspace.workspaceId, "run-one")).rejects.toThrow(/Enable/);
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    expect((await f.pipeline.extractRun(f.workspace.workspaceId, "run-one")).extracted).toBe(2);
    expect((await f.pipeline.extractRun(f.workspace.workspaceId, "run-one")).extracted).toBe(0);
    expect(await f.pipeline.sources(f.workspace.workspaceId)).toEqual([]);
    expect(await f.pipeline.inbox(f.workspace.workspaceId)).toHaveLength(2);
    expect((await f.pipeline.overview(f.workspace.workspaceId)).claimCount).toBe(0);
    expect(await f.pipeline.search(f.workspace.workspaceId, "green fixture")).toEqual([]);
    const [first, second] = await f.pipeline.inbox(f.workspace.workspaceId);
    expect(second?.source).toEqual({
      kind: "run-report",
      quote: second?.text,
      quoteSha256: createHash("sha256").update(second!.text).digest("hex"),
    });
    await f.pipeline.review(f.workspace.workspaceId, first!.claimId, "discard");
    await f.pipeline.review(f.workspace.workspaceId, second!.claimId, "accept");
    const overview = await f.pipeline.overview(f.workspace.workspaceId);
    expect(overview.claimCount).toBe(1);
    expect(await f.pipeline.history(f.workspace.workspaceId)).toMatchObject([{ claimCount: 1 }]);
    expect(await f.pipeline.inbox(f.workspace.workspaceId)).toEqual([]);
    expect(overview.summary.length).toBeLessThan(10_000);
    expect(await f.pipeline.search(f.workspace.workspaceId, "green fixture")).toHaveLength(1);
    expect(overview.summary).toContain(`#${second!.source!.quoteSha256.slice(0, 12)}`);
    const rows = f.db.prepare("SELECT name,content FROM memory_files").all();
    expect(JSON.stringify(rows)).not.toContain("green fixture");
    expect(rows.map((row) => row.name)).toEqual(
      expect.arrayContaining([
        "claims.json.enc",
        "inbox.json.enc",
        "history.json.enc",
        "summary.md.enc",
        "handbook.md.enc",
      ]),
    );
    expect(readdirSync(f.directory)).toEqual([]);
  } finally {
    f.close();
  }
});

it("reverts accepted memory and scrubs forgotten claims from every recoverable revision", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    f.save("run-one", "The private amber fixture was present in the first report.");
    f.save("run-two", "The durable violet fixture was present in the second report.");
    for (const runId of ["run-one", "run-two"]) {
      await f.pipeline.extractRun(f.workspace.workspaceId, runId);
      const note = (await f.pipeline.inbox(f.workspace.workspaceId)).find(
        (item) => item.sourceRunId === runId,
      )!;
      await f.pipeline.review(f.workspace.workspaceId, note.claimId, "accept");
    }
    const history = await f.pipeline.history(f.workspace.workspaceId);
    expect(history.map((item) => item.claimCount)).toEqual([2, 1]);
    await f.pipeline.revert(f.workspace.workspaceId, history[1]!.revisionId);
    expect(await f.pipeline.search(f.workspace.workspaceId, "violet")).toEqual([]);
    await f.pipeline.revert(f.workspace.workspaceId, history[0]!.revisionId);
    expect(await f.pipeline.search(f.workspace.workspaceId, "violet")).toHaveLength(1);
    await f.pipeline.forget({ workspaceId: f.workspace.workspaceId, sourceRunId: "run-one" });
    const restarted = new MemoryPipeline(f.repo, f.native, "profile-one");
    for (const revision of await restarted.history(f.workspace.workspaceId)) {
      expect(revision.summary).not.toContain("amber");
      await restarted.revert(f.workspace.workspaceId, revision.revisionId);
      expect(await restarted.search(f.workspace.workspaceId, "amber")).toEqual([]);
    }
  } finally {
    f.close();
  }
});

it("forgets a claim that exists only in an older revision and preserves the pre-restore state", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    f.save("run-one", "The original amber fixture belongs to this Space.");
    f.save("run-two", "The current violet fixture belongs to this Space.");
    for (const runId of ["run-one", "run-two"]) {
      await f.pipeline.extractRun(f.workspace.workspaceId, runId);
      const note = (await f.pipeline.inbox(f.workspace.workspaceId)).find(
        (item) => item.sourceRunId === runId,
      )!;
      await f.pipeline.review(f.workspace.workspaceId, note.claimId, "accept");
    }
    const earlier = (await f.pipeline.history(f.workspace.workspaceId)).find(
      (revision) => revision.claimCount === 1,
    )!;
    await f.pipeline.revert(f.workspace.workspaceId, earlier.revisionId);
    expect(await f.pipeline.search(f.workspace.workspaceId, "violet")).toEqual([]);
    expect((await f.pipeline.history(f.workspace.workspaceId))[0]?.summary).toContain("violet");
    expect((await f.pipeline.history(f.workspace.workspaceId))[0]?.sourceRunIds).toContain("run-two");
    expect(await f.pipeline.forget({ workspaceId: f.workspace.workspaceId, sourceRunId: "run-two" })).toEqual(
      { forgotten: 1, activityRemoved: 1, remaining: 1 },
    );
    const restarted = new MemoryPipeline(f.repo, f.native, "profile-one");
    for (const revision of await restarted.history(f.workspace.workspaceId)) {
      expect(revision.summary).not.toContain("violet");
      expect(revision.sourceRunIds).not.toContain("run-two");
      await restarted.revert(f.workspace.workspaceId, revision.revisionId);
      expect(await restarted.search(f.workspace.workspaceId, "violet")).toEqual([]);
    }
  } finally {
    f.close();
  }
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
    const oldKey = [...f.secrets.keys()].find((name) => name.startsWith("mem_"))!;
    const forgotten = await f.pipeline.forget({
      workspaceId: f.workspace.workspaceId,
      sourceRunId: "run-one",
    });
    expect(forgotten).toEqual({ forgotten: 1, activityRemoved: 1, remaining: 1 });
    expect(f.secrets.has(oldKey)).toBe(false);
    const restarted = new MemoryPipeline(f.repo, f.native, "profile-one");
    expect(await restarted.search(f.workspace.workspaceId, "amber")).toEqual([]);
    expect(await restarted.search(f.workspace.workspaceId, "violet")).toHaveLength(1);
    expect((await restarted.overview(f.workspace.workspaceId)).summary).not.toContain("amber");
    expect(await restarted.forget({ workspaceId: f.workspace.workspaceId, all: true })).toEqual({
      forgotten: 1,
      activityRemoved: 1,
      remaining: 0,
    });
    expect(
      (await new MemoryPipeline(f.repo, f.native, "profile-one").overview(f.workspace.workspaceId))
        .claimCount,
    ).toBe(0);
  } finally {
    f.close();
  }
});

it("authenticates reversible history inventory before exposing memory", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    f.save("run-one", "The authenticated amber fixture belongs in this report.");
    await f.pipeline.extractRun(f.workspace.workspaceId, "run-one");
    await f.pipeline.review(
      f.workspace.workspaceId,
      (await f.pipeline.inbox(f.workspace.workspaceId))[0]!.claimId,
      "accept",
    );
    f.db.prepare("DELETE FROM memory_history WHERE workspace_id=?").run(f.workspace.workspaceId);
    await expect(f.pipeline.history(f.workspace.workspaceId)).rejects.toThrow(/inventory/);
  } finally {
    f.close();
  }
});

it("keeps the prior generation readable if credential erasure fails", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    f.save("run-one", "The copper fixture is still required after a failed erasure.");
    await f.pipeline.extractRun(f.workspace.workspaceId, "run-one");
    await f.pipeline.review(
      f.workspace.workspaceId,
      (await f.pipeline.inbox(f.workspace.workspaceId))[0]!.claimId,
      "accept",
    );
    const originalKey = [...f.secrets.keys()].find((name) => name.startsWith("mem_"))!;
    const failingNative = {
      ...f.native,
      async storeSecret(name: string, value: string) {
        if (name === originalKey && !value) throw new Error("credential store unavailable");
        return f.native.storeSecret(name, value);
      },
    };
    const pipeline = new MemoryPipeline(f.repo, failingNative, "profile-one");
    await expect(pipeline.forget({ workspaceId: f.workspace.workspaceId, all: true })).rejects.toThrow(
      /credential store/,
    );
    expect(await f.pipeline.search(f.workspace.workspaceId, "copper fixture")).toHaveLength(1);
    expect(f.secrets.size).toBe(2);
  } finally {
    f.close();
  }
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
    await expect(
      f.pipeline.forget({ workspaceId, all: true }, () => {
        advances++;
        throw new Error("Recovery anchor unavailable");
      }),
    ).rejects.toThrow(/Recovery anchor unavailable/);
    expect(advances).toBe(1);
    expect(await f.pipeline.search(workspaceId, "bronze fixture")).toHaveLength(1);
    await f.pipeline.forget({ workspaceId, all: true }, () => {
      advances++;
    });
    expect(advances).toBe(2);
    expect(await f.pipeline.search(workspaceId, "bronze fixture")).toEqual([]);
    await f.pipeline.forget({ workspaceId, all: true }, () => {
      advances++;
    });
    expect(advances).toBe(2);
  } finally {
    f.close();
  }
});

it("persists pending notes across restart and never re-extracts discarded or forgotten sources", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    f.save("run-one", "The private silver sentinel is awaiting review.");
    expect(await f.pipeline.sources(f.workspace.workspaceId)).toMatchObject([{ runId: "run-one" }]);
    await f.pipeline.extractRun(f.workspace.workspaceId, "run-one");
    const restarted = new MemoryPipeline(f.repo, f.native, "profile-one");
    expect((await restarted.inbox(f.workspace.workspaceId))[0]?.text).toContain("silver sentinel");
    expect((await restarted.overview(f.workspace.workspaceId)).summary).toBe("");
    const pending = (await restarted.inbox(f.workspace.workspaceId))[0]!;
    await restarted.review(f.workspace.workspaceId, pending.claimId, "discard");
    expect((await restarted.extractRun(f.workspace.workspaceId, "run-one")).extracted).toBe(0);
    expect(await restarted.inbox(f.workspace.workspaceId)).toEqual([]);
    expect(await restarted.sources(f.workspace.workspaceId)).toEqual([]);
  } finally {
    f.close();
  }
});

it("rejects stale evidence and concurrent consolidation before approving a note", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    f.save("run-one", "The verified orange fixture was present in the source report.");
    f.repo.db
      .prepare("INSERT INTO memory_pipeline_leases(workspace_id,owner,expires_at) VALUES(?,?,?)")
      .run(f.workspace.workspaceId, "other-worker", Date.now() + 60_000);
    await expect(f.pipeline.extractRun(f.workspace.workspaceId, "run-one")).rejects.toThrow(/being updated/);
    f.repo.db.prepare("DELETE FROM memory_pipeline_leases WHERE workspace_id=?").run(f.workspace.workspaceId);
    await f.pipeline.extractRun(f.workspace.workspaceId, "run-one");
    const note = (await f.pipeline.inbox(f.workspace.workspaceId))[0]!;
    f.save("run-one", "The source report no longer supports that note.");
    await expect(f.pipeline.review(f.workspace.workspaceId, note.claimId, "accept")).rejects.toThrow(
      /source and safety requirements/,
    );
    expect((await f.pipeline.overview(f.workspace.workspaceId)).claimCount).toBe(0);
    expect(await f.pipeline.inbox(f.workspace.workspaceId)).toHaveLength(1);
  } finally {
    f.close();
  }
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
    const restarted = new MemoryPipeline(f.repo, f.native, "profile-one");
    expect(await restarted.search(workspaceId, "copper fixture")).toEqual([]);
    expect((await restarted.overview(workspaceId)).summary).toBe("");
  } finally {
    f.close();
  }
});

it("omits a neutral-URL run when its report contains personal account content", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    f.save("account-run", "Your account balance is $4,000. Review the detailed transaction history.");
    expect(await f.pipeline.sources(f.workspace.workspaceId)).toEqual([]);
    await expect(f.pipeline.extractRun(f.workspace.workspaceId, "account-run")).rejects.toThrow(/sensitive/);
    expect((await f.pipeline.overview(f.workspace.workspaceId)).summary).toBe("");
  } finally {
    f.close();
  }
});

it("omits sensitive and excluded page sources before extraction", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    const page = (pageId: string, url: string, title: string) =>
      f.repo.upsertPage({
        pageId,
        backend: "aux",
        targetId: pageId,
        url,
        title,
        documentEpoch: 1,
        lastRevision: 1,
        viewStatus: "visible",
        controller: "human",
        controllerEpoch: 0,
        ownedByRuntime: false,
        createdAt: 1,
        lastActiveAt: 1,
      });
    const run = (runId: string, pageId: string) =>
      f.repo.saveRun({
        runId,
        goal: "Research",
        status: "completed",
        pageIds: [pageId],
        config: { contextWorkspaceId: f.workspace.workspaceId },
        result: { report: "The visible page informed this verified report." },
        createdAt: 1,
        endedAt: 1,
      });
    page("bank-page", "https://bank.example/account", "Account");
    run("bank-run", "bank-page");
    page("article-page", "https://example.test/article", "Ordinary article");
    run("article-run", "article-page");
    // A page-backed report without a persisted verified observation is not a
    // source, even when its URL and title appear innocuous.
    expect(await f.pipeline.sources(f.workspace.workspaceId)).toEqual([]);
    await expect(f.pipeline.extractRun(f.workspace.workspaceId, "bank-run")).rejects.toThrow(/sensitive/);
    new TaskService(f.repo, new EventBus(f.repo)).setWorkspaceMemory(
      f.workspace.workspaceId,
      0,
      "",
      true,
      undefined,
      ["https://example.test"],
    );
    expect(await f.pipeline.sources(f.workspace.workspaceId)).toEqual([]);
    await expect(f.pipeline.extractRun(f.workspace.workspaceId, "article-run")).rejects.toThrow(/excluded/);
  } finally {
    f.close();
  }
});

it("requires run-owned cited page evidence and refuses changed source identity after restart", async () => {
  const f = fixture();
  try {
    const workspaceId = f.workspace.workspaceId;
    f.pipeline.setPolicy(workspaceId, true);
    const pageId = "article-page";
    const url = "https://example.test/article";
    const page = {
      pageId,
      backend: "aux" as const,
      targetId: pageId,
      url,
      title: "Ordinary article",
      documentEpoch: 1,
      lastRevision: 1,
      viewStatus: "visible" as const,
      controller: "human" as const,
      controllerEpoch: 0,
      ownedByRuntime: false,
      createdAt: 1,
      lastActiveAt: 1,
    };
    f.repo.upsertPage(page);
    const artifactId = "article-observation";
    const path = join(f.directory, "article-observation.json");
    const observation = {
      observationId: "native-observation",
      pageId,
      documentEpoch: 1,
      revision: 1,
      observedAt: 1,
      scope: "full",
      content: {
        url,
        title: page.title,
        viewport: { width: 100, height: 100, scale: 1 },
        scroll: { x: 0, y: 0, maxY: 0 },
        frames: [],
        text: "The article confirms the blue fixture has three items.",
        headings: [],
        elements: [],
        formFields: [],
        tables: [],
        links: [],
        dialogs: [],
        truncated: false,
        stats: { elementsTotal: 0, elementsShown: 0, textChars: 53, approxTokens: 12 },
      },
    };
    writeFileSync(path, JSON.stringify(observation));
    f.repo.saveArtifact({
      artifactId,
      runId: "verified-run",
      pageId,
      path,
      mediaType: "application/json",
      size: readFileSync(path).length,
      status: "complete",
      createdAt: 1,
    });
    f.repo.saveRun({
      runId: "verified-run",
      goal: "Research",
      status: "completed",
      pageIds: [pageId],
      config: {
        contextWorkspaceId: workspaceId,
        implementation: "agent-loop",
        contextPageRefs: [{ pageId, url, documentEpoch: 1 }],
      },
      result: {
        report: "The blue fixture has three items.",
        citations: [
          { observationId: artifactId, quote: "The article confirms the blue fixture has three items." },
        ],
      },
      createdAt: 1,
      endedAt: 1,
    });
    f.repo.saveRun({
      runId: "borrowed-citation",
      goal: "Research",
      status: "completed",
      pageIds: [pageId],
      config: { contextWorkspaceId: workspaceId, implementation: "agent-loop" },
      result: {
        report: "The blue fixture has three items.",
        citations: [
          { observationId: artifactId, quote: "The article confirms the blue fixture has three items." },
        ],
      },
      createdAt: 1,
      endedAt: 1,
    });
    writeFileSync(
      path,
      JSON.stringify({
        ...observation,
        content: {
          ...observation.content,
          text: "Your account balance is $4,000. The article confirms the blue fixture has three items.",
        },
      }),
    );
    expect(await f.pipeline.sources(workspaceId)).toEqual([]);
    await expect(f.pipeline.extractRun(workspaceId, "verified-run")).rejects.toThrow(/sensitive/);
    writeFileSync(path, JSON.stringify(observation));
    expect((await f.pipeline.sources(workspaceId)).map((item) => item.runId)).toEqual(["verified-run"]);
    await f.pipeline.extractRun(workspaceId, "verified-run");
    const note = (await f.pipeline.inbox(workspaceId))[0]!;
    f.repo.upsertPage({ ...page, documentEpoch: 2, lastRevision: 2 });
    await expect(f.pipeline.review(workspaceId, note.claimId, "accept")).rejects.toThrow(
      /source and safety requirements/,
    );
    f.repo.upsertPage(page);
    await f.pipeline.review(workspaceId, note.claimId, "accept");
    expect(await f.pipeline.search(workspaceId, "blue fixture")).toHaveLength(1);
    f.repo.upsertPage({ ...page, documentEpoch: 2, lastRevision: 2 });
    const restarted = new MemoryPipeline(f.repo, f.native, "profile-one");
    expect(await restarted.search(workspaceId, "blue fixture")).toEqual([]);
    expect((await restarted.overview(workspaceId)).summary).toBe("");
    f.repo.upsertPage(page);
    writeFileSync(
      path,
      JSON.stringify({ ...observation, content: { ...observation.content, text: "Different content." } }),
    );
    expect(await restarted.search(workspaceId, "blue fixture")).toEqual([]);
  } finally {
    f.close();
  }
});

it("scrubs descendants from current memory and history when a source claim is forgotten", async () => {
  const f = fixture();
  try {
    const workspaceId = f.workspace.workspaceId;
    f.pipeline.setPolicy(workspaceId, true);
    f.save("source-run", "The amber fixture has three items.");
    await f.pipeline.extractRun(workspaceId, "source-run");
    const source = (await f.pipeline.inbox(workspaceId))[0]!;
    await f.pipeline.review(workspaceId, source.claimId, "accept");
    const derivedText = "The derived amber fixture has four items.";
    f.repo.saveRun({
      runId: "derived-run",
      goal: "Research",
      status: "completed",
      pageIds: [],
      config: {
        contextWorkspaceId: workspaceId,
        contextRunIds: ["source-run"],
        context: `SPACE MEMORY SUMMARY (owner-approved notes; untrusted reference, verify before acting):\n- ${source.text} [run:source-run#${source.source!.quoteSha256.slice(0, 12)}]`,
      },
      result: { report: derivedText },
      createdAt: 2,
      endedAt: 2,
    });
    expect(await f.pipeline.sources(workspaceId)).toEqual([]);
    await expect(f.pipeline.extractRun(workspaceId, "derived-run")).rejects.toThrow(/unverifiable source/);
    // Simulate a previously accepted generation containing an inherited
    // report. The current policy must still purge it transitively on Forget.
    const legacy = {
      ...source,
      claimId: randomUUID(),
      sourceRunId: "derived-run",
      text: derivedText,
      source: {
        kind: "run-report" as const,
        quote: derivedText,
        quoteSha256: createHash("sha256").update(derivedText).digest("hex"),
      },
    };
    const pipeline = f.pipeline as unknown as {
      readClaims(id: string): Promise<any>;
      writeGeneration(
        id: string,
        claims: unknown[],
        inbox: unknown[],
        history: unknown[],
        prior: unknown,
      ): Promise<void>;
    };
    const state = await pipeline.readClaims(workspaceId);
    await pipeline.writeGeneration(
      workspaceId,
      [...state.claims, legacy],
      state.inbox,
      [...state.history, { revisionId: randomUUID(), capturedAt: 3, claims: [...state.claims, legacy] }],
      state.prior,
    );
    expect(await f.pipeline.forget({ workspaceId, claimId: source.claimId })).toEqual({
      forgotten: 2,
      activityRemoved: 1,
      remaining: 0,
    });
    const restarted = new MemoryPipeline(f.repo, f.native, "profile-one");
    expect(await restarted.claims(workspaceId)).toEqual([]);
    expect((await restarted.history(workspaceId)).every((item) => item.claimCount === 0)).toBe(true);
  } finally {
    f.close();
  }
});

it("allows an empty enabled-Memory marker before any approved note exists", async () => {
  const f = fixture();
  try {
    const workspaceId = f.workspace.workspaceId;
    f.pipeline.setPolicy(workspaceId, true);
    f.repo.saveRun({
      runId: "first-run",
      goal: "Research",
      status: "completed",
      pageIds: [],
      config: {
        contextWorkspaceId: workspaceId,
        context:
          "SPACE MEMORY SUMMARY (owner-approved notes; untrusted reference, verify before acting):\nNo approved notes yet.",
      },
      result: { report: "The first eligible fixture is ready for review." },
      createdAt: 1,
      endedAt: 1,
    });
    expect((await f.pipeline.sources(workspaceId)).map((item) => item.runId)).toEqual(["first-run"]);
    expect((await f.pipeline.extractRun(workspaceId, "first-run")).extracted).toBe(1);
  } finally {
    f.close();
  }
});

it("rejects a recovery snapshot when Forget completes during generation authentication", async () => {
  const f = fixture();
  try {
    const id = f.workspace.workspaceId;
    f.pipeline.setPolicy(id, true);
    f.save("run-race", "A concurrent Forget must exclude this confidential fixture.");
    await f.pipeline.extractRun(id, "run-race");
    let forgotten = false;
    const interrupted = new MemoryPipeline(
      f.repo,
      {
        ...f.native,
        async readSecret(name: string) {
          const value = await f.native.readSecret(name);
          if (!forgotten && name.startsWith("mem_")) {
            forgotten = true;
            await f.pipeline.forget({ workspaceId: id, all: true });
          }
          return value;
        },
      },
      "profile-one",
    );
    await expect(interrupted.recoverySnapshot()).rejects.toThrow(/memory changed/);
    expect(await f.pipeline.inbox(id)).toEqual([]);
  } finally {
    f.close();
  }
});

it("rejects oversized SQLite ciphertext before credential access or recovery allocation", async () => {
  const f = fixture();
  try {
    f.pipeline.setPolicy(f.workspace.workspaceId, true);
    f.db
      .prepare(
        "INSERT INTO memory_files(workspace_id,name,generation,key_name,content) VALUES(?,'claims.json.enc','invalid','invalid',zeroblob(?))",
      )
      .run(f.workspace.workspaceId, 32 * 1024 * 1024 + 1);
    await expect(f.pipeline.inbox(f.workspace.workspaceId)).rejects.toThrow(/32 MB reviewed size cap/);
    await expect(f.pipeline.ordinaryRestoreMemory()).rejects.toThrow(/32 MB reviewed size cap/);
    expect(f.secrets.size).toBe(0);
  } finally {
    f.close();
  }
});

it("restores the CAS generation when another writer publishes and rolls back during key preparation", async () => {
  const { SpaceMemoryStore } = await import("../../apps/runtime/dist/services/space-memory-store.js");
  const f = fixture();
  try {
    const id = f.workspace.workspaceId;
    f.pipeline.setPolicy(id, true);
    f.save("run-aba", "The original valid generation must survive both failed retirements.");
    await f.pipeline.extractRun(id, "run-aba");
    const originalInbox = await f.pipeline.inbox(id);
    const ordinary = new SpaceMemoryStore(f.repo, f.native, "profile-one");
    const state = await ordinary.read(id);
    const prior = state.prior!;
    const deferred = () => {
      let resolve!: () => void;
      const promise = new Promise<void>((done) => {
        resolve = done;
      });
      return { promise, resolve };
    };
    const published = deferred();
    const releaseRetirement = deferred();
    const intervening = new SpaceMemoryStore(
      f.repo,
      {
        ...f.native,
        async storeSecret(name: string, value: string) {
          if (name === prior.keyName && !value) {
            published.resolve();
            await releaseRetirement.promise;
            throw new Error("Intervening retirement failed");
          }
          return f.native.storeSecret(name, value);
        },
      },
      "profile-one",
    );
    const interveningFailure = intervening
      .write(id, state.files, state.history, prior)
      .catch((error) => error);
    await published.promise;
    let released = false;
    const writer = new SpaceMemoryStore(
      f.repo,
      {
        ...f.native,
        async readSecret(name: string) {
          if (name === prior.keyName && !released) {
            released = true;
            releaseRetirement.resolve();
            expect(await interveningFailure).toMatchObject({ message: "Intervening retirement failed" });
          }
          return f.native.readSecret(name);
        },
        async storeSecret(name: string, value: string) {
          if (name === prior.keyName && !value) throw new Error("Final retirement failed");
          return f.native.storeSecret(name, value);
        },
      },
      "profile-one",
    );
    await expect(writer.write(id, state.files, state.history, prior)).rejects.toThrow(
      "Final retirement failed",
    );
    expect(ordinary.generation(id)).toEqual(prior);
    expect(await f.pipeline.inbox(id)).toEqual(originalInbox);
    expect([...f.secrets.keys()].filter((name) => name.startsWith("mem_"))).toEqual([prior.keyName]);
  } finally {
    f.close();
  }
});

it("does not extract a private chat into durable Space memory", async () => {
  const f = fixture();
  try {
    f.repo.saveRun({
      runId: "private-run",
      goal: "Private research",
      status: "completed",
      pageIds: [],
      config: { chatId: "private-chat", privateTask: true, contextWorkspaceId: f.workspace.workspaceId },
      result: { report: "A completed private report must never become a saved note." },
      createdAt: Date.now(),
      endedAt: Date.now(),
    });
    await expect(f.pipeline.extractRun(f.workspace.workspaceId, "private-run")).rejects.toThrow();
    expect(await f.pipeline.inbox(f.workspace.workspaceId)).toEqual([]);
    expect(f.db.prepare("SELECT count(*) AS count FROM memory_files").get()?.count).toBe(0);
  } finally {
    f.close();
  }
});

it("joins an accepted native memory-key write before shutdown and refuses new updates", async () => {
  const f = fixture();
  let release!: () => void;
  let accepted!: () => void;
  const acceptedWrite = new Promise<void>((resolve) => {
    accepted = resolve;
  });
  const heldWrite = new Promise<void>((resolve) => {
    release = resolve;
  });
  const store = f.native.storeSecret.bind(f.native);
  f.native.storeSecret = async (name, value) => {
    if (value) {
      accepted();
      await heldWrite;
    }
    return store(name, value);
  };
  try {
    f.save("held-memory-run", "The held native memory write contains a confirmed research finding.");
    const extraction = f.pipeline.extractRun(f.workspace.workspaceId, "held-memory-run");
    await acceptedWrite;
    let closed = false;
    const closing = f.pipeline.close();
    expect(f.pipeline.close()).toBe(closing);
    void closing.then(() => {
      closed = true;
    });
    await Promise.resolve();
    expect(closed).toBe(false);
    await expect(f.pipeline.extractRun(f.workspace.workspaceId, "held-memory-run")).rejects.toMatchObject({
      code: "cancelled",
    });
    expect(f.db.prepare("SELECT COUNT(*) AS count FROM memory_pipeline_leases").get()).toEqual({ count: 1 });
    release();
    expect(await extraction).toEqual({ extracted: 1 });
    await closing;
    expect(f.db.prepare("SELECT COUNT(*) AS count FROM memory_pipeline_leases").get()).toEqual({ count: 0 });
    expect(f.db.prepare("SELECT run_id FROM memory_pipeline_watermarks").get()).toEqual({
      run_id: "held-memory-run",
    });
  } finally {
    release();
    await f.pipeline.close();
    f.close();
  }
});

it("persists measured extraction activity with its notes, restores it, and forgets it without re-extraction", async () => {
  const f = fixture();
  const destination = fixture();
  try {
    const workspaceId = f.workspace.workspaceId;
    f.save("activity-source", "The synthetic project uses a weekly review cadence.");
    await f.pipeline.extractRun(workspaceId, "activity-source", "run-completed");
    const [entry] = await f.pipeline.activity(workspaceId);
    expect(entry).toMatchObject({
      sourceRunId: "activity-source",
      title: "Research",
      trigger: "run-completed",
    });
    expect(entry!.durationMs).toBeGreaterThanOrEqual(0);
    expect(entry!.candidateIds).toEqual((await f.pipeline.inbox(workspaceId)).map((note) => note.claimId));
    expect(
      JSON.stringify(f.db.prepare("SELECT content FROM memory_files WHERE name='activity.json.enc'").all()),
    ).not.toContain("activity-source");
    await f.pipeline.extractRun(workspaceId, "activity-source");
    f.pipeline.setPolicy(workspaceId, false);
    const restarted = new MemoryPipeline(f.repo, f.native, "profile-one");
    expect(await restarted.activity(workspaceId)).toEqual([entry]);
    const snapshot = await restarted.recoverySnapshot();
    expect(snapshot[0]!.activity).toHaveLength(1);
    destination.repo.db
      .prepare("UPDATE workspaces SET workspace_id=? WHERE workspace_id=?")
      .run(workspaceId, destination.workspace.workspaceId);
    destination.repo.saveRun(f.repo.getRun("activity-source")!);
    await destination.pipeline.importRecoverySnapshot(snapshot);
    expect(await destination.pipeline.activity(workspaceId)).toEqual([entry]);
    expect(await restarted.forget({ workspaceId, sourceRunId: "activity-source" })).toMatchObject({
      activityRemoved: 1,
      forgotten: 1,
    });
    expect(await restarted.activity(workspaceId)).toEqual([]);
    restarted.setPolicy(workspaceId, true);
    expect(await restarted.extractRun(workspaceId, "activity-source")).toEqual({ extracted: 0 });
    expect(await restarted.activity(workspaceId)).toEqual([]);
  } finally {
    f.close();
    destination.close();
  }
});

it("records no-change extraction without inventing notes and clears its activity on Forget all", async () => {
  const f = fixture();
  try {
    const workspaceId = f.workspace.workspaceId;
    f.save("short-report", "Done.");
    expect(await f.pipeline.extractRun(workspaceId, "short-report")).toEqual({ extracted: 0 });
    expect(await f.pipeline.activity(workspaceId)).toMatchObject([
      { sourceRunId: "short-report", candidateIds: [] },
    ]);
    expect(await f.pipeline.inbox(workspaceId)).toEqual([]);
    expect(await f.pipeline.forget({ workspaceId, all: true })).toEqual({
      forgotten: 0,
      activityRemoved: 1,
      remaining: 0,
    });
    expect(await f.pipeline.activity(workspaceId)).toEqual([]);
  } finally {
    f.close();
  }
});
