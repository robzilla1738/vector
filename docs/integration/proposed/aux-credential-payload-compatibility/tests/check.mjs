import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {webcrypto,createCipheriv,createDecipheriv} from 'node:crypto';
import {prepareCredentialPayloadCopy as prepare} from '../source/prepare.mjs';
import {extractPinnedConsumers} from '../source/extract.mjs';
import {adaptDaemonCode} from '../../../../../vendor/provided/daemon-adapter.mjs';
import {decryptAuxBlob} from '../../../../../vendor/provided/aux-crypto-identity.mjs';
const source=readFileSync(process.argv[2]??'/Users/rcourson/Documents/Vibe/web/out/provided-source-audit/daemon-original.mjs','utf8'),f=extractPinnedConsumers(source);
const channelKey='aux.channel.v1.u7.12345678-1234-4234-8234-123456789abc.slack.bot',channelPayload=Buffer.from('synthetic-token: user-provided text unchanged');
const composed=adaptDaemonCode(source,{},'aux-v1',2);
assert.equal(composed.sha256,'d69b87e91e30edadaef456b63d7f4751a09ce4c997f31b6129d01b5801a3e6d4');
assert.ok(composed.code.includes('DK_SUBKEY_INFO_PREFIX=`aside.dk.`,DK_WRAP_INFO=`aside.wrap.dk.v1`'));
assert.ok(composed.code.includes(f.secretKey.replaceAll('ASIDE_KEYCHAIN_ID_PREFIX','AUX_KEYCHAIN_ID_PREFIX')));
let stored;
const channel=new Function('AUX_KEYCHAIN_ID_PREFIX','saveSecureStorageItem','readSecureStorageItem',[f.secretKey.replaceAll('ASIDE_KEYCHAIN_ID_PREFIX','AUX_KEYCHAIN_ID_PREFIX'),f.saveChannelSecret,f.readChannelSecret].join(';')+';return {saveChannelSecret,readChannelSecret}')( 'aux',async(k,v)=>{stored={k,v}},async k=>stored.k===k?stored.v:null);
const c=prepare({logicalKey:channelKey,bytes:channelPayload});await channel.saveChannelSecret(7,'12345678-1234-4234-8234-123456789abc','slack','bot',c.bytes.toString());assert.equal(stored.k,channelKey);assert.equal(await channel.readChannelSecret(7,'12345678-1234-4234-8234-123456789abc','slack'),channelPayload.toString());
const oauth=Buffer.from('{ "identity":"https://example.test/|client", "tokens":{"access_token":"synthetic-only","token_type":"Bearer"} }');assert.deepEqual(prepare({logicalKey:'mcp:7:fixture',bytes:oauth}).bytes,oauth);
const index=Buffer.from('["fixture","another"]');assert.deepEqual(prepare({logicalKey:'mcp:index:7',bytes:index}).bytes,index);
assert.throws(()=>prepare({logicalKey:'mcp:7:fixture',bytes:Buffer.from('{"tokens":{},"tokens":{}}')}),/Duplicate/);
assert.throws(()=>prepare({logicalKey:'mcp:7:fixture',bytes:Buffer.from('{"tokens":{"access_token":"x","token_type":"Bearer","unknown":true}}')}),/Unsupported/);
assert.throws(()=>prepare({logicalKey:'aux.csk_7',bytes:Buffer.from('{}')}),/versioned/);
// Execute only extracted pure JS consumer crypto. This adapter implements the
// exact ChaCha20-Poly1305 sodium call ABI using Node's real cipher, not addon IO.
const sodium={crypto_aead_chacha20poly1305_ietf_encrypt:(plaintext,aad,_unused,nonce,key)=>{const c=createCipheriv('chacha20-poly1305',key,nonce,{authTagLength:16});c.setAAD(aad);return Buffer.concat([c.update(plaintext),c.final(),c.getAuthTag()]);},crypto_aead_chacha20poly1305_ietf_decrypt:(_unused,cipher,aad,nonce,key)=>{const c=createDecipheriv('chacha20-poly1305',key,nonce,{authTagLength:16}),bytes=Buffer.from(cipher);c.setAAD(aad);c.setAuthTag(bytes.subarray(-16));return Buffer.concat([c.update(bytes.subarray(0,-16)),c.final()]);}};
const cryptoText=['getPurposeInfoBytes','toArrayBufferBackedBytes','deriveDkSubkey','encryptWithDk','decryptWithDk'].map(n=>f[n]).join(';');
const getCrypto=prefix=>new Function('crypto','getSodium','DK_SUBKEY_INFO_PREFIX','toBase64','fromBase64$1',cryptoText+';return {encryptWithDk,decryptWithDk}')(webcrypto,async()=>sodium,prefix,v=>Buffer.from(v).toString('base64'),v=>new Uint8Array(Buffer.from(v,'base64')));
const old=getCrypto('aside.dk.'),renamed=getCrypto('aux.dk.'),root=Buffer.alloc(32,13),plain=Buffer.alloc(32,29),blob=await old.encryptWithDk(root,'csk',plain);
assert.deepEqual(Buffer.from(await old.decryptWithDk(root,'csk',blob)),plain);
await assert.rejects(renamed.decryptWithDk(root,'csk',blob));assert.throws(()=>decryptAuxBlob(root,'csk',{format:'aux.dk.v2',...blob}));
assert.equal(blob.purpose,'csk');assert.equal(blob.nonce.length,16);
console.log('payload compatibility passed: exact channel consumer roundtrip; MCP conservative validation; extracted CSK authentication/domain mismatch and copy refusal');
