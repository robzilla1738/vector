import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { PNG } from "pngjs";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { Repo } from "../../apps/runtime/src/store/repo.js";
import { EventBus } from "../../apps/runtime/src/events.js";
import { ArtifactStore } from "../../apps/runtime/src/services/artifacts.js";
import { ConversationImages } from "../../apps/runtime/src/services/conversation-images.js";
import { AgentImageTools } from "../../apps/runtime/src/agent/image-tools.js";
import { SpendLedger } from "../../apps/runtime/src/store/spend-ledger.js";
import type { Run } from "@aux/contracts";
const cleanup: (() => void)[] = [];
afterEach(() => cleanup.splice(0).forEach((close) => close()));
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "aux-image-reference-")),
    repo = new Repo(openDb(":memory:")),
    artifacts = new ArtifactStore(dir, repo, new EventBus(repo));
  const images = new ConversationImages(repo, artifacts),
    bytes = PNG.sync.write(new PNG({ width: 2, height: 2 }));
  const source = images.add({
    chatId: "original-chat",
    filename: "source.png",
    dataUrl: `data:image/png;base64,${bytes.toString("base64")}`,
  }).images[0]!;
  const run: Run = {
    runId: "original-run",
    goal: "Edit the selected image",
    status: "running",
    pageIds: [],
    createdAt: 1,
    config: { chatId: "original-chat", contextImageArtifactIds: [source.artifactId] },
  };
  repo.saveRun(run);
  cleanup.push(() => {
    repo.close();
    rmSync(dir, { recursive: true, force: true });
  });
  return { dir, repo, artifacts, images, source, run, bytes };
}
it("admits only captured image IDs and preserves immutable bytes while detecting later file changes", () => {
  const f = fixture();
  expect(() =>
    f.images.referencesForRun({ ...f.run, config: { chatId: "another-chat" } }, [f.source.artifactId]),
  ).toThrow(/not admitted/);
  const [reference] = f.images.referencesForRun(f.run, [f.source.artifactId]);
  expect(reference!.sha256).toBe(createHash("sha256").update(f.bytes).digest("hex"));
  writeFileSync(f.repo.getArtifact(f.source.artifactId)!.path, Buffer.from("changed original"));
  expect(Buffer.from(reference!.bytes)).toEqual(f.bytes);
  expect(() => f.images.referencesForRun(f.run, [f.source.artifactId])).toThrow(/changed on disk/);
});
it("passes exact ordered references and saves a verified output while refusing forged MIME/hash before dispatch", async () => {
  const f = fixture(),
    ledger = new SpendLedger(),
    generator = vi.fn(
      async (
        input: Parameters<ConstructorParameters<typeof AgentImageTools>[2]>[0],
        dispatch: Parameters<ConstructorParameters<typeof AgentImageTools>[2]>[1],
      ) => {
        await dispatch.beforeDispatch();
        return { data: f.bytes, mediaType: "image/png", costUsd: 0 };
      },
    );
  cleanup.push(() => ledger.close());
  const toolkit = new AgentImageTools(f.artifacts, ledger, generator),
    references = f.images.referencesForRun(f.run, [f.source.artifactId]),
    receipts: unknown[] = [];
  const context = {
    runId: f.run.runId,
    signal: new AbortController().signal,
    checkOwner: () => {},
    recordReceipt: async (receipt: unknown) => {
      receipts.push(receipt);
    },
  };
  const output = await toolkit.generate("Keep the source composition", context, references);
  expect(generator.mock.calls[0]![0]).toEqual({ prompt: "Keep the source composition", references });
  expect(output.referenceImages).toEqual([
    { artifactId: f.source.artifactId, sha256: references[0]!.sha256, mediaType: "image/png" },
  ]);
  expect(PNG.sync.read(Buffer.from(f.artifacts.read(output.artifactId).dataBase64, "base64"))).toMatchObject({
    width: 2,
    height: 2,
  });
  await expect(
    toolkit.generate("Invalid reference", context, [{ ...references[0]!, sha256: "0".repeat(64) }]),
  ).rejects.toThrow(/PNG identity/);
  await expect(
    toolkit.generate("Invalid MIME", context, [{ ...references[0]!, mediaType: "image/jpeg" }]),
  ).rejects.toThrow(/PNG identity/);
  expect(generator).toHaveBeenCalledOnce();
  expect(receipts).toMatchObject([
    { dispatched: true, costUsd: 0, costEstimated: false },
    { dispatched: false, costUsd: 0 },
    { dispatched: false, costUsd: 0 },
  ]);
});
