import {mkdtempSync,mkdirSync,symlinkSync,rmSync} from "node:fs";
import {join} from "node:path";
import {describe,it,expect} from "vitest";
import {extendDevelopmentAcceptance} from "../../tests/host/lib/dev-acceptance.mjs";
describe("created native Profile development acceptance",()=>{
 it("requires an actual owner-only Profile and refuses traversal, symlinks and replacement",()=>{
  const fixture=mkdtempSync("/tmp/aux-native-journey-");
  const userDataDir=join(fixture,"profile");mkdirSync(userDataDir,{mode:0o700});
  const options={userDataDir,features:["profiles"],sourceCommit:"a".repeat(40),token:"b".repeat(64)};
  try {
   expect(()=>extendDevelopmentAcceptance({...options,profileId:"Profile 1"})).toThrow();
   mkdirSync(join(userDataDir,"Profile 1"),{mode:0o700});
   expect(extendDevelopmentAcceptance({...options,profileId:"Profile 1"}).markers).toHaveLength(1);
   expect(()=>extendDevelopmentAcceptance({...options,profileId:"Profile 1"})).toThrow(/EEXIST/);
   expect(()=>extendDevelopmentAcceptance({...options,profileId:"../Default"})).toThrow();
   mkdirSync(join(userDataDir,"Profile 2"),{mode:0o755});
   expect(()=>extendDevelopmentAcceptance({...options,profileId:"Profile 2"})).toThrow(/owner-only/);
   symlinkSync(join(userDataDir,"Profile 1"),join(userDataDir,"Profile 3"));
   expect(()=>extendDevelopmentAcceptance({...options,profileId:"Profile 3"})).toThrow(/symlinks/);
  }finally{rmSync(fixture,{recursive:true,force:true});}
 });
});
