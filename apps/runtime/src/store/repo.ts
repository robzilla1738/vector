import type { DatabaseSync, StatementSync } from "node:sqlite";
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
  Run, RunMessage, ConversationSummary,
  SavedProgram,
  SetMember,
  StepRecord,
  AuxEvent,
} from "@aux/contracts";
import { AuxError } from "@aux/contracts";
import { commitRelaxed, kvGetJson, kvSetJson } from "./db.js";

const now = () => Date.now();
const J = JSON.stringify;
const P = <T>(s: string | null | undefined, fb: T): T => (s ? (JSON.parse(s) as T) : fb);

/**
 * Free text → FTS5 MATCH: every word becomes a quoted prefix term AND-ed
 * together. Returns null when nothing tokenizes (LIKE handles those).
 */
const ftsMatch = (query: string): string | null => {
  const terms = query
    .split(/[^\p{L}\p{N}_]+/u)
    .map((term) => term.replaceAll('"', '""'))
    .filter(Boolean);
  return terms.length ? terms.map((term) => `"${term}"*`).join(" ") : null;
};

/** Repository: the runtime's single-writer persistence surface. */
export class Repo {
  private txDepth = 0;
  private statements = new Map<string, StatementSync>();
  /** Hot-path writes coalesced by key, committed together once per tick (see defer). */
  private deferred = new Map<string, { write: () => void; late: boolean }>();
  private flushTimer: NodeJS.Immediate | null = null;

  constructor(readonly db: DatabaseSync) {}

  /** Prepared once per SQL text; SQLite re-prepares a cached statement itself after a schema change. */
  private q(sql: string): StatementSync {
    let s = this.statements.get(sql);
    if (!s) {
      if (this.statements.size >= 512) this.statements.clear();
      this.statements.set(sql, (s = this.db.prepare(sql)));
    }
    return s;
  }

  /**
   * Queue a hot-path write (page rows, the tab strip, events, observations).
   * A later write with the same key replaces a pending one in place;
   * everything pending commits in queue order in one relaxed transaction on
   * the next tick, `late` writes after the rest (rows that reference them).
   * Reads of those tables flush first, so callers never miss their own writes.
   */
  defer(key: string, write: () => void, late = false) {
    this.deferred.set(key, { write, late });
    if (!this.flushTimer) {
      this.flushTimer = setImmediate(() => {
        try {
          this.flush();
        } catch {
          /* database closed under a pending flush */
        }
      });
    }
  }

  /** Commit pending deferred writes now. Each is best-effort: one failing row must not drop the batch. */
  flush(): void {
    if (this.flushTimer) {
      clearImmediate(this.flushTimer);
      this.flushTimer = null;
    }
    if (!this.deferred.size) return;
    const pending = [...this.deferred.values()];
    this.deferred.clear();
    const writes = [...pending.filter((w) => !w.late), ...pending.filter((w) => w.late)];
    const run = () => {
      for (const { write } of writes) {
        try {
          write();
        } catch {
          /* observational rows */
        }
      }
    };
    // inside an open transaction the writes join it and commit with it
    if (!commitRelaxed(this.db, run)) run();
  }

  close(): void {
    this.flush();
    this.db.close();
  }

  /**
   * Run `fn` atomically. Multi-statement writes (delete + N inserts) must
   * never be observable half-done after a crash. Inside an open transaction
   * (nested call, or a deferred-write batch) the work is a savepoint: it
   * rolls back alone and commits with the outer transaction.
   */
  transaction<T>(fn: () => T): T {
    if (this.db.isTransaction) {
      const savepoint = `sp${++this.txDepth}`;
      this.db.exec(`SAVEPOINT ${savepoint}`);
      try {
        const out = fn();
        this.db.exec(`RELEASE ${savepoint}`);
        return out;
      } catch (e) {
        this.db.exec(`ROLLBACK TO ${savepoint}`);
        this.db.exec(`RELEASE ${savepoint}`);
        throw e;
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
    this.q(
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
  /** Coalesced upsert — the row reflects the page object as it is at flush time. */
  deferPage(p: PageTarget) {
    this.defer(`page:${p.pageId}`, () => this.upsertPage(p));
  }
  /**
   * Boot: every persisted page is a detached history entry until something
   * re-attaches it (one statement instead of an upsert per row ever created).
   * Runtime-owned pages detached for over a week are dropped.
   */
  detachAllPages(retainOwnedMs = 7 * 24 * 60 * 60 * 1000) {
    this.transaction(() => {
      this.q(
        `UPDATE pages SET view_status='detached',controller='none',detached=1,
           json=json_set(json,'$.viewStatus','detached','$.controller','none')
         WHERE view_status<>'detached' OR controller<>'none' OR detached<>1`,
      ).run();
      this.q("DELETE FROM pages WHERE owned=1 AND active_at<? AND page_id NOT IN (SELECT page_id FROM tabs)").run(now() - retainOwnedMs);
    });
  }
  getPage(pageId: string): PageTarget | undefined {
    this.flush();
    const r = this.q("SELECT json FROM pages WHERE page_id=?").get(pageId) as { json: string } | undefined;
    const p = r ? P<PageTarget>(r.json, undefined as never) : undefined;
    if (p) p.controllerEpoch ??= 0;
    return p;
  }
  listPages(opts?: { backend?: string; includeDetached?: boolean }): PageTarget[] {
    this.flush();
    const rows = this.q("SELECT json,detached,backend FROM pages").all() as {
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
  saveTabs(tabs: { pageId: string; windowId?: string; ordinal: number; url: string; title: string; backend: string; active: boolean }[]) {
    const del = this.q("DELETE FROM tabs");
    const ins = this.q(
      "INSERT INTO tabs(page_id,window_id,ordinal,url,title,backend,active) VALUES(?,?,?,?,?,?,?)",
    );
    // atomic: a crash between the delete and the inserts must not lose the restore list
    this.transaction(() => {
      del.run();
      for (const t of tabs) ins.run(t.pageId, t.windowId ?? "main", t.ordinal, t.url, t.title, t.backend, t.active ? 1 : 0);
    });
  }
  loadTabs() {
    this.flush();
    return this.q("SELECT * FROM tabs ORDER BY ordinal").all() as {
      page_id: string;
      window_id: string;
      ordinal: number;
      url: string;
      title: string;
      backend: string;
      active: number;
    }[];
  }

  // ---- sessions ----
  upsertSession(s: BrowserSession) {
    this.q(
        `INSERT INTO sessions(session_id,backend,label,status,detail,updated_at) VALUES(?,?,?,?,?,?)
         ON CONFLICT(session_id) DO UPDATE SET status=excluded.status,detail=excluded.detail,updated_at=excluded.updated_at,label=excluded.label`,
      )
      .run(s.sessionId, s.backend, s.label, s.status, s.detail ?? null, now());
  }
  listSessions(): BrowserSession[] {
    return (this.q("SELECT * FROM sessions ORDER BY updated_at DESC").all() as any[]).map((r) => ({
      sessionId: r.session_id,
      backend: r.backend,
      label: r.label,
      status: r.status,
      detail: r.detail ?? undefined,
    }));
  }

  // ---- sets ----
  saveSet(s: PageSet) {
    this.q(
        `INSERT INTO page_sets(set_id,name,source,member_ids,result_schema,program_id,created_at) VALUES(?,?,?,?,?,?,?)
         ON CONFLICT(set_id) DO UPDATE SET name=excluded.name,member_ids=excluded.member_ids,result_schema=excluded.result_schema,program_id=excluded.program_id`,
      )
      .run(s.setId, s.name, s.source, J(s.memberIds), s.resultSchema ? J(s.resultSchema) : null, s.programId ?? null, s.createdAt);
  }
  getSet(setId: string): PageSet | undefined {
    const r = this.q("SELECT * FROM page_sets WHERE set_id=?").get(setId) as any;
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
    return (this.q("SELECT * FROM page_sets ORDER BY created_at DESC").all() as any[]).map((r) => ({
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
    this.q(
        `INSERT INTO set_members(member_id,set_id,ordinal,url,record_key,label,page_id,status,result_id,error)
         VALUES(?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(member_id) DO UPDATE SET page_id=excluded.page_id,status=excluded.status,result_id=excluded.result_id,error=excluded.error`,
      )
      .run(m.memberId, m.setId, m.ordinal, m.url ?? null, m.recordKey ?? null, m.label ?? null, m.pageId ?? null, m.status, m.resultId ?? null, m.error ?? null);
  }
  listMembers(setId: string): SetMember[] {
    return (this.q("SELECT * FROM set_members WHERE set_id=? ORDER BY ordinal").all(setId) as any[]).map((r) => ({
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
    const r = this.q("SELECT * FROM set_members WHERE member_id=?").get(memberId) as any;
    if (!r) return undefined;
    return {
      memberId: r.member_id, setId: r.set_id, ordinal: r.ordinal, url: r.url ?? undefined,
      recordKey: r.record_key ?? undefined, label: r.label ?? undefined, pageId: r.page_id ?? undefined,
      status: r.status, resultId: r.result_id ?? undefined, error: r.error ?? undefined,
    };
  }

  // ---- runs / steps / results ----
  saveRun(r: Run) {
    this.transaction(() => {
      this.q(
        `INSERT INTO runs(run_id,goal,status,page_ids,set_id,config,status_message,result,error,failure,started_at,ended_at,created_at)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(run_id) DO UPDATE SET status=excluded.status,config=excluded.config,status_message=excluded.status_message,result=excluded.result,error=excluded.error,failure=excluded.failure,started_at=excluded.started_at,ended_at=excluded.ended_at`,
      ).run(r.runId, r.goal, r.status, J(r.pageIds), r.setId ?? null, r.config ? J(r.config) : null, r.statusMessage ?? null, r.result ? J(r.result) : null, r.error ?? null, r.failure ? J(r.failure) : null, r.startedAt ?? null, r.endedAt ?? null, r.createdAt);
      const chatId = r.config?.chatId ?? r.runId;
      const taskRow = r.config?.taskId ? this.q("SELECT json FROM tasks WHERE task_id=?").get(r.config.taskId) as { json: string } | undefined : undefined;
      let title = r.goal.slice(0, 160);
      if (taskRow) {
        try { title = String((JSON.parse(taskRow.json) as { title?: string }).title || title).slice(0, 160); } catch { /* retain run goal */ }
      }
      this.q(`INSERT INTO conversations(chat_id,title,archived,created_at,updated_at) VALUES(?,?,0,?,?)
        ON CONFLICT(chat_id) DO UPDATE SET title=CASE WHEN ? THEN excluded.title ELSE conversations.title END,
          updated_at=max(conversations.updated_at,excluded.updated_at)`)
        .run(chatId, title, r.createdAt, r.createdAt, r.config?.taskId ? 1 : 0);
    });
  }
  getRun(runId: string): Run | undefined {
    const r = this.q("SELECT * FROM runs WHERE run_id=?").get(runId) as any;
    return r ? this.rowToRun(r) : undefined;
  }
  activeConversationRun(chatId: string): Run | undefined {
    const row = this.q(`SELECT * FROM runs WHERE json_extract(CASE WHEN json_valid(config) THEN config ELSE '{}' END,'$.chatId')=?
      AND status IN ('queued','planning','running','paused','needs_input') ORDER BY created_at DESC,run_id DESC LIMIT 1`).get(chatId) as Record<string, unknown> | undefined;
    return row ? this.rowToRun(row) : undefined;
  }
  listRuns(limit = 50, options: { before?: { createdAt: number; runId: string }; chatId?: string; query?: string; groupByChat?: boolean; includeArchived?: boolean } = {}): Run[] {
    const where: string[] = [];
    const values: (string | number)[] = [];
    if (options.groupByChat) where.push("chat_rank = 1");
    if (options.chatId) { where.push("chat_key = ?"); values.push(options.chatId); }
    if (!options.chatId && !options.includeArchived) where.push("chat_key NOT IN (SELECT chat_id FROM conversations WHERE archived=1)");
    if (options.query?.trim()) {
      where.push("chat_key IN (SELECT chat_key FROM keyed WHERE instr(lower(goal || ' ' || coalesce(status_message, '')), lower(?)) > 0)");
      values.push(options.query.trim());
    }
    if (options.before) {
      where.push("(created_at < ? OR (created_at = ? AND run_id < ?))");
      values.push(options.before.createdAt, options.before.createdAt, options.before.runId);
    }
    return (this.q(`WITH keyed AS (
      SELECT *, coalesce(json_extract(CASE WHEN json_valid(config) THEN config ELSE '{}' END, '$.chatId'), run_id) AS chat_key FROM runs
    ), ranked AS (
      SELECT *, row_number() OVER (PARTITION BY chat_key ORDER BY created_at DESC, run_id DESC) AS chat_rank FROM keyed
    ) SELECT * FROM ${options.groupByChat ? "ranked" : "keyed"}
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY created_at DESC, run_id DESC LIMIT ?`).all(...values, limit) as any[]).map(r => this.rowToRun(r));
  }

  private rowToRunMessage(row: Record<string, unknown>): RunMessage {
    return {
      messageId: row.message_id as string,
      chatId: row.chat_id as string,
      targetRunId: row.target_run_id as string,
      deliveryRunId: row.delivery_run_id as string,
      mode: row.mode as RunMessage["mode"],
      status: row.status as RunMessage["status"],
      text: row.text as string,
      pageIds: P(row.page_ids as string, [] as string[]),
      contextPageRefs: P(row.context_page_refs as string, [] as RunMessage["contextPageRefs"]),
      expectedRevision: row.expected_revision as number,
      ...(row.error ? { error: row.error as string } : {}),
      createdAt: row.created_at as number,
      updatedAt: row.updated_at as number,
    };
  }

  insertRunMessage(message: RunMessage): RunMessage {
    this.q(`INSERT OR IGNORE INTO run_messages(message_id,chat_id,target_run_id,delivery_run_id,mode,status,text,page_ids,context_page_refs,expected_revision,error,created_at,updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(message.messageId, message.chatId, message.targetRunId, message.deliveryRunId,
      message.mode, message.status, message.text, J(message.pageIds), J(message.contextPageRefs), message.expectedRevision,
      message.error ?? null, message.createdAt, message.updatedAt);
    return this.getRunMessage(message.messageId)!;
  }

  getRunMessage(messageId: string): RunMessage | undefined {
    const row = this.q("SELECT * FROM run_messages WHERE message_id=?").get(messageId) as Record<string, unknown> | undefined;
    return row ? this.rowToRunMessage(row) : undefined;
  }

  listRunMessages(chatId: string): RunMessage[] {
    return (this.q("SELECT * FROM run_messages WHERE chat_id=? ORDER BY created_at,message_id").all(chatId) as Record<string, unknown>[])
      .map(row => this.rowToRunMessage(row));
  }

  listRunSteers(runId: string): RunMessage[] {
    return (this.q("SELECT * FROM run_messages WHERE target_run_id=? AND mode='steer' AND status='delivered' ORDER BY created_at,message_id").all(runId) as Record<string, unknown>[])
      .map(row => this.rowToRunMessage(row));
  }

  pendingRunMessageChats(): string[] {
    return (this.q("SELECT DISTINCT chat_id FROM run_messages WHERE status IN ('accepted','delivering','needs_attention')").all() as { chat_id: string }[])
      .map(row => row.chat_id);
  }

  pendingRunMessageCount(chatId: string): number {
    return (this.q("SELECT count(*) AS count FROM run_messages WHERE chat_id=? AND status IN ('accepted','delivering','needs_attention')")
      .get(chatId) as { count: number }).count;
  }

  cancelPendingRunMessages(chatId: string): RunMessage[] {
    return (this.q(`UPDATE run_messages SET status='cancelled',error=NULL,updated_at=?
      WHERE chat_id=? AND status IN ('accepted','delivering','needs_attention')
      AND delivery_run_id NOT IN (SELECT run_id FROM runs) RETURNING *`).all(now(), chatId) as Record<string, unknown>[])
      .map(row => this.rowToRunMessage(row));
  }

  nextRunMessage(chatId: string): RunMessage | undefined {
    const row = this.q("SELECT * FROM run_messages WHERE chat_id=? AND status IN ('accepted','delivering','needs_attention') ORDER BY created_at,message_id LIMIT 1").get(chatId) as Record<string, unknown> | undefined;
    return row ? this.rowToRunMessage(row) : undefined;
  }

  updateRunMessage(messageId: string, status: RunMessage["status"], error?: string): RunMessage {
    this.q("UPDATE run_messages SET status=?,error=?,updated_at=? WHERE message_id=?").run(status, error ?? null, now(), messageId);
    const message = this.getRunMessage(messageId);
    if (!message) throw new AuxError("not_found", "Conversation message not found.");
    return message;
  }

  listConversations(limit = 40, options: { workspaceId?: string; before?: { updatedAt: number; chatId: string }; query?: string; archived?: boolean } = {}): ConversationSummary[] {
    const where = ["c.archived=?"];
    const values: (string | number)[] = [options.archived ? 1 : 0];
    if (options.workspaceId !== undefined) {
      where.push("EXISTS (SELECT 1 FROM kv scope WHERE scope.key='setting:conversationWorkspace:'||c.chat_id AND scope.value=?)");
      values.push(J(options.workspaceId));
    }
    if (options.query?.trim()) {
      where.push(`(instr(lower(c.title),lower(?))>0 OR EXISTS (
        SELECT 1 FROM runs qr WHERE coalesce(json_extract(CASE WHEN json_valid(qr.config) THEN qr.config ELSE '{}' END,'$.chatId'),qr.run_id)=c.chat_id
        AND instr(lower(qr.goal||' '||coalesce(qr.status_message,'')||' '||coalesce(json_extract(CASE WHEN json_valid(qr.result) THEN qr.result ELSE '{}' END,'$.answer'),'')),lower(?))>0))`);
      values.push(options.query.trim(), options.query.trim());
    }
    if (options.before) {
      where.push("(c.updated_at<? OR (c.updated_at=? AND c.chat_id<?))");
      values.push(options.before.updatedAt, options.before.updatedAt, options.before.chatId);
    }
    const rows = this.q(`SELECT c.*, (
      SELECT run_id FROM runs r WHERE coalesce(json_extract(CASE WHEN json_valid(r.config) THEN r.config ELSE '{}' END,'$.chatId'),r.run_id)=c.chat_id
      ORDER BY created_at DESC,run_id DESC LIMIT 1) latest_run_id,
      (SELECT count(*) FROM runs r WHERE coalesce(json_extract(CASE WHEN json_valid(r.config) THEN r.config ELSE '{}' END,'$.chatId'),r.run_id)=c.chat_id) turn_count
      FROM conversations c WHERE ${where.join(" AND ")} ORDER BY c.updated_at DESC,c.chat_id DESC LIMIT ?`).all(...values, limit) as any[];
    return rows.flatMap(row => {
      const latestRun = this.getRun(row.latest_run_id);
      return latestRun ? [{ chatId: row.chat_id, taskId: latestRun.config?.taskId ?? this.taskForConversation(row.chat_id), title: row.title, archived: !!row.archived, createdAt: row.created_at, updatedAt: row.updated_at, turnCount: row.turn_count, latestRun }] : [];
    });
  }

  preparedConversations(): {chatId:string;title:string;attachmentCount:number;updatedAt:number}[] {
    // Only metadata is read: unsent snapshots must not disappear because there is no run yet.
    return this.q(`WITH snapshots AS (
      SELECT substr(kv.key,length('setting:conversationAttachments:')+1) chat_id, item.value snapshot
      FROM kv, json_each(CASE WHEN json_valid(kv.value) THEN kv.value ELSE '[]' END) item
      WHERE kv.key LIKE 'setting:conversationAttachments:%'
      UNION ALL
      SELECT substr(kv.key,length('setting:conversationImages:')+1), item.value
      FROM kv, json_each(CASE WHEN json_valid(kv.value) THEN kv.value ELSE '[]' END) item
      WHERE kv.key LIKE 'setting:conversationImages:%'
    ), visible AS (
      SELECT chat_id,json_extract(snapshot,'$.filename') filename,
        coalesce(json_extract(snapshot,'$.createdAt'),0) created_at FROM snapshots
      WHERE json_valid(snapshot) AND json_type(snapshot,'$.filename')='text'
        AND coalesce(json_extract(snapshot,'$.removed'),0)=0
    ) SELECT chat_id AS chatId, min(filename) AS title, count(*) AS attachmentCount, max(created_at) AS updatedAt
      FROM visible WHERE NOT EXISTS (
        SELECT 1 FROM runs r WHERE coalesce(json_extract(CASE WHEN json_valid(r.config) THEN r.config ELSE '{}' END,'$.chatId'),r.run_id)=visible.chat_id
      ) GROUP BY chat_id ORDER BY updatedAt DESC,chat_id DESC`).all() as {chatId:string;title:string;attachmentCount:number;updatedAt:number}[];
  }

  getConversation(chatId: string): ConversationSummary | undefined {
    return this.listConversationById(chatId);
  }
  taskForConversation(chatId: string): string | undefined {
    return (this.q("SELECT task_id FROM tasks WHERE json_extract(json,'$.conversationId')=? LIMIT 1").get(chatId) as { task_id: string } | undefined)?.task_id;
  }

  private listConversationById(chatId: string): ConversationSummary | undefined {
    const row = this.q("SELECT * FROM conversations WHERE chat_id=?").get(chatId) as any;
    if (!row) return undefined;
    const turns = this.listRuns(500, { chatId });
    const latestRun = turns[0];
    return latestRun ? { chatId, taskId: latestRun.config?.taskId ?? this.taskForConversation(row.chat_id), title: row.title, archived: !!row.archived, createdAt: row.created_at, updatedAt: row.updated_at, turnCount: turns.length, latestRun } : undefined;
  }

  renameConversation(chatId: string, title: string): ConversationSummary | undefined {
    this.q("UPDATE conversations SET title=? WHERE chat_id=?").run(title, chatId);
    return this.listConversationById(chatId);
  }

  archiveConversation(chatId: string, archived: boolean): ConversationSummary | undefined {
    this.q("UPDATE conversations SET archived=? WHERE chat_id=?").run(archived ? 1 : 0, chatId);
    return this.listConversationById(chatId);
  }

  conversationRuns(chatId: string): Run[] {
    return (this.q(`SELECT * FROM runs WHERE coalesce(json_extract(CASE WHEN json_valid(config) THEN config ELSE '{}' END,'$.chatId'),run_id)=? ORDER BY created_at DESC,run_id DESC`).all(chatId) as any[]).map(row => this.rowToRun(row));
  }

  deleteConversation(chatId: string): { deletedRuns: number; artifactPaths: string[] } {
    const owned = `SELECT run_id FROM runs WHERE coalesce(json_extract(CASE WHEN json_valid(config) THEN config ELSE '{}' END,'$.chatId'),run_id)=?`;
    const runIds = (this.q(owned).all(chatId) as {run_id:string}[]).map(row => row.run_id);
    if (!runIds.length) return { deletedRuns: 0, artifactPaths: [] };
    const artifactPaths = (this.q(`SELECT path FROM artifacts WHERE run_id IN (${owned})`).all(chatId) as { path: string }[]).map(row => row.path);
    const images = this.getSetting<{artifactId:string}[]>(`conversationImages:${chatId}`) ?? [];
    for (const image of images) { const artifact=this.getArtifact(image.artifactId); if(artifact)artifactPaths.push(artifact.path); }
    this.transaction(() => {
      for (const image of images) this.q("DELETE FROM artifacts WHERE artifact_id=?").run(image.artifactId);
      this.q("DELETE FROM kv WHERE key=?").run(`setting:conversationImages:${chatId}`);
      this.q(`DELETE FROM operation_reconciliations WHERE invocation_id IN (SELECT invocation_id FROM operation_invocations WHERE run_id IN (${owned}))`).run(chatId);
      for (const table of ["action_intents", "operation_invocations", "response_metadata", "datasets", "spans", "events", "model_calls", "artifacts", "results", "steps"])
        this.q(`DELETE FROM ${table} WHERE run_id IN (${owned})`).run(chatId);
      for (const runId of runIds) {
        const prefix = `ckpt:run:${runId}:`.replace(/[\\%_]/g, "\\$&");
        this.q("DELETE FROM kv WHERE key LIKE ? ESCAPE '\\'").run(`${prefix}%`);
      }
      for (const key of ["conversationContext", "conversationAttachments", "conversationArtifacts", "conversationWorkspace"])
        this.q("DELETE FROM kv WHERE key=?").run(`setting:${key}:${chatId}`);
      this.q(`DELETE FROM runs WHERE run_id IN (${owned})`).run(chatId);
      this.q("DELETE FROM conversations WHERE chat_id=?").run(chatId);
    });
    return { deletedRuns: runIds.length, artifactPaths };
  }
  private rowToRun(r: any): Run {
    return {
      runId: r.run_id, goal: r.goal, status: r.status, pageIds: P(r.page_ids, []),
      setId: r.set_id ?? undefined, config: P(r.config, undefined as never),
      statusMessage: r.status_message ?? undefined, result: P(r.result, undefined as never),
      error: r.error ?? undefined, failure: P(r.failure, undefined as never), startedAt: r.started_at ?? undefined, endedAt: r.ended_at ?? undefined,
      createdAt: r.created_at,
    };
  }
  saveStep(s: StepRecord) {
    this.q(
        `INSERT INTO steps(step_id,run_id,page_id,op,inputs,expected,outcome,started_at) VALUES(?,?,?,?,?,?,?,?)
         ON CONFLICT(step_id) DO UPDATE SET outcome=excluded.outcome`,
      )
      .run(s.stepId, s.runId, s.pageId ?? null, s.op, s.inputs ? J(s.inputs) : null, s.expected ?? null, s.outcome ? J(s.outcome) : null, s.startedAt);
  }
  private stepFromRow(r: Record<string, unknown>): StepRecord {
    return {
      stepId: r.step_id as string, runId: r.run_id as string, pageId: (r.page_id as string | null) ?? undefined, op: r.op as string,
      inputs: P(r.inputs as string | null, undefined as never), expected: (r.expected as string | null) ?? undefined,
      outcome: P(r.outcome as string | null, undefined as never), startedAt: r.started_at as number,
    };
  }
  listSteps(runId: string): StepRecord[] {
    this.flush();
    return (this.q("SELECT * FROM steps WHERE run_id=? ORDER BY started_at").all(runId) as Record<string, unknown>[]).map(r => this.stepFromRow(r));
  }
  listStepsByOpForRuns(runIds: readonly string[], op: string): StepRecord[] {
    if (!runIds.length) return [];
    this.flush();
    return (this.q("SELECT * FROM steps WHERE op=? AND run_id IN (SELECT value FROM json_each(?)) ORDER BY started_at,step_id")
      .all(op, J(runIds)) as Record<string, unknown>[]).map(r => this.stepFromRow(r));
  }
  saveResult(r: ResultRecord) {
    this.q(
        `INSERT INTO results(result_id,run_id,member_id,page_id,source_url,values_json,evidence,observed_at,status,error)
         VALUES(?,?,?,?,?,?,?,?,?,?)
         ON CONFLICT(result_id) DO UPDATE SET values_json=excluded.values_json,evidence=excluded.evidence,status=excluded.status,error=excluded.error`,
      )
      .run(r.resultId, r.runId ?? null, r.memberId ?? null, r.pageId ?? null, r.sourceUrl, J(r.values), r.evidence ? J(r.evidence) : null, r.observedAt, r.status, r.error ?? null);
  }
  getResult(resultId: string): ResultRecord | undefined {
    const r = this.q("SELECT * FROM results WHERE result_id=?").get(resultId) as any;
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
    return (this.q(sql).all(...(args as never[])) as any[]).map((r) => this.rowToResult(r));
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
    this.q("INSERT INTO observations(observation_id,page_id,epoch,revision,observed_at,scope,json) VALUES(?,?,?,?,?,?,?)")
      .run(o.observationId, o.pageId, o.epoch, o.revision, o.observedAt, o.scope, o.json);
    // revisions only grow per page: keep the last 20 with an index range delete
    this.q("DELETE FROM observations WHERE page_id=? AND revision<=?").run(o.pageId, o.revision - 20);
  }
  latestObservation(pageId: string): { revision: number; epoch: number; json: string } | undefined {
    this.flush();
    return this.q("SELECT revision,epoch,json FROM observations WHERE page_id=? ORDER BY revision DESC LIMIT 1")
      .get(pageId) as { revision: number; epoch: number; json: string } | undefined;
  }
  observationAt(pageId: string, revision: number): string | undefined {
    this.flush();
    const r = this.q("SELECT json FROM observations WHERE page_id=? AND revision<=? ORDER BY revision DESC LIMIT 1")
      .get(pageId, revision) as { json: string } | undefined;
    return r?.json;
  }

  // ---- programs ----
  saveProgram(p: SavedProgram) {
    this.q(
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
    const r = this.q("SELECT * FROM programs WHERE program_id=?").get(programId) as any;
    return r ? this.rowToProgram(r) : undefined;
  }
  listPrograms(): SavedProgram[] {
    return (this.q("SELECT * FROM programs ORDER BY created_at DESC").all() as any[]).map((r) => this.rowToProgram(r));
  }
  deleteProgram(programId: string) {
    this.q("DELETE FROM programs WHERE program_id=?").run(programId);
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
    this.q("INSERT INTO artifacts(artifact_id,run_id,page_id,path,media_type,size,status,created_at) VALUES(?,?,?,?,?,?,?,?)")
      .run(a.artifactId, a.runId ?? null, a.pageId ?? null, a.path, a.mediaType, a.size, a.status, a.createdAt);
  }
  getArtifact(artifactId: string): Artifact | undefined {
    const r = this.q("SELECT * FROM artifacts WHERE artifact_id=?").get(artifactId) as any;
    return r ? this.rowToArtifact(r) : undefined;
  }
  listArtifacts(filter: { runId?: string; pageId?: string }): Artifact[] {
    let sql = "SELECT * FROM artifacts WHERE 1=1";
    const args: string[] = [];
    if (filter.runId) { sql += " AND run_id=?"; args.push(filter.runId); }
    if (filter.pageId) { sql += " AND page_id=?"; args.push(filter.pageId); }
    return (this.q(sql + " ORDER BY created_at").all(...args) as any[]).map((r) => this.rowToArtifact(r));
  }
  private rowToArtifact(r: any): Artifact {
    return { artifactId: r.artifact_id, runId: r.run_id ?? undefined, pageId: r.page_id ?? undefined, path: r.path, mediaType: r.media_type, size: r.size, status: r.status, createdAt: r.created_at };
  }
  saveModelCall(c: ModelCall) {
    this.q(
        `INSERT INTO model_calls(call_id,run_id,role,model_id,provider_metadata,duration_ms,input_tokens,output_tokens,cost_usd,cost_estimated,error,created_at)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(c.callId, c.runId ?? null, c.role, c.modelId, c.providerMetadata ? J(c.providerMetadata) : null, c.durationMs, c.inputTokens ?? null, c.outputTokens ?? null, c.costUsd ?? null, c.costEstimated ? 1 : 0, c.error ?? null, c.createdAt);
  }
  listModelCalls(runId: string): ModelCall[] {
    return (this.q("SELECT * FROM model_calls WHERE run_id=? ORDER BY created_at").all(runId) as any[]).map((r) => ({
      callId: r.call_id, runId: r.run_id ?? undefined, role: r.role, modelId: r.model_id,
      providerMetadata: P(r.provider_metadata, undefined as never), durationMs: r.duration_ms,
      inputTokens: r.input_tokens ?? undefined, outputTokens: r.output_tokens ?? undefined,
      costUsd: r.cost_usd ?? undefined, costEstimated: !!r.cost_estimated, error: r.error ?? undefined,
      createdAt: r.created_at,
    }));
  }

  // ---- events ----
  appendEvent(e: Omit<AuxEvent, "seq">): number {
    const info = this.q("INSERT INTO events(run_id,type,payload,ts) VALUES(?,?,?,?)")
      .run(e.runId ?? null, e.type, J(e.payload), e.ts);
    const seq = Number(info.lastInsertRowid);
    if (seq % 64 === 0) this.pruneEvents();
    return seq;
  }
  /** Deferred append with a caller-assigned seq (the EventBus numbers events in memory). */
  queueEvent(e: AuxEvent) {
    this.defer(`event:${e.seq}`, () => {
      this.q("INSERT INTO events(seq,run_id,type,payload,ts) VALUES(?,?,?,?,?)").run(e.seq, e.runId ?? null, e.type, J(e.payload), e.ts);
      if (e.seq % 64 === 0) this.pruneEvents();
    });
  }
  /**
   * Age out observational rows (spans, captured response metadata, step
   * records), at most `limit` per table per call so startup never stalls on a
   * large backlog; the next start continues.
   */
  pruneRetention(maxAgeMs = 30 * 24 * 60 * 60 * 1000, limit = 5_000): number {
    const cutoff = now() - maxAgeMs;
    let removed = 0;
    for (const [table, column] of [["spans", "started_at"], ["response_metadata", "started_at"], ["steps", "started_at"]] as const)
      removed += Number(this.q(`DELETE FROM ${table} WHERE rowid IN (SELECT rowid FROM ${table} WHERE ${column}<? LIMIT ?)`).run(cutoff, limit).changes);
    return removed;
  }
  /** Drop events older than `maxAgeMs` (default 7 days, plan A22). */
  pruneEvents(maxAgeMs = 7 * 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - maxAgeMs;
    const info = this.q("DELETE FROM events WHERE ts < ?").run(cutoff);
    return Number(info.changes ?? 0);
  }
  eventsSince(sinceSeq: number, limit = 500, runId?: string): { events: AuxEvent[]; lastSeq: number } {
    this.flush();
    const rows = runId
      ? (this.q("SELECT * FROM events WHERE seq>? AND run_id=? ORDER BY seq LIMIT ?").all(sinceSeq, runId, limit) as any[])
      : (this.q("SELECT * FROM events WHERE seq>? ORDER BY seq LIMIT ?").all(sinceSeq, limit) as any[]);
    const events = rows.map((r) => ({ seq: r.seq, runId: r.run_id ?? undefined, type: r.type, payload: P(r.payload, {}), ts: r.ts }));
    return { events, lastSeq: events.length ? events[events.length - 1]!.seq : sinceSeq };
  }
  lastSeq(): number {
    this.flush();
    const r = this.q("SELECT MAX(seq) s FROM events").get() as { s: number | null };
    return r.s ?? 0;
  }

  // ---- history / bookmarks / downloads ----
  importHistory(rows: { url: string; title: string; visitedAt: number }[]) {
    return this.transaction(() => {
      const insert = this.q("INSERT OR IGNORE INTO history(url,title,page_id,visited_at) VALUES(?,?,NULL,?)");
      let added = 0;
      for (const row of rows) {
        if (!row.url || !Number.isFinite(row.visitedAt)) continue;
        added += Number(insert.run(row.url, row.title, Math.round(row.visitedAt)).changes);
      }
      return { added, skipped: rows.length - added };
    });
  }
  addHistory(url: string, title: string, pageId?: string) {
    this.q("INSERT OR REPLACE INTO history(url,title,page_id,visited_at) VALUES(?,?,?,?)").run(url, title, pageId ?? null, now());
  }
  /** A page visit: the same URL within `withinMs` updates the recent row's title instead of adding one. */
  recordVisit(url: string, title: string, pageId?: string, withinMs = 30_000) {
    const recent = this.q("UPDATE history SET title=?,page_id=coalesce(?,page_id) WHERE url=? AND visited_at>=?").run(title, pageId ?? null, url, now() - withinMs);
    if (!Number(recent.changes)) this.addHistory(url, title, pageId);
  }
  listHistory(query?: string, limit = 100, options: { since?: number; before?: { visitedAt: number; url: string } } = {}): HistoryEntry[] {
    // `filters` qualify columns explicitly so the same clauses work on the
    // bare table and the FTS join (`h.` prefix would break the former).
    const filters: string[] = [];
    const values: (string | number)[] = [];
    if (options.since !== undefined) { filters.push("visited_at >= ?"); values.push(options.since); }
    if (options.before) {
      filters.push("(visited_at < ? OR (visited_at = ? AND url < ?))");
      values.push(options.before.visitedAt, options.before.visitedAt, options.before.url);
    }
    const where = filters.length ? `AND ${filters.join(" AND ")}` : "";
    const rows: any[] = [];
    // Token-prefix FTS is the fast path for omnibox queries; a LIKE scan fills
    // the remainder so mid-token substrings ("ithub" → github) still match.
    const match = query && ftsMatch(query);
    if (match) {
      try {
        rows.push(...this.q(
          `SELECT history.* FROM history_fts JOIN history ON history.rowid = history_fts.rowid WHERE history_fts MATCH ? ${where} ORDER BY history.visited_at DESC, history.url DESC LIMIT ?`,
        ).all(match, ...values, limit) as any[]);
      } catch { /* FTS unavailable or bad query syntax — LIKE covers below */ }
    }
    if (query && rows.length < limit) {
      const seen = new Set(rows.map((r) => `${r.url}${r.visited_at}`));
      const term = `%${query.replace(/[\\%_]/g, "\\$&")}%`;
      const likeRows = this.q(
        `SELECT * FROM history WHERE (url LIKE ? ESCAPE '\\' OR title LIKE ? ESCAPE '\\') ${where} ORDER BY visited_at DESC, url DESC LIMIT ?`,
      ).all(term, term, ...values, limit + seen.size) as any[];
      for (const row of likeRows) {
        if (rows.length >= limit) break;
        const key = `${row.url}${row.visited_at}`;
        if (!seen.has(key)) { seen.add(key); rows.push(row); }
      }
      rows.sort((a, b) => b.visited_at - a.visited_at || (a.url < b.url ? -1 : 1));
    }
    if (!query) {
      rows.push(...this.q(`SELECT * FROM history WHERE 1=1 ${where} ORDER BY visited_at DESC, url DESC LIMIT ?`).all(...values, limit) as any[]);
    }
    return rows.slice(0, limit).map((r) => ({ url: r.url, title: r.title, pageId: r.page_id ?? undefined, visitedAt: r.visited_at }));
  }
  removeHistory(url: string, visitedAt: number): boolean {
    return this.q("DELETE FROM history WHERE url=? AND visited_at=?").run(url, visitedAt).changes > 0;
  }
  clearHistory(range: { since?: number; before?: number } = {}): number {
    const clauses: string[] = [];
    const values: number[] = [];
    if (range.since !== undefined) { clauses.push("visited_at >= ?"); values.push(range.since); }
    if (range.before !== undefined) { clauses.push("visited_at < ?"); values.push(range.before); }
    return Number(this.q(`DELETE FROM history ${clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""}`).run(...values).changes);
  }
  addBookmark(url: string, title: string, folderPath?: string[], readingList?: boolean) {
    this.transaction(() => {
      if (folderPath) this.createBookmarkFolder(folderPath);
      this.q(`INSERT INTO bookmarks(url,title,created_at,folder_path,reading_list) VALUES(?,?,?,?,?)
        ON CONFLICT(url) DO UPDATE SET title=excluded.title,
          folder_path=CASE WHEN ? THEN excluded.folder_path ELSE bookmarks.folder_path END,
          reading_list=CASE WHEN ? THEN excluded.reading_list ELSE bookmarks.reading_list END`)
        .run(url, title, now(), J(folderPath ?? []), readingList ? 1 : 0, folderPath === undefined ? 0 : 1, readingList === undefined ? 0 : 1);
    });
  }
  /** Toggle the reading-list flag; creates the bookmark when the URL is not saved yet. */
  setReadingList(url: string, readingList: boolean, title?: string) {
    this.transaction(() => {
      const existing = this.q("SELECT 1 FROM bookmarks WHERE url=?").get(url);
      if (!existing) {
        if (!readingList) return;
        if (title === undefined) throw new Error("A title is required to save this page to the reading list.");
        this.q("INSERT INTO bookmarks(url,title,created_at,reading_list) VALUES(?,?,?,1)").run(url, title, now());
        return;
      }
      // Leaving the list also clears read progress so a re-add starts fresh.
      this.q("UPDATE bookmarks SET reading_list=?, read_at=CASE WHEN ? THEN read_at ELSE NULL END WHERE url=?").run(readingList ? 1 : 0, readingList ? 1 : 0, url);
      if (!readingList) this.q("DELETE FROM bookmark_articles WHERE url=?").run(url);
    });
  }
  markBookmarkRead(url: string, read: boolean) {
    if (!this.q("UPDATE bookmarks SET read_at=? WHERE url=? AND reading_list=1").run(read ? now() : null, url).changes)
      throw new Error("This page is not on the reading list.");
  }
  saveBookmarkArticle(url: string, json: string) {
    this.q("INSERT INTO bookmark_articles(url,json,saved_at) VALUES(?,?,?) ON CONFLICT(url) DO UPDATE SET json=excluded.json,saved_at=excluded.saved_at").run(url, json, now());
  }
  getBookmarkArticle(url: string): { article: string; savedAt: number } | null {
    const row = this.q("SELECT json,saved_at FROM bookmark_articles WHERE url=?").get(url) as { json: string; saved_at: number } | undefined;
    return row ? { article: row.json, savedAt: row.saved_at } : null;
  }
  updateBookmark(input: { originalUrl: string; url: string; title: string; folderPath?: string[]; expected: { title: string; folderPath?: string[] } }) {
    this.transaction(() => {
      const previous = this.listBookmarks().find(item => item.url === input.originalUrl);
      if (!previous) throw new Error("This bookmark was removed. Save it again to create a new bookmark.");
      if (previous.title !== input.expected.title || J(previous.folderPath ?? []) !== J(input.expected.folderPath ?? [])) throw new Error("This bookmark changed in another window. Cancel editing and reopen it to use the latest version.");
      if (input.url !== input.originalUrl && this.q("SELECT 1 FROM bookmarks WHERE url=?").get(input.url)) throw new Error("That address is already bookmarked. Both bookmarks have been kept.");
      const folder = input.folderPath ?? previous.folderPath ?? [];
      this.createBookmarkFolder(folder);
      this.q("UPDATE bookmarks SET url=?,title=?,folder_path=? WHERE url=?").run(input.url, input.title, J(folder), input.originalUrl);
      this.q("UPDATE bookmark_articles SET url=? WHERE url=?").run(input.url, input.originalUrl);
    });
  }
  moveBookmarks(input: { bookmarks: {url:string;folderPath:string[]}[]; folderPath:string[]; createFolder?:boolean }) {
    return this.transaction(() => {
      const existing = new Map(this.listBookmarks().map(item => [item.url, item]));
      const selected = [...new Map(input.bookmarks.map(item => [item.url, item])).values()];
      for (const item of selected) {
        const current = existing.get(item.url);
        if (!current || J(current.folderPath ?? []) !== J(item.folderPath)) throw new Error("A selected bookmark was moved or removed in another window. Select the bookmarks again; nothing was moved.");
      }
      if (input.createFolder) {
        const paths = this.bookmarkFolders();
        if (!input.folderPath.length || paths.some(path => J(path) === J(input.folderPath))) throw new Error("A folder with this name already exists. Choose another name.");
        const parent = input.folderPath.slice(0, -1);
        if (parent.length && !paths.some(path => J(path) === J(parent))) throw new Error("The parent folder no longer exists. Choose another folder.");
        this.createBookmarkFolder(input.folderPath);
      }
      if (input.folderPath.length && !this.bookmarkFolders().some(path => J(path) === J(input.folderPath))) throw new Error("The destination folder no longer exists. Choose another folder.");
      const update = this.q("UPDATE bookmarks SET folder_path=? WHERE url=?");
      let moved = 0;
      for (const item of selected) if (J(item.folderPath) !== J(input.folderPath)) {
        update.run(J(input.folderPath), item.url); moved++;
      }
      return { moved };
    });
  }
  saveBookmarkFolder(name:string, bookmarks:{url:string;title:string}[]) {
    return this.transaction(() => {
      if (this.bookmarkFolders().some(path => path.length === 1 && path[0] === name)) throw new Error("A bookmark folder already has this name. Choose a different name to keep this collection separate.");
      const existing=new Set(this.listBookmarks().map(item=>item.url));
      if(bookmarks.every(item=>existing.has(item.url)))throw new Error("These pages are already bookmarked. Find them in Library to organize their folders.");
      return this.importBookmarks(bookmarks.map(item => ({...item,folderPath:[name]})),[[name]]);
    });
  }
  importBookmarks(bookmarks: { url: string; title: string; folderPath?: string[] }[], folders: string[][] = []) {
    return this.transaction(() => {
      for (const path of folders) this.createBookmarkFolder(path);
      const insert = this.q("INSERT OR IGNORE INTO bookmarks(url,title,created_at,folder_path) VALUES(?,?,?,?)");
      let added = 0;
      for (const bookmark of bookmarks) {
        this.createBookmarkFolder(bookmark.folderPath ?? []);
        added += Number(insert.run(bookmark.url, bookmark.title, now(), J(bookmark.folderPath ?? [])).changes);
      }
      return { added, skipped: bookmarks.length - added };
    });
  }
  removeBookmark(url: string) {
    this.transaction(() => {
      this.q("DELETE FROM bookmark_articles WHERE url=?").run(url);
      this.q("DELETE FROM bookmarks WHERE url=?").run(url);
    });
  }
  listBookmarks(): Bookmark[] {
    const rows = this.q("SELECT url,title,created_at,folder_path,reading_list,read_at FROM bookmarks ORDER BY created_at DESC").all() as { url: string; title: string; created_at: number; folder_path: string; reading_list: number; read_at: number | null }[];
    const offline = new Set((this.q("SELECT url FROM bookmark_articles").all() as { url: string }[]).map(row => row.url));
    return rows.map(row => ({
      url: row.url, title: row.title, createdAt: row.created_at,
      ...(row.folder_path !== "[]" ? { folderPath: JSON.parse(row.folder_path) as string[] } : {}),
      ...(row.reading_list ? { readingList: true } : {}),
      ...(row.read_at != null ? { readAt: row.read_at } : {}),
      ...(offline.has(row.url) ? { offline: true } : {}),
    }));
  }
  bookmarkFolders(): string[][] {
    const rows = this.q("SELECT path FROM bookmark_folders ORDER BY path").all() as { path: string }[];
    return rows.map(row => JSON.parse(row.path) as string[]);
  }
  createBookmarkFolder(path: string[]): string[][] {
    return this.transaction(() => {
      const insert = this.q("INSERT OR IGNORE INTO bookmark_folders(path) VALUES(?)");
      for (let depth = 1; depth <= path.length; depth++) insert.run(J(path.slice(0, depth)));
      return this.bookmarkFolders();
    });
  }
  renameBookmarkFolder(path: string[], name: string): string[][] {
    return this.transaction(() => {
      const key = J(path);
      const replacement = [...path.slice(0, -1), name];
      if (!this.q("SELECT 1 FROM bookmark_folders WHERE path=?").get(key)) throw new AuxError("not_found", "This bookmark folder no longer exists.");
      if (key === J(replacement)) return this.bookmarkFolders();
      if (this.q("SELECT 1 FROM bookmark_folders WHERE path=?").get(J(replacement))) throw new AuxError("conflict", "A folder with this name already exists here.");
      const descendants = (candidate: string[]) => candidate.length >= path.length && path.every((part, index) => candidate[index] === part);
      const updateFolder = this.q("UPDATE bookmark_folders SET path=? WHERE path=?");
      for (const folder of this.bookmarkFolders().filter(descendants)) updateFolder.run(J([...replacement, ...folder.slice(path.length)]), J(folder));
      const updateBookmark = this.q("UPDATE bookmarks SET folder_path=? WHERE url=?");
      for (const bookmark of this.listBookmarks()) {
        if (bookmark.folderPath && descendants(bookmark.folderPath)) updateBookmark.run(J([...replacement, ...bookmark.folderPath.slice(path.length)]), bookmark.url);
      }
      return this.bookmarkFolders();
    });
  }
  removeBookmarkFolder(path: string[]): string[][] {
    const descendants = (candidate: string[]) => candidate.length >= path.length && path.every((part, index) => candidate[index] === part);
    if (this.bookmarkFolders().some(folder => folder.length > path.length && descendants(folder)) || this.listBookmarks().some(bookmark => descendants(bookmark.folderPath ?? []))) {
      throw new AuxError("conflict", "Move this folder’s bookmarks and remove its subfolders before deleting it.");
    }
    this.q("DELETE FROM bookmark_folders WHERE path=?").run(J(path));
    return this.bookmarkFolders();
  }
  saveDownload(d: {
    id: string;
    sourceUrl?: string;
    pageId?: string;
    filename: string;
    path: string;
    state: string;
    size: number;
    totalBytes?: number;
    startedAt: number;
    endedAt?: number;
  }) {
    this.q(
        `INSERT INTO downloads(id,page_id,filename,path,state,size,total_bytes,started_at,ended_at) VALUES(?,?,?,?,?,?,?,?,?)
         ON CONFLICT(id) DO UPDATE SET state=excluded.state,size=excluded.size,total_bytes=excluded.total_bytes,ended_at=excluded.ended_at`,
      )
      .run(d.id, d.pageId ?? null, d.filename, d.path, d.state, d.size, d.totalBytes ?? null, d.startedAt, d.endedAt ?? null);
    if(d.sourceUrl)kvSetJson(this.db, `download-source:${d.id}`, d.sourceUrl);
  }
  /** Removes inactive history records only; downloaded files are never touched. */
  removeFinishedDownloads(ids: string[]): string[] {
    return this.transaction(() => {
      const removed: string[]=[];
      const remove=this.q("DELETE FROM downloads WHERE id=? AND state IN ('completed','cancelled','interrupted')");
      const removeSource=this.q("DELETE FROM kv WHERE key=?");
      for(const id of new Set(ids)) {
        if(remove.run(id).changes) { removeSource.run(`download-source:${id}`);removed.push(id); }
      }
      return removed;
    });
  }
  listDownloads(limit = 100): Download[] {
    return (this.q("SELECT * FROM downloads ORDER BY started_at DESC LIMIT ?").all(limit) as any[]).map((r) => ({
      id: r.id,
      sourceUrl: kvGetJson<string>(this.db, `download-source:${r.id}`) ?? undefined,
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
  hasSetting(key: string): boolean {
    return this.q("SELECT 1 FROM kv WHERE key=?").get(`setting:${key}`) !== undefined;
  }
  setSetting(key: string, value: unknown) {
    kvSetJson(this.db, `setting:${key}`, value);
  }
  deleteSetting(key: string): void {
    this.q("DELETE FROM kv WHERE key=?").run(`setting:${key}`);
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
    this.q(
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
    const r = this.q("SELECT * FROM response_metadata WHERE request_id=?").get(requestId) as any;
    return r ? this.responseRow(r) : undefined;
  }
  listResponses(pageId: string, opts?: { since?: number; urlIncludes?: string; limit?: number }) {
    const rows = this.q(
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
    this.q(
        `INSERT INTO datasets(dataset_id,run_id,page_id,source,schema_json,row_count,values_json,provenance,created_at)
         VALUES(?,?,?,?,?,?,?,?,?)
         ON CONFLICT(dataset_id) DO UPDATE SET values_json=excluded.values_json,row_count=excluded.row_count,stale=0`,
      )
      .run(d.datasetId, d.runId ?? null, d.pageId ?? null, d.source, J(d.schema ?? []), d.rows.length, J(d.rows), d.provenance ?? null, now());
  }
  getDataset(datasetId: string) {
    const r = this.q("SELECT * FROM datasets WHERE dataset_id=?").get(datasetId) as any;
    return r ? this.datasetRow(r) : undefined;
  }
  listDatasets(filter?: { runId?: string; pageId?: string }) {
    const rows = this.q(
        `SELECT * FROM datasets WHERE 1=1 ${filter?.runId ? "AND run_id=?" : ""} ${filter?.pageId ? "AND page_id=?" : ""} ORDER BY created_at DESC`,
      )
      .all(...([...(filter?.runId ? [filter.runId] : []), ...(filter?.pageId ? [filter.pageId] : [])] as any[])) as any[];
    return rows.map((r) => this.datasetRow(r));
  }
  markDatasetsStale(pageId: string) {
    this.q("UPDATE datasets SET stale=1 WHERE page_id=?").run(pageId);
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
    this.q(
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
    const r = this.q("SELECT * FROM operations WHERE site_key=? AND name=?").get(siteKey, name) as any;
    return r ? this.operationRow(r) : undefined;
  }
  getOperationById(operationId: string) {
    const r = this.q("SELECT * FROM operations WHERE operation_id=?").get(operationId) as any;
    return r ? this.operationRow(r) : undefined;
  }
  listOperations(siteKey?: string) {
    const rows = (siteKey
      ? this.q("SELECT * FROM operations WHERE site_key=? ORDER BY name").all(siteKey)
      : this.q("SELECT * FROM operations ORDER BY site_key, name").all()) as any[];
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
    this.q(
        `INSERT INTO operation_implementations(impl_id,operation_id,kind,executable,state,evidence,stats,created_at,updated_at)
         VALUES(?,?,?,?,?,?,?,?,?)
         ON CONFLICT(impl_id) DO UPDATE SET executable=excluded.executable,state=excluded.state,
           evidence=excluded.evidence,stats=excluded.stats,updated_at=excluded.updated_at`,
      )
      .run(i.implId, i.operationId, i.kind, i.executable, i.state ?? "candidate", J(i.evidence ?? []), J(i.stats ?? {}), now(), now());
  }
  setImplState(implId: string, state: string, evidence?: unknown) {
    this.q("UPDATE operation_implementations SET state=?, evidence=?, updated_at=? WHERE impl_id=?")
      .run(state, J(evidence ?? []), now(), implId);
  }
  deleteImpl(implId: string) {
    this.q("DELETE FROM operation_implementations WHERE impl_id=?").run(implId);
  }
  deleteOperation(operationId: string) {
    this.q("DELETE FROM operation_implementations WHERE operation_id=?").run(operationId);
    this.q("DELETE FROM operations WHERE operation_id=?").run(operationId);
  }
  listImplementations(operationId: string, state?: string) {
    const rows = (state
      ? this.q("SELECT * FROM operation_implementations WHERE operation_id=? AND state=? ORDER BY created_at").all(operationId, state)
      : this.q("SELECT * FROM operation_implementations WHERE operation_id=? ORDER BY created_at").all(operationId)) as any[];
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
    this.q(
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
    const row = this.q(`SELECT * FROM operation_invocations WHERE invocation_id=?`).get(invocationId) as any;
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
    this.q(`UPDATE operation_invocations SET status='interrupted', ended_at=? WHERE status='running'`)
      .run(Date.now());
  }

  findInvocationByRequest(requestKey: string, operationId: string) {
    const row = this.q(`SELECT invocation_id FROM operation_invocations WHERE request_key=? AND operation_id=?`)
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
