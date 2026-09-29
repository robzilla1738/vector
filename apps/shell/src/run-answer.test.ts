// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "./bridge";
import { useStore } from "./store";

afterEach(()=>{vi.restoreAllMocks();useStore.setState({prompt:null,runAnswerDrafts:{},runAnswerPending:{}});});
it("keeps a requested answer and prompt when submission fails", async()=>{
  const prompt={runId:"run",question:"Which account?"};
  const draft={question:prompt.question,text:"Use the work account"};
  useStore.setState({prompt,runAnswerDrafts:{run:draft}});
  vi.spyOn(bridge,"invoke").mockRejectedValue(new Error("Disconnected"));
  await expect(useStore.getState().answerRun("run",draft.text)).rejects.toThrow("Disconnected");
  expect(useStore.getState().prompt).toBe(prompt);
  expect(useStore.getState().runAnswerDrafts.run).toBe(draft);
  expect(useStore.getState().runAnswerPending.run).toBeUndefined();
});
it("sends once while pending and does not clear a newer question or draft",async()=>{
  let finish!:(value:unknown)=>void;
  const invoke=vi.spyOn(bridge,"invoke").mockImplementation((method)=>
    method === "runs.get" ? Promise.resolve({run:{runId:"run",status:"needs_input",statusMessage:"First?"},suspension:{suspensionId:"s1"}}) :
      new Promise(resolve=>{finish=resolve;}));
  useStore.setState({prompt:{runId:"run",question:"First?"},runAnswerDrafts:{run:{question:"First?",text:"First answer"}}});
  const sending=useStore.getState().answerRun("run","First answer","First?");
  await useStore.getState().answerRun("run","First answer","First?");
  await vi.waitFor(()=>expect(invoke).toHaveBeenCalledTimes(2));
  expect(invoke).toHaveBeenLastCalledWith("runs.answer",{runId:"run",answer:"First answer",expectedSuspensionId:"s1"});
  const prompt={runId:"run",question:"Next?"};
  const draft={question:"Next?",text:"Keep this draft"};
  useStore.setState({prompt,runAnswerDrafts:{run:draft}});
  finish({ok:true});await sending;
  expect(useStore.getState().prompt).toBe(prompt);
  expect(useStore.getState().runAnswerDrafts.run).toBe(draft);
});
it("clears only the successfully submitted prompt and draft",async()=>{
  vi.spyOn(bridge,"invoke").mockImplementation((method)=>Promise.resolve(method === "runs.get" ?
    {run:{runId:"run",status:"needs_input",statusMessage:"Which?"},suspension:{suspensionId:"s1"}} : {ok:true}));
  useStore.setState({prompt:{runId:"run",question:"Which?"},runAnswerDrafts:{run:{question:"Which?",text:"This one"}}});
  await useStore.getState().answerRun("run","This one","Which?");
  expect(useStore.getState().prompt).toBeNull();
  expect(useStore.getState().runAnswerDrafts.run).toBeUndefined();
});
it("keeps the draft and refuses a changed question before sending",async()=>{
  const invoke=vi.spyOn(bridge,"invoke").mockResolvedValue({run:{runId:"run",status:"needs_input",statusMessage:"New question?"},suspension:{suspensionId:"s2"}});
  useStore.setState({prompt:{runId:"run",question:"Old question?"},runAnswerDrafts:{run:{question:"Old question?",text:"Old answer"}}});
  await expect(useStore.getState().answerRun("run","Old answer","Old question?")).rejects.toThrow("request changed");
  expect(invoke).toHaveBeenCalledTimes(1);
  expect(useStore.getState().runAnswerDrafts.run?.text).toBe("Old answer");
});
