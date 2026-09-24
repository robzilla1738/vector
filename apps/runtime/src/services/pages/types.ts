import type { BrowserDriver, DriverPage, DriverPageEvents } from "@aux/chromium-driver";
import type { Observation, ObservationRequest, PageTarget, ProgramResult, StepRecord } from "@aux/contracts";
import type { DurableWriteLedger } from "../../agent/durable.js";
import type { GrantSource } from "../../agent/permissions.js";
import type { EventBus } from "../../events.js";
import type { NativeBridge } from "../../native.js";
import type { Repo } from "../../store/repo.js";
import type { VaultService } from "../vault.js";

/** Backends the runtime can hold drivers for. */
export interface DriverSet {
  aux: BrowserDriver | null;
  chrome: BrowserDriver | null;
}

export type ObserveReq = Partial<Pick<ObservationRequest, "scope" | "subtreeRef" | "maxElements" | "maxTextChars" | "sinceRevision" | "format">>;

/** `pages.execute` result: the program result plus the act-and-observe observation. */
export type ExecuteResult = ProgramResult & { observation?: Observation };

export interface LivePage {
  target: PageTarget;
  driver: DriverPage | null;
  /** serialization chain — commands to one page never overlap */
  queue: Promise<unknown>;
  lastObservationId?: string;
  /** observation cache (plan A6): the last observation with the page fingerprint and request it answered */
  lastObs?: { fingerprint: string; reqKey: string; obs: Observation };
  /** recent observations by revision so `sinceRevision` can diff against the one the caller last saw */
  history: ObservedRevision[];
  consoleLines: { level: string; message: string; atMs?: number }[];
  lastDialog?: { type: string; message: string };
}

export const OBSERVATION_HISTORY = 8;

export interface ObservedRevision {
  revision: number;
  epoch: number;
  /** scope + subtree: a delta only compares like with like */
  shape: string;
  text: string;
  fields: Map<string, string>;
  /** wire view of each element by ref — the base for structural deltas */
  elements: Map<string, Record<string, unknown>>;
}

export interface PageServiceDeps {
  repo: Repo;
  profileId?: string;
  events: EventBus;
  native: NativeBridge;
  drivers: () => DriverSet;
  recordStep?: (s: StepRecord) => void;
  artifacts?: { save(o: { runId?: string; pageId?: string; label: string; buffer: Buffer; mediaType: string }): { artifactId: string } };
  /** passive response capture — bound per page in wireDriverEvents */
  responses?: {
    record(pageId: string): NonNullable<DriverPageEvents["onResponse"]>;
    flush(): Promise<void>;
    list(pageId: string, opts?: { since?: number; urlIncludes?: string; limit?: number }): unknown[];
  };
  /** structured spans (§6) — execute/observe emit timing records */
  tracer?: {
    start(
      name: string,
      ctx?: { runId?: string; pageId?: string; attrs?: Record<string, unknown> },
    ): { spanId: string; end(outcome?: "ok" | "failed" | "cancelled", attrs?: Record<string, unknown>): void };
    incr(name: string, by?: number): void;
  };
  /** fallback `call` node dispatch when the caller didn't supply one */
  callOperation?: (name: string, args: Record<string, unknown>, pageId: string) => Promise<unknown>;
  /**
   * Privilege-independent effect grants (Gate D / Gate F). Model text and
   * RPC params cannot expand these. A function re-reads after settings.set.
   * Used for unsolicited `pages.execute` (no runId).
   */
  grants?: GrantSource;
  /**
   * Grants for a user-started `runs.start` (`ctx.runId` set). Starting the
   * run is the write grant. Falls back to `grants` when omitted.
   */
  grantsForRun?: GrantSource;
  /** optional locked vault; fillCredential resolves here and never records the secret */
  vault?: VaultService;
  /** Shared write journal. Direct execute journals here when `ctx.journaled` is unset. */
  durableWrites?: DurableWriteLedger;
}
