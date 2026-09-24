import { expect, it } from "vitest";
import { openDb, Repo } from "@aux/runtime";
import { SavedResults } from "../../apps/runtime/src/services/saved-results.js";

it("finds saved text outputs by filename or conversation and excludes archived/internal/binary results", () => {
  const db=openDb(":memory:"), repo=new Repo(db);
  try {
    repo.saveRun({runId:"r",goal:"Compare travel",status:"completed",pageIds:[],config:{chatId:"chat"},createdAt:1});
    for(const [id,name,type] of [["report","comparison.md","text/markdown"],["observation","observation-r1.txt","text/plain"],["image","photo.png","image/png"]]) repo.saveArtifact({artifactId:id!,runId:"r",path:`/tmp/${id}-${name}`,mediaType:type!,size:10,status:"complete",createdAt:2});
    const results=new SavedResults(repo,{read:()=>({dataBase64:Buffer.from("# Comparison").toString("base64")})} as never);
    expect(results.search("comparison")).toMatchObject([{filename:"comparison.md",chatId:"chat"}]);
    expect(results.search("travel")).toHaveLength(1);
    expect(results.search("travel")[0]).not.toHaveProperty("path");
    expect(results.read("report")).toMatchObject({content:"# Comparison",chatId:"chat",filename:"comparison.md"});
    expect(results.available([{artifactId:"report",chatId:"chat"},{artifactId:"report",chatId:"wrong-chat"},{artifactId:"image",chatId:"chat"}])).toEqual(["report"]);
    expect(()=>results.read("observation")).toThrow("unavailable");
    expect(()=>results.read("image")).toThrow("unavailable");
    repo.archiveConversation("chat",true);
    expect(results.search("travel")).toEqual([]);
    repo.deleteConversation("chat");
    expect(results.available([{artifactId:"report",chatId:"chat"}])).toEqual([]);
    expect(results.search("comparison")).toEqual([]);
    expect(()=>results.read("report")).toThrow();
  } finally {db.close();}
});

it("includes JSON reports while filtering observations by content even with ordinary filenames", () => {
  const db=openDb(":memory:"),repo=new Repo(db);
  try {
    repo.saveRun({runId:"r",goal:"Report",status:"completed",pageIds:[],config:{chatId:"chat"},createdAt:1});
    const observation=JSON.stringify({observationId:"o",pageId:"p",documentEpoch:1,revision:1,observedAt:1,scope:"full",content:{url:"https://example.com",title:"Example",viewport:{width:100,height:100,scale:1},scroll:{x:0,y:0,maxY:0},frames:[],text:"",headings:[],elements:[],formFields:[],tables:[],links:[],dialogs:[],truncated:false,stats:{elementsTotal:0,elementsShown:0,textChars:0,approxTokens:0}}});
    for(const id of ["internal","report"])repo.saveArtifact({artifactId:id,runId:"r",path:`/tmp/${id}-data.json`,mediaType:"application/json",size:100,status:"complete",createdAt:id==="internal"?3:2});
    const results=new SavedResults(repo,{read:(id:string)=>({dataBase64:Buffer.from(id==="internal"?observation:'{"total":4}').toString("base64")})} as never);
    expect(results.search("report",1)).toMatchObject([{artifactId:"report",filename:"data.json"}]);
    expect(results.read("report").content).toBe('{"total":4}');
    expect(()=>results.read("internal")).toThrow("cannot be displayed");
  }finally{db.close();}
});
