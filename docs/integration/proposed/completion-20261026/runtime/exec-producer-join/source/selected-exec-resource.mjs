// Private symbol survives the original options spreads; no root/FD/PID grant.
const auxSelectedExecScope=Symbol('aux.selected.exec.scope');
const auxSelectedExecUses=new Set;
function auxPrepareSelectedExec(context,prepared){
 auxRequireSupervisedTasks();
 const held=auxCaptureReadFileScope(context);let settle;
 const originalClosed=new Promise(resolve=>{settle=resolve});
 const observed=held.scope.awaited(()=>originalClosed);
 observed.catch(()=>{}); // native observer retains original settlement independently.
 let released=false;
 const release=()=>{if(released)return;released=true;settle();prepared.release();const closing=held.close();auxSelectedExecUses.add(closing);closing.finally(()=>auxSelectedExecUses.delete(closing)).catch(()=>{})};
 Object.defineProperty(prepared.spawnOptions,auxSelectedExecScope,{value:held.scope,enumerable:true});
 return {spawnOptions:prepared.spawnOptions,release};
}
function auxInvokeSelectedExec(options,operation){
 auxRequireSupervisedTasks();const scope=options[auxSelectedExecScope];
 if(!scope)throw Error('Selected command owner is unavailable.');
 scope.assertCurrent();return scope.withExecSpawn(operation);
}
