// Existing authenticated account/profile source, frozen before native lookup.
function auxSelectedAccountIdentity(account,profileId){
 init_accounts();init_lifecycle();
 if(!account||!Number.isSafeInteger(account.id)||account.id<0||!Number.isSafeInteger(account.createdAt)||
    typeof account.incarnationId!=='string'||typeof profileId!=='string'||!profileId||isExternalOwnerSuspended(account.id))
  throw Error('The selected account/profile is unavailable.');
 const current=AccountRegistry.getAccount(account.id);
 const keys=['id','mode','provider','userId','authStatus','createdAt','incarnationId'];
 if(!current||keys.some(key=>current[key]!==account[key]))throw Error('The selected account changed.');
 const row=AccountRegistry.getAll().profileAccountBindings[profileId];
 if(!row||row.profileId!==profileId||row.accountId!==account.id)throw Error('The selected profile binding changed.');
 const copy=(value,fields)=>Object.freeze(Object.fromEntries(fields.filter(key=>Object.hasOwn(value,key)&&value[key]!==undefined).map(key=>[key,value[key]])));
 return Object.freeze({account:copy(current,keys),profileBinding:copy(row,['profileId','accountId','profileIndex','profilePath','updatedAt'])});
}
const auxSelectedReadFileTools=new WeakSet;
const auxSelectedReadScopeContext=new AsyncLocalStorage;
const auxSelectedReadScopes=new Set;
let auxSelectedReadStopRegistered=false;
function auxIsSelectedReadFileTool(tool){return auxSelectedReadFileTools.has(tool)}
function auxStopSelectedReadScopes(){return Promise.all([...auxSelectedReadScopes].map(scope=>scope.close()))}
function auxCaptureReadFileScope(context){
 init_accounts();init_lifecycle();
 const account=AccountRegistry.getAccount(context.accountId);
 if(!account||account.id!==context.accountId||typeof context.session?.id!=='string')throw Error('The selected file session is unavailable.');
 const bindings=AccountRegistry.getAll().profileAccountBindings;
 const explicit=context.session.browserBinding?.profileId;
 const rows=Object.values(bindings).filter(row=>row.accountId===context.accountId);
 // Account is explicit from the actual agent context, never current selection.
 // Multiple or missing registered profile bindings are not resolved arbitrarily.
 if(rows.length!==1||explicit&&rows[0].profileId!==explicit)throw Error('The selected file profile binding is unavailable.');
 const profileId=explicit??rows[0].profileId,controller=new AbortController,boundary=auxBrokerBoundary();
 const guard=auxCreateProductivityAccountGuard(context.accountId,account,profileId,controller,boundary);
 let scope;
 try{scope=boundary.captureSelectedBuiltinSession(context.accountId,context.session.id,Buffer.from(JSON.stringify(auxSelectedAccountIdentity(account,profileId))));scope.assertTaskSessionPath(context.sessionDir)}
 catch(error){guard.dispose();throw error}
 const stop=()=>scope.close();controller.signal.addEventListener('abort',stop,{once:true});
 auxSelectedReadScopes.add(scope);
 if(!auxSelectedReadStopRegistered){boundary.registerProducerStop(auxStopSelectedReadScopes);auxSelectedReadStopRegistered=true}
 let closing;
 return {scope,guard,close(){if(!closing)closing=Promise.resolve(scope.close()).finally(()=>{guard.dispose();controller.signal.removeEventListener('abort',stop);auxSelectedReadScopes.delete(scope)});return closing}};
}
function auxRegisterSelectedReadFileTool(context,tool){
 const execute=tool.execute;
 tool.execute=async(...args)=>{
  if(auxSupervisedTasksAvailable())return execute.apply(tool,args);
  const input=args[1],filename=typeof input?.path==='string'?input.path:'';
  if(!['.pdf','.heic','.heif'].includes(path.extname(filename).toLowerCase()))auxRequireSupervisedTasks();
  const held=auxCaptureReadFileScope(context);
  try{return await held.scope.awaited(()=>auxSelectedReadScopeContext.run(held.scope,()=>execute.apply(tool,args)))}
  finally{await held.close()}
 };
 auxSelectedReadFileTools.add(tool);return tool;
}
function auxReadFilePdfBinding(){const scope=auxSelectedReadScopeContext.getStore();return scope?scope.pdf:nativePdf}
async function auxReadFileUtility(command,input){
 const scope=auxSelectedReadScopeContext.getStore();
 if(!scope)return runNativeHelperCommandAsync(command,input);
 scope.assertCurrent();
 try{return JSON.parse(scope.utility.run(command,input))}catch(error){return {error:error instanceof Error?error.message:String(error)}}
}
