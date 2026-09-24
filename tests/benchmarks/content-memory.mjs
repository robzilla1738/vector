// Local capacity probe. Run after `pnpm build`: node tests/benchmarks/content-memory.mjs
import { performance } from "node:perf_hooks";
import { ContentMemoryStore } from "../../apps/runtime/dist/services/content-memory.js";
import { EventBus, openDb, Repo, TaskService } from "../../apps/runtime/dist/index.js";

const words = Array.from({ length: 8000 }, (_, index) => `term${index.toString(36).padStart(4, "0")}`);
for (const wordsPerArticle of [550, 5500]) {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  const workspaceId = new TaskService(repo, new EventBus(repo)).createWorkspace("Recall benchmark").workspaceId;
  const secrets = new Map();
  const native = { readSecret: async name => ({ value: secrets.get(name) }),
    storeSecret: async (name, value) => { secrets.set(name, value); } };
  const memory = new ContentMemoryStore(repo, native, "benchmark-profile");
  memory.setPolicy(workspaceId, { enabled: true, retentionDays: 30, allowedOrigins: ["https://example.test"] });
  for (let article = 0; article < 500; article++) {
    const text = Array.from({ length: wordsPerArticle }, (_, index) => words[(article * 131 + index * 227) % words.length]).join(" ");
    await memory.saveEligible({ workspaceId, pageId: `page-${article}`, documentEpoch: 1,
      url: `https://example.test/article-${article}`, title: `Research article ${article}`, text });
  }
  const query = "term00ab term00cd";
  const cpuBefore = process.cpuUsage();
  const started = performance.now();
  const cold = await memory.search(workspaceId, query);
  const afterCold = performance.now();
  const warm = await memory.search(workspaceId, query);
  const afterWarm = performance.now();
  const cpu = process.cpuUsage(cpuBefore);
  console.log(JSON.stringify({ articles: 500, wordsPerArticle, coldMs: Math.round(afterCold - started),
    warmMs: Math.round(afterWarm - afterCold), cpuMs: Math.round((cpu.user + cpu.system) / 1000),
    rssMb: Math.round(process.memoryUsage().rss / 1048576), coldMatches: cold.length, warmMatches: warm.length }));
  memory.close();
  db.close();
}
