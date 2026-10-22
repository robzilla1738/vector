import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createHash,createCipheriv,hkdfSync} from 'node:crypto';
import {adaptDaemonCode} from '../../../../../vendor/provided/daemon-adapter.mjs';
import {prepareLegacyCskV2} from '../source/prepare-legacy-csk.mjs';
import {parseAuxCskV2Record,encryptAuxCskV2,decryptAuxCskV2} from '../source/aux-csk-v2-runtime.mjs';
import {applyPinnedAuxCskV2} from '../source/adapt.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex'),original=readFileSync(process.argv[2]??'/Users/rcourson/Documents/Vibe/web/out/provided-source-audit/daemon-original.mjs','utf8'),pins=JSON.parse(readFileSync(new URL('../source-pins.json',import.meta.url)));
const composed=adaptDaemonCode(original,{},'aux-v1',2),adapted=applyPinnedAuxCskV2({original,composed:composed.code});
const dk=Buffer.alloc(32,13),csk=Buffer.alloc(32,29);
function legacySeal(){const label=Buffer.from('aside.dk.csk.v1'),key=hkdfSync('sha256',dk,Buffer.alloc(0),label,32),nonce=Buffer.alloc(12,3),cipher=createCipheriv('chacha20-poly1305',key,nonce,{authTagLength:16});cipher.setAAD(label);return {purpose:'csk',nonce:nonce.toString('base64'),ciphertext:Buffer.concat([cipher.update(csk),cipher.final(),cipher.getAuthTag()]).toString('base64')};}
const old=legacySeal(),raw=Buffer.from('{ "schemaVersion":1, "accountId":7, "boundUserId":"synthetic-user", "syncGeneration":17, "encryptedBlob":'+JSON.stringify(old)+' }');
const prepared=prepareLegacyCskV2({bytes:raw,expectedSha256:hash(raw),rootKey:dk,expectedOwner:{accountId:7,boundUserId:'synthetic-user'}});
const prefix=raw.subarray(0,raw.indexOf(Buffer.from(JSON.stringify(old))));assert.deepEqual(prepared.bytes.subarray(0,prefix.length),prefix);assert.equal(prepared.bytes.subarray(-2).toString(),' }');
const parsed=parseAuxCskV2Record(prepared.bytes.toString());assert.deepEqual(parsed.owner,{accountId:7,boundUserId:'synthetic-user'});assert.equal(parsed.syncGeneration,17);assert.deepEqual(decryptAuxCskV2(dk,'csk',parsed.encryptedBlob),csk);
assert.throws(()=>prepareLegacyCskV2({bytes:raw,expectedSha256:hash(raw),rootKey:Buffer.alloc(32,99),expectedOwner:{accountId:7,boundUserId:'synthetic-user'}}));
assert.throws(()=>prepareLegacyCskV2({bytes:raw,expectedSha256:hash(raw),rootKey:dk,expectedOwner:{accountId:8,boundUserId:'synthetic-user'}}));
assert.throws(()=>parseAuxCskV2Record(raw.toString()));
const bare=Buffer.from(JSON.stringify(old)),barePrepared=prepareLegacyCskV2({bytes:bare,expectedSha256:hash(bare),rootKey:dk});assert.deepEqual(decryptAuxCskV2(dk,'csk',parseAuxCskV2Record(barePrepared.bytes.toString()).encryptedBlob),csk);
assert.throws(()=>prepareLegacyCskV2({bytes:prepared.bytes,expectedSha256:hash(prepared.bytes),rootKey:dk,expectedOwner:{accountId:7,boundUserId:'synthetic-user'}}));
// Execute the real three adapted functions, retaining their owner/generation
// guards and secure-storage readback loop, against fixed synthetic dependencies.
const map=new Map(),localKeyWrites=new Map(),AccountRegistry={getSession:()=>({accessToken:'synthetic-token'}),getAccount:()=>({userId:'synthetic-user'})};
const texts=pins.edits.map(x=>x.replace).join(';')+';'+pins.extracted.getExpectedLocalBootstrapKeyOwner+';'+pins.extracted.hasValidLocalBootstrapKeyOwner;
const names=['encryptAuxCskV2','decryptAuxCskV2','parseAuxCskV2Record','getDk','readAccessTokenSyncGeneration','AccountRegistry','localKeyWrites','initInstallation','unlock','readSecureStorageItem','saveSecureStorageItem','getChromeSyncKeyStorageKey','supportsInstallationBackedLocalKeys','getAuthenticatedUserId','logger'];
const consumer=new Function(...names,texts+';return {saveInstallationDerivedKeyBlob,readLocalChromeSyncKey}')(encryptAuxCskV2,decryptAuxCskV2,parseAuxCskV2Record,()=>dk,()=>17,AccountRegistry,localKeyWrites,async()=>{},async()=>{},async key=>map.get(key),async(key,value)=>map.set(key,value),id=>'aux.csk_'+id,()=>true,()=> 'synthetic-user',{warn:()=>{}});
map.set('aux.csk_7',prepared.bytes.toString());assert.deepEqual(await consumer.readLocalChromeSyncKey(7),csk);
await consumer.saveInstallationDerivedKeyBlob(7,'aux.csk_7','csk',csk,{syncGeneration:17});assert.deepEqual(await consumer.readLocalChromeSyncKey(7),csk);assert.equal(JSON.parse(map.get('aux.csk_7')).encryptedBlob.format,'aux.dk.v2');
map.set('aux.csk_7',raw.toString());await assert.rejects(consumer.readLocalChromeSyncKey(7));
assert.equal(adapted.activation,false);assert.throws(()=>applyPinnedAuxCskV2({original,composed:composed.code+' '}));
console.log('CSK v2 passed: authenticated rewrap, metadata-byte preservation, exact adapted writer/reader roundtrip, legacy/runtime and owner/key/version refusal');
