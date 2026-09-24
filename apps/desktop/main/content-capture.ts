import type { WebContents } from "electron";
import { readArticle } from "./read-article.js";

type Response = { url: string; html: boolean; noStore: boolean };
const responses = new Map<number, Response>();

/** Keep only response eligibility, never response text or sensitive headers. */
export function forgetContentResponse(webContentsId: number) { responses.delete(webContentsId); }

export function noteContentResponse(webContentsId: number, url: string, statusCode: number, headers: Record<string, string[] | string>) {
  const header = (name: string) => Object.entries(headers).filter(([key]) => key.toLowerCase() === name)
    .flatMap(([, value]) => Array.isArray(value) ? value : [value]).join(",").toLowerCase();
  responses.set(webContentsId, { url, html: statusCode >= 200 && statusCode < 300 && /^text\/html(?:\s*;|\s*$)/.test(header("content-type")),
    noStore: /(?:^|,)\s*no-store(?:\s*,|\s*$)/.test(header("cache-control")) });
}

export function contentResponseEligible(webContentsId: number, url: string) {
  const response = responses.get(webContentsId);
  return !!response && response.url === url && response.html && !response.noStore;
}

const sensitiveDocumentProbe = `(() => {
  if (document.querySelector('input[type="password"], input[autocomplete~="one-time-code"], input[autocomplete^="cc-"], input[autocomplete="current-password"], input[autocomplete="new-password"], meta[http-equiv="Cache-Control"][content*="no-store" i]')) return false;
  if (document.querySelector('[contenteditable="true"], [role="textbox"]')) return false;
  if (document.querySelector('form[action*="login" i], form[action*="signin" i], form[action*="checkout" i], form[action*="payment" i]')) return false;
  return document.visibilityState === 'visible' && document.readyState !== 'loading';
})()`;

type ReaderNode = string | { children: ReaderNode[] };
function textOf(node: ReaderNode): string {
  if (typeof node === "string") return node;
  return node.children.map(textOf).join(" ");
}

/** A single explicit foreground capture. Reader extraction strips forms, frames, markup, and script. */
export async function captureReadablePage(contents: WebContents, expectedUrl: string, available: () => boolean) {
  const eligible = () => available() && !contents.isDestroyed() && contents.getURL() === expectedUrl
    && contentResponseEligible(contents.id, expectedUrl);
  if (!eligible()) throw new Error("This page is not eligible for content recall. It must be a visible HTTPS article without a no-store response.");
  const safe = await contents.executeJavaScriptInIsolatedWorld(997, [{ code: sensitiveDocumentProbe }]);
  if (safe !== true || !eligible()) throw new Error("This page may contain private fields or changed during capture.");
  const article = await readArticle(contents, eligible) as { title: string; url: string; content: ReaderNode };
  const stillSafe = await contents.executeJavaScriptInIsolatedWorld(997, [{ code: sensitiveDocumentProbe }]);
  if (stillSafe !== true || !eligible() || article.url !== expectedUrl) throw new Error("The page changed or became sensitive during capture.");
  const text = textOf(article.content).replace(/\s+/g, " ").trim();
  if (!text || Buffer.byteLength(text, "utf8") > 64 * 1024) throw new Error("This article is too large for protected recall.");
  return { url: expectedUrl, title: article.title, text };
}
