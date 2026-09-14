/**
 * Records fixture: a small CRUD app with 30 deterministic records,
 * filters, pagination, edit/save, attachments, a modal, a popup link,
 * a delayed endpoint, and fault switches for recovery testing.
 *
 * Server-side truth lives in `state` and is exposed at /api/state so tests
 * verify real outcomes rather than browser impressions.
 */
import { html, json, notFound, page, parseForm, send, serve } from "../shared/http.ts";

const OWNERS = ["Alex Rivera", "Sam Chen", "Jordan Lee", "Priya Patel", "Morgan Diaz"];
const STATUSES = ["draft", "in progress", "in review", "approved", "archived"] as const;
type Status = (typeof STATUSES)[number];

interface Attachment {
  name: string;
  content: string;
}
interface Record_ {
  id: string;
  title: string;
  owner: string;
  status: Status;
  summary: string;
  updatedAt: string;
  attachments: Attachment[];
}

const state = {
  records: new Map<string, Record_>(),
  edits: [] as { id: string; at: number; fields: Record<string, string> }[],
  downloads: [] as { id: string; file: string; at: number }[],
  faults: { delayMs: 0, renameEditButton: false, timeoutAfterSave: false, removeRecord: "" },
};

// deterministic seed — same data on every launch
for (let i = 1; i <= 30; i++) {
  const id = `rec-${String(i).padStart(2, "0")}`;
  const status = STATUSES[i % STATUSES.length]!;
  const attachments: Attachment[] = [];
  if (i % 3 === 0)
    attachments.push({ name: `${id}-notes.txt`, content: `Notes for ${id}\nGenerated deterministically.\n` });
  if (i % 5 === 0)
    attachments.push({ name: `${id}-data.csv`, content: `id,metric\n${id},${(i * 37) % 100}\n` });
  state.records.set(id, {
    id,
    title: `Record ${String(i).padStart(2, "0")} — ${["Alpha", "Bravo", "Charlie", "Delta", "Echo"][i % 5]} project`,
    owner: OWNERS[i % OWNERS.length]!,
    status,
    summary: `Deterministic fixture record #${i}. Owned by ${OWNERS[i % OWNERS.length]}; status "${status}".`,
    updatedAt: `2026-09-${String((i % 28) + 1).padStart(2, "0")}T10:00:00Z`,
    attachments,
  });
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pill = (s: string) => `<span class="pill ${s.replace(" ", "")}">${esc(s)}</span>`;

function header(active = "records") {
  return `<header><h1>Records</h1><a href="/records"${active === "records" ? ' style="font-weight:700"' : ""}>All records</a>
  <a href="/new">New record</a><a href="/popup-info" onclick="window.open('/popup-info','info','width=420,height=300');return false">Pop-up info</a>
  <a href="/api/state">State JSON</a><span class="muted" style="margin-left:auto">fixture :4810</span></header>`;
}

function listPage(url: URL) {
  const status = url.searchParams.get("status") ?? "";
  const pageNum = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const perPage = 10;
  let recs = [...state.records.values()];
  if (status) recs = recs.filter((r) => r.status === status);
  const pages = Math.max(1, Math.ceil(recs.length / perPage));
  const slice = recs.slice((pageNum - 1) * perPage, pageNum * perPage);
  const rows = slice
    .map(
      (r) => `<tr><td><a class="record-link" href="/records/${r.id}">${esc(r.title)}</a></td>
      <td>${esc(r.owner)}</td><td>${pill(r.status)}</td><td class="muted">${esc(r.updatedAt.slice(0, 10))}</td>
      <td>${r.attachments.length} file${r.attachments.length === 1 ? "" : "s"}</td></tr>`,
    )
    .join("");
  const filterOpts = [`<option value="">All statuses</option>`]
    .concat(STATUSES.map((s) => `<option value="${s}"${s === status ? " selected" : ""}>${s}</option>`))
    .join("");
  const pag = Array.from({ length: pages }, (_, i) => {
    const p = i + 1;
    const q = `?page=${p}${status ? `&status=${encodeURIComponent(status)}` : ""}`;
    return `<a href="${q}" class="${p === pageNum ? "on" : ""}">${p}</a>`;
  }).join("");
  return page(
    "Records — fixture",
    `${header()}
    <main>
      <form method="get" action="/records" class="card" style="display:flex;gap:10px;align-items:end">
        <div><label for="status">Filter by status</label><select id="status" name="status">${filterOpts}</select></div>
        <button id="apply-filter" type="submit">Apply filter</button>
      </form>
      <table id="records-table"><thead><tr><th>Title</th><th>Owner</th><th>Status</th><th>Updated</th><th>Files</th></tr></thead><tbody>${rows}</tbody></table>
      <nav class="pagination" aria-label="pages">${pag}</nav>
      <p class="muted">${recs.length} records</p>
    </main>`,
  );
}

function detailPage(rec: Record_, url: URL) {
  const fault = url.searchParams.get("fault") ?? "";
  const renamed = fault === "renamed-button" || state.faults.renameEditButton;
  const attach = rec.attachments
    .map((a) => `<li><a href="/records/${rec.id}/download/${encodeURIComponent(a.name)}">${esc(a.name)}</a> <span class="muted">${a.content.length} bytes</span></li>`)
    .join("");
  return page(
    `${rec.title} — Records`,
    `${header()}
    <main>
      <div class="card">
        <h2 id="record-title">${esc(rec.title)}</h2>
        <p><strong>Owner:</strong> <span id="record-owner">${esc(rec.owner)}</span></p>
        <p><strong>Status:</strong> <span id="record-status">${pill(rec.status)}</span></p>
        <p id="record-summary">${esc(rec.summary)}</p>
        <p class="muted">id=${rec.id} · updated ${esc(rec.updatedAt)}</p>
        <button id="${renamed ? "modify-record" : "edit-record"}">${renamed ? "Modify record" : "Edit record"}</button>
        <button class="secondary" id="open-modal">Details…</button>
        <a class="btn secondary" href="/records/${rec.id}/slow-info" id="slow-link">Slow info (delayed)</a>
      </div>
      <div class="card"><h3>Attachments</h3><ul id="attachments">${attach || "<li class='muted'>none</li>"}</ul></div>
      <div class="card" id="edit-panel" hidden>
        <h3>Edit record</h3>
        <form method="post" action="/records/${rec.id}/save${fault ? `?fault=${encodeURIComponent(fault)}` : ""}">
          <label for="f-title">Title</label><input id="f-title" name="title" value="${esc(rec.title)}" required>
          <label for="f-owner">Owner</label>
          <select id="f-owner" name="owner">${OWNERS.map((o) => `<option${o === rec.owner ? " selected" : ""}>${o}</option>`).join("")}</select>
          <label for="f-status">Status</label>
          <select id="f-status" name="status">${STATUSES.map((s) => `<option${s === rec.status ? " selected" : ""}>${s}</option>`).join("")}</select>
          <label for="f-summary">Summary</label><textarea id="f-summary" name="summary" rows="3">${esc(rec.summary)}</textarea>
          <div style="margin-top:10px"><button id="save-record" type="submit">Save record</button>
          <button class="secondary" type="button" id="cancel-edit">Cancel</button></div>
        </form>
      </div>
      <div class="modal-mask" id="modal-mask"><div class="modal"><h3>Record details</h3>
        <p>Created by the fixture seed. Internal ref <code>${rec.id}</code>.</p>
        <button id="close-modal">Close</button></div></div>
    </main>
    <script>
      const editBtn = document.getElementById(${JSON.stringify(renamed ? "modify-record" : "edit-record")});
      editBtn?.addEventListener('click', () => { document.getElementById('edit-panel').hidden = false; editBtn.disabled = true; });
      document.getElementById('cancel-edit')?.addEventListener('click', () => { document.getElementById('edit-panel').hidden = true; editBtn.disabled = false; });
      document.getElementById('open-modal')?.addEventListener('click', () => document.getElementById('modal-mask').classList.add('open'));
      document.getElementById('close-modal')?.addEventListener('click', () => document.getElementById('modal-mask').classList.remove('open'));
      document.getElementById('modal-mask')?.addEventListener('click', (e) => { if (e.target.id === 'modal-mask') e.target.classList.remove('open'); });
    </script>`,
  );
}

async function handle(req: any, res: any, url: URL, body: Buffer) {
  const path = url.pathname;
  const delay = state.faults.delayMs;
  if (delay > 0 && !path.startsWith("/api/")) await new Promise((r) => setTimeout(r, delay));

  if (path === "/" || path === "/records") return html(res, listPage(url));
  if (path === "/new") {
    return html(
      res,
      page(
        "New record — Records",
        `${header()}<main><div class="card"><h2>New record</h2>
        <form method="post" action="/records/create">
          <label for="n-title">Title</label><input id="n-title" name="title" required>
          <label for="n-owner">Owner</label><select id="n-owner" name="owner">${OWNERS.map((o) => `<option>${o}</option>`).join("")}</select>
          <label for="n-status">Status</label><select id="n-status" name="status">${STATUSES.map((s) => `<option>${s}</option>`).join("")}</select>
          <div style="margin-top:10px"><button id="create-record" type="submit">Create record</button></div>
        </form></div></main>`,
      ),
    );
  }
  if (path === "/records/create" && req.method === "POST") {
    const f = parseForm(body, req.headers["content-type"]);
    const n = state.records.size + 1;
    const id = `rec-${String(n).padStart(2, "0")}`;
    state.records.set(id, {
      id,
      title: f.title ?? "untitled",
      owner: f.owner ?? OWNERS[0]!,
      status: (f.status as Status) ?? "draft",
      summary: "",
      updatedAt: new Date().toISOString(),
      attachments: [],
    });
    res.writeHead(303, { location: `/records/${id}` });
    return res.end();
  }
  if (path === "/popup-info") {
    return html(
      res,
      page("Pop-up info", `<header><h1>Pop-up</h1></header><main><div class="card"><p id="popup-text">This is a pop-up window opened with window.open.</p></div></main>`),
    );
  }
  const m = /^\/records\/(rec-\d+)(\/.*)?$/.exec(path);
  if (m) {
    const rec = state.records.get(m[1]!);
    const sub = m[2] ?? "";
    if (!rec) return notFound(res);
    if (sub === "" || sub === "/") return html(res, detailPage(rec, url));
    if (sub === "/save" && req.method === "POST") {
      const f = parseForm(body, req.headers["content-type"]);
      const timeoutAfterSave = url.searchParams.get("fault") === "timeout-after-save" || state.faults.timeoutAfterSave;
      if (f.title) rec.title = f.title;
      if (f.owner) rec.owner = f.owner;
      if (f.status) rec.status = f.status as Status;
      if (f.summary !== undefined) rec.summary = f.summary;
      rec.updatedAt = new Date().toISOString();
      state.edits.push({ id: rec.id, at: Date.now(), fields: f });
      if (timeoutAfterSave) {
        // pathological: save applied, response never arrives
        return;
      }
      res.writeHead(303, { location: `/records/${rec.id}?saved=1` });
      return res.end();
    }
    if (sub.startsWith("/download/")) {
      if (state.faults.removeRecord === rec.id || url.searchParams.get("fault") === "blocked-download") {
        return send(res, 403, "download blocked by fault switch", "text/plain");
      }
      const name = decodeURIComponent(sub.slice("/download/".length));
      const file = rec.attachments.find((a) => a.name === name);
      if (!file) return notFound(res);
      state.downloads.push({ id: rec.id, file: name, at: Date.now() });
      res.writeHead(200, {
        "content-type": "application/octet-stream",
        "content-disposition": `attachment; filename="${name}"`,
      });
      return res.end(file.content);
    }
    if (sub === "/slow-info") {
      await new Promise((r) => setTimeout(r, 2500));
      return html(res, page("Slow info", `${header()}<main><div class="card"><h2>Slow info for ${rec.id}</h2><p>Arrived after an intentional delay.</p></div></main>`));
    }
    return notFound(res);
  }

  // ---- control / truth APIs (not part of the "site") ----
  if (path === "/api/state") {
    return json(res, {
      records: [...state.records.values()],
      edits: state.edits,
      downloads: state.downloads,
      faults: state.faults,
    });
  }
  if (path === "/api/faults" && req.method === "POST") {
    const f = JSON.parse(body.toString("utf8") || "{}");
    Object.assign(state.faults, f);
    return json(res, { ok: true, faults: state.faults });
  }
  if (path === "/api/reset" && req.method === "POST") {
    state.faults = { delayMs: 0, renameEditButton: false, timeoutAfterSave: false, removeRecord: "" };
    return json(res, { ok: true });
  }
  return notFound(res);
}

serve(Number(process.env.PORT ?? 4810), "records-app", handle);
