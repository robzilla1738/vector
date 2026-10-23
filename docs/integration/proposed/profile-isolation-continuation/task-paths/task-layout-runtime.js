/* aux-native-task-paths-v1: locator projections, never filesystem admission. */
let auxTaskNativeBinding,auxTaskNativeCapture,auxTaskFirstRoots;
function auxTaskLayoutError(message){return Object.assign(new Error(message),{code:'AUX_NATIVE_TASK_LAYOUT_REQUIRED'});}
function auxTaskRoots(){
  if(!auxTaskNativeBinding){
    const binding=process._linkedBinding('aux_owned_native');
    const property=Object.getOwnPropertyDescriptor(binding,'captureStorageRoots');
    if(!property||typeof property.value!=='function'||property.writable||property.configurable)throw auxTaskLayoutError('Aux requires its retained native task layout.');
    auxTaskNativeBinding=binding;auxTaskNativeCapture=property.value;
  }
  const roots=Reflect.apply(auxTaskNativeCapture,auxTaskNativeBinding,[]);
  const keys=['format','layoutVersion','ownerGeneration','transportGeneration','controlHome','taskHome'];
  if(!roots||!Object.isFrozen(roots)||Object.keys(roots).sort().join('\0')!==keys.sort().join('\0')||roots.format!=='aux.native.storage-roots.v1'||roots.layoutVersion!==1)throw auxTaskLayoutError('Aux native task layout metadata is invalid.');
  for(const key of ['ownerGeneration','transportGeneration'])if(typeof roots[key]!=='string'||!(/^[1-9][0-9]{0,19}$/).test(roots[key]))throw auxTaskLayoutError('Aux native task layout generation is invalid.');
  for(const key of ['controlHome','taskHome'])if(typeof roots[key]!=='string'||!path.isAbsolute(roots[key])||roots[key].includes('\0')||path.resolve(roots[key])!==roots[key]||roots[key]==='/')throw auxTaskLayoutError('Aux native task layout locator is invalid.');
  if(roots.controlHome===roots.taskHome||roots.controlHome.startsWith(roots.taskHome+path.sep)||roots.taskHome.startsWith(roots.controlHome+path.sep))throw auxTaskLayoutError('Aux task and control storage must be separate.');
  if(auxTaskFirstRoots){for(const key of keys)if(roots[key]!==auxTaskFirstRoots[key])throw auxTaskLayoutError('Aux native task layout changed; restart the current native owner.');}
  else auxTaskFirstRoots=Object.freeze({...roots});
  return roots;
}
function auxTaskAccountId(value,roots){
  if(Number.isSafeInteger(value)&&value>=0)return value;
  if(typeof value==='string'){
    for(const base of [roots.controlHome,roots.taskHome]){
      const relative=path.relative(path.join(base,'u'),value);
      if((/^(?:0|[1-9][0-9]*)$/).test(relative)&&path.join(base,'u',relative)===value){const id=Number(relative);if(Number.isSafeInteger(id))return id;}
    }
  }
  throw auxTaskLayoutError('Aux refuses an unbound or legacy account storage locator.');
}
function getAccountTaskRoot(account){const roots=auxTaskRoots();return path.join(roots.taskHome,'u',String(auxTaskAccountId(account,roots)));}
function auxControlAccountRoot(account){const roots=auxTaskRoots();return path.join(roots.controlHome,'u',String(auxTaskAccountId(account,roots)));}
function getSessionTaskDir(session,account){
  const id=session?.id;
  if(typeof id!=='string'||!(/^[A-Za-z0-9_-]{1,128}$/).test(id))throw auxTaskLayoutError('Aux task session identity is invalid.');
  return path.join(getAccountTaskRoot(account),'sessions',id);
}
function getSharedSessionTaskDir(session,account){return session.trigger?.type==='sidechat'&&session.parentId?getSessionTaskDir({id:session.parentId},account):undefined;}
function auxTaskWorkspacePath(value){
  const roots=auxTaskRoots(),resolved=path.resolve(value),relative=path.relative(roots.controlHome,resolved);
  if(relative===''||(!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative)))throw auxTaskLayoutError('Aux refuses a workspace inside private control storage.');
  return resolved;
}
function auxTaskRoutineMemoryPath(account,routine){
  const root=path.join(getAccountTaskRoot(account),'memory','routines');
  const id=routine.id;
  if(typeof id!=='string'||!(/^[A-Za-z0-9_-]{1,128}$/).test(id))throw auxTaskLayoutError('Aux routine identity is invalid.');
  if(routine.metadata.memoryPath!==undefined){
    const selected=routine.metadata.memoryPath;
    if(typeof selected!=='string'||path.resolve(selected)!==selected)throw auxTaskLayoutError('Aux refuses a legacy routine memory locator.');
    const relative=path.relative(root,selected);
    if(relative===''||relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative)||path.extname(selected)!=='.md')throw auxTaskLayoutError('Aux refuses a routine memory locator outside its task projection.');
    return selected;
  }
  return path.join(root,id,'MEMORY.md');
}
