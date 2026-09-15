import type { DatabaseSync } from "node:sqlite";
import type {
  Artifact,
  Bookmark,
  BrowserSession,
  Download,
  HistoryEntry,
  ModelCall,
  PageSet,
  PageTarget,
  ResultRecord,
  Run,
  SavedProgram,
  SetMember,
  StepRecord,
  VectorEvent,
} from "@vector/contracts";
import { kvGetJson, kvSetJson } from "./db.js";

const now = () => Date.now();
const J = JSON.stringify;
const P = <T>(s: string | null | undefined, fb: T): T => (s ? (JSON.parse(s) as T) : fb);

/** Repository: the runtime's single-writer persistence surface. */
export class Repo {
  private txDepth = 0;

  constructor(readonly db: DatabaseSync) {}

  /**
   * Run `fn` atomically. Multi-statement writes (delete + N inserts) must
   * never be observable half-done after a crash. Nested calls join the
   * outer transaction; the outermost commits or rolls back.
   */
  transaction<T>(fn: () => T): T {
    if (this.txDepth > 0) {
      this.txDepth++;
      try {
        return fn();
      } finally {
        this.txDepth--;
      }
    }
    this.db.exec("BEGIN");
    this.txDepth = 1;
    try {
      const out = fn();
      this.db.exec("COMMIT");
      return out;
    } catch (e) {
      try {
        this.db.exec("ROLLBACK");
      } catch {
        /* already rolled back by sqlite */
      }
      throw e;
    } finally {
      this.txDepth = 0;
    }
  }

  // ---- pages / targets ----
  upsertPage(p: PageTarget) {
    this.db
      .prepare(
        `INSERT INTO pages(page_id,backend,target_id,session_id,url,title,favicon,epoch,revision,view_status,controller,owned,created_at,active_at,detached,json)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(page_id) DO UPDATE SET backend=excluded.backend,target_id=excluded.target_id,
           session_id=excluded.session_id,url=excluded.url,title=excluded.title,favicon=excluded.favicon,
           epoch=excluded.epoch,revision=excluded.revision,view_status=excluded.view_status,
           controller=excluded.controller,owned=excluded.owned,active_at=excluded.active_at,
           detached=excluded.detached,json=excluded.json`,
      )
      .run(
        p.pageId,
        p.backend,
        p.targetId,
        p.sessionId ?? null,
        p.url,
        p.title,
        p.favicon ?? null,
        p.documentEpoch,
        p.lastRevision,
        p.viewStatus,
        p.controller,
        p.ownedByRuntime ? 1 : 0,
        p.createdAt,
        p.lastActiveAt,
        p.viewStatus === "detached" ? 1 : 0,
        J(p),
      );
  }
  getPage(pageId: string): PageTarget | undefined {
    const r = this.db.prepare("SELECT json FROM pages WHERE page_id=?").get(pageId) as { json: string } | undefined;
    const p = r ? P<PageTarget>(r.json, undefined as never) : undefined;
    if (p) p.controllerEpoch ??= 0;
    return p;
  }
  listPages(opts?: { backend?: string; includeDetached?: boolean }): PageTarget[] {
    const rows = this.db.prepare("SELECT json,detached,backend FROM pages").all() as {
      json: string;
      detached: number;
      backend: string;
    }[];
    return rows
      .map((r) => {
        const p = P<PageTarget>(r.json, undefined as never);
        p.controllerEpoch ??= 0;
        return p;
      })
      .filter(
        (p) =>
          (opts?.includeDetached || p.viewStatus !== "detached") &&
          (!opts?.backend || p.backend === opts.backend),
      );
  }

  // ---- tabs (restart persistence) ----
  saveTabs(tabs: { pageId: string; ordinal: number; url: string; title: string; backend: string; active: boolean }[]) {
    const del = this.db.prepare("DELETE FROM tabs");
    const ins = this.db.prepare(
      "INSERT INTO tabs(page_id,ordinal,url,title,backend,active) VALUES(?,?,?,?,?,?)",
    );
    // atomic: a crash between the delete and the inserts must not lose the restore list
    this.transaction(() => {
      del.run();
      for (const t of tabs) ins.run(t.pageId, t.ordinal, t.url, t.title, t.backend, t.active ? 1 : 0);
    });
  }
  loadTabs() {
    return this.db.prepare("SELECT * FROM tabs ORDER BY ordinal").all() as {
      page_id: string;
      ordinal: number;
      url: string;
      title: string;
      backend: string;
      active: number;
    }[];
  }

  // ---- sessions ----
  upsertSession(s: BrowserSession) {
    this.db
      .prepare(
        `INSERT INTO sessions(session_id,backend,label,status,detail,updated_at) VALUES(?,?,?,?,?,?)
         ON CONFLICT(session_id) DO UPDATE SET status=excluded.status,detail=excluded.detail,updated_at=excluded.updated_at,label=excluded.label`,
      )
      .run(s.sessionId, s.backend, s.label, s.status, s.detail ?? null, now());
  }
  listSessions(): BrowserSession[] {
    return (this.db.prepare("SELECT * FROM sessions ORDER BY updated_at DESC").all() as any[]).map((r) => ({
      sessionId: r.session_id,
      backend: r.backend,
      label: r.label,
      status: r.status,
      detail: r.detail ?? undefined,
    }));
  }

  // ---- sets ----
  saveSet(s: PageSet) {
    this.db
      .prepare(
        `INSERT INTO page_sets(set_id,name,source,member_ids,result_schema,program_id,created_at) VALUES(?,?,?,?,?,?,?)
         ON CONFLICT(set_id) DO UPDATE SET name=excluded.name,member_ids=excluded.member_ids,result_schema=excluded.result_schema,program_id=excluded.program_id`,
      )
      .run(s.setId, s.name, s.source, J(s.memberIds), s.resultSchema ? J(s.resultSchema) : null, s.programId ?? null, s.createdAt);
  }
  getSet(setId: string): PageSet | undefined {
    const r = this.db.prepare("SELECT * FROM page_sets WHERE set_id=?").get(setId) as any;
    if (!r) return undefined;
    return {
      setId: r.set_id,
      name: r.name,
      source: r.source,
      memberIds: P(r.member_ids, []),
      resultSchema: P(r.result_schema, undefined as never),
      programId: r.program_id ?? undefined,
      createdAt: r.created_at,
    };
  }
  listSets(): PageSet[] {
    return (this.db.prepare("SELECT * FROM page_sets ORDER BY created_at DESC").all() as any[]).map((r) => ({
      setId: r.set_id,
      name: r.name,
      source: r.source,
      memberIds: P(r.member_ids, []),
      resultSchema: P(r.result_schema, undefined as never),
      programId: r.program_id ?? undefined,
      createdAt: r.created_at,
    }));
  }
  saveMember(m: SetMember) {
    this.db
      .prepare(
        `INSERT INTO set_members(member_id,set_id,ordinal,url,record_key,label,page_id,status,result_id,error)
         VALUES(?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(member_id) DO UPDATE SET page_id=excluded.page_id,status=excluded.status,result_id=excluded.result_id,error=excluded.error`,
      )
      .run(m.memberId, m.setId, m.ordinal, m.url ?? null, m.recordKey ?? null, m.label ?? null, m.pageId ?? null, m.status, m.resultId ?? null, m.error ?? null);
  }
  listMembers(setId: string): SetMember[] {
    return (this.db.prepare("SELECT * FROM set_members WHERE set_id=? ORDER BY ordinal").all(setId) as any[]).map((r) => ({
      memberId: r.member_id,
      setId: r.set_id,
      ordinal: r.ordinal,
      url: r.url ?? undefined,
      recordKey: r.record_key ?? undefined,
      label: r.label ?? undefined,
      pageId: r.page_id ?? undefined,
      status: r.status,
      resultId: r.result_id ?? undefined,
      error: r.error ?? undefined,
    }));
  }
  getMember(memberId: string): SetMember | undefined {
    const r = this.db.prepare("SELECT * FROM set_members WHERE member_id=?").get(memberId) as any;
    if (!r) return undefined;
    return {
      memberId: r.member_id, setId: r.set_id, ordinal: r.ordinal, url: r.url ?? undefined,
      recordKey: r.record_key ?? undefined, label: r.label ?? undefined, pageId: r.page_id ?? undefined,
      status: r.status, resultId: r.result_id ?? undefined, error: r.error ?? undefined,
    };
  }

  // ---- runs / steps / results ----
  saveRun(r: Run) {
    this.db
      .prepare(
        `INSERT INTO runs(run_id,goal,status,page_ids,set_id,config,status_message,result,error,started_at,ended_at,created_at)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(run_id) DO UPDATE SET status=excluded.status,config=excluded.config,status_message=excluded.status_message,result=excluded.result,error=excluded.error,started_at=excluded.started_at,ended_at=excluded.ended_at`,
      )
      .run(r.runId, r.goal, r.status, J(r.pageIds), r.setId ?? null, r.config ? J(r.config) : null, r.statusMessage ?? null, r.result ? J(r.result) : null, r.error ?? null, r.startedAt ?? null, r.endedAt ?? null, r.createdAt);
  }
  getRun(runId: string): Run | undefined {
    const r = this.db.prepare("SELECT * FROM runs WHERE run_id=?").get(runId) as any;
    return r ? this.rowToRun(r) : undefined;
  }
  listRuns(limit = 50): Run[] {
    return (this.db.prepare("SELECT * FROM runs ORDER BY created_at DESC LIMIT ?").all(limit) as any[]).map((r) =>
      this.rowToRun(r),
    );
  }
  private rowToRun(r: any): Run {
    return {
      runId: r.run_id, goal: r.goal, status: r.status, pageIds: P(r.page_ids, []),
      setId: r.set_id ?? undefined, config: P(r.config, undefined as never),
      statusMessage: r.status_message ?? undefined, result: P(r.result, undefined as never),
      error: r.error ?? undefined, startedAt: r.started_at ?? undefined, endedAt: r.ended_at ?? undefined,
      createdAt: r.created_at,
    };
  }
  saveStep(s: StepRecord) {
    this.db
      .prepare(
        `INSERT INTO steps(step_id,run_id,page_id,op,inputs,expected,outcome,started_at) VALUES(?,?,?,?,?,?,?,?)
         ON CONFLICT(step_id) DO UPDATE SET outcome=excluded.outcome`,
      )
      .run(s.stepId, s.runId, s.pageId ?? null, s.op, s.inputs ? J(s.inputs) : null, s.expected ?? null, s.outcome ? J(s.outcome) : null, s.startedAt);
  }
  listSteps(runId: string): StepRecord[] {
    return (this.db.prepare("SELECT * FROM steps WHERE run_id=? ORDER BY started_at").all(runId) as any[]).map((r) => ({
      stepId: r.step_id, runId: r.run_id, pageId: r.page_id ?? undefined, op: r.op,
      inputs: P(r.inputs, undefined as never), expected: r.expected ?? undefined,
      outcome: P(r.outcome, undefined as never), startedAt: r.started_at,
    }));
  }
  saveResult(r: ResultRecord) {
    this.db
      .prepare(
        `INSERT INTO results(result_id,run_id,member_id,page_id,source_url,values_json,evidence,observed_at,status,error)
         VALUES(?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(result_id) DO UPDATE SET values_json=excluded.values_json,evidence=excluded.evidence,status=excluded.status,error=excluded.error`,
      )
      .run(r.resultId, r.runId ?? null, r.memberId ?? null, r.pageId ?? null, r.sourceUrl, J(r.values), r.evidence ? J(r.evidence) : null, r.observedAt, r.status, r.error ?? null);
  }
  getResult(resultId: string): ResultRecord | undefined {
    const r = this.db.prepare("SELECT * FROM results WHERE result_id=?").get(resultId) as any;
    return r ? this.rowToResult(r) : undefined;
  }
  listResults(filter: { runId?: string; memberId?: string; setId?: string; status?: string }): ResultRecord[] {
    let sql = "SELECT r.* FROM results r";
    const args: unknown[] = [];
    if (filter.setId) sql += " JOIN set_members m ON m.result_id = r.result_id";
    sql += " WHERE 1=1";
    if (filter.runId) { sql += " AND r.run_id=?"; args.push(filter.runId); }
    if (filter.memberId) { sql += " AND r.member_id=?"; args.push(filter.memberId); }
    if (filter.setId) { sql += " AND m.set_id=?"; args.push(filter.setId); }
    if (filter.status) { sql += " AND r.status=?"; args.push(filter.status); }
    sql += " ORDER BY r.observed_at";
    return (this.db.prepare(sql).all(...(args as never[])) as any[]).map((r) => this.rowToResult(r));
  }
  private rowToResult(r: any): ResultRecord {
    return {
      resultId: r.result_id, runId: r.run_id ?? undefined, memberId: r.member_id ?? undefined,
      pageId: r.page_id ?? undefined, sourceUrl: r.source_url, values: P(r.values_json, {}),
      evidence: P(r.evidence, undefined as never), observedAt: r.observed_at, status: r.status,
      error: r.error ?? undefined,
    };
  }

  // ---- observations (bounded history per page) ----
  saveObservation(o: { observationId: string; pageId: string; epoch: number; revision: number; observedAt: number; scope: string; json: string }) {
    this.db
      .prepare("INSERT INTO observations(observation_id,page_id,epoch,revision,observed_at,scope,json) VALUES(?,?,?,?,?,?,?)")
      .run(o.observationId, o.pageId, o.epoch, o.revision, o.observedAt, o.scope, o.json);
    this.db
      .prepare(
        `DELETE FROM observations WHERE page_id=? AND revision NOT IN
         (SELECT revision FROM observations WHERE page_id=? ORDER BY revision DESC LIMIT 20)`,
      )
      .run(o.pageId, o.pageId);
  }
  latestObservation(pageId: string): { revision: number; epoch: number; json: string } | undefined {
    return this.db
      .prepare("SELECT revision,epoch,json FROM observations WHERE page_id=? ORDER BY revision DESC LIMIT 1")
      .get(pageId) as { revision: number; epoch: number; json: string } | undefined;
  }
  observationAt(pageId: string, revision: number): string | undefined {
    const r = this.db
      .prepare("SELECT json FROM observations WHERE page_id=? AND revision<=? ORDER BY revision DESC LIMIT 1")
      .get(pageId, revision) as { json: string } | undefined;
    return r?.json;
  }

  // ---- programs ----
  saveProgram(p: SavedProgram) {
    this.db
      .prepare(
        `INSERT INTO programs(program_id,name,description,version,site_key,parameters,steps_json,preconditions,postconditions,use_count,last_used_at,created_at)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(program_id) DO UPDATE SET name=excluded.name,description=excluded.description,version=excluded.version,
           site_key=excluded.site_key,parameters=excluded.parameters,steps_json=excluded.steps_json,
           preconditions=excluded.preconditions,postconditions=excluded.postconditions,
           use_count=excluded.use_count,last_used_at=excluded.last_used_at`,
      )
      .run(p.programId, p.name, p.description ?? null, p.version, p.siteKey, J(p.parameters), p.stepsJson, p.preconditions ? J(p.preconditions) : null, p.postconditions ? J(p.postconditions) : null, p.useCount, p.lastUsedAt ?? null, p.createdAt);
  }
  getProgram(programId: string): SavedProgram | undefined {
    const r = this.db.prepare("SELECT * FROM programs WHERE program_id=?").get(programId) as any;
    return r ? this.rowToProgram(r) : undefined;
  }
  listPrograms(): SavedProgram[] {
    return (this.db.prepare("SELECT * FROM programs ORDER BY created_at DESC").all() as any[]).map((r) => this.rowToProgram(r));
  }
  deleteProgram(programId: string) {
    this.db.prepare("DELETE FROM programs WHERE program_id=?").run(programId);
  }
  private rowToProgram(r: any): SavedProgram {
    return {
      programId: r.program_id, name: r.name, description: r.description ?? undefined, version: r.version,
      siteKey: r.site_key, parameters: P(r.parameters, []), stepsJson: r.steps_json,
      preconditions: P(r.preconditions, undefined as never), postconditions: P(r.postconditions, undefined as never),
      useCount: r.use_count, lastUsedAt: r.last_used_at ?? undefined, createdAt: r.created_at,
    };
  }

  // ---- artifacts / model calls ----
  saveArtifact(a: Artifact) {
    this.db
      .prepare("INSERT INTO artifacts(artifact_id,run_id,page_id,path,media_type,size,status,created_at) VALUES(?,?,?,?,?,?,?,?)")
      .run(a.artifactId, a.runId ?? null, a.pageId ?? null, a.path, a.mediaType, a.size, a.status, a.createdAt);
  }
  getArtifact(artifactId: string): Artifact | undefined {
    const r = this.db.prepare("SELECT * FROM artifacts WHERE artifact_id=?").get(artifactId) as any;
    return r ? this.rowToArtifact(r) : undefined;
  }
  listArtifacts(filter: { runId?: string; pageId?: string }): Artifact[] {
    let sql = "SELECT * FROM artifacts WHERE 1=1";
    const args: string[] = [];
    if (filter.runId) { sql += " AND run_id=?"; args.push(filter.runId); }
    if (filter.pageId) { sql += " AND page_id=?"; args.push(filter.pageId); }
    return (this.db.prepare(sql + " ORDER BY created_at").all(...args) as any[]).map((r) => this.rowToArtifact(r));
  }
  private rowToArtifact(r: any): Artifact {
    return { artifactId: r.artifact_id, runId: r.run_id ?? undefined, pageId: r.page_id ?? undefined, path: r.path, mediaType: r.media_type, size: r.size, status: r.status, createdAt: r.created_at };
  }
  saveModelCall(c: ModelCall) {
    this.db
      .prepare(
        `INSERT INTO model_calls(call_id,run_id,role,model_id,provider_metadata,duration_ms,input_tokens,output_tokens,cost_usd,cost_estimated,error,created_at)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(c.callId, c.runId ?? null, c.role, c.modelId, c.providerMetadata ? J(c.providerMetadata) : null, c.durationMs, c.inputTokens ?? null, c.outputTokens ?? null, c.costUsd ?? null, c.costEstimated ? 1 : 0, c.error ?? null, c.createdAt);
  }
  listModelCalls(runId: string): ModelCall[] {
    return (this.db.prepare("SELECT * FROM model_calls WHERE run_id=? ORDER BY created_at").all(runId) as any[]).map((r) => ({
      callId: r.call_id, runId: r.run_id ?? undefined, role: r.role, modelId: r.model_id,
      providerMetadata: P(r.provider_metadata, undefined as never), durationMs: r.duration_ms,
      inputTokens: r.input_tokens ?? undefined, outputTokens: r.output_tokens ?? undefined,
      costUsd: r.cost_usd ?? undefined, costEstimated: !!r.cost_estimated, error: r.error ?? undefined,
      createdAt: r.created_at,
    }));
  }

  // ---- events ----
  appendEvent(e: Omit<VectorEvent, "seq">): number {
    const info = this.db
      .prepare("INSERT INTO events(run_id,type,payload,ts) VALUES(?,?,?,?)")
      .run(e.runId ?? null, e.type, J(e.payload), e.ts);
    return Number(info.lastInsertRowid);
  }
  eventsSince(sinceSeq: number, limit = 500, runId?: string): { events: VectorEvent[]; lastSeq: number } {
    const rows = runId
      ? (this.db.prepare("SELECT * FROM events WHERE seq>? AND run_id=? ORDER BY seq LIMIT ?").all(sinceSeq, runId, limit) as any[])
      : (this.db.prepare("SELECT * FROM events WHERE seq>? ORDER BY seq LIMIT ?").all(sinceSeq, limit) as any[]);
    const events = rows.map((r) => ({ seq: r.seq, runId: r.run_id ?? undefined, type: r.type, payload: P(r.payload, {}), ts: r.ts }));
    return { events, lastSeq: events.length ? events[events.length - 1]!.seq : sinceSeq };
  }
  lastSeq(): number {
    const r = this.db.prepare("SELECT MAX(seq) s FROM events").get() as { s: number | null };
    return r.s ?? 0;
  }

  // ---- history / bookmarks / downloads ----
  addHistory(url: string, title: string, pageId?: string) {
    this.db.prepare("INSERT OR REPLACE INTO history(url,title,page_id,visited_at) VALUES(?,?,?,?)").run(url, title, pageId ?? null, now());
  }
  listHistory(query?: string, limit = 100): HistoryEntry[] {
    const rows = query
      ? (this.db.prepare("SELECT * FROM history WHERE url LIKE ? OR title LIKE ? ORDER BY visited_at DESC LIMIT ?").all(`%${query}%`, `%${query}%`, limit) as any[])
      : (this.db.prepare("SELECT * FROM history ORDER BY visited_at DESC LIMIT ?").all(limit) as any[]);
    return rows.map((r) => ({ url: r.url, title: r.title, pageId: r.page_id ?? undefined, visitedAt: r.visited_at }));
  }
  clearHistory() {
    this.db.exec("DELETE FROM history");
  }
  addBookmark(url: string, title: string) {
    this.db.prepare("INSERT OR REPLACE INTO bookmarks(url,title,created_at) VALUES(?,?,?)").run(url, title, now());
  }
  removeBookmark(url: string) {
    this.db.prepare("DELETE FROM bookmarks WHERE url=?").run(url);
  }
  listBookmarks(): Bookmark[] {
    return (this.db.prepare("SELECT * FROM bookmarks ORDER BY created_at DESC").all() as any[]).map((r) => ({ url: r.url, title: r.title, createdAt: r.created_at }));
  }
  saveDownload(d: {
    id: string;
    pageId?: string;
    filename: string;
    path: string;
    state: string;
    size: number;
    totalBytes?: number;
    startedAt: number;
    endedAt?: number;
  }) {
    this.db
      .prepare(
        `INSERT INTO downloads(id,page_id,filename,path,state,size,total_bytes,started_at,ended_at) VALUES(?,?,?,?,?,?,?,?,?)
         ON CONFLICT(id) DO UPDATE SET state=excluded.state,size=excluded.size,total_bytes=excluded.total_bytes,ended_at=excluded.ended_at`,
      )
      .run(d.id, d.pageId ?? null, d.filename, d.path, d.state, d.size, d.totalBytes ?? null, d.startedAt, d.endedAt ?? null);
  }
  listDownloads(limit = 100): Download[] {
    return (this.db.prepare("SELECT * FROM downloads ORDER BY started_at DESC LIMIT ?").all(limit) as any[]).map((r) => ({
      id: r.id,
      pageId: r.page_id ?? undefined,
      filename: r.filename,
      path: r.path,
      state: r.state,
      size: r.size,
      totalBytes: r.total_bytes ?? undefined,
      startedAt: r.started_at,
      endedAt: r.ended_at ?? undefined,
    }));
  }

  // ---- settings ----
  getSetting<T>(key: string): T | undefined {
    return kvGetJson<T>(this.db, `setting:${key}`);
  }
  setSetting(key: string, value: unknown) {
    kvSetJson(this.db, `setting:${key}`, value);
  }

  // ---- response capture (§8) ----
  saveResponse(r: {
    requestId: string;
    pageId: string;
    url: string;
    method: string;
    status?: number;
    contentType?: string;
    startedAt: number;
    endedAt?: number;
    durationMs?: number;
    bodyArtifactId?: string;
    bodyBytes?: number;
    truncated?: number;
    runId?: string;
  }) {
    this.db
      .prepare(
        `INSERT INTO response_metadata(request_id,page_id,url,method,status,content_type,started_at,ended_at,duration_ms,body_artifact_id,body_bytes,truncated,run_id)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(request_id) DO UPDATE SET status=excluded.status,ended_at=excluded.ended_at,
           duration_ms=excluded.duration_ms,body_artifact_id=excluded.body_artifact_id,
           body_bytes=excluded.body_bytes,truncated=excluded.truncated`,
      )
      .run(
        r.requestId, r.pageId, r.url, r.method, r.status ?? null, r.contentType ?? null,
        r.startedAt, r.endedAt ?? null, r.durationMs ?? null, r.bodyArtifactId ?? null,
        r.bodyBytes ?? null, r.truncated ?? 0, r.runId ?? null,
      );
  }
  getResponse(requestId: string) {
    const r = this.db.prepare("SELECT * FROM response_metadata WHERE request_id=?").get(requestId) as any;
    return r ? this.responseRow(r) : undefined;
  }
  listResponses(pageId: string, opts?: { since?: number; urlIncludes?: string; limit?: number }) {
    const rows = this.db
      .prepare(
        `SELECT * FROM response_metadata WHERE page_id=? ${opts?.since ? "AND started_at>=?" : ""}
         ${opts?.urlIncludes ? "AND url LIKE ?" : ""} ORDER BY started_at DESC LIMIT ?`,
      )
      .all(
        ...([pageId, ...(opts?.since ? [opts.since] : []), ...(opts?.urlIncludes ? [`%${opts.urlIncludes}%`] : []), opts?.limit ?? 200] as any[]),
      ) as any[];
    return rows.map((r) => this.responseRow(r));
  }
  private responseRow(r: any) {
    return {
      requestId: r.request_id as string,
      pageId: r.page_id as string,
      url: r.url as string,
      method: r.method as string,
      status: r.status ?? undefined,
      contentType: r.content_type ?? undefined,
      startedAt: r.started_at as number,
      endedAt: r.ended_at ?? undefined,
      durationMs: r.duration_ms ?? undefined,
      bodyArtifactId: r.body_artifact_id ?? undefined,
      bodyBytes: r.body_bytes ?? undefined,
      truncated: !!r.truncated,
      runId: r.run_id ?? undefined,
    };
  }

  // ---- datasets (§8.2) ----
  saveDataset(d: {
    datasetId: string;
    runId?: string;
    pageId?: string;
    source: string;
    schema?: unknown[];
    rows: unknown[];
    provenance?: string;
  }) {
    this.db
      .prepare(
        `INSERT INTO datasets(dataset_id,run_id,page_id,source,schema_json,row_count,values_json,provenance,created_at)
         VALUES(?,?,?,?,?,?,?,?,?)
         ON CONFLICT(dataset_id) DO UPDATE SET values_json=excluded.values_json,row_count=excluded.row_count,stale=0`,
      )
      .run(d.datasetId, d.runId ?? null, d.pageId ?? null, d.source, J(d.schema ?? []), d.rows.length, J(d.rows), d.provenance ?? null, now());
  }
  getDataset(datasetId: string) {
    const r = this.db.prepare("SELECT * FROM datasets WHERE dataset_id=?").get(datasetId) as any;
    return r ? this.datasetRow(r) : undefined;
  }
  listDatasets(filter?: { runId?: string; pageId?: string }) {
    const rows = this.db
      .prepare(
        `SELECT * FROM datasets WHERE 1=1 ${filter?.runId ? "AND run_id=?" : ""} ${filter?.pageId ? "AND page_id=?" : ""} ORDER BY created_at DESC`,
      )
      .all(...([...(filter?.runId ? [filter.runId] : []), ...(filter?.pageId ? [filter.pageId] : [])] as any[])) as any[];
    return rows.map((r) => this.datasetRow(r));
  }
  markDatasetsStale(pageId: string, documentEpoch: number) {
    this.db.prepare("UPDATE datasets SET stale=1 WHERE page_id=?").run(pageId);
  }
  private datasetRow(r: any) {
    return {
      datasetId: r.dataset_id as string,
      runId: r.run_id ?? undefined,
      pageId: r.page_id ?? undefined,
      source: r.source as string,
      schema: P<any[]>(r.schema_json, []),
      rows: P<any[]>(r.values_json, []),
      rowCount: r.row_count as number,
      provenance: r.provenance ?? undefined,
      createdAt: r.created_at as number,
      stale: !!r.stale,
    };
  }

  // ---- operation registry (§9) ----
  saveOperation(o: {
    operationId: string;
    siteKey: string;
    name: string;
    description?: string;
    inputSchema?: unknown;
    outputSchema?: unknown;
    effectClass?: string;
    guards?: unknown;
  }) {
    this.db
      .prepare(
        `INSERT INTO operations(operation_id,site_key,name,description,input_schema,output_schema,effect_class,guards,created_at,updated_at)
         VALUES(?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(site_key,name) DO UPDATE SET description=excluded.description,
           input_schema=excluded.input_schema,output_schema=excluded.output_schema,
           effect_class=excluded.effect_class,guards=excluded.guards,updated_at=excluded.updated_at`,
      )
      .run(
        o.operationId, o.siteKey, o.name, o.description ?? null, J(o.inputSchema ?? {}),
        J(o.outputSchema ?? {}), o.effectClass ?? "read", J(o.guards ?? {}), now(), now(),
      );
  }
  getOperation(siteKey: string, name: string) {
    const r = this.db.prepare("SELECT * FROM operations WHERE site_key=? AND name=?").get(siteKey, name) as any;
    return r ? this.operationRow(r) : undefined;
  }
  getOperationById(operationId: string) {
    const r = this.db.prepare("SELECT * FROM operations WHERE operation_id=?").get(operationId) as any;
    return r ? this.operationRow(r) : undefined;
  }
  listOperations(siteKey?: string) {
    const rows = (siteKey
      ? this.db.prepare("SELECT * FROM operations WHERE site_key=? ORDER BY name").all(siteKey)
      : this.db.prepare("SELECT * FROM operations ORDER BY site_key, name").all()) as any[];
    return rows.map((r) => this.operationRow(r));
  }
  private operationRow(r: any) {
    return {
      operationId: r.operation_id as string,
      siteKey: r.site_key as string,
      name: r.name as string,
      description: r.description ?? undefined,
      inputSchema: P(r.input_schema, {}),
      outputSchema: P(r.output_schema, {}),
      effectClass: r.effect_class as string,
      guards: P(r.guards, {}),
      createdAt: r.created_at as number,
      updatedAt: r.updated_at as number,
    };
  }
  saveImplementation(i: {
    implId: string;
    operationId: string;
    kind: string;
    executable: string;
    state?: string;
    evidence?: unknown[];
    stats?: unknown;
  }) {
    this.db
      .prepare(
        `INSERT INTO operation_implementations(impl_id,operation_id,kind,executable,state,evidence,stats,created_at,updated_at)
         VALUES(?,?,?,?,?,?,?,?,?)
         ON CONFLICT(impl_id) DO UPDATE SET executable=excluded.executable,state=excluded.state,
           evidence=excluded.evidence,stats=excluded.stats,updated_at=excluded.updated_at`,
      )
      .run(i.implId, i.operationId, i.kind, i.executable, i.state ?? "candidate", J(i.evidence ?? []), J(i.stats ?? {}), now(), now());
  }
  setImplState(implId: string, state: string, evidence?: unknown) {
    this.db
      .prepare("UPDATE operation_implementations SET state=?, evidence=?, updated_at=? WHERE impl_id=?")
      .run(state, J(evidence ?? []), now(), implId);
  }
  deleteImpl(implId: string) {
    this.db.prepare("DELETE FROM operation_implementations WHERE impl_id=?").run(implId);
  }
  deleteOperation(operationId: string) {
    this.db.prepare("DELETE FROM operation_implementations WHERE operation_id=?").run(operationId);
    this.db.prepare("DELETE FROM operations WHERE operation_id=?").run(operationId);
  }
  listImplementations(operationId: string, state?: string) {
    const rows = (state
      ? this.db.prepare("SELECT * FROM operation_implementations WHERE operation_id=? AND state=? ORDER BY created_at").all(operationId, state)
      : this.db.prepare("SELECT * FROM operation_implementations WHERE operation_id=? ORDER BY created_at").all(operationId)) as any[];
    return rows.map((r) => ({
      implId: r.impl_id as string,
      operationId: r.operation_id as string,
      kind: r.kind as string,
      executable: r.executable as string,
      state: r.state as string,
      evidence: P<any[]>(r.evidence, []),
      stats: P(r.stats, {}),
      createdAt: r.created_at as number,
      updatedAt: r.updated_at as number,
    }));
  }
  saveInvocation(v: {
    invocationId: string;
    operationId: string;
    implId?: string;
    runId?: string;
    requestKey?: string;
    inputs?: unknown;
    status: string;
    effectOutcome?: string;
    routeReason?: string;
    startedAt: number;
    endedAt?: number;
    error?: string;
  }) {
    this.db
      .prepare(
        `INSERT INTO operation_invocations(invocation_id,operation_id,impl_id,run_id,request_key,inputs,status,effect_outcome,route_reason,started_at,ended_at,error)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(invocation_id) DO UPDATE SET status=excluded.status, effect_outcome=excluded.effect_outcome,
           ended_at=excluded.ended_at, error=excluded.error, impl_id=excluded.impl_id, route_reason=excluded.route_reason`,
      )
      .run(
        v.invocationId, v.operationId, v.implId ?? null, v.runId ?? null, v.requestKey ?? null, J(v.inputs ?? {}),
        v.status, v.effectOutcome ?? "unknown", v.routeReason ?? null, v.startedAt, v.endedAt ?? null, v.error ?? null,
      );
  }

  getInvocation(invocationId: string) {
    const row = this.db.prepare(`SELECT * FROM operation_invocations WHERE invocation_id=?`).get(invocationId) as any;
    if (!row) return null;
    return {
      invocationId: row.invocation_id as string,
      operationId: row.operation_id as string,
      implId: (row.impl_id ?? undefined) as string | undefined,
      runId: (row.run_id ?? undefined) as string | undefined,
      requestKey: (row.request_key ?? undefined) as string | undefined,
      inputs: row.inputs ? JSON.parse(row.inputs as string) : undefined,
      status: row.status as string,
      effectOutcome: row.effect_outcome as string,
      routeReason: (row.route_reason ?? undefined) as string | undefined,
      startedAt: row.started_at as number,
      endedAt: (row.ended_at ?? undefined) as number | undefined,
      error: (row.error ?? undefined) as string | undefined,
    };
  }

  /** §17.3 — invocations still 'running' at startup were interrupted mid-flight;
   *  their effect outcome stays 'unknown' until reconciled. */
  markRunningInvocationsInterrupted() {
    this.db
      .prepare(`UPDATE operation_invocations SET status='interrupted', ended_at=? WHERE status='running'`)
      .run(Date.now());
  }

  findInvocationByRequest(requestKey: string, operationId: string) {
    const row = this.db
      .prepare(`SELECT invocation_id FROM operation_invocations WHERE request_key=? AND operation_id=?`)
      .get(requestKey, operationId) as { invocation_id: string } | undefined;
    return row ? this.getInvocation(row.invocation_id) : null;
  }

  // ---------- checkpoints (§7.7/§17.3) ----------

  /** Persist a program checkpoint env — latest per (pageId, name) wins. */
  saveCheckpoint(pageId: string, name: string, env: Record<string, unknown>) {
    kvSetJson(this.db, `ckpt:${pageId}:${name}`, { ...env, savedAt: Date.now() });
  }
  loadCheckpoint(pageId: string, name: string) {
    return kvGetJson<{ inputs?: Record<string, unknown>; vars?: Record<string, unknown>; emitted?: unknown[]; savedAt?: number }>(
      this.db, `ckpt:${pageId}:${name}`,
    );
  }
}
