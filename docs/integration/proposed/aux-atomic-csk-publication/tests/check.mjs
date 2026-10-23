// Controlled captured software authority and disposable accounts only.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {createHash,hkdfSync,createDecipheriv} from 'node:crypto';
import {spawn,spawnSync} from 'node:child_process';
import {adaptAtomicCskSource} from '../source/adapt.mjs';
const require=createRequire(import.meta.url);
const [modulePath,home,stageEntry]=process.argv.slice(2);
const binding=require(modulePath);
const accountPath=path.join(home,'accounts.json'),recordPath=path.join(home,'captured-csk-envelope.json');
let count=0;const check=(v,msg)=>{assert(v,msg);count++};
const token=sg=>'synthetic.'+Buffer.from(JSON.stringify({sg})).toString('base64url')+'.not-a-token';
const registry=(userId='synthetic-user',sg=17)=>({version:1,currentAccountId:1,accounts:[{id:1,userId}],sessions:{1:{accessToken:token(sg)}},localBootstraps:{},profileBindings:{},profileAccountBindings:{}});
const writeRegistry=(user='synthetic-user',sg=17)=>fs.writeFileSync(accountPath,JSON.stringify(registry(user,sg)),{mode:0o600});
const publish=(byte=1,user='synthetic-user',generation=17)=>JSON.parse(binding.run('csk-publish-absent-or-same',JSON.stringify({accountId:1,owner:user,generation,keyB64:Buffer.alloc(32,byte).toString('base64')}))).status;
writeRegistry();fs.rmSync(recordPath,{force:true});
check(publish()==='stored','first captured Add stores');
const bytes=fs.readFileSync(recordPath);
check(publish()==='same'&&fs.readFileSync(recordPath).equals(bytes),'same key preserves exact ciphertext');
check(publish(2)==='conflict'&&fs.readFileSync(recordPath).equals(bytes),'different key cannot overwrite');
const envelope=JSON.parse(bytes),subkey=Buffer.from(hkdfSync('sha256',Buffer.alloc(32,15),Buffer.alloc(0),Buffer.from('aux.dk.csk.v2'),32));
const encrypted=Buffer.from(envelope.encryptedBlob.ciphertext,'base64');
const decipher=createDecipheriv('chacha20-poly1305',subkey,Buffer.from(envelope.encryptedBlob.nonce,'base64'),{authTagLength:16});
decipher.setAAD(Buffer.from('aux.dk.csk.v2'));decipher.setAuthTag(encrypted.subarray(32));
check(Buffer.concat([decipher.update(encrypted.subarray(0,32)),decipher.final()]).equals(Buffer.alloc(32,1)),'actual native Aux-v2 cipher matches client purpose/root');subkey.fill(0);
check(JSON.parse(binding.run('secure-save',JSON.stringify({key:'aux.csk_1',data:'bad'}))).error==='Atomic CSK coordinator required','generic current writer denied');
check(JSON.parse(binding.run('secure-clear',JSON.stringify({key:'aux.csk_1'}))).error==='Atomic CSK coordinator required','generic clear denied');
check(binding.withAccountRegistryLock(()=>42)===42,'actual NAPI callback returns exact value');
const descriptor=Object.getOwnPropertyDescriptor(binding,'withAccountRegistryLock');
check(!descriptor.writable&&!descriptor.configurable,'new native callback cannot be replaced on its exports object');
assert.throws(()=>binding.withAccountRegistryLock(()=>{throw Error('synthetic failure')}),/synthetic failure/);
check(publish()==='same','callback throw releases native lock and lease');
assert.throws(()=>binding.withAccountRegistryLock(()=>Promise.resolve()),/synchronous/);
check(binding.withAccountRegistryLock(()=>JSON.parse(binding.run('install-status')).error)!=null,'nested same-owner reentry cannot bypass active lease');
binding.withAccountRegistryLock(()=>writeRegistry('changed-user',17));
check(publish()==='conflict','actual persisted owner change conflicts');
binding.withAccountRegistryLock(()=>writeRegistry('synthetic-user',18));
check(publish()==='conflict','actual persisted generation change conflicts');
writeRegistry();
// Exercise the actual source-pinned central sync method with existing lock stub:
// its original proper-lockfile semantics remain untouched, inside native flock.
const table=JSON.parse(fs.readFileSync(new URL('../source-pins.json',import.meta.url)));
const priorSetter=table.edits[3].find,signature='async function saveInstallationDerivedKeyBlob(Cn,ei,ti,ni,ri={}){';
check(table.edits[3].replace.includes('if(process.platform!==`darwin`){'+priorSetter.slice(signature.length,-1)+';return}'),'non-macOS setter body remains byte-identical');
let properLocks=0;
const backend=vm.runInNewContext('('+`class{path;options={};constructor(){this.path=ACCOUNTS_JSON_PATH}ensureFileExists(){}readCurrentOrRecover(){return readState()}${table.edits[0].replace}}`+')',{
 process:{platform:'darwin'},ACCOUNTS_JSON_PATH:accountPath,init_src$6(){},loadBinding:()=>binding,
 retryFileOperationSync:(_,fn)=>fn(),import_proper_lockfile$1:{default:{lockSync:()=>{properLocks++;return()=>{properLocks--}}}},
 readState:()=>JSON.parse(fs.readFileSync(accountPath)),atomicWriteFileSync:(file,text)=>fs.writeFileSync(file,text,{mode:0o600}),JSON
});
const store=new backend();
check(store.withLock(data=>{assert.equal(properLocks,1);return{result:'committed',next:{...data,sessions:{1:{accessToken:token(19)}}}}})==='committed'&&properLocks===0&&publish()==='conflict','actual central callback updates same persisted generation under shared lock');
writeRegistry();
const prepared=fs.readFileSync(stageEntry,'utf8');const sha=x=>createHash('sha256').update(x).digest('hex');
const composed=adaptAtomicCskSource(prepared,{expectedInputSha256:sha(prepared)});
const generated=path.join(home,'source-syntax-only.mjs');fs.writeFileSync(generated,composed.code,{mode:0o600});
const parsed=spawnSync(process.execPath,['--check',generated],{encoding:'utf8'});assert.equal(parsed.status,0,parsed.stderr);fs.rmSync(generated);
check(composed.edits.length===5&&!composed.code.includes(table.edits[3].find),'actual full composed module parses with five exact writer edits');
assert.throws(()=>adaptAtomicCskSource(prepared+' ',{expectedInputSha256:sha(prepared)}),/Unreviewed/);
let keyCalls=0;
const setterSandbox={process:{platform:'darwin'},Uint8Array,Buffer,Number,JSON,
 getChromeSyncKeyStorageKey:id=>'aux.csk_'+id,getExpectedLocalBootstrapKeyOwner:()=>undefined,
 init_src$6(){keyCalls++},loadBinding:()=>{keyCalls++;return binding}};
vm.runInNewContext(table.edits[3].replace,setterSandbox);
await assert.rejects(()=>setterSandbox.saveInstallationDerivedKeyBlob(1,'aux.csk_1','csk',new Uint8Array(32),{syncGeneration:null}),/Authenticated/);
check(keyCalls===0,'unauthenticated publication does not initialize native or installation state');

// Genuine cross-process flock: child publishes only AFTER parent callback commits
// a generation change. Neither process loads any production addon or authority.
fs.rmSync(recordPath);writeRegistry();
const ready=path.join(home,'child-ready'),done=path.join(home,'child-result');
fs.rmSync(ready,{force:true});fs.rmSync(done,{force:true});
let child;
binding.withAccountRegistryLock(()=>{
 const script=`const fs=require('node:fs'),b=require(${JSON.stringify(modulePath)});fs.writeFileSync(${JSON.stringify(ready)},'ready');let r=JSON.parse(b.run('csk-publish-absent-or-same',${JSON.stringify(JSON.stringify({accountId:1,owner:'synthetic-user',generation:17,keyB64:Buffer.alloc(32,1).toString('base64')}))}));fs.writeFileSync(${JSON.stringify(done)},r.status);`;
 child=spawn(process.execPath,['-e',script],{stdio:'ignore'});
 const wait=new Int32Array(new SharedArrayBuffer(4));const until=Date.now()+5000;
 while(!fs.existsSync(ready)&&Date.now()<until)Atomics.wait(wait,0,0,5);
 assert(fs.existsSync(ready),'child reached its native transaction');
 Atomics.wait(wait,0,0,30);assert(!fs.existsSync(done),'child cannot finish inside parent account lock');
 writeRegistry('synthetic-user',18);
});
await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error('child '+code)))});
check(fs.readFileSync(done,'utf8')==='conflict'&&!fs.existsSync(recordPath),'cross-process publisher observes committed generation, no stale Add');
writeRegistry();
// Race two genuine separately-owned process contexts for a missing row.
const command=JSON.stringify({accountId:1,owner:'synthetic-user',generation:17,keyB64:Buffer.alloc(32,1).toString('base64')});
const race=()=>new Promise((resolve,reject)=>{const c=spawn(process.execPath,['-e',`console.log(JSON.parse(require(${JSON.stringify(modulePath)}).run('csk-publish-absent-or-same',${JSON.stringify(command)})).status)`]);let text='';c.stdout.on('data',b=>text+=b);c.once('error',reject);c.once('exit',code=>code===0?resolve(text.trim()):reject(Error('race '+code)))});
const raced=(await Promise.all([race(),race()])).sort();check(JSON.stringify(raced)===JSON.stringify(['same','stored']),'two process contexts produce one Add and one same result');
check(binding.withAccountRegistryLock(()=>binding.fixtureRetire())!==0,'retirement cannot report drain while actual callback lease is active');
check(binding.withAccountRegistryLock(()=>1)===1,'reentrant retire refusal preserves active instance');
check(binding.fixtureRetire()===0,'external retirement drains after callback returns');
assert.throws(()=>binding.withAccountRegistryLock(()=>1),/unavailable|closed/);
console.log(JSON.stringify({format:'aux.atomic-csk-captured-check.v1',passed:count,sourceInputSha256:composed.inputSha256,sourceOutputSha256:composed.sha256,realSecurityExecuted:false,productionFactoryExecuted:false,actualCurrentOwnerDataRead:false}));
