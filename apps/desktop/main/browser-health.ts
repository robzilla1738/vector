import { randomUUID } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RETENTION_MS = 8 * 24 * 60 * 60 * 1_000;
const MAX_SAMPLES = 12_000;

interface BrowserHealthSample {
  at: number;
  sessionId: string;
  uptimeMinutes: number;
  startupMs?: number;
  cpuPercent: number;
  memoryMb: number;
  eventLoopLagMs?: number;
  windows: number;
  pages: number;
  suspendedPages?:number;
  pageCrashes?: number;
  pageUnresponsive?: number;
  suspensionFailures?:number;
}

export interface BrowserHealthSummary {
  recordingSince?: number;
  latestAt?: number;
  samples: number;
  sessions: number;
  observedMinutes: number;
  spanDays: number;
  sevenDaySpan: boolean;
  startupMs?: number;
  cpuPercent: { p50: number; p95: number; max: number };
  memoryMb: { p50: number; p95: number; max: number };
  eventLoopLagMs: { p50: number; p95: number; max: number };
  maxWindows: number;
  maxPages: number;
  maxSuspendedPages:number;
  pageCrashes: number;
  pageUnresponsive: number;
  suspensionFailures:number;
}

type Metric = { cpu?: { percentCPUUsage?: number }; memory?: { workingSetSize?: number } };

const finite = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : 0;
const rounded = (value: number, digits = 1) => Number(value.toFixed(digits));
const percentile = (values: number[], fraction: number) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * fraction) - 1))] ?? 0;
};
const validSample = (value: unknown): value is BrowserHealthSample => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<BrowserHealthSample>;
  return finite(item.at) > 0 && typeof item.sessionId === "string" && item.sessionId.length <= 64
    && [item.uptimeMinutes, item.cpuPercent, item.memoryMb, item.windows, item.pages].every(value => typeof value === "number" && Number.isFinite(value) && value >= 0);
};

export class BrowserHealthRecorder {
  private readonly directory: string;
  private readonly file: string;
  private readonly sessionId = randomUUID();
  private readonly startedAt: number;
  private samples: BrowserHealthSample[] = [];
  private timer: NodeJS.Timeout | null = null;
  private pendingWrites = 0;
  private pageCrashes = 0;
  private pageUnresponsive = 0;
  private suspensionFailures=0;
  private nextSampleAt = 0;

  constructor(
    dataDir: string,
    startedAt: number,
    private readonly metrics: () => Metric[],
    private readonly counts: () => { windows: number; pages: number;suspendedPages?:number },
  ) {
    this.directory = join(dataDir, "health");
    this.file = join(this.directory, "browser-health.json");
    this.startedAt = startedAt;
    mkdirSync(this.directory, { recursive: true, mode: 0o700 });
    this.samples = this.read();
  }

  start() {
    if (this.timer) return;
    this.capture(true, true);
    this.nextSampleAt = Date.now() + 60_000;
    this.timer = setInterval(() => {
      const now = Date.now();
      const delay = now - this.nextSampleAt;
      this.nextSampleAt = now + 60_000;
      this.capture(false, false, delay >= 0 && delay < 120_000 ? delay : 0);
    }, 60_000);
    this.timer.unref();
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.capture(false, true);
  }

  clear() {
    this.samples = [];
    this.pendingWrites = 0;
    this.pageCrashes = 0;
    this.pageUnresponsive = 0;
    this.suspensionFailures=0;
    this.persist();
    return this.summary();
  }

  notePageCrash() { this.pageCrashes += 1; }
  notePageUnresponsive() { this.pageUnresponsive += 1; }
  noteSuspensionFailure(){this.suspensionFailures+=1;}

  summary(): BrowserHealthSummary {
    const samples = this.samples;
    const first = samples[0]?.at;
    const last = samples.at(-1)?.at;
    const cpu = samples.map(sample => sample.cpuPercent);
    const memory = samples.map(sample => sample.memoryMb);
    const lag = samples.map(sample => sample.eventLoopLagMs ?? 0);
    const sessions = new Map<string, BrowserHealthSample[]>();
    for (const sample of samples) {
      const session = sessions.get(sample.sessionId) ?? [];
      session.push(sample);
      sessions.set(sample.sessionId, session);
    }
    const observedMinutes = [...sessions.values()].reduce((total, session) => {
      const start = session[0]?.uptimeMinutes ?? 0;
      const end = session.at(-1)?.uptimeMinutes ?? start;
      return total + Math.max(0, end - start);
    }, 0);
    const spanDays = first && last ? Math.max(0, (last - first) / 86_400_000) : 0;
    const startupValues = samples.flatMap(sample => sample.startupMs == null ? [] : [sample.startupMs]);
    return {
      ...(first ? { recordingSince: first } : {}),
      ...(last ? { latestAt: last } : {}),
      samples: samples.length,
      sessions: sessions.size,
      observedMinutes: Math.round(observedMinutes),
      spanDays: rounded(spanDays, 2),
      sevenDaySpan: spanDays >= 7,
      ...(startupValues.length ? { startupMs: Math.round(percentile(startupValues, 0.5)) } : {}),
      cpuPercent: { p50: rounded(percentile(cpu, 0.5)), p95: rounded(percentile(cpu, 0.95)), max: rounded(Math.max(0, ...cpu)) },
      memoryMb: { p50: rounded(percentile(memory, 0.5)), p95: rounded(percentile(memory, 0.95)), max: rounded(Math.max(0, ...memory)) },
      eventLoopLagMs: { p50: rounded(percentile(lag, 0.5)), p95: rounded(percentile(lag, 0.95)), max: rounded(Math.max(0, ...lag)) },
      maxWindows: Math.max(0, ...samples.map(sample => sample.windows)),
      maxPages: Math.max(0, ...samples.map(sample => sample.pages)),
      maxSuspendedPages:Math.max(0,...samples.map(sample=>sample.suspendedPages??0)),
      pageCrashes: [...sessions.values()].reduce((total, session) => total + Math.max(0, ...session.map(sample => sample.pageCrashes ?? 0)), 0),
      pageUnresponsive: [...sessions.values()].reduce((total, session) => total + Math.max(0, ...session.map(sample => sample.pageUnresponsive ?? 0)), 0),
      suspensionFailures:[...sessions.values()].reduce((total,session)=>total+Math.max(0,...session.map(sample=>sample.suspensionFailures??0)),0),
    };
  }

  private read() {
    if (!existsSync(this.file)) return [];
    try {
      const value = JSON.parse(readFileSync(this.file, "utf8")) as { version?: unknown; samples?: unknown };
      if (value.version !== 1 || !Array.isArray(value.samples)) return [];
      return this.retain(value.samples.filter(validSample));
    } catch {
      return [];
    }
  }

  private capture(startup: boolean, force = false, eventLoopLagMs = 0) {
    const now = Date.now();
    const processMetrics = this.metrics();
    const { windows, pages,suspendedPages=0 } = this.counts();
    this.samples.push({
      at: now,
      sessionId: this.sessionId,
      uptimeMinutes: rounded((now - this.startedAt) / 60_000, 3),
      ...(startup ? { startupMs: Math.max(0, now - this.startedAt) } : {}),
      cpuPercent: rounded(processMetrics.reduce((total, item) => total + finite(item.cpu?.percentCPUUsage), 0)),
      memoryMb: rounded(processMetrics.reduce((total, item) => total + finite(item.memory?.workingSetSize), 0) / 1024),
      eventLoopLagMs: rounded(Math.max(0, eventLoopLagMs)),
      windows: Math.max(0, Math.floor(windows)),
      pages: Math.max(0, Math.floor(pages)),
      suspendedPages:Math.max(0,Math.floor(suspendedPages)),
      pageCrashes: this.pageCrashes,
      pageUnresponsive: this.pageUnresponsive,
      suspensionFailures:this.suspensionFailures,
    });
    this.samples = this.retain(this.samples);
    this.pendingWrites += 1;
    if (force || this.pendingWrites >= 5) this.persist();
  }

  private retain(samples: BrowserHealthSample[]) {
    const cutoff = Date.now() - RETENTION_MS;
    return samples.filter(sample => sample.at >= cutoff && sample.at <= Date.now() + 60_000).slice(-MAX_SAMPLES);
  }

  private persist() {
    const temporary = `${this.file}.tmp`;
    try {
      writeFileSync(temporary, JSON.stringify({ version: 1, samples: this.samples }), { encoding: "utf8", mode: 0o600 });
      renameSync(temporary, this.file);
      chmodSync(this.file, 0o600);
      this.pendingWrites = 0;
    } finally {
      try { rmSync(temporary, { force: true }); } catch { /* best effort */ }
    }
  }
}
