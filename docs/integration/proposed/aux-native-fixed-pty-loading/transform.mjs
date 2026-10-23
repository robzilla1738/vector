// Inactive source proposal. Requires coordinated finite signed PTY image policy.
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
const pin=JSON.parse(readFileSync(new URL('./anchor.json',import.meta.url),'utf8'));
export const fixedPtyLoader='function loadNodePty(){if(loadedNodePty)return loadedNodePty;if(process.platform!==`darwin`||process.arch!==`arm64`)throw Error(`PTY_UNAVAILABLE: unsupported native embedded target.`);let Cn=path.resolve(path.dirname(process.execPath),`../Resources/native/node-pty/package.json`);try{ensureSpawnHelperExecutable(Cn);let ei=createRequire(Cn);return loadedNodePty=ei(path.dirname(Cn)),loadedNodePty}catch(Cn){throw Error(`PTY_UNAVAILABLE: node-pty could not be loaded (${Cn instanceof Error?Cn.message:String(Cn)}).`)}}function ensureSpawnHelperExecutable(Cn){let ei=path.join(path.dirname(Cn),`prebuilds`,`darwin-arm64`,`spawn-helper`);if(!(statSync(ei).mode&73))throw Error(`PTY_UNAVAILABLE: sealed spawn-helper is not executable.`)}';
export function adaptEmbeddedFixedPtyLoading(original,composed,mode){
 if(mode!=='embedded-daemon-arm64-v1')throw Error('Explicit embedded successor mode required');
 if(createHash('sha256').update(original).digest('hex')!==pin.originalSha256)throw Error('PTY original source pin mismatch');
 if(original.split(pin.anchor).length!==2||composed.split(pin.anchor).length!==2)throw Error('PTY source anchor count mismatch');
 if(composed.includes(fixedPtyLoader))throw Error('PTY transform already applied');
 return composed.replace(pin.anchor,fixedPtyLoader);
}
