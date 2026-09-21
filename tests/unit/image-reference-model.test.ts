import { expect, it } from "vitest";
import { z } from "zod";
import { MockLanguageModelV4 } from "../../apps/runtime/node_modules/ai/dist/test/index.js";
import { GatewayModelClient, imageReferenceMessage } from "../../apps/runtime/src/agent/gateway-client.js";

const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==";
const usage = {inputTokens:{total:10,noCache:10,cacheRead:0,cacheWrite:0},outputTokens:{total:3,text:3,reasoning:0}};
const response = (text:string) => ({content:[{type:"text" as const,text}],finishReason:{unified:"stop" as const,raw:"stop"},usage,warnings:[]});

it("retains image references in structured output and JSON repair calls", async () => {
  const model = new MockLanguageModelV4({doGenerate:[response("not json"),response('{"ok":true}')]});
  const client = new GatewayModelClient("local-test", {model:()=>model});
  const schema=z.discriminatedUnion("ok",[z.object({ok:z.literal(true)}),z.object({ok:z.literal(false)})]);
  expect((await client.generateStructured({modelId:"test",system:"Read the image",prompt:"Is the image visible?",imageDataUrls:[image],schema})).object).toEqual({ok:true});
  expect(model.doGenerateCalls).toHaveLength(2);
  for (const call of model.doGenerateCalls) {
    const user=call.prompt.find((message:{role:string;content:unknown})=>message.role==="user")!;
    expect(user.content).toEqual(expect.arrayContaining([expect.objectContaining({type:"file",mediaType:"image/png"})]));
  }
});

it("retains image references through streamed-output repair", async () => {
  const model = new MockLanguageModelV4({doGenerate:response('{"ok":true}'),doStream:{stream:new ReadableStream({start(controller){
    controller.enqueue({type:"stream-start",warnings:[]}); controller.enqueue({type:"text-start",id:"t"});
    controller.enqueue({type:"text-delta",id:"t",delta:"invalid"}); controller.enqueue({type:"text-end",id:"t"});
    controller.enqueue({type:"finish",finishReason:{unified:"stop",raw:"stop"},usage});controller.close();
  }})}});
  const client = new GatewayModelClient("local-test",{model:()=>model});
  await client.streamStructured({modelId:"test",system:"Inspect",prompt:"Describe",imageDataUrls:[image],schema:z.object({ok:z.boolean()}),onText:()=>{}});
  for(const call of [...model.doStreamCalls,...model.doGenerateCalls])expect(call.prompt.find((message:{role:string;content:unknown})=>message.role==="user")!.content).toEqual(expect.arrayContaining([expect.objectContaining({type:"file",mediaType:"image/png"})]));
  expect(model.doStreamCalls).toHaveLength(1);expect(model.doGenerateCalls).toHaveLength(1);
});

it("rejects remote or unsupported image inputs instead of silently sending text only", async () => {
  expect(()=>imageReferenceMessage("Inspect",["https://example.com/image.png"])).toThrow("snapshots");
  expect(()=>imageReferenceMessage("Inspect",["data:image/svg+xml;base64,AAAA"])).toThrow("snapshots");
  expect(()=>imageReferenceMessage("Inspect",Array(6).fill(image))).toThrow("five");
  const client=new GatewayModelClient("local-test",{only:["cerebras"]});
  await expect(client.generateStructured({modelId:"alibaba/qwen3.8-27b",system:"Inspect",prompt:"Describe",imageDataUrls:[image],schema:z.object({ok:z.boolean()})})).rejects.toMatchObject({code:"capability_unsupported"});
});
