// Visual-only page decoration in Chromium's internal isolated world. No host
// endpoint, page data or credentials are exposed to the page's main world.
#ifndef CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PAGE_MATERIAL_H_
#define CHROME_BROWSER_UI_VIEWS_FRAME_AUX_PAGE_MATERIAL_H_
inline constexpr char kAuxPageMaterial[] = R"AUX((state => {
  const key = '__auxPageMaterial';
  let surface = globalThis[key];
  if (!state.enabled) {
    surface?.host.remove(); delete globalThis[key]; return;
  }
  if (!surface?.host.isConnected) {
    const host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true'); host.inert = true;
    host.style.cssText = 'all:initial!important;position:fixed!important;inset:0!important;z-index:2147483646!important;pointer-events:none!important;overflow:hidden!important;';
    const root = host.attachShadow({mode:'closed'});
    const style = document.createElement('style');
    style.textContent = `
      div { position:absolute; pointer-events:none; }
      .toolbar { left:0;right:0;top:0;height:52px;opacity:0;transform:translateY(-52px);
        backdrop-filter:blur(20px) saturate(1.2);
        mask-image:linear-gradient(to bottom,#000 26px,rgb(0 0 0/.85) 34px,rgb(0 0 0/.35) 44px,transparent);
        transition:transform 560ms cubic-bezier(.22,1,.36,1),opacity 560ms cubic-bezier(.22,1,.36,1); }
      .sidebar { border-radius:16px;opacity:0;backdrop-filter:blur(28px) saturate(1.15);transition:opacity 220ms ease-out; }
      @media(prefers-reduced-motion:reduce) { div { transition:none!important; } }
      @media(prefers-reduced-transparency:reduce) { div { backdrop-filter:none!important; } }
    `;
    const toolbar = document.createElement('div'); toolbar.className = 'toolbar';
    const sidebar = document.createElement('div'); sidebar.className = 'sidebar';
    root.append(style, toolbar, sidebar); document.documentElement.append(host);
    surface = globalThis[key] = {host,toolbar,sidebar};
    toolbar.getBoundingClientRect();
  }
  surface.toolbar.style.opacity = state.toolbar ? '1' : '0';
  surface.toolbar.style.transform = state.toolbar ? 'translateY(0)' : 'translateY(-52px)';
  if (state.sidebar) {
    const r = state.sidebar;
    Object.assign(surface.sidebar.style, {left:r.x+'px',top:r.y+'px',width:r.width+'px',height:r.height+'px',opacity:'1'});
  } else surface.sidebar.style.opacity = '0';
}))AUX";
#endif
