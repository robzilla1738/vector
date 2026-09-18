/**
 * Integration: the Vector Engine backend end to end (architecture §11).
 *
 *   1. engineMode "always" — a static fixture page opens on `vector-engine`,
 *      the observation is a real ObservationContent with `r<n>` refs, and a
 *      select/click/fill program runs as ONE native call (act-and-observe).
 *   2. engineMode "auto" — a mid-program `capability_unsupported` (`xpath:`
 *      targets) migrates the page to Chromium,
 *      replays the selector-targeted remainder, records the origin in the
 *      needs-chromium table, and the next open of that origin skips the
 *      engine. Skipped with a reason when no Chromium can be launched.
 *
 * The whole file is skipped (with the loader's diagnostic) when the native
 * addon has not been built: `cd engine && cargo build -p ve-napi --features napi --release`.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startRuntime, type RuntimeHandle } from "@vector/runtime";
import { probeEngineNative } from "@vector/browser-driver";
import type { Observation, ObservationContent, PageTarget, ProgramResult } from "@vector/contracts";
import { startFixturesIfNeeded, waitForFixtures } from "../../scripts/fixtures.mjs";
import { findChromium } from "../../scripts/chromium.mjs";
import type { ChildProcess } from "node:child_process";

const RECORDS = "http://127.0.0.1:4810";

const engine = await probeEngineNative();
const chromium = findChromium();
// the standalone driver reads the real process env for the browser path
if (chromium) process.env.VECTOR_BROWSER_PATH = chromium;
// CI sets VECTOR_REQUIRE_ENGINE=1 so a missing addon fails the job instead of
// silently skipping every engine assertion.
if (!engine.available && process.env.VECTOR_REQUIRE_ENGINE === "1")
  throw new Error(`[vector-engine.test] VECTOR_REQUIRE_ENGINE=1 but the addon did not load: ${engine.error}`);
if (!engine.available) console.warn(`[vector-engine.test] skipped: ${engine.error}`);
if (!chromium) console.warn("[vector-engine.test] fallback test skipped: no Chromium (set VECTOR_BROWSER_PATH or `pnpm exec playwright install chromium-headless-shell`)");

const describeIfEngine = engine.available ? describe : describe.skip;
const itIfChromium = chromium ? it : it.skip;

let rt: RuntimeHandle;
let procs: ChildProcess[] = [];
const invoke = <T>(m: string, p?: unknown) => rt.invoke(m, p ?? {}) as Promise<T>;

const OBSERVATION_KEYS = ["url", "title", "viewport", "scroll", "frames", "text", "headings", "elements", "formFields", "tables", "links", "dialogs", "truncated", "stats"];

describeIfEngine("vector-engine backend", () => {
  beforeAll(async () => {
    procs = await startFixturesIfNeeded();
    await waitForFixtures();
    rt = await startRuntime({
      ...process.env,
      VECTOR_DATA_DIR: mkdtempSync(join(tmpdir(), "vector-engine-it-")),
      VECTOR_ELECTRON_CDP: "",
      VECTOR_API_TOKEN: "test-token",
      VECTOR_ENGINE_MODE: "always",
    });
  }, 60_000);

  afterAll(async () => {
    await rt?.close();
    procs.forEach((p) => p.kill());
  });

  it("runtime.describe reports the engine", async () => {
    const d = await invoke<{
      engine: {
        available: boolean;
        version?: string;
        mode: string;
        connected: boolean;
        securityProfile?: string;
        isolation?: string;
        hostPath?: string;
      };
    }>("runtime.describe");
    expect(d.engine.available).toBe(true);
    expect(d.engine.connected).toBe(true);
    expect(d.engine.version).toBe(engine.version);
    expect(d.engine.mode).toBe("always");
    if (process.env.VECTOR_ENGINE_PROFILE === "production" || process.env.VECTOR_ENGINE_PROFILE === "prod") {
      expect(d.engine.securityProfile).toBe("production");
      expect(d.engine.isolation).toBe("process");
      expect(d.engine.hostPath, JSON.stringify(d.engine)).toMatch(/ve-host/);
    }
  });

  it("always: opens a static fixture on the engine, observes refs, runs a program in one native call", async () => {
    const page = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/records`, background: true });
    expect(page.backend).toBe("vector-engine");
    // developer always-mode: engine-always. production fail-closed: native-only.
    expect(["engine-always", "native-only"]).toContain(page.routeReason);
    expect(page.targetId).toMatch(/^ve-\d+-\d+$/);

    const obs = await invoke<Observation>("pages.observe", { pageId: page.pageId });
    for (const k of OBSERVATION_KEYS) expect(obs.content, `ObservationContent.${k}`).toHaveProperty(k);
    expect(obs.content.url).toContain("/records");
    expect(obs.revision).toBeGreaterThan(0);
    expect(obs.content.elements.length).toBeGreaterThan(3);
    expect(obs.content.tables.length).toBeGreaterThanOrEqual(1);
    for (const e of obs.content.elements) expect(e.ref).toMatch(/^r\d+$/);
    expect(obs.content.formFields.length).toBeGreaterThan(0);
    const epochBefore = obs.documentEpoch;

    // select + click (GET form submission → navigation) + waitFor + extract, act-and-observe
    const res = await invoke<ProgramResult & { observation?: Observation }>("pages.execute", {
      program: {
        pageId: page.pageId,
        steps: [
          { id: "s1", op: "select", target: "css:#status", value: "approved" },
          { id: "s2", op: "click", target: "css:#apply-filter" },
          { id: "s3", op: "waitFor", condition: { kind: "urlMatches", pattern: "status=approved" } },
          { id: "s4", op: "extract", fields: [{ name: "count", selector: "p.muted" }], as: "out" },
        ],
      },
      returnObservation: { format: "full" },
    });
    expect(res.status, JSON.stringify(res.steps)).toBe("completed");
    expect(res.steps.map((s) => s.status)).toEqual(["ok", "ok", "ok", "ok"]);
    expect(String((res.extracted?.out as { count?: string })?.count ?? "")).toContain("records");
    expect(res.observation?.content.url).toContain("status=approved");
    expect(res.observation?.pageId).toBe(page.pageId);
    // navigation bumped the engine generation → documentEpoch
    expect(res.observation!.documentEpoch).toBeGreaterThan(epochBefore);
    const after = (await invoke<PageTarget[]>("pages.list")).find((p) => p.pageId === page.pageId);
    expect(after?.url).toContain("status=approved");

    // fill via an observation ref
    await invoke("pages.navigate", { pageId: page.pageId, url: `${RECORDS}/new` });
    const form = await invoke<Observation>("pages.observe", { pageId: page.pageId, scope: "forms" });
    const title = form.content.formFields.find((f) => /title/i.test(f.label ?? f.name ?? ""));
    expect(title?.ref, "title field ref").toMatch(/^r\d+$/);
    const filled = await invoke<ProgramResult>("pages.execute", {
      program: {
        pageId: page.pageId,
        steps: [
          { id: "f1", op: "fill", target: title!.ref, value: "Engine title" },
          { id: "f2", op: "extract", fields: [{ name: "v", selector: "#n-title", attribute: "value" }], as: "out" },
        ],
      },
    });
    expect(filled.status, JSON.stringify(filled.steps)).toBe("completed");
    expect((filled.extracted?.out as { v?: string })?.v).toBe("Engine title");

    const shot = await invoke<{ width: number; height: number; dataUrl?: string }>("pages.capture", { pageId: page.pageId });
    expect(shot.width).toBeGreaterThan(0);
    expect(shot.height).toBeGreaterThan(0);
    expect(shot.dataUrl?.startsWith("data:image/png")).toBe(true);
    await invoke("pages.close", { pageId: page.pageId });
  }, 60_000);

  itIfChromium("auto: a mid-program capability_unsupported falls back to Chromium and records the origin", async () => {
    await invoke("settings.set", { engineMode: "auto" });
    const page = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/records`, background: true });
    expect(page.backend).toBe("vector-engine");
    expect(page.routeReason).toBe("hybrid:engine-first");

    const res = await invoke<ProgramResult>("pages.execute", {
      program: {
        pageId: page.pageId,
        steps: [
          { id: "s1", op: "select", target: "css:#status", value: "approved" },
          { id: "s2", op: "click", target: "xpath://button" },
          { id: "s3", op: "click", target: "css:#apply-filter" },
          { id: "s4", op: "waitFor", condition: { kind: "urlMatches", pattern: "/records\\?" } },
        ],
      },
    });
    expect(res.fallback, JSON.stringify(res)).toMatchObject({ from: "vector-engine", to: "vector", replayedFrom: 1, repair: false });
    expect(res.status, JSON.stringify(res.steps)).toBe("completed");
    expect(res.steps.map((s) => s.stepId)).toEqual(["s1", "s2", "s3", "s4"]);
    const moved = (await invoke<PageTarget[]>("pages.list")).find((p) => p.pageId === page.pageId);
    expect(moved?.backend).toBe("vector");
    expect(moved?.routeReason).toMatch(/^fallback:/);

    // the origin is now Chromium-only for the TTL
    const next = await invoke<PageTarget>("pages.open", { url: `${RECORDS}/records/rec-01`, background: true });
    expect(next.backend).toBe("vector");
    expect(next.routeReason).toMatch(/^needs-chromium-table:/);
    const d = await invoke<{ engine: { needsChromiumOrigins: number } }>("runtime.describe");
    expect(d.engine.needsChromiumOrigins).toBe(1);
  }, 90_000);
});

// keep vitest happy when the addon is missing (a file with zero tests fails the run)
if (!engine.available) it.skip(`vector-engine addon not built: ${engine.error?.split("\n")[0]}`, () => {});
