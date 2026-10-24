// Only the selected private native binding supplies these functions. No renderer
// method, generic FD, environment path or caller-defined proof substitutes it.
function auxChatGPTCredentialCapability() {
  const native = process._linkedBinding('aux_owned_native');
  const methods = {};
  for (const [role,name] of [['begin','beginChatGPTCredentialLock'],['sync','withChatGPTCredentialLockSync'],['close','closeChatGPTCredentialLock']]) {
    const descriptor = Object.getOwnPropertyDescriptor(native,name);
    if (!descriptor || descriptor.get || descriptor.set || descriptor.writable || descriptor.configurable || typeof descriptor.value !== 'function')
      throw Error('Aux native ChatGPT credential locking is unavailable');
    methods[role] = descriptor.value;
  }
  return Object.freeze(methods);
}
function auxPrepareChatGPTModule(module) {
  const lifetime = auxChatGPTLifetime();
  module.configureLifetime(Object.freeze({...lifetime,credentialLocks:auxChatGPTCredentialCapability()}));
  return module;
}
