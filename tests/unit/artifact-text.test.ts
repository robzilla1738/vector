import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync, utimesSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { AuxError, ArtifactTextInputSchema, type Run } from "@aux/contracts";
import { ArtifactStore, EventBus, Repo, openDb } from "@aux/runtime";
import { initializeFieldCodec } from "../../apps/runtime/src/store/field-codec.js";
import { profileSecrets } from "../support/profile-secrets.js";

const cleanup: (() => void)[] = [];
afterEach(() =>
  cleanup
    .splice(0)
    .reverse()
    .forEach((fn) => fn()),
);
async function fixture(
  content: string | Buffer = "item,amount\na,4\nb,6\n",
  mediaType = "text/plain",
  label = "rec-10-data.csv",
) {
  const dir = mkdtempSync(join(tmpdir(), "aux-artifact-text-"));
  cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db, await initializeFieldCodec(db, profileSecrets(dir).native, dir));
  const run: Run = {
    runId: "original-run",
    goal: "Read downloaded CSV",
    status: "running",
    pageIds: ["original-page"],
    createdAt: 1,
  };
  repo.saveRun(run);
  const artifacts = new ArtifactStore(join(dir, "artifacts"), repo, new EventBus(repo));
  const source = artifacts.save({
    runId: run.runId,
    pageId: "original-page",
    label,
    mediaType,
    buffer: Buffer.from(content),
  });
  const abort = new AbortController();
  const owner = { runId: run.runId, signal: abort.signal, checkCurrent: vi.fn() };
  const read = (input: Partial<Parameters<ArtifactStore["readText"]>[0]> = {}) =>
    artifacts.readText({ artifactId: source.artifactId, ...input }, owner);
  return { dir, repo, run, artifacts, source, abort, owner, read };
}

it("reads the admitted CSV through decoded Repo metadata without exposing a path or widening its run", async () => {
  const f = await fixture();
  const result = await f.read();
  expect(result).toMatchObject({
    source: "untrusted_artifact",
    artifact: {
      artifactId: f.source.artifactId,
      filename: "rec-10-data.csv",
      mediaType: "text/plain",
      size: 20,
    },
    content: "item,amount\na,4\nb,6\n",
    offset: 0,
    eof: true,
  });
  expect(result.sha256).toBe(createHash("sha256").update(readFileSync(f.source.path)).digest("hex"));
  expect(JSON.stringify(result)).not.toContain(f.dir);
  expect(result.artifact).not.toHaveProperty("path");
  expect(f.owner.checkCurrent.mock.calls.length).toBeGreaterThan(3);
});

it("rejects another run's artifact even when its ID is supplied as context", async () => {
  const f = await fixture();
  f.repo.saveRun({ ...f.run, runId: "other-run", config: { contextArtifactIds: [f.source.artifactId] } });
  await expect(
    f.artifacts.readText({ artifactId: f.source.artifactId }, { ...f.owner, runId: "other-run" }),
  ).rejects.toMatchObject({ code: "permission_denied" });
});

it.each(["deleted", "forgotten", "completed"])("refuses a %s original run before reading", async (state) => {
  const f = await fixture();
  if (state === "deleted") f.repo.db.prepare("DELETE FROM runs WHERE run_id=?").run(f.run.runId);
  else
    f.repo.saveRun({
      ...f.run,
      ...(state === "forgotten"
        ? { config: { contextMemoryRevoked: true } }
        : { status: "completed" as const }),
    });
  await expect(f.read()).rejects.toMatchObject({ code: "permission_denied" });
});

it.each(["delete", "replace", "forget", "retire", "abort"])(
  "discards already read chunks on mid-read %s",
  async (change) => {
    const f = await fixture("a".repeat(100_000));
    let checks = 0;
    f.owner.checkCurrent.mockImplementation(() => {
      if (++checks !== 5) return;
      if (change === "delete")
        f.repo.db.prepare("DELETE FROM artifacts WHERE artifact_id=?").run(f.source.artifactId);
      if (change === "replace")
        f.repo.db
          .prepare("UPDATE artifacts SET created_at=? WHERE artifact_id=?")
          .run(f.source.createdAt + 1, f.source.artifactId);
      if (change === "forget") f.repo.saveRun({ ...f.run, config: { contextMemoryRevoked: true } });
      if (change === "retire") throw new AuxError("cancelled", "Original source retired");
      if (change === "abort") f.abort.abort();
    });
    const expected =
      change === "abort"
        ? { name: "AbortError" }
        : {
            code: change === "forget" ? "permission_denied" : change === "retire" ? "cancelled" : "ref_stale",
          };
    await expect(f.read()).rejects.toMatchObject(expected);
    expect(checks).toBeGreaterThanOrEqual(5);
  },
);

it.each(["application/pdf", "image/png", "application/octet-stream", "text/plain; charset=utf-8"])(
  "rejects unsupported declared MIME %s",
  async (mime) => {
    const f = await fixture("synthetic readable bytes", mime);
    await expect(f.read()).rejects.toMatchObject({ code: "permission_denied" });
  },
);

it.each([Buffer.from([0xc3, 0x28]), Buffer.from("one\0two"), Buffer.from([0x41, 0x01, 0x42])])(
  "rejects binary or malformed UTF-8 text",
  async (bytes) => {
    const f = await fixture(bytes);
    await expect(f.read()).rejects.toMatchObject({ code: "invalid_params" });
  },
);

it("refuses internal observation artifacts and unavailable files without exposing stored paths", async () => {
  const f = await fixture("private observation", "text/plain", "observation-r1.txt");
  await expect(f.read()).rejects.toMatchObject({ code: "permission_denied" });
  const g = await fixture();
  rmSync(g.source.path);
  await expect(g.read()).rejects.toMatchObject({
    code: "ref_stale",
    message: "The original text artifact is unavailable.",
  });
});

it("refuses oversized sources and files that grow beyond their admitted size", async () => {
  const f = await fixture("a".repeat(256 * 1024 + 1));
  await expect(f.read()).rejects.toMatchObject({ code: "permission_denied" });
  const g = await fixture();
  writeFileSync(g.source.path, "x".repeat(300_000));
  await expect(g.read()).rejects.toMatchObject({ code: "ref_stale" });
});

it("does not follow a substituted symlink to an unrelated local file", async () => {
  const f = await fixture();
  const outside = join(f.dir, "unrelated.txt");
  writeFileSync(outside, "not admitted");
  rmSync(f.source.path);
  symlinkSync(outside, f.source.path);
  await expect(f.read()).rejects.toMatchObject({ code: "ref_stale" });
});

it("bounds each page by UTF-8 bytes and binds continuation to original metadata and bytes", async () => {
  const text = "ab🙂é".repeat(40_000);
  const f = await fixture(Buffer.from(text).subarray(0, 256 * 1024));
  // Exact 256 KiB source ending at a complete character boundary.
  const source = "ab🙂é".repeat(32_768);
  writeFileSync(f.source.path, source);
  const first = await f.read({ maxBytes: 7 });
  expect(first.content).toBe("ab🙂");
  expect(first.nextCursor?.offset).toBe(6);
  const next = await f.read({ cursor: first.nextCursor, maxBytes: 7 });
  expect(next.content).toBe("éab");
  expect(next.offset).toBe(6);
  expect(Buffer.byteLength(next.content)).toBeLessThanOrEqual(7);
  const regular = await f.read();
  expect(Buffer.byteLength(regular.content)).toBe(8192);
  expect(regular.eof).toBe(false);
  await expect(f.read({ cursor: { ...first.nextCursor!, offset: 3 } })).rejects.toMatchObject({
    code: "invalid_params",
  });
  await expect(f.read({ cursor: { ...first.nextCursor!, sha256: "0".repeat(64) } })).rejects.toMatchObject({
    code: "ref_stale",
  });
  f.repo.db
    .prepare("UPDATE artifacts SET created_at=? WHERE artifact_id=?")
    .run(f.source.createdAt + 1, f.source.artifactId);
  await expect(f.read({ cursor: first.nextCursor })).rejects.toMatchObject({ code: "ref_stale" });
});

it("rejects changed file contents between pages even with unchanged artifact metadata", async () => {
  const f = await fixture("one two three");
  const first = await f.read({ maxBytes: 4 });
  writeFileSync(f.source.path, "new two three");
  await expect(f.read({ cursor: first.nextCursor })).rejects.toMatchObject({ code: "ref_stale" });
});

it("does not publish mixed bytes when a file is rewritten during its bounded read", async () => {
  const f = await fixture("a".repeat(100_000));
  let checks = 0;
  f.owner.checkCurrent.mockImplementation(() => {
    if (++checks === 5) {
      writeFileSync(f.source.path, "b".repeat(100_000));
      utimesSync(f.source.path, new Date(0), new Date(0));
    }
  });
  await expect(f.read()).rejects.toMatchObject({ code: "ref_stale" });
});

it("rejects model-supplied authority, filesystem paths and unbounded output requests", () => {
  for (const extra of [
    { runId: "another" },
    { path: "/" },
    { grant: "*" },
    { maxBytes: 8193 },
    { cursor: { offset: 1 } },
  ])
    expect(ArtifactTextInputSchema.safeParse({ artifactId: "art-id", ...extra }).success).toBe(false);
});

it.each(["partial", "failed"])("refuses a %s artifact without presenting it as complete", async (status) => {
  const f = await fixture();
  f.repo.db.prepare("UPDATE artifacts SET status=? WHERE artifact_id=?").run(status, f.source.artifactId);
  await expect(f.read()).rejects.toMatchObject({ code: "permission_denied" });
});

it("preserves UTF-8 BOM bytes at page boundaries and completes exact pagination without omission", async () => {
  const text = "abcd\ufeff🙂é-last";
  const f = await fixture(text);
  let cursor: import("@aux/contracts").ArtifactTextInput["cursor"];
  let joined = "";
  for (let i = 0; i < 16; i++) {
    const page = await f.read({ cursor, maxBytes: 4 });
    joined += page.content;
    if (page.eof) break;
    expect(page.nextCursor!.offset).toBeGreaterThan(cursor?.offset ?? 0);
    cursor = page.nextCursor;
  }
  expect(joined).toBe(text);
});

it("refuses a stored row pointing outside this original artifact store", async () => {
  const f = await fixture();
  const external = join(f.dir, "unrelated.csv");
  writeFileSync(external, "item,amount\na,9\nb,9\n");
  f.repo.db.prepare("UPDATE artifacts SET path=? WHERE artifact_id=?").run(external, f.source.artifactId);
  await expect(f.read()).rejects.toMatchObject({ code: "permission_denied" });
});
