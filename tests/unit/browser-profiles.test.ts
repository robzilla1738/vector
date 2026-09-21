import { afterEach, expect, it } from "vitest";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BrowserProfiles } from "../../apps/desktop/main/browser-profiles.js";
const directories:string[]=[];
afterEach(()=>{for(const dir of directories.splice(0))rmSync(dir,{recursive:true,force:true});});
function setup(){const dir=mkdtempSync(join(tmpdir(),"aux-profile-check-"));directories.push(dir);const original={dataDir:join(dir,"original-data"),profileDir:join(dir,"original-browser")};return {dir,original,profiles:new BrowserProfiles(join(dir,"profiles"),"default",original)};}
it("preserves the original profile and creates distinct identities even for matching names",()=>{
  const {profiles,original}=setup();
  expect(profiles.read("default")).toMatchObject(original);
  const first=profiles.create("Work"),second=profiles.create("Work");
  expect(first.id).not.toBe(second.id);
  expect(profiles.read(first.id).dataDir).not.toBe(profiles.read(second.id).dataDir);
  profiles.rename(first.id,"Research");
  expect(profiles.read(first.id).name).toBe("Research");
  expect(profiles.read(second.id).name).toBe("Work");
  expect(JSON.parse(readFileSync(join(profiles.root,"default.json"),"utf8"))).toMatchObject(original);
});
it("reopens a managed profile without inheriting credentials, endpoints or dotenv loading",()=>{
  const {profiles}=setup(),profile=profiles.create("Work");
  const env=profiles.environment(profile.id,{PATH:"/bin",HOME:"/fixture/home",OPENAI_API_KEY:"secret",AUX_RUNTIME_FILE:"/old/runtime.json",VECTOR_API_TOKEN:"token",AUX_ELECTRON_CDP:"http://localhost:99"});
  expect(env).toMatchObject({PATH:"/bin",HOME:"/fixture/home",AUX_LOAD_DOTENV:"0",AUX_BROWSER_PROFILE_ID:profile.id});
  expect(env.OPENAI_API_KEY).toBeUndefined();expect(env.VECTOR_API_TOKEN).toBeUndefined();expect(env.AUX_RUNTIME_FILE).toBeUndefined();expect(env.AUX_ELECTRON_CDP).toBeUndefined();
  const child=new BrowserProfiles(profiles.root,profile.id,{dataDir:env.AUX_DATA_DIR!,profileDir:env.AUX_PROFILE_DIR!});
  expect(child.list().find(item=>item.current)?.id).toBe(profile.id);
  expect(()=>profiles.read("../../elsewhere")).toThrow();
  expect(()=>profiles.create(" ")).toThrow();
});
it("archives reversibly without removing browsing data or changing identity",()=>{
  const {profiles}=setup(),profile=profiles.create("Work");
  const original=profiles.read(profile.id);
  expect(profiles.archive(profile.id,true).find(item=>item.id===profile.id)?.archived).toBe(true);
  expect(profiles.read(profile.id)).toMatchObject(original);
  expect(()=>profiles.environment(profile.id,{})).toThrow("Restore");
  profiles.rename(profile.id,"Archived work");
  expect(profiles.read(profile.id).archived).toBe(true);
  profiles.archive(profile.id,false);
  expect(profiles.environment(profile.id,{}).AUX_DATA_DIR).toBe(original.dataDir);
  expect(()=>profiles.archive("default",true)).toThrow();
  const child=new BrowserProfiles(profiles.root,profile.id,original);
  expect(()=>child.archive(profile.id,true)).toThrow();
});
