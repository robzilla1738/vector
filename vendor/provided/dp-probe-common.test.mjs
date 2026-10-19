import{test}from'node:test';import assert from'node:assert/strict';import{generateKeyPairSync,sign,createHash}from'node:crypto';import{createRequire}from'node:module';
const {checkOriginal}=createRequire(import.meta.url)('./dp-probe-common.cjs');
test('fixture checks sign exact original domains and refuse unshared host before initialization',()=>{
 const {privateKey,publicKey}=generateKeyPairSync('ec',{namedCurve:'prime256v1'}),jwk=publicKey.export({format:'jwk'}),point=Buffer.concat([Buffer.from([4]),Buffer.from(jwk.x,'base64url'),Buffer.from(jwk.y,'base64url')]).toString('base64');
 let installed=false;const calls=[],messages=[];
 const call=(command,input)=>{calls.push(command);if(command!=='cdp-sign')assert.equal(input,'','original parameterless commands use empty input');if(command==='install-status')return{installed};if(command==='install-init'){installed=true;return{scheme:'p256_v1',sig_pub:point,kem_pub:point};}if(command==='get-public-keys')return{scheme:'p256_v1',sig:point,kem:point};if(command==='cdp-sign'){const message=Buffer.from(JSON.parse(input).challenge,'base64');messages.push(message);return{signature:sign('sha256',message,privateKey).toString('base64')};}throw Error('Unexpected command');};
 const challenge=Buffer.alloc(32,7).toString('base64'),result=checkOriginal(call,{initialize:true,challenge});
 assert.equal(result.ok,true);assert.deepEqual(messages.map(b=>b.length),[32,53]);assert.equal(messages[1].subarray(0,21).toString(),'Aside Daemon Auth v1\0');
 calls.length=0;installed=false;assert.throws(()=>checkOriginal(call,{expectedHash:result.publicKeyHash,challenge}),/installation-not-shared/);assert.deepEqual(calls,['install-status']);
 installed=true;calls.length=0;assert.throws(()=>checkOriginal(call,{expectedHash:createHash('sha256').update('other').digest('hex'),challenge}),/original-authority-mismatch/);assert.equal(calls.includes('cdp-sign'),false);assert.equal(calls.includes('install-init'),false);
});
