import { isTextResult, isTextResultContent, resultFilename } from "./text-result.js";
import { AuxError } from "@aux/contracts";
import type { ArtifactStore } from "./artifacts.js";
import type { Repo } from "../store/repo.js";

export class SavedResults {
  constructor(private repo: Repo, private artifacts: Pick<ArtifactStore, "read" | "save">) {}
  /** Existence-only check for renderer drafts; never returns protected result text. */
  available(drafts: {artifactId:string;chatId:string}[]): string[] {
    return drafts.flatMap(({artifactId,chatId}) => {
      const artifact=this.repo.getArtifact(artifactId);
      if(!artifact?.runId||!isTextResult(artifact))return [];
      const run=this.repo.getRun(artifact.runId);
      return run && (run.config?.chatId??run.runId)===chatId ? [artifactId] : [];
    });
  }
  /** Promote a human edit to an immutable result, with source and revision lineage. */
  saveVersion({chatId,sourceArtifactId,content}:{chatId:string;sourceArtifactId:string;content:string}) {
    const source=this.read(sourceArtifactId);
    const owner=this.repo.getArtifact(sourceArtifactId);
    const run=owner?.runId?this.repo.getRun(owner.runId):undefined;
    if(source.chatId!==chatId||!owner?.runId||!run||run.config?.contextMemoryRevoked)
      throw new AuxError("not_found","The source result is unavailable in this conversation.");
    if(this.repo.getConversation(chatId)?.archived)throw new AuxError("conflict","Restore this conversation before saving a version.");
    const bytes=Buffer.from(content,"utf8");
    if(!content||content.includes("\0")||bytes.length>262144)throw new AuxError("invalid_params","Use text without null characters, up to 256 KB.");
    if(source.mediaType==="application/json"){
      try{JSON.parse(content);}catch{throw new AuxError("invalid_params","Save valid JSON for this result.");}
      if(!isTextResultContent(source.mediaType,content))throw new AuxError("invalid_params","This content cannot be saved as a result.");
    }
    if(content===source.content)throw new AuxError("invalid_params","Edit the result before saving a new version.");
    const prior=this.repo.db.prepare("SELECT root_artifact_id AS rootArtifactId FROM result_versions WHERE artifact_id=?")
      .get(sourceArtifactId) as {rootArtifactId:string}|undefined;
    const rootArtifactId=prior?.rootArtifactId??sourceArtifactId;
    const latest=this.repo.db.prepare("SELECT max(revision) AS revision FROM result_versions WHERE root_artifact_id=?")
      .get(rootArtifactId) as {revision:number|null};
    const revision=(latest.revision??1)+1;
    if(revision>20)throw new AuxError("conflict","This result has reached its 20-version limit. Start a new report to continue.");
    const saved=this.artifacts.save({runId:owner.runId,label:source.filename,mediaType:source.mediaType,buffer:bytes},artifact=>{
      this.repo.db.prepare(`INSERT INTO result_versions(artifact_id,root_artifact_id,parent_artifact_id,chat_id,revision,created_at)
        VALUES(?,?,?,?,?,?)`).run(artifact.artifactId,rootArtifactId,sourceArtifactId,chatId,revision,artifact.createdAt);
    });
    const selected=new Set(this.repo.getSetting<string[]>(`conversationArtifacts:${chatId}`)??[]);
    selected.delete(sourceArtifactId);
    selected.add(saved.artifactId);
    this.repo.setSetting(`conversationArtifacts:${chatId}`,[...selected].slice(-20));
    return this.read(saved.artifactId) as ReturnType<SavedResults["read"]> & {revision:number;parentArtifactId:string;rootArtifactId:string};
  }
  search(query: string, limit = 12) {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return [];
    const rows = this.repo.db.prepare(`SELECT a.artifact_id AS artifactId, a.run_id AS runId,
      a.path, a.media_type AS mediaType, a.size AS byteLength, a.created_at AS createdAt,
      c.chat_id AS chatId, c.title AS conversationTitle, r.goal AS turnGoal, rv.revision
      FROM artifacts a JOIN runs r ON r.run_id=a.run_id
      JOIN conversations c ON c.chat_id=coalesce(json_extract(r.config,'$.chatId'),r.run_id)
      LEFT JOIN result_versions rv ON rv.artifact_id=a.artifact_id
      WHERE c.archived=0 AND a.status='complete' AND a.size<=262144
      AND a.media_type IN ('text/plain','text/markdown','text/csv','application/json','text/html')
      AND instr(a.path,'-observation-r')=0
      AND (instr(lower(a.path),?)>0 OR instr(lower(c.title),?)>0 OR instr(lower(r.goal),?)>0)
      ORDER BY a.created_at DESC, a.artifact_id`).iterate(term, term, term) as Iterable<{artifactId:string;runId:string;path:string;mediaType:string;byteLength:number;createdAt:number;chatId:string;conversationTitle:string;turnGoal:string;revision:number|null}>;
    const matches = [];
    for (const {path, ...row} of rows) {
      if (row.mediaType === "application/json") {
        try { const content = Buffer.from(this.artifacts.read(row.artifactId).dataBase64,"base64").toString("utf8"); if (!isTextResultContent(row.mediaType,content)) continue; }
        catch { continue; }
      }
      matches.push({...row,revision:row.revision??undefined, filename:resultFilename(row.artifactId,path)});
      if(matches.length>=limit) break;
    }
    return matches;
  }
  read(artifactId: string) {
    const artifact = this.repo.getArtifact(artifactId);
    if (!artifact?.runId || !isTextResult(artifact)) throw new AuxError("not_found", "This saved text result is unavailable.");
    const run = this.repo.getRun(artifact.runId);
    if (!run) throw new AuxError("not_found", "The result's conversation no longer exists.");
    const content = Buffer.from(this.artifacts.read(artifactId).dataBase64,"base64").toString("utf8");
    if (!isTextResultContent(artifact.mediaType,content)) throw new AuxError("invalid_params", "This result cannot be displayed as text.");
    const version=this.repo.db.prepare(`SELECT root_artifact_id AS rootArtifactId,parent_artifact_id AS parentArtifactId,revision
      FROM result_versions WHERE artifact_id=?`).get(artifactId) as {rootArtifactId:string;parentArtifactId:string;revision:number}|undefined;
    return { artifactId, chatId: run.config?.chatId ?? run.runId, filename: resultFilename(artifactId,artifact.path), mediaType: artifact.mediaType, content, createdAt: artifact.createdAt,
      ...version };
  }
}
