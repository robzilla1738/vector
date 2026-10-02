import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { describe, expect, it } from "vitest";
import { EventBus, NullNativeBridge, PageService, Repo, StateService, openDb } from "@aux/runtime";
import { slimObservation, wireObservation } from "../../apps/runtime/src/services/observation-wire";
import { observationEvidence } from "../../apps/runtime/src/services/observation-evidence";
import { conversationSourceFromArtifact } from "../../apps/runtime/src/services/conversation-sources";
import type { BrowserDriver, DriverPage } from "@aux/chromium-driver";
import type { ElementRef, Observation, ObservationContent } from "@aux/contracts";
import { ObservationSchema } from "@aux/contracts";

const el = (ref: string, over: Partial<ElementRef> = {}): ElementRef => ({
  ref, frame: "main", tag: "button", role: "button", name: ref.toUpperCase(),
  selector: { css: `#${ref}`, xpath: `/html/body/button[${ref.slice(1)}]` }, rect: { x: 1, y: 2, w: 3, h: 4 }, ...over,
});
const content = (elements: ElementRef[], text = "hello"): ObservationContent => ({
  url: "https://a.test/", title: "A", viewport: { width: 800, height: 600, scale: 1 }, scroll: { x: 0, y: 0, maxY: 0 },
  frames: [{ frame: "main", url: "https://a.test/", sameOrigin: true }], text, headings: [], elements,
  formFields: [{ ref: "r9", label: "Title", name: "title", type: "text", value: "x", required: true, valid: true }],
  tables: [], links: [{ ref: "r7", text: "Docs", href: "/docs" }], dialogs: [], console: [{ level: "log", message: "m" }],
  truncated: false, stats: { elementsTotal: elements.length, elementsShown: elements.length, textChars: text.length, approxTokens: 1 },
});

describe("wire observation", () => {
  it("retains source evidence without saving control values or selector details", () => {
    const obs: Observation = {
      observationId: "o", pageId: "p", documentEpoch: 3, revision: 4, observedAt: 5, scope: "full",
      content: content([el("r9", { tag: "input", value: "private input", selector: { css: "#private-selector" } })], "Cited page prose"),
    };
    obs.content.formFields[0]!.value = "private input";
    const saved = observationEvidence(obs);
    const json = JSON.stringify(saved);
    expect(json).toContain("Cited page prose");
    expect(json).not.toContain("private input");
    expect(json).not.toContain("private-selector");
    expect(ObservationSchema.safeParse(saved).success).toBe(true);
    expect(conversationSourceFromArtifact({ artifactId: "a", runId: "run", pageId: "p", mediaType: "application/json", status: "complete" } as never, json))
      .toMatchObject({ pageId: "p", url: "https://a.test/", documentEpoch: 3, revision: 4 });
  });

  it("drops selectors, rects, main-frame keys, links, console and duplicated field attributes, and still parses", () => {
    const obs: Observation = {
      observationId: "o", pageId: "p", documentEpoch: 0, revision: 1, observedAt: 1, scope: "full",
      content: content([el("r1"), el("r2", { frame: "f1" }), el("r9", { tag: "input", role: "textbox", name: "Title", value: "x", required: true })]),
    };
    const slim = slimObservation(obs);
    const json = JSON.stringify(slim);
    expect(json).not.toMatch(/"selector"|"rect"|"links"|"console"/);
    expect(JSON.stringify(slim.content.elements)).not.toContain('"frame":"main"');
    expect(slim.content.elements[1]).toMatchObject({ ref: "r2", frame: "f1" });
    expect(slim.content.formFields).toEqual([{ ref: "r9", label: "Title", name: "title", value: "x", valid: true }]);
    const parsed = ObservationSchema.parse(slim);
    expect(parsed.content.elements[0]).toMatchObject({ frame: "main", selector: {} });
    expect(parsed.content.links).toEqual([]);
    expect(JSON.stringify(obs)).toContain('"selector"'); // the internal observation is untouched
  });
});

describe("sinceRevision deltas", () => {
  function harness(beforeObserve?: () => Promise<void>) {
    let current = content([el("r1"), el("r2")]);
    let onNavigated: ((url: string, epoch: number) => void) | undefined;
    const page = {
      identity: { pageId: "p", targetId: "t", backend: "aux" }, url: () => current.url, title: async () => "A", isAttached: () => true,
      navigate: async () => {}, observe: async () => { await beforeObserve?.(); return current; }, setEvents: (e: { onNavigated?: typeof onNavigated }) => { onNavigated = e.onNavigated; },
      dispose: async () => {},
    } as unknown as DriverPage;
    const driver = { backend: "aux", isConnected: () => true, createTarget: async () => "t", attach: async () => page } as unknown as BrowserDriver;
    const repo = new Repo(openDb(":memory:"));
    const pages = new PageService({ turnMentions: fixtureTurnMentions((pageId: string): import("@aux/contracts").PageTarget | undefined => pages.get(pageId)), repo, events: new EventBus(repo), native: new NullNativeBridge(), drivers: () => ({ aux: driver, chrome: null }) });
    return { pages, repo, set: (c: ObservationContent) => { current = c; }, navigated: (epoch: number) => onNavigated?.("https://a.test/next", epoch) };
  }

  it("serves current controls from a live observation and drops them when the page changes", async () => {
    const h = harness();
    const page = await h.pages.open({ url: "about:blank", background: true, ownedByRuntime: true });
    const state = new StateService({ repo: h.repo, pages: h.pages });
    const controls = () => state.query({ entity: "controls", scope: { pageIds: [page.pageId] }, freshness: "current-required", completeness: "partial-allowed" }).rows;
    expect(controls()).toEqual([]);
    await h.pages.observe(page.pageId, {});
    expect(controls()).toMatchObject([{ pageId: page.pageId, label: "Title", value: "x" }]);
    h.repo.flush();
    expect(h.repo.db.prepare("SELECT name FROM sqlite_schema WHERE name='observations'").get()).toBeUndefined();
    h.navigated(page.documentEpoch + 1);
    expect(controls()).toEqual([]);
  });

  it("rejects an observation that finishes after its document navigated", async () => {
    let began!: () => void;
    let release!: () => void;
    const started = new Promise<void>(resolve => { began = resolve; });
    const gate = new Promise<void>(resolve => { release = resolve; });
    let hold = true;
    const h = harness(async () => { if (hold) { hold = false; began(); await gate; } });
    const page = await h.pages.open({ url: "about:blank", background: true, ownedByRuntime: true });
    const pending = h.pages.observe(page.pageId, {});
    await started;
    h.navigated(page.documentEpoch + 1);
    release();
    await expect(pending).rejects.toThrow("changed while it was being observed");
    expect(h.pages.currentObservation(page.pageId)).toBeUndefined();
    expect((await h.pages.observe(page.pageId, {})).content.text).toBe("hello");
  });

  it("reports added, removed and changed refs plus text lines against the caller's revision", async () => {
    // A large enough tree that the small delta stays under half its size —
    // the gate falls back to a full observation when a diff is not cheaper.
    const h = harness();
    const page = await h.pages.open({ url: "about:blank", background: true, ownedByRuntime: true });
    h.set(content(["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10"].map((r) => el(r))));
    const first = await h.pages.observe(page.pageId, {});
    h.set(content([el("r1", { name: "Renamed", focused: true }), ...["r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10", "r11"].map((r) => el(r))], "hello\nnew line"));
    const next = await h.pages.observe(page.pageId, { sinceRevision: first.revision });
    expect(next.delta).toMatchObject({
      sinceRevision: first.revision,
      added: [expect.objectContaining({ ref: "r11" })],
      removed: ["r2"],
      changed: [{ ref: "r1", fields: { name: "Renamed", focused: true } }],
      textDelta: { added: ["new line"], removed: [] },
    });
    expect(JSON.stringify(next.delta)).not.toContain("selector");
    const compact = wireObservation(next, "compact") as { observation: { text: string; refs: { ref: string }[]; sinceRevision?: number } };
    expect(compact.observation.sinceRevision).toBe(first.revision);
    expect(compact.observation.text).toContain("added:\n  r11 button");
    expect(compact.observation.text).toContain("removed: r2");
    expect(compact.observation.refs.map((r) => r.ref)).not.toContain("r2");
  });

  it("returns a full observation (no delta) after a navigation or when the base aged out", async () => {
    const h = harness();
    const page = await h.pages.open({ url: "about:blank", background: true, ownedByRuntime: true });
    const first = await h.pages.observe(page.pageId, {});
    h.navigated(1);
    const after = await h.pages.observe(page.pageId, { sinceRevision: first.revision });
    expect(after.delta).toBeUndefined();
    expect(after.content.elements).toHaveLength(2);
    expect((await h.pages.observe(page.pageId, { sinceRevision: 999 })).delta).toBeUndefined();
  });
});
