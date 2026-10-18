import type { BrowserDriver, DriverPage, DriverPageEvents } from "@aux/chromium-driver";
import type { Observation, ObservationRequest, PageTarget, ProgramResult, StepRecord } from "@aux/contracts";
import type { DurableWriteLedger } from "../../agent/durable.js";
import type { EventBus } from "../../events.js";
import type { NativeBridge } from "../../native.js";
import type { Repo } from "../../store/repo.js";
import type { SafetyDispatchGate } from "../../safety/dispatch.js";

/** Backends the runtime can hold drivers for. */
export interface DriverSet {
  aux: BrowserDriver | null;
  chrome: BrowserDriver | null;
}

export type ObserveReq = Partial<
  Pick<
    ObservationRequest,
    "scope" | "subtreeRef" | "maxElements" | "maxTextChars" | "sinceRevision" | "format"
  >
>;

/** `pages.execute` result: the program result plus the act-and-observe observation. */
export type ExecuteResult = ProgramResult & { observation?: Observation };

export interface LivePage {
  target: PageTarget;
  driver: DriverPage | null;
  /** Original browser DocumentUserData identity for fixed native person reads. */
  personReadDocumentId?: string;
  personReadDocumentEpoch?: number;
  /** serialization chain — commands to one page never overlap */
  queue: Promise<unknown>;
  lastObservationId?: string;
  /** observation cache (plan A6): the last observation with the page fingerprint and request it answered */
  lastObs?: { fingerprint?: string; reqKey: string; obs: Observation };
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
  turnMentions: import("../turn-mention-service.js").TurnMentionService;
  repo: Repo;
  profileId?: string;
  events: EventBus;
  native: NativeBridge;
  /** Actual installed native debt, never a fresh Context for cleanup. */
  retireCreatedPage?: (runId: string, pageId: string) => Promise<void>;
  /** Only the authenticated Chromium Profile host can handle saved passwords. */
  nativePasswordFillEnabled?: boolean;
  drivers: () => DriverSet;
  recordStep?: (s: StepRecord) => void;
  artifacts?: {
    save(o: { runId?: string; pageId?: string; label: string; buffer: Buffer; mediaType: string }): {
      artifactId: string;
    };
  };
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
    ): {
      spanId: string;
      end(outcome?: "ok" | "failed" | "cancelled", attrs?: Record<string, unknown>): void;
    };
    incr(name: string, by?: number): void;
  };
  /** fallback `call` node dispatch when the caller didn't supply one */
  callOperation?: (name: string, args: Record<string, unknown>, pageId: string) => Promise<unknown>;
  /** Shared write journal. Direct execute journals here when `ctx.journaled` is unset. */
  durableWrites?: DurableWriteLedger;
  safetyGate?: SafetyDispatchGate;
  /** Native request protection must be installed before an agent dispatch. */
  prepareAgentEgress?: (runId: string, pageId: string) => Promise<void>;
  /** Private native continuation; no request/tool input may supply this producer. */
  navigateControlled?: (
    input: {
      runId: string;
      pageId: string;
      url: string;
      signal?: AbortSignal;
      validateSource(): void;
      mentionAuthority?: () => void;
      revalidateMentionSource?: () => Promise<void>;
    },
    pages: import("./registry.js").PageRegistry,
  ) => Promise<import("./controlled-navigation.js").ControlledNavigationReadmission>;
  inputControlled?: (
    input: {
      runId: string;
      pageId: string;
      dispatch: (signal: AbortSignal) => Promise<unknown>;
      signal?: AbortSignal;
      validateSource(): void;
      mentionAuthority?: () => void;
      revalidateMentionSource?: () => Promise<void>;
    },
    pages: import("./registry.js").PageRegistry,
  ) => Promise<import("./controlled-navigation.js").ControlledActionReadmission>;
  /** Internal exact browser-owned download receipt → immutable artifact intake. */
  admitNavigationDownload?: (input: {
    runId: string;
    pageId: string;
    outcome: import("@aux/contracts").NativeCdpDownloadOutcome;
    signal: AbortSignal;
    validateSource(): void;
  }) => Promise<{ artifactId: string; suggestedFilename: string; sha256: string; mediaType: string }>;
  /** Record source text before any observation is returned to an agent. */
  recordAgentObservation?: (pageId: string, url: string, text: string) => void;
  /**
   * Un-armed dialog resolution through decide() (S4): `accept`/`dismiss`
   * handles the dialog; `leave` keeps it open for a parked suspension or
   * the human. Absent → the driver dismisses.
   */
  decideDialog?: (input: {
    pageId: string;
    type: string;
    message: string;
  }) => Promise<"accept" | "dismiss" | "leave" | undefined>;
  /** Supervised file bytes from the live file permission policy. */
  uploadRead?: (
    path: string,
    input: { taskId?: string; runId?: string; pageId?: string; signal?: AbortSignal },
  ) => Promise<Buffer>;
  /** Session storage dir downloads save into (S4) — waiters resolve a real path. */
  downloadsDir?: string;
}
