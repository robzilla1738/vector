import { isTextResult, isTextResultContent, resultFilename } from "./text-result.js";
import { AuxError } from "@aux/contracts";
import type { ArtifactStore } from "./artifacts.js";
import type { Repo } from "../store/repo.js";

export class SavedResults {
  constructor(private repo: Repo, private artifacts: Pick<ArtifactStore, "read">) {}
  /** Existence-only check for renderer drafts; never returns protected result text. */
  available(drafts: {artifactId:string;chatId:string}[]): string[] {
    return drafts.flatMap(({artifactId,chatId}) => {
      const artifact=this.repo.getArtifact(artifactId);
      if(!artifact?.runId||!isTextResult(artifact))return [];
      const run=this.repo.getRun(artifact.runId);
      return run && (run.config?.chatId??run.runId)===chatId ? [artifactId] : [];
    });
  }
  search(query: string, limit = 12) {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return [];
    const rows = this.repo.db.prepare(`SELECT a.artifact_id AS artifactId, a.run_id AS runId,
      a.path, a.media_type AS mediaType, a.size AS byteLength, a.created_at AS createdAt,
      c.chat_id AS chatId, c.title AS conversationTitle, r.goal AS turnGoal
      FROM artifacts a JOIN runs r ON r.run_id=a.run_id
      JOIN conversations c ON c.chat_id=coalesce(json_extract(r.config,'$.chatId'),r.run_id)
      WHERE c.archived=0 AND a.status='complete' AND a.size<=262144
      AND a.media_type IN ('text/plain','text/markdown','text/csv','application/json')
      AND instr(a.path,'-observation-r')=0
      AND (instr(lower(a.path),?)>0 OR instr(lower(c.title),?)>0 OR instr(lower(r.goal),?)>0)
      ORDER BY a.created_at DESC, a.artifact_id`).iterate(term, term, term) as Iterable<{artifactId:string;runId:string;path:string;mediaType:string;byteLength:number;createdAt:number;chatId:string;conversationTitle:string;turnGoal:string}>;
    const matches = [];
    for (const {path, ...row} of rows) {
      if (row.mediaType === "application/json") {
        try { const content = Buffer.from(this.artifacts.read(row.artifactId).dataBase64,"base64").toString("utf8"); if (!isTextResultContent(row.mediaType,content)) continue; }
        catch { continue; }
      }
      matches.push({...row, filename:resultFilename(row.artifactId,path)});
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
    return { artifactId, chatId: run.config?.chatId ?? run.runId, filename: resultFilename(artifactId,artifact.path), mediaType: artifact.mediaType, content, createdAt: artifact.createdAt };
  }
}
