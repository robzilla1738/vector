// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {HOME_DRAFT_CHAT_KEY,PENDING_CHAT_KEY} from "../conversation-drafts";
import HomeAsk from "./HomeAsk";
import { Conversation } from "./Conversation";
import { BrowserContextPicker } from "./BrowserContextPicker";
import { BrowserContextTray } from "./BrowserContextTray";
import { sourceRef } from "../browser-context-sources";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { makePage, makeRun } from "../mock/fixtures";

let root: ReturnType<typeof createRoot>, host: HTMLDivElement;
const initial = useStore.getState();
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100, height: 30 }] as unknown as DOMRectList);
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
    if(method === "runs.get") return {run,suspension:{suspensionId:"s1",runId:run.runId,turnId:run.runId,threadId:"t1",state:"pending",kind:"ask-user-question",request:{kind:"ask-user-question",instruction:"Which account?",guidance:"Choose an account."},createdAt:1},steps:[]};
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

it("keeps an approval decision out of Answer mode across conversation layouts", async () => {
  const run = makeRun({runId:"approval-run",config:{chatId:"approval-chat"},status:"needs_input",statusMessage:"Approve this action?",pageIds:[]});
  useStore.setState({runs:[run],steps:{[run.runId]:[]},pages:[],connected:true,pendingTurns:[],conversationDrafts:{"chat:approval-chat":"Keep this follow-up"},runAnswerDrafts:{[run.runId]:{question:"Old question",text:"Do not send this"}}} as never);
  const invoke=vi.spyOn(bridge,"invoke").mockImplementation(async method=>{
    if(method==="runs.list")return [run];
    if(method==="runs.get")return {run,suspension:{suspensionId:"approval-1",runId:run.runId,turnId:run.runId,threadId:"thread",state:"pending",kind:"approval",request:{kind:"approval",approvalId:"approval-1",instruction:"Review the requested action.",guidance:"Choose in the approval prompt."},createdAt:1},steps:[]};
    if(method==="runs.messages.list")return [];
    if(method==="conversations.get")return {title:"Approval",archived:false};
    if(method==="conversations.artifacts.get")return {artifacts:[]};
    if(method==="conversations.images.get")return {images:[]};
    if(method==="conversations.attachments.get")return {attachments:[]};
    if(method==="conversations.sources.get")return {sources:[]};
    if(method==="runs.context.get")return {entries:[],historyEnabled:true};
    return {workspace:null,memory:null};
  });
  await act(async()=>root.render(<Conversation chatId="approval-chat" embedded/>));
  expect(host.querySelector('button[aria-pressed="true"]')?.textContent).not.toBe("Answer question");
  expect(host.textContent).not.toContain("Aux needs your answer");
  expect(host.textContent).toContain("Review the approval prompt");
  expect(host.querySelector<HTMLTextAreaElement>('[aria-label="Reply to conversation"]')?.value).toBe("Keep this follow-up");
  await act(async()=>root.render(<Conversation chatId="approval-chat"/>));
  expect(host.querySelector<HTMLTextAreaElement>('[aria-label="Reply to conversation"]')?.value).toBe("Keep this follow-up");
  expect(useStore.getState().runAnswerDrafts[run.runId]?.text).toBe("Do not send this");
  expect(invoke.mock.calls.some(([method])=>method==="runs.answer")).toBe(false);
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
  await act(async () => useStore.setState(state => ({ pages: state.pages.map(page => page.pageId === 'work' ? { ...page, title: 'Work notes updated' } : page) })));
  expect(dialog.textContent).toContain('Work notes updated');
  await act(async () => dialog.querySelector<HTMLButtonElement>('.context-choice')!.click());
  expect(change).toHaveBeenCalledWith('work');
  expect(document.querySelector('dialog')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it("updates a selected source row when its tab changes without replacing the source", async () => {
  const active = makePage(0, { pageId: "active", title: "Active", url: "https://example.com/active" });
  const other = makePage(0, { pageId: "other", title: "Original title", url: "https://example.com/other" });
  useStore.setState({ pages: [active, other], activePageId: active.pageId });
  const source = sourceRef(other);
  await act(async () => root.render(<BrowserContextTray primary="active" sources={[source]} onPrimary={vi.fn()} onSources={vi.fn()} disabled={false} />));
  expect(host.textContent).toContain("Original title");
  await act(async () => useStore.setState(state => ({ pages: state.pages.map(page => page.pageId === "other" ? { ...page, title: "Updated title" } : page) })));
  expect(host.textContent).toContain("Updated title");
  await act(async () => useStore.setState(state => ({ pages: state.pages.map(page => page.pageId === "other" ? { ...page, url: "https://example.com/changed" } : page) })));
  expect(host.textContent).toContain("Changed");
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

it("keeps full conversation context controls behind plus and preserves the draft while toggling them", async () => {
  useStore.setState({agentDraft:"A clean home draft",railOpen:false,runs:[],pendingTurns:[],pages:[],connected:true,conversationId:null});
  await act(async () => root.render(<Conversation/>));
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

it("does not adopt another conversation into home but restores a home-owned attachment draft",async()=>{
  const data=new Map([[PENDING_CHAT_KEY,"old-result-chat"]]);
  vi.stubGlobal("localStorage",{getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>data.set(key,value),removeItem:(key:string)=>data.delete(key)});
  useStore.setState({agentDraft:"",railOpen:false,runs:[],conversationDrafts:{},pages:[],connected:true});
  const invoke=vi.spyOn(bridge,"invoke").mockImplementation(async method=>{
    if(method==="runs.list")return [];
    if(method==="conversations.get")return {title:"Draft",archived:false};
    if(method==="conversations.artifacts.get")return {artifacts:[]};
    if(method==="conversations.images.get")return {images:[]};
    if(method==="conversations.attachments.get")return {attachments:[]};
    if(method==="conversations.sources.get")return {sources:[]};
    if(method==="runs.messages.list")return [];
    if(method==="runs.context.get")return {entries:[],historyEnabled:true};
    return {workspace:null,memory:null};
  });
  await act(async()=>root.render(<HomeAsk onSearch={()=>{}}/>));
  expect(invoke.mock.calls.some(([,params])=>(params as {chatId?:string})?.chatId==="old-result-chat")).toBe(false);
  data.set(HOME_DRAFT_CHAT_KEY,"home-image-draft");
  await act(async()=>root.render(<HomeAsk key="remount" onSearch={()=>{}}/>));
  expect(invoke.mock.calls.some(([method,params])=>method==="conversations.images.get"&&(params as {chatId?:string})?.chatId==="home-image-draft")).toBe(true);
});

it("retries a completed page-free answer through its visible control without adding a tab", async () => {
  const run = makeRun({runId:"page-free",config:{chatId:"page-free-chat"},status:"completed",pageIds:[],result:{report:"A page-free answer"}});
  const retryRun = vi.fn().mockResolvedValue(null);
  useStore.setState({runs:[run],steps:{[run.runId]:[]},pages:[],connected:true,pendingTurns:[],retryRun,conversationDrafts:{},retryingRuns:{}});
  vi.spyOn(bridge,"invoke").mockImplementation(async method => {
    if(method === "runs.list") return [run];
    if(method === "runs.get") return {run,steps:[]};
    if(method === "runs.messages.list") return [];
    if(method === "conversations.get") return {title:"Chat",archived:false};
    if(method === "conversations.artifacts.get") return {artifacts:[]};
    if(method === "conversations.images.get") return {images:[]};
    if(method === "conversations.attachments.get") return {attachments:[]};
    if(method === "conversations.sources.get") return {sources:[]};
    if(method === "runs.context.get") return {entries:[],historyEnabled:true};
    return {workspace:null,memory:null};
  });
  await act(async () => root.render(<Conversation chatId="page-free-chat" embedded/>));
  const retry = host.querySelector<HTMLButtonElement>('[aria-label="Retry this turn"]')!;
  expect(retry).not.toBeNull();
  expect(retry.disabled).toBe(false);
  await act(async () => retry.click());
  expect(retryRun).toHaveBeenCalledExactlyOnceWith(run.runId);
  expect(useStore.getState().pages).toEqual([]);
});


it("starts document attachment from the plus portal and retains a picker error and draft after it closes", async () => {
  useStore.setState({agentDraft:"Keep this question",railOpen:false,runs:[],pendingTurns:[],pages:[],connected:true,conversationId:null,toasts:[]});
  let rejectPick!: (reason: Error) => void;
  const pick = vi.spyOn(bridge, "pickEvidenceDocument").mockImplementation(() => new Promise((_resolve, reject) => { rejectPick = reject; }));
  await act(async () => root.render(<Conversation/>));
  const input = host.querySelector<HTMLTextAreaElement>('[aria-label="Reply to conversation"]')!;
  await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Add context"]')!.click());
  const menu = document.querySelector('dialog[aria-label="Add context"]')!;
  const documentAction = Array.from(menu.querySelectorAll<HTMLButtonElement>('button')).find(button => button.textContent === "Document")!;
  expect(documentAction).not.toBeUndefined();
  await act(async () => documentAction.click());
  expect(pick).toHaveBeenCalledOnce();
  expect(document.querySelector('dialog[aria-label="Add context"]')).toBeNull();
  expect(input.value).toBe("Keep this question");
  await act(async () => rejectPick(new Error("The document could not be read")));
  expect(useStore.getState().toasts.some(item => item.kind === "error" && item.text === "The document could not be read")).toBe(true);
  expect(host.querySelector('textarea')).toBe(input);
  expect(input.value).toBe("Keep this question");
});

it("focuses a fresh full-window chat without stealing focus on unrelated updates", async () => {
  vi.stubGlobal("localStorage", { getItem: vi.fn().mockReturnValue(null), setItem: vi.fn(), removeItem: vi.fn() });
  useStore.setState({ conversationId: null, runs: [], pendingTurns: [], pages: [], connected: true });
  vi.spyOn(bridge, "invoke").mockResolvedValue({ workspace: null, memory: null });
  await act(async () => root.render(<Conversation chatId={null} />));
  const input = host.querySelector<HTMLTextAreaElement>('[aria-label="Reply to conversation"]')!;
  expect(document.activeElement).toBe(input);
  const context = host.querySelector<HTMLButtonElement>('[aria-label="Add context"]')!;
  context.focus();
  await act(async () => useStore.setState({ pages: [makePage(0, { title: "Background tab changed" })] }));
  expect(document.activeElement).toBe(context);
});
