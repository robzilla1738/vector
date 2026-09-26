// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { GeneratedResultSchema, GeneratedResultSummarySchema } from "@aux/contracts";
import { installMockBridge } from "./bridge";
import type { AuxBridge } from "../bridge";

it("provides a conversation result, durable-looking revisions and matching mock artifact cards",async()=>{
  const memory=new Map<string,string>();
  vi.stubGlobal("localStorage",{getItem:(key:string)=>memory.get(key)??null,setItem:(key:string,value:string)=>memory.set(key,value),removeItem:(key:string)=>memory.delete(key)});
  installMockBridge(new URLSearchParams("scenario=generated&generatedKind=xlsx"));
  const bridge=(window as unknown as {aux:AuxBridge}).aux;
  const first=GeneratedResultSchema.parse(await bridge.invoke("results.generated.get",{artifactId:"mock-generated"}));
  expect(first).toMatchObject({chatId:"mock-generated-chat",kind:"xlsx",revision:1});
  const second=GeneratedResultSchema.parse(await bridge.invoke("results.generate",{chatId:first.chatId,filename:first.filename,sourceArtifactId:first.artifactId,
    spec:{kind:"xlsx",sheets:[{name:"Priorities",rows:[["Area","Priority"],["Browsing","Very high"]]}]}}));
  expect(second).toMatchObject({revision:2,parentArtifactId:first.artifactId,rootArtifactId:first.artifactId});
  const versions=await bridge.invoke("results.generated.versions",{artifactId:second.artifactId});
  expect(versions.map(item=>GeneratedResultSummarySchema.parse(item).revision)).toEqual([1,2]);
  const cards=await bridge.invoke("conversations.artifacts.get",{chatId:first.chatId});
  expect(cards.artifacts.find(item=>item.artifactId===second.artifactId)).toMatchObject({generatedKind:"xlsx",revision:2,included:true});
  expect(cards.artifacts.find(item=>item.artifactId===first.artifactId)?.included).toBe(false);
  await expect(bridge.invoke("results.generate",{chatId:"another-chat",sourceArtifactId:first.artifactId,filename:"stolen.xlsx",spec:first.spec})).rejects.toThrow();
});
