import {accessSync,constants,lstatSync,mkdirSync,readFileSync,realpathSync,renameSync,statSync,writeFileSync} from 'node:fs';
import {basename,extname,isAbsolute,join} from 'node:path';
import {randomUUID} from 'node:crypto';

export class DownloadLocation{
 private selected:string|null=null;
 private error='';
 private config:string;
 private reserved=new Set<string>();
 constructor(private dataDir:string){
  this.config=join(dataDir,'download-location.json');
  try{
   if(statSync(this.config).size>16384)throw new Error('Invalid download folder preference.');
   const value=JSON.parse(readFileSync(this.config,'utf8'));
   if(value.path!==null&&(typeof value.path!=='string'||!isAbsolute(value.path)))throw new Error('Invalid download folder preference.');
   this.selected=value.path;
  }catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')this.error='The saved download folder could not be read. Choose a folder or restore the default.';}
 }
 status():{path:string;custom:boolean;error?:string}{
  const path=this.selected??join(this.dataDir,'downloads');
  let error=this.error;
  if(!error){try{
   if(this.selected&&realpathSync(path)!==path)throw new Error('Folder was replaced.');
   try{this.check(path);}catch(reason){if(!this.selected&&(reason as NodeJS.ErrnoException).code==='ENOENT')this.check(this.dataDir);else throw reason;}
  }catch{error='The download folder is unavailable or not writable. Choose another folder before downloading.';}}
  return {path,custom:this.selected!==null,...(error?{error}:{})};
 }
 private check(path:string){if(!statSync(path).isDirectory())throw new Error('Choose a folder.');accessSync(path,constants.W_OK);}
 choose(path:string|null){
  const selected=path===null?null:realpathSync(path);
  if(selected)this.check(selected);
  const temporary=this.config+'.'+randomUUID()+'.tmp';
  writeFileSync(temporary,JSON.stringify({path:selected}),{mode:0o600,flag:'wx'});renameSync(temporary,this.config);
  this.selected=selected;this.error='';return this.status();
 }
 destination(filename:string){
  const state=this.status();if(state.error)throw new Error(state.error);
  if(!state.custom)mkdirSync(state.path,{recursive:true});
  this.check(state.path);
  // Reserve in-process before Electron starts writing; never reuse a known disk entry.
  let name=basename(filename).replace(/[\x00-\x1f\x7f]/g,'_')||'download';
  while(Buffer.byteLength(name)>200)name=Array.from(name).slice(0,-1).join('');
  const extension=extname(name),stem=name.slice(0,name.length-extension.length);
  for(let index=0;index<10000;index++){
   const path=join(state.path,index?`${stem} (${index})${extension}`:name);
   const reservation=path.normalize('NFC').toLowerCase();
   if(this.reserved.has(reservation))continue;
   try{lstatSync(path);continue;}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
   this.reserved.add(reservation);return path;
  }
  throw new Error('Too many files with this name. Choose another download folder.');
 }
}
