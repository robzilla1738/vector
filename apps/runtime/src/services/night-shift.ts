import { lineageRuns, runRoot } from "./run-lineage.js";
import { withOvernightAuthorityMutation } from "./overnight-authority.js";
import { randomUUID } from "node:crypto";
import {
  AuxError,
  DEFAULT_NIGHT_SHIFT,
  NightShiftItemSchema,
  NightShiftQueueSchema,
  NightShiftSettingsSchema,
  createClock,
  newRunId,
  type Clock,
  type NightShiftItem,
} from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import type { BudgetsService } from "./budgets.js";

type Payload = NightShiftItem["payload"];
export interface NightShiftRuntime {
  backgroundEnabled(): boolean;
  onAC(): Promise<boolean>;
  releaseActivity(): Promise<void>;
  powerActivity(reason: string, durationSec: number): Promise<{ active: boolean }>;
  start(payload: Payload, item: NightShiftItem, reservedRunId: string): Promise<string>;
  cancel(runId: string, reason: string): void | Promise<void>;
  resume(runId: string): Promise<void>;
  consolidate(workspaceId: string): Promise<unknown>;
  reindex(workspaceId: string): Promise<unknown>;
}

/** A bounded local-calendar window, including midnight-crossing windows. */
export function nightWindow(now: number, start: string, end: string) {
  const date = new Date(now);
  const minutes = date.getHours() * 60 + date.getMinutes();
  const parse = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
  const a = parse(start),
    b = parse(end),
    crossing = a > b;
  const inside = crossing ? minutes >= a || minutes < b : minutes >= a && minutes < b;
  const windowStart = new Date(now);
  if (crossing && minutes < b) windowStart.setDate(windowStart.getDate() - 1);
  windowStart.setHours(Math.floor(a / 60), a % 60, 0, 0);
  const windowEnd = new Date(windowStart);
  if (crossing) windowEnd.setDate(windowEnd.getDate() + 1);
  windowEnd.setHours(Math.floor(b / 60), b % 60, 0, 0);
  const windowDate = `${windowStart.getFullYear()}-${String(windowStart.getMonth() + 1).padStart(2, "0")}-${String(windowStart.getDate()).padStart(2, "0")}`;
  return { inside, windowDate, start: windowStart.getTime(), end: windowEnd.getTime() };
}

export class NightShiftService {
  private ticking = false;
  private closed = false;
  constructor(
    private readonly repo: Repo,
    private readonly runtime: NightShiftRuntime,
    private readonly budgets: BudgetsService,
    private readonly clock: Clock = createClock(),
  ) {
    repo.db
      .exec(`CREATE TABLE IF NOT EXISTS night_queue(id TEXT PRIMARY KEY,kind TEXT NOT NULL,payload TEXT NOT NULL,
      budget_usd REAL NOT NULL,status TEXT NOT NULL,created_by TEXT NOT NULL,created_at INTEGER NOT NULL,
      run_id TEXT,window_date TEXT,window_start INTEGER,window_end INTEGER,foreground INTEGER NOT NULL DEFAULT 0)`);
    repo.db
      .prepare(
        "UPDATE night_queue SET status='needs_review' WHERE status='running' AND (run_id IS NULL OR run_id NOT IN (SELECT run_id FROM runs))",
      )
      .run();
  }
  settings() {
    return NightShiftSettingsSchema.parse(this.repo.getSetting("nightShift") ?? DEFAULT_NIGHT_SHIFT);
  }
  summary() {
    const settings = this.settings();
    const window = nightWindow(this.clock.now(), settings.start, settings.end);
    const items = this.list().filter((item) => item.windowDate === window.windowDate);
    const ledger = { spent: this.spentWindow(window.windowDate) };
    return {
      windowDate: window.windowDate,
      done: items.filter((item) => item.status === "done").length,
      needsReview: items.filter((item) => ["parked", "needs_review"].includes(item.status)).length,
      spentUsd: ledger.spent,
      limitUsd: settings.nightlyUsd,
      costComplete: this.windowCostComplete(window.windowDate),
    };
  }
  private spentTree(runId: string) {
    return lineageRuns(this.repo, runId).reduce((sum, id) => sum + this.budgets.spentRunUsd(id), 0);
  }
  private spentWindow(windowDate: string) {
    const roots = this.repo.db
      .prepare("SELECT run_id FROM night_queue WHERE window_date=? AND run_id IS NOT NULL")
      .all(windowDate) as { run_id: string }[];
    const ids = new Set(roots.flatMap((row) => lineageRuns(this.repo, row.run_id)));
    return [...ids].reduce((sum, id) => sum + this.budgets.spentRunUsd(id), 0);
  }
  private windowCostComplete(windowDate: string) {
    const roots = this.repo.db
      .prepare("SELECT run_id FROM night_queue WHERE window_date=? AND run_id IS NOT NULL")
      .all(windowDate) as { run_id: string }[];
    const ids = new Set(roots.flatMap((row) => lineageRuns(this.repo, row.run_id)));
    return [...ids].every((id) => this.budgets.runCostComplete(id));
  }
  private read(row: Record<string, unknown>): NightShiftItem {
    if (!this.repo.columnCipher)
      throw new AuxError("backend_unavailable", "Night shift requires protected Profile storage.");
    return NightShiftItemSchema.parse({
      id: row.id,
      payload: JSON.parse(
        this.repo.columnCipher.decrypt(
          "night_queue",
          JSON.stringify([row.id]),
          "payload",
          String(row.payload),
        ),
      ),
      budgetUsd: row.budget_usd,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      ...(row.run_id ? { runId: row.run_id } : {}),
      ...(row.window_date ? { windowDate: row.window_date } : {}),
    });
  }
  list() {
    return (
      this.repo.db.prepare("SELECT * FROM night_queue ORDER BY created_at,id LIMIT 1000").all() as Record<
        string,
        unknown
      >[]
    ).map((row) => this.read(row));
  }
  get(id: string) {
    const row = this.repo.db.prepare("SELECT * FROM night_queue WHERE id=?").get(id) as
      Record<string, unknown> | undefined;
    if (!row) throw new AuxError("not_found", "Overnight item is unavailable.");
    return this.read(row);
  }
  private add(input: unknown, person: boolean) {
    const parsed = NightShiftQueueSchema.parse(input),
      settings = this.settings();
    if (!this.repo.columnCipher)
      throw new AuxError("backend_unavailable", "Night shift requires protected Profile storage.");
    if (parsed.budgetUsd > settings.perTaskUsd)
      throw new AuxError("permission_denied", "This item exceeds the per-task night budget.");
    if (this.list().length >= 1000)
      throw new AuxError("conflict", "Review the overnight inbox before adding more items.");
    const id = randomUUID();
    const payload = this.repo.columnCipher.encrypt(
      "night_queue",
      JSON.stringify([id]),
      "payload",
      JSON.stringify(parsed.payload),
    );
    this.repo.db
      .prepare(
        "INSERT INTO night_queue(id,kind,payload,budget_usd,status,created_by,created_at) VALUES(?,?,?,?,?,?,?)",
      )
      .run(
        id,
        parsed.payload.kind,
        payload,
        parsed.budgetUsd,
        person ? "queued" : "proposed",
        person ? "person" : "agent",
        this.clock.now(),
      );
    return this.get(id);
  }
  propose(input: unknown) {
    return this.add(input, false);
  }
  queue(input: unknown) {
    return this.add(input, true);
  }
  async review(id: string, decision: "approve" | "discard" | "apply") {
    const item = this.get(id);
    if (decision === "discard") {
      await withOvernightAuthorityMutation(
        this.repo,
        async () => {
          if (item.runId && ["running", "parked", "needs_review"].includes(item.status))
            await this.runtime.cancel(item.runId, "Discarded by the person.");
          this.repo.db.prepare("UPDATE night_queue SET status='discarded' WHERE id=?").run(id);
        },
        item.runId,
      );
    } else if (decision === "approve") {
      if (item.status !== "proposed") throw new AuxError("conflict", "Only proposed items can be queued.");
      if (item.budgetUsd > this.settings().perTaskUsd)
        throw new AuxError("permission_denied", "Review the current per-task budget first.");
      this.repo.db
        .prepare(
          "UPDATE night_queue SET status='queued',created_by='person' WHERE id=? AND status='proposed'",
        )
        .run(id);
    } else {
      if (item.status !== "needs_review" || !item.runId)
        throw new AuxError("conflict", "This item has no parked action to apply.");
      // The actual suspension still requires the normal foreground approval.
      await this.runtime.resume(item.runId);
      this.repo.db
        .prepare("UPDATE night_queue SET foreground=1 WHERE id=? AND status='needs_review'")
        .run(id);
    }
    return this.get(id);
  }
  effectAuthority(runId: string): { windowEnd: number; requireAC: boolean } {
    this.assertRun(runId);
    const row = this.repo.db
      .prepare("SELECT window_end FROM night_queue WHERE run_id=? AND foreground=0")
      .get(runId) as { window_end: number } | undefined;
    if (!row) throw new AuxError("permission_denied", "This overnight run has no exact claimed window.");
    return { windowEnd: row.window_end, requireAC: this.settings().requireAC };
  }
  async assertDispatch(runId: string) {
    runId = runRoot(this.repo, runId, true);
    const row = this.repo.db.prepare("SELECT * FROM night_queue WHERE run_id=?").get(runId) as
      Record<string, unknown> | undefined;
    if (!row || row.foreground === 1) return;
    const onAC = await this.runtime.onAC();
    this.assertRun(runId);
    if (this.settings().requireAC && !onAC)
      throw new AuxError("permission_denied", "Night shift paused because AC power is unavailable.");
  }

  budgetStatus(runId: string) {
    runId = runRoot(this.repo, runId);
    const row = this.repo.db.prepare("SELECT * FROM night_queue WHERE run_id=?").get(runId) as
      Record<string, unknown> | undefined;
    if (!row || row.foreground === 1) return [];
    const item = this.read(row),
      settings = this.settings();
    const nightly = { spent: this.spentWindow(String(row.window_date)) };
    return [
      {
        scope: "nightShift" as const,
        scopeId: item.id,
        limitUsd: Math.min(item.budgetUsd, settings.perTaskUsd),
        spentUsd: this.spentTree(runId),
      },
      {
        scope: "nightShift" as const,
        scopeId: String(row.window_date),
        limitUsd: settings.nightlyUsd,
        spentUsd: nightly.spent,
      },
    ].map((status) => ({
      ...status,
      remainingUsd: Math.max(0, status.limitUsd - status.spentUsd),
      exceeded: status.spentUsd >= status.limitUsd,
    }));
  }

  /** Invoked before every model call through BudgetsService's nightShift scope. */
  assertRun(runId: string) {
    runId = runRoot(this.repo, runId, true);
    const row = this.repo.db.prepare("SELECT * FROM night_queue WHERE run_id=?").get(runId) as
      Record<string, unknown> | undefined;
    if (!row || row.foreground === 1) return;
    const item = this.read(row),
      settings = this.settings();
    if (
      !settings.enabled ||
      !this.runtime.backgroundEnabled() ||
      this.clock.now() >= Number(row.window_end) ||
      !nightWindow(this.clock.now(), settings.start, settings.end).inside ||
      item.createdBy !== "person" ||
      item.status !== "running"
    )
      throw new AuxError("permission_denied", "The overnight window is closed or this run needs review.");
    if (!this.windowCostComplete(String(row.window_date)))
      throw new AuxError(
        "permission_denied",
        "Night shift needs review because a model call has unresolved cost.",
        { scope: "nightShift" },
      );
    const spent = this.spentTree(runId);
    const total = { spent: this.spentWindow(String(row.window_date)) };
    if (spent >= Math.min(item.budgetUsd, settings.perTaskUsd) || total.spent >= settings.nightlyUsd)
      throw new AuxError("permission_denied", "The overnight budget is exhausted.", { scope: "nightShift" });
  }
  private async reconcile(now: number) {
    const rows = this.repo.db
      .prepare(
        "SELECT * FROM night_queue WHERE status IN ('running','parked') OR (status='needs_review' AND foreground=1)",
      )
      .all() as Record<string, unknown>[];
    for (const row of rows) {
      const item = this.read(row),
        run = item.runId ? this.repo.getRun(item.runId) : undefined;
      let status: NightShiftItem["status"] | undefined;
      let cancelForWindow = false;
      if (run?.status === "completed") status = "done";
      else if (run && ["failed", "cancelled"].includes(run.status)) status = "failed";
      else if (run?.status === "interrupted") status = "needs_review";
      else if (row.foreground !== 1 && now >= Number(row.window_end)) {
        cancelForWindow = !!item.runId && run?.status === "running";
        status = "needs_review";
      } else if (row.foreground !== 1 && (run?.status === "needs_input" || run?.status === "paused"))
        status = "parked";
      if (status)
        await withOvernightAuthorityMutation(
          this.repo,
          async () => {
            if (cancelForWindow && item.runId)
              await this.runtime.cancel(item.runId, "The overnight window closed.");
            this.repo.db.prepare("UPDATE night_queue SET status=? WHERE id=?").run(status, item.id);
          },
          item.runId,
        );
    }
  }
  async tick() {
    if (this.closed || this.ticking) return;
    this.ticking = true;
    try {
      const now = this.clock.now();
      const onAC = await this.runtime.onAC();
      await this.reconcile(now);
      const settings = this.settings(),
        window = nightWindow(now, settings.start, settings.end);
      if (!window.inside) {
        await this.parkActiveForReview("The overnight window closed.");
        await this.runtime.releaseActivity();
        return;
      }
      if (!settings.enabled || !this.runtime.backgroundEnabled() || (settings.requireAC && !onAC)) {
        await this.parkActiveForReview("Overnight settings or power changed.");
        await this.runtime.releaseActivity();
        return;
      }
      if (!this.windowCostComplete(window.windowDate)) {
        await this.parkActiveForReview(
          "A model call has unresolved cost. Review spending before more overnight work.",
        );
        await this.runtime.releaseActivity();
        return;
      }
      const active = this.repo.db
        .prepare("SELECT status,window_end FROM night_queue WHERE status IN ('running','parked') LIMIT 1")
        .get() as { status: string; window_end: number } | undefined;
      if (active) {
        if (active.status === "running" && onAC)
          await this.runtime.powerActivity(
            "Aux overnight work",
            Math.min(120, Math.max(1, Math.ceil((active.window_end - now) / 1000))),
          );
        else await this.runtime.releaseActivity();
        return;
      }
      const row = this.repo.db
        .prepare(
          "SELECT * FROM night_queue WHERE status='queued' AND created_by='person' ORDER BY created_at,id LIMIT 1",
        )
        .get() as Record<string, unknown> | undefined;
      if (!row) {
        await this.runtime.releaseActivity();
        return;
      }
      const spent = { spent: this.spentWindow(window.windowDate) };
      if (spent.spent >= settings.nightlyUsd) {
        await this.runtime.releaseActivity();
        return;
      }
      const item = this.read(row);
      if (item.budgetUsd > settings.perTaskUsd) {
        this.repo.db
          .prepare("UPDATE night_queue SET status='needs_review' WHERE id=? AND status='queued'")
          .run(item.id);
        await this.runtime.releaseActivity();
        return;
      }
      const activity = onAC
        ? await this.runtime.powerActivity(
            "Aux overnight work",
            Math.min(120, Math.max(1, Math.ceil((window.end - now) / 1000))),
          )
        : { active: false };
      if (
        (onAC && !activity.active) ||
        this.closed ||
        !nightWindow(this.clock.now(), settings.start, settings.end).inside
      ) {
        await this.runtime.releaseActivity();
        return;
      }
      const claimed = this.repo.db
        .prepare(
          "UPDATE night_queue SET status='running',window_date=?,window_start=?,window_end=? WHERE id=? AND status='queued' AND created_by='person'",
        )
        .run(window.windowDate, window.start, window.end, item.id);
      if (claimed.changes !== 1) {
        await this.runtime.releaseActivity();
        return;
      }
      try {
        if (item.payload.kind === "memory.consolidate" || item.payload.kind === "memory.reindex") {
          await (item.payload.kind === "memory.consolidate"
            ? this.runtime.consolidate(item.payload.workspaceId)
            : this.runtime.reindex(item.payload.workspaceId));
          this.repo.db
            .prepare("UPDATE night_queue SET status=? WHERE id=? AND status='running'")
            .run(this.closed || this.clock.now() >= window.end ? "needs_review" : "done", item.id);
          await this.runtime.releaseActivity();
        } else {
          const reservedRunId = newRunId();
          this.repo.db
            .prepare("UPDATE night_queue SET run_id=? WHERE id=? AND status='running'")
            .run(reservedRunId, item.id);
          await this.assertDispatch(reservedRunId);
          const runId = await this.runtime.start(
            item.payload,
            { ...item, status: "running", windowDate: window.windowDate },
            reservedRunId,
          );
          if (this.closed || this.clock.now() >= window.end) {
            await withOvernightAuthorityMutation(
              this.repo,
              async () => {
                await this.runtime.cancel(runId, "The overnight window closed during launch.");
                this.repo.db.prepare("UPDATE night_queue SET status='needs_review' WHERE id=?").run(item.id);
              },
              reservedRunId,
            );
          }
          if (runId !== reservedRunId) {
            await withOvernightAuthorityMutation(this.repo, async () => {
              await this.runtime.cancel(runId, "The overnight run identity changed during launch.");
              await this.runtime.cancel(reservedRunId, "The overnight run identity changed during launch.");
            });
            throw new AuxError("conflict", "The overnight run identity changed during launch.");
          }
        }
      } catch {
        await withOvernightAuthorityMutation(
          this.repo,
          async () => {
            this.repo.db
              .prepare("UPDATE night_queue SET status='failed' WHERE id=? AND status='running'")
              .run(item.id);
          },
          this.get(item.id).runId,
        );
        await this.runtime.releaseActivity();
      }
    } finally {
      this.ticking = false;
    }
  }
  private async parkActiveForReview(reason: string) {
    const rows = this.repo.db
      .prepare("SELECT id,run_id,status FROM night_queue WHERE status IN ('running','parked')")
      .all() as { id: string; run_id: string | null; status: string }[];
    for (const row of rows) {
      // A real pending approval remains parked for person-present Apply.
      await withOvernightAuthorityMutation(
        this.repo,
        async () => {
          if (row.run_id && row.status === "running") await this.runtime.cancel(row.run_id, reason);
          this.repo.db
            .prepare(
              "UPDATE night_queue SET status='needs_review' WHERE id=? AND status IN ('running','parked')",
            )
            .run(row.id);
        },
        row.run_id ?? undefined,
      );
    }
  }
  async close() {
    this.closed = true;
    for (const item of this.list())
      if (["running", "parked"].includes(item.status)) {
        await withOvernightAuthorityMutation(
          this.repo,
          async () => {
            if (item.runId) await this.runtime.cancel(item.runId, "Night shift stopped in this Profile.");
            this.repo.db.prepare("UPDATE night_queue SET status='needs_review' WHERE id=?").run(item.id);
          },
          item.runId,
        );
      }
    await this.runtime.releaseActivity();
  }
}
