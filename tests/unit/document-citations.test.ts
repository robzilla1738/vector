import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { EventBus, openDb, Repo, verifyResultCitations } from "@aux/runtime";
import { EventTypes, type AuxEvent, type MethodResult, type Run } from "@aux/contracts";
import type { MethodCtx } from "../../apps/runtime/src/api/methods/context.js";
import { runsMethods } from "../../apps/runtime/src/api/methods/runs.js";
import { DocumentAdmissionsSchema, type DocumentResultCitation } from "@aux/contracts/document-citation";
import { selectedDocumentEvidence } from "../../apps/runtime/src/agent/loop/document-context.js";
import { documentCitationEvidence } from "../../apps/runtime/src/agent/loop/document-admissions.js";
import { ConversationDocuments } from "../../apps/runtime/src/services/conversation-documents.js";
import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import { projectRunTranscript } from "../../apps/runtime/src/services/run-transcript.js";
import { initializeFieldCodec } from "../../apps/runtime/src/store/field-codec.js";
import { profileSecrets } from "../support/profile-secrets.js";

it("rehydrates encrypted admitted spans after restart, opens their exact section, and refuses unadmitted or replaced evidence", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-document-citation-"));
  const file = join(directory, "state.sqlite");
  const secrets = profileSecrets("document-citations");
  let db = openDb(file);
  let snapshots: DocumentSnapshots | undefined;
  try {
    let repo = new Repo(db, await initializeFieldCodec(db, secrets.native, "document-citations"));
    snapshots = new DocumentSnapshots(repo);
    let documents = new ConversationDocuments(repo, snapshots);
    const body =
      "Unrelated introduction. ".repeat(1800) +
      "ABANDONED-BRANCH-129 " +
      "ordinary text ".repeat(400) +
      "The Zirconium decision is approved.";
    documents.add({ chatId: "chat", filename: "decision.txt", content: body });
    const references = documents.references("chat");
    const prepared = (await selectedDocumentEvidence(
      references,
      documents,
      { query: "Zirconium decision", maxBytes: 2000, signal: new AbortController().signal },
      () => {},
    ))!;
    prepared.admit();
    const recipe = prepared.excerpts.find((entry) => entry.read().includes("Zirconium decision"))!.recipe;
    expect(recipe.ordinal).toBeGreaterThan(0);
    const citation: DocumentResultCitation = {
      kind: "document",
      source: recipe.source,
      locator: recipe.locator,
      quote: "The Zirconium decision is approved.",
    };
    const state = DocumentAdmissionsSchema.parse({
      version: 1,
      runId: "original",
      recipes: prepared.excerpts.map((entry) => entry.recipe),
    });
    repo.saveRun({
      runId: "original",
      goal: "Research",
      status: "running",
      pageIds: [],
      createdAt: 1,
      config: {
        implementation: "agent-loop",
        chatId: "chat",
        contextAttachmentRefs: references,
        documentAdmissions: state,
      },
    });
    expect(String(db.prepare("SELECT config FROM runs WHERE run_id='original'").get()!.config)).toMatch(
      /^auxenc:v3:/,
    );
    expect(JSON.stringify(state)).not.toContain(citation.quote);
    await snapshots.close();
    repo.close();

    db = openDb(file);
    repo = new Repo(db, await initializeFieldCodec(db, secrets.native, "document-citations"));
    snapshots = new DocumentSnapshots(repo);
    documents = new ConversationDocuments(repo, snapshots);
    const original = repo.getRun("original")!;
    const restored = DocumentAdmissionsSchema.parse(original.config!.documentAdmissions);
    const nowOmitted = (await selectedDocumentEvidence(
      references,
      documents,
      { query: "other", maxBytes: 400, signal: new AbortController().signal },
      () => {},
    ))!;
    expect(nowOmitted.excerpts).toHaveLength(0);
    const evidence = documentCitationEvidence(
      references,
      documents,
      restored.recipes,
      new AbortController().signal,
      () => {},
    );
    const verified = verifyResultCitations([citation], new Map(), evidence);
    expect(verified).toMatchObject({
      missing: [],
      unverified: [],
      documents: [{ citation, excerptSha256: recipe.excerptSha256 }],
    });
    expect(
      verifyResultCitations([{ ...citation, quote: "ABANDONED-BRANCH-129" }], new Map(), evidence).unverified,
    ).toEqual([0]);
    expect(
      verifyResultCitations(
        [{ ...citation, source: { ...citation.source, sha256: "f".repeat(64) } }],
        new Map(),
        evidence,
      ).missing,
    ).toEqual([0]);
    const completed = {
      ...original,
      status: "completed" as const,
      result: {
        citations: [citation],
        documentCitationReceipts: verified.documents.map((receipt) => ({ runId: "original", ...receipt })),
      },
    };
    const item = projectRunTranscript(completed, []).items.find(
      (entry) => entry.kind === "document-citation",
    )!;
    expect(item?.kind).toBe("document-citation");
    if (item.kind !== "document-citation") throw new Error("Missing verified citation");
    const owner = {
      kind: "conversation" as const,
      ownerId: "chat",
      documentId: citation.source.attachmentId,
    };
    expect(snapshots.read(owner, citation.source.sha256, item.cursor).chunk.segments[0]!.locator).toEqual(
      citation.locator,
    );
    expect(
      projectRunTranscript(
        { ...completed, config: { ...completed.config, documentAdmissions: undefined } },
        [],
      ).items,
    ).not.toContainEqual(item);
    expect(projectRunTranscript({ ...completed, runId: "another-run" }, []).items).not.toContainEqual(item);
    expect(() =>
      documentCitationEvidence(
        references,
        documents,
        [{ ...recipe, excerptSha256: "e".repeat(64) }],
        new AbortController().signal,
        () => {},
      )[0]!.read(),
    ).toThrow(/digest/);
    snapshots.remove(owner);
    snapshots.writeText(owner, "decision.txt", body, () => {});
    expect(() => verifyResultCitations([citation], new Map(), evidence)).toThrow(/original identity/);
  } finally {
    await snapshots?.close();
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

it("keeps admission recipes out of public run responses and the physical event journal", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-document-presentation-"));
  const file = join(directory, "state.sqlite");
  const secrets = profileSecrets("document-presentation");
  let db = openDb(file);
  try {
    const codec = await initializeFieldCodec(db, secrets.native, "document-presentation");
    const repo = new Repo(db, codec);
    const run: Run = {
      runId: "original",
      goal: "Research",
      status: "running",
      pageIds: [],
      createdAt: 1,
      config: { implementation: "agent-loop", chatId: "chat", contextWorkspaceId: "space" },
    };
    const events = new EventBus(repo);
    const published: AuxEvent[] = [];
    events.subscribe((event) => published.push(event));
    events.emit(EventTypes.RunUpdated, { run }, run.runId);
    const admissions = DocumentAdmissionsSchema.parse({
      version: 1,
      runId: run.runId,
      recipes: [
        {
          source: {
            chatId: "chat",
            attachmentId: "attachment",
            sha256: "a".repeat(64),
            snapshotId: "00000000-0000-4000-8000-000000000001",
          },
          referenceSha256: "a".repeat(64),
          locator: { kind: "text", line: 1, offset: 0 },
          ordinal: 0,
          projection: "text",
          spans: [{ start: 0, length: 7 }],
          length: 7,
          excerptSha256: "b".repeat(64),
        },
      ],
    });
    // An event already queued before admission must not retain this mutable config object.
    run.config!.documentAdmissions = admissions;
    repo.saveRun(run);
    events.emit(EventTypes.RunUpdated, { run }, run.runId);
    const response = (await runsMethods["runs.get"]!({
      params: { runId: run.runId },
      s: { repo, runs: { coordinator: { get: () => run } }, artifacts: { list: () => [] } },
      suspensions: { pending: () => undefined },
    } as unknown as MethodCtx)) as MethodResult<"runs.get">;
    expect(response.run.config).toEqual({
      implementation: "agent-loop",
      chatId: "chat",
      contextWorkspaceId: "space",
      privateTask: false,
    });
    expect(response.run.runId).toBe(run.runId);
    expect(published).toHaveLength(2);
    expect(JSON.stringify(published)).not.toContain("documentAdmissions");
    expect(repo.getRun(run.runId)!.config!.documentAdmissions).toEqual(admissions);
    repo.close();
    db = openDb(file);
    const journal = db.prepare("SELECT payload FROM events ORDER BY seq").all();
    expect(journal).toHaveLength(2);
    expect(JSON.stringify(journal)).not.toContain("documentAdmissions");
    expect(String(db.prepare("SELECT config FROM runs WHERE run_id='original'").get()!.config)).toMatch(
      /^auxenc:v3:/,
    );
  } finally {
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
