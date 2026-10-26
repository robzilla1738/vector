const auxSettledContextRejections=new WeakSet;
async function auxGetBrowserActionContext(route,signal){
 try{return await auxBrowserNativeContext(route,signal)}catch(error){
  // Only this awaited, read-only native/profile/window lookup is classified.
  // Physical debugger/tab work and unrelated command failures remain unknown.
  if(error&&(typeof error==='object'||typeof error==='function'))auxSettledContextRejections.add(error);
  throw error;
 }
}
