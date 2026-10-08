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
      documents = new ConversationDocuments(repo);
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
    expect(
      repo.getSetting<object[]>("conversationAttachments:chat")?.every((record) => !("content" in record)),
    ).toBe(true);
    const read = vi.spyOn(cipher, "decrypt");
    const references = documents.references("chat");
    documents.update("chat", references[0]!.attachmentId, { included: false });
    expect(documents.list("chat").attachments).toHaveLength(30);
    expect(read.mock.calls).toHaveLength(30);
    expect(read.mock.calls.every((args) => args[2] === "excerpt")).toBe(true);
    expect(documents.readReference(references[29]!).content).toBe(originals[29]!.content);
    expect(read.mock.calls.filter((args) => args[2] === "value")).toHaveLength(1);
    const body = repo.getSetting<string>(documentBodyKey("chat", "doc-29"))!;
    expect(body).not.toContain("Confidential tail");
    repo.setSetting(documentBodyKey("chat", "doc-28"), body);
    expect(() => documents.readReference(references[28]!)).toThrow();
    // The former metadata shape is converted once, preserving its exact preview and immutable body.
    documents.add({ chatId: "metadata", filename: "protected.txt", content: "Original preview text" });
    const original = documents.list("metadata").attachments[0]!;
    const savedRecord = repo.getSetting<Record<string, unknown>[]>("conversationAttachments:metadata")![0]!;
    const { excerptCiphertext, ...metadata } = savedRecord;
    const bodyBefore = repo.getSetting(documentBodyKey("metadata", original.attachmentId));
    repo.setSetting("conversationAttachments:metadata", [{ ...metadata, excerpt: original.excerpt }]);
    expect(documents.list("metadata").attachments[0]!.excerpt).toBe(original.excerpt);
    expect(repo.getSetting(documentBodyKey("metadata", original.attachmentId))).toBe(bodyBefore);
    const converted = repo.getSetting<Record<string, unknown>[]>("conversationAttachments:metadata")![0]!;
    expect(converted).not.toHaveProperty("excerpt");
    expect(JSON.stringify(converted)).not.toContain("Original preview text");
    repo.setSetting("conversationAttachments:metadata", [{ ...converted, attachmentId: "foreign" }]);
    expect(() => documents.list("metadata")).toThrow();
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
    const documents = new ConversationDocuments(repo);
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
    const read = documents.readReference.bind(documents);
    vi.spyOn(documents, "readReference").mockImplementation((ref) => {
      reads.push(ref.attachmentId);
      return read(ref);
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
    const documents = new ConversationDocuments(repo);
    for (let i = 0; i < 3; i++)
      documents.add({
        chatId: "chat",
        filename: `${i}.txt`,
        content: `Evidence ${i}`,
        sourceArtifactId: `result-${i}`,
      });
    const refs = documents.references("chat");
    const controller = new AbortController();
    const reads = vi.spyOn(documents, "readReference");
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
    expect(documents.readReference(refs[1]!).content).toBe("Evidence 1");
    documents.update("chat", refs[2]!.attachmentId, { removed: true });
    expect(repo.hasSetting(documentBodyKey("chat", refs[2]!.attachmentId))).toBe(false);
    repo.deleteConversation("chat");
    expect(repo.settingKeys(documentBodyPrefix("chat"))).toEqual([]);
    expect(() => documents.readReference(refs[1]!)).toThrow(/removed/);
  } finally {
    repo.close();
  }
});
