// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { makeRun } from "./mock/fixtures";
const initial=useStore.getState();
afterEach(()=>{vi.restoreAllMocks();useStore.setState(initial,true);});
it("starts one retry and preserves navigation made while it was pending",async()=>{
  let finish!:(value:unknown)=>void;
  const invoke=vi.spyOn(bridge,"invoke").mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));
  useStore.setState({mode:"conversation",conversationId:"chat",overlay:null,retryingRuns:{}});
  const retry=useStore.getState().retryRun("previous");
  expect(useStore.getState().retryingRuns.previous).toBe(true);
  await useStore.getState().retryRun("previous");
  expect(invoke).toHaveBeenCalledTimes(1);
  useStore.setState({overlay:"settings"});
  const run=makeRun({runId:"retry",config:{chatId:"chat"}});
  finish(run);await retry;
  expect(useStore.getState().overlay).toBe("settings");
  expect(useStore.getState().runs.some(item=>item.runId==="retry")).toBe(true);
  expect(useStore.getState().retryingRuns.previous).toBeUndefined();
});
it("opens the retried conversation when the user stays in place",async()=>{
  const run=makeRun({runId:"retry",config:{chatId:"chat"}});
  vi.spyOn(bridge,"invoke").mockResolvedValue(run);
  const open=vi.fn();
  useStore.setState({openConversation:open,retryingRuns:{}});
  await useStore.getState().retryRun("previous");
  expect(open).toHaveBeenCalledWith("retry");
});
