import { expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDb, Repo } from "@aux/runtime";
import { quickHistory } from "../../apps/desktop/main/history-quick.js";

it("returns current profile history before runtime IPC and respects later deletion",()=>{
  const dir=mkdtempSync(join(tmpdir(),"aux-quick-history-"));
  const db=openDb(join(dir,"aux-state.sqlite")),repo=new Repo(db);
  try {
    repo.addHistory("https://example.test/article","Editorial article");
    repo.addHistory("https://github.com/project","Project home");
    for(const query of ["edit","ithub","project","missing"])
      expect(quickHistory(dir,query,6)).toEqual(repo.listHistory(query,6));
    repo.clearHistory();
    expect(quickHistory(dir,"article",6)).toEqual([]);
  }finally{db.close();rmSync(dir,{recursive:true,force:true});}
});
