import { afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDb, Repo, EventBus, SettingsService, RunService, TranscriptStore } from "@aux/runtime";
import { TaskService } from "@aux/runtime";
import { ContentMemoryStore } from "../../apps/runtime/dist/services/content-memory.js";
import { profileSecrets } from "../support/profile-secrets.js";
import type { TurnSourceContext } from "@aux/contracts/turn-source-context";
import type { Run } from "@aux/contracts";
import { MethodSchemas } from "@aux/contracts/api";
import { RunWorkTraceSchema } from "@aux/contracts/transcript";
import { projectRunWorkTrace } from "../../apps/runtime/dist/services/run-work-trace.js";
import { runsMethods } from "../../apps/runtime/dist/api/methods/runs.js";
import type { MethodCtx } from "../../apps/runtime/dist/api/methods/context.js";
import { DocumentSnapshots } from "../../apps/runtime/dist/services/document-snapshots.js";
import { PageService } from "../../apps/runtime/dist/services/pages.js";
import { SetService } from "../../apps/runtime/dist/services/sets.js";
import { ArtifactStore } from "../../apps/runtime/dist/services/artifacts.js";
import { NullNativeBridge } from "../../apps/runtime/dist/native.js";
import { setMemberSourceDigest } from "../../apps/runtime/dist/services/set-member-lineage.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0)) await close();
  vi.restoreAllMocks();
});
function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "aux-work-trace-"));
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Historical work");
  const memory = new ContentMemoryStore(repo, profileSecrets("historical-work").native, "historical-work");
  const settings = new SettingsService(repo, join(directory, "settings.json"), {});
  const turnMentions = fixtureTurnMentions((id) => repo.getPage(id));
  const pages = new PageService({
    repo,
    events,
    turnMentions,
    native: new NullNativeBridge(),
    drivers: () => ({ aux: null, chrome: null }),
  });
  const artifacts = new ArtifactStore(directory, repo, events);
  const runs = new RunService({
    repo,
    events,
    settings,
    pages,
    turnMentions,
    contentMemory: memory,
    artifacts,
    documentSnapshots: new DocumentSnapshots(repo),
    sets: new SetService(repo, events, pages),
    nativeAvailable: () => false,
  });
  const run: Run = {
    runId: "original",
    goal: "Read the synthetic document",
    status: "completed",
    pageIds: [],
    createdAt: 1,
    config: { implementation: "agent-loop", chatId: "chat" },
  };
  repo.saveRun(run);
  const transcript = new TranscriptStore(repo.db, repo.columnCipher);
  const call = (id = "call-1", result = "Actual recorded output") => {
    transcript.append(run.runId, [
      {
        role: "assistant",
        content: [
          {
            type: "tool-call",
            toolCallId: id,
            toolName: "repl",
            input: { code: "console.log('Original recorded input')" },
          },
        ],
      },
      {
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: id,
            toolName: "repl",
            output: { type: "json", value: { displayed: [result] } },
          },
        ],
      },
    ]);
  };
  const context = (params: Record<string, unknown> = {}) =>
    ({
      params: { runId: run.runId, ...params },
      client: { external: false, nativeTurnContext: "original-window-token" },
      s: {
        repo,
        runs,
        artifacts,
        native: { turnSourceContext: vi.fn(async () => ({ windowId: "home-window" })) },
      },
      suspensions: { pending: () => [] },
    }) as unknown as MethodCtx;
  cleanup.push(async () => {
    await runs.close();
    await memory.close();
    repo.close();
    rmSync(directory, { recursive: true, force: true });
  });
  return { repo, runs, run, transcript, call, context, tasks, workspace, memory };
}
it("reads actual call/results by exact run, sequence and call identity without replay", async () => {
  const f = fixture();
  f.call();
  f.transcript.append("foreign", [
    {
      role: "assistant",
      content: [
        { type: "tool-call", toolCallId: "foreign", toolName: "repl", input: { code: "Foreign code" } },
      ],
    },
  ]);
  const result = await f.runs.workTrace(f.run.runId, undefined, async () => {});
  expect(result.calls).toMatchObject([
    {
      toolCallId: "call-1",
      toolName: "repl",
      sequence: 0,
      status: "completed",
      input: expect.stringContaining("Original recorded input"),
      output: expect.stringContaining("Actual recorded output"),
    },
  ]);
  expect(JSON.stringify(result)).not.toContain("Foreign code");
  expect(f.repo.db.prepare("SELECT count(*) AS count FROM run_transcript").get()).toMatchObject({ count: 3 });
});
it("paginates real transcript rows without losing a result across the page boundary", () => {
  const f = fixture();
  for (let i = 0; i < 100; i++) f.call(`call-${i}`, `Result ${i}`);
  const seen = new Set<string>();
  let cursor: number | undefined;
  do {
    const page = projectRunWorkTrace(f.transcript, f.run.runId, cursor);
    RunWorkTraceSchema.parse(page);
    for (const call of page.calls) {
      expect(call.output).toContain(call.toolCallId.replace("call-", "Result "));
      expect(seen.has(call.toolCallId)).toBe(false);
      seen.add(call.toolCallId);
    }
    cursor = page.earlierSequence;
  } while (cursor !== undefined);
  expect(seen.size).toBe(100);
});
it("redacts nested credentials and credential-shaped code text; bounds inert output", () => {
  const f = fixture();
  f.transcript.append(f.run.runId, [
    {
      role: "assistant",
      content: [
        {
          type: "tool-call",
          toolCallId: "secret",
          toolName: "repl",
          input: {
            code: "fetch('https://example.test', {token: 'sk-abcdefghijklmnopqrstuvwxyz012345'})",
            nested: { Authorization: "Bearer private-credential" },
          },
        },
      ],
    },
    {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId: "secret",
          toolName: "repl",
          output: { type: "json", value: { access_token: "never-render-this", result: "x".repeat(25_000) } },
        },
      ],
    },
  ]);
  const page = projectRunWorkTrace(f.transcript, f.run.runId);
  expect(JSON.stringify(page)).not.toMatch(/sk-abcdefghijkl|private-credential|never-render-this/);
  expect(page.calls[0]!.outputTruncated).toBe(true);
  expect(page.calls[0]!.output!.length).toBeLessThanOrEqual(16_384);
});
it("does not match a result with a replaced tool name or manufacture a missing result", () => {
  const f = fixture();
  f.transcript.append(f.run.runId, [
    {
      role: "assistant",
      content: [{ type: "tool-call", toolCallId: "original", toolName: "repl", input: { code: "Original" } }],
    },
    {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId: "original",
          toolName: "another",
          output: { type: "text", value: "Unrelated result" },
        },
      ],
    },
  ]);
  expect(projectRunWorkTrace(f.transcript, f.run.runId).calls[0]).toMatchObject({ status: "pending" });
  expect(projectRunWorkTrace(f.transcript, f.run.runId).calls[0]!.output).toBeUndefined();
});
it("rechecks original window and source retirement after a held read without requiring a page", async () => {
  const f = fixture();
  f.call();
  let release!: () => void;
  let entered!: () => void;
  const started = new Promise<void>((done) => (entered = done));
  const gate = new Promise<void>((done) => (release = done));
  const read = f.runs.workTrace(f.run.runId, undefined, async () => {
    entered();
    await gate;
  });
  await started;
  f.repo.saveRun({ ...f.run, config: { ...f.run.config, contextMemoryRevoked: true } });
  release();
  await expect(read).rejects.toMatchObject({ code: "permission_denied" });
});
it("keeps basic polling available while refusing external/code-mode or tokenless work reads", async () => {
  const f = fixture();
  f.call();
  const handler = runsMethods["runs.workTrace.get"]!;
  const plain = f.context();
  plain.client.external = true;
  delete plain.client.nativeTurnContext;
  expect(await runsMethods["runs.get"]!(plain)).toMatchObject({
    run: { runId: f.run.runId },
    transcript: { runId: f.run.runId },
  });
  for (const changes of [{ external: true }, { codeMode: true as const }, { nativeTurnContext: undefined }]) {
    const ctx = f.context();
    Object.assign(ctx.client, changes);
    await expect(handler(ctx)).rejects.toMatchObject({ code: "permission_denied" });
  }
  const owner = f.context();
  expect(await handler(owner)).toMatchObject({ runId: f.run.runId, calls: [{ toolCallId: "call-1" }] });
  expect(owner.s.native!.turnSourceContext).toHaveBeenCalledWith("original-window-token");
  expect(MethodSchemas["runs.workTrace.get"].safeParse({ runId: f.run.runId, beforeSeq: 0 }).success).toBe(
    false,
  );
  expect(MethodSchemas["runs.workTrace.get"].safeParse({ runId: f.run.runId, limit: 41 }).success).toBe(
    false,
  );
});
it("reads completed and stopped historical work from a new viewer without the original execution token", async () => {
  const f = fixture();
  f.call();
  for (const status of ["completed", "cancelled", "interrupted"] as const) {
    f.repo.saveRun({
      ...f.run,
      status,
      config: { ...f.run.config, nativeTurnContext: "3832798a-c404-499b-99a2-a24c780e8225" },
    });
    const ctx = f.context();
    ctx.client.nativeTurnContext = "new-viewer-token";
    expect(await runsMethods["runs.workTrace.get"]!(ctx)).toMatchObject({
      runId: f.run.runId,
      calls: [{ toolCallId: "call-1" }],
    });
    expect(ctx.s.native!.turnSourceContext).toHaveBeenCalledWith("new-viewer-token");
    expect(ctx.s.native!.turnSourceContext).not.toHaveBeenCalledWith("3832798a-c404-499b-99a2-a24c780e8225");
  }
});

function viewer(workspaceId: string): TurnSourceContext {
  return {
    windowId: "new-history-window",
    activePageId: null,
    revision: 0,
    layout: {
      shared: {
        spaces: [{ id: "selected-space", name: "Historical", color: "blue", grain: 0, workspaceId }],
        archivedSpaces: [],
        pins: {},
        folders: [],
        tabSpace: {},
        order: [],
        tabFolder: {},
        tabNames: {},
        splitGroups: [],
      },
      window: { activeSpaceId: "selected-space", activeTabs: {}, splitRatio: 0.5 },
    },
  };
}
async function articleFixture() {
  const f = fixture();
  f.call();
  const workspaceId = f.workspace.workspaceId;
  const saved = await f.memory.saveEligible({
    workspaceId,
    pageId: "closed-original-page",
    documentEpoch: 1,
    url: "https://example.test/historical",
    title: "Historical record",
    text: "The original workshop meets Tuesday.",
  });
  const refs = (await f.memory.list(workspaceId, { workspaceId, selectedIds: [saved.memoryId] })).selected;
  f.repo.saveRun({
    ...f.run,
    config: {
      ...f.run.config,
      contextWorkspaceId: workspaceId,
      contextMemoryRefs: refs,
      contextMemoryIds: [saved.memoryId],
    },
  });
  const ctx = f.context();
  vi.mocked(ctx.s.native!.turnSourceContext!).mockResolvedValue(viewer(workspaceId));
  return { ...f, saved, ctx, workspaceId };
}
it("reads archived protected work in its selected new viewer Space with ordinary Memory off", async () => {
  const f = await articleFixture();
  f.tasks.setWorkspaceMemory(f.workspaceId, 0, "", false);
  f.runs.archiveConversation("chat", true);
  expect(await runsMethods["runs.workTrace.get"]!(f.ctx)).toMatchObject({
    protectedWorkspaceId: f.workspaceId,
    calls: [{ toolCallId: "call-1" }],
  });
});
it("refuses a foreign viewer Space before article decryption and rechecks Space after source preparation", async () => {
  const f = await articleFixture();
  const proof = vi.spyOn(f.memory, "assertHistoricalSources");
  const read = vi.mocked(f.ctx.s.native!.turnSourceContext!);
  read.mockResolvedValue(viewer("foreign-space"));
  await expect(runsMethods["runs.workTrace.get"]!(f.ctx)).rejects.toThrow(/original Space/);
  expect(proof).not.toHaveBeenCalled();
  let calls = 0;
  read.mockImplementation(async () => viewer(++calls >= 3 ? "foreign-space" : f.workspaceId));
  await expect(runsMethods["runs.workTrace.get"]!(f.ctx)).rejects.toThrow(/original Space/);
  expect(proof).toHaveBeenCalledOnce();
});
it("never publishes forgotten protected work after source bytes were prepared", async () => {
  const f = await articleFixture();
  const original = f.memory.assertHistoricalSources.bind(f.memory);
  vi.spyOn(f.memory, "assertHistoricalSources").mockImplementation(async (...args) => {
    const check = await original(...args);
    await f.memory.forget(f.workspaceId, f.saved.memoryId);
    return check;
  });
  await expect(runsMethods["runs.workTrace.get"]!(f.ctx)).rejects.toThrow(/forgotten/);
});

it("preserves completed Set lineage after its original page closes without requiring active execution membership", async () => {
  const f = fixture();
  f.call();
  const parent = { ...f.run, runId: "historical-set-parent", config: { chatId: "set-parent" } };
  f.repo.saveRun(parent);
  const set = {
    setId: "historical-set",
    name: "Original Set",
    source: "urls" as const,
    memberIds: ["original-member"],
    createdAt: 1,
  };
  f.repo.saveSet(set);
  f.repo.saveMember({
    memberId: "original-member",
    setId: set.setId,
    ordinal: 0,
    url: "https://example.test/original",
    status: "completed",
  });
  const source = {
    parentRunId: parent.runId,
    setId: set.setId,
    memberId: "original-member",
    url: "https://example.test/original",
    memberUrl: "https://example.test/original",
    pageId: "closed-page",
    sessionId: "old-session",
    documentEpoch: 1,
  };
  const sourceDigest = setMemberSourceDigest(source);
  f.repo.saveRun({ ...f.run, config: { ...f.run.config, setMemberSource: { ...source, sourceDigest } } });
  f.repo.db
    .prepare(
      "INSERT INTO set_run_members(child_run_id,parent_run_id,set_id,member_id,source_digest,state,created_at,updated_at) VALUES(?,?,?,?,?,'completed',1,1)",
    )
    .run(f.run.runId, parent.runId, set.setId, source.memberId, sourceDigest);
  expect(await f.runs.workTrace(f.run.runId, undefined, async () => {})).toMatchObject({
    calls: [{ toolCallId: "call-1" }],
  });
  f.repo.db
    .prepare("UPDATE set_run_members SET source_digest=? WHERE child_run_id=?")
    .run("f".repeat(64), f.run.runId);
  await expect(f.runs.workTrace(f.run.runId, undefined, async () => {})).rejects.toMatchObject({
    code: "permission_denied",
  });
});
it("bounds UTF8 excerpts in bytes and never executes or attributes model tokens to an individual tool", () => {
  const f = fixture();
  f.call("unicode", "日".repeat(20_000));
  const call = projectRunWorkTrace(f.transcript, f.run.runId).calls[0]!;
  expect(Buffer.byteLength(call.output!, "utf8")).toBeLessThanOrEqual(16_384);
  expect(call.outputTruncated).toBe(true);
  expect(call).not.toHaveProperty("tokens");
});
it("aborts and joins the original final viewer read before real article Forget removes its row/key", async () => {
  const f = await articleFixture();
  let enter!: () => void, release!: () => void;
  const entered = new Promise<void>((done) => (enter = done)),
    gate = new Promise<void>((done) => (release = done));
  let nativeReads = 0;
  vi.mocked(f.ctx.s.native!.turnSourceContext!).mockImplementation(async () => {
    if (++nativeReads === 3) {
      enter();
      await gate;
    }
    return viewer(f.workspaceId);
  });
  const read = runsMethods["runs.workTrace.get"]!(f.ctx).then(
    (value) => ({ value }),
    (error) => ({ error }),
  );
  await entered;
  let finished = false;
  const removal = f.memory
    .forget(f.workspaceId, f.saved.memoryId, () =>
      f.runs.retireArticleTransferSources(f.workspaceId, f.saved.memoryId),
    )
    .then((value) => {
      finished = true;
      return value;
    });
  await new Promise<void>((done) => setImmediate(done));
  expect(finished).toBe(false);
  expect(
    f.repo.db.prepare("SELECT 1 FROM content_memory WHERE memory_id=?").get(f.saved.memoryId),
  ).toBeDefined();
  await expect(runsMethods["runs.workTrace.get"]!(f.ctx)).rejects.toMatchObject({
    code: "permission_denied",
  });
  release();
  expect(await read).toMatchObject({ error: { code: "cancelled" } });
  expect(await removal).toBe(1);
  expect(
    f.repo.db.prepare("SELECT 1 FROM content_memory WHERE memory_id=?").get(f.saved.memoryId),
  ).toBeUndefined();
});
