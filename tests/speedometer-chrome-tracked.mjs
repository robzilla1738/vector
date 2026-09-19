#!/usr/bin/env node
/**
 * H3-5: same-machine Chrome timing of the Speedometer TodoMVC-JavaScript-ES5
 * add/complete/delete loop. Tracked only. Not an official BrowserBench score.
 */
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const outPath =
  process.env.CHROME_SP_OUT ||
  join(root, "docs/engine/evidence/speedometer-chrome-tracked.json");

const html = `<!doctype html>
<meta charset="utf-8">
<title>TodoMVC ES5 tracked</title>
<section class="todoapp"><input class="new-todo"><ul class="todo-list"></ul></section>
<script>
window.__run = function (n) {
  const list = document.querySelector(".todo-list");
  const t0 = performance.now();
  for (let i = 0; i < n; i++) {
    const li = document.createElement("li");
    li.textContent = "item " + i;
    list.appendChild(li);
  }
  const afterAdd = list.children.length;
  list.children[0].className = "completed";
  list.children[0].remove();
  const t1 = performance.now();
  return { n: afterAdd, after: list.children.length, ms: t1 - t0 };
};
</script>`;

function chromeBin() {
  return process.env.CHROME_BIN || "google-chrome";
}

async function waitHttp(url, ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`timeout waiting for ${url}`);
}

async function cdpConnect(port) {
  await waitHttp(`http://127.0.0.1:${port}/json/version`, 8000);
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target = tabs.find((t) => t.type === "page") || tabs[0];
  if (!target?.webSocketDebuggerUrl) throw new Error("no CDP target");
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve);
    ws.addEventListener("error", reject);
  });
  let next = 0;
  const pending = new Map();
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id != null && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++next;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  return { send, ws };
}

async function main() {
  const version = await new Promise((resolve) => {
    const p = spawn(chromeBin(), ["--version"]);
    let out = "";
    p.stdout.on("data", (d) => {
      out += d;
    });
    p.on("close", () => resolve(out.trim()));
  });

  const server = createServer((req, res) => {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(html);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/`;
  const dbg = 9333;
  const userData = `/tmp/chrome-sp-tracked-${process.pid}`;
  const chrome = spawn(
    chromeBin(),
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--disable-extensions",
      `--user-data-dir=${userData}`,
      `--remote-debugging-port=${dbg}`,
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  let chromeErr = "";
  chrome.stderr.on("data", (d) => {
    chromeErr += d;
  });
  try {
    const { send, ws } = await cdpConnect(dbg);
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Page.navigate", { url });
    const readyDeadline = Date.now() + 8000;
    for (;;) {
      const ready = await send("Runtime.evaluate", {
        expression: "document.readyState",
        returnByValue: true,
      });
      if (ready?.result?.value === "complete") break;
      if (Date.now() > readyDeadline) throw new Error("page load timeout");
      await new Promise((r) => setTimeout(r, 50));
    }
    const evaled = await send("Runtime.evaluate", {
      expression: "window.__run(50)",
      returnByValue: true,
      awaitPromise: false,
    });
    const v = evaled?.result?.value;
    if (!v || v.n !== 50 || v.after !== 49) {
      throw new Error(`unexpected result ${JSON.stringify(evaled)}`);
    }
    const evidence = {
      review: "H3-5",
      backend: "google-chrome",
      chromeVersion: version,
      suite: "speedometer.3.0.TodoMVC-JavaScript-ES5",
      measured: true,
      officialSuite: false,
      officialDisplayedScore: false,
      n: 1,
      samples_ms: [v.ms],
      phases: { jsMs: v.ms },
      items: { added: v.n, afterDelete: v.after },
      host: process.arch,
      notes:
        "Same-machine Chrome timing of the TodoMVC-JavaScript-ES5 add/complete/delete loop. Tracked only. Not an official Speedometer displayed score and not a target.",
      artifact: { harness: "tests/speedometer-chrome-tracked.mjs" },
    };
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(JSON.stringify({ ok: true, out: outPath, ms: v.ms, chrome: version }));
    ws.close();
  } catch (e) {
    console.error(chromeErr);
    throw e;
  } finally {
    chrome.kill("SIGKILL");
    server.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
