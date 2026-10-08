import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { open } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import {
  ArtifactStore,
  EventBus,
  Repo,
  TaskEvidenceService,
  TaskService,
  exportTaskReceipt,
  openDb,
} from "@aux/runtime";
import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import { initializeFieldCodec } from "../../apps/runtime/src/store/field-codec.js";
import { profileSecrets } from "../support/profile-secrets.js";

const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
});
async function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "aux-receipt-export-"));
  const db = openDb(join(directory, "state.sqlite"));
  const repo = new Repo(
    db,
    await initializeFieldCodec(db, profileSecrets("receipt-export").native, "receipt-export"),
  );
  const events = new EventBus(repo);
  const documents = new DocumentSnapshots(repo);
  const artifacts = new ArtifactStore(join(directory, "artifacts"), repo, events);
  await artifacts.exports.initialize();
  cleanups.push(async () => {
    await artifacts.exports.close();
    await documents.close();
    repo.close();
    rmSync(directory, { recursive: true, force: true });
  });
  const tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Export fixture");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Document review",
    objective: "Compare saved statements",
    criteria: [{ criterionId: "source", description: "Read all statements", verification: "manual" }],
    resources: [],
  });
  const evidence = new TaskEvidenceService(repo, events, documents);
  const record = evidence.importText({
    taskId: task.taskId,
    expectedRevision: 1,
    criterionId: "source",
    filename: "Statement.txt",
    content:
      "Opening statement.\n" +
      "Full retained paragraph. ".repeat(7000) +
      "\nLast retained sentence <script>unsafe()</script>.",
  });
  const context = { token: "original-window-token", signal: new AbortController().signal };
  const services = { repo, evidence, documents, artifacts };
  const params = {
    action: "prepare" as const,
    exportId: randomUUID(),
    taskId: task.taskId,
    expectedRevision: 1,
    includeCapturedText: true,
  };
  return { directory, repo, tasks, task, record, documents, artifacts, services, context, params };
}

it("streams complete historical evidence into a private temporary artifact and retains an accepted native save until release", async () => {
  const f = await fixture();
  f.tasks.update({ taskId: f.task.taskId, expectedRevision: 1, objective: "New current objective" });
  const result = await exportTaskReceipt(f.services, f.params, f.context);
  expect(result.status).toBe("prepared");
  if (result.status !== "prepared") throw new Error("Expected prepared export");
  expect(f.repo.listArtifacts({})).toEqual([]);
  expect(f.artifacts.list({})).toEqual([]);
  expect(() => f.artifacts.read(result.artifactId)).toThrow(/no artifact/);
  expect(() =>
    f.artifacts.exports.claim({
      artifactId: result.artifactId,
      token: "another-window",
      claimId: randomUUID(),
    }),
  ).toThrow(/original Aux window/);
  const claim = { artifactId: result.artifactId, token: f.context.token, claimId: randomUUID() };
  const descriptor = f.artifacts.exports.claim(claim)!;
  const content = readFileSync(descriptor.path, "utf8");
  expect(content).toContain("earlier revision");
  expect(content).toContain("current task revision is 2");
  expect(content).toContain("Compare saved statements");
  expect(content).not.toContain("New current objective");
  expect(content).toContain("Last retained sentence &lt;script&gt;unsafe\\(\\)&lt;/script&gt;");
  expect(content).toContain("Location: text:");
  expect(content).toContain(f.record.document!.sha256);
  expect(createHash("sha256").update(content).digest("hex")).toBe(result.sha256);
  expect(Buffer.byteLength(content)).toBe(result.byteLength);
  expect(statSync(descriptor.path).mode & 0o777).toBe(0o600);
  const fd = await open(descriptor.path, "r");
  try {
    await exportTaskReceipt(f.services, { action: "retire", exportId: f.params.exportId }, f.context);
    expect(existsSync(descriptor.path)).toBe(true);
    await expect(f.artifacts.exports.release({ ...claim, claimId: randomUUID() })).rejects.toThrow(
      /does not own/,
    );
    await f.artifacts.exports.release(claim);
    expect(existsSync(descriptor.path)).toBe(false);
    expect(await fd.readFile("utf8")).toBe(content);
    await expect(f.artifacts.exports.release(claim)).resolves.toEqual({ ok: true });
  } finally {
    await fd.close();
  }
});

function pauseAfterFirstSegment(documents: DocumentSnapshots) {
  const reached = Promise.withResolvers<void>();
  const resume = Promise.withResolvers<void>();
  const segments = documents.segments.bind(documents);
  vi.spyOn(documents, "segments").mockImplementation(async function* (...args) {
    let paused = false;
    for await (const segment of segments(...args)) {
      yield segment;
      if (!paused) {
        paused = true;
        reached.resolve();
        await resume.promise;
      }
    }
  });
  return { reached: reached.promise, resume: resume.resolve };
}

it.each(["revision", "document"] as const)(
  "removes incomplete output when its original %s changes during segment streaming",
  async (change) => {
    const f = await fixture();
    const paused = pauseAfterFirstSegment(f.documents);
    const preparing = exportTaskReceipt(f.services, f.params, f.context);
    const outcome = preparing.catch((error: unknown) => error);
    await paused.reached;
    if (change === "revision")
      f.tasks.update({ taskId: f.task.taskId, expectedRevision: 1, objective: "Changed while streaming" });
    else f.documents.remove({ kind: "task", ownerId: f.task.taskId, documentId: f.record.evidenceId });
    paused.resume();
    expect(await outcome).toMatchObject({ code: "ref_stale" });
    expect(readdirSync(join(f.directory, "artifacts", "private.exports"))).toEqual([]);
    expect(f.repo.listArtifacts({})).toEqual([]);
  },
);

it("joins cancellation, fences delayed prepares, and unlinks claimed output on runtime close without breaking its native FD", async () => {
  const f = await fixture();
  const paused = pauseAfterFirstSegment(f.documents);
  const preparing = exportTaskReceipt(f.services, f.params, f.context);
  const outcome = preparing.catch((error: unknown) => error);
  await paused.reached;
  const retirement = exportTaskReceipt(
    f.services,
    { action: "retire", exportId: f.params.exportId },
    f.context,
  );
  paused.resume();
  expect(await outcome).toMatchObject({ code: "cancelled" });
  await expect(retirement).resolves.toMatchObject({ status: "retired" });
  expect(readdirSync(join(f.directory, "artifacts", "private.exports"))).toEqual([]);
  const late = { ...f.params, exportId: randomUUID() };
  await exportTaskReceipt(f.services, { action: "retire", exportId: late.exportId }, f.context);
  await expect(exportTaskReceipt(f.services, late, f.context)).rejects.toThrow(/retired/);
  const prepared = await exportTaskReceipt(
    f.services,
    { ...f.params, exportId: randomUUID(), includeCapturedText: false },
    f.context,
  );
  if (prepared.status !== "prepared") throw new Error("Expected prepared export");
  const claim = { artifactId: prepared.artifactId, token: f.context.token, claimId: randomUUID() };
  const descriptor = f.artifacts.exports.claim(claim)!;
  const fd = await open(descriptor.path, "r");
  try {
    await f.artifacts.exports.close();
    expect(existsSync(descriptor.path)).toBe(false);
    const text = await fd.readFile("utf8");
    expect(text).toContain("Captured document text omitted");
    expect(text).not.toContain("Last retained sentence");
  } finally {
    await fd.close();
  }
});

it("tombstones a retired native owner before queued prepares and leaves a different original window usable", async () => {
  const f = await fixture();
  await expect(f.artifacts.exports.retireOwner(f.context.token)).resolves.toEqual({ ok: true });
  await expect(exportTaskReceipt(f.services, f.params, f.context)).rejects.toMatchObject({
    code: "cancelled",
  });
  await expect(
    exportTaskReceipt(f.services, { ...f.params, exportId: randomUUID() }, f.context),
  ).rejects.toMatchObject({ code: "cancelled" });
  await expect(f.artifacts.exports.retireOwner(f.context.token)).resolves.toEqual({ ok: true });
  expect(readdirSync(join(f.directory, "artifacts", "private.exports"))).toEqual([]);
  await expect(
    exportTaskReceipt(
      f.services,
      { ...f.params, exportId: randomUUID(), includeCapturedText: false },
      { ...f.context, token: "different-original-window" },
    ),
  ).resolves.toMatchObject({ status: "prepared" });
});

it("joins a retired owner's pending writer and removes unclaimed output while preserving an accepted native claim", async () => {
  const f = await fixture();
  const unclaimed = await exportTaskReceipt(
    f.services,
    { ...f.params, exportId: randomUUID(), includeCapturedText: false },
    f.context,
  );
  const claimed = await exportTaskReceipt(
    f.services,
    { ...f.params, exportId: randomUUID(), includeCapturedText: false },
    f.context,
  );
  if (unclaimed.status !== "prepared" || claimed.status !== "prepared")
    throw new Error("Expected prepared exports");
  const claim = { artifactId: claimed.artifactId, token: f.context.token, claimId: randomUUID() };
  const descriptor = f.artifacts.exports.claim(claim)!;
  const fd = await open(descriptor.path, "r");
  const paused = pauseAfterFirstSegment(f.documents);
  const preparing = exportTaskReceipt(f.services, f.params, f.context);
  const outcome = preparing.catch((error: unknown) => error);
  await paused.reached;
  let joined = false;
  const retirement = f.artifacts.exports.retireOwner(f.context.token).then((result) => {
    joined = true;
    return result;
  });
  try {
    await expect(
      exportTaskReceipt(f.services, { ...f.params, exportId: randomUUID() }, f.context),
    ).rejects.toMatchObject({ code: "cancelled" });
    expect(joined).toBe(false);
    paused.resume();
    expect(await outcome).toMatchObject({ code: "cancelled" });
    await expect(retirement).resolves.toEqual({ ok: true });
    expect(readdirSync(join(f.directory, "artifacts", "private.exports"))).toEqual([
      `${claimed.artifactId}.md`,
    ]);
    expect(existsSync(descriptor.path)).toBe(true);
    expect(await fd.readFile("utf8")).toContain("Captured document text omitted");
    await f.artifacts.exports.release(claim);
    expect(existsSync(descriptor.path)).toBe(false);
  } finally {
    paused.resume();
    await retirement;
    await fd.close();
  }
});
