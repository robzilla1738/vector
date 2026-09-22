import { mkdirSync, readFileSync, readdirSync, writeFileSync, renameSync, existsSync, lstatSync, rmSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { randomUUID } from "node:crypto";

export interface BrowserProfile { id:string; name:string; current:boolean; archived?:boolean }
type Record = { id:string; name:string; dataDir:string; profileDir:string; archived?:boolean };
const validId=(id:string)=>id==="default"||/^[0-9a-f]{8}-[0-9a-f-]{27}$/.test(id);
const nameOf=(value:unknown)=>{
  if(typeof value!=="string"||!value.trim()||value.trim().length>60||/[\u0000-\u001f]/.test(value))throw new Error("Use a profile name between 1 and 60 characters.");
  return value.trim();
};

/** Each managed profile owns a runtime and Chromium directory; the original stays put. */
const INSTANCE_STALE_MS=10*60*1000;
type InstanceMarker={pid:number;ts:number};

export class BrowserProfiles {
  constructor(readonly root:string, readonly currentId:string, current:{dataDir:string;profileDir:string}) {
    if(!isAbsolute(root)||!validId(currentId))throw new Error("Invalid browser profile configuration.");
    mkdirSync(root,{recursive:true,mode:0o700});
    if(lstatSync(root).isSymbolicLink())throw new Error("The browser profile directory cannot be a symbolic link.");
    const initial=join(root,"default.json");
    if(!existsSync(initial)&&currentId==="default") {
      try {writeFileSync(initial,JSON.stringify({id:"default",name:"Personal",...current}),{flag:"wx",mode:0o600});}
      catch(error){if((error as NodeJS.ErrnoException).code!=="EEXIST")throw error;}
    }
    const selected=this.read(currentId);
    if(selected.dataDir!==current.dataDir||selected.profileDir!==current.profileDir)throw new Error("This profile belongs to a different browser data directory.");
  }
  read(id:string):Record {
    if(!validId(id))throw new Error("Browser profile not found.");
    const file=join(this.root,`${id}.json`);
    if(lstatSync(file).isSymbolicLink())throw new Error("Invalid browser profile record.");
    const value=JSON.parse(readFileSync(file,"utf8")) as Record;
    if(value.id!==id||!isAbsolute(value.dataDir)||!isAbsolute(value.profileDir)||value.dataDir===value.profileDir)throw new Error("Invalid browser profile record.");
    nameOf(value.name);
    if(id!=="default"&&(value.dataDir!==join(this.root,id,"runtime")||value.profileDir!==join(this.root,id,"browser")))throw new Error("Invalid managed profile directories.");
    return value;
  }
  list():BrowserProfile[] {
    return readdirSync(this.root).filter(file=>file.endsWith(".json")&&validId(file.slice(0,-5))).map(file=>{
      const value=this.read(file.slice(0,-5));return {id:value.id,name:value.name,current:value.id===this.currentId,archived:value.archived===true};
    }).sort((a,b)=>Number(b.current)-Number(a.current)||a.name.localeCompare(b.name));
  }
  create(name:unknown):BrowserProfile {
    const label=nameOf(name),id=randomUUID();
    const directory=join(this.root,id);
    mkdirSync(directory,{mode:0o700});
    const record={id,name:label,dataDir:join(directory,"runtime"),profileDir:join(directory,"browser")};
    try {
      mkdirSync(record.dataDir,{mode:0o700});mkdirSync(record.profileDir,{mode:0o700});
      writeFileSync(join(this.root,`${id}.json`),JSON.stringify(record),{flag:"wx",mode:0o600});
    } catch(error){rmSync(directory,{recursive:true,force:true});throw error;}
    return {id,name:label,current:false};
  }
  rename(id:string,name:unknown) {
    const record={...this.read(id),name:nameOf(name)};
    return this.save(record);
  }
  archive(id:string,archived:boolean) {
    if(typeof archived!=="boolean")throw new Error("Invalid profile archive state.");
    if(archived&&(id==="default"||id===this.currentId))throw new Error("The original and current profiles cannot be archived.");
    return this.save({...this.read(id),archived});
  }
  /**
   * Deletion is distinct from archiving: the record and every managed byte of
   * browsing data are removed. Refuses the original profile (its data lives
   * outside the catalog), the profile this instance is running as, and any
   * profile whose instance still looks alive.
   */
  delete(id:string) {
    const record=this.read(id);
    if(id==="default")throw new Error("The original profile cannot be deleted.");
    if(id===this.currentId)throw new Error("Quit this profile window before deleting it.");
    if(this.instanceAlive(id))throw new Error(`Quit the “${record.name}” window before deleting its data.`);
    rmSync(join(this.root,id),{recursive:true,force:true});
    rmSync(join(this.root,`${id}.json`),{force:true});
    return this.list();
  }
  private instanceFile(id:string){return join(this.root,id,"instance.json");}
  /** Managed instances heartbeat their pid so deletion refuses live data loss. */
  markInstance() {
    if(this.currentId==="default")return;
    const marker:InstanceMarker={pid:process.pid,ts:Date.now()};
    try {writeFileSync(this.instanceFile(this.currentId),JSON.stringify(marker),{mode:0o600});} catch {/* A deleted-while-running profile simply stays marked. */}
  }
  instanceAlive(id:string):boolean {
    if(id==="default")return id===this.currentId;
    try {
      const marker=JSON.parse(readFileSync(this.instanceFile(id),"utf8")) as InstanceMarker;
      if(typeof marker.pid!=="number"||typeof marker.ts!=="number"||Date.now()-marker.ts>INSTANCE_STALE_MS)return false;
      try {process.kill(marker.pid,0);return true;} catch {return false;}
    } catch {return false;}
  }
  /** Last-active marker shared across instances; drives external-link routing. */
  noteActive(id:string) {
    if(!validId(id))return;
    const temporary=join(this.root,`.active-${randomUUID()}.tmp`);
    try {writeFileSync(temporary,JSON.stringify({profileId:id,ts:Date.now()}),{mode:0o600});renameSync(temporary,join(this.root,"active.json"));}
    catch {/* The catalog may be gone mid-delete; last-active simply stays stale. */}
    finally {rmSync(temporary,{force:true});}
  }
  /** The profile an external link belongs to: the last-active managed/default instance. */
  externalLinkTarget():string|null {
    try {
      const marker=JSON.parse(readFileSync(join(this.root,"active.json"),"utf8")) as {profileId?:unknown;ts?:unknown};
      if(typeof marker.profileId!=="string"||!validId(marker.profileId)||marker.profileId===this.currentId)return null;
      const record=this.read(marker.profileId);
      return record.archived?null:record.id;
    } catch {return null;}
  }
  private save(record:Record) {
    const id=record.id;
    const temporary=join(this.root,`.${id}-${randomUUID()}.tmp`);
    try {writeFileSync(temporary,JSON.stringify(record),{mode:0o600});renameSync(temporary,join(this.root,`${id}.json`));}
    finally {rmSync(temporary,{force:true});}
    return this.list();
  }
  environment(id:string,source:NodeJS.ProcessEnv):NodeJS.ProcessEnv {
    const record=this.read(id),env:NodeJS.ProcessEnv={};
    if(record.archived&&id!==this.currentId)throw new Error("Restore this profile before opening it.");
    // Never carry another profile's provider credentials, CDP endpoint, token or descriptor.
    for(const key of ["PATH","HOME","USER","LOGNAME","SHELL","TMPDIR","TMP","TEMP","LANG","LC_ALL","LC_CTYPE","DISPLAY","WAYLAND_DISPLAY","XDG_RUNTIME_DIR","SystemRoot","WINDIR"])if(source[key])env[key]=source[key];
    return {...env,AUX_DATA_DIR:record.dataDir,AUX_PROFILE_DIR:record.profileDir,AUX_PROFILE_CATALOG_DIR:this.root,AUX_BROWSER_PROFILE_ID:id,AUX_LOAD_DOTENV:"0"};
  }
}
