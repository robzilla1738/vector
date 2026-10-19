'use strict';
const crypto = require('node:crypto');
const allowed = new Set(['install-status','install-init','get-public-keys','cdp-sign']);
class ProbeError extends Error { constructor(code, statuses=[]) { super(code); this.code=code; this.statuses=statuses; } }
function parse(raw) {
  let value; try { value=typeof raw==='string'?JSON.parse(raw):raw; } catch { throw new ProbeError('invalid-native-json'); }
  if (!value || typeof value!=='object') throw new ProbeError('invalid-native-result');
  if (typeof value.error==='string') {
    const codes=[...value.error.matchAll(/(?:^|[^\d])(-34018|-25300|-25293|-25308|-50)(?=$|[^\d])/g)].map(m=>Number(m[1]));
    throw new ProbeError('original-native-error', [...new Set(codes)]);
  }
  return value;
}
function publicKeys(value, init=false) {
  const scheme=value.scheme, sig=value[init?'sig_pub':'sig'], kem=value[init?'kem_pub':'kem'];
  if (!['p256_v1','pq_v1'].includes(scheme) || [sig,kem].some(v=>typeof v!=='string'||!v||v.length>32768||!/^[A-Za-z0-9+/]+={0,2}$/.test(v))) throw new ProbeError('invalid-original-public-keys');
  const signing=Buffer.from(sig,'base64'), encryption=Buffer.from(kem,'base64');
  if (signing.length!==(scheme==='p256_v1'?65:1952) || !encryption.length) throw new ProbeError('invalid-original-public-key-size');
  const data={scheme,sig:signing.toString('base64'),kem:encryption.toString('base64')};
  return {...data, publicKeyHash:crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex')};
}
function checkOriginal(call, { initialize=false, expectedHash, challenge }) {
  const invoke=(command,input={})=>{if(!allowed.has(command))throw new ProbeError('unapproved-command');return parse(call(command,JSON.stringify(input)));};
  const status=invoke('install-status');
  if (typeof status.installed!=='boolean')throw new ProbeError('invalid-install-status');
  if (initialize ? status.installed : !status.installed)throw new ProbeError(initialize?'unexpected-existing-installation':'installation-not-shared');
  const init=initialize?publicKeys(invoke('install-init'),true):null, keys=publicKeys(invoke('get-public-keys'));
  if ((init && keys.publicKeyHash!==init.publicKeyHash) || (expectedHash && expectedHash!==keys.publicKeyHash))throw new ProbeError('original-authority-mismatch');
  const raw=Buffer.from(challenge,'base64');if(raw.length!==32)throw new ProbeError('invalid-public-challenge');
  const header=keys.scheme==='p256_v1'?'3059301306072a8648ce3d020106082a8648ce3d030107034200':'308207b2300b0609608648016503040312038207a100';
  const key=crypto.createPublicKey({key:Buffer.concat([Buffer.from(header,'hex'),Buffer.from(keys.sig,'base64')]),format:'der',type:'spki'});
  const algorithm=keys.scheme==='p256_v1'?'sha256':null;
  for(const bytes of [raw,Buffer.concat([Buffer.from('Aside Daemon Auth v1\0'),raw])]) {
    const signed=invoke('cdp-sign',{challenge:bytes.toString('base64')});
    if(typeof signed.signature!=='string'||signed.signature.length>32768)throw new ProbeError('invalid-original-signature');
    const signature=Buffer.from(signed.signature,'base64'),wrong=Buffer.from(bytes);wrong[wrong.length-1]^=1;
    if(!crypto.verify(algorithm,bytes,key,signature)||crypto.verify(algorithm,wrong,key,signature))throw new ProbeError('original-signature-verification-failed');
  }
  return {ok:true,scheme:keys.scheme,publicKeyHash:keys.publicKeyHash,rawCdpVerified:true,httpDomainVerified:true,tamperRefused:true,originalFormatPreserved:true};
}
module.exports={checkOriginal,parse,ProbeError};
