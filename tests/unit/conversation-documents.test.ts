import { capturedDocument } from "../support/document-snapshot.js";
import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import { createHash } from "node:crypto";
import { expect, it, vi } from "vitest";
import { openDb, Repo } from "@aux/runtime";
import { documentBodyKey, documentBodyPrefix } from "@aux/contracts/document-storage";
import { ConversationDocuments } from "../../apps/runtime/src/services/conversation-documents.js";
import { selectedDocumentEvidence } from "../../apps/runtime/src/agent/loop/document-context.js";
import { initializeFieldCodec } from "../../apps/runtime/src/store/field-codec.js";
import { profileSecrets } from "../support/profile-secrets.js";

it("converts every old inline record once and lists/toggles without decrypting protected bodies", async () => {
  const db = openDb(":memory:");
  try {
    const cipher = await initializeFieldCodec(db, profileSecrets("documents").native, "documents");
    const repo = new Repo(db, cipher),
      documents = new ConversationDocuments(repo, new DocumentSnapshots(repo));
    const originals = Array.from({ length: 30 }, (_, i) => ({
      attachmentId: `doc-${i}`,
      filename: `${i}.txt`,
      content: `${"Opening text ".repeat(100)}Confidential tail ${i}`,
      createdAt: i,
      included: true,
    }));
    repo.setSetting("conversationAttachments:chat", originals);
    const collection = documents.list("chat");
    expect(collection.attachments).toHaveLength(30);
    expect(collection.attachments[0]!.excerpt).toBe(
      originals[0]!.content.replace(/\s+/g, " ").slice(0, 1000),
    );
    const stored = JSON.stringify(repo.db.prepare("SELECT value FROM kv").all());
    expect(stored).not.toContain("Opening text");
    expect(stored).not.toContain("Confidential tail");
    expect(typeof repo.getSetting("conversationAttachments:chat")).toBe("string");
    const read = vi.spyOn(cipher, "decrypt");
    const references = documents.references("chat");
    documents.update("chat", references[0]!.attachmentId, { included: false });
    expect(documents.list("chat").attachments).toHaveLength(30);
    expect(read.mock.calls.every((args) => args[0] === "kv" || args[0] === "aux_meta")).toBe(true);
    expect(documents.read("chat", "doc-29").chunk.segments[0]?.text).toBe(originals[29]!.content);
    const legacy = {
      ...references[29]!,
      sha256: createHash("sha256").update(originals[29]!.content).digest("hex"),
    };
    expect(documents.referenceMetadata(legacy).sha256).toBe(references[29]!.sha256);
    const segment = repo.db.prepare("SELECT json FROM document_segments WHERE document_id='doc-29'").get()!
      .json;
    repo.db.prepare("UPDATE document_segments SET json=? WHERE document_id='doc-28'").run(segment!);
    expect(() => documents.read("chat", "doc-28")).toThrow();
    // The previous protected-body layout migrates only when its exact body is selected.
    const content = "Original preview text",
      attachmentId = "previous",
      filename = "protected.pdf";
    const body = documentBodyKey("metadata", attachmentId);
    const oldSha = createHash("sha256").update(content).digest("hex");
    repo.setSetting(body, repo.protectRecordField("kv", [`setting:${body}`], "value", content));
    repo.setSetting("conversationAttachments:metadata", [
      {
        attachmentId,
        filename,
        byteLength: Buffer.byteLength(content),
        excerpt: content,
        createdAt: 1,
        included: true,
        sha256: oldSha,
      },
    ]);
    expect(documents.list("metadata").attachments[0]!.excerpt).toBe(content);
    expect(repo.hasSetting(body)).toBe(true);
    const converted = documents.referenceMetadata({ chatId: "metadata", attachmentId, sha256: oldSha });
    expect(converted.document?.document.format).toBe("text");
    expect(repo.hasSetting(body)).toBe(false);
    expect(documents.read("metadata", attachmentId, oldSha).chunk.segments[0]?.text).toBe(content);
    const protectedCollection = repo.getSetting("conversationAttachments:metadata");
    repo.setSetting("conversationAttachments:metadata", [
      {
        attachmentId,
        filename,
        byteLength: content.length,
        excerpt: content,
        createdAt: 1,
        included: true,
        sha256: oldSha,
      },
    ]);
    expect(() => documents.list("metadata")).toThrow(/plaintext legacy/);
    repo.setSetting("conversationAttachments:metadata", protectedCollection);
    // An invalid collection is preserved, never silently filtered during conversion.
    const invalid = [...originals, { attachmentId: "broken" }];
    repo.setSetting("conversationAttachments:invalid", invalid);
    expect(() => documents.list("invalid")).toThrow(/preserved unchanged/);
    expect(repo.getSetting("conversationAttachments:invalid")).toEqual(invalid);
    expect(repo.settingKeys(documentBodyPrefix("invalid"))).toEqual([]);
  } finally {
    db.close();
  }
});

it("projects late relevant content from thirty retained sources within the actual byte budget", async () => {
  const repo = new Repo(openDb(":memory:"));
  try {
    const documents = new ConversationDocuments(repo, new DocumentSnapshots(repo));
    for (let i = 0; i < 30; i++)
      documents.add({
        chatId: "chat",
        filename: `source-${i}.txt`,
        content:
          "Unrelated introduction. ".repeat(900) +
          (i === 29 ? "The zirconium decision is approved. 決定" : "Ordinary ending."),
      });
    const refs = documents.references("chat"),
      reads: string[] = [];
    const read = documents.segments.bind(documents);
    vi.spyOn(documents, "segments").mockImplementation((ref, signal, check) => {
      reads.push(ref.attachmentId);
      return read(ref, signal, check);
    });
    const message = await selectedDocumentEvidence(
      refs,
      documents,
      { query: "zirconium decision", maxBytes: 2200, signal: new AbortController().signal },
      () => {},
    );
    const content = String(message!.content);
    expect(Buffer.byteLength(content)).toBeLessThanOrEqual(2200);
    expect(content).toContain("zirconium decision is approved");
    const payload = JSON.parse(content.slice(content.indexOf("\n") + 1));
    expect(payload.selectedCount).toBe(30);
    expect(payload.includedCount + payload.omittedCount).toBe(30);
    expect(payload.omittedCount).toBeGreaterThan(0);
    expect(reads).toEqual(refs.map((ref) => ref.attachmentId));
    expect(documents.references("chat")).toEqual(refs);
    const full = await selectedDocumentEvidence(
      refs,
      documents,
      { query: "zirconium decision", maxBytes: 50000, signal: new AbortController().signal },
      () => {},
    );
    const expanded = JSON.parse(String(full!.content).split("\n").slice(1).join("\n"));
    expect(expanded.includedCount).toBe(30);
  } finally {
    repo.close();
  }
});

it("cooperatively stops or refuses a forgotten source instead of publishing stale evidence", async () => {
  const repo = new Repo(openDb(":memory:"));
  try {
    const documents = new ConversationDocuments(repo, new DocumentSnapshots(repo));
    for (let i = 0; i < 3; i++)
      documents.add({
        chatId: "chat",
        filename: `${i}.txt`,
        content: `Evidence ${i}`,
        sourceArtifactId: `result-${i}`,
      });
    const refs = documents.references("chat");
    const controller = new AbortController();
    const reads = vi.spyOn(documents, "segments");
    const pending = selectedDocumentEvidence(
      refs,
      documents,
      { query: "Evidence", maxBytes: 3000, signal: controller.signal },
      () => {},
    );
    controller.abort();
    await expect(pending).rejects.toMatchObject({ code: "cancelled" });
    expect(reads).toHaveBeenCalledTimes(1);
    const forgotten = selectedDocumentEvidence(
      refs,
      documents,
      { query: "Evidence", maxBytes: 3000, signal: new AbortController().signal },
      () => {},
    );
    documents.forgetDerived("chat", new Set(["result-0"]));
    await expect(forgotten).rejects.toMatchObject({ code: "ref_stale" });
    expect(repo.hasSetting(documentBodyKey("chat", refs[0]!.attachmentId))).toBe(false);
    repo.saveRun({
      runId: "branch",
      goal: "Use original document",
      pageIds: [],
      status: "completed",
      createdAt: 1,
      config: { chatId: "branched-chat", contextAttachmentRefs: [refs[1]!] },
    });
    documents.update("chat", refs[1]!.attachmentId, { removed: true });
    expect(documents.referenceMetadata(refs[1]!).removed).toBe(true);
    const retained: string[] = [];
    for await (const segment of documents.segments(refs[1]!, new AbortController().signal, () => {}))
      retained.push(segment.text);
    expect(retained.join("")).toBe("Evidence 1");
    documents.update("chat", refs[2]!.attachmentId, { removed: true });
    expect(repo.hasSetting(documentBodyKey("chat", refs[2]!.attachmentId))).toBe(false);
    repo.deleteConversation("chat");
    expect(repo.settingKeys(documentBodyPrefix("chat"))).toEqual([]);
    expect(() => documents.referenceMetadata(refs[1]!)).toThrow(/removed/);
  } finally {
    repo.close();
  }
});

it("publishes a native chat capture atomically and refuses a changed original Space", async () => {
  const repo = new Repo(openDb(":memory:"));
  const snapshots = new DocumentSnapshots(repo);
  const documents = new ConversationDocuments(repo, snapshots);
  try {
    const captured = capturedDocument();
    const input = { chatId: "native-chat", ...captured.input };
    repo.insertWorkspace("original-space", "Original", 1);
    repo.insertWorkspace("other-space", "Other", 2);
    repo.setSetting("conversationWorkspace:native-chat", "original-space");
    const context = { signal: new AbortController().signal, checkCurrent: () => {} };
    const result = await documents.importDocument("native-chat", input, captured.source, context);
    expect(result.attachments[0]?.document?.document.snapshotId).toBe(input.snapshotId);
    let acknowledge!: () => void, finish!: () => void;
    const started = new Promise<void>((resolve) => {
      acknowledge = resolve;
    });
    const released = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const pending = documents.importDocument(
      "native-chat",
      input,
      {
        read: async () => {
          acknowledge();
          await released;
          return captured.source.read();
        },
      },
      context,
    );
    await started;
    repo.setSetting("conversationWorkspace:native-chat", "other-space");
    finish();
    await expect(pending).rejects.toMatchObject({ code: "ref_stale" });
    expect(documents.list("native-chat").attachments).toHaveLength(1);
    expect(repo.db.prepare("SELECT count(*) n FROM document_snapshots").get()).toEqual({ n: 1 });
  } finally {
    await snapshots.close();
    repo.close();
  }
});
