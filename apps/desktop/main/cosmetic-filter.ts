import type { WebContents } from "electron";
import { noteSwallowed } from "./swallowed.js";
import { addDocumentBinding } from "./page-debugger.js";

/**
 * Cosmetic filtering: hides known ad containers through a stylesheet injected
 * in a dedicated isolated world at document start. The page cannot enumerate or
 * remove the world, but the style node lives in the shared DOM so main can add
 * or remove it when the per-site policy changes.
 *
 * Injection defaults to filtered; the document-start script then reports its
 * hostname over a CDP binding and main removes the style only when the host is
 * exempt — fail-hidden, matching the enabled-by-default network policy.
 */

export const COSMETIC_BINDING = "__auxCosmetic";
export const COSMETIC_WORLD = "aux-cosmetic";
const STYLE_ID = "__aux-ads";

/** Conservative selectors for ad containers — network blocking already covers known hosts. */
export const COSMETIC_SELECTORS: readonly string[] = [
  "ins.adsbygoogle",
  ".adsbygoogle",
  "[data-ad-slot]",
  "[data-adunit]",
  "[data-ad]",
  "[data-ads]",
  "[data-dcm]",
  ".ad-container",
  ".ad-banner",
  ".advertisement",
  "[id^='ad-slot']",
  "[id^='google_ads']",
  "[id*='google_ads']",
  "iframe[id^='aswift']",
  "iframe[src*='doubleclick.net']",
  "iframe[src*='googlesyndication.com']",
  "div[id^='taboola-']",
  ".OUTBRAIN",
  "[data-outbrain]",
];

const styleSheet = () => `${COSMETIC_SELECTORS.join(",\n")} { display: none !important; }`;

/** Runs at document start in the isolated world. */
function injectorBody(bindingName: string, styleId: string, css: string) {
  const inject = () => {
    const root = document.documentElement;
    if (!root || document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = css;
    root.appendChild(style);
  };
  inject();
  try {
    const binding = (globalThis as Record<string, unknown>)[bindingName];
    if (typeof binding === "function") (binding as (host: string) => void)(location.hostname);
  } catch { /* binding unavailable */ }
}

/** Applies or removes the style — main-world evaluate for state changes. */
export function cosmeticApplyScript(on: boolean): string {
  const css = JSON.stringify(styleSheet());
  const id = JSON.stringify(STYLE_ID);
  return `(function(){var id=${id},el=document.getElementById(id);
    if(!${on}){if(el)el.remove();return 0;}
    if(el)return 1;
    var s=document.createElement('style');s.id=id;s.textContent=${css};
    (document.documentElement||document.head||document.body).appendChild(s);return 1;})()`;
}

/** Applies or removes the style on an open page — live toggle/allow changes. */
export function applyCosmetic(wc: WebContents, on: boolean) {
  if (wc.isDestroyed()) return;
  void wc.executeJavaScript(cosmeticApplyScript(on), true).catch(() => noteSwallowed("cosmetic.apply"));
}

export function installCosmeticFilter(wc: WebContents, hooks: {
  /** Should this page host stay filtered? (blocking enabled && host not allowed) */
  filtered(hostname: string): boolean;
}) {
  void addDocumentBinding(wc, COSMETIC_BINDING, (payload, contextId) => {
    const host = payload.replace(/^"|"$/g, "");
    if (!host || hooks.filtered(host) || typeof contextId !== "number") return;
    void wc.debugger.sendCommand("Runtime.evaluate", {
      expression: `document.getElementById(${JSON.stringify(STYLE_ID)})?.remove()`,
      contextId,
    }).catch(() => noteSwallowed("cosmetic.remove"));
  }, {
    source: `(${injectorBody.toString()})(${JSON.stringify(COSMETIC_BINDING)},${JSON.stringify(STYLE_ID)},${JSON.stringify(styleSheet())})`,
    worldName: COSMETIC_WORLD,
  });
}
