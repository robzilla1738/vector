// Called only while the exact registered read_file tool holds its native scope.
function auxSelectedReadFileStat(file){
 const scope=auxSelectedReadScopeContext.getStore();
 if(!scope)return fs$1.stat(file);
 const reader=scope.openReadFile(file);
 try{return {size:reader.size,isFile:()=>true}}finally{reader.close()}
}
async function auxSelectedReadFileBytes(file,maximum=64*1024*1024){
 const scope=auxSelectedReadScopeContext.getStore();
 if(!scope)return fs$1.readFile(file);
 const reader=scope.openReadFile(file);
 try{
  if(reader.size>maximum)throw Error('Image exceeds the 64 MiB native file limit.');
  const chunks=[];let size=0;
  for(;;){const chunk=reader.read();if(!chunk.length)break;size+=chunk.length;if(size>maximum)throw Error('Selected image changed size.');chunks.push(chunk)}
  return Buffer.concat(chunks,size);
 }finally{reader.close()}
}
async function auxSelectedReadFileMime(file){
 const scope=auxSelectedReadScopeContext.getStore();
 if(!scope)return detectSupportedImageMimeTypeFromFile(file);
 const reader=scope.openReadFile(file);
 try{return await detectSupportedImageMimeTypeFromBuffer(reader.read().subarray(0,4100))}
 finally{reader.close()}
}
async function auxSelectedReadFileRange(file,offset,limit){
 const scope=auxSelectedReadScopeContext.getStore();
 if(!scope)return null;
 const reader=scope.openReadFile(file);
 if(reader.size<FAST_PATH_MAX_SIZE){
  try{const chunks=[];let size=0;for(;;){const chunk=reader.read();if(!chunk.length)break;size+=chunk.length;chunks.push(chunk)}return readRangeFast(Buffer.concat(chunks,size).toString('utf8'),offset,limit)}
  finally{reader.close()}
 }
 // Readable owns the original admitted FD; destroy waits for generator finally
 // and its real close event before the selected session lease can be released.
 let input;
 try{input=Readable.from((async function*(){try{for(;;){const chunk=reader.read();if(!chunk.length)return;yield chunk;await new Promise(resolve=>setImmediate(resolve))}}finally{reader.close()}})(),{encoding:'utf8',objectMode:false,emitClose:true,autoDestroy:true})}
 catch(error){reader.close();throw error}
 return readRangeStreaming(file,offset,limit,input);
}
