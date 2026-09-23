import type { WebContents } from "electron";

const ID = "aux-toolbar-glass";
/** The address row. The frost is clear at this line, not below it. */
const ROW = 40;

/** Blur the top of a page and fade it out by the bottom of the address row. */
export function toolbarGlassCss(dark: boolean): string {
  const ink = dark ? "0 0 0" : "255 255 255";
  const top = dark ? ".2" : ".32";
  return `#${ID}{position:fixed;z-index:2147483646;top:0;left:0;right:0;height:${ROW}px;pointer-events:none;background:linear-gradient(to bottom,rgb(${ink} / ${top}),transparent 78%);-webkit-backdrop-filter:blur(12px) saturate(1.2);backdrop-filter:blur(12px) saturate(1.2);-webkit-mask-image:linear-gradient(to bottom,#000 0%,rgb(0 0 0 / .4) 12px,transparent 32px,transparent);mask-image:linear-gradient(to bottom,#000 0%,rgb(0 0 0 / .4) 12px,transparent 32px,transparent)}`;
}

const mounted = new WeakMap<WebContents, { key: string; dark: boolean }>();
const hooked = new WeakSet<WebContents>();
const shownByOwner = new Map<string, WebContents[]>();
const requested = new Map<string, { pages: WebContents[]; overlay: boolean }>();

function elementScript(present: boolean): string {
  const id = JSON.stringify(ID);
  return present
    ? `(()=>{const id=${id};if(document.getElementById(id))return;const el=document.createElement("div");el.id=id;(document.documentElement||document.body).append(el)})()`
    : `document.getElementById(${id})?.remove()`;
}

function attach(wc: WebContents, dark: boolean) {
  if (wc.isDestroyed()) return;
  const css = toolbarGlassCss(dark);
  void wc.insertCSS(css).then(key => {
    const wanted = mounted.get(wc);
    if (!wanted || wanted.dark !== dark || wc.isDestroyed()) {
      void wc.removeInsertedCSS(key).catch(() => {});
      return;
    }
    if (wanted.key) void wc.removeInsertedCSS(wanted.key).catch(() => {});
    mounted.set(wc, { key, dark });
    void wc.executeJavaScript(elementScript(true)).catch(() => {});
  }).catch(() => {
    const current = mounted.get(wc);
    if (current?.dark === dark && !current.key) mounted.delete(wc);
  });
}

function watch(wc: WebContents) {
  if (hooked.has(wc)) return;
  hooked.add(wc);
  wc.on("dom-ready", () => {
    const state = mounted.get(wc);
    if (!state || wc.isDestroyed()) return;
    mounted.set(wc, { key: "", dark: state.dark });
    attach(wc, state.dark);
  });
}

function show(wc: WebContents, dark: boolean) {
  const state = mounted.get(wc);
  if (state?.dark === dark) return;
  mounted.set(wc, { key: state?.key ?? "", dark });
  watch(wc);
  attach(wc, dark);
}

function hide(wc: WebContents) {
  const state = mounted.get(wc);
  mounted.delete(wc);
  if (!state || wc.isDestroyed()) return;
  if (state.key) void wc.removeInsertedCSS(state.key).catch(() => {});
  void wc.executeJavaScript(elementScript(false)).catch(() => {});
}

/** Show the frost on these pages while the address row is open, and take it off the ones that dropped out. */
export function syncToolbarGlass(owner: string, pages: readonly WebContents[], overlay: boolean, dark: boolean, reduced: boolean): void {
  const livePages = pages.filter(page => !page.isDestroyed());
  requested.set(owner, { pages: livePages, overlay });
  const previous = shownByOwner.get(owner) ?? [];
  const next = overlay && !reduced ? livePages : [];
  shownByOwner.set(owner, next);
  const keep = new Set(next);
  for (const page of previous) if (!keep.has(page)) hide(page);
  for (const page of next) show(page, dark);
}

export function recolorToolbarGlass(dark: boolean, reduced: boolean): void {
  for (const [owner, state] of requested) syncToolbarGlass(owner, state.pages, state.overlay, dark, reduced);
}
