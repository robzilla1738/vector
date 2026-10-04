// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { TaskSchema, TaskReceiptSchema } from "@aux/contracts";
const state = vi.hoisted(() => ({
  call: vi.fn(),
  privateMode: false,
  windowId: "one",
}));
vi.mock("../store", async (original) => ({
  ...(await original<typeof import("../store")>()),
  call: state.call,
}));
vi.mock("../bridge", async (original) => {
  const actual = await original<typeof import("../bridge")>();
  return {
    ...actual,
    bridge: {
      ...actual.bridge,
      get privateMode() {
        return state.privateMode;
      },
      get windowId() {
        return state.windowId;
      },
    },
  };
});
vi.mock("./TaskReceiptView", () => ({ TaskReceiptView: () => null }));
vi.mock("../use-feature", () => ({useFeature:()=>true,featureStage:()=>"on"}));
vi.mock("./CalendarTaskGrants", () => ({ CalendarTaskGrants: () => null }));
vi.mock("./Routines", () => ({ Routines: () => null }));
vi.mock("./Goals", () => ({ Goals: () => null }));
vi.mock("./Hooks", () => ({ Hooks: () => null }));
import { Tasks } from "./Tasks";
import { useStore } from "../store";
Object.defineProperty(HTMLElement.prototype, "scrollTo", { configurable: true, value: vi.fn() });
const initial = useStore.getState();
const task = TaskSchema.parse({
  taskId: "original",
  workspaceId: "workspace",
  revision: 1,
  title: "Original task",
  objective: "Original goal",
  criteria: [{ criterionId: "criterion", description: "Original criterion", verification: "manual" }],
  state: "open",
  createdAt: 1,
  updatedAt: 1,
  resources: [{resourceId:"source",kind:"url",locator:"https://example.com/ref",label:"Original reference",access:"reference"}],
});
const details = { task, revisions: [task], runs: [], children: [] };
const receipt = TaskReceiptSchema.parse({
  taskId: "original",
  taskRevision: 1,
  objective: "Original goal",
  generatedAt: 1,
  status: "needs_review",
  criteria: [],
  unresolvedActions: [],
  runs: [],
  modelCalls: 0,
  knownCostUsd: 0,
  costComplete: true,
});
function held<T>() {
  let resolve!: (value: T) => void, reject!: (reason: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype,"getClientRects").mockReturnValue([{width:100}] as unknown as DOMRectList);
  const storage = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
  localStorage.setItem("aux.task-selection.v1", JSON.stringify({ tasks: { workspace: "original" } }));
  state.privateMode = false;
  state.windowId = "one";
  state.call
    .mockReset()
    .mockImplementation(async (method: string) =>
      method === "tasks.list"
        ? [task]
        : method === "tasks.get"
          ? details
          : method === "tasks.receipt"
            ? receipt
            : { accepted: true },
    );
  useStore.setState({
    ...initial,
    layout: {
      ...initial.layout,
      activeSpaceId: "space",
      spaces: [{ id: "space", name: "Original", workspaceId: "workspace" } as never],
    },
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function render() {
  await act(async () => root.render(<Tasks />));
  expect(host.querySelector(".task-resources")).not.toBeNull();
}

const button=(text:string)=>[...host.querySelectorAll<HTMLButtonElement>(".task-resources button")].find(node=>node.textContent===text)!;
it("actual Tasks parent readback closes acknowledged resource label editor with full new revision",async()=>{
 await render();await act(async()=>button("Rename").click());
 const input=host.querySelector<HTMLInputElement>('[aria-label="Resource label"]')!;
 const original=held<unknown>();let saved=task;
 state.call.mockImplementation(async(method:string,params:unknown)=>{
  if(method==="tasks.update"){const p=params as {resources:typeof task.resources};saved={...task,revision:2,resources:p.resources};return original.promise;}
  if(method==="tasks.get")return {...details,task:saved,revisions:[task,saved]};
  if(method==="tasks.receipt")return {...receipt,taskRevision:saved.revision};
  if(method==="tasks.list")return[saved];return {accepted:true};
 });
 const form=input.form!;await act(async()=>form.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true})));
 expect(state.call).toHaveBeenCalledWith("tasks.update",{taskId:"original",expectedRevision:1,resources:task.resources});
 await act(async()=>original.resolve(saved));
 expect(host.querySelector('[aria-label="Resource label"]')).toBeNull();
 expect(host.querySelector(".task-resource strong")!.textContent).toBe(task.resources[0]!.label);
 expect(host.querySelector("fieldset")!.disabled).toBe(false);
});
it("actual resource URL submit keeps native normalized data and clears acknowledged draft after parent refresh",async()=>{
 await render();const input=host.querySelector<HTMLInputElement>('[aria-label="Resource URL"]')!;
 Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")!.set!.call(input,"https://example.com/new");await act(async()=>input.dispatchEvent(new Event("input",{bubbles:true})));
 let saved=task;state.call.mockImplementation(async(method:string,params:unknown)=>{
  if(method==="tasks.update"){saved={...task,revision:2,resources:(params as {resources:typeof task.resources}).resources};return saved;}
  if(method==="tasks.get")return {...details,task:saved};if(method==="tasks.receipt")return {...receipt,taskRevision:2};if(method==="tasks.list")return[saved];return {accepted:true};
 });
 await act(async()=>input.form!.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true})));
 expect(saved.resources).toHaveLength(2);expect(saved.resources[1]).toMatchObject({kind:"url",locator:"https://example.com/new",label:"example.com"});
 expect(input.isConnected).toBe(false);const fresh=host.querySelector<HTMLInputElement>('[aria-label="Resource URL"]')!;expect(fresh).not.toBe(input);expect(fresh.value).toBe("");expect(host.querySelector("fieldset")!.disabled).toBe(false);
});
