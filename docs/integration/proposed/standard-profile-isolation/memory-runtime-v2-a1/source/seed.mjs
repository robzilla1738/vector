/** Native-owned startup adaptation of the supplied distribution cache seeder.
 * The product caller fixes source/home/pins from its sealed entry and native roots.
 * This function is inlined there; its fixture export is not a product RPC API.
 */
export async function seedAuxMemoryV2({source,home,seed,check}){
 const fs=await import('node:fs/promises'),path=await import('node:path'),crypto=await import('node:crypto');
 const {constants}=await import('node:fs');
 const fail=(message,code='AUX_MEMORY_UNSAFE')=>Object.assign(Error(message),{code});
 const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
 const relative=value=>typeof value==='string'&&value.length>0&&value.length<=1024&&!path.isAbsolute(value)
  &&!/[\\\p{Cc}]/u.test(value)&&value.split('/').every(part=>part&&part!=='.'&&part!=='..');
 if(typeof check!=='function'||typeof source!=='string'||typeof home!=='string'||!path.isAbsolute(source)||!path.isAbsolute(home)
  ||source===home||source.startsWith(home+path.sep)||home.startsWith(source+path.sep))throw fail('Fixed disjoint memory source/native home required');
 if(seed?.format!=='aux.bundled-memory-seed.v2'||seed.target!=='darwin-arm64'||seed.groups?.length!==2
  ||new Set(seed.groups.map(group=>group.kind)).size!==2)throw fail('Exact versioned memory seed required');
 const directory=async(absolute,owned=false)=>{
  check();const stat=await fs.lstat(absolute);
  if(!stat.isDirectory()||stat.isSymbolicLink()||(stat.mode&0o022)||(owned&&(stat.uid!==process.getuid()||(stat.mode&0o777)!==0o700)))
   throw fail('Unsafe memory directory');
 };
 const chain=async absolute=>{
  let current=path.parse(absolute).root;
  for(const part of absolute.slice(current.length).split(path.sep).filter(Boolean)){
   check();current=path.join(current,part);const stat=await fs.lstat(current);
   if(!stat.isDirectory()||stat.isSymbolicLink())throw fail('Memory path traverses a link or non-directory');
  }
 };
 const read=async(absolute,pin,owned=false)=>{
  check();await chain(path.dirname(absolute));
  const file=await fs.open(absolute,constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);
  try{
   const before=await file.stat();
   if(!before.isFile()||before.nlink!==1||(before.mode&0o022)||(owned&&before.uid!==process.getuid()))throw fail('Unsafe memory file');
   const maximum=pin?.size??1048576;
   if(before.size>maximum)throw fail('Memory file size differs','AUX_MEMORY_INTEGRITY');
   const bytes=await file.readFile(),after=await file.stat();
   if(['dev','ino','size','mtimeMs','ctimeMs'].some(key=>before[key]!==after[key]))throw fail('Memory file changed during read');
   if(pin&&(bytes.length!==pin.size||hash(bytes)!==pin.sha256||(before.mode&0o777)!==pin.mode))throw fail('Memory checksum, size or mode differs','AUX_MEMORY_INTEGRITY');
   check();return bytes;
  }finally{await file.close()}
 };
 const syncDirectory=async absolute=>{
  const file=await fs.open(absolute,constants.O_RDONLY|constants.O_DIRECTORY|constants.O_NOFOLLOW);
  try{await file.sync()}finally{await file.close()}
 };
 const write=async(absolute,bytes,mode)=>{
  check();const file=await fs.open(absolute,constants.O_WRONLY|constants.O_CREAT|constants.O_EXCL|constants.O_NOFOLLOW,mode);
  try{await file.writeFile(bytes);await file.sync()}finally{await file.close()}
 };
 const mkdir=async absolute=>{
  check();try{await fs.mkdir(absolute,{mode:0o700})}catch(error){if(error.code!=='EEXIST')throw error}
  await directory(absolute,true);
 };
 await chain(source);await chain(home);await directory(home,true);
 // Authenticate the complete public seed before any target-cache mutation.
 const catalog=await read(path.join(source,'memory-catalog.json'));
 if(hash(catalog)!==seed.catalogSha256)throw fail('Bundled catalog differs','AUX_MEMORY_INTEGRITY');
 let totalBytes=0;
 for(const group of seed.groups){
  if(!['models','memory-runtimes'].includes(group.kind)||!/^[a-f0-9]{64}$/.test(group.key)||!/^[a-f0-9-]{36}$/.test(group.generation)
   ||group.sourcePrefix!==`${group.kind}/${group.key}/${group.generation}`||group.descriptor!==(group.kind==='models'?'model.json':'runtime.json')
   ||!Array.isArray(group.files)||group.files.length<2||group.files.length>256)throw fail('Memory seed group differs');
  const seen=new Set();
  for(const pin of group.files){
   if(!relative(pin.path)||seen.has(pin.path)||!['file','directory'].includes(pin.type)||![0o600,0o700].includes(pin.mode))throw fail('Unsafe memory seed record');
   seen.add(pin.path);const absolute=path.join(source,group.sourcePrefix,pin.path);
   if(pin.type==='directory'){await directory(absolute);continue}
   if(!Number.isSafeInteger(pin.size)||pin.size<1||pin.size>536870912||!/^[a-f0-9]{64}$/.test(pin.sha256))throw fail('Unbounded memory seed file');
   totalBytes+=pin.size;if(totalBytes>1073741824)throw fail('Memory seed exceeds bounded size');
   await read(absolute,pin);
  }
  const descriptor=group.files.find(pin=>pin.path===group.descriptor);
  if(!descriptor||descriptor.sha256!==group.key)throw fail('Memory cache-key/descriptor association differs');
 }
 const retained=async(root,group)=>{
  try{
   const current=(await read(path.join(root,'CURRENT'),null,true)).toString('utf8');
   if(!/^[a-f0-9-]{36}$/.test(current))return false;
   const generation=path.join(root,current);await directory(generation,true);
   for(const pin of group.files){
    const absolute=path.join(generation,pin.path);
    if(pin.type==='directory')await directory(absolute,true);else await read(absolute,pin,true);
   }
   return true;
  }catch(error){if(error.code==='ENOENT'||error.code==='AUX_MEMORY_INTEGRITY')return false;throw error}
 };
 const report={format:'aux.memory-seed.result.v2',published:[],retained:[],authorityGranted:false};
 for(const group of seed.groups){
  check();const cache=path.join(home,group.kind),root=path.join(cache,group.key);
  await mkdir(cache);await mkdir(root);
  if(await retained(root,group)){report.retained.push(group.kind);continue}
  const temporary=await fs.mkdtemp(path.join(root,'.aux-memory-seed-v2-'));
  const generation=crypto.randomUUID(),current=path.join(root,`.CURRENT-${generation}`);
  try{
   const directories=[];
   for(const pin of group.files){
    check();const target=path.join(temporary,pin.path);
    if(pin.type==='directory'){await fs.mkdir(target,{mode:0o700});directories.push(target);continue}
    const bytes=await read(path.join(source,group.sourcePrefix,pin.path),pin);
    await write(target,bytes,pin.mode);
   }
   for(const directory of directories.reverse())await syncDirectory(directory);
   await syncDirectory(temporary);check();
   await fs.rename(temporary,path.join(root,generation));await syncDirectory(root);
   await write(current,Buffer.from(generation),0o600);check();
   await fs.rename(current,path.join(root,'CURRENT'));await syncDirectory(root);check();
   report.published.push(group.kind);
  }finally{
   // These are our unique unpublished staging names, never an existing cache.
   // Published generations remain intact even if a later step fails.
   await fs.rm(temporary,{recursive:true,force:true});await fs.rm(current,{force:true});
  }
 }
 check();return report;
}
