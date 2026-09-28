import { createHash, randomUUID } from "node:crypto";
import { AuxError, type ConversationImage, type PageContextRef, type Run } from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { ArtifactStore } from "./artifacts.js";

type Record = ConversationImage & {sha256:string;removed?:boolean};
const key = (chatId:string) => `conversationImages:${chatId}`;
const digest = (buffer:Buffer) => createHash("sha256").update(buffer).digest("hex");

/** User-selected captures; files are immutable, while future inclusion is reversible. */
export class ConversationImages {
  constructor(private repo:Repo, private artifacts:ArtifactStore, private onChanged:(chatId:string)=>void = () => {}) {}
  private records(chatId:string):Record[] { return this.repo.getSetting<Record[]>(key(chatId)) ?? []; }
  private mutable(chatId:string) {
    if(this.repo.getConversation(chatId)?.archived)throw new AuxError("conflict","Restore this conversation before changing its images.");
  }
  privateArtifactIds():Set<string> {
    const ids = new Set<string>();
    for (const settingKey of this.repo.settingKeys("conversationImages:")) {
      let snapshots: Record[] | undefined;
      try { snapshots = this.repo.getSetting<Record[]>(settingKey); }
      catch (error) { if (error instanceof SyntaxError) continue; throw error; }
      for (const image of snapshots ?? []) if (image.artifactId) ids.add(image.artifactId);
    }
    return ids;
  }
  list(chatId:string) {
    return {chatId,images:this.records(chatId).filter(item=>!item.removed).map(({sha256,removed,...item})=>item)};
  }
  add(opts:{chatId:string;filename:string;dataUrl:string;sourceUrl?:string;sourcePage?:PageContextRef}) {
    this.mutable(opts.chatId);
    const records=this.records(opts.chatId), visible=records.filter(item=>!item.removed);
    if(visible.length>=4)throw new AuxError("conflict","A conversation can include up to four image snapshots.");
    const match=/^data:image\/png;base64,([A-Za-z0-9+/]+={0,2})$/.exec(opts.dataUrl);
    if(!match||match[1]!.length%4!==0)throw new AuxError("invalid_params","Use a PNG snapshot captured in Aux.");
    const buffer=Buffer.from(match[1]!,"base64");
    if(buffer.length<45||!buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||buffer.toString("ascii",12,16)!=="IHDR"||buffer.toString("ascii",buffer.length-8,buffer.length-4)!=="IEND")
      throw new AuxError("invalid_params","The PNG snapshot is incomplete or invalid.");
    const width=buffer.readUInt32BE(16),height=buffer.readUInt32BE(20);
    if(!width||!height||width>16384||height>16384||width*height>16_000_000||buffer.length>3*1024*1024)
      throw new AuxError("invalid_params","Use a smaller image snapshot (up to 3 MB and 16 million pixels).");
    if(visible.reduce((sum,item)=>sum+item.byteLength,buffer.length)>8*1024*1024)
      throw new AuxError("invalid_params","Conversation image snapshots can total up to 8 MB.");
    let sourceUrl:string|undefined;
    if(opts.sourceUrl){try{const url=new URL(opts.sourceUrl);if(!["http:","https:"].includes(url.protocol)||url.username||url.password)throw new Error();sourceUrl=url.href;}catch{throw new AuxError("invalid_params","Use a web page address without credentials for the image source.");}}
    if(opts.sourcePage && (!sourceUrl || new URL(opts.sourcePage.url).href !== sourceUrl)) throw new AuxError("invalid_params","The image source page must match its captured address.");
    const artifact=this.artifacts.save({label:"conversation-image",buffer,mediaType:"image/png"});
    const record:Record={imageId:randomUUID(),artifactId:artifact.artifactId,filename:opts.filename,width,height,byteLength:buffer.length,sourceUrl,sourcePage:opts.sourcePage,createdAt:Date.now(),included:true,sha256:digest(buffer)};
    try { this.repo.setSetting(key(opts.chatId),[...records,record]); }
    catch(error){this.repo.db.prepare("DELETE FROM artifacts WHERE artifact_id=?").run(artifact.artifactId);this.artifacts.removeFiles([artifact.path]);throw error;}
    this.onChanged(opts.chatId);
    return this.list(opts.chatId);
  }
  private pixels(record:Record) {
    const {artifact,dataBase64}=this.artifacts.read(record.artifactId);
    if(artifact.mediaType!=="image/png"||digest(Buffer.from(dataBase64,"base64"))!==record.sha256)
      throw new AuxError("conflict","This image snapshot changed on disk. Capture it again before continuing.");
    return `data:image/png;base64,${dataBase64}`;
  }
  read(chatId:string,imageId:string) {
    const record=this.records(chatId).find(item=>item.imageId===imageId&&!item.removed);
    if(!record)throw new AuxError("not_found","Image snapshot not found in this conversation.");
    return {image:this.list(chatId).images.find(item=>item.imageId===imageId)!,dataUrl:this.pixels(record)};
  }
  toggle(chatId:string,imageId:string,included:boolean) {
    this.mutable(chatId);const records=this.records(chatId);const record=records.find(item=>item.imageId===imageId&&!item.removed);
    if(!record)throw new AuxError("not_found","Image snapshot not found in this conversation.");
    record.included=included;this.repo.setSetting(key(chatId),records);this.onChanged(chatId);return this.list(chatId);
  }
  remove(chatId:string,imageId:string) {
    this.mutable(chatId);const records=this.records(chatId);const record=records.find(item=>item.imageId===imageId&&!item.removed);
    if(!record)throw new AuxError("not_found","Image snapshot not found in this conversation.");
    // Earlier runs retain the exact snapshot for inspection and retry.
    const used=this.repo.db.prepare(`SELECT 1 FROM runs, json_each(json_extract(CASE WHEN json_valid((SELECT config FROM run_lookup WHERE run_lookup.run_id=runs.run_id)) THEN (SELECT config FROM run_lookup WHERE run_lookup.run_id=runs.run_id) ELSE '{}' END,'$.contextImageArtifactIds')) images WHERE images.value=? LIMIT 1`).get(record.artifactId);
    if (used) { record.removed=true;record.included=false;this.repo.setSetting(key(chatId),records); }
    else {
      const artifact=this.repo.getArtifact(record.artifactId);
      this.repo.transaction(()=>{this.repo.setSetting(key(chatId),records.filter(item=>item.imageId!==imageId));this.repo.db.prepare("DELETE FROM artifacts WHERE artifact_id=?").run(record.artifactId);});
      if(artifact)this.artifacts.removeFiles([artifact.path]);
    }
    this.onChanged(chatId);
    return this.list(chatId);
  }
  selected(chatId:string):string[] { return this.records(chatId).filter(item=>item.included&&!item.removed).map(item=>item.artifactId); }
  forRun(run:Run):string[] {
    const ids=run.config?.contextImageArtifactIds??[];
    if(!ids.length)return [];
    const records=this.records(run.config?.chatId??run.runId);
    return ids.map(id=>{const item=records.find(item=>item.artifactId===id);if(!item)throw new AuxError("not_found","An image used by this run is unavailable. Its context cannot be reproduced.");return this.pixels(item);});
  }
}
