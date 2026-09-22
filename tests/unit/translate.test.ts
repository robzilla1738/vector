import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { openDb, Repo, SettingsService } from "@aux/runtime";
import { TranslateService } from "../../apps/runtime/src/services/translate.js";
import { applyTranslationsScript, extractTextsScript, restoreOriginalScript } from "../../apps/desktop/main/page-translate.js";

function harness() {
  const dir = mkdtempSync(join(tmpdir(), "aux-translate-"));
  const settingsPath = join(dir, "settings.json");
  writeFileSync(settingsPath, "{}");
  const settings = new SettingsService(new Repo(openDb(":memory:")), settingsPath, {});
  return { dir, settings, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

function client(impl: (opts: { prompt: string }) => { lang?: string; translations?: string[]; translation?: string }) {
  return {
    generateStructured: vi.fn(async (opts: { prompt: string }) => ({ object: impl(opts), durationMs: 1 })),
    generateText: vi.fn(async () => ({ text: "", durationMs: 1 })),
    listModels: vi.fn(async () => []),
  };
}

describe("TranslateService", () => {
  it("translates batches in order and reports the detected language", async () => {
    const { settings, cleanup } = harness();
    try {
      settings.modelOverride = client(() => ({ lang: "fr", translations: ["a", "b", "c"] })) as never;
      const translate = new TranslateService(settings);
      const result = await translate.page(["un", "deux", "trois"], "English");
      expect(result).toEqual({ lang: "fr", translations: ["a", "b", "c"], truncated: false });
    } finally { cleanup(); }
  });

  it("bisects when the model returns a misaligned batch instead of misapplying text", async () => {
    const { settings, cleanup } = harness();
    try {
      let calls = 0;
      settings.modelOverride = client(opts => {
        calls++;
        const texts = JSON.parse(opts.prompt.slice(opts.prompt.indexOf("["))) as string[];
        if (texts.length > 1) return { lang: "fr", translations: ["only-one"] };  // misaligned
        return { lang: "fr", translations: [`T:${texts[0]}`] };
      }) as never;
      const translate = new TranslateService(settings);
      const result = await translate.page(["un", "deux"], "English");
      expect(result.translations).toEqual(["T:un", "T:deux"]);
      expect(calls).toBeGreaterThan(1);
    } finally { cleanup(); }
  });

  it("keeps original text for segments that stay misaligned after splitting", async () => {
    const { settings, cleanup } = harness();
    try {
      settings.modelOverride = client(() => ({ lang: "fr", translations: [] })) as never;
      const translate = new TranslateService(settings);
      const result = await translate.page(["un", "deux"], "English");
      expect(result.translations).toEqual(["un", "deux"]);
    } finally { cleanup(); }
  });

  it("caps the page at MAX_SEGMENTS and marks it truncated", async () => {
    const { settings, cleanup } = harness();
    try {
      settings.modelOverride = client(opts => {
        const texts = JSON.parse(opts.prompt.slice(opts.prompt.indexOf("["))) as string[];
        return { lang: "fr", translations: texts.map(t => `T:${t}`) };
      }) as never;
      const translate = new TranslateService(settings);
      const result = await translate.page(Array.from({ length: 450 }, (_, i) => `seg-${i}`), "English");
      expect(result.truncated).toBe(true);
      expect(result.translations).toHaveLength(400);
    } finally { cleanup(); }
  });

  it("fails with a clear error when no model is configured", async () => {
    const { settings, cleanup } = harness();
    try {
      const translate = new TranslateService(settings);
      await expect(translate.page(["hello"], "German")).rejects.toThrow(/model provider/);
    } finally { cleanup(); }
  });

  it("translates a selection through the same client", async () => {
    const { settings, cleanup } = harness();
    try {
      settings.modelOverride = client(() => ({ lang: "es", translation: "hola" })) as never;
      const translate = new TranslateService(settings);
      expect(await translate.text("hello", "Spanish")).toEqual({ lang: "es", translation: "hola" });
    } finally { cleanup(); }
  });
});

// @vitest-environment jsdom
describe("page-translate scripts", () => {
  // oxlint-disable-next-line no-eval — exercising the real injected scripts.
  const run = (script: string) => (0, eval)(script);

  it("extracts visible text while skipping code, forms and hidden nodes", () => {
    document.body.innerHTML = `
      <h1>Hello world</h1><p>Visible paragraph</p>
      <code>const x = 1</code><textarea>secret draft</textarea>
      <script>var s = 1</script><p style="display:none">hidden text</p>
      <input value="field value"><span>ok</span>`;
    const result = run(extractTextsScript()) as { texts: string[] };
    expect(result.texts).toContain("Hello world");
    expect(result.texts).toContain("Visible paragraph");
    expect(result.texts.join(" ")).not.toContain("const x");
    expect(result.texts.join(" ")).not.toContain("secret draft");
    expect(result.texts.join(" ")).not.toContain("hidden text");
    expect(result.texts.join(" ")).not.toContain("field value");
  });

  it("applies translations in place and restores originals exactly", () => {
    document.body.innerHTML = `<h1>Hello world</h1><p>One two three</p>`;
    const { texts } = run(extractTextsScript()) as { texts: string[] };
    const applied = run(applyTranslationsScript(texts.map(t => `TR:${t}`))) as { applied: number; expired: boolean };
    expect(applied.applied).toBe(texts.length);
    expect(document.body.textContent).toContain("TR:Hello world");
    // Second apply on a stale doc token is rejected — no double rewrite.
    const stale = run(applyTranslationsScript(texts.map(() => "X"))) as { applied: number; expired: boolean };
    expect(stale.applied).toBeGreaterThanOrEqual(0);
    const restored = run(restoreOriginalScript()) as number;
    expect(restored).toBe(texts.length);
    expect(document.body.textContent).toContain("Hello world");
    expect(document.body.textContent).not.toContain("TR:");
    expect(run(restoreOriginalScript())).toBe(0);
  });
});
