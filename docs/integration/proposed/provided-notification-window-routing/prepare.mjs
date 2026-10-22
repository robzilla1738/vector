import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const source=await readFile('/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/agent/background.js','utf8');
const start=source.indexOf('async function ic(e, t) {'),end=source.indexOf('async function ny() {',start);
const find=source.slice(start,end);
const replace=find.replace('  const r = ry(e), n = chrome.runtime.getURL("main.html"), o =', `  // A concrete target may have closed or changed native profile. Do not
  // select a substitute hidden workspace; create in this caller's profile.
  if (Number.isInteger(t) && t >= 0 &&
      !(await chrome.windows.getAll()).some((window) => window.id === t)) {
    await chrome.windows.create({ url: ry(e), type: "normal", focused: !0, incognito: !1 });
    return;
  }
  const r = ry(e), n = chrome.runtime.getURL("main.html"), o =`);

if(source.split(find).length!==2)throw new Error('anchor mismatch');
const sha=v=>createHash('sha256').update(v).digest('hex');
await writeFile(new URL('patch.json',import.meta.url),JSON.stringify({component:'agent',path:'background.js',baselineSha256:sha(source),outputSha256:sha(source.replace(find,replace)),edits:[{find,replace,count:1,kind:'integration'}]},null,2)+'\n');
