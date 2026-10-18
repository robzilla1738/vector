import { afterEach, expect, it } from "vitest";
import { setImmediate as idle } from "node:timers/promises";
import { createHash, randomBytes } from "node:crypto";
import { EventBus, openDb, Repo, TaskService } from "@aux/runtime";
import { ContentMemoryStore } from "../../apps/runtime/src/services/content-memory.js";

const databases: ReturnType<typeof openDb>[] = [];
const memories: ContentMemoryStore[] = [];
afterEach(async () => {
  await Promise.all(memories.splice(0).map((memory) => memory.close()));
  for (const db of databases.splice(0)) db.close();
});

function fixture(request?: typeof fetch) {
  const db = openDb(":memory:");
  databases.push(db);
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
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
  const memory = new ContentMemoryStore(repo, native, "profile-one", () => now, events, request);
  memories.push(memory);
  return {
    db,
    repo,
    events,
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
  expect(f.memory.policy(f.workspace.workspaceId)).toMatchObject({
    enabled: true,
    originScope: "safe-sites",
  });
  await f.memory.setPolicy(f.workspace.workspaceId, {
    enabled: false,
    retentionDays: 30,
    allowedOrigins: [],
  });
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

it("rejects unsupported page-memory formats without rewriting rows or touching native factors", async () => {
  const f = fixture();
  const workspaceId = f.workspace.workspaceId;
  await f.memory.setPolicy(workspaceId, {
    enabled: true,
    retentionDays: 30,
    allowedOrigins: ["https://example.test"],
  });
  f.db
    .prepare(
      `INSERT INTO content_memory(memory_id,profile_id,workspace_id,source_key,origin,captured_at,expires_at,ciphertext)
    VALUES(?,?,?,?,?,?,?,?)`,
    )
    .run(
      "unsupported",
      "profile-one",
      workspaceId,
      "source",
      "https://example.test",
      f.now(),
      f.now() + 86400000,
      "v1:AAAA",
    );
  await expect(f.memory.search(workspaceId, "article")).rejects.toThrow(
    "Unknown protected page-memory format",
  );
  expect(
    f.db.prepare("SELECT ciphertext FROM content_memory WHERE memory_id='unsupported'").get(),
  ).toMatchObject({ ciphertext: "v1:AAAA" });
  expect(f.secrets.size).toBe(0);
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
  f.tasks.setWorkspaceMemory(workspaceId, 0, "", true, undefined, ["https://example.test"]);
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

it("semantically recalls local synonyms with sealed derivative vectors and clearly marks unavailable-model fallback", async () => {
  const digest = "a".repeat(64);
  const calls: string[] = [];
  const request: typeof fetch = async (input, init) => {
    const path = new URL(String(input)).pathname;
    calls.push(path);
    if (path === "/api/tags") return Response.json({ models: [{ name: "local-embedding:latest", digest }] });
    if (path === "/api/show") return Response.json({ capabilities: ["embedding"] });
    if (path === "/api/embed") {
      const value = (JSON.parse(String(init?.body)) as { input: string | string[] }).input;
      return Response.json({
        embeddings: (Array.isArray(value) ? value : [value]).map((text) =>
          text.includes("car") || text.includes("vehicle") ? [1, 0] : [0, 1],
        ),
      });
    }
    throw new Error("Unexpected local route");
  };
  const f = fixture(request),
    workspaceId = f.workspace.workspaceId;
  const car = await f.memory.saveEligible({
    workspaceId,
    pageId: "car",
    documentEpoch: 1,
    url: "https://example.test/cars",
    title: "Car transport",
    text: "A car carries travelers across town.",
  });
  await f.memory.saveEligible({
    workspaceId,
    pageId: "tree",
    documentEpoch: 1,
    url: "https://example.test/trees",
    title: "Tree canopy",
    text: "Trees provide shade in parks.",
  });
  expect(await f.memory.search(workspaceId, "vehicle")).toEqual([]);
  expect(await f.memory.semanticSearch(workspaceId, "vehicle")).toMatchObject({ mode: "lexical" });
  await f.memory.prewarm(workspaceId);
  const semantic = await f.memory.semanticSearch(workspaceId, "vehicle");
  expect(semantic.mode).toBe("semantic");
  expect(semantic.matches[0]?.memoryId).toBe(car.memoryId);
  const derivatives = f.db.prepare("SELECT ciphertext FROM ai_result_cache").all();
  expect(derivatives).toHaveLength(2);
  expect(JSON.stringify(derivatives)).not.toContain("Car transport");
  expect(JSON.stringify(derivatives)).not.toContain("[1,0]");
  expect(calls.every((path) => ["/api/tags", "/api/show", "/api/embed"].includes(path))).toBe(true);
  await f.memory.forget(workspaceId, car.memoryId);
  expect(f.db.prepare("SELECT count(*) AS count FROM ai_result_cache").get()?.count).toBe(0);
  await f.memory.close();
  const unavailable = new ContentMemoryStore(f.repo, f.native, "profile-one", f.now, undefined, async () => {
    throw new Error("offline");
  });
  expect(await unavailable.semanticSearch(workspaceId, "Trees")).toMatchObject({
    mode: "lexical",
    message: expect.stringContaining("keyword"),
    matches: [{ title: "Tree canopy" }],
  });
  await unavailable.close();
});

it("defaults to safe-site capture but preserves explicit off/listed policy and fails closed on malformed persisted policy", async () => {
  const f = fixture(),
    workspaceId = f.workspace.workspaceId;
  expect(f.memory.policy(workspaceId)).toMatchObject({ enabled: true, originScope: "safe-sites" });
  await f.memory.setPolicy(workspaceId, { enabled: true, retentionDays: 30, allowedOrigins: [] });
  await expect(
    f.memory.saveEligible({
      workspaceId,
      pageId: "p",
      documentEpoch: 1,
      url: "https://example.test/article",
      title: "Article",
      text: "Readable public text.",
    }),
  ).rejects.toThrow();
  f.repo.setSetting(`contentMemoryPolicy:${workspaceId}`, {
    enabled: true,
    retentionDays: "invalid",
    allowedOrigins: [],
  });
  expect(f.memory.policy(workspaceId).enabled).toBe(false);
});

function delayedEmbeddings() {
  const batches: string[][] = [];
  const signals: AbortSignal[] = [];
  let start!: () => void;
  let release!: () => void;
  const started = new Promise<void>((resolve) => {
    start = resolve;
  });
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  const request: typeof fetch = async (input, init) => {
    const path = new URL(String(input)).pathname;
    if (path === "/api/tags") return Response.json({ models: [{ name: "local", digest: "a".repeat(64) }] });
    if (path === "/api/show") return Response.json({ capabilities: ["embedding"] });
    if (path !== "/api/embed") throw new Error("Unexpected local embedding route");
    const value = (JSON.parse(String(init?.body)) as { input: string | string[] }).input;
    const texts = Array.isArray(value) ? value : [value];
    if (Array.isArray(value)) {
      batches.push(value);
      signals.push(init!.signal!);
      if (batches.length === 1) {
        start();
        await blocked;
      }
    }
    return Response.json({
      embeddings: texts.map((text) => (text.includes("car") || text.includes("vehicle") ? [1, 0] : [0, 1])),
    });
  };
  return { request, batches, signals, started, release: () => release() };
}

it("returns lexical matches while a corpus batch is blocked and reuses sealed vectors after restart", async () => {
  const local = delayedEmbeddings();
  const f = fixture(local.request);
  const workspaceId = f.workspace.workspaceId;
  for (let i = 0; i < 9; i++)
    await f.memory.saveEligible({
      workspaceId,
      pageId: `page-${i}`,
      documentEpoch: 1,
      url: `https://example.test/article-${i}`,
      title: `Car article ${i}`,
      text: "A car carries travelers.",
    });
  const warming = f.memory.prewarm(workspaceId);
  await local.started;
  expect((await f.memory.search(workspaceId, "travelers")).length).toBe(9);
  expect(await f.memory.semanticSearch(workspaceId, "travelers")).toMatchObject({
    mode: "lexical",
    matches: expect.any(Array),
  });
  expect(local.batches.map((batch) => batch.length)).toEqual([8]);
  local.release();
  await warming;
  expect(local.batches.map((batch) => batch.length)).toEqual([8, 1]);
  expect((await f.memory.semanticSearch(workspaceId, "vehicle")).mode).toBe("semantic");
  const raw = JSON.stringify(f.db.prepare("SELECT * FROM ai_result_cache").all());
  expect(raw).not.toContain("Car article");
  expect(raw).not.toContain("[1,0]");
  await f.memory.saveEligible({
    workspaceId,
    pageId: "page-0",
    documentEpoch: 2,
    url: "https://example.test/article-0",
    title: "Car article 0",
    text: "A car carries travelers.",
  });
  await f.memory.prewarm(workspaceId);
  expect(local.batches.map((batch) => batch.length)).toEqual([8, 1]);
  const reopened = new ContentMemoryStore(f.repo, f.native, "profile-one", f.now, undefined, local.request);
  memories.push(reopened);
  await reopened.prewarm(workspaceId);
  expect(local.batches.map((batch) => batch.length)).toEqual([8, 1]);
  expect((await reopened.semanticSearch(workspaceId, "vehicle")).matches).toHaveLength(9);
});

it("cancels an in-flight batch on Forget and cannot publish its late vectors", async () => {
  const local = delayedEmbeddings();
  const f = fixture(local.request),
    workspaceId = f.workspace.workspaceId;
  const saved = await f.memory.saveEligible({
    workspaceId,
    pageId: "car",
    documentEpoch: 1,
    url: "https://example.test/car",
    title: "Car",
    text: "A car carries travelers.",
  });
  const warming = f.memory.prewarm(workspaceId);
  await local.started;
  await f.memory.forget(workspaceId, saved.memoryId);
  expect(local.signals[0]!.aborted).toBe(true);
  local.release();
  await expect(warming).rejects.toThrow();
  expect(f.db.prepare("SELECT count(*) AS n FROM ai_result_cache").get()?.n).toBe(0);
  expect(await f.memory.search(workspaceId, "car")).toEqual([]);
});

it("gives a same-clock recapture a distinct identity without publishing the old batch", async () => {
  const local = delayedEmbeddings();
  const f = fixture(local.request),
    workspaceId = f.workspace.workspaceId;
  const input = {
    workspaceId,
    pageId: "p",
    documentEpoch: 1,
    url: "https://example.test/article",
    title: "Car",
    text: "A car carries travelers.",
  };
  const saved = await f.memory.saveEligible(input);
  const oldWarm = f.memory.prewarm(workspaceId);
  await local.started;
  const updated = await f.memory.saveEligible({
    ...input,
    documentEpoch: 2,
    title: "Trees",
    text: "Trees provide shade.",
  });
  expect(updated.capturedAt).toBe(saved.capturedAt + 1);
  expect(updated.memoryId).toBe(saved.memoryId);
  await f.memory.prewarm(workspaceId);
  local.release();
  await expect(oldWarm).rejects.toThrow();
  expect(local.signals[0]!.aborted).toBe(true);
  expect(await f.memory.search(workspaceId, "travelers")).toEqual([]);
  expect((await f.memory.search(workspaceId, "shade"))[0]?.documentEpoch).toBe(2);
  expect(f.db.prepare("SELECT count(*) AS n FROM ai_result_cache").get()?.n).toBe(1);
  expect(local.batches).toHaveLength(2);
});

it("cancels the original lexical request while its shared index waits for the OS key", async () => {
  const f = fixture();
  const workspaceId = f.workspace.workspaceId;
  await f.memory.saveEligible({
    workspaceId,
    pageId: "p",
    documentEpoch: 1,
    url: "https://example.test/article",
    title: "Article",
    text: "Reusable browser research.",
  });
  let release!: () => void, started!: () => void;
  const keyWait = new Promise<void>((resolve) => {
    release = resolve;
  });
  const keyStarted = new Promise<void>((resolve) => {
    started = resolve;
  });
  const reopened = new ContentMemoryStore(
    f.repo,
    {
      ...f.native,
      readSecret: async (name) => {
        started();
        await keyWait;
        return f.native.readSecret(name);
      },
    },
    "profile-one",
    f.now,
  );
  memories.push(reopened);
  const controller = new AbortController();
  const search = reopened.search(workspaceId, "research", 5, controller.signal);
  await keyStarted;
  controller.abort(new Error("Original run stopped"));
  await expect(search).rejects.toThrow("Original run stopped");
  release();
  expect((await reopened.search(workspaceId, "research"))[0]?.title).toBe("Article");
});

it("retires derivatives and stops pending publication when Space memory is paused", async () => {
  const local = delayedEmbeddings();
  const f = fixture(local.request),
    workspaceId = f.workspace.workspaceId;
  await f.memory.saveEligible({
    workspaceId,
    pageId: "car",
    documentEpoch: 1,
    url: "https://example.test/car",
    title: "Car",
    text: "A car carries travelers.",
  });
  await f.memory.cachedDerivative({
    workspaceId,
    signature: "prior",
    eligible: () => true,
    parse: (value) => String(value),
    compute: async () => "prior result",
  });
  const warming = f.memory.prewarm(workspaceId);
  await local.started;
  f.tasks.setWorkspaceMemory(workspaceId, 0, "", false);
  expect(local.signals[0]!.aborted).toBe(true);
  await f.memory.invalidateDerivatives();
  local.release();
  await expect(warming).rejects.toThrow();
  expect(f.db.prepare("SELECT count(*) AS n FROM ai_result_cache").get()?.n).toBe(0);
  expect(f.db.prepare("SELECT count(*) AS n FROM content_memory").get()?.n).toBe(1);
  expect(await f.memory.search(workspaceId, "car")).toEqual([]);
});

it("returns keyword history while recent eligible visits warm and never returns removed visits", async () => {
  const local = delayedEmbeddings();
  const f = fixture(local.request),
    workspaceId = f.workspace.workspaceId;
  f.repo.addHistory("https://example.test/car", "Car transport");
  f.repo.addHistory("https://example.test/trees", "Tree shade");
  f.repo.addHistory("https://example.test/private?token=secret", "Credential page");
  const signal = new AbortController().signal;
  const cold = await f.memory.semanticHistory(workspaceId, "Car", 5, signal, () => {});
  expect(cold).toMatchObject({ mode: "lexical", entries: [{ title: "Car transport" }] });
  await local.started;
  expect(local.batches[0]).toHaveLength(2);
  expect(local.batches[0]!.join(" ")).not.toContain("secret");
  local.release();
  await idle();
  const refined = await f.memory.semanticHistory(workspaceId, "vehicle", 5, signal, () => {});
  expect(refined.mode).toBe("semantic");
  expect(refined.entries[0]?.title).toBe("Car transport");
  const car = f.repo.listHistory("Car")[0]!;
  f.repo.removeHistory(car.url, car.visitedAt);
  f.events.emit("history.changed", {});
  expect(await f.memory.semanticHistory(workspaceId, "Car", 5, signal, () => {})).toMatchObject({
    mode: "lexical",
    entries: [],
  });
});

it("aborts background transport and joins it before closing Memory", async () => {
  const local = delayedEmbeddings();
  const f = fixture(local.request),
    workspaceId = f.workspace.workspaceId;
  await f.memory.saveEligible({
    workspaceId,
    pageId: "car",
    documentEpoch: 1,
    url: "https://example.test/car",
    title: "Car",
    text: "A car carries travelers.",
  });
  const warming = f.memory.prewarm(workspaceId);
  await local.started;
  const closing = f.memory.close();
  expect(local.signals[0]!.aborted).toBe(true);
  local.release();
  await expect(warming).rejects.toThrow();
  await closing;
  expect(f.db.prepare("SELECT count(*) AS n FROM ai_result_cache").get()?.n).toBe(0);
});

it("does not rank an older query vector against a refreshed model's corpus", async () => {
  let refreshed = false;
  let started!: () => void;
  let release!: () => void;
  const queryStarted = new Promise<void>((resolve) => {
    started = resolve;
  });
  const queryGate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const request: typeof fetch = async (input, init) => {
    const path = new URL(String(input)).pathname;
    if (path === "/api/tags")
      return Response.json({
        models: [
          { name: "z-old", digest: "a".repeat(64) },
          ...(refreshed ? [{ name: "a-new", digest: "b".repeat(64) }] : []),
        ],
      });
    if (path === "/api/show") return Response.json({ capabilities: ["embedding"] });
    const body = JSON.parse(String(init?.body)) as { model: string; input: string | string[] };
    if (typeof body.input === "string") {
      started();
      await queryGate;
    }
    return Response.json({
      embeddings: (Array.isArray(body.input) ? body.input : [body.input]).map(() =>
        body.model === "z-old" ? [1, 0] : [0, 1],
      ),
    });
  };
  const f = fixture(request),
    workspaceId = f.workspace.workspaceId;
  await f.memory.saveEligible({
    workspaceId,
    pageId: "car",
    documentEpoch: 1,
    url: "https://example.test/car",
    title: "Car",
    text: "A car carries travelers.",
  });
  await f.memory.prewarm(workspaceId);
  refreshed = true;
  f.advance(60_001);
  const pending = f.memory.semanticSearch(workspaceId, "car");
  await queryStarted;
  await f.memory.prewarm(workspaceId);
  release();
  expect(await pending).toMatchObject({
    mode: "lexical",
    message: expect.stringContaining("model changed"),
    matches: [{ pageId: "car" }],
  });
});

it("pages thirty exact capture metadata identities and exposes recapture and forgetting without article bodies", async () => {
  const f = fixture(),
    workspaceId = f.workspace.workspaceId;
  const saved: Awaited<ReturnType<ContentMemoryStore["saveEligible"]>>[] = [];
  for (let index = 0; index < 30; index++) {
    f.advance(1);
    saved.push(
      await f.memory.saveEligible({
        workspaceId,
        pageId: `page-${index}`,
        documentEpoch: 1,
        url: `https://example.test/articles/${index}`,
        title: `Research ${index}`,
        text: "Private body must stay out of the catalog.",
      }),
    );
  }
  const selectedIds = saved.map((source) => source.memoryId);
  const first = await f.memory.list(workspaceId, { workspaceId, query: "Research", selectedIds });
  expect(first.items).toHaveLength(20);
  expect(first.selected).toHaveLength(30);
  expect(JSON.stringify(first)).not.toContain("Private body");
  const second = await f.memory.list(workspaceId, {
    workspaceId,
    query: "Research",
    selectedIds,
    cursor: first.nextCursor!,
  });
  expect(second.items).toHaveLength(10);
  expect(second.nextCursor).toBeNull();
  expect(new Set([...first.items, ...second.items].map((source) => source.memoryId)).size).toBe(30);
  const original = saved[0]!;
  f.advance(1);
  await f.memory.saveEligible({ ...original, documentEpoch: 2, text: "Changed source text." });
  await f.memory.forget(workspaceId, saved[1]!.memoryId);
  const changed = await f.memory.list(workspaceId, { workspaceId, query: "", selectedIds });
  expect(changed.selected.find((source) => source.memoryId === original.memoryId)).toMatchObject({
    documentEpoch: 2,
  });
  expect(changed.selected.some((source) => source.memoryId === saved[1]!.memoryId)).toBe(false);
});

it("allows original historical article proof with ingestion off but refuses expiry, exclusions and actual Forget", async () => {
  const f = fixture(),
    workspaceId = f.workspace.workspaceId;
  const saved = await f.memory.saveEligible({
    workspaceId,
    pageId: "historical",
    documentEpoch: 1,
    url: "https://example.test/history",
    title: "Workshop history",
    text: "The workshop meets Tuesday.",
  });
  const refs = (await f.memory.list(workspaceId, { workspaceId, selectedIds: [saved.memoryId] })).selected;
  f.tasks.setWorkspaceMemory(workspaceId, 0, "", false);
  expect((await f.memory.list(workspaceId, { workspaceId, selectedIds: [saved.memoryId] })).selected).toEqual(
    [],
  );
  const current = await f.memory.assertHistoricalSources(workspaceId, refs);
  current();
  await f.memory.forget(workspaceId, saved.memoryId);
  expect(current).toThrow(/forgotten/);
  await expect(f.memory.assertHistoricalSources(workspaceId, refs)).rejects.toThrow(/removed/);
});
it("refuses an authenticated historical article when Forget deletes it during its original key await", async () => {
  const f = fixture(),
    workspaceId = f.workspace.workspaceId;
  const saved = await f.memory.saveEligible({
    workspaceId,
    pageId: "pending-history",
    documentEpoch: 1,
    url: "https://example.test/pending",
    title: "History",
    text: "Original workshop history.",
  });
  const refs = (await f.memory.list(workspaceId, { workspaceId, selectedIds: [saved.memoryId] })).selected;
  const pending = f.memory.assertHistoricalSources(workspaceId, refs);
  const removal = f.memory.forget(workspaceId, saved.memoryId);
  const proof = await pending;
  await removal;
  expect(proof).toThrow(/forgotten/);
});
it("expires original historical article proof even with ingestion off", async () => {
  const f = fixture(),
    workspaceId = f.workspace.workspaceId;
  const saved = await f.memory.saveEligible({
    workspaceId,
    pageId: "expiry",
    documentEpoch: 1,
    url: "https://example.test/expiry",
    title: "History",
    text: "Original workshop history.",
  });
  const refs = (await f.memory.list(workspaceId, { workspaceId, selectedIds: [saved.memoryId] })).selected;
  const current = await f.memory.assertHistoricalSources(workspaceId, refs);
  f.advance(31 * 86400000);
  expect(current).toThrow(/expired/);
});

it("refuses original historical article proof after an explicit source exclusion", async () => {
  const f = fixture(),
    workspaceId = f.workspace.workspaceId;
  const saved = await f.memory.saveEligible({
    workspaceId,
    pageId: "excluded-history",
    documentEpoch: 1,
    url: "https://example.test/excluded",
    title: "History",
    text: "Original workshop history.",
  });
  const refs = (await f.memory.list(workspaceId, { workspaceId, selectedIds: [saved.memoryId] })).selected;
  const check = await f.memory.assertHistoricalSources(workspaceId, refs);
  f.tasks.setWorkspaceMemory(workspaceId, 0, "", false, undefined, ["https://example.test"]);
  expect(check).toThrow(/excluded|forgotten/);
  await expect(f.memory.assertHistoricalSources(workspaceId, refs)).rejects.toMatchObject({
    code: "permission_denied",
  });
});
