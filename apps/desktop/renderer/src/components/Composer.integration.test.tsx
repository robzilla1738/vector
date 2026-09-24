// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import HomeAsk from "./HomeAsk";
import { Conversation } from "./Conversation";
import { BrowserContextPicker } from "./BrowserContextPicker";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { makePage, makeRun } from "../mock/fixtures";

let root: ReturnType<typeof createRoot>, host: HTMLDivElement;
const initial = useStore.getState();
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("ResizeObserver", class { observe(){} disconnect(){} });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  HTMLElement.prototype.scrollIntoView = vi.fn();
  HTMLDialogElement.prototype.showModal = function(){ this.setAttribute("open", ""); this.querySelector<HTMLInputElement>("input")?.focus(); };
  HTMLDialogElement.prototype.close = function(){ this.removeAttribute("open"); };
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); useStore.setState(initial, true); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

it("keeps answers separate from follow-ups and preserves a typed draft when editing a queued message", async () => {
  const run = makeRun({runId:"question-run",config:{chatId:"draft-chat"},status:"needs_input",statusMessage:"Which account?",pageIds:[]});
  const message = {messageId:"queued-1",chatId:"draft-chat",targetRunId:run.runId,deliveryRunId:"next",mode:"queue",status:"accepted",text:"Then summarize the result",pageIds:[],contextPageRefs:[],expectedRevision:0,createdAt:1,updatedAt:1};
  useStore.setState({runs:[run],steps:{[run.runId]:[]},pages:[],connected:true,prompt:null,pendingTurns:[],conversationDrafts:{"chat:draft-chat":"Keep my existing follow-up"},runAnswerDrafts:{[run.runId]:{question:"Which account?",text:"Use the work account"}}} as never);
  const invoke = vi.spyOn(bridge,"invoke").mockImplementation(async method => {
    if(method === "runs.list") return [run];
    if(method === "runs.messages.list") return [message];
    if(method === "runs.message.cancel") return {...message,status:"cancelled"};
    if(method === "conversations.get") return {title:"Draft",archived:false};
    if(method === "conversations.artifacts.get") return {artifacts:[]};
    if(method === "conversations.images.get") return {images:[]};
    if(method === "conversations.attachments.get") return {attachments:[]};
    if(method === "conversations.sources.get") return {sources:[]};
    if(method === "runs.context.get") return {entries:[],historyEnabled:true};
    return {workspace:null,memory:null};
  });
  await act(async () => root.render(<Conversation chatId="draft-chat" embedded/>));
  const input = () => host.querySelector<HTMLTextAreaElement>('[aria-label="Reply to conversation"]')!;
  const button = (name:string) => [...host.querySelectorAll<HTMLButtonElement>("button")].find(item=>item.textContent===name)!;
  expect(input().value).toBe("Use the work account");
  expect(host.querySelector('.conversation-thread .composer-queue')).toBeNull();
  expect(host.querySelector('.conversation-compose .composer-queue')).not.toBeNull();
  await act(async () => button("Queue next").click());
  expect(input().value).toBe("Keep my existing follow-up");
  await act(async () => button("Edit").click());
  expect(input().value).toBe("Keep my existing follow-up\n\nThen summarize the result");
  expect(invoke.mock.calls.filter(([method])=>method === "runs.message.cancel")).toHaveLength(1);
  await act(async () => button("Answer question").click());
  expect(input().value).toBe("Use the work account");
  expect(host.querySelectorAll('[aria-label="Run controls"]')).toHaveLength(1);
});

it("searches only available browser tabs and returns focus without silently changing scope", async () => {
  useStore.setState({pages:[makePage(0,{pageId:"work",title:"Work notes",url:"https://example.com/work"}),makePage(0,{pageId:"private-agent",title:"Agent notes",ownedByRuntime:true}),makePage(0,{pageId:"crashed",title:"Broken notes",viewStatus:"crashed"})],activePageId:"work"});
  const change = vi.fn();
  await act(async () => root.render(<BrowserContextPicker value="active" onChange={change}/>));
  const trigger = host.querySelector('button')!;
  await act(async () => trigger.click());
  const input = document.querySelector<HTMLInputElement>('[aria-label="Find browser context"]')!;
  expect(document.activeElement).toBe(input);
  await act(async () => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!.call(input,'notes'); input.dispatchEvent(new Event('input',{bubbles:true})); });
  const dialog = document.querySelector('dialog')!;
  expect(dialog.textContent).toContain('Work notes');
  expect(dialog.textContent).not.toContain('Agent notes');
  expect(dialog.textContent).not.toContain('Broken notes');
  expect(change).not.toHaveBeenCalled();
  await act(async () => dialog.querySelector<HTMLButtonElement>('.context-choice')!.click());
  expect(change).toHaveBeenCalledWith('work');
  expect(document.querySelector('dialog')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it("keeps home context controls behind plus and preserves the draft while toggling them", async () => {
  useStore.setState({agentDraft:"A clean home draft",railOpen:false,runs:[],pendingTurns:[],pages:[],connected:true,conversationId:null});
  await act(async () => root.render(<HomeAsk onSearch={vi.fn()}/>));
  const input = host.querySelector<HTMLTextAreaElement>('[aria-label="Reply to conversation"]')!;
  expect(input.value).toBe("A clean home draft");
  expect(host.querySelector('[aria-label="Browser context"]')).toBeNull();
  const plus = host.querySelector<HTMLButtonElement>('[aria-label="Add context"]')!;
  await act(async () => plus.click());
  expect(document.querySelector('dialog[aria-label="Add context"] [aria-label="Browser context"]')).not.toBeNull();
  await act(async () => document.querySelector('dialog[aria-label="Add context"]')!.dispatchEvent(new Event("cancel",{bubbles:false,cancelable:true})));
  expect(host.querySelector('[aria-label="Browser context"]')).toBeNull();
  expect(host.querySelector('textarea')).toBe(input);
  expect(input.value).toBe("A clean home draft");
});
