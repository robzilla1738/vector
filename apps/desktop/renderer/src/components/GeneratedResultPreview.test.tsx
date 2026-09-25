// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { GeneratedResultPreview } from "./GeneratedResultPreview";

let host:HTMLDialogElement,root:ReturnType<typeof createRoot>;
beforeEach(()=>{vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);host=document.createElement("dialog");host.open=true;document.body.append(host);root=createRoot(host);});
afterEach(async()=>{await act(async()=>root.unmount());host.remove();vi.restoreAllMocks();vi.unstubAllGlobals();});
const file={artifactId:"artifact-a",chatId:"chat-a",filename:"report.docx",mediaType:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",byteLength:1200,createdAt:1,sha256:"a".repeat(64),kind:"docx" as const,revision:1,rootArtifactId:"artifact-a",parentArtifactId:"artifact-a",sourceRunId:"turn-a",preview:{title:"Brief",lines:["<script>alert(1)</script>"]},spec:{kind:"docx" as const,title:"Brief",paragraphs:["Current text"],tables:[]}};
const button=(label:string)=>[...host.querySelectorAll<HTMLButtonElement>("button")].find(element=>element.textContent===label)!;

it("shows inert document preview, exports stored bytes, and saves same-chat revision",async()=>{
  const invoke=vi.spyOn(bridge,"invoke").mockImplementation(async(method)=>{
    if(method==="results.generated.get")return file;
    if(method==="results.generated.versions")return [file];
    if(method==="results.generate")return {...file,artifactId:"artifact-b",revision:2};
    throw new Error(`Unexpected ${method}`);
  });
  const save=vi.spyOn(bridge,"saveStoredArtifact").mockResolvedValue("/tmp/report.docx");
  const changed=vi.fn();
  await act(async()=>root.render(<GeneratedResultPreview artifactId="artifact-a" chatId="chat-a" onClose={()=>{}} onVersionSaved={changed}/>));
  expect(host.textContent).toContain("<script>alert(1)</script>");
  expect(host.querySelector("script,iframe,img")).toBeNull();
  await act(async()=>button("Export file…").click());
  expect(save).toHaveBeenCalledWith("artifact-a","report.docx");
  await act(async()=>button("Revise").click());
  const editor=host.querySelector<HTMLTextAreaElement>("textarea")!;
  expect(editor.value).toContain("Current text");
  await act(async()=>button("Save new version").click());
  expect(invoke).toHaveBeenCalledWith("results.generate",expect.objectContaining({chatId:"chat-a",sourceArtifactId:"artifact-a",filename:"report.docx"}));
  expect(changed).toHaveBeenCalledWith("artifact-b");
});
