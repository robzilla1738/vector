/** Only temporary synthetic inputs; no original addon/Keychain/SE/PQ invocation. */
import assert from 'node:assert/strict';
import {createECDH,createCipheriv,createDecipheriv,hkdfSync,createHash} from 'node:crypto';
import {mkdtemp,readFile,writeFile,rm,mkdir,realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=fileURLToPath(new URL('.',import.meta.url)),temporary=await mkdtemp(path.join(tmpdir(),'aux-installation-journal-synthetic-'));
try {
 const key=byte=>{const value=createECDH('prime256v1');value.setPrivateKey(Buffer.alloc(32,byte));return value};
 const signing=key(1),kem=key(2),syntheticRoot=Buffer.alloc(32,0x35);
 function legacy(context){const ephemeral=key(3),wrapping=Buffer.from(hkdfSync('sha256',ephemeral.computeSecret(kem.getPublicKey()),Buffer.alloc(0),context,32)),nonce=Buffer.alloc(12,4),cipher=createCipheriv('chacha20-poly1305',wrapping,nonce,{authTagLength:16});cipher.setAAD(Buffer.from(context));return Buffer.from(JSON.stringify({scheme:'p256_v1',purpose:'dk',ephemeral_public_key:ephemeral.getPublicKey().toString('base64'),nonce:nonce.toString('base64'),ciphertext:Buffer.concat([cipher.update(syntheticRoot),cipher.final(),cipher.getAuthTag()]).toString('base64')}))}
 const raw={metadata:Buffer.from(' { "key_storage": "software", "scheme": "p256_v1" }\n'),signing:signing.getPrivateKey(),kem:kem.getPrivateKey(),wrapped:legacy('aside.wrap.dk.v1'),canaryWrapped:legacy('aside-canary.wrap.dk.v1'),signingPublic:signing.getPublicKey(),kemPublic:kem.getPublicKey(),syntheticChallenge:createHash('sha256').update('Aux four-row synthetic continuity v1\0').digest()};
 const fixture=Object.fromEntries(Object.entries(raw).map(([name,value])=>[name,value.toString('base64')]));
 const fixturePath=path.join(temporary,'synthetic.json');await writeFile(fixturePath,JSON.stringify(fixture),{mode:0o600});
 const files=['../aux-native-p256-envelope-port/source/EnvelopeRecords.swift','../aux-native-p256-envelope-port/source/RecoveredP256Authority.swift','../aux-native-p256-envelope-port/source/AuxNativeEnvelopeV2.swift','../aux-native-p256-envelope-port/source/LegacyNativeEnvelopeReader.swift','../aux-native-pq-continuation/source/PqEnvelopeRecords.swift','../aux-native-pq-continuation/source/RecoveredPqAuthority.swift','../aux-native-pq-continuation/source/LegacyNativePqEnvelopeReader.swift','../aux-native-signing-port/source/RecoveredP256SigningAuthority.swift','../aux-native-signing-port/source/RecoveredPqSigningAuthority.swift','../aux-native-install-storage-port/source/RecoveredInstallStorageQueries.swift','../aux-native-four-row-preparation/source/CapturedInstallation.swift','../aux-installation-additive-transaction/source/AdditiveInstallationTransaction.swift','source/PrivateInstallationJournalStore.swift','tests/main.swift'];
 const script=path.join(temporary,'software-only.swift');await writeFile(script,(await Promise.all(files.map(file=>readFile(path.join(root,file),'utf8')))).join('\n'),{mode:0o600});
 const storageRoot=path.join(await realpath(temporary),'journal-fixtures');await mkdir(storageRoot,{mode:0o700});
 const result=spawnSync('/usr/bin/xcrun',['swift','-module-cache-path',path.join(temporary,'module-cache'),script,fixturePath,storageRoot],{encoding:'utf8',timeout:90000,maxBuffer:1024*1024});
 if(result.error||result.status!==0)throw Error(`Synthetic software fixture failed: ${result.error?.message??result.stderr}`);
 const output=JSON.parse(result.stdout);assert.equal(output.checks,22);assert.equal(output.filesystemOnly,true);assert.equal(output.securityExecuted,false);assert.equal(output.interruptedEvidenceRetained,true);assert.equal(output.authorityExclusiveProof,false);
 console.log('PASS: 22 disposable-filesystem assertions including nonblocking FIFO refusal with FIFO retained, intent reload, stale/concurrent CAS, interrupted publication and terminal blocked persistence. No Security execution.');
} finally { await rm(temporary,{recursive:true,force:true}); }
