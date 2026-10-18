import { createHash, randomUUID } from "node:crypto";
import JSZip from "jszip";
import { afterEach, expect, it } from "vitest";
import {
  DOCUMENT_TEXT_DIGEST_PREFIX,
  encodeDocumentSegment,
  type DocumentSegment,
} from "@aux/contracts/document-intake";
import type { Run } from "@aux/contracts";
import { openDb, Repo } from "@aux/runtime";
import { FieldCodec } from "../../apps/runtime/src/store/field-codec.js";
import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import { ConversationDocuments } from "../../apps/runtime/src/services/conversation-documents.js";
import { withConnectorUploadSource } from "../../apps/runtime/src/services/connector-upload-sources.js";
import { profileSecrets } from "../support/profile-secrets.js";
const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0)) await close();
});
it("reads admitted DOCX original bytes through the encrypted snapshot lease and zeroes only the owned working buffer", async () => {
  const repo = new Repo(
    openDb(":memory:"),
    await FieldCodec.create(profileSecrets("connector-docx").native, "connector-docx", true),
  );
  const documents = new DocumentSnapshots(repo),
    attachments = new ConversationDocuments(repo, documents);
  cleanup.push(async () => {
    await documents.close();
    repo.close();
  });
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
  );
  zip.file(
    "_rels/.rels",
    '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
  );
  zip.file(
    "word/document.xml",
    '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Fixture note</w:t></w:r></w:p></w:body></w:document>',
  );
  const bytes = await zip.generateAsync({ type: "nodebuffer" }),
    sha256 = createHash("sha256").update(bytes).digest("hex"),
    snapshotId = randomUUID();
  const segment: DocumentSegment = {
    locator: { kind: "docx", part: "word/document.xml", paragraph: 1, offset: 0 },
    text: "Fixture note",
  };
  const run: Run = {
    runId: "docx-upload-original",
    goal: "Synthetic original DOCX",
    status: "running",
    pageIds: [],
    createdAt: 1,
  };
  repo.saveRun(run);
  await attachments.importDocument(
    run.runId,
    { selectionId: randomUUID(), index: 0, snapshotId, sourceSha256: sha256 },
    {
      read: async () => ({
        kind: "chunk",
        document: {
          snapshotId,
          filename: "original.docx",
          format: "docx",
          sourceSha256: sha256,
          sourceBytes: bytes.length,
          extractorVersion: "aux-document-v1",
          warnings: [],
        },
        chunk: { index: 0, segments: [segment] },
        completed: {
          textSha256: createHash("sha256")
            .update(DOCUMENT_TEXT_DIGEST_PREFIX)
            .update(encodeDocumentSegment(segment))
            .digest("hex"),
          textBytes: Buffer.byteLength(segment.text),
          segmentCount: 1,
        },
      }),
      original: {
        kind: "capture",
        read: async (offset) => ({
          snapshotId,
          sourceSha256: sha256,
          sourceBytes: bytes.length,
          offset,
          nextOffset: bytes.length,
          bytesBase64: bytes.subarray(offset).toString("base64"),
        }),
      },
    },
    { signal: new AbortController().signal, checkCurrent() {} },
  );
  run.config = { contextAttachmentRefs: attachments.references(run.runId) };
  repo.saveRun(run);
  const selected = run.config.contextAttachmentRefs![0]!;
  let working: Buffer | undefined;
  const result = await withConnectorUploadSource(
    { repo, documents, attachments },
    { reference: { kind: "attachment", attachmentId: selected.attachmentId } },
    { run, signal: new AbortController().signal, checkCurrent() {} },
    async (source, original, _signal, check) => {
      check();
      working = original;
      expect(original).toEqual(bytes);
      expect(source).toMatchObject({
        sha256,
        size: bytes.length,
        filename: "original.docx",
        mediaType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      return source;
    },
  );
  expect(working?.every((value) => value === 0)).toBe(true);
  expect(bytes.some((value) => value !== 0)).toBe(true);
  expect(result.reference).toEqual({ kind: "attachment", attachmentId: selected.attachmentId });
  expect(
    String(repo.db.prepare("SELECT json FROM document_source_chunks LIMIT 1").get()!.json),
  ).not.toContain(bytes.toString("base64"));
  attachments.update(run.runId, selected.attachmentId, { included: false });
  await expect(
    withConnectorUploadSource(
      { repo, documents, attachments },
      { reference: result.reference, expected: result },
      { run, signal: new AbortController().signal, checkCurrent() {} },
      async () => true,
    ),
  ).rejects.toMatchObject({ code: "ref_stale" });
});
