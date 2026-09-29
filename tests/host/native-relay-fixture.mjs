/** Real browser relay oracle. HTTP tests of this fixture do not qualify isolation. */
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createServer as createSecureServer } from "node:https";
import { createHash, randomUUID } from "node:crypto";

export const relayKinds = ["broadcast", "storage", "indexeddb", "cache", "postmessage"];
export async function createRelayFixture({ tls } = {}) {
  const channel = `aux-relay-${randomUUID()}`, marker = `private-relay-${randomUUID()}`;
  const credential = { username: "aux-isolation-fixture", password: `Aux-Isolation-${randomUUID()}!` };
  const origins = {}, captures = [], servers = [];
  let seeded = false;
  const validCase = value => typeof value === "string" && /^[a-z][a-z0-9-]{0,95}$/.test(value);
  for (const role of ["source", "recipient"]) {
    const handler = async (req, res) => {
      const url = new URL(req.url, origins[role]);
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Access-Control-Allow-Origin", "*");
      if (url.pathname === "/capture") {
        const name = url.searchParams.get("case");
        if (!validCase(name)) { res.writeHead(400).end(); return; }
        let bytes = 0;
        const digest = createHash("sha256").update(req.url);
        for await (const chunk of req) { bytes += chunk.length; if (bytes > 4096) { res.writeHead(413).end(); return; } digest.update(chunk); }
        captures.push({ case: name, role, method: req.method, bytes, digest: digest.digest("hex"), at: Date.now() });
        res.end("Captured"); return;
      }
      if (role !== "source") { res.writeHead(404).end(); return; }
      if (url.pathname === "/login-submit" && req.method === "POST") {
        let body = "";
        for await (const chunk of req) { body += chunk; if (body.length > 4096) { res.writeHead(413).end(); return; } }
        const form = new URLSearchParams(body);
        seeded = form.get("username") === credential.username && form.get("password") === credential.password;
        res.writeHead(303, { Location: "/actor?signed-in=1" }).end(); return;
      }
      if (!["/actor", "/receiver", "/race"].includes(url.pathname)) { res.writeHead(404).end(); return; }
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      const roleName = url.pathname.slice(1);
      res.end(`<!doctype html><meta charset="utf-8"><title>Aux isolation ${roleName}</title>
<h1>Aux isolation ${roleName}</h1><p>Disposable relay boundary fixture</p>
<label>Case <input id="case" value="unset"></label>
${[...relayKinds, "open-receiver", "seed-owner", "seed-run", "inspect-storage", "same-origin", "recipient", "autofill-probe", "stop-race"].map(name => `<button id="${name}" type="button">${name}</button>`).join("\n")}
<form method="post" action="/login-submit"><label>Username <input id="username" name="username" autocomplete="username"></label><label>Password <input id="password" name="password" type="password" autocomplete="current-password"></label><button type="submit">Sign in</button></form>
<output id="ready"></output><output id="result"></output><output id="state"></output>
<script>
const channel=${JSON.stringify(channel)}, marker=${JSON.stringify(marker)}, origins=${JSON.stringify(origins)}, role=${JSON.stringify(roleName)};
const result=document.getElementById('result'), state=document.getElementById('state');
const send=(name,value,destination='recipient')=>fetch(origins[destination]+'/capture?case='+encodeURIComponent(name),{method:'POST',body:value});
const packet=()=>({channel,name:document.getElementById('case').value,value:marker});
const seen=new Set();
async function relay(data){if(data?.channel!==channel||!data.name||seen.has(data.name))return;seen.add(data.name);try{await send(data.name,data.value);result.textContent='Forwarded '+data.name;}catch{result.textContent='Forward failed '+data.name;}}
const db=new Promise((resolve,reject)=>{const request=indexedDB.open(channel,1);request.onupgradeneeded=()=>request.result.createObjectStore('relay');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
const readDB=async()=>new Promise(async(resolve,reject)=>{const database=await db;const request=database.transaction('relay').objectStore('relay').get('packet');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
const writeDB=async data=>new Promise(async(resolve,reject)=>{const database=await db;const transaction=database.transaction('relay','readwrite');transaction.objectStore('relay').put(data,'packet');transaction.oncomplete=resolve;transaction.onerror=()=>reject(transaction.error);});
const broadcast=new BroadcastChannel(channel);
if(role==='receiver'){
 window.name=channel;broadcast.onmessage=event=>relay(event.data);
 addEventListener('storage',event=>{if(event.key===channel)try{relay(JSON.parse(event.newValue));}catch{}});
 addEventListener('message',event=>{if(event.origin===origins.source)relay(event.data);});
 setInterval(async()=>{try{const data=await readDB();if(data)relay(data);const response=await(await caches.open(channel)).match('/relay-packet');if(response)relay(await response.json());}catch{}},100);
}
const inspect=()=>{const owner=localStorage.getItem(channel+'-owner')===marker;
const run=localStorage.getItem(channel+'-run')===marker;
const cookie=document.cookie.includes('auxOwner=');
state.textContent='Storage owner='+owner+' run='+run+' cookie='+cookie+' opener='+(window.opener!==null)+' session='+(sessionStorage.getItem(channel+'-owner')===marker);};
const actions={
 'open-receiver':async()=>{window.relayReceiver=window.open('/receiver',channel);},
 broadcast:async()=>{broadcast.postMessage(packet());},
 storage:async()=>{localStorage.setItem(channel,JSON.stringify(packet()));},
 indexeddb:async()=>writeDB(packet()),
 cache:async()=>{await(await caches.open(channel)).put('/relay-packet',new Response(JSON.stringify(packet())));},
 postmessage:async()=>{const target=window.open('',channel);if(target)target.postMessage(packet(),origins.source);},
 'seed-owner':async()=>{localStorage.setItem(channel+'-owner',marker);sessionStorage.setItem(channel+'-owner',marker);document.cookie='auxOwner='+marker+'; Path=/; Max-Age=3600';inspect();},
 'seed-run':async()=>{localStorage.setItem(channel+'-run',marker);inspect();},
 'inspect-storage':async()=>inspect(),
 'same-origin':async()=>send(document.getElementById('case').value,'public control','source'),
 recipient:async()=>send(document.getElementById('case').value,'public control'),
 'autofill-probe':async()=>{await new Promise(resolve=>setTimeout(resolve,2000));const value=document.getElementById('password').value;
 state.textContent='Automatic password present='+Boolean(value);if(value)await send(document.getElementById('case').value,value);},
 'stop-race':async()=>{sessionStorage.setItem(channel+'-race-stop','yes');},
};
for(const[name,action]of Object.entries(actions))document.getElementById(name).onclick=async()=>{const id=document.getElementById('case').value;result.textContent='Attempted '+id;try{await action();result.textContent='Finished '+id;}catch{result.textContent='Refused '+id;}};
Promise.all([db,caches.open(channel)]).then(()=>{document.getElementById('ready').textContent='Relay endpoints ready';inspect();});
if(role==='race'&&sessionStorage.getItem(channel+'-race-stop')!=='yes')setTimeout(()=>location.replace('/race?epoch='+Date.now()),25);
</script>`);
    };
    const server = tls ? createSecureServer(tls, handler) : createServer(handler);
    await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
    origins[role] = `${tls ? "https" : "http"}://127.0.0.1:${server.address().port}`;
    servers.push(server);
  }
  return { origins, credential, seeded: () => seeded, marker,
    url: path => `${origins.source}/${path}`,
    snapshot: () => captures.map(item => ({ ...item })),
    count: name => captures.filter(item => item.case === name).length,
    assertCount(name, count, role) { const found = captures.filter(item => item.case === name); assert.equal(found.length, count, `Receiver count for ${name}`); if (role) assert.ok(found.every(item => item.role === role)); },
    async close() { await Promise.all(servers.map(server => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }))); },
  };
}
