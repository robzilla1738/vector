import { app } from "electron";
import { registry } from "../app/services.js";
import { applyTranslationsScript, extractTextsScript, restoreOriginalScript, translateBubbleScript } from "../page-translate.js";
import { channel, requireRuntime, runtimeInvoke } from "../runtime/supervisor.js";
import { broadcastToShells } from "../windows/registry.js";

/** Locale-appropriate label for the model prompt, e.g. "English". */
export function translateTargetLabel(): string {
  const locale = app.getLocale() || "en";
  try { return new Intl.DisplayNames([locale], { type: "language" }).of(locale.split("-")[0]!) ?? "English"; }
  catch { return "English"; }
}

export const pageTranslations = new Map<string, { lang: string; count: number }>();

export async function runPageTranslate(pageId: string) {
  const entry = registry.get(pageId);
  if (!entry) throw new Error("This page is no longer available.");
  const wc = entry.view.webContents;
  const url = wc.getURL();
  if (!/^https?:/.test(url)) throw new Error("Open a web page to translate.");
  if (/\.pdf($|[?#])/i.test(url)) throw new Error("PDF documents can't be translated in place — open them in Reader or export text first.");
  requireRuntime("Translation is unavailable while the runtime is offline.");
  broadcastToShells("translation-changed", { pageId, pending: true });
  const extracted = await wc.executeJavaScript(extractTextsScript(), true) as { texts?: string[]; title?: string; lang?: string };
  if (!extracted?.texts?.length) throw new Error("No readable text was found on this page.");
  const result = await runtimeInvoke("translate.page", { texts: extracted.texts, target: translateTargetLabel(), context: (extracted.title ?? "").slice(0, 200) }) as { lang: string; translations: string[]; truncated: boolean };
  if (wc.isDestroyed() || wc.getURL() !== url) throw new Error("The page changed while translating.");
  const applied = await wc.executeJavaScript(applyTranslationsScript(result.translations), true) as { applied: number; expired: boolean };
  if (applied.expired) throw new Error("The page changed while translating.");
  const state = { lang: result.lang, count: applied.applied, truncated: result.truncated };
  pageTranslations.set(pageId, { lang: result.lang, count: applied.applied });
  broadcastToShells("translation-changed", { pageId, ...state });
  return state;
}

export async function runSelectionTranslate(pageId: string, text: string, x: number, y: number) {
  const entry = registry.get(pageId);
  if (!entry || !channel) throw new Error("Translation is unavailable right now.");
  const result = await runtimeInvoke("translate.text", { text: text.slice(0, 12000), target: translateTargetLabel(), context: entry.view.webContents.getTitle().slice(0, 200) }) as { lang: string; translation: string };
  if (entry.view.webContents.isDestroyed()) return;
  await entry.view.webContents.executeJavaScript(translateBubbleScript(x, y, result.lang, translateTargetLabel(), result.translation), true).catch(() => {});
}

export async function runShowOriginal(pageId: string) {
  const entry = registry.get(pageId);
  if (!entry) return 0;
  const restored = await entry.view.webContents.executeJavaScript(restoreOriginalScript(), true).catch(() => 0) as number;
  pageTranslations.delete(pageId);
  broadcastToShells("translation-changed", { pageId, lang: null, count: 0 });
  return restored;
}
