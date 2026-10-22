/** Only temporary synthetic inputs; no original addon/Keychain/SE/PQ invocation. */
import assert from 'node:assert/strict';
import {createECDH,createCipheriv,createDecipheriv,hkdfSync,createHash} from 'node:crypto';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=fileURLToPath(new URL('.',import.meta.url)),temporary=await mkdtemp(path.join(tmpdir(),'aux-four-row-synthetic-'));
try {
 const key=byte=>{const value=createECDH('prime256v1');value.setPrivateKey(Buffer.alloc(32,byte));return value};
 const signing=key(1),kem=key(2),syntheticRoot=Buffer.alloc(32,0x35);
 function legacy(context){const ephemeral=key(3),wrapping=Buffer.from(hkdfSync('sha256',ephemeral.computeSecret(kem.getPublicKey()),Buffer.alloc(0),context,32)),nonce=Buffer.alloc(12,4),cipher=createCipheriv('chacha20-poly1305',wrapping,nonce,{authTagLength:16});cipher.setAAD(Buffer.from(context));return Buffer.from(JSON.stringify({scheme:'p256_v1',purpose:'dk',ephemeral_public_key:ephemeral.getPublicKey().toString('base64'),nonce:nonce.toString('base64'),ciphertext:Buffer.concat([cipher.update(syntheticRoot),cipher.final(),cipher.getAuthTag()]).toString('base64')}))}
 const raw={metadata:Buffer.from(' { "key_storage": "software", "scheme": "p256_v1" }\n'),signing:signing.getPrivateKey(),kem:kem.getPrivateKey(),wrapped:legacy('aside.wrap.dk.v1'),canaryWrapped:legacy('aside-canary.wrap.dk.v1'),signingPublic:signing.getPublicKey(),kemPublic:kem.getPublicKey(),syntheticChallenge:createHash('sha256').update('Aux four-row synthetic continuity v1\0').digest()};
 const fixture=Object.fromEntries(Object.entries(raw).map(([name,value])=>[name,value.toString('base64')]));
 const fixturePath=path.join(temporary,'synthetic.json');await writeFile(fixturePath,JSON.stringify(fixture),{mode:0o600});
 const files=['../aux-native-p256-envelope-port/source/EnvelopeRecords.swift','../aux-native-p256-envelope-port/source/RecoveredP256Authority.swift','../aux-native-p256-envelope-port/source/AuxNativeEnvelopeV2.swift','../aux-native-p256-envelope-port/source/LegacyNativeEnvelopeReader.swift','../aux-native-pq-continuation/source/PqEnvelopeRecords.swift','../aux-native-pq-continuation/source/RecoveredPqAuthority.swift','../aux-native-pq-continuation/source/LegacyNativePqEnvelopeReader.swift','../aux-native-signing-port/source/RecoveredP256SigningAuthority.swift','../aux-native-signing-port/source/RecoveredPqSigningAuthority.swift','../aux-native-install-storage-port/source/RecoveredInstallStorageQueries.swift','source/CapturedInstallation.swift','tests/main.swift'];
 const script=path.join(temporary,'software-only.swift');await writeFile(script,(await Promise.all(files.map(file=>readFile(path.join(root,file),'utf8')))).join('\n'),{mode:0o600});
 const result=spawnSync('/usr/bin/xcrun',['swift','-module-cache-path',path.join(temporary,'module-cache'),script,fixturePath],{encoding:'utf8',timeout:90000,maxBuffer:1024*1024});
 if(result.error||result.status!==0)throw Error(`Synthetic software fixture failed: ${result.error?.message??result.stderr}`);
 const output=JSON.parse(result.stdout);assert.equal(output.checks,17);for(const flag of ['enclaveExecuted','pqExecuted','keychainExecuted','persistencePerformed'])assert.equal(output[flag],false);
 for(const [role,key] of Object.entries({metadata:'metadata',signing:'signing',kem:'kem',wrappedRoot:'wrapped'}))assert.equal(output.originalHashes[role],createHash('sha256').update(raw[key]).digest('hex'));
 for(const name of ['normalWrapper','canaryWrapper']){
  const record=JSON.parse(Buffer.from(output[name],'base64'));assert.equal(record.format,'aux.wrap.dk.v2');assert.equal(record.scheme,'p256_v2');
  const wrapping=Buffer.from(hkdfSync('sha256',kem.computeSecret(Buffer.from(record.ephemeral_public_key,'base64')),Buffer.alloc(0),'aux.wrap.dk.v2',32)),combined=Buffer.from(record.ciphertext,'base64'),decipher=createDecipheriv('chacha20-poly1305',wrapping,Buffer.from(record.nonce,'base64'),{authTagLength:16});
  decipher.setAAD(Buffer.from('aux.wrap.dk.v2'));decipher.setAuthTag(combined.subarray(-16));assert.deepEqual(Buffer.concat([decipher.update(combined.subarray(0,-16)),decipher.final()]),syntheticRoot);
 }
 console.log('PASS: 17 synthetic software state/continuity checks, original four-row hashes and independent Node same-DK verification for both channels. No SE/PQ/Keychain/addon/persistence execution.');
} finally { await rm(temporary,{recursive:true,force:true}); }
