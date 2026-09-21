import { interruptedDownloadHistory } from "../../apps/desktop/main/download-recovery.js";
import type { Download } from "@vector/contracts";
import { expect, it } from "vitest";
import { openDb, Repo } from "@vector/runtime";

it("clears selected inactive records while preserving live progress and their source metadata", () => {
  const db=openDb(":memory:"),repo=new Repo(db);
  try {
    for(const [id,state] of [["done","completed"],["keep","completed"],["active","progressing"],["failed","interrupted"],["cancelled","cancelled"]]) {
      repo.saveDownload({id:id!,state:state!,filename:"report.txt",path:"/tmp/report.txt",size:10,startedAt:1,sourceUrl:`https://example.test/${id}`});
    }
    expect(repo.removeFinishedDownloads(["done","done","active","failed","cancelled","missing"])).toEqual(["done","failed","cancelled"]);
    expect(repo.listDownloads().map(item=>item.id).sort()).toEqual(["active","keep"]);
    expect(db.prepare("SELECT key FROM kv WHERE key=?").get("download-source:done")).toBeUndefined();
    expect(repo.listDownloads().find(item=>item.id==="keep")?.sourceUrl).toBe("https://example.test/keep");
    expect(repo.removeFinishedDownloads(["done"])).toEqual([]);
  } finally {db.close();}
});

it("recovers only previous-process transfers absent from the authoritative live set", () => {
  const base: Download = {id:"old",filename:"report.csv",path:"/tmp/report.csv",state:"started",size:10,startedAt:1};
  const records: Download[] = [base, {...base,id:"live"}, {...base,id:"new",startedAt:100}, {...base,id:"done",state:"completed"}];
  expect(interruptedDownloadHistory(records,new Set(["live"]),50,200)).toEqual([
    {...base,state:"interrupted",endedAt:200,paused:false,canCancel:false,canResume:false},
  ]);
});
