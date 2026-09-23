import type { WebContents } from "electron";

const ID = "aux-toolbar-glass";
/** The full control row remains frosted; only the trailing edge fades. */
const ROW = 40;
const FEATHER = 12;

/** CSS in the page can blur its pixels; the separate shell view cannot. */
export function toolbarGlassCss(_dark: boolean): string {
  return `#${ID}{position:fixed!important;z-index:2147483646!important;top:0!important;left:0!important;right:0!important;height:${ROW + FEATHER}px!important;pointer-events:none!important;transition:transform 560ms cubic-bezier(.22,1,.36,1),opacity 560ms cubic-bezier(.22,1,.36,1);background:transparent!important;-webkit-backdrop-filter:blur(20px) saturate(1.2)!important;backdrop-filter:blur(20px) saturate(1.2)!important;-webkit-mask-image:linear-gradient(to bottom,#000 26px,rgb(0 0 0 / .85) 34px,rgb(0 0 0 / .35) 44px,transparent)!important;mask-image:linear-gradient(to bottom,#000 26px,rgb(0 0 0 / .85) 34px,rgb(0 0 0 / .35) 44px,transparent)!important}@media(prefers-reduced-motion:reduce){#${ID}{transition:none}}`;
}

const mounted = new WeakMap<WebContents, { key: string; dark: boolean }>();
const hooked = new WeakSet<WebContents>();
const shownByOwner = new Map<string, WebContents[]>();
const ownerReveal = new Map<string, boolean>();
const pageReveal = new WeakMap<WebContents, boolean>();
const requested = new Map<string, { pages: WebContents[]; overlay: boolean }>();

function animateFrost(wc: WebContents, visible: boolean) {
  if (wc.isDestroyed()) return;
  void wc.executeJavaScript(`(()=>{const el=document.getElementById(${JSON.stringify(ID)});if(!el)return;el.getBoundingClientRect();el.style.opacity=${JSON.stringify(visible ? "1" : "0")};el.style.transform=${JSON.stringify(visible ? "translateY(0)" : "translateY(-52px)")}})()`).catch(() => {});
}

/** Run the page frost's exit at the same time as the shell controls. */
export function revealToolbarGlass(owner: string, visible: boolean) {
  ownerReveal.set(owner, visible);
  for (const page of shownByOwner.get(owner) ?? []) {
    pageReveal.set(page, visible);
    animateFrost(page, visible);
  }
}

function elementScript(present: boolean): string {
  const id = JSON.stringify(ID);
  return present
    ? `(()=>{const id=${id};if(document.getElementById(id))return;const el=document.createElement("div");el.id=id;el.style.opacity="0";el.style.transform="translateY(-52px)";(document.documentElement||document.body).append(el)})()`
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
    void wc.executeJavaScript(elementScript(true)).then(() => animateFrost(wc, pageReveal.get(wc) ?? true)).catch(() => {});
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
  for (const page of next) { pageReveal.set(page, ownerReveal.get(owner) ?? true); show(page, dark); }
}

export function recolorToolbarGlass(dark: boolean, reduced: boolean): void {
  for (const [owner, state] of requested) syncToolbarGlass(owner, state.pages, state.overlay, dark, reduced);
}

/** Sample only the visible page's top strip locally; no image leaves the process. */
export async function toolbarTone(page?: WebContents): Promise<"light" | "dark"> {
  if (!page || page.isDestroyed()) return "dark";
  try {
    const image = (await page.capturePage({ x: 0, y: 0, width: 600, height: 40 })).resize({ width: 16, height: 1 });
    const pixels = image.toBitmap();
    if (!pixels.length) return "dark";
    let luminance = 0;
    for (let i = 0; i < pixels.length; i += 4) luminance += .2126 * pixels[i + 2]! + .7152 * pixels[i + 1]! + .0722 * pixels[i]!;
    return luminance / (pixels.length / 4) > 145 ? "light" : "dark";
  } catch { return "dark"; }
}
