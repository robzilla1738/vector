// The original resolver and file.access hooks remain authoritative. This facade
// only replaces their raw path-based IO with a private, retained native target.
function auxCreateSelectedReplFs(options,held){
 const original=createReplFs(options),scope=held.scope;
 const current=()=>{held.signal.throwIfAborted();held.guard.assertCurrent();scope.assertCurrent()};
 const check=async(path,mode)=>{
  current();const resolved=original.resolvePath(path,mode),id=getCurrentReplToolCallId();
  if(options.hooks&&id){const event={toolCallId:id,path:resolved,mode,source:'repl.fs'};await options.hooks.trigger('file.access',event,event)}
  current();return resolved;
 };
 const run=async(method,paths,modes,value)=>{
  current();const requested=paths.map((path,index)=>original.resolvePath(path,modes[index]));
  const operation=scope.prepareFs(method,...requested);
  try{
   for(let index=0;index<operation.paths.length;++index)await check(operation.paths[index],modes[index]);
   const input=typeof value==='function'?await value():value;current();
   return input===undefined?operation.execute():operation.execute(input);
  }finally{operation.close()}
 };
 const invalid=(name,message)=>{const error=new TypeError(message);error.code=name;throw error};
 const mode=value=>{
  if(typeof value==='string'&&/^[0-7]+$/.test(value))value=parseInt(value,8);
  if(!Number.isInteger(value)||value<0||value>0xffffffff)return invalid('ERR_OUT_OF_RANGE','mode must be an integer between 0 and 0xffffffff');
  return value;
 };
 const bytes=async data=>{
  if(typeof data==='string')return Buffer.from(data);
  if(ArrayBuffer.isView(data))return Buffer.from(data.buffer,data.byteOffset,data.byteLength);
  if(data==null||typeof data[Symbol.asyncIterator]!=='function'&&typeof data[Symbol.iterator]!=='function')return invalid('ERR_INVALID_ARG_TYPE','data must be a string, Buffer, TypedArray, DataView, or iterable');
  const chunks=[];let size=0;
  for await(const part of data){current();let chunk;if(typeof part==='string')chunk=Buffer.from(part);else if(ArrayBuffer.isView(part))chunk=Buffer.from(part.buffer,part.byteOffset,part.byteLength);else return invalid('ERR_INVALID_ARG_TYPE','data chunks must be strings or ArrayBuffer views');chunks.push(chunk);size+=chunk.byteLength}
  return Buffer.concat(chunks,size);
 };
 const typeMethods=mode=>({isFile(){return(mode&0o170000)===0o100000},isDirectory(){return(mode&0o170000)===0o040000},isBlockDevice(){return(mode&0o170000)===0o060000},isCharacterDevice(){return(mode&0o170000)===0o020000},isSymbolicLink(){return(mode&0o170000)===0o120000},isFIFO(){return(mode&0o170000)===0o010000},isSocket(){return(mode&0o170000)===0o140000}});
 const stats=value=>Object.assign(value,typeMethods(value.mode),Object.fromEntries(['atime','mtime','ctime','birthtime'].map(name=>[name,new Date(value[name+'Ms'])])));
 const delay=milliseconds=>new Promise((resolve,reject)=>{
  current();const abort=()=>{clearTimeout(timer);held.signal.removeEventListener('abort',abort);reject(held.signal.reason??Error('The original REPL closed.'))};
  const timer=setTimeout(()=>{held.signal.removeEventListener('abort',abort);resolve()},milliseconds);
  held.signal.addEventListener('abort',abort,{once:true});if(held.signal.aborted)abort();
 });
 return {
  readFile:async(path,options)=>{const encoding=typeof options==='string'?options:options?.encoding;if(encoding!=null&&(typeof encoding!=='string'||!Buffer.isEncoding(encoding)))return invalid('ERR_INVALID_ARG_VALUE','Unknown encoding');const data=await run('readFile',[path],['read']);return encoding==null?data:data.toString(encoding)},
  writeFile:async(path,data)=>run('writeFile',[path],['write'],()=>bytes(data)),
  mkdir:async(path,options)=>{if(options==null)options={};else if(typeof options==='number'||typeof options==='string')options={mode:mode(options)};else if(typeof options!=='object')return invalid('ERR_INVALID_ARG_TYPE','options must be an object, integer, or octal string');if(options.recursive!==undefined&&typeof options.recursive!=='boolean')return invalid('ERR_INVALID_ARG_TYPE','recursive must be boolean');return run('mkdir',[path],['write'],{recursive:options.recursive??false,mode:mode(options.mode??0o777)})},
  readdir:async(path,options)=>{const values=await run('readdir',[path],['read']);return options?.withFileTypes?values.map(value=>Object.assign(value,{parentPath:original.resolvePath(path,'read')},typeMethods(value.mode))):values.map(value=>value.name)},
  stat:async path=>stats(await run('stat',[path],['read'])),
  lstat:async path=>stats(await run('lstat',[path],['read'])),
  unlink:async path=>run('unlink',[path],['write']),
  rm:async(path,options)=>{
   if(options==null)options={};if(typeof options!=='object')return invalid('ERR_INVALID_ARG_TYPE','options must be an object');
   for(const name of ['recursive','force'])if(options[name]!==undefined&&typeof options[name]!=='boolean')return invalid('ERR_INVALID_ARG_TYPE',name+' must be boolean');
   const maxRetries=options.maxRetries??0,retryDelay=options.retryDelay??100;
   for(const [name,value]of [['maxRetries',maxRetries],['retryDelay',retryDelay]])if(!Number.isInteger(value)||value<0||value>0x7fffffff)return invalid('ERR_OUT_OF_RANGE',name+' must be a nonnegative 32-bit integer');
   for(let attempt=0;;++attempt){try{return await run('rm',[path],['write'],{recursive:options.recursive??false,force:options.force??false})}catch(error){if(!options.recursive||attempt>=maxRetries||!['EBUSY','EMFILE','ENFILE','ENOTEMPTY','EPERM'].includes(error.code))throw error;await delay(Math.min(0x7fffffff,retryDelay*(attempt+1)))}}
  },
  rename:async(from,to)=>run('rename',[from,to],['write','write']),
  copyFile:async(from,to)=>run('copyFile',[from,to],['read','write']),
  access:async path=>run('access',[path],['read']),
  resolvePath:original.resolvePath
 };
}
