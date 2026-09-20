import {constants} from 'node:fs';
import {open,realpath,lstat,readdir,mkdir,rename,unlink,writeFile,link} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import type {ProjectFile,ProjectFileHistory,ProjectFileVersionSnapshot} from '@vector/contracts';
const LIMIT=256*1024;
const hash=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');

/** Selected checkout files only; not a general filesystem API or OS sandbox. */
export class ProjectFiles{
  private saving=new Set<string>();
  constructor(private checkout:(id:string)=>Promise<{path:string;files:string[]}>,private allowCreate:(id:string,name:string)=>Promise<void>){}
  private parts(name:string){
    const parts=typeof name==='string'?name.split('/'):[];
    if(!parts.length||name.length>1024||parts.length>20||/[\x00-\x1f\x7f\\]/.test(name)||parts.some(part=>!part||part!==part.trim()||part==='.'||part==='..'||part.toLowerCase()==='.git'))throw new Error('Use a relative file path inside this checkout, without Git metadata or traversal.');
    return parts;
  }
  private async parent(root:string,parts:string[],create:boolean){
    let parent=root;
    for(const part of parts.slice(0,-1)){
      const next=join(parent,part);
      if(await realpath(parent)!==parent)throw new Error('Symbolic links are not supported by this editor.');
      if(create)try{await mkdir(next);}catch(error){if((error as NodeJS.ErrnoException).code!=='EEXIST')throw error;}
      if(await realpath(next)!==next||!(await lstat(next)).isDirectory())throw new Error('Choose a path through regular checkout folders, without symbolic links.');
      try{await lstat(join(next,'.git'));throw new Error('Files inside a nested Git repository must be opened as a separate project.');}
      catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
      parent=next;
    }
    if(await realpath(parent)!==parent)throw new Error('Symbolic links are not supported by this editor.');
    return parent;
  }
  async create(id:string,name:string):Promise<ProjectFile>{
    const parts=this.parts(name);
    const project=await this.checkout(id);
    if(project.files.length>=5000)throw new Error('This checkout has reached the editor limit of 5,000 files. Use your external editor.');
    if(project.files.includes(name))throw new Error('This file already exists or is tracked. Open it from the file list.');
    await this.allowCreate(id,name);
    if(await realpath(project.path)!==project.path)throw new Error('Checkout was replaced.');
    const parent=await this.parent(project.path,parts,true);
    let file;
    try{file=await open(join(parent,parts.at(-1)!),'wx',0o644);}
    catch(error){if((error as NodeJS.ErrnoException).code==='EEXIST')throw new Error('This path already exists. No file was overwritten.');throw error;}
    try{await file.sync();}finally{await file.close();}
    return {projectId:id,name,content:'',sha256:hash(Buffer.alloc(0))};
  }
  private async target(id:string,name:string){
    if(typeof name!=='string'||name.includes('\0')||name.startsWith('/')||name.split('/').some(part=>!part||part==='.'||part==='..'||part.toLowerCase()==='.git'))throw new Error('Choose a file inside this checkout.');
    const project=await this.checkout(id);
    if(!project.files.includes(name))throw new Error('The file is not in the checkout file list. Refresh the list.');
    const path=join(project.path,name);
    if(await realpath(project.path)!==project.path||await realpath(path)!==path)throw new Error('Symbolic links are not supported by this editor.');
    return {path,root:project.path};
  }
  private async readPath(path:string){
    const file=await open(path,constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);
    try{
      const stat=await file.stat();if(!stat.isFile()||stat.nlink!==1)throw new Error('Choose a regular file without hard links.');
      if(stat.size>LIMIT)throw new Error('The editor supports UTF-8 files up to 256 KB.');
      const bytes=Buffer.alloc(LIMIT+1);let length=0;
      while(length<bytes.length){const read=await file.read(bytes,length,bytes.length-length,null);if(!read.bytesRead)break;length+=read.bytesRead;}
      if(length>LIMIT)throw new Error('The editor supports UTF-8 files up to 256 KB.');
      const data=bytes.subarray(0,length);let content:string;
      try{content=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(data);}catch{throw new Error('This file is not UTF-8 text.');}
      if(content.includes('\0'))throw new Error('Binary files are not supported by this editor.');
      return {content,sha256:hash(data),mode:stat.mode&0o777,ino:stat.ino,dev:stat.dev};
    }finally{await file.close();}
  }
  async read(id:string,name:string):Promise<ProjectFile>{
    const target=await this.target(id,name);const file=await this.readPath(target.path);
    return {projectId:id,name,content:file.content,sha256:file.sha256};
  }
  async externalPath(id:string,name:string){return (await this.target(id,name)).path;}
  private async recovery(target:{root:string},name:string,file:{content:string;sha256:string}){
    const recoveryRoot=join(dirname(target.root),'file-history');await mkdir(recoveryRoot,{recursive:true,mode:0o700});
    if(await realpath(recoveryRoot)!==recoveryRoot)throw new Error('Recovery directory was replaced.');
    const recoveryPath=join(recoveryRoot,randomUUID()+'.json');
    await writeFile(recoveryPath,JSON.stringify({name,savedAt:Date.now(),sha256:file.sha256,content:file.content}),{flag:'wx',mode:0o600});
    return recoveryPath;
  }
  async move(id:string,name:string,nextName:string,expectedHash:string):Promise<ProjectFile&{recoveryPath:string}>{
    if(name===nextName)throw new Error('Choose a different file path.');
    const parts=this.parts(nextName);const project=await this.checkout(id);
    if(project.files.includes(nextName))throw new Error('The destination already exists or is tracked.');
    await this.allowCreate(id,nextName);
    const target=await this.target(id,name);const file=await this.readPath(target.path);
    if(file.sha256!==expectedHash)throw new Error('The file changed outside Aux. Reload it before renaming.');
    const recoveryPath=await this.recovery(target,nextName,file);
    const parent=await this.parent(project.path,parts,true);const destination=join(parent,parts.at(-1)!);
    const latest=await this.readPath(target.path);const stat=await lstat(target.path);
    if(latest.sha256!==expectedHash||stat.ino!==file.ino||stat.dev!==file.dev)throw new Error('The file changed while renaming. Reload it and try again.');
    try{await link(target.path,destination);}catch(error){if((error as NodeJS.ErrnoException).code==='EEXIST')throw new Error('The destination already exists. No file was replaced.');throw error;}
    try{await unlink(target.path);}catch(error){try{await unlink(destination);}catch{}throw error;}
    return {projectId:id,name:nextName,content:file.content,sha256:file.sha256,recoveryPath};
  }
  async remove(id:string,name:string,expectedHash:string):Promise<{name:string;recoveryPath:string}>{
    const target=await this.target(id,name);const file=await this.readPath(target.path);
    if(file.sha256!==expectedHash)throw new Error('The file changed outside Aux. Reload it before deleting.');
    const recoveryPath=await this.recovery(target,name,file);
    const latest=await this.readPath(target.path);const stat=await lstat(target.path);
    if(latest.sha256!==expectedHash||stat.ino!==file.ino||stat.dev!==file.dev)throw new Error('The file changed while deleting. Reload it and try again.');
    await unlink(target.path);return {name,recoveryPath};
  }
  private async historyRoot(id:string,name:string){
    const target=await this.target(id,name);const root=join(dirname(target.root),'file-history');
    try{if(await realpath(root)!==root)throw new Error('Recovery directory was replaced.');}
    catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}
    return root;
  }
  private async version(root:string,name:string,versionId:string):Promise<ProjectFileVersionSnapshot|null>{
    if(!/^[a-f0-9-]{36}$/.test(versionId))throw new Error('Invalid recovery version.');
    const file=await open(join(root,versionId+'.json'),constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);
    try{
      const stat=await file.stat();if(!stat.isFile()||stat.nlink!==1||stat.size>2*1024*1024)throw new Error('Recovery copy is not a supported regular file.');
      const bytes=Buffer.alloc(stat.size+1);let length=0;
      while(length<bytes.length){const read=await file.read(bytes,length,bytes.length-length,null);if(!read.bytesRead)break;length+=read.bytesRead;}
      if(length>stat.size)throw new Error('Recovery copy is too large.');
      const saved=JSON.parse(bytes.subarray(0,length).toString('utf8'));
      if(saved.name!==name)return null;
      if(typeof saved.content!=='string'||saved.content.includes('\0')||Buffer.byteLength(saved.content,'utf8')>LIMIT||typeof saved.savedAt!=='number'||!Number.isFinite(saved.savedAt)||saved.sha256!==hash(Buffer.from(saved.content,'utf8')))throw new Error('Recovery copy failed its integrity check.');
      return {versionId,savedAt:saved.savedAt,sha256:saved.sha256,byteLength:Buffer.byteLength(saved.content,'utf8'),content:saved.content};
    }finally{await file.close();}
  }
  async history(id:string,name:string):Promise<ProjectFileHistory>{
    const root=await this.historyRoot(id,name);let names:string[];
    try{names=(await readdir(root)).filter(name=>/^[a-f0-9-]{36}\.json$/.test(name));}
    catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return {versions:[],limited:false,unreadable:0};throw error;}
    if(names.length>1000)throw new Error('This project has more than 1,000 recovery copies. Open its file-history folder in Finder.');
    const dated=await Promise.all(names.map(async name=>({name,time:await lstat(join(root,name)).then(stat=>stat.mtimeMs).catch(()=>0)})));
    const result:ProjectFileHistory={versions:[],limited:names.length>100,unreadable:0};
    for(const entry of dated.sort((a,b)=>b.time-a.time).slice(0,100)){
      try{const version=await this.version(root,name,entry.name.slice(0,-5));if(version){const {content,...metadata}=version;result.versions.push(metadata);}}
      catch{result.unreadable++;}
    }
    result.versions.sort((a,b)=>b.savedAt-a.savedAt);return result;
  }
  async readVersion(id:string,name:string,versionId:string):Promise<ProjectFileVersionSnapshot>{
    const version=await this.version(await this.historyRoot(id,name),name,versionId);
    if(!version)throw new Error('This recovery version belongs to another file.');return version;
  }

  async save(id:string,name:string,expectedHash:string,content:string):Promise<ProjectFile&{recoveryPath:string}>{
    if(typeof content!=='string'||content.includes('\0')||Buffer.byteLength(content,'utf8')>LIMIT||Buffer.from(content,'utf8').toString('utf8')!==content)throw new Error('Use UTF-8 text up to 256 KB.');
    const key=id+':'+name;if(this.saving.has(key))throw new Error('This file is already being saved.');this.saving.add(key);
    let temporary:string|undefined;
    try{
      const target=await this.target(id,name);const previous=await this.readPath(target.path);
      if(previous.sha256!==expectedHash)throw new Error('The file changed outside Aux. Your draft is kept; reload the file before saving.');
      const recoveryPath=await this.recovery(target,name,previous);
      temporary=join(dirname(target.path),'.aux-save-'+randomUUID());
      const output=await open(temporary,'wx',previous.mode);
      try{await output.writeFile(content,'utf8');await output.chmod(previous.mode);await output.sync();}finally{await output.close();}
      // Detect ordinary concurrent editor changes immediately before atomic replace.
      await this.target(id,name);const latest=await this.readPath(target.path);const stat=await lstat(target.path);
      if(latest.sha256!==expectedHash||stat.ino!==previous.ino||stat.dev!==previous.dev)throw new Error('The file changed while saving. Your draft and recovery copy are kept; reload before saving.');
      await rename(temporary,target.path);temporary=undefined;
      return {projectId:id,name,content,sha256:hash(Buffer.from(content,'utf8')),recoveryPath};
    }finally{this.saving.delete(key);if(temporary)await unlink(temporary).catch(()=>{});}
  }
}
