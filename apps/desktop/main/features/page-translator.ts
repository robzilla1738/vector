import { type WebContents, app } from "electron";
import { applyTranslationsScript, extractTextsScript, restoreOriginalScript, translateBubbleScript } from "../page-translate.js";

/** Locale-appropriate label for the model prompt, e.g. "English". */
export function translateTargetLabel(): string {
  const locale = app.getLocale() || "en";
  try { return new Intl.DisplayNames([locale], { type: "language" }).of(locale.split("-")[0]!) ?? "English"; }
  catch { return "English"; }
}

/**
 * Explicit page/selection translation through the configured model, shared by
 * regular and private windows. Page text only travels to `invoke` and is never
 * persisted; each process supplies its own page lookup and model route.
 */
export function createPageTranslator(o: {
  contents(pageId: string): WebContents | undefined;
  invoke<T>(method: "translate.page" | "translate.text", params: Record<string, unknown>): Promise<T>;
  /** Throws when the model route is unavailable, before any page text is read. */
  ready(): void;
  send(payload: Record<string, unknown>): void;
}) {
  const translations = new Map<string, { lang: string; count: number }>();
  return {
    /** A navigation drops the page's translation state. */
    forget(pageId: string) { if (translations.delete(pageId)) o.send({ pageId, lang: null, count: 0 }); },
    failed(pageId: string, error: unknown) { o.send({ pageId, error: error instanceof Error ? error.message : String(error) }); },
    async page(pageId: string) {
      const wc = o.contents(pageId);
      if (!wc) throw new Error("This page is no longer available.");
      const url = wc.getURL();
      if (!/^https?:/.test(url)) throw new Error("Open a web page to translate.");
      if (/\.pdf($|[?#])/i.test(url)) throw new Error("PDF documents can't be translated in place — open them in Reader or export text first.");
      o.ready();
      o.send({ pageId, pending: true });
      const extracted = await wc.executeJavaScript(extractTextsScript(), true) as { texts?: string[]; title?: string; lang?: string };
      if (!extracted?.texts?.length) throw new Error("No readable text was found on this page.");
      const result = await o.invoke<{ lang: string; translations: string[]; truncated: boolean }>("translate.page", { texts: extracted.texts, target: translateTargetLabel(), context: (extracted.title ?? "").slice(0, 200) });
      if (wc.isDestroyed() || wc.getURL() !== url) throw new Error("The page changed while translating.");
      const applied = await wc.executeJavaScript(applyTranslationsScript(result.translations), true) as { applied: number; expired: boolean };
      if (applied.expired) throw new Error("The page changed while translating.");
      const state = { lang: result.lang, count: applied.applied, truncated: result.truncated };
      translations.set(pageId, { lang: result.lang, count: applied.applied });
      o.send({ pageId, ...state });
      return state;
    },
    async selection(pageId: string, text: string, x: number, y: number) {
      const wc = o.contents(pageId);
      if (!wc) throw new Error("Translation is unavailable right now.");
      o.ready();
      const result = await o.invoke<{ lang: string; translation: string }>("translate.text", { text: text.slice(0, 12000), target: translateTargetLabel(), context: wc.getTitle().slice(0, 200) });
      if (wc.isDestroyed()) return;
      await wc.executeJavaScript(translateBubbleScript(x, y, result.lang, translateTargetLabel(), result.translation), true).catch(() => {});
    },
    async showOriginal(pageId: string) {
      const wc = o.contents(pageId);
      if (!wc) return 0;
      const restored = await wc.executeJavaScript(restoreOriginalScript(), true).catch(() => 0) as number;
      translations.delete(pageId);
      o.send({ pageId, lang: null, count: 0 });
      return restored;
    },
  };
}
