// Node stream facade for one native fixed account helper. No FD/path/argv API.
function auxAccountMemoryProcess(account) {
 const binding=process._linkedBinding('aux_owned_native');
 const get=name=>{const d=Object.getOwnPropertyDescriptor(binding,name);if(!d||d.get||d.set||d.writable||d.configurable)throw Error('Native memory capability unavailable');return d.value};
 if(get('supervisedTasksEnabled')!==false)throw Error('Finite memory helper requires ordinary native mode');
 const create=get('createAccountMemoryProcess');if(typeof create!=='function'||!Number.isSafeInteger(account)||account<0)throw Error('Native registered memory account unavailable');
 const {EventEmitter}=require$2('node:events'),{Readable,Writable}=require$2('node:stream');
 const child=new EventEmitter();let native;
 child.stdout=new Readable({read(){}});child.stderr=new Readable({read(){}});
 child.stdin=new Writable({write(bytes,encoding,done){try{Promise.resolve(native.write(Buffer.from(bytes))).then(()=>done(),done)}catch(error){done(error)}},final(done){try{Promise.resolve(native.endInput()).then(()=>done(),done)}catch(error){done(error)}}});
 native=Reflect.apply(create,binding,[account,(kind,value)=>{
  if(kind==='stdout'||kind==='stderr')child[kind].push(value);
  else if(kind==='stdoutEnd'||kind==='stderrEnd')child[kind==='stdoutEnd'?'stdout':'stderr'].push(null);
  else if(kind==='spawn'){child.pid=value;child.emit('spawn')}
  else if(kind==='error')child.emit('error',Error(value));
  else if(kind==='close'){child.stdout.push(null);child.stderr.push(null);child.emit('exit',value.code,value.signal);child.emit('close',value.code,value.signal)}
 }]);
 child.kill=signal=>native.kill(signal);
 child.auxClose=()=>native.close();
 return child;
}
function auxSpawnMemoryProcess(options){
 if(process.platform==='darwin'){
  const binding=process._linkedBinding('aux_owned_native'),mode=Object.getOwnPropertyDescriptor(binding,'supervisedTasksEnabled');
  if(mode&&!mode.get&&!mode.set&&!mode.writable&&!mode.configurable&&mode.value===false)return auxAccountMemoryProcess(options.accountId);
 }
 return spawn(options.executable,[options.modelDirectory,options.runtimeLibrary??''],{stdio:['pipe','pipe','pipe'],windowsHide:true,shell:false,env:{...process.env,ORT_DISABLE_TELEMETRY:'1'}});
}
