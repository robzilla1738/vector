// @vitest-environment jsdom
import {afterEach,expect,it,vi} from "vitest";
import type {PageTarget} from "@aux/contracts";
import {bridge} from "./bridge";
import {useStore} from "./store";
const initial=useStore.getState();
afterEach(()=>{vi.restoreAllMocks();useStore.setState(initial,true);});
it("ignores older zoom reads and values from a previous document",async()=>{
  const page={pageId:"page",url:"https://example.com/",documentEpoch:1} as PageTarget;
  useStore.setState({pages:[page],zoomLevels:{}});
  const replies:((value:unknown)=>void)[]=[];
  vi.spyOn(bridge,"invoke").mockImplementation(()=>new Promise(resolve=>replies.push(resolve)));
  const old=useStore.getState().zoomPage("page");
  const changed=useStore.getState().zoomPage("page",{direction:"in"});
  replies[1]!({level:1});await changed;
  replies[0]!({level:0});await old;
  expect(useStore.getState().zoomLevels.page).toBe(1);
  const navigating=useStore.getState().zoomPage("page");
  useStore.setState({pages:[{...page,url:"https://other.example/",documentEpoch:2}],zoomLevels:{}});
  replies[2]!({level:3});await navigating;
  expect(useStore.getState().zoomLevels.page).toBeUndefined();
});
