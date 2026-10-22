/** Runs only proposed Swift source on fixed synthetic SOFTWARE keys; no addon load. */
import assert from 'node:assert/strict';
import {createECDH,createCipheriv,hkdfSync} from 'node:crypto';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {wrapAuxDk,unwrapAuxDk} from '../../../../vendor/provided/aux-crypto-identity.mjs';
const root=fileURLToPath(new URL('.',import.meta.url)),temporary=await mkdtemp(path.join(tmpdir(),'aux-native-p256-synthetic-'));
try{
 const authority=createECDH('prime256v1');authority.setPrivateKey(Buffer.alloc(32,1));const publicKey=authority.getPublicKey(),syntheticRoot=Buffer.alloc(32,0x22);
 function legacy(context){const ephemeral=createECDH('prime256v1');ephemeral.setPrivateKey(Buffer.alloc(32,2));const key=Buffer.from(hkdfSync('sha256',ephemeral.computeSecret(publicKey),Buffer.alloc(0),context,32)),nonce=Buffer.alloc(12,3),cipher=createCipheriv('chacha20-poly1305',key,nonce,{authTagLength:16});cipher.setAAD(Buffer.from(context));const ciphertext=Buffer.concat([cipher.update(syntheticRoot),cipher.final(),cipher.getAuthTag()]);key.fill(0);return {scheme:'p256_v1',purpose:'dk',ephemeral_public_key:ephemeral.getPublicKey().toString('base64'),nonce:nonce.toString('base64'),ciphertext:ciphertext.toString('base64')}}
 const fixture={syntheticPrivateRepresentation:authority.getPrivateKey().toString('base64'),publicKey:publicKey.toString('base64'),syntheticRoot:syntheticRoot.toString('base64'),legacyNormal:legacy('aside.wrap.dk.v1'),legacyCanary:legacy('aside-canary.wrap.dk.v1'),auxV2:wrapAuxDk(syntheticRoot,publicKey)};
 const fixturePath=path.join(temporary,'synthetic.json');await writeFile(fixturePath,JSON.stringify(fixture),{mode:0o600});
 const sources=['EnvelopeRecords.swift','RecoveredP256Authority.swift','AuxNativeEnvelopeV2.swift','LegacyNativeEnvelopeReader.swift'];
 const combined=(await Promise.all(sources.map(name=>readFile(path.join(root,'source',name),'utf8')))).join('\n')+'\n'+await readFile(path.join(root,'tests/main.swift'),'utf8');
 const harnessPath=path.join(temporary,'software-only.swift');await writeFile(harnessPath,combined,{mode:0o600});
 const result=spawnSync('/usr/bin/xcrun',['swift','-module-cache-path',path.join(temporary,'module-cache'),harnessPath,fixturePath],{encoding:'utf8',timeout:90000,maxBuffer:1024*1024});
 if(result.error||result.status!==0)throw Error(`Synthetic Swift harness failed: ${result.error?.message??result.stderr}`);
 const output=JSON.parse(result.stdout);assert.equal(output.syntheticSoftwareChecksPassed,12);assert.equal(output.enclaveExecuted,false);assert.equal(output.pqExecuted,false);assert.equal(output.persistencePerformed,false);
 const unwrapped=await unwrapAuxDk(output.prepared,peer=>Promise.resolve(authority.computeSecret(peer)));assert.deepEqual(unwrapped,syntheticRoot);unwrapped.fill(0);syntheticRoot.fill(0);
 console.log('PASS: 12 synthetic Swift software checks plus Node→Swift and Swift→Node Aux-v2 interoperability. No enclave/PQ/native-addon/Keychain execution.');
}finally{await rm(temporary,{recursive:true,force:true})}
