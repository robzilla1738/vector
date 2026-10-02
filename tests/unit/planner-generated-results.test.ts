import { fixturePage, fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ExcelJS from "exceljs";
import { ArtifactStore, EventBus, openDb, Repo, RunCoordinator, verifyDoneAgainstObservation } from "@aux/runtime";
import type { ModelClient } from "@aux/runtime";
import { CompletedGeneratedFileSchema, type Observation } from "@aux/contracts";
import { GeneratedResults } from "../../apps/runtime/src/services/generated-results.js";

const page:Observation={
  observationId:"fixture-observation",pageId:"page-1",documentEpoch:1,revision:1,observedAt:1,scope:"full",
  content:{url:"https://example.test/report",title:"Report",viewport:{width:800,height:600,scale:1},scroll:{x:0,y:0,maxY:0},
    frames:[],text:"Revenue is 42. Revenue is 45.",headings:["Revenue"],elements:[],formFields:[],tables:[],links:[],dialogs:[],truncated:false,
    stats:{elementsTotal:0,elementsShown:0,textChars:34,approxTokens:10}},
};
const answer={status:"done",message:"Workbook ready",result:{answer:"Revenue is 42",file:{filename:"revenue.xlsx",spec:{kind:"xlsx",sheets:[{name:"Revenue",rows:[["Period","Revenue"],["Q1",42],["Q2",45]]}]}}}};
function model():ModelClient {
  return {
    generateStructured:async request=>({object:request.schema.parse(answer),durationMs:1}),
    streamStructured:async request=>{request.onText?.(JSON.stringify(answer));return{object:request.schema.parse(answer),durationMs:1};},
    generateText:async()=>({text:"",durationMs:0}),listModels:async()=>[],
  };
}
async function waitForTurn(repo:Repo,runId:string){
  for(let i=0;i<300;i++){
    const status=repo.getRun(runId)?.status;
    if(status&&["completed","partially_completed","failed","cancelled","interrupted"].includes(status))return status;
    await new Promise(resolve=>setTimeout(resolve,10));
  }
  throw new Error("Planner fixture did not finish");
}

it("awaits a real XLSX artifact before marking a plain-chat planner turn complete",async()=>{
  const dir=mkdtempSync(join(tmpdir(),"aux-planner-files-"));
  const db=openDb(":memory:"),repo=new Repo(db),events=new EventBus(repo),files=new ArtifactStore(dir,repo,events);
  try{
    const save=vi.fn(async(run:{runId:string;config?:{chatId?:string}},raw:unknown)=>{
      const file=CompletedGeneratedFileSchema.parse(raw);
      return new GeneratedResults(repo,files).generate({...file,chatId:run.config!.chatId!,runId:run.runId});
    });
    const coordinatorFixturePages1 = {observe:async()=>page,execute:vi.fn(),capture:vi.fn(),livePageIds:()=>["page-1"],get:(fixturePageId: string): import("@aux/contracts").PageTarget => ({ ...fixturePage(fixturePageId, "https://example.test/report", 1), viewStatus:"visible" })};
    const coordinator=new RunCoordinator({ turnMentions: fixtureTurnMentions(pageId => coordinatorFixturePages1.get(pageId)),repo,events,pages:coordinatorFixturePages1 as never,
      model,defaultModel:()=>"fixture",recoveryModel:()=>undefined,recordModelCall:()=>{},saveCompletedGenerated:save});
    const run=await coordinator.start({goal:"Make a workbook from the observed revenue",pageIds:["page-1"],chatId:"chat-file"});
    expect(await waitForTurn(repo,run.runId)).toBe("completed");
    expect(save).toHaveBeenCalledOnce();
    expect(repo.getRun(run.runId)?.result).toMatchObject({generatedArtifactId:expect.any(String)});
    expect(repo.getRun(run.runId)?.result).not.toHaveProperty("file");
    const artifact=repo.listArtifacts({runId:run.runId}).find(item=>item.mediaType.includes("spreadsheetml"));
    expect(artifact).toBeDefined();
    const workbook=new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(files.read(artifact!.artifactId).dataBase64,"base64") as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    expect(workbook.getWorksheet("Revenue")?.getCell("B3").value).toBe(45);
    expect(new GeneratedResults(repo,files).get(artifact!.artifactId)).toMatchObject({chatId:"chat-file",revision:1});
  }finally{db.close();rmSync(dir,{recursive:true,force:true});}
},45_000);

it("does not mark a turn complete when the verified file cannot be stored",async()=>{
  const db=openDb(":memory:"),repo=new Repo(db),events=new EventBus(repo);
  try{
    const coordinatorFixturePages2 = {observe:async()=>page,execute:vi.fn(),capture:vi.fn(),livePageIds:()=>["page-1"],get:(fixturePageId: string): import("@aux/contracts").PageTarget => ({ ...fixturePage(fixturePageId, "https://example.test/report", 1), viewStatus:"visible" })};
    const coordinator=new RunCoordinator({ turnMentions: fixtureTurnMentions(pageId => coordinatorFixturePages2.get(pageId)),repo,events,pages:coordinatorFixturePages2 as never,
      model,defaultModel:()=>"fixture",recoveryModel:()=>undefined,recordModelCall:()=>{},saveCompletedGenerated:async()=>{throw new Error("disk full");}});
    const run=await coordinator.start({goal:"Make a workbook",pageIds:["page-1"],chatId:"chat-file-failed"});
    expect(await waitForTurn(repo,run.runId)).toBe("partially_completed");
    expect(repo.getRun(run.runId)?.error).toContain("disk full");
  }finally{db.close();}
},30_000);

it("rejects a generated file with a fact absent from observed evidence",()=>{
  const invented={...answer.result,file:{...answer.result.file,spec:{kind:"xlsx",sheets:[{name:"Revenue",rows:[["Period","Revenue"],["Q1",999]]}]}}};
  expect(verifyDoneAgainstObservation(invented,page,[])).toMatchObject({ok:false});
});
