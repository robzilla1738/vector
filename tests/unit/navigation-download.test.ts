import { createHash, randomUUID } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, expect, it, vi } from "vitest";
import { AuxError, type NativeCdpDownloadOutcome } from "@aux/contracts";
import {
  NativeDocumentJobParams,
  NativeDocumentJobResult,
  type NativeDocumentJobInput,
  type NativeDocumentJobOutput,
} from "@aux/contracts/document-jobs";
import {
  navigationDownloadIntake,
  navigationDownloadMime,
} from "../../apps/runtime/src/services/navigation-download";
import { openDb } from "../../apps/runtime/src/store/db";
import { Repo } from "../../apps/runtime/src/store/repo";
import { initializeFieldCodec } from "../../apps/runtime/src/store/field-codec";
import { EventBus } from "../../apps/runtime/src/events";
import { ArtifactStore } from "../../apps/runtime/src/services/artifacts";
import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots";
import { ConversationDocuments } from "../../apps/runtime/src/services/conversation-documents";
import { withPdfSources } from "../../apps/runtime/src/services/pdf-sources";
import { profileSecrets } from "../support/profile-secrets";
import type { NativeBridge } from "../../apps/runtime/src/native";

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup();
});
const digest = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
async function fixture(bytes = Buffer.from("%PDF-1.7\nimmutable synthetic download\n%%EOF")) {
  const directory = mkdtempSync(join(tmpdir(), "aux-navigation-download-"));
  cleanups.push(() => rmSync(directory, { recursive: true, force: true }));
  const profileId = randomUUID(),
    secrets = profileSecrets(profileId).native;
  const db = openDb(join(directory, "state.sqlite"));
  const codec = await initializeFieldCodec(db, secrets, profileId);
  const repo = new Repo(db, codec);
  cleanups.push(() => repo.close());
  const pageId = randomUUID(),
    runId = "original-download-run";
  repo.saveRun({
    runId,
    goal: "Admit the exact synthetic download",
    status: "running",
    pageIds: [pageId],
    createdAt: 1,
    config: { contextWorkspaceId: "space", messageRevision: 0 },
  });
  const originalConfig = JSON.stringify(repo.getRun(runId)!.config);
  const events = new EventBus(repo),
    artifacts = new ArtifactStore(join(directory, "artifacts"), repo, events);
  const originalPath = join(directory, "original-downloaded-file");
  writeFileSync(originalPath, bytes);
  const outcome: NativeCdpDownloadOutcome = {
    kind: "download",
    originalAttachmentId: "A".repeat(32),
    originalLeaseId: randomUUID(),
    commandId: 17,
    navigationId: "41",
    downloadId: randomUUID(),
    url: "https://example.test/records",
  };
  const controller = new AbortController();
  const seen: NativeDocumentJobInput[] = [];
  let flag: boolean | undefined = true;
  const implementation = async (input: NativeDocumentJobInput): Promise<NativeDocumentJobOutput> => {
    seen.push(input);
    switch (input.action) {
      case "beginDownload":
        return { action: "beginDownload", jobId: "native-owned-original" };
      case "capture":
        return {
          action: "capture",
          source: {
            runId,
            downloadId: outcome.downloadId,
            filename: "Original report.pdf",
            sha256: digest(bytes),
            size: bytes.length,
            mediaType: navigationDownloadMime(bytes) as "application/pdf",
            nativeHashVerified: false,
          },
        };
      case "read": {
        const chunk = bytes.subarray(input.offset, input.offset + 256 * 1024);
        return {
          action: "read",
          offset: input.offset,
          bytesBase64: chunk.toString("base64"),
          done: input.offset + chunk.length === bytes.length,
        };
      }
      case "close":
        return { action: "close", joined: true };
      default:
        throw new Error("The download source cannot run a computation/upload");
    }
  };
  const method = vi.fn(implementation);
  const native = {
    ...secrets,
    capabilities: async () => ({
      buildId: "synthetic",
      sourceCommit: "a".repeat(40),
      methods: ["native.documentJob"],
      ...(flag === undefined ? {} : { downloadOriginal: flag }),
    }),
    documentJob: method,
  } as unknown as NativeBridge;
  const validateSource = () => {
    const run = repo.getRun(runId);
    if (
      !run ||
      run.status !== "running" ||
      JSON.stringify(run.config) !== originalConfig ||
      !run.pageIds.includes(pageId)
    )
      throw new AuxError("ref_stale", "Original source owner changed");
  };
  const admit = navigationDownloadIntake(native, artifacts);
  const input = { runId, pageId, outcome, signal: controller.signal, validateSource };
  return {
    directory,
    repo,
    artifacts,
    events,
    originalPath,
    bytes,
    runId,
    pageId,
    outcome,
    input,
    admit,
    method,
    implementation,
    controller,
    seen,
    setFlag: (value: boolean | undefined) => {
      flag = value;
    },
  };
}

it("saves actual immutable original bytes to their exact run and existing PDF source admission", async () => {
  const f = await fixture();
  const result = await f.admit(f.input);
  const artifact = f.repo.getArtifact(result.artifactId)!;
  expect(artifact).toMatchObject({
    runId: f.runId,
    pageId: f.pageId,
    mediaType: "application/pdf",
    size: f.bytes.length,
    status: "complete",
  });
  expect(readFileSync(artifact.path)).toEqual(f.bytes);
  expect(readFileSync(f.originalPath)).toEqual(f.bytes);
  expect(result).toMatchObject({ suggestedFilename: "Original report.pdf", sha256: digest(f.bytes) });
  expect(f.seen[0]).toEqual({
    action: "beginDownload",
    source: { ...f.outcome, pageId: f.pageId, runId: f.runId },
  });
  expect(f.seen.map((input) => input.action)).toEqual(["beginDownload", "capture", "read", "close"]);
  const documents = new DocumentSnapshots(f.repo),
    attachments = new ConversationDocuments(f.repo, documents);
  const source = await withPdfSources(
    { repo: f.repo, documents, attachments },
    [{ kind: "artifact", artifactId: result.artifactId }],
    { run: f.repo.getRun(f.runId)!, signal: f.input.signal, checkCurrent: f.input.validateSource },
    async (sources) => ({ sha256: sources[0]!.sha256, bytes: Buffer.from(sources[0]!.bytes) }),
  );
  expect(source).toEqual({ sha256: digest(f.bytes), bytes: f.bytes });
});

it.each([false, undefined])(
  "does not admit or publish when actual native download flag is %s",
  async (flag) => {
    const f = await fixture();
    f.setFlag(flag);
    await expect(f.admit(f.input)).rejects.toMatchObject({ code: "capability_unsupported" });
    expect(f.method).not.toHaveBeenCalled();
    expect(f.repo.listArtifacts({ runId: f.runId })).toEqual([]);
  },
);

it.each(["guid", "run", "hash", "mime", "offset", "truncated", "oversize"] as const)(
  "rejects %s mismatch without saving an artifact or retrying native download",
  async (kind) => {
    const f = await fixture();
    f.method.mockImplementation(async (input) => {
      const value = await f.implementation(input);
      if (value.action === "capture") {
        if (kind === "guid") value.source.downloadId = randomUUID();
        if (kind === "run") value.source.runId = "another-run";
        if (kind === "hash") value.source.sha256 = "0".repeat(64);
        if (kind === "mime") value.source.mediaType = "text/plain";
        if (kind === "oversize") value.source.size = 64 * 1024 * 1024 + 1;
      }
      if (value.action === "read") {
        if (kind === "offset") value.offset++;
        if (kind === "truncated") {
          value.bytesBase64 = "";
          value.done = false;
        }
      }
      return value;
    });
    await expect(f.admit(f.input)).rejects.toBeInstanceOf(Error);
    expect(f.repo.listArtifacts({ runId: f.runId })).toEqual([]);
    expect(f.seen.filter((input) => input.action === "beginDownload")).toHaveLength(1);
    expect(f.seen.filter((input) => input.action === "capture")).toHaveLength(1);
    expect(f.seen.filter((input) => input.action === "close")).toHaveLength(1);
    expect(readFileSync(f.originalPath)).toEqual(f.bytes);
  },
);

it("reads actual original chunks in exact order beyond one frame", async () => {
  const f = await fixture(Buffer.alloc(600_000, 32));
  const result = await f.admit(f.input);
  expect(f.seen.filter((input) => input.action === "read").map((input) => input.offset)).toEqual([
    0, 262144, 524288,
  ]);
  expect(readFileSync(f.repo.getArtifact(result.artifactId)!.path)).toEqual(f.bytes);
  expect(result.mediaType).toBe("text/plain");
});

it("supports the real empty original without inventing nonzero bytes or a document", async () => {
  const f = await fixture(Buffer.alloc(0));
  const result = await f.admit(f.input);
  expect(f.repo.getArtifact(result.artifactId)?.size).toBe(0);
  expect(readFileSync(f.repo.getArtifact(result.artifactId)!.path)).toHaveLength(0);
  expect(result).toMatchObject({ sha256: digest(Buffer.alloc(0)), mediaType: "text/plain" });
});

it.each(["steer", "space", "forget"] as const)(
  "refuses %s after captured bytes and before actual artifact publication",
  async (kind) => {
    const f = await fixture();
    const realSave = f.artifacts.saveManyStrict.bind(f.artifacts);
    vi.spyOn(f.artifacts, "saveManyStrict").mockImplementation(async (items, beforeCommit) => {
      const run = f.repo.getRun(f.runId)!;
      f.repo.saveRun({
        ...run,
        config: {
          ...run.config,
          ...(kind === "steer"
            ? { messageRevision: 1 }
            : kind === "space"
              ? { contextWorkspaceId: "other-space" }
              : { contextMemoryRevoked: true }),
        },
      });
      return realSave(items, beforeCommit);
    });
    await expect(f.admit(f.input)).rejects.toMatchObject({ code: "ref_stale" });
    expect(f.repo.listArtifacts({ runId: f.runId })).toEqual([]);
    expect(readdirSync(join(f.directory, "artifacts", f.runId))).toEqual([]);
    expect(readFileSync(f.originalPath)).toEqual(f.bytes);
    expect(f.seen.at(-1)?.action).toBe("close");
  },
);

it("cancels one held original capture and joins its close before settling", async () => {
  const f = await fixture();
  const capture = Promise.withResolvers<void>(),
    close = Promise.withResolvers<void>();
  f.method.mockImplementation(async (input) => {
    if (input.action === "capture") {
      f.seen.push(input);
      await capture.promise;
      throw new AuxError("cancelled", "Original native capture retired");
    }
    if (input.action === "close") {
      f.seen.push(input);
      await close.promise;
      capture.resolve();
      return { action: "close", joined: true };
    }
    return f.implementation(input);
  });
  let settled = false;
  const pending = f
    .admit(f.input)
    .catch((error) => error)
    .finally(() => {
      settled = true;
    });
  await vi.waitFor(() => expect(f.seen.some((input) => input.action === "capture")).toBe(true));
  f.controller.abort();
  await vi.waitFor(() => expect(f.seen.some((input) => input.action === "close")).toBe(true));
  expect(settled).toBe(false);
  close.resolve();
  expect(await pending).toBeInstanceOf(Error);
  expect(f.seen.filter((input) => input.action === "close")).toHaveLength(1);
  expect(f.repo.listArtifacts({ runId: f.runId })).toEqual([]);
  expect(readFileSync(f.originalPath)).toEqual(f.bytes);
});

it("keeps the prior computation output bound32MiB while a captured original can use64MiB", () => {
  expect(
    NativeDocumentJobResult.safeParse({
      action: "run",
      report: { kind: "extract", sourceSha256: ["a".repeat(64)] },
      outputs: [
        { sha256: "a".repeat(64), size: 33 * 1024 * 1024, mediaType: "text/plain", label: "too-large" },
      ],
    }).success,
  ).toBe(false);
  expect(
    NativeDocumentJobParams.safeParse({
      action: "beginDownload",
      source: {
        kind: "download",
        pageId: randomUUID(),
        runId: "run",
        originalAttachmentId: "A".repeat(32),
        originalLeaseId: randomUUID(),
        commandId: 1,
        navigationId: "1",
        downloadId: randomUUID(),
        url: "https://example.test/",
        path: "/arbitrary/file",
      },
    }).success,
  ).toBe(false);
  expect(
    NativeDocumentJobResult.safeParse({
      action: "capture",
      source: {
        runId: "run",
        downloadId: randomUUID(),
        filename: "large.pdf",
        sha256: "a".repeat(64),
        size: 64 * 1024 * 1024,
        mediaType: "application/pdf",
        nativeHashVerified: false,
      },
    }).success,
  ).toBe(true);
});

it("retains the original cancellation/checker while native capability discovery is held", async () => {
  const f = await fixture();
  const capability = Promise.withResolvers<Awaited<ReturnType<NonNullable<NativeBridge["capabilities"]>>>>();
  const native = { capabilities: () => capability.promise, documentJob: f.method } as unknown as NativeBridge;
  const admit = navigationDownloadIntake(native, f.artifacts);
  const pending = admit(f.input);
  f.input.signal = new AbortController().signal;
  f.input.validateSource = () => {};
  f.controller.abort();
  capability.resolve({
    buildId: "synthetic",
    sourceCommit: "a".repeat(40),
    methods: ["native.documentJob"],
    downloadOriginal: true,
  });
  await expect(pending).rejects.toBeInstanceOf(Error);
  expect(f.method).not.toHaveBeenCalled();
  expect(f.repo.listArtifacts({ runId: f.runId })).toEqual([]);
});
