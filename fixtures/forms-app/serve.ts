/**
 * Forms fixture: native fields, rich text (contenteditable), autocomplete,
 * validation, file upload — with a server-side record of what was received.
 */
import { createHash } from "node:crypto";
import { html, json, notFound, page, serve } from "../shared/http.ts";

const state = {
  submissions: [] as Record<string, unknown>[],
  uploads: [] as { field: string; name: string; size: number; sha1: string }[],
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const FORM_PAGE = page(
  "Intake form — fixture",
  `<header><h1>Intake form</h1><a href="/">Form</a><a href="/api/state">State JSON</a><span class="muted" style="margin-left:auto">fixture :4811</span></header>
<main>
  <form class="card" method="post" action="/submit" enctype="multipart/form-data" id="intake">
    <label for="name">Full name</label>
    <input id="name" name="name" required minlength="2" placeholder="e.g. Alex Rivera">

    <label for="email">Email</label>
    <input id="email" name="email" type="email" required placeholder="name@example.com">

    <label for="role">Role</label>
    <select id="role" name="role" required>
      <option value="">Choose…</option><option>Engineer</option><option>Designer</option><option>Manager</option>
    </select>

    <label for="city">City (autocomplete)</label>
    <input id="city" name="city" list="cities" autocomplete="off">
    <datalist id="cities"><option>Springfield</option><option>Shelbyville</option><option>Capital City</option><option>Ogdenville</option></datalist>

    <label for="dept">Department (suggest)</label>
    <input id="dept" name="dept" autocomplete="off">
    <div id="dept-suggest" class="card" style="display:none;padding:6px"></div>

    <fieldset style="border:1px solid #d9dde3;border-radius:6px;margin-top:12px">
      <legend class="muted">Preferences</legend>
      <label style="display:inline-block;margin-right:12px"><input type="checkbox" name="pref" value="email"> Email</label>
      <label style="display:inline-block;margin-right:12px"><input type="checkbox" name="pref" value="sms"> SMS</label>
      <label style="display:inline-block"><input type="checkbox" name="pref" value="post"> Post</label>
      <div style="margin-top:8px">
        <label style="display:inline-block;margin-right:12px"><input type="radio" name="plan" value="basic"> Basic</label>
        <label style="display:inline-block"><input type="radio" name="plan" value="pro"> Pro</label>
      </div>
    </fieldset>

    <label for="bio">Bio (rich text)</label>
    <div id="bio" contenteditable="true" style="min-height:70px;border:1px solid #c7cdd6;border-radius:6px;padding:8px;background:#fff"></div>
    <input type="hidden" name="bio" id="bio-hidden">

    <label for="resume">Resume (upload)</label>
    <input id="resume" name="resume" type="file">

    <label for="start">Start date</label>
    <input id="start" name="start" type="date">

    <div style="margin-top:14px"><button id="submit-intake" type="submit">Submit intake</button>
    <button type="button" class="secondary" id="fill-demo">Fill demo data</button></div>
    <p class="muted" id="form-status" role="status"></p>
  </form>
</main>
<script>
  const dept = document.getElementById('dept');
  const sug = document.getElementById('dept-suggest');
  const DEPTS = ['Structural Engineering','Field Operations','Virtual Design','Preconstruction','Safety','Estimating'];
  dept.addEventListener('input', () => {
    const q = dept.value.toLowerCase();
    const hits = DEPTS.filter(d => !q || d.toLowerCase().includes(q));
    if (!hits.length || !q) { sug.style.display='none'; return; }
    sug.innerHTML = hits.map(d => '<div class="dept-opt" style="padding:4px;cursor:pointer">'+d+'</div>').join('');
    sug.style.display = 'block';
    for (const el of sug.querySelectorAll('.dept-opt')) el.addEventListener('mousedown', (e) => { e.preventDefault(); dept.value = el.textContent; sug.style.display='none'; });
  });
  dept.addEventListener('blur', () => setTimeout(() => sug.style.display='none', 150));

  document.getElementById('fill-demo').addEventListener('click', () => {
    document.getElementById('name').value = 'Test Person';
    document.getElementById('email').value = 'test@example.com';
    document.getElementById('role').value = 'Engineer';
    document.getElementById('city').value = 'Springfield';
    document.getElementById('dept').value = 'Field Operations';
    document.getElementById('bio').innerHTML = '<b>Deterministic</b> bio text.';
  });

  document.getElementById('intake').addEventListener('submit', (e) => {
    document.getElementById('bio-hidden').value = document.getElementById('bio').innerText;
    if (!e.target.checkValidity()) { document.getElementById('form-status').textContent = 'validation failed'; return; }
    document.getElementById('form-status').textContent = 'submitting…';
  });
</script>`,
);

async function handle(req: any, res: any, url: URL, body: Buffer) {
  const path = url.pathname;
  if (path === "/") return html(res, FORM_PAGE);
  if (path === "/submit" && req.method === "POST") {
    const ctype = req.headers["content-type"] ?? "";
    if (ctype.includes("multipart/form-data")) {
      const boundary = ctype.split("boundary=")[1];
      const fields: Record<string, string> = {};
      const raw = body.toString("binary");
      for (const part of raw.split(`--${boundary}`)) {
        const m = /name="([^"]+)"(?:;\s*filename="([^"]*)")?/.exec(part);
        if (!m) continue;
        const contentStart = part.indexOf("\r\n\r\n");
        if (contentStart === -1) continue;
        const value = part.slice(contentStart + 4).replace(/\r\n$/, "");
        if (m[2]) {
          const buf = Buffer.from(value, "binary");
          state.uploads.push({
            field: m[1]!,
            name: m[2],
            size: buf.length,
            sha1: createHash("sha1").update(buf).digest("hex"),
          });
        } else {
          fields[m[1]!] = value;
        }
      }
      state.submissions.push({ at: Date.now(), fields });
      return html(
        res,
        page(
          "Submitted — fixture",
          `<header><h1>Intake form</h1></header><main><div class="card"><h2 id="submit-ok">Submitted</h2><p>Saved ${Object.keys(fields).length} fields and ${state.uploads.length} upload(s) total.</p><a class="btn" href="/">New form</a></div></main>`,
        ),
      );
    }
    return send(res, 415, "expected multipart", "text/plain");
  }
  if (path === "/api/state") return json(res, state);
  if (path === "/api/reset" && req.method === "POST") {
    state.submissions = [];
    state.uploads = [];
    return json(res, { ok: true });
  }
  return notFound(res);
}

// express-free multipart is fine here; keep imports tidy
import { send } from "../shared/http.ts";
serve(Number(process.env.PORT ?? 4811), "forms-app", handle);
