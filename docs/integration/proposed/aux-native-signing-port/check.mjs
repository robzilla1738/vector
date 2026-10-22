/** Executes only proposed P256 SOFTWARE source on a fixed public synthetic key. */
import assert from 'node:assert/strict';
import {createECDH,createPrivateKey,createPublicKey,createHash,sign,verify} from 'node:crypto';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=fileURLToPath(new URL('.',import.meta.url));
const temporary=await mkdtemp(path.join(tmpdir(),'aux-signing-software-synthetic-'));
try {
 const scalar=Buffer.alloc(32,1),ecdh=createECDH('prime256v1');ecdh.setPrivateKey(scalar);
 const publicBytes=ecdh.getPublicKey(),base64url=bytes=>bytes.toString('base64url');
 const privateKey=createPrivateKey({format:'jwk',key:{kty:'EC',crv:'P-256',d:base64url(scalar),x:base64url(publicBytes.subarray(1,33)),y:base64url(publicBytes.subarray(33))}});
 const publicKey=createPublicKey(privateKey);
 // This is explicitly synthetic input, not a challenge obtained from any app.
 const challenge=createHash('sha256').update('Aux synthetic signing challenge v1\0').digest();
 const nodeSignature=sign('sha256',challenge,{key:privateKey,dsaEncoding:'der'});
 const fixture={syntheticPrivate:scalar.toString('base64'),publicKey:publicBytes.toString('base64'),syntheticAuxChallenge:challenge.toString('base64'),nodeSignature:nodeSignature.toString('base64')};
 const fixturePath=path.join(temporary,'synthetic.json');await writeFile(fixturePath,JSON.stringify(fixture),{mode:0o600});
 // PQ source is deliberately not included in this runtime harness.
 const pieces=['../aux-native-p256-envelope-port/source/EnvelopeRecords.swift','source/RecoveredP256SigningAuthority.swift','tests/main.swift'];
 const combined=(await Promise.all(pieces.map(file=>readFile(path.join(root,file),'utf8')))).join('\n');
 const scriptPath=path.join(temporary,'software-only.swift');await writeFile(scriptPath,combined,{mode:0o600});
 const result=spawnSync('/usr/bin/xcrun',['swift','-module-cache-path',path.join(temporary,'module-cache'),scriptPath,fixturePath],{encoding:'utf8',timeout:90000,maxBuffer:1024*1024});
 if(result.error||result.status!==0)throw Error(`Synthetic software fixture failed: ${result.error?.message??result.stderr}`);
 const output=JSON.parse(result.stdout);assert.equal(output.softwareChecks,8);assert.equal(output.enclaveExecuted,false);assert.equal(output.pqExecuted,false);assert.equal(output.keychainExecuted,false);assert.equal(output.publicKey,fixture.publicKey);
 const signature=Buffer.from(output.signature,'base64');
 assert(verify('sha256',challenge,{key:publicKey,dsaEncoding:'der'},signature));
 const doubleHashInput=createHash('sha256').update(challenge).digest();
 assert.equal(verify('sha256',doubleHashInput,{key:publicKey,dsaEncoding:'der'},signature),false);
 assert.equal(verify('sha384',challenge,{key:publicKey,dsaEncoding:'der'},signature),false);
 console.log('PASS: 8 Swift software checks; Node↔Swift DER/SHA256 interoperability, altered challenge and extra hash rejected. No enclave/PQ/addon/Keychain execution.');
} finally { await rm(temporary,{recursive:true,force:true}); }
