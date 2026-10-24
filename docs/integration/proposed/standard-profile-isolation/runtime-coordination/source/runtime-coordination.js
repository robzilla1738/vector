// Appended inside the supplied daemon module by exact reviewed anchors.
// These closures are not exported as account-selected capability APIs.
function auxRuntimeContext(){return auxRuntimeContext.value??=new AsyncLocalStorage()}
function auxRuntimeNativeFunction(name) {
  const binding=process._linkedBinding('aux_owned_native'),d=Object.getOwnPropertyDescriptor(binding,name);
  if(!d||!Object.hasOwn(d,'value')||typeof d.value!=='function'||d.writable||d.configurable)
    throw Object.assign(Error('Native runtime coordination is unavailable'),{code:'AUX_RUNTIME_COORDINATION_UNAVAILABLE'});
  return d.value.bind(binding);
}
function auxRuntimeMutation() {
  auxBrokerBoundary().assertOwner();const scope=auxRuntimeContext().getStore();
  if(!scope)throw Error('Runtime mutation requires a retained native scope');return scope;
}
async function auxWithRuntimeMutation(callback) {
  auxBrokerBoundary().assertOwner();
  if(auxRuntimeContext().getStore())return callback();
  const scope=await auxRuntimeNativeFunction('acquireRuntimeMutation')();
  try{return await auxRuntimeContext().run(scope,callback)}finally{scope.close()}
}
function auxRuntimeOwnPath(absolute) {
  const roots=auxRuntimeNativeFunction('captureStorageRoots')();
  if(absolute!==path.join(roots.taskHome,'runtime'))throw Error('Runtime override differs from authenticated task home');
  return absolute;
}
async function auxRuntimePrepareUse(signal,options) {
  if(signal?.aborted)throw signal.reason??Error('Runtime use cancelled');
  const runtime=auxRuntimeOwnPath(path.resolve(options.runtimeDir??AUX_RUNTIME_DIR));
  const scope=await auxRuntimeNativeFunction('acquireRuntimeUse')();
  try {
    if(signal?.aborted)throw signal.reason??Error('Runtime use cancelled');
    await (await import('node:module')).createRequire(process.execPath)(path.join(__auxDaemonResources,'native/runtime-bootstrap.cjs')).inspectRetainedRuntime(runtime);
    let released=false;
    return {state:'ready',release:()=>{if(!released){released=true;scope.close()}}};
  }catch(error){scope.close();throw error}
}
function auxRuntimeRequireReleasePolicy(release) {
  // Distribution is deferred. An Aux release must have an authenticated native
  // policy; metadata hashes or JS/environment-provided certificate strings are
  // not its authority. Original bundled third-party signatures stay untouched.
  let authorize;try{authorize=auxRuntimeNativeFunction('authorizeRuntimeRelease')}catch{throw Object.assign(Error('Aux runtime updates are not configured: authenticated Aux release policy is required'),{code:'AUX_RUNTIME_RELEASE_POLICY_UNAVAILABLE'})}
  return authorize(release);
}
async function auxRuntimeCloseZip(reader) {
  const record=[...auxZipReaders].find(record=>record.reader===reader);
  if(!record)throw Error('ZIP physical lifetime is unavailable');
  reader.close();await record.lifetime;
}
async function auxRuntimeExtract(archive,destination,release) {
  const scope=auxRuntimeMutation(),root=`aux-runtime-${release.version}-${release.platform}`;
  let reader,closure;scope.mkdir(destination);
  try {
    reader=await auxOpenZipResource(archive);
    const record=[...auxZipReaders].find(record=>record.reader===reader);
    if(!record){scope.markUnknown();throw Error("ZIP physical lifetime is unavailable")}
    closure=record.lifetime;
    await new Promise((resolve,reject)=>{
      let chain=Promise.resolve(),stopped=false,failure;
      const stop=error=>{failure??=error;stopped=true;reader.close()};
      reader.on('error',stop);
      reader.once('close',()=>{
        chain.then(()=>{reader.off('error',stop);failure?reject(failure):resolve()},reject);
      });
      reader.once('end',()=>{stopped=true;reader.close()});
      reader.on('entry',entry=>{
        if(stopped)return;
        chain=chain.then(async()=>{
          const {relativePath,kind,mode}=validateZipEntry(entry,root);
          if(!relativePath){if(kind!=='directory')throw Error('Runtime archive root must be a directory');return;}
          const output=path.join(destination,root,...relativePath.split('/'));
          if(kind==='directory')scope.mkdir(output);
          else if(kind==='symlink'){
            const target=(await readZipEntryBuffer(reader,entry,SYMLINK_TARGET_MAX_BYTES)).toString('utf8');
            assertSafeSymlinkTarget(relativePath,target);scope.mkdir(path.dirname(output));scope.symlink(output,target);
          }else if(kind==='file'){
            scope.mkdir(path.dirname(output));scope.write(output,Buffer.alloc(0),false);
            const stream=await openZipEntry(reader,entry);
            try{for await(const chunk of stream){
              const bytes=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);
              for(let offset=0;offset<bytes.length;offset+=8*1024*1024)scope.write(output,bytes.subarray(offset,offset+8*1024*1024),true);
            }}finally{
              if(!stream.closed)await new Promise((resolve,reject)=>{
                let error;stream.on('error',value=>{error??=value});stream.once('close',()=>error?reject(error):resolve());stream.destroy();
              });
            }
            scope.chmod(output,(mode&511)||0o644);
          }else if(kind!=='skip')throw Error(`Unsupported runtime archive entry type: ${kind}`);
        }).then(()=>{if(!stopped)reader.readEntry()},stop);
      });
      reader.readEntry();
    });
  }finally{if(reader){reader.close();try{if(!closure)throw Error("ZIP completion unavailable");await closure}catch(error){scope.markUnknown();throw error}}}
  return path.join(destination,root);
}

async function auxRuntimeReadStatus(options) {
  if(auxRuntimeContext().getStore())return getAgentRuntimeStatusUnlocked(options);
  const runtime=auxRuntimeOwnPath(path.resolve(options.runtimeDir??AUX_RUNTIME_DIR));
  const scope=await auxRuntimeNativeFunction('acquireRuntimeUse')();
  let needsRecovery=false;
  try {
    const present=await stat$1(runtime).then(()=>true).catch(error=>{if(error.code==='ENOENT')return false;throw error});
    needsRecovery=!present&&await stat$1(`${runtime}.backup`).then(()=>true).catch(error=>{if(error.code==='ENOENT')return false;throw error});
    if(!needsRecovery)return await auxRuntimeContext().run(scope,()=>getAgentRuntimeStatusUnlocked(options));
  }finally{scope.close()}
  return auxWithRuntimeMutation(async()=>{await recoverRuntimeBackup(runtime);return getAgentRuntimeStatusUnlocked(options)});
}
