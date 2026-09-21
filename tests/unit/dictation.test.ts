import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from "vitest";
import type { BaseWindow, WebContents } from "electron";

const native = vi.hoisted(() => ({execFile:vi.fn(),spawn:vi.fn()}));
vi.mock("node:child_process", () => native);
vi.mock("node:fs", () => ({existsSync:()=>true}));
import { cancelDictation, startDictation, stopDictation } from "../../apps/desktop/main/dictation";
const platform = Object.getOwnPropertyDescriptor(process,"platform")!;
beforeAll(()=>Object.defineProperty(process,"platform",{...platform,value:"darwin"}));
afterAll(()=>Object.defineProperty(process,"platform",platform));
afterEach(()=>{cancelDictation();vi.useRealTimers();});
class Owner extends EventEmitter {
  send=vi.fn();
  isDestroyed(){return false;}
}
class Window extends EventEmitter {
  isDestroyed(){return false;}
  isVisible(){return true;}
}
function fixture(){
  const owner=new Owner(), window=new Window();
  const child=Object.assign(new EventEmitter(),{stdin:new PassThrough(),stdout:new PassThrough(),stderr:new PassThrough(),kill:vi.fn(()=>true)});
  native.spawn.mockReturnValue(child);
  return {owner,window,child,contents:owner as unknown as WebContents,host:window as unknown as BaseWindow};
}
const id="00000000-0000-4000-8000-000000000001";
beforeEach(()=>{
  native.execFile.mockReset();native.spawn.mockReset();
  native.execFile.mockImplementation((_path,_args,_options,callback)=>{callback(null,JSON.stringify({available:true}));});
});
it("cancels a pending start without spawning capture and prevents overlapping startup",async()=>{
  const {contents,host}=fixture();
  let ready!:Function;
  native.execFile.mockImplementation((_path,_args,_options,callback)=>{ready=callback;});
  const pending=startDictation(contents,id,host);
  await expect(startDictation(contents,id,host)).rejects.toThrow("other conversation");
  cancelDictation(contents,id);
  ready(null,JSON.stringify({available:true}));
  await expect(pending).rejects.toThrow("cancelled");
  expect(native.spawn).not.toHaveBeenCalled();
});
it("isolates transcript and control to the requesting view and exact session",async()=>{
  const {contents,host,owner,child}=fixture();
  await startDictation(contents,id,host);
  const stranger=new Owner();
  child.stdout.write('{"type":"transcript","text":"Private draft"}\n');
  expect(owner.send).toHaveBeenCalledWith("dictation.event",{sessionId:id,type:"transcript",text:"Private draft"});
  expect(stranger.send).not.toHaveBeenCalled();
  cancelDictation(stranger as unknown as WebContents,id);
  cancelDictation(contents,"wrong-session");
  expect(child.kill).not.toHaveBeenCalled();
  expect(stopDictation(stranger as unknown as WebContents,id)).toBe(false);
  expect(stopDictation(contents,id)).toBe(true);
  expect(child.stdin.read()?.toString()).toBe("stop\n");
  cancelDictation(contents,id);
  expect(child.kill).toHaveBeenCalledWith("SIGKILL");
});
it("kills hidden-window capture, removes owner listeners and ignores late text",async()=>{
  const {contents,host,window,owner,child}=fixture();
  await startDictation(contents,id,host);
  window.emit("hide");
  expect(child.kill).toHaveBeenCalledWith("SIGKILL");
  expect(owner.send).toHaveBeenLastCalledWith("dictation.event",expect.objectContaining({type:"error"}));
  expect(owner.listenerCount("destroyed")).toBe(0);
  owner.send.mockClear();child.stdout.write('{"type":"transcript","text":"Late"}\n');
  expect(owner.send).not.toHaveBeenCalled();
  expect(stopDictation(contents,id)).toBe(false);
});
it("stops an unresponsive helper at the session deadline",async()=>{
  vi.useFakeTimers();
  const {contents,host,owner,child}=fixture();
  await startDictation(contents,id,host);
  vi.advanceTimersByTime(90000);
  expect(child.kill).toHaveBeenCalledWith("SIGKILL");
  expect(owner.send).toHaveBeenLastCalledWith("dictation.event",expect.objectContaining({type:"error",message:expect.stringContaining("timed out")}));
});

it("terminates the helper after final text and rejects further data in the same chunk",async()=>{
  const {contents,host,owner,child}=fixture();
  await startDictation(contents,id,host);
  child.stdout.write('{"type":"final","text":"Reviewed words"}\n{"type":"transcript","text":"Unexpected"}\n');
  expect(owner.send).toHaveBeenCalledTimes(1);
  expect(owner.send).toHaveBeenLastCalledWith("dictation.event",{sessionId:id,type:"final",text:"Reviewed words"});
  expect(child.kill).toHaveBeenCalledWith("SIGKILL");
});
it("does not spawn capture when the speech helper reports unavailable",async()=>{
  const {contents,host}=fixture();
  native.execFile.mockImplementation((_path,_args,_options,callback)=>{callback(null,JSON.stringify({available:false,reason:"Microphone permission is unavailable in this environment."}));});
  await expect(startDictation(contents,id,host)).rejects.toThrow("Microphone permission is unavailable");
  expect(native.spawn).not.toHaveBeenCalled();
});
it("terminates capture if its owner can no longer receive transcript events",async()=>{
  const {contents,host,owner,child}=fixture();
  await startDictation(contents,id,host);
  owner.send.mockImplementation(()=>{throw new Error("Renderer disconnected");});
  expect(()=>child.stdout.write('{"type":"transcript","text":"Words"}\n')).not.toThrow();
  expect(child.kill).toHaveBeenCalledWith("SIGKILL");
  expect(stopDictation(contents,id)).toBe(false);
});
