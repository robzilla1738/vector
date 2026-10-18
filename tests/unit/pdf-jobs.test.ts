import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import { ConversationDocuments } from "../../apps/runtime/src/services/conversation-documents.js";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { AuxError, type Run } from "@aux/contracts";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { Repo } from "../../apps/runtime/src/store/repo.js";
import { EventBus } from "../../apps/runtime/src/events.js";
import { ArtifactStore } from "../../apps/runtime/src/services/artifacts.js";
import { processPdfArtifacts } from "../../apps/runtime/src/services/pdf-jobs.js";
import { nativeDocumentJob } from "../../apps/runtime/src/services/native-document-jobs.js";
import { pdfToolManifest } from "../../apps/runtime/src/agent/loop/pdf-tools.js";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
vi.mock("../../apps/runtime/src/services/native-document-jobs.js", () => ({ nativeDocumentJob: vi.fn() }));
const cleanup: (() => void)[] = [];
afterEach(() => {
  cleanup.splice(0).forEach((close) => close());
  vi.resetAllMocks();
});
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "aux-pdf-jobs-"));
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const artifacts = new ArtifactStore(dir, repo, events);
  const documents = new DocumentSnapshots(repo);
  const attachments = new ConversationDocuments(repo, documents);
  const run: Run = {
    runId: "original-pdf-run",
    goal: "Work with a synthetic PDF",
    status: "running",
    pageIds: [],
    createdAt: 1,
  };
  repo.saveRun(run);
  const bytes = Buffer.from("%PDF-1.7\nimmutable source fixture\n%%EOF");
  const source = artifacts.save({
    runId: run.runId,
    label: "original.pdf",
    buffer: bytes,
    mediaType: "application/pdf",
  });
  const output = Buffer.from("%PDF-1.7\nnew output fixture\n%%EOF");
  const native = {} as NativeBridge;
  const owner = { run, signal: new AbortController().signal, checkCurrent: vi.fn() };
  vi.mocked(nativeDocumentJob).mockImplementation(async (_native, _request, sources) => ({
    report: {
      kind: "pdf",
      sourceSha256: sources.map((item) => item.sha256),
      pageCount: 1,
      appearancesVerified: true,
    },
    outputs: [
      {
        bytes: output,
        sha256: createHash("sha256").update(output).digest("hex"),
        mediaType: "application/pdf",
        label: "filled.pdf",
      },
    ],
  }));
  cleanup.push(() => {
    repo.close();
    rmSync(dir, { recursive: true, force: true });
  });
  return {
    dir,
    repo,
    events,
    artifacts,
    run,
    bytes,
    source,
    output,
    owner,
    process: () =>
      processPdfArtifacts(
        { repo, events, artifacts, native, documents, attachments },
        {
          sources: [{ kind: "artifact", artifactId: source.artifactId }],
          options: { operation: "fill", values: [{ name: "Name", value: "Synthetic" }] },
        },
        owner,
      ),
  };
}
it("saves a separate verified output and durable receipt while preserving the original", async () => {
  const f = fixture();
  const receipt = await f.process();
  expect(readFileSync(f.source.path)).toEqual(f.bytes);
  expect(receipt.outputs).toHaveLength(1);
  expect(receipt.sources[0]).toMatchObject({
    source: { kind: "artifact", artifactId: f.source.artifactId },
    sha256: createHash("sha256").update(f.bytes).digest("hex"),
  });
  expect(Buffer.from(f.artifacts.read(receipt.outputs[0]!.artifactId).dataBase64, "base64")).toEqual(
    f.output,
  );
  expect(
    f.repo
      .eventsSince(0, 100)
      .events.filter((event) => event.type === "document.job")
      .map((event) => event.payload.status),
  ).toEqual(["running", "completed"]);
});
it("requires original run admission and refuses falsely declared or changed files before native dispatch", async () => {
  const f = fixture();
  f.repo.saveRun({ ...f.run, runId: "other-run" });
  f.repo.db
    .prepare("UPDATE artifacts SET run_id=? WHERE artifact_id=?")
    .run("other-run", f.source.artifactId);
  await expect(f.process()).rejects.toMatchObject({ code: "permission_denied" });
  expect(nativeDocumentJob).not.toHaveBeenCalled();
  f.repo.db
    .prepare("UPDATE artifacts SET run_id=? WHERE artifact_id=?")
    .run(f.run.runId, f.source.artifactId);
  writeFileSync(f.source.path, "bad");
  await expect(f.process()).rejects.toMatchObject({ code: "ref_stale" });
  expect(nativeDocumentJob).not.toHaveBeenCalled();
});
it("never saves an unproved form appearance or publishes after source retirement", async () => {
  const f = fixture();
  vi.mocked(nativeDocumentJob).mockResolvedValue({
    report: { kind: "pdf", sourceSha256: ["0".repeat(64)] },
    outputs: [],
  });
  await expect(f.process()).rejects.toMatchObject({ code: "backend_unavailable" });
  expect(f.artifacts.list({ runId: f.run.runId })).toHaveLength(1);
  vi.mocked(nativeDocumentJob).mockImplementation(async () => {
    f.owner.checkCurrent.mockImplementation(() => {
      throw new AuxError("cancelled", "Original run retired");
    });
    return {
      report: { kind: "pdf", sourceSha256: ["0".repeat(64)], appearancesVerified: true },
      outputs: [],
    };
  });
  await expect(f.process()).rejects.toMatchObject({ code: "cancelled" });
  expect(f.artifacts.list({ runId: f.run.runId })).toHaveLength(1);
});
it("checks authority after output writes and removes every uncommitted file on refusal", async () => {
  const f = fixture();
  const before = f.artifacts.list({ runId: f.run.runId });
  const save = f.artifacts.saveManyStrict.bind(f.artifacts);
  vi.spyOn(f.artifacts, "saveManyStrict").mockImplementation((items) =>
    save(items, () => {
      throw new AuxError("cancelled", "Retired during output writing");
    }),
  );
  await expect(f.process()).rejects.toMatchObject({ code: "cancelled" });
  expect(f.artifacts.list({ runId: f.run.runId })).toEqual(before);
});
it("exposes all seven operations through the existing loop and validates their native options", () => {
  const manifest = pdfToolManifest();
  expect(Object.keys(manifest)).toEqual([
    "pdf_sources",
    "pdf_render",
    "pdf_text",
    "pdf_fields",
    "pdf_fill",
    "pdf_merge",
    "pdf_split",
    "pdf_rotate",
  ]);
  expect(() =>
    manifest.pdf_rotate!.inputSchema.parse({
      sources: [{ kind: "artifact", artifactId: "source" }],
      pages: [1],
      degrees: 45,
    }),
  ).toThrow();
  expect(() =>
    manifest.pdf_fill!.inputSchema.parse({
      sources: [{ kind: "artifact", artifactId: "source" }],
      values: [{ name: "Name", value: "Synthetic" }],
    }),
  ).not.toThrow();
});
