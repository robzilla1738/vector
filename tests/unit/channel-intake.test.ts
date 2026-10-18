import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { ChannelInboundSchema } from "@aux/contracts/channels";
import { AuxError, taskConversationId } from "@aux/contracts";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { Repo } from "../../apps/runtime/src/store/repo.js";
import { initializeFieldCodec } from "../../apps/runtime/src/store/field-codec.js";
import { EventBus } from "../../apps/runtime/src/events.js";
import { TaskService } from "../../apps/runtime/src/services/tasks.js";
import { ArtifactStore } from "../../apps/runtime/src/services/artifacts.js";
import { ConversationImages } from "../../apps/runtime/src/services/conversation-images.js";
import { ConversationDocuments } from "../../apps/runtime/src/services/conversation-documents.js";
import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import { intakeChannelMessage } from "../../apps/runtime/src/services/channel-intake.js";
import { channelBinary } from "../../apps/runtime/src/services/channel-transport.js";
import { seedChannel } from "../fixtures/channels.js";
import { profileSecrets } from "../support/profile-secrets.js";

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0)) await close();
});
async function fixture() {
  const db = openDb(":memory:"),
    profileId = randomUUID();
  const repo = new Repo(db, await initializeFieldCodec(db, profileSecrets(profileId).native, profileId)),
    events = new EventBus(repo);
  const tasks = new TaskService(repo, events),
    workspace = tasks.createWorkspace("Intake fixture");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Attachment task",
    objective: "Read attachments",
    criteria: [{ criterionId: "read", description: "Read source", verification: "manual" }],
  });
  const seeded = seedChannel(repo, workspace.workspaceId, task.taskId),
    dir = mkdtempSync(join(tmpdir(), "aux-channel-intake-")),
    snapshots = new DocumentSnapshots(repo);
  const images = new ConversationImages(repo, new ArtifactStore(dir, repo, events)),
    documents = new ConversationDocuments(repo, snapshots);
  const message = {
    ...seeded.message,
    messageId: "300:401",
    text: "",
    attachments: [
      { attachmentId: "audio-1", filename: "first.ogg", kind: "audio" as const, mediaType: "audio/ogg" },
      { attachmentId: "audio-2", filename: "second.ogg", kind: "audio" as const, mediaType: "audio/ogg" },
    ],
  };
  seeded.store.receive(seeded.connection, message);
  const stored = seeded.store.message(seeded.connection.connectionId, message.messageId)!;
  cleanup.push(async () => {
    await snapshots.close();
    repo.close();
    rmSync(dir, { recursive: true, force: true });
  });
  return { db, repo, ...seeded, stored, images, documents, chatId: taskConversationId(task.taskId) };
}
it("retains every encrypted original through partial transcription and never replays an uncertain attempt", async () => {
  const f = await fixture();
  let attempts = 0;
  const transcribe = vi.fn(async (input: { beforeDispatch(): Promise<void> }) => {
    await input.beforeDispatch();
    attempts++;
    if (attempts === 2) throw new AuxError("backend_unavailable", "Configured transcription failed.");
    return {
      text: "First source transcript",
      modelId: "fixture-transcriber",
      durationMs: 10,
      costUsd: 0,
      costEstimated: false,
    };
  });
  const input = {
    deps: {
      images: f.images,
      documents: f.documents,
      download: async () => ({ bytes: Buffer.from("OggS-original-audio-bytes"), mediaType: "audio/ogg" }),
      transcribe,
    },
    store: f.store,
    connection: f.connection,
    message: f.stored,
    chatId: f.chatId,
    parentRunId: "parent",
    signal: new AbortController().signal,
    checkCurrent: () => {},
  };
  const outcome = await intakeChannelMessage(input);
  expect(outcome.usable).toBe(true);
  expect(outcome.text).toContain("First source transcript");
  expect(outcome.failures.join()).toContain("second.ogg");
  const records = f.store.attachments(f.connection.connectionId, f.stored.messageKey);
  expect(records.map((record) => record.state).sort()).toEqual(["ready", "unknown"]);
  expect(
    records.every(
      (record) => Buffer.from(record.bytesBase64!, "base64").toString() === "OggS-original-audio-bytes",
    ),
  ).toBe(true);
  expect(JSON.stringify(f.db.prepare("SELECT body FROM channel_attachments").all())).not.toContain(
    "First source transcript",
  );
  await intakeChannelMessage(input);
  expect(transcribe).toHaveBeenCalledTimes(2);
  f.store.remove(f.connection.connectionId);
  expect(f.db.prepare("SELECT count(*) n FROM channel_attachments").get()).toMatchObject({ n: 0 });
});
it("preserves rejected MIME originals and imports legitimate text through protected document snapshots", async () => {
  const f = await fixture();
  const message = {
    ...f.stored.message,
    text: "Read both sources",
    attachments: [
      { attachmentId: "false-mime", filename: "pretend.png", kind: "image" as const, mediaType: "image/png" },
      { attachmentId: "text", filename: "notes.txt", kind: "document" as const, mediaType: "text/plain" },
    ],
  };
  const stored = { ...f.stored, message };
  f.store.saveMessage(stored);
  const outcome = await intakeChannelMessage({
    deps: {
      images: f.images,
      documents: f.documents,
      download: async (_connection, _message, attachment) => ({
        bytes: Buffer.from(
          attachment.attachmentId === "text" ? "Owner supplied document text" : "OggS-unexpected-audio",
        ),
        mediaType: attachment.mediaType!,
      }),
    },
    store: f.store,
    connection: f.connection,
    message: stored,
    chatId: f.chatId,
    parentRunId: "parent",
    signal: new AbortController().signal,
    checkCurrent: () => {},
  });
  expect(outcome.failures.join()).toMatch(/MIME declaration/);
  expect(f.documents.list(f.chatId).attachments).toHaveLength(1);
  const captured = f.store.attachments(f.connection.connectionId, f.stored.messageKey);
  expect(captured.find((record) => record.source.attachmentId === "false-mime")).toMatchObject({
    state: "failed",
    bytesBase64: expect.any(String),
  });
  expect(captured.find((record) => record.source.attachmentId === "text")).toMatchObject({
    state: "ready",
    attachmentId: expect.any(String),
  });
});
it("limits original attachment bytes and sanitizes credential-bearing download failures", async () => {
  const signal = new AbortController().signal;
  await expect(
    channelBinary(
      { fetch: async () => new Response(new Uint8Array(20_000_001)) },
      new URL("https://api.telegram.org/file/botsynthetic-token/file"),
      {},
      signal,
    ),
  ).rejects.toThrow(/invalid_response/);
  await expect(
    channelBinary(
      {
        fetch: async () => {
          throw new Error("secret-token https://private.example");
        },
      },
      new URL("https://api.telegram.org/file/botsynthetic-token/file"),
      {},
      signal,
    ),
  ).rejects.toThrow("Messenger transport: network");
});

it("captures active follow-up originals without transcribing or publishing later sources into current work", async () => {
  const f = await fixture(),
    transcribe = vi.fn(async (input: { beforeDispatch(): Promise<void> }) => {
      await input.beforeDispatch();
      return { text: "Deferred source", modelId: "fixture", durationMs: 0, costUsd: 0, costEstimated: false };
    });
  const input = {
    deps: {
      images: f.images,
      documents: f.documents,
      download: async () => ({ bytes: Buffer.from("OggS-deferred-original"), mediaType: "audio/ogg" }),
      transcribe,
    },
    store: f.store,
    connection: f.connection,
    message: f.stored,
    chatId: f.chatId,
    parentRunId: "parent",
    signal: new AbortController().signal,
    checkCurrent: () => {},
  };
  await intakeChannelMessage({ ...input, mode: "capture" });
  expect(transcribe).not.toHaveBeenCalled();
  expect(
    f.store.attachments(f.connection.connectionId, f.stored.messageKey).map((record) => record.state),
  ).toEqual(["captured", "captured"]);
  expect(f.documents.list(f.chatId).attachments).toEqual([]);
  const admitted = await intakeChannelMessage(input);
  expect(transcribe).toHaveBeenCalledTimes(2);
  expect(admitted.text).toContain("Deferred source");
});

it("rejects duplicate source IDs before any repeated download or provider transcription", async () => {
  const f = await fixture();
  const source = f.stored.message.attachments![0]!;
  expect(
    ChannelInboundSchema.safeParse({
      ...f.stored.message,
      attachments: [source, { ...source, filename: "duplicate.ogg" }],
    }).success,
  ).toBe(false);
});

it("records a proved pre-dispatch transcription refusal as failed rather than an uncertain send", async () => {
  const f = await fixture();
  const outcome = await intakeChannelMessage({
    deps: {
      images: f.images,
      documents: f.documents,
      download: async () => ({ bytes: Buffer.from("OggS-undispatched-original"), mediaType: "audio/ogg" }),
      transcribe: async () => {
        throw new AuxError("permission_denied", "Transcription is disabled.");
      },
    },
    store: f.store,
    connection: f.connection,
    message: f.stored,
    chatId: f.chatId,
    parentRunId: "parent",
    signal: new AbortController().signal,
    checkCurrent: () => {},
  });
  expect(outcome.usable).toBe(false);
  expect(
    f.store.attachments(f.connection.connectionId, f.stored.messageKey).map((record) => record.state),
  ).toEqual(["failed", "failed"]);
  expect(outcome.failures.join()).toContain("disabled");
});
