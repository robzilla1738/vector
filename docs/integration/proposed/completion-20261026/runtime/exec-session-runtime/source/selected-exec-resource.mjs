// Private symbol survives the original options spreads; no root/FD/PID grant.
const auxSelectedExecScope=Symbol('aux.selected.exec.scope');
const auxSelectedExecAccountSignal=Symbol('aux.selected.exec.account-signal');
const auxSelectedExecUses=new Set;
function auxPrepareSelectedExec(context,prepared){
 auxRequireSupervisedTasks();
 const held=auxCaptureReadFileScope(context);let scratch;
 try{scratch=held.scope.prepareExecScratch()}catch(error){held.close().catch(()=>{});throw error}
 const env={...prepared.spawnOptions.env};
 // Preserve explicitly selected full-access HOME; all implicit private scratch
 // and ordinary package output uses this exact stored native session owner.
 if(context.session.permissionMode!=='full-access')env.HOME=scratch.home;
 env.TMPDIR=scratch.tmp;
 env.NPM_CONFIG_CACHE=scratch.cache+'/npm';env.PIP_CACHE_DIR=scratch.cache+'/pip';
 env.NPM_CONFIG_PREFIX=scratch.prefix;
 prepared.spawnOptions={...prepared.spawnOptions,env};
 let settle;
 const originalClosed=new Promise(resolve=>{settle=resolve});
 const observed=held.scope.awaited(()=>originalClosed);
 observed.catch(()=>{}); // native observer retains original settlement independently.
 let released=false;
 const release=()=>{if(released)return;released=true;settle();prepared.release();const closing=held.close();auxSelectedExecUses.add(closing);closing.finally(()=>auxSelectedExecUses.delete(closing)).catch(()=>{})};
 Object.defineProperty(prepared.spawnOptions,auxSelectedExecScope,{value:held.scope,enumerable:true});
 Object.defineProperty(prepared.spawnOptions,auxSelectedExecAccountSignal,{value:held.signal,enumerable:true});
 return {spawnOptions:prepared.spawnOptions,release};
}
function auxInvokeSelectedExec(options,operation){
 auxRequireSupervisedTasks();const scope=options[auxSelectedExecScope];
 if(!scope)throw Error('Selected command owner is unavailable.');
 scope.assertCurrent();return scope.withExecSpawn(operation);
}

function auxSelectedCommandSignal(options,signal){
 const account=options[auxSelectedExecAccountSignal];
 if(!account)throw Error('Selected command account cancellation is unavailable.');
 return signal?AbortSignal.any([account,signal]):account;
}
function auxBindSelectedCommandSession(options,session,closed){
 const signal=auxSelectedCommandSignal(options),stop=()=>session.dispose();
 signal.addEventListener('abort',stop,{once:true});
 // Original closed was latched at native producer creation; a user-visible
 // cancellation Promise must never retire this subscription/owner early.
 Promise.resolve(closed).then(()=>signal.removeEventListener('abort',stop),()=>{});
 if(signal.aborted)stop();
}
