/**
 * Interaction lab: iframe embedding, an open shadow-DOM component, a
 * virtualized 10k-row list, infinite scroll with stable keys, and a
 * canvas drag task — all client-side deterministic.
 */
import { html, json, notFound, page, serve } from "../shared/http.ts";

const VIRTUAL_ROWS = 10_000;
const state = { canvasDrags: [] as { from: [number, number]; to: [number, number]; at: number }[] };

const HOME = page(
  "Interaction lab — fixture",
  `<header><h1>Interaction lab</h1><a href="/">Home</a><a href="/api/state">State JSON</a><span class="muted" style="margin-left:auto">fixture :4812</span></header>
<main>
  <div class="card"><h2>Iframe</h2>
    <iframe src="/frame-inner" style="width:100%;height:180px;border:1px solid #d9dde3;border-radius:6px"></iframe>
  </div>

  <div class="card"><h2>Shadow DOM widget</h2>
    <shadow-counter></shadow-counter>
  </div>

  <div class="card"><h2>Virtualized list (${VIRTUAL_ROWS.toLocaleString()} rows)</h2>
    <div id="vlist" style="height:220px;overflow:auto;border:1px solid #d9dde3;border-radius:6px;background:#fff;position:relative">
      <div id="vlist-spacer" style="position:relative"></div>
    </div>
    <p class="muted">Rendered rows: <span id="vcount">0</span>. Row keys are stable: <code>row-000000</code>…</p>
  </div>

  <div class="card"><h2>Infinite scroll</h2>
    <div id="infinite" style="height:180px;overflow:auto;border:1px solid #d9dde3;border-radius:6px;background:#fff"></div>
    <p class="muted">Loaded <span id="iloaded">0</span> items · <span id="idone"></span></p>
  </div>

  <div class="card"><h2>Canvas drag</h2>
    <canvas id="cv" width="480" height="200" style="border:1px solid #d9dde3;border-radius:6px;background:#fff"></canvas>
    <p class="muted">Drag the square onto the drop zone. <span id="drag-status">not dropped</span></p>
  </div>
</main>
<script>
  // ---- shadow DOM widget ----
  class ShadowCounter extends HTMLElement {
    constructor(){ super(); const r = this.attachShadow({mode:'open'});
      r.innerHTML = '<style>button{background:#2f6fed;color:#fff;border:0;border-radius:6px;padding:6px 10px}</style>' +
        '<button id="inc">Increment</button> <span id="n">0</span> ' +
        '<input id="tag" placeholder="label" style="margin-left:10px">';
      r.getElementById('inc').addEventListener('click', () => { r.getElementById('n').textContent = String(+r.getElementById('n').textContent + 1); });
    }
  }
  customElements.define('shadow-counter', ShadowCounter);

  // ---- virtualized list ----
  const ROW_H = 26, TOTAL = ${VIRTUAL_ROWS};
  const vlist = document.getElementById('vlist'), spacer = document.getElementById('vlist-spacer');
  spacer.style.height = (TOTAL * ROW_H) + 'px';
  function renderV(){
    const start = Math.max(0, Math.floor(vlist.scrollTop / ROW_H) - 4);
    const end = Math.min(TOTAL, start + Math.ceil(vlist.clientHeight / ROW_H) + 8);
    let html = '';
    for (let i = start; i < end; i++)
      html += '<div class="vrow" data-key="row-' + String(i).padStart(6,'0') + '" style="position:absolute;top:' + (i*ROW_H) + 'px;left:0;right:0;height:' + ROW_H + 'px;padding:4px 10px;font-size:12px;border-bottom:1px solid #f0f2f5">row-' + String(i).padStart(6,'0') + ' · item ' + i + '</div>';
    spacer.innerHTML = html;
    document.getElementById('vcount').textContent = String(end - start);
  }
  vlist.addEventListener('scroll', renderV); renderV();

  // ---- infinite scroll ----
  const inf = document.getElementById('infinite');
  let loaded = 0, done = false, loading = false;
  function loadMore(){
    if (loading || done) return; loading = true;
    setTimeout(() => {
      const batch = Math.min(20, 120 - loaded);
      for (let i = 0; i < batch; i++)
        inf.insertAdjacentHTML('beforeend','<div class="irow" data-key="item-'+(loaded+i)+'" style="padding:5px 10px;border-bottom:1px solid #f0f2f5;font-size:12px">item-'+(loaded+i)+'</div>');
      loaded += batch; loading = false;
      document.getElementById('iloaded').textContent = String(loaded);
      if (loaded >= 120){ done = true; document.getElementById('idone').textContent = 'end reached'; }
    }, 120);
  }
  inf.addEventListener('scroll', () => { if (inf.scrollTop + inf.clientHeight > inf.scrollHeight - 60) loadMore(); });
  loadMore();

  // ---- canvas drag ----
  const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
  const sq = {x: 30, y: 80, w: 40, h: 40}; const zone = {x: 360, y: 60, w: 90, h: 90};
  let dragging = false, off = [0,0];
  function draw(){
    ctx.clearRect(0,0,480,200);
    ctx.strokeStyle = '#2f6fed'; ctx.setLineDash([5,4]); ctx.strokeRect(zone.x,zone.y,zone.w,zone.h);
    ctx.setLineDash([]); ctx.fillStyle = '#e8622d'; ctx.fillRect(sq.x,sq.y,sq.w,sq.h);
    ctx.fillStyle = '#555'; ctx.font = '11px system-ui'; ctx.fillText('drop zone', zone.x+8, zone.y-6);
  }
  function pos(e){ const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  cv.addEventListener('mousedown', e => { const [x,y] = pos(e); if (x>=sq.x&&x<=sq.x+sq.w&&y>=sq.y&&y<=sq.y+sq.h){ dragging = true; off=[x-sq.x,y-sq.y]; } });
  addEventListener('mousemove', e => { if (!dragging) return; const [x,y] = pos(e); sq.x=x-off[0]; sq.y=y-off[1]; draw(); });
  addEventListener('mouseup', e => { if (!dragging) return; dragging = false;
    const cx = sq.x+sq.w/2, cy = sq.y+sq.h/2;
    if (cx>=zone.x&&cx<=zone.x+zone.w&&cy>=zone.y&&cy<=zone.y+zone.h){
      document.getElementById('drag-status').textContent = 'dropped ✓';
      document.getElementById('drag-status').dataset.done = '1';
      fetch('/api/drag', {method:'POST', body: JSON.stringify({to:[sq.x,sq.y]})});
    }
  });
  draw();
</script>`,
);

const FRAME_INNER = page(
  "Inner frame",
  `<main><div class="card"><h2>Inner frame content</h2>
  <p id="frame-text">This text lives inside an iframe.</p>
  <input id="frame-input" placeholder="frame field">
  <button id="frame-btn">Frame button</button>
  <p class="muted" id="frame-out"></p></div></main>
<script>document.getElementById('frame-btn').addEventListener('click',()=>{document.getElementById('frame-out').textContent='frame clicked: '+document.getElementById('frame-input').value;});</script>`,
);

async function handle(req: any, res: any, url: URL, body: Buffer) {
  const path = url.pathname;
  if (path === "/") return html(res, HOME);
  if (path === "/frame-inner") return html(res, FRAME_INNER);
  if (path === "/api/drag" && req.method === "POST") {
    const d = JSON.parse(body.toString("utf8") || "{}");
    state.canvasDrags.push({ from: [0, 0], to: d.to ?? [0, 0], at: Date.now() });
    return json(res, { ok: true });
  }
  if (path === "/api/state") return json(res, state);
  return notFound(res);
}

serve(Number(process.env.PORT ?? 4812), "interaction-lab", handle);
