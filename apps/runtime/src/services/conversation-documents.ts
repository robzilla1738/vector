import { createHash } from "node:crypto";
import { z } from "zod";
import {
  AuxError,
  BrowserSpaceSchema,
  ConversationAttachmentSchema,
  documentSnapshotExcerpt,
  newStepId,
  type AttachmentReference,
} from "@aux/contracts";
import type { DocumentImportParams } from "@aux/contracts/document-intake";
import {
  documentBodyKey as bodyKey,
  documentCollectionKey as collectionKey,
  documentExcerptIdentity,
} from "@aux/contracts/document-storage";
import { authenticateDocumentCollection, markDocumentCollectionProtected } from "../store/document-fields.js";
import { withSecureDelete } from "../store/db.js";
import type { Repo } from "../store/repo.js";
import { DocumentSnapshots, type DocumentImportContext, type DocumentSource } from "./document-snapshots.js";

const hash = (content: string) => createHash("sha256").update(content).digest("hex");
const RecordSchema = ConversationAttachmentSchema.extend({
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  removed: z.boolean().optional(),
});
const OldRecordSchema = RecordSchema.omit({ excerpt: true }).extend({ excerptCiphertext: z.string() });
const InlineSchema = ConversationAttachmentSchema.omit({ excerpt: true, byteLength: true }).extend({
  content: z.string(),
  included: z.boolean().default(true),
});
type DocumentRecord = z.infer<typeof RecordSchema>;
const owner = (chatId: string, attachmentId: string) => ({
  kind: "conversation" as const,
  ownerId: chatId,
  documentId: attachmentId,
});

/** Collections hold protected metadata only; selected content is read from immutable located segments. */
export class ConversationDocuments {
  constructor(
    private readonly repo: Repo,
    private readonly snapshots: DocumentSnapshots,
  ) {}

  private saveRecords(chatId: string, records: DocumentRecord[]) {
    const key = collectionKey(chatId);
    this.repo.transaction(() => {
      this.repo.setSetting(
        key,
        this.repo.protectRecordField("kv", [`setting:${key}`], "value", JSON.stringify(records)),
      );
      markDocumentCollectionProtected(this.repo.db, this.repo.columnCipher, `setting:${key}`);
    });
  }

  records(chatId: string): DocumentRecord[] {
    const key = collectionKey(chatId);
    let saved = this.repo.getSetting<unknown>(key);
    if (saved === undefined) return [];
    authenticateDocumentCollection(
      this.repo.db,
      this.repo.columnCipher,
      `setting:${key}`,
      typeof saved === "string",
    );
    if (typeof saved === "string") {
      saved = JSON.parse(this.repo.revealRecordField("kv", [`setting:${key}`], "value", saved));
      if (
        Array.isArray(saved) &&
        saved.every(
          (item) =>
            item && typeof item === "object" && !("content" in item) && !("excerptCiphertext" in item),
        )
      )
        return z.array(RecordSchema).parse(saved);
    }
    if (!Array.isArray(saved))
      throw new AuxError("conflict", "The saved document collection is invalid and was preserved unchanged.");
    const records: DocumentRecord[] = [];
    this.repo.transaction(() =>
      withSecureDelete(this.repo.db, () => {
        for (const item of saved) {
          if (item && typeof item === "object" && "content" in item) {
            const parsed = InlineSchema.safeParse(item);
            if (!parsed.success)
              throw new AuxError(
                "conflict",
                "The saved document collection is invalid and was preserved unchanged.",
              );
            const { content, ...metadata } = parsed.data;
            if (this.repo.hasSetting(bodyKey(chatId, metadata.attachmentId)))
              throw new AuxError("conflict", "A saved document identity conflicts with its collection.");
            this.snapshots.writeText(
              owner(chatId, metadata.attachmentId),
              metadata.filename,
              content,
              (document) => {
                records.push({
                  ...metadata,
                  document,
                  byteLength: document.completed.textBytes,
                  excerpt: documentSnapshotExcerpt(metadata.filename, content),
                  sha256: document.sha256,
                });
              },
              hash(content),
            );
          } else if (item && typeof item === "object" && "excerptCiphertext" in item) {
            const { excerptCiphertext, ...metadata } = OldRecordSchema.parse(item);
            records.push({
              ...metadata,
              excerpt: this.repo.revealRecordField(
                "kv",
                documentExcerptIdentity(chatId, metadata.attachmentId),
                "excerpt",
                excerptCiphertext,
              ),
            });
          } else {
            const parsed = RecordSchema.safeParse(item);
            if (!parsed.success)
              throw new AuxError(
                "conflict",
                "The saved document collection is invalid and was preserved unchanged.",
              );
            records.push(parsed.data);
          }
        }
        if (new Set(records.map((item) => item.attachmentId)).size !== records.length)
          throw new AuxError(
            "conflict",
            "The saved document collection is invalid and was preserved unchanged.",
          );
        this.saveRecords(chatId, records);
      }),
    );
    return records;
  }

  list(chatId: string) {
    return {
      chatId,
      attachments: this.records(chatId)
        .filter((item) => !item.removed)
        .map(({ sha256, removed, ...item }) => item),
    };
  }

  private snapshot(chatId: string, attachmentId: string) {
    const records = this.records(chatId);
    const record = records.find((item) => item.attachmentId === attachmentId);
    if (!record)
      throw new AuxError(
        "ref_stale",
        "A selected document changed or was removed. Choose its current snapshot.",
      );
    if (!record.document) {
      const key = bodyKey(chatId, attachmentId);
      const saved = this.repo.getSetting<string>(key);
      if (saved === undefined) throw new AuxError("ref_stale", "The original document body is unavailable.");
      const content = this.repo.revealRecordField("kv", [`setting:${key}`], "value", saved);
      this.repo.transaction(() =>
        withSecureDelete(this.repo.db, () => {
          this.snapshots.writeText(
            owner(chatId, attachmentId),
            record.filename,
            content,
            (document) => {
              record.document = document;
              record.sha256 = document.sha256;
              this.saveRecords(chatId, records);
              this.repo.deleteSetting(key);
            },
            record.sha256,
          );
        }),
      );
    }
    return record;
  }

  references(chatId: string): AttachmentReference[] {
    return this.records(chatId)
      .filter((item) => !item.removed && item.included)
      .map((item) => {
        const record = item.document ? item : this.snapshot(chatId, item.attachmentId);
        const { attachmentId } = record;
        return { chatId, attachmentId, sha256: record.sha256 };
      });
  }

  referenceMetadata(reference: AttachmentReference) {
    const record = this.snapshot(reference.chatId, reference.attachmentId);
    this.snapshots.metadata(owner(reference.chatId, reference.attachmentId), reference.sha256);
    return record;
  }

  segments(reference: AttachmentReference, signal: AbortSignal, checkCurrent: () => void) {
    this.referenceMetadata(reference);
    const key = `setting:${collectionKey(reference.chatId)}`;
    const stamp = () => this.repo.db.prepare("SELECT value FROM kv WHERE key=?").get(key)?.value;
    let original = stamp();
    return this.snapshots.segments(
      owner(reference.chatId, reference.attachmentId),
      reference.sha256,
      signal,
      () => {
        checkCurrent();
        const current = stamp();
        if (current !== original) {
          this.referenceMetadata(reference);
          original = current;
        }
      },
    );
  }

  referenceSegment(reference: AttachmentReference, ordinal: number) {
    this.referenceMetadata(reference);
    return this.snapshots.readSegment(
      owner(reference.chatId, reference.attachmentId),
      reference.sha256,
      ordinal,
    );
  }

  read(chatId: string, attachmentId: string, sha256?: string, cursor?: string) {
    const record = this.snapshot(chatId, attachmentId);
    if (record.removed) throw new AuxError("not_found", "Document attachment not found.");
    const { sha256: _hash, removed: _removed, ...attachment } = record;
    return {
      attachment,
      ...this.snapshots.read(owner(chatId, attachmentId), sha256 ?? record.sha256, cursor),
    };
  }

  add(
    opts: {
      chatId: string;
      filename: string;
      content: string;
      sourceUrl?: string;
      sourceTruncated?: boolean;
      sourceArtifactId?: string;
    },
    onAdded?: (attachmentId: string) => void,
  ) {
    const { chatId, content, ...source } = opts;
    const records = this.records(chatId);
    const attachmentId = newStepId();
    this.snapshots.writeText(owner(chatId, attachmentId), source.filename, content, (document) => {
      this.saveRecords(chatId, [
        ...records,
        {
          ...source,
          attachmentId,
          document,
          byteLength: document.completed.textBytes,
          excerpt: documentSnapshotExcerpt(source.filename, content),
          createdAt: Date.now(),
          included: true,
          sha256: document.sha256,
        },
      ]);
      onAdded?.(attachmentId);
    });
    return attachmentId;
  }

  async importDocument(
    chatId: string,
    input: DocumentImportParams,
    source: DocumentSource,
    context: Omit<DocumentImportContext, "publish"> & { onAdded?: (attachmentId: string) => void },
  ) {
    const attachmentId = newStepId();
    const identity = () =>
      this.repo.db.prepare("SELECT created_at,private_task FROM conversations WHERE chat_id=?").get(chatId);
    const original = identity();
    const originalTask = this.repo.taskForConversation(chatId);
    const workspaceIdentity = () => {
      const workspaceId = this.repo.getSetting<unknown>(`conversationWorkspace:${chatId}`);
      if (workspaceId === undefined || workspaceId === null) return workspaceId;
      if (typeof workspaceId !== "string")
        throw new AuxError("ref_stale", "The original conversation Space is invalid.");
      const workspace = this.repo.getWorkspace(workspaceId);
      const spaces = BrowserSpaceSchema.array()
        .parse(this.repo.getSetting("browserSpaces") ?? [])
        .filter((space) => space.workspaceId === workspaceId);
      if (!workspace || spaces.some((space) => space.archived))
        throw new AuxError("ref_stale", "The original conversation Space is unavailable.");
      return JSON.stringify([workspaceId, workspace.createdAt, spaces.map((space) => space.id).sort()]);
    };
    const originalWorkspace = workspaceIdentity();
    const checkCurrent = () => {
      if (workspaceIdentity() !== originalWorkspace)
        throw new AuxError("ref_stale", "The original conversation Space changed during document intake.");
      if (
        (original && JSON.stringify(identity()) !== JSON.stringify(original)) ||
        this.repo.taskForConversation(chatId) !== originalTask
      )
        throw new AuxError("ref_stale", "The original conversation changed during document intake.");
      context.checkCurrent();
      if (this.repo.getConversation(chatId)?.archived)
        throw new AuxError("cancelled", "The original conversation is unavailable for document intake.");
    };
    const { selectionId, index, snapshotId, sourceSha256 } = input;
    await this.snapshots.importSource(
      owner(chatId, attachmentId),
      { selectionId, index, snapshotId, sourceSha256 },
      source,
      {
        signal: context.signal,
        checkCurrent,
        publish: (document) => {
          const first = this.snapshots.read(owner(chatId, attachmentId), document.sha256);
          const excerpt = documentSnapshotExcerpt(
            document.document.filename,
            first.chunk.segments.map((segment) => segment.text).join("\n"),
          );
          this.saveRecords(chatId, [
            ...this.records(chatId),
            {
              attachmentId,
              filename: document.document.filename,
              document,
              byteLength: document.completed.textBytes,
              excerpt,
              createdAt: Date.now(),
              included: true,
              sha256: document.sha256,
            },
          ]);
          context.onAdded?.(attachmentId);
        },
      },
    );
    return this.list(chatId);
  }

  update(chatId: string, attachmentId: string, update: { included: boolean } | { removed: true }) {
    const records = this.records(chatId);
    const record = records.find((item) => item.attachmentId === attachmentId && !item.removed);
    if (!record) throw new AuxError("not_found", "Document attachment not found.");
    if ("removed" in update) {
      const used = this.repo.db
        .prepare(
          `SELECT 1 FROM run_lookup,json_each(run_lookup.config,'$.contextAttachmentRefs') ref WHERE json_extract(ref.value,'$.chatId')=? AND json_extract(ref.value,'$.attachmentId')=? LIMIT 1`,
        )
        .get(chatId, attachmentId);
      if (!used) {
        this.repo.transaction(() =>
          withSecureDelete(this.repo.db, () => {
            this.snapshots.remove(owner(chatId, attachmentId));
            this.repo.deleteSetting(bodyKey(chatId, attachmentId));
            this.saveRecords(
              chatId,
              records.filter((item) => item !== record),
            );
          }),
        );
        return;
      }
      record.included = false;
    }
    Object.assign(record, update);
    this.saveRecords(chatId, records);
  }

  forgetDerived(chatId: string, artifactIds: Set<string>): boolean {
    const records = this.records(chatId);
    const revoked = records.filter((item) => item.sourceArtifactId && artifactIds.has(item.sourceArtifactId));
    if (!revoked.length) return false;
    this.repo.transaction(() =>
      withSecureDelete(this.repo.db, () => {
        for (const item of revoked) {
          this.snapshots.remove(owner(chatId, item.attachmentId));
          this.repo.deleteSetting(bodyKey(chatId, item.attachmentId));
        }
        this.saveRecords(
          chatId,
          records.filter((item) => !revoked.includes(item)),
        );
      }),
    );
    return true;
  }

  retire(chatId: string) {
    this.snapshots.cancelOwner("conversation", chatId);
  }
}
