'use strict';
// No command may execute until explicit fixed-scope human approval is forwarded.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {checkOriginal,parse,ProbeError}=require('./dp-probe-common.cjs');
function readOwned(p) {const fd=fs.openSync(p,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW|fs.constants.O_NONBLOCK);try{const s=fs.fstatSync(fd);if(!s.isFile()||s.uid!==process.getuid()||(s.mode&0o022)||s.size>1024*1024)throw new ProbeError('unsafe-probe-metadata');return JSON.parse(fs.readFileSync(fd));}finally{fs.closeSync(fd);}}
function writeMarker(file,value,exclusive=false) {
  const fd=fs.openSync(file,fs.constants.O_WRONLY|fs.constants.O_CREAT|fs.constants.O_NOFOLLOW|fs.constants.O_NONBLOCK|(exclusive?fs.constants.O_EXCL:fs.constants.O_TRUNC),0o600);
  try{const s=fs.fstatSync(fd);if(!s.isFile()||s.uid!==process.getuid()||(s.mode&0o7777)!==0o600)throw new ProbeError('unsafe-created-scope-marker');fs.writeFileSync(fd,JSON.stringify(value));}finally{fs.closeSync(fd);}
}
function continuationKeys(home) {
  const keys=new Set();
  function optional(relative) {
    const parts=relative.split('/');let parent=home;
    for(const part of parts.slice(0,-1)) {parent=path.join(parent,part);try {const s=fs.lstatSync(parent);if(!s.isDirectory()||s.isSymbolicLink())throw new ProbeError('unsafe-test-registry');}catch(e){if(e.code==='ENOENT')return;throw e;}}
    const file=path.join(home,relative);try{return readOwned(file);}catch(e){if(e.code==='ENOENT')return;throw e;}
  }
  const registry=optional('accounts.json'), accounts=registry?.accounts??[];
  if(!Array.isArray(accounts)||accounts.length>64)throw new ProbeError('invalid-test-account-registry');
  const ids=new Set();for(const account of accounts){if(!Number.isSafeInteger(account.id)||account.id<=0||account.id>1000000)throw new ProbeError('invalid-test-account-id');ids.add(account.id);keys.add(`aux.csk_${account.id}`);}
  const pwm=optional('password-manager/accounts.json');
  if(pwm){if(pwm.version!==1||!Array.isArray(pwm.accounts)||pwm.accounts.length>64)throw new ProbeError('invalid-test-vault-registry');for(const account of pwm.accounts){if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(account.id)||!Number.isSafeInteger(account.storage?.nativeSlot)||Math.abs(account.storage.nativeSlot)>1000000)throw new ProbeError('invalid-test-vault-id');keys.add(`aux.pwm.auth_${account.id}`);keys.add(`aside.pwm.session_${account.storage.nativeSlot}`);}}
  const fixtures=optional('.aux-dp-test-keys.json');
  if(fixtures){if(!Array.isArray(fixtures.mcpServers)||fixtures.mcpServers.length>64)throw new ProbeError('invalid-test-key-ledger');for(const server of fixtures.mcpServers){if(!ids.has(server.accountId)||!/^[A-Za-z0-9_-]{1,32}$/.test(server.serverId))throw new ProbeError('invalid-test-server-id');keys.add(`mcp:index:${server.accountId}`);keys.add(`mcp:${server.accountId}:${server.serverId}`);}}
  return [...keys];
}
module.exports=async function approvedDpDiagnostic() {
  let result;
  try {
    const policy=readOwned(path.join(__dirname,'dp-probe-policy.json'));
    const id=crypto.createHash('sha256').update(JSON.stringify(policy.core)).digest('hex');
    if(id!==policy.approvalId||process.env.AUX_DP_PROBE_APPROVED!==id||process.env.AUX_ENABLE_PROVIDED_NATIVE_CARRIER!=='1'||process.env.AUX_PROVIDED_NATIVE_LOAD_ONLY||process.env.AUX_PROVIDED_DP_PROBE!=='1')throw new ProbeError('human-approval-required');
    const home=fs.realpathSync(process.env.AUX_HOME),scope=crypto.createHash('sha256').update(home).digest('hex'),s=fs.lstatSync(home);
    if(home!==policy.core.home||scope!==policy.core.scope||!s.isDirectory()||s.uid!==process.getuid()||(s.mode&0o7777)!==0o700)throw new ProbeError('fixed-home-scope-required');
    const operation=process.env.AUX_DP_PROBE_OPERATION;
    if(!['initialize','verify','cleanup'].includes(operation))throw new ProbeError('unapproved-probe-operation');
    // Actual supplied exports, guarded by current production pointer/scope gate.
    const native=require('./aux-native.cjs'),helper=require('./aux-dp-scope-helper.node');
    const marker=path.join(home,'.aux-dp-created.json');
    if(operation==='initialize') {
      if(fs.existsSync(marker))throw new ProbeError('scope-already-attempted-use-verify-or-cleanup');
      const baseline=helper.run('baseline');
      if(baseline.statuses.length!==4||baseline.statuses.some(v=>v!==-25300))throw new ProbeError('baseline-not-confirmed-empty',baseline.statuses);
      writeMarker(marker,{approvalId:id,scope,createdIn:'daemon',baselineAbsent:true},true);
      result=checkOriginal((command,input)=>native.run(command,input),{initialize:true,challenge:process.env.AUX_DP_PROBE_CHALLENGE});
      writeMarker(marker,{approvalId:id,scope,createdIn:'daemon',baselineAbsent:true,publicKeyHash:result.publicKeyHash});
      result.exactRows=helper.run('inspect');
    } else {
      const created=readOwned(marker);
      if(created.approvalId!==id||created.scope!==scope||created.createdIn!=='daemon'||created.baselineAbsent!==true)throw new ProbeError('unowned-scope-marker');
      if(operation==='verify'&&!/^[a-f0-9]{64}$/.test(created.publicKeyHash??''))throw new ProbeError('previous-creation-incomplete-cleanup-first');
      if(operation==='verify'){result=checkOriginal((command,input)=>native.run(command,input),{expectedHash:created.publicKeyHash,challenge:process.env.AUX_DP_PROBE_CHALLENGE});result.exactRows=helper.run('inspect');}
      else {
        // Only source-known exact keys derived from this private home's public
        // registry/fixture IDs, never Keychain enumeration or arbitrary keys.
        const known=continuationKeys(home);
        for(const key of known)parse(native.run('secure-clear',JSON.stringify({key})));
        const removed=helper.run('cleanup');
        result={ok:removed.statuses.length===4&&removed.statuses.every(v=>v===0||v===-25300),operation:'cleanup',knownContinuationKeysCleared:known.length,exactRows:removed};
        if(result.ok)fs.unlinkSync(marker);
      }
    }
    const forbiddenGroup=crypto.createHash('sha256').update('8CPD4K4TBB.at.studio.AsideBrowser.cryptography').digest('hex');
    if(result.exactRows?.accessGroupHashes?.includes(forbiddenGroup))throw new ProbeError('original-group-domain-unacceptable');
    result={...result,operation,scope,dpCallsAttempted:true,originalCommandsInvoked:operation!=='cleanup',secretsLogged:false};
  } catch(error) {result={ok:false,code:error instanceof ProbeError?error.code:'probe-failed',statuses:error instanceof ProbeError?error.statuses:[],secretsLogged:false};}
  await new Promise((resolve,reject)=>process.stdout.write(`${JSON.stringify(result)}\n`,e=>e?reject(e):resolve()));
  process.exit(result.ok?0:1);
};
