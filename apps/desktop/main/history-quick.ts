import { existsSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { HistoryEntry } from "@aux/contracts";

type Row={url:string;title:string;page_id:string|null;visited_at:number};

/**
 * Read only, per-request connection: a restore may replace the database file,
 * and keeping an old handle would show visits that the user already cleared.
 * A missing/upgrading database falls back to the runtime's normal route.
 */
export function quickHistory(dataDir:string,query:string,limit:number):HistoryEntry[]|null {
  const path=join(dataDir,"aux-state.sqlite");
  if(!existsSync(path))return null;
  let db:DatabaseSync|undefined;
  try {
    db=new DatabaseSync(path,{readOnly:true});
    const rows:Row[]=[];
    const terms=query.split(/[^\p{L}\p{N}_]+/u).map(term=>term.replaceAll('"','""')).filter(Boolean);
    if(terms.length){
      const match=terms.map(term=>`"${term}"*`).join(" ");
      try { rows.push(...db.prepare(`SELECT history.* FROM history_fts JOIN history ON history.rowid=history_fts.rowid
        WHERE history_fts MATCH ? ORDER BY history.visited_at DESC,history.url DESC LIMIT ?`).all(match,limit) as Row[]); }
      catch { /* LIKE also covers an absent or upgrading FTS index. */ }
    }
    if(rows.length<limit){
      const seen=new Set(rows.map(row=>`${row.url}${row.visited_at}`));
      const term=`%${query.replace(/[\\%_]/g,"\\$&")}%`;
      const rest=db.prepare(`SELECT * FROM history WHERE url LIKE ? ESCAPE '\\' OR title LIKE ? ESCAPE '\\'
        ORDER BY visited_at DESC,url DESC LIMIT ?`).all(term,term,limit+seen.size) as Row[];
      for(const row of rest){
        if(rows.length>=limit)break;
        const key=`${row.url}${row.visited_at}`;
        if(!seen.has(key)){seen.add(key);rows.push(row);}
      }
      rows.sort((a,b)=>b.visited_at-a.visited_at||(a.url<b.url?-1:1));
    }
    return rows.slice(0,limit).map(row=>({url:row.url,title:row.title,pageId:row.page_id??undefined,visitedAt:row.visited_at}));
  }catch{return null;}
  finally{db?.close();}
}
