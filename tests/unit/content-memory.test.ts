import { afterEach, expect, it } from "vitest";
import { EventBus, openDb, Repo, TaskService } from "@aux/runtime";
import { ContentMemoryStore } from "../../apps/runtime/src/services/content-memory.js";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => { for (const db of databases.splice(0)) db.close(); });

function fixture() {
  const db = openDb(":memory:"); databases.push(db);
  const repo = new Repo(db);
  const tasks = new TaskService(repo, new EventBus(repo));
  const workspace = tasks.createWorkspace("Research");
  const secrets = new Map<string, string>();
  const native = {
    readSecret: async (name: string) => ({ value: secrets.get(name) }),
    storeSecret: async (name: string, value: string) => { secrets.set(name, value); return { ok: true as const }; },
  };
  let now = 1_800_000_000_000;
  const memory = new ContentMemoryStore(repo, native, "profile-one", () => now);
  return { db, repo, tasks, workspace, secrets, native, memory, advance: (ms: number) => { now += ms; }, now: () => now };
}

it("keeps page text and source paths encrypted while rebuilding search after a restart", async () => {
  const f = fixture();
  const input = { workspaceId: f.workspace.workspaceId, pageId: "page-one", documentEpoch: 3,
    sessionId: "session-one", url: "https://example.test/private/article?token=discard", title: "Deep browser research",
    text: "A practical browser can cite its research sources precisely." };
  await expect(f.memory.saveEligible(input)).rejects.toThrow(/Enable page-content recall/);
  f.memory.setPolicy(f.workspace.workspaceId, { enabled: true, retentionDays: 30, allowedOrigins: ["https://example.test"] });
  const saved = await f.memory.saveEligible(input);
  expect(saved.url).toBe("https://example.test/private/article");
  const row = f.db.prepare("SELECT ciphertext,origin,source_key FROM content_memory WHERE memory_id=?").get(saved.memoryId) as
    { ciphertext: string; origin: string; source_key: string };
  expect(row.origin).toBe("https://example.test");
  expect(row.ciphertext).not.toContain("practical browser");
  expect(row.ciphertext).not.toContain("private/article");
  expect(row.source_key).not.toContain("article");
  const reopened = new ContentMemoryStore(f.repo, f.native, "profile-one", f.now);
  expect(await reopened.search(f.workspace.workspaceId, "research sources")).toMatchObject([
    { memoryId: saved.memoryId, title: "Deep browser research", url: saved.url, documentEpoch: 3 },
  ]);
  expect((await reopened.get(f.workspace.workspaceId, saved.memoryId))?.text).toBe(input.text);
  await expect(new ContentMemoryStore(f.repo, f.native, "other-profile", f.now).search(f.workspace.workspaceId, "research"))
    .resolves.toEqual([]);
  const key = f.secrets.get("pageMemoryKey")!;
  f.secrets.delete("pageMemoryKey");
  await expect(new ContentMemoryStore(f.repo, f.native, "profile-one", f.now).search(f.workspace.workspaceId, "research"))
    .rejects.toThrow(/key is missing/);
  f.secrets.set("pageMemoryKey", key);
});

it("physically removes excluded and expired sources and rejects tampered ciphertext", async () => {
  const f = fixture();
  f.memory.setPolicy(f.workspace.workspaceId, { enabled: true, retentionDays: 30, allowedOrigins: ["https://example.test"] });
  const input = { workspaceId: f.workspace.workspaceId, pageId: "p1", documentEpoch: 1,
    url: "https://example.test/report", title: "Report", text: "Distinctive source text for recall." };
  const saved = await f.memory.saveEligible(input);
  f.tasks.setWorkspaceMemory(f.workspace.workspaceId, 0, "", true, [], ["https://example.test"]);
  expect(f.db.prepare("SELECT 1 FROM content_memory WHERE memory_id=?").get(saved.memoryId)).toBeUndefined();
  expect(await f.memory.search(f.workspace.workspaceId, "distinctive")).toEqual([]);
  f.tasks.setWorkspaceMemory(f.workspace.workspaceId, 1, "", true, [], []);
  const restored = await f.memory.saveEligible(input);
  f.db.prepare("UPDATE content_memory SET ciphertext='v1:AAAA' WHERE memory_id=?").run(restored.memoryId);
  const reopened = new ContentMemoryStore(f.repo, f.native, "profile-one", f.now);
  await expect(reopened.search(f.workspace.workspaceId, "distinctive")).rejects.toThrow(/incomplete/);
  f.memory.forget(f.workspace.workspaceId, restored.memoryId);
  await f.memory.saveEligible(input);
  f.advance(31 * 86_400_000);
  expect(await f.memory.search(f.workspace.workspaceId, "distinctive")).toEqual([]);
  expect(f.memory.prune()).toBe(1);
});
