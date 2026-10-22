import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const source=await readFile('/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/agent/background.js','utf8');
const start=source.indexOf('async function rw(e) {'),end=source.indexOf('async function nw(e, t) {',start);
const find=source.slice(start,end);
const replace=`async function rw(e) {
  if (e.name !== tw) return;
  let t = null;
  const r = () => {
    const active = t;
    t = null;
    active?.abort();
  };
  e.onDisconnect.addListener(r), e.onMessage.addListener((n) => {
    if (n.type === "lasso:transform:abort") {
      r();
      return;
    }
    if (n.type !== "lasso:transform:start") return;
    r();
    const owner = new AbortController();
    t = owner;
    nw(n.request, {
      signal: owner.signal,
      onChunk: (o) => {
        if (t === owner) e.postMessage({
          type: "lasso:transform:chunk",
          chunk: o
        });
      }
    }).then(() => {
      if (t !== owner) return;
      t = null;
      e.postMessage({ type: "lasso:transform:complete" });
    }).catch((o) => {
      if (t !== owner) return;
      t = null;
      o.name !== "AbortError" && e.postMessage({
        type: "lasso:transform:error",
        error: o instanceof Error ? o.message : "Failed to generate a response."
      });
    });
  });
}
`;
if(source.split(find).length!==2)throw new Error('anchor mismatch');
const sha=v=>createHash('sha256').update(v).digest('hex');
await writeFile(new URL('patch.json',import.meta.url),JSON.stringify({component:'agent',path:'background.js',baselineSha256:sha(source),outputSha256:sha(source.replace(find,replace)),edits:[{find,replace,count:1,kind:'integration'}]},null,2)+'\n');
