import { afterEach, expect, it } from "vitest";
import { createCipheriv, createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { EventBus, openDb, Repo, TaskService } from "@aux/runtime";
import { ContentMemoryStore } from "../../apps/runtime/src/services/content-memory.js";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});

function fixture() {
  const db = openDb(":memory:");
  databases.push(db);
  const repo = new Repo(db);
  const tasks = new TaskService(repo, new EventBus(repo));
  const workspace = tasks.createWorkspace("Research");
  const secrets = new Map<string, string>();
  const native = {
    readSecret: async (name: string) => ({ value: secrets.get(name) }),
    storeSecret: async (name: string, value: string) => {
      secrets.set(name, value);
      return { ok: true as const };
    },
    profileStorageRoot: async () => {
      const name = `aux_root_v1_${createHash("sha256").update("profile-one").digest("hex").slice(0, 24)}`;
      if (!secrets.has(name)) secrets.set(name, randomBytes(32).toString("base64"));
      return { value: secrets.get(name)! };
    },
  };
  let now = 1_800_000_000_000;
  const memory = new ContentMemoryStore(repo, native, "profile-one", () => now);
  return {
    db,
    repo,
    tasks,
    workspace,
    secrets,
    native,
    memory,
    advance: (ms: number) => {
      now += ms;
    },
    now: () => now,
  };
}

it("keeps page text and source paths encrypted while rebuilding search after a restart", async () => {
  const f = fixture();
  const input = {
    workspaceId: f.workspace.workspaceId,
    pageId: "page-one",
    documentEpoch: 3,
    sessionId: "session-one",
    url: "https://example.test/private/article?token=discard",
    title: "Deep browser research",
    text: "A practical browser can cite its research sources precisely.",
  };
  await expect(f.memory.saveEligible(input)).rejects.toThrow(/Enable page-content recall/);
  await f.memory.setPolicy(f.workspace.workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test"],
  });
  const saved = await f.memory.saveEligible(input);
  expect(saved.url).toBe("https://example.test/private/article");
  const row = f.db
    .prepare("SELECT ciphertext,origin,source_key FROM content_memory WHERE memory_id=?")
    .get(saved.memoryId) as { ciphertext: string; origin: string; source_key: string };
  expect(row.origin).toBe("https://example.test");
  expect(row.ciphertext).not.toContain("practical browser");
  expect(row.ciphertext).not.toContain("private/article");
  expect(row.source_key).not.toContain("article");
  const reopened = new ContentMemoryStore(f.repo, f.native, "profile-one", f.now);
  expect(await reopened.search(f.workspace.workspaceId, "research sources")).toMatchObject([
    { memoryId: saved.memoryId, title: "Deep browser research", url: saved.url, documentEpoch: 3 },
  ]);
  expect((await reopened.get(f.workspace.workspaceId, saved.memoryId))?.text).toBe(input.text);
  await expect(
    new ContentMemoryStore(f.repo, f.native, "other-profile", f.now).search(
      f.workspace.workspaceId,
      "research",
    ),
  ).resolves.toEqual([]);
  const factorName = [...f.secrets.keys()].find((name) => name.startsWith("pageMemoryFactorV2_"))!;
  const key = f.secrets.get(factorName)!;
  f.secrets.delete(factorName);
  await expect(
    new ContentMemoryStore(f.repo, f.native, "profile-one", f.now).search(
      f.workspace.workspaceId,
      "research",
    ),
  ).rejects.toThrow(/factor is missing/);
  f.secrets.set(factorName, key);
});

it("migrates legacy page text atomically and preserves the original on tamper", async () => {
  const f = fixture();
  const workspaceId = f.workspace.workspaceId;
  await f.memory.setPolicy(workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test"],
  });
  const oldKey = randomBytes(32);
  const body = {
    memoryId: randomUUID(),
    profileId: "profile-one",
    workspaceId,
    pageId: "legacy-page",
    documentEpoch: 1,
    url: "https://example.test/legacy",
    title: "Legacy article",
    text: "A recoverable legacy article remains readable.",
    capturedAt: f.now(),
  };
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", oldKey, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(body)), cipher.final()]);
  const legacy = `v1:${Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64")}`;
  const sourceKey = createHmac("sha256", oldKey)
    .update(`profile-one\0${workspaceId}\0${body.url}`)
    .digest("hex");
  f.db
    .prepare(
      `INSERT INTO content_memory(memory_id,profile_id,workspace_id,source_key,origin,captured_at,expires_at,ciphertext)
    VALUES(?,?,?,?,?,?,?,?)`,
    )
    .run(
      body.memoryId,
      body.profileId,
      workspaceId,
      sourceKey,
      "https://example.test",
      body.capturedAt,
      body.capturedAt + 30 * 86_400_000,
      legacy,
    );
  await f.native.storeSecret("pageMemoryKey", oldKey.toString("base64"));
  f.db.prepare("UPDATE content_memory SET ciphertext='v1:AAAA' WHERE memory_id=?").run(body.memoryId);
  await expect(
    new ContentMemoryStore(f.repo, f.native, "profile-one", f.now).search(workspaceId, "legacy"),
  ).rejects.toThrow(/incomplete/);
  expect(
    f.db.prepare("SELECT ciphertext FROM content_memory WHERE memory_id=?").get(body.memoryId),
  ).toMatchObject({ ciphertext: "v1:AAAA" });
  expect(f.secrets.get("pageMemoryKey")).toBe(oldKey.toString("base64"));
  f.db.prepare("UPDATE content_memory SET ciphertext=? WHERE memory_id=?").run(legacy, body.memoryId);
  const migrated = new ContentMemoryStore(f.repo, f.native, "profile-one", f.now);
  expect(await migrated.search(workspaceId, "legacy article")).toHaveLength(1);
  const row = f.db
    .prepare("SELECT ciphertext,source_key FROM content_memory WHERE memory_id=?")
    .get(body.memoryId) as { ciphertext: string; source_key: string };
  expect(row.ciphertext).toMatch(/^v2:/);
  expect(row.ciphertext).not.toContain(body.text);
  expect(row.source_key).not.toBe(sourceKey);
  expect(f.secrets.get("pageMemoryKey")).toBe("");
});

it("rotates the page-memory factor on Forget while preserving other Spaces", async () => {
  const f = fixture();
  const other = f.tasks.createWorkspace("Other");
  for (const workspaceId of [f.workspace.workspaceId, other.workspaceId])
    await f.memory.setPolicy(workspaceId, {
      enabled: true,
      retentionDays: 30,
      allowedOrigins: ["https://example.test"],
    });
  const first = await f.memory.saveEligible({
    workspaceId: f.workspace.workspaceId,
    pageId: "first",
    documentEpoch: 1,
    url: "https://example.test/first",
    title: "First",
    text: "The forgotten amber source.",
  });
  const second = await f.memory.saveEligible({
    workspaceId: other.workspaceId,
    pageId: "second",
    documentEpoch: 1,
    url: "https://example.test/second",
    title: "Second",
    text: "The retained violet source.",
  });
  const oldFactorName = [...f.secrets.keys()].find((name) => name.startsWith("pageMemoryFactorV2_"))!;
  const oldCiphertext = (
    f.db.prepare("SELECT ciphertext FROM content_memory WHERE memory_id=?").get(first.memoryId) as {
      ciphertext: string;
    }
  ).ciphertext;
  expect(await f.memory.forget(f.workspace.workspaceId, first.memoryId)).toBe(1);
  expect(f.secrets.get(oldFactorName)).toBe("");
  const activeName = f.repo.getSetting<string>("pageMemoryFactorName:profile-one")!;
  expect(activeName).not.toBe(oldFactorName);
  expect(f.secrets.get(activeName)).toBeTruthy();
  const restarted = new ContentMemoryStore(f.repo, f.native, "profile-one", f.now);
  expect(await restarted.search(f.workspace.workspaceId, "amber")).toEqual([]);
  expect((await restarted.get(other.workspaceId, second.memoryId))?.text).toBe("The retained violet source.");
  expect(oldCiphertext).not.toContain("forgotten amber");
});

it("resumes factor retirement after an OS credential failure without restoring forgotten rows", async () => {
  const f = fixture();
  const workspaceId = f.workspace.workspaceId;
  await f.memory.setPolicy(workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test"],
  });
  const saved = await f.memory.saveEligible({
    workspaceId,
    pageId: "page",
    documentEpoch: 1,
    url: "https://example.test/page",
    title: "Page",
    text: "The forgotten copper source.",
  });
  const oldFactorName = [...f.secrets.keys()].find((name) => name.startsWith("pageMemoryFactorV2_"))!;
  const failingNative = {
    ...f.native,
    async storeSecret(name: string, value: string) {
      if (name === oldFactorName && !value) throw new Error("credential store unavailable");
      return f.native.storeSecret(name, value);
    },
  };
  const interrupted = new ContentMemoryStore(f.repo, failingNative, "profile-one", f.now);
  await expect(interrupted.forget(workspaceId, saved.memoryId)).rejects.toThrow(
    /credential store unavailable/,
  );
  expect(f.db.prepare("SELECT 1 FROM content_memory WHERE memory_id=?").get(saved.memoryId)).toBeUndefined();
  expect(f.secrets.get(oldFactorName)).toBeTruthy();
  const restarted = new ContentMemoryStore(f.repo, f.native, "profile-one", f.now);
  expect(await restarted.search(workspaceId, "copper")).toEqual([]);
  expect(f.secrets.get(oldFactorName)).toBe("");
  expect(f.repo.getSetting<string[]>("pageMemoryRetiredFactors:profile-one")).toEqual([]);
});

it("rotates protection when an origin exclusion removes a page", async () => {
  const f = fixture();
  const workspaceId = f.workspace.workspaceId;
  await f.memory.setPolicy(workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test", "https://other.test"],
  });
  const excluded = await f.memory.saveEligible({
    workspaceId,
    pageId: "excluded",
    documentEpoch: 1,
    url: "https://other.test/report",
    title: "Other",
    text: "The excluded amber article.",
  });
  const retained = await f.memory.saveEligible({
    workspaceId,
    pageId: "retained",
    documentEpoch: 1,
    url: "https://example.test/report",
    title: "Example",
    text: "The retained violet article.",
  });
  const oldFactorName = [...f.secrets.keys()].find((name) => name.startsWith("pageMemoryFactorV2_"))!;
  await f.memory.setPolicy(workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test"],
  });
  expect(f.secrets.get(oldFactorName)).toBe("");
  const reopened = new ContentMemoryStore(f.repo, f.native, "profile-one", f.now);
  expect(await reopened.get(workspaceId, excluded.memoryId)).toBeUndefined();
  expect((await reopened.get(workspaceId, retained.memoryId))?.text).toContain("violet");
});

it("rotates protection when retention pruning removes an expired page", async () => {
  const f = fixture();
  const workspaceId = f.workspace.workspaceId;
  await f.memory.setPolicy(workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test"],
  });
  const expired = await f.memory.saveEligible({
    workspaceId,
    pageId: "old",
    documentEpoch: 1,
    url: "https://example.test/old",
    title: "Old",
    text: "The expired amber article.",
  });
  f.advance(20 * 86_400_000);
  const retained = await f.memory.saveEligible({
    workspaceId,
    pageId: "new",
    documentEpoch: 1,
    url: "https://example.test/new",
    title: "New",
    text: "The retained violet article.",
  });
  const oldFactorName = [...f.secrets.keys()].find((name) => name.startsWith("pageMemoryFactorV2_"))!;
  f.advance(11 * 86_400_000);
  expect(await f.memory.prune()).toEqual({ removed: 1, workspaceIds: [workspaceId] });
  expect(f.secrets.get(oldFactorName)).toBe("");
  const reopened = new ContentMemoryStore(f.repo, f.native, "profile-one", f.now);
  expect(await reopened.get(workspaceId, expired.memoryId)).toBeUndefined();
  expect((await reopened.get(workspaceId, retained.memoryId))?.text).toContain("violet");
});

it("refuses sensitive page metadata even when the site was previously allowed", async () => {
  const f = fixture();
  await f.memory.setPolicy(f.workspace.workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://bank.example", "https://example.test"],
  });
  const base = {
    workspaceId: f.workspace.workspaceId,
    pageId: "page-one",
    documentEpoch: 1,
    text: "This page contains account details for the user.",
  };
  await expect(
    f.memory.saveEligible({ ...base, url: "https://bank.example/news", title: "News" }),
  ).rejects.toThrow(/Sensitive pages/);
  await expect(
    f.memory.saveEligible({ ...base, url: "https://example.test/login", title: "Welcome" }),
  ).rejects.toThrow(/Sensitive pages/);
  expect(f.db.prepare("SELECT count(*) AS n FROM content_memory").get()).toMatchObject({ n: 0 });
});

it("denies Private, excluded, banking, health, and login pages before a readable-text request", async () => {
  const f = fixture();
  const workspaceId = f.workspace.workspaceId;
  await f.memory.setPolicy(workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test", "https://bank.example", "https://health.example"],
  });
  const candidate = { workspaceId, url: "https://example.test/article", title: "Ordinary article" };
  f.memory.assertCaptureEligible(candidate);
  for (const input of [
    { ...candidate, privateMode: true },
    { ...candidate, url: "https://bank.example/news" },
    { ...candidate, url: "https://health.example/news" },
    { ...candidate, url: "https://example.test/login" },
  ])
    expect(() => f.memory.assertCaptureEligible(input)).toThrow(/Sensitive pages/);
  f.repo.setSetting(`workspaceMemory:${workspaceId}`, { excludedOrigins: ["https://example.test"] });
  expect(() => f.memory.assertCaptureEligible(candidate)).toThrow(/not eligible/);
  expect(f.db.prepare("SELECT count(*) AS n FROM content_memory").get()).toMatchObject({ n: 0 });
});

it("rejects sensitive article text and a document change during encryption", async () => {
  const f = fixture();
  await f.memory.setPolicy(f.workspace.workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test"],
  });
  const input = {
    workspaceId: f.workspace.workspaceId,
    pageId: "page-one",
    documentEpoch: 1,
    url: "https://example.test/article",
    title: "Ordinary article",
    text: "Your account balance is $4,000.",
  };
  await expect(f.memory.saveEligible(input)).rejects.toThrow(/Sensitive pages/);
  await expect(
    f.memory.saveEligible({ ...input, text: "A useful neutral article." }, () => false),
  ).rejects.toThrow(/document changed/);
  expect(f.db.prepare("SELECT count(*) AS n FROM content_memory").get()).toMatchObject({ n: 0 });
});

it("requires the recovery advance before deleting articles through Forget or policy removal", async () => {
  const f = fixture();
  const workspaceId = f.workspace.workspaceId;
  await f.memory.setPolicy(workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test"],
  });
  const save = (pageId: string) =>
    f.memory.saveEligible({
      workspaceId,
      pageId,
      documentEpoch: 1,
      url: `https://example.test/${pageId}`,
      title: "Ordinary article",
      text: `Article ${pageId} has retained text.`,
    });
  await save("first");
  await expect(
    f.memory.forget(workspaceId, undefined, () => {
      throw new Error("anchor unavailable");
    }),
  ).rejects.toThrow(/anchor unavailable/);
  expect(await f.memory.search(workspaceId, "retained text")).toHaveLength(1);
  let advances = 0;
  expect(
    await f.memory.forget(workspaceId, undefined, () => {
      advances++;
    }),
  ).toBe(1);
  await save("second");
  await expect(
    f.memory.setPolicy(workspaceId, { enabled: true, retentionDays: 30, allowedOrigins: [] }, () => {
      throw new Error("anchor unavailable");
    }),
  ).rejects.toThrow(/anchor unavailable/);
  expect(await f.memory.search(workspaceId, "retained text")).toHaveLength(1);
  await f.memory.setPolicy(workspaceId, { enabled: true, retentionDays: 30, allowedOrigins: [] }, () => {
    advances++;
  });
  expect(advances).toBe(2);
  expect(await f.memory.search(workspaceId, "retained text")).toEqual([]);
});

it("physically removes excluded and expired sources and rejects tampered ciphertext", async () => {
  const f = fixture();
  await f.memory.setPolicy(f.workspace.workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test"],
  });
  const input = {
    workspaceId: f.workspace.workspaceId,
    pageId: "p1",
    documentEpoch: 1,
    url: "https://example.test/report",
    title: "Report",
    text: "Distinctive source text for recall.",
  };
  const saved = await f.memory.saveEligible(input);
  f.tasks.setWorkspaceMemory(f.workspace.workspaceId, 0, "", true, [], ["https://example.test"]);
  expect(f.db.prepare("SELECT 1 FROM content_memory WHERE memory_id=?").get(saved.memoryId)).toBeUndefined();
  expect(await f.memory.search(f.workspace.workspaceId, "distinctive")).toEqual([]);
  f.tasks.setWorkspaceMemory(f.workspace.workspaceId, 1, "", true, [], []);
  const restored = await f.memory.saveEligible(input);
  const encrypted = f.db
    .prepare("SELECT ciphertext FROM content_memory WHERE memory_id=?")
    .get(restored.memoryId) as { ciphertext: string };
  const envelope = JSON.parse(encrypted.ciphertext.slice(3)) as {
    version: 2;
    wrappedKey: string;
    ciphertext: string;
  };
  f.db
    .prepare("UPDATE content_memory SET ciphertext=? WHERE memory_id=?")
    .run(`v2:${JSON.stringify({ ...envelope, ciphertext: "AAAA" })}`, restored.memoryId);
  const reopened = new ContentMemoryStore(f.repo, f.native, "profile-one", f.now);
  await expect(reopened.search(f.workspace.workspaceId, "distinctive")).rejects.toThrow(/incomplete/);
  await f.memory.forget(f.workspace.workspaceId, restored.memoryId);
  await f.memory.saveEligible(input);
  f.advance(31 * 86_400_000);
  expect(await f.memory.search(f.workspace.workspaceId, "distinctive")).toEqual([]);
  expect(await f.memory.prune()).toEqual({ removed: 1, workspaceIds: [f.workspace.workspaceId] });
});

it("ranks source-linked answers to natural questions without requiring every question word", async () => {
  const f = fixture();
  const space = f.workspace.workspaceId;
  await f.memory.setPolicy(space, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test"],
  });
  const pages = [
    {
      url: "https://example.test/coffee",
      title: "Coffee harvest",
      text: "The harvest begins in October. Farmers dry the beans in the sun.",
    },
    {
      url: "https://example.test/space",
      title: "Space telescope",
      text: "The telescope launched in December and studies distant stars.",
    },
    {
      url: "https://example.test/garden",
      title: "Autumn garden",
      text: "October is the best month to plant garlic bulbs before winter.",
    },
  ];
  for (const [index, page] of pages.entries())
    await f.memory.saveEligible({ workspaceId: space, pageId: `page-${index}`, documentEpoch: 1, ...page });
  const matches = await f.memory.search(space, "When does the coffee harvest begin?");
  expect(matches[0]?.url).toBe("https://example.test/coffee");
  expect(matches[0]?.snippet).toContain("October");
  expect(matches[0]?.workspaceId).toBe(space);
  expect(await f.memory.search(space, "unrelated nonexistent subject")).toEqual([]);
  expect(await f.memory.search(space, "art")).toEqual([]);
});

it("retrieves Spanish and Japanese article terms within their exact Space", async () => {
  const f = fixture();
  const space = f.workspace.workspaceId;
  await f.memory.setPolicy(space, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test"],
  });
  await f.memory.saveEligible({
    workspaceId: space,
    pageId: "spanish",
    documentEpoch: 1,
    url: "https://example.test/cafe",
    title: "La cosecha de café",
    text: "La cosecha de café empieza en octubre.",
  });
  await f.memory.saveEligible({
    workspaceId: space,
    pageId: "japanese",
    documentEpoch: 1,
    url: "https://example.test/coffee-jp",
    title: "コーヒーの収穫",
    text: "コーヒーの収穫は十月に始まる。",
  });
  expect((await f.memory.search(space, "¿Cuándo empieza la cosecha de café?"))[0]?.pageId).toBe("spanish");
  expect((await f.memory.search(space, "コーヒーの収穫はいつ始まる？"))[0]?.pageId).toBe("japanese");
  expect(await f.memory.search(space, "receta de chocolate")).toEqual([]);
  const other = f.tasks.createWorkspace("Other");
  await f.memory.setPolicy(other.workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test"],
  });
  expect(await f.memory.search(other.workspaceId, "cosecha café")).toEqual([]);
});

it("does not return decrypted content after policy revocation during key access", async () => {
  const f = fixture();
  const space = f.workspace.workspaceId;
  await f.memory.setPolicy(space, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test"],
  });
  const saved = await f.memory.saveEligible({
    workspaceId: space,
    pageId: "p",
    documentEpoch: 1,
    url: "https://example.test/article",
    title: "Article",
    text: "Sensitive recalled source",
  });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const delayed = new ContentMemoryStore(
    f.repo,
    {
      readSecret: async (name) => {
        await gate;
        return f.native.readSecret(name);
      },
      storeSecret: f.native.storeSecret,
    },
    "profile-one",
    f.now,
  );
  const pending = delayed.get(space, saved.memoryId);
  await f.memory.setPolicy(space, {
    enabled: false,
    retentionDays: 30,
    allowedOrigins: ["https://example.test"],
  });
  release();
  expect(await pending).toBeUndefined();
});
