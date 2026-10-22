import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const url=new URL('../provided-notification-window-routing/patch.json',import.meta.url);
const patch=JSON.parse(execFileSync('git',['show','e03aef448:docs/integration/proposed/provided-notification-window-routing/patch.json'],{cwd:new URL('../../../..',import.meta.url),encoding:'utf8'}));
const before=patch.edits[0].replace;
let after=before.replace('  const r = ry(e), n = chrome.runtime.getURL("main.html"), o =', '  let sourceWindowId = t;\n  try {\n  const r = ry(e), n = chrome.runtime.getURL("main.html"), o =');
after=after.replace('  if (typeof o?.id == "number") {\n    const s =', '  if (typeof o?.id == "number") {\n    sourceWindowId = o.windowId ?? sourceWindowId;\n    const s =');
after=after.replace('  chrome.windows?.update && typeof i.windowId == "number"', '  sourceWindowId = i.windowId ?? sourceWindowId;\n  chrome.windows?.update && typeof i.windowId == "number"');
const tail='}\n';
if(!after.endsWith(tail))throw new Error('Unexpected function end');
after=after.slice(0,-tail.length)+`  } catch (error) {
    // Retry only after proving the exact original-profile window vanished.
    // Permission, policy and other errors on a surviving target stay errors.
    if (!Number.isInteger(sourceWindowId) || sourceWindowId < 0 ||
        (await chrome.windows.getAll()).some((window) => window.id === sourceWindowId)) {
      throw error;
    }
    await chrome.windows.create({ url: ry(e), type: "normal", focused: !0, incognito: !1 });
  }
}
`;
if(after===before)throw new Error('No change');
patch.edits[0].replace=after;
const source=await readFile('/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/agent/background.js','utf8');
if(source.split(patch.edits[0].find).length!==2)throw new Error('Anchor changed');
const output=source.replace(patch.edits[0].find,after);
patch.outputSha256=createHash('sha256').update(output).digest('hex');
await writeFile(url,JSON.stringify(patch,null,2)+'\n');
await writeFile('/tmp/aux-notification-race-background-check.js',output);
