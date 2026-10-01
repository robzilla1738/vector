import { describe, expect, it } from "vitest";
import { requestProfileMove, requestProfileDelete, subscribeProfileMoves } from "./move-request";
describe("Profile decision ownership",()=>{
 it("refuses overlapping decisions and settles the original exactly once",async()=>{
  const callbacks:((ok:boolean)=>void)[]=[];
  const stop=subscribeProfileMoves((_request,done)=>callbacks.push(done));
  try {
   const first=requestProfileMove("page","Profile 1");
   expect(await requestProfileDelete("Profile 2")).toBe(false);
   expect(callbacks).toHaveLength(1);
   callbacks[0]!(true);callbacks[0]!(false);
   expect(await first).toBe(true);
  }finally{stop();}
 });
 it("unmount refuses pending work and stale callbacks cannot settle a new owner",async()=>{
  let old:((ok:boolean)=>void)|undefined;
  const stop=subscribeProfileMoves((_request,done)=>{old=done;});
  const first=requestProfileMove("page","Profile 1");stop();
  expect(await first).toBe(false);
  let next:((ok:boolean)=>void)|undefined;
  const cleanup=subscribeProfileMoves((_request,done)=>{next=done;});
  try {
   const second=requestProfileDelete("Profile 2");old!(true);
   expect(await requestProfileMove("other","Profile 3")).toBe(false);
   next!(true);expect(await second).toBe(true);
  }finally{cleanup();}
 });
 it("propagates the actual operation rejection once to the acknowledged executor",async()=>{
  const failure=new Error("Native destination became unavailable");
  const stop=subscribeProfileMoves((_request,done)=>{done(false,failure);done(true);});
  try{await expect(requestProfileMove("page","Profile 1")).rejects.toBe(failure);}finally{stop();}
 });

});
