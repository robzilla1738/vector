/** Static state-generation pairing. Does not perform or certify any state migration. */
import { createHash } from 'node:crypto';
import { readFile, lstat, realpath } from 'node:fs/promises';
import { isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const repository = fileURLToPath(new URL('../../', import.meta.url));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const safe = path => typeof path === 'string' && path.length && !isAbsolute(path) && !path.split('/').some(part => ['', '.', '..'].includes(part));
const count = (text, needle) => text.split(needle).length - 1;
export const auxNativeEventContracts = Object.freeze([
  Object.freeze({path:'chrome/browser/ui/views/frame/aux_tabs_actions.cc',name:'verticalTabsTidy',constant:'kTidyMessage'}),
  Object.freeze({path:'chrome/browser/notifications/aux_notification_inbox.cc',name:'inboxNotification',constant:'kInboxMessage'}),
  Object.freeze({path:'chrome/browser/notifications/aux_notification_inbox.cc',name:'notificationPermissionChanged',constant:null}),
]);
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function assertRuntimeEvents({stateIdentityVersion,nativeSources,agentBackground}) {
  if(typeof agentBackground!=='string'||!agentBackground.length)throw Error('Actual pinned Agent background required for runtime event pairing');
  const namespace=stateIdentityVersion===2?'aux':'aside',other=stateIdentityVersion===2?'aside':'aux';
  const paths=new Set();
  for(const event of auxNativeEventContracts){
    const text=nativeSources?.[event.path],expected=namespace+'.'+event.name,forbidden=other+'.'+event.name;
    if(typeof text!=='string'||!text.length)throw Error('Missing native runtime-event source: '+event.path);
    for(const[label,source]of [['native',text],['Agent',agentBackground]]){
      // Prefix count also rejects compounds such as aux.inboxNotification.extra.
      // Counting only the quoted exact token would miss that mixed routing path.
      if(source.includes(forbidden)||count(source,expected)!==1||count(source,JSON.stringify(expected))!==1)throw Error('Runtime event generation mismatch: '+label+': '+expected);
    }
    const token=escapeRegex(JSON.stringify(expected));
    const producer=event.constant?new RegExp('constexpr\\s+char\\s+'+event.constant+'\\[\\]\\s*=\\s*'+token+'\\s*;'):new RegExp('Dispatch\\(\\*profile_,\\s*'+token+',');
    if(!producer.test(text))throw Error('Missing actual native event producer: '+expected);
    const receiver=new RegExp('if\\s*\\(\\s*[A-Za-z_$][\\w$]*\\?\\.type\\s*===\\s*'+token+'\\s*\\)');
    if(!receiver.test(agentBackground))throw Error('Missing actual Agent event receiver: '+expected);
    paths.add(event.path);
  }
  return {nativeRuntimeEvents:auxNativeEventContracts.length,nativeEventFiles:[...paths].map(path=>({path,sha256:digest(nativeSources[path])})),agentRuntimeEvents:{path:'background.js',sha256:digest(agentBackground)},staticRuntimeEventPairing:true};
}


/** Pass complete explicit declarations from each source manifest. Never infer v2. */
export function assertAuxStateIdentityDeclarations({ identityProfile, stateIdentityVersion, declarations }) {
  if (!['compatibility', 'aux-v1'].includes(identityProfile)) throw Error('Explicit recognized identity profile required');
  if (![1, 2].includes(stateIdentityVersion)) throw Error('Explicit stateIdentityVersion 1 or 2 required');
  if (stateIdentityVersion === 2 && identityProfile !== 'aux-v1') throw Error('State identity v2 requires aux-v1 protocol identity');
  for (const role of ['stage', 'ui', 'apps']) {
    const declaration = declarations?.[role];
    if (declaration?.identityProfile !== identityProfile || declaration?.stateIdentityVersion !== stateIdentityVersion) throw Error(`State identity declaration mismatch: ${role}`);
  }
  return { version: 1, identityProfile, stateIdentityVersion, declarationsPaired: true, migrationAcceptance: false };
}
function validateReview(review) {
  if (review?.version !== 1 || review.kind !== 'aux-native-preference-identity' || review.keys?.length !== 19 || review.files?.length !== 21) throw Error('Complete reviewed nineteen-key native preference contract required');
  const keys = new Set(), paths = new Set(), found = new Set();
  for (const key of review.keys) {
    if (typeof key.from !== 'string' || !/^aside\.[a-z0-9_.]+$/.test(key.from) || key.to !== `aux.${key.from.slice(6)}` || keys.has(key.from)) throw Error('Invalid reviewed preference identity');
    keys.add(key.from);
  }
  for (const file of review.files) {
    if (!safe(file.path) || paths.has(file.path) || !/^[a-f0-9]{64}$/.test(file.baselineSha256) || !/^[a-f0-9]{64}$/.test(file.outputSha256) || !Array.isArray(file.edits) || !file.edits.length) throw Error('Invalid reviewed native preference file');
    paths.add(file.path);
    const edits = new Set();
    for (const edit of file.edits) {
      // Exact quoted tokens: unrelated events such as aside.verticalTabsTidy are not preferences.
      const key = edit.find?.slice(1, -1);
      if (!keys.has(key) || edit.find !== JSON.stringify(key) || edit.replace !== JSON.stringify(`aux.${key.slice(6)}`) || !Number.isSafeInteger(edit.count) || edit.count < 1 || edits.has(key)) throw Error('Invalid quoted preference anchor');
      edits.add(key); found.add(key);
    }
  }
  if (found.size !== keys.size) throw Error('Incomplete native preference key coverage');
}
/** Pure checks over complete actual native source texts, after caller hash verification. */
export function assertAuxStateIdentityPairing({ identityProfile, stateIdentityVersion, declarations, nativeSources, preferenceReview, agentBackground }) {
  const declarationReport = assertAuxStateIdentityDeclarations({ identityProfile, stateIdentityVersion, declarations });
  validateReview(preferenceReview);
  const nativeFiles = [];
  let checkedOccurrences = 0;
  for (const file of preferenceReview.files) {
    const text = nativeSources?.[file.path];
    if (typeof text !== 'string' || !text.length) throw Error(`Missing native preference source: ${file.path}`);
    for (const edit of file.edits) {
      const expected = stateIdentityVersion === 2 ? edit.replace : edit.find;
      const forbidden = stateIdentityVersion === 2 ? edit.find : edit.replace;
      if (count(text, expected) !== edit.count || text.includes(forbidden)) throw Error(`Native preference generation mismatch: ${file.path}: ${expected}`);
      checkedOccurrences += edit.count;
    }
    nativeFiles.push({ path: file.path, sha256: digest(text) });
  }
  const eventEvidence=assertRuntimeEvents({stateIdentityVersion,nativeSources,agentBackground});
  return { ...declarationReport, ...eventEvidence, nativePreferenceKeys: preferenceReview.keys.length, nativePreferenceFiles: nativeFiles, checkedOccurrences, staticNativePairing: true, runtimeAcceptance: false };
}
async function regular(path) {
  if (await realpath(path) !== resolve(path) || !(await lstat(path)).isFile()) throw Error(`Canonical regular state-identity input required: ${path}`);
  return readFile(path);
}
/** Read-only packaging preflight. Final composition pins allow unrelated reviewed source fixes. */
export async function verifyAuxStateIdentityContract({ stageRoot, composition, nativeRoot = composition?.sourceRoot, identityProfile, stateIdentityVersion, preferenceReviewPath = join(repository, 'docs/integration/proposed/aux-native-preference-identity/manifest.json'), preferenceReviewSha256 }) {
  if (nativeRoot !== composition?.sourceRoot || !isAbsolute(nativeRoot ?? '')) throw Error('Matching native composition root required');
  const declarations = {};
  for (const [role, path] of [['stage', 'manifest.json'], ['ui', 'ui/manifest.json'], ['apps', 'apps/manifest.json']]) declarations[role] = JSON.parse(await regular(join(stageRoot, path)));
  assertAuxStateIdentityDeclarations({ identityProfile, stateIdentityVersion, declarations });
  const reviewBytes = await regular(preferenceReviewPath);
  if (preferenceReviewSha256 !== undefined && (!/^[a-f0-9]{64}$/.test(preferenceReviewSha256) || digest(reviewBytes) !== preferenceReviewSha256)) throw Error('Native preference review input hash mismatch');
  const preferenceReview = JSON.parse(reviewBytes);
  validateReview(preferenceReview);
  const nativeSources = {};
  const nativePaths=new Set([...preferenceReview.files.map(file=>file.path),...auxNativeEventContracts.map(event=>event.path)]);
  for (const path of nativePaths) {
    const file={path};
    const entries = composition.files?.filter(entry => entry.path === file.path);
    if (entries?.length !== 1 || !/^[a-f0-9]{64}$/.test(entries[0].outputSha256)) throw Error(`Missing unique final composition state-identity pin: ${file.path}`);
    const bytes = await regular(join(nativeRoot, file.path));
    if (digest(bytes) !== entries[0].outputSha256) throw Error(`Final composition native state-identity hash mismatch: ${file.path}`);
    nativeSources[file.path] = bytes.toString('utf8');
  }
  const agentEntries=declarations.ui.components?.agent?.files?.filter(file=>file.path==='background.js');
  if(agentEntries?.length!==1||!/^[a-f0-9]{64}$/.test(agentEntries[0].outputSha256))throw Error('Missing unique staged Agent background pin');
  const agentBytes=await regular(join(stageRoot,'ui/agent/background.js'));
  if(digest(agentBytes)!==agentEntries[0].outputSha256)throw Error('Staged Agent background hash mismatch');
  return { ...assertAuxStateIdentityPairing({ identityProfile, stateIdentityVersion, declarations, nativeSources, preferenceReview, agentBackground:agentBytes.toString('utf8') }), preferenceReviewSha256: digest(reviewBytes) };
}
