// Native local-history input-to-paint measurement with 50,000 indexed visits.
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDb, Repo } from "../../apps/runtime/dist/index.js";
import { launchApp, shellWindow } from "./launch.mjs";

const temporary=mkdtempSync(join(tmpdir(),"aux-omnibox-paint-"));
const data=join(temporary,"data");
mkdirSync(data);
const db=openDb(join(data,"aux-state.sqlite"));
const repo=new Repo(db);
const insert=db.prepare("INSERT INTO history(url,title,page_id,visited_at) VALUES(?,?,NULL,?)");
repo.transaction(()=>{
  for(let i=0;i<50000;i++)insert.run(`https://fixture.example/article-${i}`,`Article ${i}`,i+1);
  for(let i=0;i<20;i++)insert.run(`https://fixture.example/needle-${String(i).padStart(2,"0")}`,`Needle sample ${String(i).padStart(2,"0")}`,60000+i);
});
db.close();
const env={PATH:process.env.PATH,HOME:temporary,TMPDIR:temporary,AUX_PROFILE_DIR:join(temporary,"profile"),AUX_DATA_DIR:data,AUX_LOAD_DOTENV:"0"};
const percentile=(values,fraction)=>{const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*fraction)-1)];};
let app;
try{
  app=await launchApp({args:["--use-mock-keychain"],env});
  const page=await shellWindow(app,15000);
  page.setDefaultTimeout(15000);
  const input=page.locator(".aux-home .cmdbar input");
  await input.waitFor();
  const samples=[];
  for(let i=0;i<20;i++){
    const suffix=String(i).padStart(2,"0"),query=`needle-${suffix}`,title=`Needle sample ${suffix}`;
    await input.fill("");
    await page.evaluate(expected=>{
      const field=document.querySelector(".aux-home .cmdbar input");
      window.__auxPaint=new Promise((resolve,reject)=>{
        let started=0;
        const timeout=setTimeout(()=>{observer.disconnect();reject(new Error(`No painted local suggestion: ${expected}`));},10000);
        const observer=new MutationObserver(()=>{
          if(!started || ![...document.querySelectorAll(".aux-home .cb-opt-title")].some(item=>item.textContent===expected))return;
          observer.disconnect();
          requestAnimationFrame(()=>requestAnimationFrame(()=>{clearTimeout(timeout);resolve(performance.now()-started);}));
        });
        observer.observe(document.body,{childList:true,subtree:true,characterData:true});
        field.addEventListener("input",()=>{started=performance.now();},{once:true});
      });
    },title);
    await input.fill(query);
    samples.push(await page.evaluate(()=>window.__auxPaint));
  }
  console.log(`50k history visits · local suggestion input-to-paint p50 ${percentile(samples,.5).toFixed(1)}ms p95 ${percentile(samples,.95).toFixed(1)}ms [${samples.map(value=>value.toFixed(1)).join(", ")}]`);
}finally{
  await app?.close().catch(()=>{});
  rmSync(temporary,{recursive:true,force:true});
}
