// Source composition only; does not load a module, invoke factory or call OS APIs.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const here=new URL('.',import.meta.url),root=new URL('../../../../',here),hash=b=>createHash('sha256').update(b).digest('hex');
const receipt=JSON.parse(await readFile(new URL('evidence/owned-os-producer.json',here)));
for(const record of receipt.currentSources)assert.equal(hash(await readFile(new URL(record.path,root))),record.sha256,record.path);
const producer=await readFile(new URL('source/AuxSignedDevelopmentOwner.swift',here),'utf8'),build=await readFile(new URL('build.sh',here),'utf8');
const flow=['let afterImport=try AuxSignedDevelopmentPolicyLoader.load()','let osCustody=AuxOSJobCustody()','let osBoundary=AuxAppKitUtilityBoundary(custody:osCustody)','let osUtilities=AuxMacOSUtilityCommandCore(boundary:osBoundary)','let owner=try AuxOwnedCommandDispatcher(scopedTerminal:scoped,macOSUtilities:osUtilities)','Unmanaged.passRetained(owner)'];
let last=-1;for(const token of flow){const at=producer.indexOf(token);assert(at>last,token);assert.equal(producer.split(token).length-1,1,token);last=at;}
assert(!producer.includes('AuxOwnedCommandDispatcher(scopedTerminal:scoped)'));
assert(producer.includes('!AUX_MACOS_UTILITY_DISPATCH'));assert(!/\.(?:run|copyFileURL|openFile|generatePreview|applications|fileExists)\(/.test(producer));
for(const name of ['AuxOSJobCustody.swift','AuxMacOSUtilityCommandCore.swift','AuxUtilityCompletion.swift','AuxAppKitUtilityBoundary.swift'])assert.equal(build.split('"$proposal/aux-native-macos-utilities/source/'+name+'"').length-1,1,name);
for(const token of ['-D AUX_MACOS_UTILITY_DISPATCH','-framework AppKit','-framework QuickLookThumbnailing','-framework ImageIO'])assert.equal(build.split(token).length-1,2,token);
const dispatcher=await readFile(new URL('docs/integration/proposed/aux-owned-dispatch-lifetime/source/AuxOwnedCommandDispatcher.swift',root),'utf8');assert(dispatcher.includes('init(scopedTerminal:ScopedAuxCommandContext,macOSUtilities:AuxMacOSUtilityCommandCore)'));assert(dispatcher.includes('handle=try AuxCommandDispatcherRegistry.shared.install(scopedTerminal,utilities:macOSUtilities)'));
console.log('PASS: actual signed producer attaches immutable OS utility core to same scoped owner; exact production inputs/flags/frameworks pinned. No factory, OS effects, Keychain or module execution.');
