// Actual account bootstrap only. Fixed native roots and existing account locator.
function auxEnsurePrivateMemoryAccountDirectories(account) {
 if(process.platform!=='darwin')return;
 try {
  const binding=process._linkedBinding('aux_owned_native');
  const mode=Object.getOwnPropertyDescriptor(binding,'supervisedTasksEnabled');
  const factory=Object.getOwnPropertyDescriptor(binding,'createAccountMemoryProcess');
  if(!mode||mode.get||mode.set||mode.writable||mode.configurable||mode.value!==false||
     !factory||factory.get||factory.set||factory.writable||factory.configurable||typeof factory.value!=='function')return;
 }catch{return}
 return auxBrokerBoundary().sync(()=>{
  const roots=auxTaskRoots(),id=auxTaskAccountId(account,roots);
  const fs=require$2('node:fs'),held=[];
  const owner=process.geteuid();
  function verify(entry,privateMode=true) {
   const stat=fs.fstatSync(entry.fd),named=fs.lstatSync(entry.path),mode=stat.mode&0o7777;
   if(!stat.isDirectory()||named.isSymbolicLink()||!named.isDirectory()||stat.uid!==owner||
      stat.dev!==entry.dev||stat.ino!==entry.ino||named.dev!==stat.dev||named.ino!==stat.ino||
      named.uid!==owner||named.mode!==stat.mode||fs.realpathSync(entry.path)!==entry.path||
      (privateMode?mode!==0o700:mode!==0o700&&mode!==0o755))
    throw Error('Aux account memory directory identity or permissions changed');
   return stat;
  }
  function openDirectory(filename,parent) {
   if(parent)verify(parent);
   const fd=fs.openSync(filename,fs.constants.O_RDONLY|fs.constants.O_DIRECTORY|fs.constants.O_NOFOLLOW);
   const entry={fd,path:filename};held.push(entry);
   const stat=fs.fstatSync(fd);entry.dev=stat.dev;entry.ino=stat.ino;
   verify(entry,!parent);
   if(parent&&(stat.mode&0o7777)!==0o700) {
    // Only the exact owned physical directory opened above is tightened.
    // Unknown modes/owners/symlinks refuse before this descriptor operation.
    fs.fchmodSync(fd,0o700);
    fs.fsyncSync(fd);
   }
   verify(entry);
   if(parent)verify(parent);
   return entry;
  }
  function child(parent,name) {
   verify(parent);
   const filename=path.join(parent.path,name);
   try{fs.mkdirSync(filename,{mode:0o700})}catch(error){if(error?.code!=='EEXIST')throw error}
   return openDirectory(filename,parent);
  }
  try {
   for(const root of [roots.controlHome,roots.taskHome]) {
    const home=openDirectory(root),users=child(home,'u'),directory=child(users,String(id));
    if(root===roots.taskHome)child(directory,'memory');
   }
   for(const entry of held)verify(entry);
  }finally{
   let closeError;
   for(const entry of held.reverse())try{fs.closeSync(entry.fd)}catch(error){closeError??=error}
   if(closeError)throw closeError;
  }
 });
}
