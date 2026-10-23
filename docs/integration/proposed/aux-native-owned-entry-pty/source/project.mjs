// Proposed resource only. Does not change fallback staging/admission.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {projectOwnedNativeEntry} from '../../aux-native-owned-entry-routing/source/project.mjs';
import {fixedPtyLoader} from '../../aux-native-fixed-pty-loading/transform.mjs';
const pin=JSON.parse(readFileSync(new URL('../../aux-native-fixed-pty-loading/anchor.json',import.meta.url),'utf8'));
export function projectOwnedNativeEntryWithFixedPty(original,quarantined){
 if(createHash('sha256').update(original).digest('hex')!==pin.originalSha256||original.split(pin.anchor).length!==2)throw Error('PTY original source pin/count mismatch');
 const owned=projectOwnedNativeEntry(quarantined);
 // Exact reviewed existing node-development adaptation: executable location
 // already comes from assets.mjs. No other normalization/search is accepted.
 const adapted=pin.anchor.replace('let ei=path.dirname(process.execPath),ti=','let ei=__auxDaemonMacOS,ti=');
 if(adapted===pin.anchor||owned.split(adapted).length!==2)throw Error('Exact owned Node PTY anchor required');
 return owned.replace(adapted,fixedPtyLoader);
}
