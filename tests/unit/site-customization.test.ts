import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { EventBus, makeInvoker, openDb, Repo, type PageService, type Services } from "@aux/runtime";
import { SiteCustomization } from "../../apps/runtime/src/services/site-customization.js";

const cleanup: Array<() => void> = [];
afterEach(() => cleanup.splice(0).forEach((close) => close()));

it("stores Zap rules and site CSS by exact origin and browser Profile", () => {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const personal = new SiteCustomization(db, "personal", () => 1234);
  const work = new SiteCustomization(db, "work", () => 2345);
  const origin = "https://example.com";
  const rule = personal.add(origin, "aside[data-testid=promo]", 2);
  expect(personal.add(origin, rule.selector, 2).ruleId).toBe(rule.ruleId);
  expect(personal.list(origin)).toEqual([rule]);
  expect(work.list(origin)).toEqual([]);
  expect(personal.list("https://other.example.com")).toEqual([]);
  expect(personal.setCss(origin, "main { color: rebeccapurple; }").css).toContain("rebeccapurple");
  expect(personal.effectiveCss(origin)).toBe(
    "aside[data-testid=promo] { display: none !important; }\nmain { color: rebeccapurple; }",
  );
  expect(work.effectiveCss(origin)).toBe("");
  expect(work.remove(rule.ruleId)).toBe(false);
  expect(personal.remove(rule.ruleId)).toBe(true);
  expect(personal.setCss(origin, "").updatedAt).toBeNull();
  expect(personal.effectiveCss(origin)).toBe("");
});

it("persists customization across database reopen and rejects unsafe scope or unbounded selectors", () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-zap-"));
  cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
  const path = join(directory, "customization.sqlite");
  const first = openDb(path);
  const store = new SiteCustomization(first, "profile-a");
  store.add("https://example.com", "nav .promotion", 3);
  store.setCss("https://example.com", ".promotion { opacity: .5; }");
  expect(() => store.add("https://example.com/path", "nav", 1)).toThrow();
  expect(() => store.add("file:///tmp/page", "nav", 1)).toThrow();
  expect(() => store.add("https://example.com", "nav { display: none }", 1)).toThrow();
  expect(() => store.add("https://example.com", "*", 101)).toThrow();
  first.close();
  const reopened = openDb(path);
  cleanup.push(() => reopened.close());
  expect(new SiteCustomization(reopened, "profile-a").effectiveCss("https://example.com")).toContain(
    "nav .promotion { display: none !important; }",
  );
  expect(new SiteCustomization(reopened, "profile-b").getCss("https://example.com").css).toBe("");
});

it("allows only the trusted Profile host to read or change site customization", async () => {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  const pages = {
    get: () => ({ url: "https://example.com/path", documentEpoch: 3 }),
    countZapMatches: async () => 2,
    applyUserCss: async () => ({ applied: true, origin: "https://example.com" }),
  } as unknown as PageService;
  const invoke = makeInvoker({
    repo,
    events: new EventBus(repo),
    pages,
    featureProfileId: "profile-a",
  } as Services);
  const trusted = { external: false };
  await expect(invoke("customization.zap.list", { origin: "https://example.com" })).rejects.toMatchObject({
    code: "permission_denied",
  });
  const rule = (await invoke(
    "customization.zap.add",
    { pageId: "page", expectedDocumentEpoch: 3, origin: "https://example.com", selector: ".promotion" },
    trusted,
  )) as { ruleId: string };
  expect(rule.ruleId).toBeTruthy();
  expect(await invoke("customization.css.effective", { origin: "https://example.com" }, trusted)).toEqual({
    origin: "https://example.com",
    css: ".promotion { display: none !important; }",
  });
  expect(
    await invoke("customization.css.apply", { pageId: "page", expectedDocumentEpoch: 3 }, trusted),
  ).toEqual({ applied: true, origin: "https://example.com" });
});
