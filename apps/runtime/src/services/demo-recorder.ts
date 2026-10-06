import { randomUUID } from "node:crypto";
import { AuxError, DemonstrationSchema, DemonstrationStepSchema, type Demonstration } from "@aux/contracts";
import type { RecorderObserver } from "@aux/chromium-driver";
import type { Repo } from "../store/repo.js";

export interface RecorderPage {
  attached: boolean;
  ownedByRuntime: boolean;
  sessionId?: string;
  url: string;
  controller?: string;
}

function safeCaptureUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      ![...url.searchParams.keys()].some((key) =>
        /password|passwd|token|secret|credential|api.?key|authorization|session|otp|code/i.test(key),
      ) &&
      !/(?:password|token|secret|credential|api.?key|authorization|session|otp|code)=/i.test(url.hash)
    );
  } catch {
    return false;
  }
}

export class DemoRecorder {
  private closed = false;
  private starting = new Set<string>();
  private failures = new Map<string, unknown>();
  private active = new Map<string, { demo: Demonstration; observer: RecorderObserver; sessionId: string }>();
  constructor(
    private readonly repo: Repo,
    private readonly page: (id: string) => RecorderPage,
    private readonly attach: (id: string) => Promise<RecorderObserver>,
    private readonly emit: (demo: Demonstration, failure?: unknown) => void,
    private readonly now: () => number = Date.now,
  ) {
    repo.db.exec(
      "CREATE TABLE IF NOT EXISTS demonstrations(id TEXT PRIMARY KEY,page_id TEXT NOT NULL,state TEXT NOT NULL,payload TEXT NOT NULL,started_at INTEGER NOT NULL)",
    );
  }
  private save(demo: Demonstration) {
    if (!this.repo.columnCipher)
      throw new AuxError("backend_unavailable", "Recording requires protected Profile storage.");
    const payload = this.repo.columnCipher.encrypt(
      "demonstrations",
      JSON.stringify([demo.id]),
      "payload",
      JSON.stringify(demo),
    );
    this.repo.db
      .prepare(
        "INSERT INTO demonstrations VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state,payload=excluded.payload",
      )
      .run(demo.id, demo.pageId, demo.state, payload, demo.startedAt);
    this.emit(DemonstrationSchema.parse(demo));
  }
  get(id: string): Demonstration {
    const row = this.repo.db.prepare("SELECT payload FROM demonstrations WHERE id=?").get(id) as
      { payload: string } | undefined;
    if (!row || !this.repo.columnCipher) throw new AuxError("not_found", "Recording is unavailable.");
    return DemonstrationSchema.parse(
      JSON.parse(
        this.repo.columnCipher.decrypt("demonstrations", JSON.stringify([id]), "payload", row.payload),
      ),
    );
  }
  async start(pageId: string) {
    if (this.closed) throw new AuxError("feature_unavailable", "Recording stopped in this Profile.");
    if (!this.repo.columnCipher)
      throw new AuxError("backend_unavailable", "Recording requires protected Profile storage.");
    const initial = this.page(pageId);
    if (!safeCaptureUrl(initial.url))
      throw new AuxError(
        "permission_denied",
        "Recording cannot include credentials or secret URL parameters.",
      );
    if (
      !initial.attached ||
      initial.ownedByRuntime ||
      ["agent", "external"].includes(initial.controller ?? "") ||
      !initial.sessionId ||
      !/^https?:\/\//.test(initial.url)
    )
      throw new AuxError("conflict", "Choose an attached browser tab to record.");
    if (this.starting.size || this.active.size)
      throw new AuxError("conflict", "This tab is already recording.");
    this.starting.add(pageId);
    let observer: RecorderObserver;
    try {
      observer = await this.attach(pageId);
    } catch (error) {
      this.starting.delete(pageId);
      throw error;
    }
    const demo: Demonstration = {
      id: randomUUID(),
      pageId,
      state: "recording",
      steps: [{ kind: "navigate", url: initial.url }],
      startedAt: this.now(),
    };
    const item = { demo, observer, sessionId: initial.sessionId };
    const current = () => {
      try {
        const page = this.page(pageId);
        return (
          !this.closed &&
          page.attached &&
          page.sessionId === item.sessionId &&
          !page.ownedByRuntime &&
          !["agent", "external"].includes(page.controller ?? "")
        );
      } catch {
        return false;
      }
    };
    let armed = false;
    let startupFault: unknown;
    let failedDuringStartup = false;
    const append = (raw: unknown) => {
      if (!armed || !current() || demo.state !== "recording") return;
      const parsed = DemonstrationStepSchema.safeParse(raw);
      if (!parsed.success) return;
      if (parsed.data.kind === "navigate") {
        if (!safeCaptureUrl(parsed.data.url)) {
          void this.control(demo.id, "stopped");
          return;
        }
      }
      const last = demo.steps.at(-1);
      if (
        (parsed.data.kind === "input" || parsed.data.kind === "credentialFill") &&
        last?.kind === parsed.data.kind &&
        "target" in last &&
        JSON.stringify(last.target) === JSON.stringify(parsed.data.target)
      )
        demo.steps[demo.steps.length - 1] = parsed.data;
      else {
        if (demo.steps.length === 49) {
          void this.control(demo.id, "stopped");
          return;
        }
        demo.steps.push(parsed.data);
      }
      this.save(demo);
    };
    try {
      await observer.start(append, (error) => {
        if (!armed) {
          startupFault = error;
          failedDuringStartup = true;
          return;
        }
        void this.fail(demo.id, item, error);
      });
      if (failedDuringStartup) throw startupFault;
      if (!current()) throw new AuxError("target_detached", "This tab changed while recording started.");
      this.active.set(demo.id, item);
      armed = true;
      this.save(demo);
      return demo;
    } catch (error) {
      try {
        await observer.close();
      } catch (cleanup) {
        throw new AggregateError([error, cleanup], "Recording startup and cleanup failed.");
      }
      throw error;
    } finally {
      this.starting.delete(pageId);
    }
  }
  private async fail(
    id: string,
    item: { demo: Demonstration; observer: RecorderObserver; sessionId: string },
    error: unknown,
  ) {
    // A late fault can retire only its own installed recording, never a new one.
    if (this.active.get(id) !== item) return;
    this.active.delete(id);
    item.demo.state = "stopped";
    const errors = [error];
    try {
      this.save(item.demo);
    } catch (save) {
      errors.push(save);
    }
    try {
      await item.observer.close();
    } catch (cleanup) {
      if (!errors.includes(cleanup)) errors.push(cleanup);
    }
    const failure = errors.length === 1 ? error : new AggregateError(errors, "Recording and cleanup failed.");
    this.failures.set(id, failure);
    try {
      this.emit(item.demo, failure);
    } catch (notification) {
      this.failures.set(
        id,
        new AggregateError([failure, notification], "Recording failure notification failed."),
      );
    }
  }
  async control(id: string, state: "paused" | "recording" | "stopped") {
    const item = this.active.get(id);
    if (!item && this.failures.has(id)) throw this.failures.get(id);
    if (!item || item.demo.state === "stopped")
      throw new AuxError("conflict", "Recording is no longer active.");
    if (state === "recording" && item.demo.state !== "paused")
      throw new AuxError("conflict", "Only paused recordings can resume.");
    item.demo.state = state;
    this.save(item.demo);
    if (state === "stopped") await this.detach(id);
    return this.get(id);
  }
  private async detach(id: string) {
    const item = this.active.get(id);
    if (!item) return;
    this.active.delete(id);
    await item.observer.close();
  }
  async discard(id: string) {
    this.get(id);
    await this.detach(id);
    this.repo.db.prepare("DELETE FROM demonstrations WHERE id=?").run(id);
    this.failures.delete(id);
    return { ok: true as const };
  }
  async close() {
    this.closed = true;
    for (const id of this.active.keys()) await this.control(id, "stopped");
  }
}
