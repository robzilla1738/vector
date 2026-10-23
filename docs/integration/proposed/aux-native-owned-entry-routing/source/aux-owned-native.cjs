'use strict';
// Actual embedding registers this finite binding for each real Environment.
// No original addon, filesystem key adapter, path or environment fallback.
const binding=process._linkedBinding('aux_owned_native');
const descriptors=Object.getOwnPropertyDescriptors(binding);
if(typeof descriptors.run?.value!=='function'||typeof descriptors.withAccountRegistryLock?.value!=='function')throw Error('Aux native owner registration is incomplete');
module.exports=Object.freeze({run:descriptors.run.value,withAccountRegistryLock:descriptors.withAccountRegistryLock.value});
