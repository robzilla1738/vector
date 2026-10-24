import fs from 'node:fs';
const read = name => fs.readFileSync(new URL(name, import.meta.url),'utf8');
function replay(text, changes) {
  for (const change of changes) {
    if (text.split(change.find).length-1 !== change.count) throw Error('Credential lock anchor mismatch: '+change.find.slice(0,90));
    text = text.replace(change.find,()=>change.replace);
  }
  return {text,changes};
}
export function transformAuxChatGPTNativeCredentialLock(text) {
  const find = 'function auxPrepareChatGPTModule(module) {module.configureLifetime(auxChatGPTLifetime());return module;}';
  return replay(text,[{find,replace:read('daemon-lock-capability.js').trim(),count:1}]);
}
export function transformAuxChatGPTCredentialLockShim(text) {
  return replay(text,JSON.parse(read('shim-anchors.json')));
}
export function transformAuxChatGPTCredentialLockHost(text) {
  return replay(text,JSON.parse(read('host-anchors.json')));
}
