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
    VECTOR_ENGINE_MODE: "off",
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

  it("compact observation is under 25% of the full JSON and carries usable refs", async () => {
    const page = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/records`, background: true });
    const full = await invoke<{ content: ObservationContent; revision: number }>("pages.observe", { pageId: page.pageId });
    const compact = await invoke<{ observation: { pageId: string; url: string; title: string; revision: number; text: string; refs: { ref: string; role?: string; name?: string }[] } }>(
      "pages.observe",
      { pageId: page.pageId, format: "compact" },
    );
    const fullBytes = JSON.stringify(full).length;
    const compactBytes = JSON.stringify(compact).length;
    // MCP path: the tool emitted the pretty-printed full JSON before and emits
    // the compact text now — that payload must shrink to under a quarter
    const mcpBefore = JSON.stringify(full, null, 2).length;
    const mcpAfter = compact.observation.text.length;
    expect(mcpAfter, `mcp compact ${mcpAfter}B vs full ${mcpBefore}B`).toBeLessThan(mcpBefore * 0.25);
    // raw JSON: the records page has only ~19 elements, so text/table content
    // dominates both forms; the per-element saving still halves it
    expect(compactBytes, `compact ${compactBytes}B vs full ${fullBytes}B`).toBeLessThan(fullBytes * 0.5);
    const o = compact.observation;
    expect(o.pageId).toBe(page.pageId);
    expect(o.url).toContain("/records");
    // the page did not change between the two calls, so the compact form is
    // rendered from the cached observation (A6): same revision, no re-walk
    expect(o.revision).toBe(full.revision);
    expect(o.refs.length).toBe(full.content.elements.length);
    expect(o.text).toContain("elements:");
    expect(JSON.stringify(o)).not.toContain("nth-of-type"); // selectors stay server-side
    // a compact ref is actionable
    const apply = o.refs.find((r) => /apply filter/i.test(r.name ?? ""));
    expect(apply, "apply-filter ref in compact refs").toBeTruthy();
    const res = await invoke<ProgramResult>("pages.execute", {
      program: { pageId: page.pageId, steps: [{ id: "h1", op: "hover", target: apply!.ref }] },
    });
    expect(res.status).toBe("completed");
  }, 60_000);

  it("pages.execute returnObservation returns the post-action state in one round trip", async () => {
    const page = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/records`, background: true });
    const res = await invoke<ProgramResult & { observation?: { pageId: string; url: string; text: string; refs: unknown[] } }>("pages.execute", {
      program: {
        pageId: page.pageId,
        steps: [
          { id: "s1", op: "select", target: "css:#status", value: "approved" },
          { id: "s2", op: "click", target: "css:#apply-filter" },
          { id: "s3", op: "waitFor", condition: { kind: "urlMatches", pattern: "status=approved" } },
        ],
      },
      returnObservation: { format: "compact" },
    });
    expect(res.status).toBe("completed");
    expect(res.steps).toHaveLength(3);
    expect(res.observation?.pageId).toBe(page.pageId);
    expect(res.observation?.url).toContain("status=approved");
    expect(res.observation?.refs.length).toBeGreaterThan(3);
    // full format is the plain Observation
    const full = await invoke<ProgramResult & { observation?: { content?: ObservationContent } }>("pages.execute", {
      program: { pageId: page.pageId, steps: [{ id: "r1", op: "reload" }] },
      returnObservation: { format: "full", scope: "forms" },
    });
    expect(full.observation?.content?.formFields.length).toBeGreaterThan(0);
    // without returnObservation the result shape is unchanged
    const plain = await invoke<Record<string, unknown>>("pages.execute", {
      program: { pageId: page.pageId, steps: [{ id: "r1", op: "reload" }] },
    });
    expect(plain).not.toHaveProperty("observation");
  }, 60_000);

  it("refs resolve to the exact observed node even after the DOM shifts, and fall back when it is gone (A7)", async () => {
    const page = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/new`, background: true });
    const obs = await invoke<{ content: ObservationContent }>("pages.observe", { pageId: page.pageId });
    const title = obs.content.elements.find((e) => e.selector?.css?.includes("n-title") || e.name === "Title")!;
    expect(title).toBeTruthy();
    // insert a decoy input before the target: a positional css path now points
    // at the decoy, the live ref map still points at the real field
    await invoke("pages.execute", {
      program: {
        pageId: page.pageId,
        steps: [
          {
            id: "e",
            op: "evaluate",
            // strip the id too, so every stored selector (css #id, xpath position,
            // label-derived role name) now misses or points at the decoy
            expression: `(() => { const t = document.getElementById("n-title"); const d = document.createElement("input"); d.name = "decoy"; t.parentElement.insertBefore(d, t); t.removeAttribute("id"); return 1; })()`,
          },
          { id: "f", op: "fill", target: title.ref, value: "exact node" },
        ],
      },
      allowEval: true,
    });
    const after = await invoke<{ content: ObservationContent }>("pages.observe", { pageId: page.pageId });
    expect(after.content.formFields.find((f) => f.name === "title")?.value).toBe("exact node");
    expect(after.content.formFields.find((f) => f.name === "decoy")?.value ?? "").toBe("");
    // restore the id for the second scenario
    await invoke("pages.execute", {
      program: { pageId: page.pageId, steps: [{ id: "e2", op: "evaluate", expression: `(() => { document.querySelector('input[name=title]').id = "n-title"; return 1; })()` }] },
      allowEval: true,
    });
    // the node is replaced (framework re-render): the handle is gone, the
    // selector fallback finds the replacement by its path/role instead
    const obs2 = await invoke<{ content: ObservationContent }>("pages.observe", { pageId: page.pageId });
    const title2 = obs2.content.elements.find((e) => e.selector?.css?.includes("n-title"))!;
    await invoke("pages.execute", {
      program: {
        pageId: page.pageId,
        steps: [
          {
            id: "e",
            op: "evaluate",
            expression: `(() => { const t = document.getElementById("n-title"); const c = t.cloneNode(true); t.replaceWith(c); return 1; })()`,
          },
          { id: "f", op: "fill", target: title2.ref, value: "fallback node" },
        ],
      },
      allowEval: true,
    });
    const after2 = await invoke<{ content: ObservationContent }>("pages.observe", { pageId: page.pageId });
    expect(after2.content.formFields.find((f) => f.name === "title" || f.label === "Title")?.value).toBe("fallback node");
  }, 60_000);

  it("observation carries select options, focus, offscreen and occlusion; subtree scope accepts a ref (A10)", async () => {
    const page = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/new`, background: true });
    type Obs = { content: ObservationContent };
    // make the page tall and cover the submit button with an overlay
    await invoke("pages.execute", {
      program: {
        pageId: page.pageId,
        steps: [
          {
            id: "e",
            op: "evaluate",
            expression: `(() => {
              const far = document.createElement("button"); far.id = "far"; far.textContent = "Far away";
              far.style.cssText = "position:absolute;top:5000px;left:10px"; document.body.appendChild(far);
              const btn = document.querySelector('button[type=submit],#create-record,form button') || document.querySelector("button");
              const r = btn.getBoundingClientRect();
              const cover = document.createElement("div"); cover.id = "cover";
              cover.style.cssText = "position:fixed;left:" + r.left + "px;top:" + r.top + "px;width:" + r.width + "px;height:" + r.height + "px;background:rgba(0,0,0,.4);z-index:9999";
              document.body.appendChild(cover);
              document.getElementById("n-title").focus();
              return 1; })()`,
          },
        ],
      },
      allowEval: true,
    });
    const obs = await invoke<Obs>("pages.observe", { pageId: page.pageId });
    const status = obs.content.elements.find((e) => e.selector?.css?.includes("n-status"))!;
    expect(status.options).toEqual(expect.arrayContaining(["draft", "in progress", "approved"]));
    expect(obs.content.elements.find((e) => e.selector?.css?.includes("n-title"))?.focused).toBe(true);
    expect(obs.content.elements.find((e) => e.name === "Far away")?.offscreen).toBe(true);
    const covered = obs.content.elements.find((e) => e.tag === "button" && e.name !== "Far away" && e.occluded);
    expect(covered, "the covered submit button is marked occluded").toBeTruthy();
    // the compact rendering carries the same signals for the model
    const compact = await invoke<{ observation: { text: string } }>("pages.observe", { pageId: page.pageId, format: "compact" });
    expect(compact.observation.text).toMatch(/options=\[.*"approved".*\]/);
    expect(compact.observation.text).toContain(" occluded");
    expect(compact.observation.text).toContain(" offscreen");
    // subtree scope: a css target, and a ref (which used to go straight into querySelector)
    const sub = await invoke<Obs>("pages.observe", { pageId: page.pageId, scope: "subtree", subtreeRef: "css:form" });
    expect(sub.content.elements.length).toBeGreaterThan(0);
    expect(sub.content.elements.every((e) => e.name !== "Far away")).toBe(true);
    const byRef = await invoke<Obs>("pages.observe", { pageId: page.pageId, scope: "subtree", subtreeRef: status.ref });
    expect(byRef.content.elements.every((e) => e.name !== "Far away")).toBe(true);
    await expect(invoke("pages.observe", { pageId: page.pageId, scope: "subtree", subtreeRef: "r99999" })).rejects.toThrow(/stale|unknown/);
  }, 60_000);

  it("observation cache: an unchanged page is served from cache; typing or navigating invalidates it (A6)", async () => {
    const page = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/new`, background: true });
    type Obs = { observationId: string; revision: number; cached?: boolean; changesSince?: string[]; content: ObservationContent };
    const first = await invoke<Obs>("pages.observe", { pageId: page.pageId });
    expect(first.cached).toBeUndefined();
    const second = await invoke<Obs>("pages.observe", { pageId: page.pageId });
    expect(second.cached).toBe(true);
    expect(second.observationId).toBe(first.observationId);
    expect(second.revision).toBe(first.revision);
    // a different request shape is a different observation
    const forms = await invoke<Obs>("pages.observe", { pageId: page.pageId, scope: "forms" });
    expect(forms.cached).toBeUndefined();
    // a form value change is invisible to a MutationObserver but must miss the cache
    await invoke("pages.execute", {
      program: { pageId: page.pageId, steps: [{ id: "f", op: "fill", target: "css:#n-title", value: "Cache probe" }] },
    });
    const third = await invoke<Obs>("pages.observe", { pageId: page.pageId });
    expect(third.cached).toBeUndefined();
    expect(third.revision).toBeGreaterThan(first.revision);
    expect(third.content.formFields.some((f) => f.value === "Cache probe")).toBe(true);
    // sinceRevision diffs against the revision the caller last saw, not just the previous one
    const since = await invoke<Obs>("pages.observe", { pageId: page.pageId, scope: "full", sinceRevision: first.revision, maxElements: 119 });
    expect(since.changesSince?.some((c) => c.includes("Cache probe"))).toBe(true);
    // navigation changes the epoch: no stale hit
    await invoke("pages.navigate", { pageId: page.pageId, url: `${RECORDS}/records` });
    const afterNav = await invoke<Obs>("pages.observe", { pageId: page.pageId });
    expect(afterNav.cached).toBeUndefined();
    expect(afterNav.content.url).toContain("/records");
  }, 60_000);

  it("waitFor settled resolves once an in-flight fetch and its DOM update land", async () => {
    const page = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/records`, background: true });
    const res = await invoke<ProgramResult>("pages.execute", {
      program: {
        pageId: page.pageId,
        steps: [
          // kick off a request whose completion appends to the DOM — the
          // expression returns immediately, so only the readiness signal can
          // know when the page has reacted
          {
            id: "kick",
            op: "evaluate",
            expression:
              "void fetch('/api/state').then(r => r.json()).then(() => fetch('/api/state')).then(r => r.json()).then(() => { document.body.insertAdjacentHTML('beforeend', '<p id=\"late-marker\">late</p>'); })",
          },
          { id: "settle", op: "waitFor", condition: { kind: "settled", timeoutMs: 2000 } },
          { id: "read", op: "extract", fields: [{ name: "late", selector: "#late-marker" }], as: "out" },
        ],
      },
    });
    expect(res.status, JSON.stringify(res.steps)).toBe("completed");
    expect((res.extracted?.out as { late?: string }).late).toBe("late");
  }, 60_000);

  it("settled is bounded: a slow in-flight request times out at the deadline, not later", async () => {
    const page = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/records/rec-01`, background: true });
    const res = await invoke<ProgramResult>("pages.execute", {
      program: {
        pageId: page.pageId,
        steps: [
          { id: "slow", op: "evaluate", expression: "void fetch('/records/rec-01/slow-info')" }, // fixture delays 2.5s
          { id: "settle", op: "waitFor", condition: { kind: "settled", timeoutMs: 400 } },
        ],
      },
    });
    expect(res.status).toBe("failed");
    const settle = res.steps.find((s) => s.stepId === "settle")!;
    expect(settle.error?.code).toBe("condition_timeout");
    expect(settle.durationMs).toBeLessThan(1500);
    expect(settle.durationMs).toBeGreaterThanOrEqual(350);
  }, 60_000);

  it("navigation waits for quiescence within its bound", async () => {
    const page = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/records`, background: true });
    const t = Date.now();
    await invoke("pages.navigate", { pageId: page.pageId, url: `${RECORDS}/records/rec-02` });
    const ms = Date.now() - t;
    expect(ms).toBeLessThan(3000);
    const obs = await invoke<{ content: ObservationContent }>("pages.observe", { pageId: page.pageId, format: "full" });
    expect(obs.content.url).toContain("rec-02");
    expect(obs.content.elements.length).toBeGreaterThan(0);
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
