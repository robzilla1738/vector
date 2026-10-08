import { createHash } from "node:crypto";
import { z } from "zod";
import {
  AuxError,
  ConversationAttachmentSchema,
  documentSnapshotExcerpt,
  newStepId,
  type AttachmentReference,
} from "@aux/contracts";
import { documentBodyKey as bodyKey } from "@aux/contracts/document-storage";
import { withSecureDelete } from "../store/db.js";
import type { Repo } from "../store/repo.js";

const collectionKey = (chatId: string) => `conversationAttachments:${chatId}`;
const hash = (content: string) => createHash("sha256").update(content).digest("hex");
const RecordSchema = ConversationAttachmentSchema.extend({
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  removed: z.boolean().optional(),
});
type DocumentRecord = z.infer<typeof RecordSchema>;
const InlineSchema = ConversationAttachmentSchema.omit({ excerpt: true, byteLength: true }).extend({
  content: z.string(),
  included: z.boolean().default(true),
});

/** Immutable, individually protected bodies; listing/toggling reads metadata only. */
export class ConversationDocuments {
  constructor(private readonly repo: Repo) {}

  private saveBody(chatId: string, attachmentId: string, content: string) {
    const key = bodyKey(chatId, attachmentId);
    this.repo.setSetting(key, this.repo.protectRecordField("kv", [`setting:${key}`], "value", content));
  }

  records(chatId: string): DocumentRecord[] {
    const saved = this.repo.getSetting<unknown>(collectionKey(chatId));
    if (saved === undefined) return [];
    // A one-time conversion preserves the complete old inline collection, including hidden sixth+ records.
    if (Array.isArray(saved) && saved.some((item) => item && typeof item === "object" && "content" in item)) {
      const parsed = z.array(InlineSchema).safeParse(saved);
      if (
        !parsed.success ||
        new Set(parsed.data.map((item) => item.attachmentId)).size !== parsed.data.length
      )
        throw new AuxError(
          "conflict",
          "The saved document collection is invalid and was preserved unchanged.",
        );
      const records = parsed.data.map(({ content, ...item }) => ({
        ...item,
        byteLength: Buffer.byteLength(content),
        excerpt: documentSnapshotExcerpt(item.filename, content),
        sha256: hash(content),
      }));
      this.repo.transaction(() =>
        withSecureDelete(this.repo.db, () => {
          for (const item of parsed.data) {
            if (this.repo.hasSetting(bodyKey(chatId, item.attachmentId)))
              throw new AuxError("conflict", "A saved document identity conflicts with its collection.");
            this.saveBody(chatId, item.attachmentId, item.content);
          }
          this.repo.setSetting(collectionKey(chatId), records);
        }),
      );
      return records;
    }
    return z.array(RecordSchema).parse(saved);
  }

  list(chatId: string) {
    return {
      chatId,
      attachments: this.records(chatId)
        .filter((item) => !item.removed)
        .map(({ sha256, removed, ...item }) => item),
    };
  }

  references(chatId: string): AttachmentReference[] {
    return this.records(chatId)
      .filter((item) => !item.removed && item.included)
      .map(({ attachmentId, sha256 }) => ({ chatId, attachmentId, sha256 }));
  }

  readReference(reference: AttachmentReference) {
    const record = this.records(reference.chatId).find(
      (item) => item.attachmentId === reference.attachmentId,
    );
    if (!record || record.sha256 !== reference.sha256)
      throw new AuxError(
        "ref_stale",
        "A selected document changed or was removed. Choose its current snapshot.",
      );
    const key = bodyKey(reference.chatId, reference.attachmentId);
    const saved = this.repo.getSetting<string>(key);
    if (saved === undefined)
      throw new AuxError("ref_stale", "A selected document is unavailable. Choose its current snapshot.");
    const content = this.repo.revealRecordField("kv", [`setting:${key}`], "value", saved);
    if (hash(content) !== reference.sha256)
      throw new AuxError("ref_stale", "The selected document no longer matches its original snapshot.");
    return { record, content };
  }

  read(chatId: string, attachmentId: string) {
    const attachment = this.list(chatId).attachments.find((item) => item.attachmentId === attachmentId);
    const record = this.records(chatId).find((item) => item.attachmentId === attachmentId);
    if (!attachment || !record) throw new AuxError("not_found", "Document attachment not found.");
    return {
      attachment,
      content: this.readReference({ chatId, attachmentId, sha256: record.sha256 }).content,
    };
  }

  add(opts: {
    chatId: string;
    filename: string;
    content: string;
    sourceUrl?: string;
    sourceTruncated?: boolean;
    sourceArtifactId?: string;
  }) {
    const { chatId, content, ...source } = opts;
    const byteLength = Buffer.byteLength(content);
    if (byteLength > 512 * 1024 || content.includes("\0"))
      throw new AuxError("invalid_params", "Use a UTF-8 text document up to 512 KB.");
    const records = this.records(chatId);
    const item = RecordSchema.parse({
      ...source,
      attachmentId: newStepId(),
      byteLength,
      excerpt: documentSnapshotExcerpt(source.filename, content),
      createdAt: Date.now(),
      included: true,
      sha256: hash(content),
    });
    this.repo.transaction(() => {
      this.saveBody(chatId, item.attachmentId, content);
      this.repo.setSetting(collectionKey(chatId), [...records, item]);
    });
  }

  update(chatId: string, attachmentId: string, update: { included: boolean } | { removed: true }) {
    const records = this.records(chatId);
    const record = records.find((item) => item.attachmentId === attachmentId && !item.removed);
    if (!record) throw new AuxError("not_found", "Document attachment not found.");
    if ("removed" in update) {
      const used = this.repo.db
        .prepare(
          `SELECT 1 FROM run_lookup, json_each(run_lookup.config,'$.contextAttachmentRefs') ref
        WHERE json_extract(ref.value,'$.chatId')=? AND json_extract(ref.value,'$.attachmentId')=? LIMIT 1`,
        )
        .get(chatId, attachmentId);
      if (!used) {
        this.repo.transaction(() =>
          withSecureDelete(this.repo.db, () => {
            this.repo.deleteSetting(bodyKey(chatId, attachmentId));
            this.repo.setSetting(
              collectionKey(chatId),
              records.filter((item) => item !== record),
            );
          }),
        );
        return;
      }
      record.included = false;
    }
    Object.assign(record, update);
    this.repo.setSetting(collectionKey(chatId), records);
  }

  forgetDerived(chatId: string, artifactIds: Set<string>): boolean {
    const records = this.records(chatId);
    const revoked = records.filter((item) => item.sourceArtifactId && artifactIds.has(item.sourceArtifactId));
    if (!revoked.length) return false;
    this.repo.transaction(() =>
      withSecureDelete(this.repo.db, () => {
        for (const item of revoked) this.repo.deleteSetting(bodyKey(chatId, item.attachmentId));
        this.repo.setSetting(
          collectionKey(chatId),
          records.filter((item) => !revoked.includes(item)),
        );
      }),
    );
    return true;
  }
}
