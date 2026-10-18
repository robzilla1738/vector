import { GoogleGrantService } from "../../apps/runtime/src/services/google-grants.js";
import { GoogleAccountService } from "../../apps/runtime/src/services/google-accounts.js";
import { captureOriginalPdf } from "../support/pdf-original.js";
import { DesktopContextStore } from "../../apps/runtime/dist/services/desktop-context-store.js";
import { desktopContextDefaults, type DesktopContextCapture } from "@aux/contracts/desktop-context";
import { fixtureMemoryExtractor } from "../fixtures/memory-extraction.js";
import { seedChannel } from "../fixtures/channels.js";
import { AgentConnectionService } from "../../apps/runtime/src/services/agent-connections.js";
import { ChannelStore } from "../../apps/runtime/src/services/channel-store.js";
import { ConversationDocuments } from "../../apps/runtime/src/services/conversation-documents.js";
import { DatabaseSync } from "node:sqlite";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { AuxError, toErrorPayload } from "@aux/contracts";
import {
  EventBus,
  GoalService,
  HookService,
  openDb,
  Repo,
  TaskService,
  TaskEvidenceService,
} from "@aux/runtime";
import type { NativeBridge } from "../../apps/runtime/src/native.js";
import { installationMethods } from "../../apps/runtime/src/api/methods/installation.js";
import { memoryMethods } from "../../apps/runtime/src/api/methods/memory.js";
import { initializeFieldCodec } from "../../apps/runtime/src/store/field-codec.js";
import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import { saveDocumentSnapshot } from "../support/document-snapshot.js";
import { ContentMemoryStore } from "../../apps/runtime/src/services/content-memory.js";
import { MemoryPipeline } from "../../apps/runtime/src/services/memory-pipeline.js";
import {
  exportRecoveryPackage,
  inspectRecoveryPackage,
  stageRecoveryPackage,
} from "../../apps/runtime/src/services/recovery-package.js";
import {
  applyPendingRuntimeRestore,
  createRuntimeBackup,
  listRuntimeBackups,
  runtimeRestoreStatus,
  stageRuntimeRestore,
} from "../../apps/runtime/src/services/runtime-backup.js";
import {
  advanceManagedRecoveryGeneration,
  currentManagedRecoveryGeneration,
} from "../../apps/runtime/src/services/managed-recovery-generation.js";

const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

function native(profileId: string) {
  const secrets = new Map<string, string>();
  const authentications: ("export" | "restore")[] = [];
  const secretName = (prefix: string) =>
    `${prefix}_${createHash("sha256").update(profileId).digest("hex").slice(0, 24)}`;
  return {
    bridge: {
      async readSecret(name: string) {
        return { value: secrets.get(name) };
      },
      async storeSecret(name: string, value: string) {
        secrets.set(name, value);
        return { ok: true as const };
      },
      async profileStorageRoot() {
        const name = secretName("aux_root_v1");
        if (!secrets.has(name)) secrets.set(name, randomBytes(32).toString("base64"));
        return { value: secrets.get(name)! };
      },
      async profileStorageFactor() {
        const name = secretName("sqlite_factor_v1");
        if (!secrets.has(name)) secrets.set(name, randomBytes(32).toString("base64"));
        return { value: secrets.get(name)! };
      },
      async recoveryOwnerAuth({ purpose }: { purpose: "export" | "restore" }) {
        authentications.push(purpose);
        return { approved: true as const };
      },
    } as unknown as NativeBridge,
    secrets,
    authentications,
  };
}

async function fixture() {
  const sourceDir = mkdtempSync(join(tmpdir(), "aux-recovery-source-"));
  const targetDir = mkdtempSync(join(tmpdir(), "aux-recovery-target-"));
  directories.push(sourceDir, targetDir);
  const sourceId = "disposable-source",
    targetId = "disposable-target";
  const sourceNative = native(sourceId),
    targetNative = native(targetId);
  const sourceDb = openDb(join(sourceDir, "state.sqlite"));
  const sourceCipher = await initializeFieldCodec(sourceDb, sourceNative.bridge, sourceId);
  const source = new Repo(sourceDb, sourceCipher);
  const segmented = await saveDocumentSnapshot(source);
  const originalCapture = captureOriginalPdf();
  const originalOwner = {
    kind: "conversation" as const,
    ownerId: "source-pdf-chat",
    documentId: "source-pdf",
  };
  const originalStore = new DocumentSnapshots(source);
  const originalSnapshot = await originalStore.importSource(
    originalOwner,
    originalCapture.input,
    originalCapture.source,
    { signal: new AbortController().signal, checkCurrent: () => {}, publish: () => {} },
  );
  await originalStore.close();
  const originalPdf = { owner: originalOwner, snapshot: originalSnapshot, bytes: originalCapture.bytes };
  const documents = new ConversationDocuments(source, new DocumentSnapshots(source));
  documents.add({
    chatId: "protected-documents",
    filename: "Saved private filename.txt",
    content: "Saved private conversation text",
  });
  const documentReference = documents.references("protected-documents")[0]!;
  const tasks = new TaskService(source, new EventBus(source));
  const space = tasks.createWorkspace("Protected research space");
  const task = tasks.create({
    workspaceId: space.workspaceId,
    title: "Protected task",
    objective: "Check source",
    criteria: [{ criterionId: "check", description: "Protected", verification: "manual" }],
  });
  const channel = seedChannel(source, space.workspaceId, task.taskId);
  const originalAudio = Buffer.from("synthetic retained voice original");
  const audioMessage = {
    ...channel.message,
    messageId: "300:401",
    text: "",
    attachments: [
      { attachmentId: "voice", filename: "voice.ogg", kind: "audio" as const, mediaType: "audio/ogg" },
    ],
  };
  channel.store.receive(channel.connection, audioMessage);
  const savedAudio = channel.store.messages(channel.connection.connectionId, ["pending"])[0]!;
  channel.store.saveAttachment({
    connectionId: channel.connection.connectionId,
    messageKey: savedAudio.messageKey,
    attachmentKey: channel.store.key(channel.connection.connectionId, "attachment", "voice"),
    state: "transcribing",
    source: audioMessage.attachments[0]!,
    bytesBase64: originalAudio.toString("base64"),
    sha256: createHash("sha256").update(originalAudio).digest("hex"),
    mediaType: "audio/ogg",
    createdAt: 1,
    updatedAt: 1,
  });
  const authority = new AgentConnectionService(source).create({
    name: "Synthetic channel authority",
    client: "telegram",
    scope: { kind: "workspace", workspaceId: space.workspaceId },
  });
  channel.store.savePeer(channel.connection.connectionId, {
    ...channel.store.peer(channel.connection.connectionId, channel.peerKey)!,
    state: "paired",
    authorityId: authority.connection.connectionId,
    requestId: undefined,
    expiresAt: undefined,
  });
  const evidence = new TaskEvidenceService(
    source,
    new EventBus(source),
    new DocumentSnapshots(source),
  ).importText({
    taskId: task.taskId,
    expectedRevision: 1,
    criterionId: "check",
    filename: "protected.txt",
    content: "Protected task document evidence",
  });
  const goal = new GoalService(source, {
    start: async () => {
      throw new Error("unused");
    },
    pause: () => {},
    resume: () => {},
    cancel: () => {},
  } as unknown as ConstructorParameters<typeof GoalService>[1]).create({
    workspaceId: space.workspaceId,
    objective: "Protected planned goal",
    budget: { maxTokens: 100 },
  });
  const hook = new HookService(source, () => {}).register({
    workspaceId: space.workspaceId,
    event: "run.end",
    handler: {
      type: "mcp_tool",
      serverId: "local",
      toolName: "protected_recovery_tool",
    },
  });
  source.saveRun({
    runId: "recovery-run",
    goal: "Protected source goal",
    status: "completed",
    pageIds: [],
    config: { chatId: "chat", contextWorkspaceId: space.workspaceId },
    result: { report: "A protected conclusion with sufficient source detail." },
    createdAt: 1,
    endedAt: 2,
  });
  mkdirSync(join(sourceDir, "artifacts"));
  const artifactPath = join(sourceDir, "artifacts", "evidence.txt");
  writeFileSync(artifactPath, "Protected artifact evidence");
  source.saveArtifact({
    artifactId: "evidence",
    runId: "recovery-run",
    path: artifactPath,
    mediaType: "text/plain",
    size: 27,
    status: "complete",
    createdAt: 1,
  });
  const pages = new ContentMemoryStore(source, sourceNative.bridge, sourceId);
  await pages.setPolicy(space.workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test"],
  });
  await pages.saveEligible({
    workspaceId: space.workspaceId,
    pageId: "page",
    documentEpoch: 1,
    url: "https://example.test/article",
    title: "Protected article",
    text: "Protected article memory for a second Profile.",
  });
  const memory = new MemoryPipeline(source, sourceNative.bridge, sourceId, fixtureMemoryExtractor);
  memory.setPolicy(space.workspaceId, true);
  await memory.extractRun(space.workspaceId, "recovery-run");
  tasks.setWorkspaceMemoryDocument({
    workspaceId: space.workspaceId,
    expectedRevision: 0,
    path: "USER.md",
    content: "Protected owner document for the recovered Space.",
  });
  const targetDb = openDb(join(targetDir, "state.sqlite"));
  const targetCipher = await initializeFieldCodec(targetDb, targetNative.bridge, targetId);
  const target = new Repo(targetDb, targetCipher);
  return {
    sourceDir,
    targetDir,
    sourceId,
    targetId,
    sourceNative,
    targetNative,
    source,
    target,
    space,
    task,
    goal,
    hook,
    evidence,
    segmented,
    originalPdf,
    documentReference,
    channel,
    savedAudio,
    originalAudio,
  };
}

it("restores protected SQLite, page memory, Space memory and artifacts under the second Profile's own keys", async () => {
  const f = await fixture();
  const googleConnectionId = randomUUID();
  const protectedGoogle = (field: string, value: string) =>
    f.source.protectRecordField("calendar_connections", [googleConnectionId], field, value);
  f.source.db
    .prepare(
      "INSERT INTO calendar_connections(connection_id,provider,account_key,account_key_lookup,label,secret_name,scopes,state,created_at,updated_at) VALUES(?,'google',?,?,?,?,?,'active',1,1)",
    )
    .run(
      googleConnectionId,
      protectedGoogle("account_key", "synthetic@example.test"),
      f.source.exactRecordLookup("calendar_connections", "account_key", "synthetic@example.test"),
      protectedGoogle("label", "Synthetic Google account"),
      protectedGoogle("secret_name", "unavailable-synthetic-token"),
      protectedGoogle("scopes", JSON.stringify(["https://www.googleapis.com/auth/gmail.send"])),
    );
  const originalGoogleLookup = f.source.exactRecordLookup(
    "calendar_connections",
    "account_key",
    "synthetic@example.test",
  );
  const googleGrants = new GoogleGrantService(f.source, {
    account: () => ({ state: "active", revision: "a".repeat(64), operations: ["gmail.send"] }),
  } as unknown as GoogleAccountService);
  const googleGrant = googleGrants.create({
    taskId: f.task.taskId,
    taskRevision: f.task.revision,
    workspaceId: f.space.workspaceId,
    connectionId: googleConnectionId,
    accountRevision: "a".repeat(64),
    operations: ["gmail.send"],
  });
  const originalGoogleBody = (
    f.source.db.prepare("SELECT body FROM google_task_grants WHERE grant_id=?").get(googleGrant.grantId) as {
      body: string;
    }
  ).body;
  expect(originalGoogleBody).toMatch(/^auxenc:v3:/);
  expect(originalGoogleBody).not.toContain("gmail.send");
  expect(() =>
    f.source.revealRecordField("google_task_grants", [randomUUID()], "body", originalGoogleBody),
  ).toThrow();
  f.source.db
    .prepare(
      "INSERT INTO private_spend(lease_id,kind,created_at,cost_usd,cost_estimated,state) VALUES(?,?,?,?,?,?)",
    )
    .run("opaque-fixture", "model", 1, 0.75, 0, "settled");
  const desktopText = "# Synthetic desktop\nThe workshop is on Tuesday.";
  const capturedAt = Date.now();
  const desktopCapture: DesktopContextCapture = {
    captureId: randomUUID(),
    workspaceId: f.space.workspaceId,
    leaseId: "synthetic-lease",
    configurationRevision: 1,
    sourceEpoch: "synthetic-source",
    app: { bundleId: "test.editor", displayName: "Synthetic Editor" },
    processId: 123,
    windowId: "synthetic-window",
    capturedAt,
    expiresAt: capturedAt + 14 * 86400000,
    kind: "accessibility",
    text: desktopText,
    selection: "",
    windowTitle: "Synthetic desktop",
    sha256: createHash("sha256")
      .update(desktopText + "\0")
      .digest("hex"),
  };
  const desktopStore = new DesktopContextStore(f.source, f.sourceNative.bridge, f.sourceId);
  await desktopStore.append(desktopCapture, () => {});
  f.source.setSetting("desktopContext", {
    ...desktopContextDefaults(),
    revision: 1,
    enabled: true,
    workspaceId: f.space.workspaceId,
    selectedApps: [desktopCapture.app],
  });
  const phrase = "an original offline recovery phrase";
  const exported = await exportRecoveryPackage(
    f.source,
    f.sourceNative.bridge,
    f.sourceDir,
    f.sourceId,
    phrase,
  );
  expect(f.sourceNative.authentications).toEqual(["export"]);
  const bytes = readFileSync(exported.path);
  for (const secret of [
    "Protected research space",
    "Protected task",
    "Protected source goal",
    "Protected planned goal",
    "protected_recovery_tool",
    "Protected article memory",
    "Protected artifact evidence",
    "Protected task document evidence",
    "Protected owner document",
  ])
    expect(bytes.includes(secret)).toBe(false);
  expect(exported.manifest).toMatchObject({ pageMemoryCount: 1, artifactIds: ["evidence"] });
  expect(exported.manifest.spaceMemory).toHaveLength(1);
  expect(exported.manifest.desktopContextCount).toBe(1);
  expect(bytes.includes("The workshop is on Tuesday")).toBe(false);
  expect(exported.manifest.sqliteTables).toContain("private_spend");
  expect(exported.manifest.sqliteTables).toContain("task_evidence");
  const managedBackup = await createRuntimeBackup(f.source, f.sourceDir);
  const sourceMemory = new MemoryPipeline(f.source, f.sourceNative.bridge, f.sourceId);
  await sourceMemory.forget({ workspaceId: f.space.workspaceId, all: true }, () => {
    advanceManagedRecoveryGeneration(f.sourceDir);
  });
  const sourcePages = new ContentMemoryStore(f.source, f.sourceNative.bridge, f.sourceId);
  await sourcePages.forget(f.space.workspaceId, undefined, () => {
    advanceManagedRecoveryGeneration(f.sourceDir);
  });
  await expect(stageRuntimeRestore(f.sourceDir, managedBackup.path, f.source.columnCipher)).rejects.toThrow(
    /predates the current recovery generation/,
  );
  await expect(inspectRecoveryPackage(exported.path, "wrong phrase", f.targetId)).rejects.toThrow(
    /phrase is wrong/,
  );
  expect(existsSync(join(f.targetDir, "pending-runtime-restore.json"))).toBe(false);
  const review = await inspectRecoveryPackage(exported.path, phrase, f.targetId);
  await expect(
    stageRecoveryPackage(
      f.target,
      f.targetNative.bridge,
      f.targetDir,
      f.targetId,
      exported.path,
      phrase,
      review.sha256,
      "not-a-review",
    ),
  ).rejects.toThrow(/Review this recovery package/);
  await expect(
    stageRecoveryPackage(
      f.target,
      f.targetNative.bridge,
      f.targetDir,
      f.targetId,
      exported.path,
      phrase,
      review.sha256,
      review.reviewToken,
      () => {
        throw new Error("fixture interruption");
      },
    ),
  ).rejects.toThrow(/fixture interruption/);
  expect(existsSync(join(f.targetDir, "pending-runtime-restore.json"))).toBe(false);
  expect(f.target.listWorkspaces()).toHaveLength(0);
  const staged = await stageRecoveryPackage(
    f.target,
    f.targetNative.bridge,
    f.targetDir,
    f.targetId,
    exported.path,
    phrase,
    review.sha256,
    review.reviewToken,
  );
  expect(f.targetNative.authentications).toEqual(["restore", "restore"]);
  expect(staged).toMatchObject({ staged: true, artifactFiles: 1, spaceCount: 1, pageMemoryCount: 1 });
  f.target.close();
  f.source.close();
  expect(
    (await applyPendingRuntimeRestore(f.targetDir, join(f.targetDir, "state.sqlite"), f.targetId)).applied,
  ).toBe(true);
  const reopenedDb = openDb(join(f.targetDir, "state.sqlite"));
  const cipher = await initializeFieldCodec(reopenedDb, f.targetNative.bridge, f.targetId);
  const restored = new Repo(reopenedDb, cipher);
  const restoredGoogle = restored.db
    .prepare("SELECT body,revoked_at FROM google_task_grants WHERE grant_id=?")
    .get(googleGrant.grantId) as { body: string; revoked_at: number };
  expect(restoredGoogle.revoked_at).toBeGreaterThan(0);
  expect(restoredGoogle.body).not.toBe(originalGoogleBody);
  expect(
    JSON.parse(
      restored.revealRecordField("google_task_grants", [googleGrant.grantId], "body", restoredGoogle.body),
    ),
  ).toMatchObject({ grantId: googleGrant.grantId, operations: ["gmail.send"] });
  expect(new GoogleGrantService(restored, {} as GoogleAccountService).list(googleGrant.taskId)).toEqual([]);
  expect(
    restored.db
      .prepare("SELECT state FROM calendar_connections WHERE connection_id=?")
      .get(googleConnectionId),
  ).toEqual({ state: "needs_reauth" });

  const restoredGoogleAccounts = new GoogleAccountService({
    repo: restored,
    native: f.targetNative.bridge,
    profileId: f.targetId,
  });
  expect(restoredGoogleAccounts.list().connections).toMatchObject([
    {
      connectionId: googleConnectionId,
      accountKey: "synthetic@example.test",
      state: "needs_reauth",
      operations: [],
    },
  ]);
  const reboundGoogleLookup = restored.db
    .prepare("SELECT account_key_lookup FROM calendar_connections WHERE connection_id=?")
    .get(googleConnectionId) as { account_key_lookup: string };
  expect(reboundGoogleLookup.account_key_lookup).toBe(
    restored.exactRecordLookup("calendar_connections", "account_key", "synthetic@example.test"),
  );
  expect(reboundGoogleLookup.account_key_lookup).not.toBe(originalGoogleLookup);
  await restoredGoogleAccounts.close();

  const channels = new ChannelStore(restored);
  expect(
    await new DesktopContextStore(restored, f.targetNative.bridge, f.targetId).read(f.space.workspaceId),
  ).toEqual([desktopCapture]);
  expect(restored.getSetting("desktopContext")).toEqual(desktopContextDefaults());
  expect(
    new TaskService(restored, new EventBus(restored)).workspaceMemory(f.space.workspaceId).documents,
  ).toMatchObject([{ path: "USER.md", content: "Protected owner document for the recovered Space." }]);

  expect(channels.get(f.channel.connection.connectionId)?.name).toBe("Protected messenger connection");
  expect(channels.key(f.channel.connection.connectionId, "peer", "200")).toBe(f.channel.peerKey);
  expect(channels.peer(f.channel.connection.connectionId, f.channel.peerKey)?.name).toBe("Protected person");
  expect(
    channels.thread(f.channel.connection.connectionId, f.channel.peerKey, f.channel.threadKey)?.taskId,
  ).toBe(f.channel.taskId);
  expect(channels.messages(f.channel.connection.connectionId, ["completed"])[0]?.message.text).toBe(
    "Protected messenger request",
  );
  expect(channels.deliveries(f.channel.connection.connectionId)[0]?.text).toBe(
    "Protected messenger response",
  );
  const restoredChannel = channels.get(f.channel.connection.connectionId)!;
  expect(restoredChannel.enabled).toBe(false);
  expect(restoredChannel.revision).not.toBe(f.channel.connection.revision);
  expect(channels.peer(restoredChannel.connectionId, f.channel.peerKey)).toMatchObject({ state: "pending" });
  expect(channels.peer(restoredChannel.connectionId, f.channel.peerKey)?.authorityId).toBeUndefined();
  expect(channels.peer(restoredChannel.connectionId, f.channel.peerKey)?.requestId).toBeUndefined();
  expect(
    channels
      .messages(restoredChannel.connectionId, ["retired"])
      .find((message) => message.messageKey === f.savedAudio.messageKey),
  ).toBeDefined();
  expect(channels.attachments(restoredChannel.connectionId, f.savedAudio.messageKey)).toMatchObject([
    {
      state: "unknown",
      bytesBase64: f.originalAudio.toString("base64"),
      sha256: createHash("sha256").update(f.originalAudio).digest("hex"),
    },
  ]);
  expect(channels.cursor(restoredChannel)).toBeUndefined();
  expect(
    new AgentConnectionService(restored).list().find((item) => item.client === "telegram")?.revokedAt,
  ).toBeTypeOf("number");
  expect(
    new DocumentSnapshots(restored).read(f.segmented.owner, f.segmented.snapshot.sha256).chunk.segments[0]
      ?.text,
  ).toBe("Protected segmented document");
  const originalStore = new DocumentSnapshots(restored);
  expect(
    await originalStore.useOriginal(
      f.originalPdf.owner,
      f.originalPdf.snapshot.sha256,
      new AbortController().signal,
      () => {},
      async (bytes) => Buffer.from(bytes),
    ),
  ).toEqual(f.originalPdf.bytes);
  await originalStore.close();
  const restoredDocuments = new ConversationDocuments(restored, new DocumentSnapshots(restored));
  expect(
    restoredDocuments.read(
      f.documentReference.chatId,
      f.documentReference.attachmentId,
      f.documentReference.sha256,
    ).chunk.segments[0]?.text,
  ).toBe("Saved private conversation text");
  expect(restored.listWorkspaces()[0]?.name).toBe("Protected research space");
  expect(restored.getRun("recovery-run")?.goal).toBe("Protected source goal");
  const restoredEvidence = reopenedDb
    .prepare("SELECT seq,json FROM task_evidence WHERE evidence_id=?")
    .get(f.evidence.evidenceId) as { seq: number; json: string };
  expect(restoredEvidence.json).not.toContain("Protected task document evidence");
  expect(
    JSON.parse(
      restored.revealRecordField("task_evidence", [restoredEvidence.seq], "json", restoredEvidence.json),
    ),
  ).toMatchObject({
    document: { completed: { textBytes: Buffer.byteLength("Protected task document evidence") } },
  });
  expect(
    reopenedDb.prepare("SELECT cost_usd FROM private_spend WHERE lease_id=?").get("opaque-fixture"),
  ).toEqual({ cost_usd: 0.75 });
  expect(
    new GoalService(restored, {
      start: async () => {
        throw new Error("unused");
      },
      pause: () => {},
      resume: () => {},
      cancel: () => {},
    } as unknown as ConstructorParameters<typeof GoalService>[1]).get(f.goal.goalId).objective,
  ).toBe("Protected planned goal");
  expect(new HookService(restored).get(f.hook.hookId).handler).toMatchObject({
    toolName: "protected_recovery_tool",
  });
  expect(readFileSync(join(f.targetDir, "artifacts", "evidence.txt"), "utf8")).toBe(
    "Protected artifact evidence",
  );
  const pages = new ContentMemoryStore(restored, f.targetNative.bridge, f.targetId);
  expect(await pages.search(f.space.workspaceId, "article memory")).toHaveLength(1);
  const memory = new MemoryPipeline(restored, f.targetNative.bridge, f.targetId);
  expect(await memory.inbox(f.space.workspaceId)).toHaveLength(1);
  expect(
    f.targetNative.secrets.has(
      `aux_root_v1_${createHash("sha256").update(f.targetId).digest("hex").slice(0, 24)}`,
    ),
  ).toBe(true);
  restored.close();
});

it("keeps a copied phrase package restorable after Forget refuses the older managed backup", async () => {
  const f = await fixture();
  const phrase = "an original offline recovery phrase";
  const stale =
    "This managed backup predates the current recovery generation and cannot be restored. Copied files and phrases cannot be revoked.";
  const exported = await exportRecoveryPackage(
    f.source,
    f.sourceNative.bridge,
    f.sourceDir,
    f.sourceId,
    phrase,
  );
  const copyDir = mkdtempSync(join(tmpdir(), "aux-recovery-copy-"));
  directories.push(copyDir);
  const copyPath = join(copyDir, "owner-copy.auxrec");
  copyFileSync(exported.path, copyPath);
  const copiedBytes = readFileSync(copyPath);
  const managed = await createRuntimeBackup(f.source, f.sourceDir);
  const managedCopy = join(copyDir, "managed-copy");
  cpSync(managed.path, managedCopy, { recursive: true });
  const before = currentManagedRecoveryGeneration(f.sourceDir);
  const pipeline = new MemoryPipeline(f.source, f.sourceNative.bridge, f.sourceId);
  const forgotten = (await memoryMethods["memory.pipeline.forget"]!({
    client: { external: false, codeMode: false },
    method: "memory.pipeline.forget",
    params: { workspaceId: f.space.workspaceId, all: true },
    revokeWorkspaceContext: () => {},
    s: {
      repo: f.source,
      memoryPipeline: pipeline,
      settings: { all: () => ({ dataDir: f.sourceDir }) },
      events: { emit: () => {} },
    },
  } as unknown as Parameters<NonNullable<(typeof memoryMethods)["memory.pipeline.forget"]>>[0])) as {
    forgotten: number;
  };
  expect(forgotten.forgotten).toBeGreaterThan(0);
  const after = currentManagedRecoveryGeneration(f.sourceDir);
  expect(after).toEqual({ lineageId: before.lineageId, generation: before.generation + 1 });
  const backups = await listRuntimeBackups(f.sourceDir);
  expect(backups.find((item) => item.path === managed.path)?.restorable).toBe(false);
  expect(
    backups.some((item) => item.path !== managed.path && item.restorable && item.missingArtifacts === 0),
  ).toBe(true);
  expect((await runtimeRestoreStatus(f.sourceDir)).managedRecovery.freshBackupIssued).toBe(true);
  const freshPhrase = "a fresh package phrase after forget";
  const fresh = await exportRecoveryPackage(
    f.source,
    f.sourceNative.bridge,
    f.sourceDir,
    f.sourceId,
    freshPhrase,
  );
  expect(fresh.path).not.toBe(exported.path);
  expect(existsSync(fresh.path)).toBe(true);
  await expect(inspectRecoveryPackage(fresh.path, freshPhrase, f.targetId)).resolves.toMatchObject({
    manifest: { version: 1 },
  });
  const refuse = async (path: string) => {
    let error: unknown;
    try {
      await installationMethods["installation.stageRestore"]!({
        client: { external: false },
        method: "installation.stageRestore",
        params: { path },
        s: { repo: f.source, settings: { all: () => ({ dataDir: f.sourceDir }) } },
      } as unknown as Parameters<NonNullable<(typeof installationMethods)["installation.stageRestore"]>>[0]);
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(AuxError);
    expect(error).toMatchObject({ code: "recovery_stale", message: stale });
    expect((error as Error).message).not.toMatch(
      /was revoked|have been revoked|copy was revoked|package was revoked/,
    );
    expect(toErrorPayload(error)).toMatchObject({ code: "recovery_stale", message: stale });
  };
  await refuse(managed.path);
  await refuse(managedCopy);
  expect(existsSync(exported.path)).toBe(true);
  expect(readFileSync(copyPath).equals(copiedBytes)).toBe(true);
  const review = await inspectRecoveryPackage(copyPath, phrase, f.targetId);
  const staged = await stageRecoveryPackage(
    f.target,
    f.targetNative.bridge,
    f.targetDir,
    f.targetId,
    copyPath,
    phrase,
    review.sha256,
    review.reviewToken,
  );
  expect(staged).toMatchObject({ staged: true });
  expect(readFileSync(copyPath).equals(copiedBytes)).toBe(true);
  f.target.close();
  f.source.close();
  expect(
    (await applyPendingRuntimeRestore(f.targetDir, join(f.targetDir, "state.sqlite"), f.targetId)).applied,
  ).toBe(true);
  const reopenedDb = openDb(join(f.targetDir, "state.sqlite"));
  const cipher = await initializeFieldCodec(reopenedDb, f.targetNative.bridge, f.targetId);
  const restored = new Repo(reopenedDb, cipher);
  const originalStore = new DocumentSnapshots(restored);
  expect(
    await originalStore.useOriginal(
      f.originalPdf.owner,
      f.originalPdf.snapshot.sha256,
      new AbortController().signal,
      () => {},
      async (bytes) => Buffer.from(bytes),
    ),
  ).toEqual(f.originalPdf.bytes);
  await originalStore.close();
  const restoredDocuments = new ConversationDocuments(restored, new DocumentSnapshots(restored));
  expect(
    restoredDocuments.read(
      f.documentReference.chatId,
      f.documentReference.attachmentId,
      f.documentReference.sha256,
    ).chunk.segments[0]?.text,
  ).toBe("Saved private conversation text");
  expect(restored.listWorkspaces()[0]?.name).toBe("Protected research space");
  const memory = new MemoryPipeline(restored, f.targetNative.bridge, f.targetId);
  expect(await memory.inbox(f.space.workspaceId)).toHaveLength(1);
  restored.close();
});

it("rejects package tampering without changing the destination", async () => {
  const f = await fixture();
  const phrase = "another original recovery phrase";
  const exported = await exportRecoveryPackage(
    f.source,
    f.sourceNative.bridge,
    f.sourceDir,
    f.sourceId,
    phrase,
  );
  const file = JSON.parse(readFileSync(exported.path, "utf8")) as { ciphertext: string };
  file.ciphertext = `${file.ciphertext[0] === "A" ? "B" : "A"}${file.ciphertext.slice(1)}`;
  writeFileSync(exported.path, JSON.stringify(file));
  await expect(inspectRecoveryPackage(exported.path, phrase, f.targetId)).rejects.toThrow(
    /phrase is wrong|changed/,
  );
  expect(f.target.listWorkspaces()).toHaveLength(0);
  expect(existsSync(join(f.targetDir, "pending-runtime-restore.json"))).toBe(false);
  f.target.close();
  f.source.close();
});

it("fails closed without fresh device authentication", async () => {
  const f = await fixture();
  const phrase = "device-authenticated recovery phrase";
  const noAuth = { ...f.sourceNative.bridge, recoveryOwnerAuth: undefined } as NativeBridge;
  await expect(exportRecoveryPackage(f.source, noAuth, f.sourceDir, f.sourceId, phrase)).rejects.toThrow(
    /Device authentication is required/,
  );
  expect(existsSync(join(f.sourceDir, "recovery-exports"))).toBe(false);
  const exported = await exportRecoveryPackage(
    f.source,
    f.sourceNative.bridge,
    f.sourceDir,
    f.sourceId,
    phrase,
  );
  const review = await inspectRecoveryPackage(exported.path, phrase, f.targetId);
  const denied = {
    ...f.targetNative.bridge,
    recoveryOwnerAuth: async () => ({ approved: false }),
  } as unknown as NativeBridge;
  await expect(
    stageRecoveryPackage(
      f.target,
      denied,
      f.targetDir,
      f.targetId,
      exported.path,
      phrase,
      review.sha256,
      review.reviewToken,
    ),
  ).rejects.toThrow(/Device authentication is required/);
  expect(existsSync(join(f.targetDir, "pending-runtime-restore.json"))).toBe(false);
  f.target.close();
  f.source.close();
});

it("refuses a missing protected factor, a missing artifact and a nonempty destination", async () => {
  const f = await fixture();
  const phrase = "reviewed recovery phrase for fixtures";
  const factor = [...f.sourceNative.secrets.keys()].find((name) => name.startsWith("pageMemoryFactorV2_"))!;
  const saved = f.sourceNative.secrets.get(factor)!;
  f.sourceNative.secrets.delete(factor);
  await expect(
    exportRecoveryPackage(f.source, f.sourceNative.bridge, f.sourceDir, f.sourceId, phrase),
  ).rejects.toThrow(/factor is missing/);
  f.sourceNative.secrets.set(factor, saved);
  rmSync(join(f.sourceDir, "artifacts", "evidence.txt"));
  await expect(
    exportRecoveryPackage(f.source, f.sourceNative.bridge, f.sourceDir, f.sourceId, phrase),
  ).rejects.toThrow();
  writeFileSync(join(f.sourceDir, "artifacts", "evidence.txt"), "Protected artifact evidence");
  const exported = await exportRecoveryPackage(
    f.source,
    f.sourceNative.bridge,
    f.sourceDir,
    f.sourceId,
    phrase,
  );
  const review = await inspectRecoveryPackage(exported.path, phrase, f.targetId);
  new TaskService(f.target, new EventBus(f.target)).createWorkspace("Existing destination data");
  await expect(
    stageRecoveryPackage(
      f.target,
      f.targetNative.bridge,
      f.targetDir,
      f.targetId,
      exported.path,
      phrase,
      review.sha256,
      review.reviewToken,
    ),
  ).rejects.toThrow(/empty Profile/);
  expect(f.target.listWorkspaces()[0]?.name).toBe("Existing destination data");
  expect(existsSync(join(f.targetDir, "pending-runtime-restore.json"))).toBe(false);
  f.target.close();
  f.source.close();
});

it("ordinary backups omit retired memory and restore preserves current authenticated Space revisions", async () => {
  const f = await fixture();
  const memory = new MemoryPipeline(f.source, f.sourceNative.bridge, f.sourceId);
  const unrelated = new TaskService(f.source, new EventBus(f.source)).createWorkspace(
    "Unrelated backup name",
  );
  const pages = new ContentMemoryStore(f.source, f.sourceNative.bridge, f.sourceId);
  await pages.cachedDerivative({
    workspaceId: f.space.workspaceId,
    signature: "naming-v1",
    eligible: () => true,
    parse: (value) => String(value),
    compute: async () => "Research label",
  });
  const capturedAt = Date.now();
  const desktopText = "Current synthetic desktop context";
  const desktopCapture: DesktopContextCapture = {
    captureId: randomUUID(),
    workspaceId: f.space.workspaceId,
    leaseId: "synthetic-lease",
    configurationRevision: 1,
    sourceEpoch: "synthetic-source",
    app: { bundleId: "test.editor", displayName: "Synthetic Editor" },
    processId: 123,
    windowId: "synthetic-window",
    capturedAt,
    expiresAt: capturedAt + 14 * 86400000,
    kind: "accessibility",
    text: desktopText,
    selection: "",
    windowTitle: "Synthetic",
    sha256: createHash("sha256")
      .update(desktopText + "\0")
      .digest("hex"),
  };
  await new DesktopContextStore(f.source, f.sourceNative.bridge, f.sourceId).append(desktopCapture, () => {});
  const ordinary = await createRuntimeBackup(f.source, f.sourceDir);
  f.source.db
    .prepare("UPDATE workspaces SET name='Current unrelated name' WHERE workspace_id=?")
    .run(unrelated.workspaceId);
  const snapshot = new DatabaseSync(join(ordinary.path, "state.sqlite"), { readOnly: true });
  try {
    expect(snapshot.prepare("SELECT COUNT(*) AS n FROM ai_result_cache").get()?.n).toBe(0);
    expect(snapshot.prepare("SELECT COUNT(*) AS n FROM memory_files").get()?.n).toBe(0);
    expect(snapshot.prepare("SELECT COUNT(*) AS n FROM memory_history").get()?.n).toBe(0);
    expect(snapshot.prepare("SELECT COUNT(*) AS n FROM desktop_context_captures").get()?.n).toBe(0);
    expect(snapshot.prepare("SELECT COUNT(*) AS n FROM desktop_context_generations").get()?.n).toBe(0);
  } finally {
    snapshot.close();
  }
  await memory.review(f.space.workspaceId, (await memory.inbox(f.space.workspaceId))[0]!.claimId, "accept");
  const current = f.source.db.prepare("SELECT * FROM memory_files ORDER BY name").all();
  await stageRuntimeRestore(f.sourceDir, ordinary.path, f.source.columnCipher, memory);
  await applyPendingRuntimeRestore(f.sourceDir, join(f.sourceDir, "state.sqlite"), f.sourceId);
  const restored = new DatabaseSync(join(f.sourceDir, "state.sqlite"), { readOnly: true });
  try {
    expect(restored.prepare("SELECT COUNT(*) AS n FROM ai_result_cache").get()?.n).toBe(0);
    expect(restored.prepare("SELECT * FROM memory_files ORDER BY name").all()).toEqual(current);
    expect(
      await new DesktopContextStore(
        new Repo(restored, f.source.columnCipher),
        f.sourceNative.bridge,
        f.sourceId,
      ).read(f.space.workspaceId),
    ).toEqual([desktopCapture]);
    expect(
      restored.prepare("SELECT name FROM workspaces WHERE workspace_id=?").get(unrelated.workspaceId)?.name,
    ).toBe("Unrelated backup name");
  } finally {
    restored.close();
  }
});

it("refuses an ordinary staged restore after Space memory changes", async () => {
  const f = await fixture();
  const memory = new MemoryPipeline(f.source, f.sourceNative.bridge, f.sourceId);
  const ordinary = await createRuntimeBackup(f.source, f.sourceDir);
  await stageRuntimeRestore(f.sourceDir, ordinary.path, f.source.columnCipher, memory);
  await memory.review(f.space.workspaceId, (await memory.inbox(f.space.workspaceId))[0]!.claimId, "accept");
  await expect(
    applyPendingRuntimeRestore(f.sourceDir, join(f.sourceDir, "state.sqlite"), f.sourceId),
  ).rejects.toThrow(/Space memory changed/);
});
