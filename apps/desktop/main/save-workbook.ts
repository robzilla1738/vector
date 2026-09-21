import {app,dialog,type BaseWindow} from "electron";
import {Worker} from "node:worker_threads";
import {writeFile,rename,rm} from "node:fs/promises";
import {join,dirname,basename} from "node:path";
import {randomUUID} from "node:crypto";

function build(content:string,format:"snapshot"|"csv"):Promise<Buffer> {
  return new Promise((resolve,reject)=>{
    const worker=new Worker(new URL("./workbook-export.cjs",import.meta.url),{workerData:{content,format},resourceLimits:{maxOldGenerationSizeMb:128,maxYoungGenerationSizeMb:16}});
    let settled=false;
    const timer=setTimeout(()=>finish(new Error("Workbook export took too long. Save the full snapshot instead.")),15000);
    function finish(error?:Error,bytes?:Buffer){if(settled)return;settled=true;clearTimeout(timer);void worker.terminate();if(error)reject(error);else resolve(bytes!);}
    worker.once("message",(value:{bytes?:Uint8Array;error?:string})=>value.bytes?finish(undefined,Buffer.from(value.bytes)):finish(new Error(value.error||"Could not export the workbook.")));
    worker.once("error",()=>finish(new Error("Could not export the workbook. Save the full snapshot instead.")));
    worker.once("exit",()=>finish(new Error("Workbook export stopped. Try again.")));
  });
}
export async function saveWorkbookSnapshot(win:BaseWindow,content:unknown,privateMode=false,format:unknown="snapshot"):Promise<string|null>{
  if(format!=="snapshot"&&format!=="csv")throw new Error("Choose a supported workbook format.");
  if(typeof content!=="string"||Buffer.byteLength(content,"utf8")>1024*1024)throw new Error("Choose a workbook snapshot up to 1 MB.");
  const choice=await dialog.showSaveDialog(win,{title:"Export workbook values",message:privateMode?"This file remains on your Mac after the private window closes.":"Creates a new workbook from saved cell values. Original formatting and formulas are not restored.",defaultPath:join(app.getPath("downloads"),"workbook-values.xlsx"),filters:[{name:"Excel workbook",extensions:["xlsx"]}]});
  if(choice.canceled||!choice.filePath)return null;
  const bytes=await build(content,format);
  const temporary=join(dirname(choice.filePath),`.${basename(choice.filePath)}.${randomUUID()}.tmp`);
  try{await writeFile(temporary,bytes,{flag:"wx",mode:0o600});await rename(temporary,choice.filePath);return choice.filePath;}
  catch{throw new Error("Couldn’t save the workbook. Choose a writable destination and try again.");}
  finally{await rm(temporary,{force:true}).catch(()=>{});}
}
