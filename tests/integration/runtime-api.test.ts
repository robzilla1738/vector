/**
 * Integration: standalone runtime (headless system Chrome) against the
 * fixture servers. Verifies observe → execute → persisted truth.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startRuntime, type RuntimeHandle } from "@vector/runtime";
import type { ObservationContent, PageTarget, ProgramResult, ResultRecord, Run } from "@vector/contracts";
import { startFixturesIfNeeded, waitForFixtures, FIXTURES } from "../../scripts/fixtures.mjs";
import type { ChildProcess } from "node:child_process";

const RECORDS = "http://127.0.0.1:4810";

let rt: RuntimeHandle;
let procs: ChildProcess[];
let dataDir: string;

const invoke = <T>(m: string, p?: unknown) => rt.invoke(m, p ?? {}) as Promise<T>;

async function fixtureState(): Promise<{ edits: { fields: Record<string, string> }[]; downloads: { file: string }[]; records: { id: string; title: string }[] }> {
  const r = await fetch(`${RECORDS}/api/state`);
  return (await r.json()) as never;
}

beforeAll(async () => {
  procs = await startFixturesIfNeeded();
  await waitForFixtures();
  dataDir = mkdtempSync(join(tmpdir(), "vector-it-"));
  rt = await startRuntime({
    ...process.env,
    VECTOR_DATA_DIR: dataDir,
    VECTOR_ELECTRON_CDP: "",
    VECTOR_API_TOKEN: "test-token",
  });
}, 60_000);

afterAll(async () => {
  await rt.close();
  procs.forEach((p) => p.kill());
});

describe("pages", () => {
  it("opens, observes, and executes against the records fixture", async () => {
    const page = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/records`, background: true });
    expect(page.pageId).toBeTruthy();
    expect(page.backend).toBe("vector");

    const obs = await invoke<{ content: ObservationContent; revision: number; documentEpoch: number }>("pages.observe", { pageId: page.pageId });
    expect(obs.content.url).toContain("/records");
    expect(obs.revision).toBeGreaterThan(0);
    expect(obs.content.elements.length).toBeGreaterThan(3);
    expect(obs.content.tables.length).toBeGreaterThanOrEqual(1);
    const applyRef = obs.content.elements.find((e) => /apply filter/i.test(e.name ?? "") || /apply-filter/.test(e.selector.css ?? ""));
    expect(applyRef, "filter button ref").toBeTruthy();

    // execute a typed program: filter to "approved" and extract titles
    const res = await invoke<ProgramResult>("pages.execute", {
      program: {
        pageId: page.pageId,
        steps: [
          { id: "s1", op: "select", target: "css:#status", value: "approved" },
          { id: "s2", op: "click", target: "css:#apply-filter" },
          { id: "s3", op: "waitFor", condition: { kind: "urlMatches", pattern: "status=approved" } },
          { id: "s4", op: "extract", fields: [{ name: "count", selector: "p.muted" }], as: "out" },
        ],
      },
    });
    expect(res.status).toBe("completed");
    expect(res.steps.map((s) => s.status)).toEqual(["ok", "ok", "ok", "ok"]);
    const out = (res.extracted?.out ?? {}) as { count?: string };
    expect(String(out.count ?? "")).toContain("records");

    // same-url distinct identity
    const p2 = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/records`, background: true });
    expect(p2.pageId).not.toBe(page.pageId);
    expect(p2.targetId).not.toBe(page.targetId);

    const list = await invoke<PageTarget[]>("pages.list");
    expect(list.filter((p) => p.url.includes("/records")).length).toBeGreaterThanOrEqual(2);
  }, 60_000);

  it("edits a record through the UI and the server records the truth", async () => {
    const page = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/records/rec-03`, background: true });
    const before = await fixtureState();
    const res = await invoke<ProgramResult>("pages.execute", {
      program: {
        pageId: page.pageId,
        steps: [
          { id: "s1", op: "click", target: "css:#edit-record" },
          { id: "s2", op: "fill", target: "css:#f-title", value: "Edited by Vector" },
          { id: "s3", op: "click", target: "css:#save-record" },
          { id: "s4", op: "waitFor", condition: { kind: "urlMatches", pattern: "saved=1" } },
        ],
      },
    });
    expect(res.status, JSON.stringify(res.steps.at(-1))).toBe("completed");
    const after = await fixtureState();
    const edit = after.edits.find((e) => e.fields.title === "Edited by Vector");
    expect(edit, "server saw the save").toBeTruthy();
    expect(after.records.find((r) => r.id === "rec-03")?.title).toBe("Edited by Vector");
    expect(before.edits.length).toBeLessThan(after.edits.length);
  }, 60_000);

  it("captures screenshots and stores artifacts", async () => {
    const page = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/records`, background: true });
    const shot = await invoke<{ dataUrl?: string; artifactId?: string; width: number }>("pages.capture", {
      pageId: page.pageId,
      format: "artifact",
    });
    expect(shot.artifactId).toBeTruthy();
    const list = await invoke<{ artifactId: string; mediaType: string }[]>("artifacts.list", { pageId: page.pageId });
    expect(list.some((a) => a.artifactId === shot.artifactId)).toBe(true);
    const read = await invoke<{ dataBase64: string; artifact: { mediaType: string } }>("artifacts.read", { artifactId: shot.artifactId });
    expect(read.dataBase64.length).toBeGreaterThan(100);
  }, 60_000);

  it("reference invalidation: stale refs fail after navigation", async () => {
    const page = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/records`, background: true });
    const obs = await invoke<{ content: ObservationContent }>("pages.observe", { pageId: page.pageId });
    const anyRef = obs.content.elements[0]?.ref;
    expect(anyRef).toBeTruthy();
    await invoke("pages.navigate", { pageId: page.pageId, url: `${RECORDS}/new` });
    const res = await invoke<ProgramResult>("pages.execute", {
      program: { pageId: page.pageId, steps: [{ id: "s1", op: "click", target: anyRef! }] },
    });
    // stale ref must not silently click the wrong element
    expect(res.status).toBe("failed");
  }, 60_000);

  it("collectScroll accumulates a virtualized list beyond the viewport", async () => {
    const page = await invoke<PageTarget>("pages.open", { url: "http://127.0.0.1:4812/", background: true });
    // the vlist renders ~17 rows at a time — a static extract would see only those
    const res = await invoke<ProgramResult>("pages.execute", {
      program: {
        pageId: page.pageId,
        steps: [{
          id: "c1",
          op: "collectScroll",
          item: ".vrow",
          container: "#vlist",
          key: "data-key",
          limit: 60,
          as: "rows",
        }],
      },
    });
    expect(res.status).toBe("completed");
    const rows = (res.extracted?.rows as { items: { text: string }[]; count: number }).items;
    expect(rows.length).toBeGreaterThanOrEqual(60);
    const keys = new Set(rows.map((r) => r.text.split(" ")[0]));
    expect(keys.size).toBe(rows.length); // deduped, all unique
  }, 60_000);

  it("collectScroll follows an infinite scroller to its end", async () => {
    const page = await invoke<PageTarget>("pages.open", { url: "http://127.0.0.1:4812/", background: true });
    const res = await invoke<ProgramResult>("pages.execute", {
      program: {
        pageId: page.pageId,
        steps: [{
          id: "c1",
          op: "collectScroll",
          item: ".irow",
          container: "#infinite",
          key: "data-key",
          settleMs: 250, // fixture loads batches with ~120ms latency
          as: "rows",
        }],
      },
    });
    expect(res.status).toBe("completed");
    const out = res.extracted?.rows as { items: { text: string }[]; count: number };
    expect(out.count).toBe(120); // the fixture's fixed total
  }, 60_000);
});
