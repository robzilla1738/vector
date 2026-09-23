import type { Rectangle, WebContents } from "electron";
const ID = 'aux-sidebar-glass';
const shown = new Map<string, { page: WebContents; bounds: Rectangle }>();

/** The page supplies the live blur; the shell supplies the sidebar's tint and controls. */
export function syncSidebarGlass(owner: string, page: WebContents | undefined, bounds: Rectangle | null) {
  const prior = shown.get(owner);
  if (prior && (prior.page !== page || !bounds)) {
    shown.delete(owner);
    if (!prior.page.isDestroyed()) void prior.page.executeJavaScript(`(()=>{const el=document.getElementById('${ID}');if(!el)return;el.style.opacity='0';setTimeout(()=>{if(el.style.opacity==='0')el.remove()},260)})()`).catch(() => {});
  }
  if (!page || page.isDestroyed() || !bounds) return;
  shown.set(owner, { page, bounds });
  const css = `position:fixed;z-index:2147483645;pointer-events:none;left:${bounds.x}px;top:${bounds.y}px;width:${bounds.width}px;height:${bounds.height}px;border-radius:16px;backdrop-filter:blur(28px) saturate(1.15);-webkit-backdrop-filter:blur(28px) saturate(1.15);transition:opacity 220ms ease-out;`;
  void page.executeJavaScript(`(()=>{let el=document.getElementById('${ID}');if(!el){el=document.createElement('div');el.id='${ID}';document.documentElement.append(el)}el.style.cssText=${JSON.stringify(css)};if(matchMedia('(prefers-reduced-motion: reduce)').matches)el.style.transition='none';el.style.opacity='1'})()`).catch(() => {});
}

export function sidebarGlassBounds(value: unknown, origin: { x: number; y: number }): Rectangle | null {
  if (!value || typeof value !== 'object') return null;
  const r = value as Rectangle;
  if (![r.x,r.y,r.width,r.height].every(n=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<20000)||r.width<=0||r.height<=0) return null;
  return { x:r.x-origin.x, y:r.y-origin.y, width:r.width, height:r.height };
}
