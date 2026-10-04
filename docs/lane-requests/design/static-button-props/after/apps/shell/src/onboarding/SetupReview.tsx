import { smallGhostButtonProps } from "../ui/button-props";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ImportJobStatusSchema,
  MODEL_PROVIDER_NAMES,
  ModelProviderSchema,
  ONBOARDING_DISCLOSURE_VERSION,
  type AuxEvent,
  type ImportJobStatus,
  type OnboardingState,
  type PageContextRef,
} from "@aux/contracts";
import { bridge } from "../bridge";
import { call } from "../store";

type Receipt = { state: "loading" | "none" | "unavailable" } | { state: "ready"; job: ImportJobStatus };
const categories = { bookmarks: "Bookmarks", history: "History entries", tabs: "Open tabs" } as const;
const browsers: Record<string, string> = {
  chrome: "Chrome",
  arc: "Arc",
  safari: "Safari",
  firefox: "Firefox",
  "chrome-attached": "Attached Chrome",
};

export function importReviewSummary(job: ImportJobStatus) {
  const counts = { bookmarks: 0, history: 0, tabs: 0 };
  let skipped = 0;
  for (const row of job.progress) {
    counts[row.category] += row.imported;
    skipped += row.skipped;
  }
  const partial =
    job.cancelled ||
    job.interrupted ||
    !!job.error ||
    job.progress.some((row) => row.state === "error" || (row.category === "tabs" && row.skipped > 0));
  return {
    counts,
    skipped,
    running: !job.done,
    sources: [
      ...new Set(
        (job.selections?.map((item) => item.sourceId) ?? job.progress.map((item) => item.source)).map(
          (id) => browsers[id] ?? "Browser source",
        ),
      ),
    ],
    status: !job.done
      ? job.cancelled
        ? "Stopping after the current batch"
        : "Import still running"
      : job.interrupted
        ? "Import interrupted"
        : partial
          ? "Import needs review"
          : "Import finished",
    needsReview: partial,
  };
}

/** Reads existing receipts only; it never discovers source Profiles or restarts an import. */
export function SetupReview({
  connected,
  settings,
  state,
  recovery,
  source,
  onVisit,
  onCheckRecovery,
}: {
  connected: boolean;
  settings: Record<string, unknown>;
  state: OnboardingState;
  recovery: "checking" | "ready" | "pending" | "unavailable";
  source: PageContextRef | null;
  onVisit(step: "import" | "model" | "welcome" | "permissions"): void;
  onCheckRecovery(): void;
}) {
  const [receipt, setReceipt] = useState<Receipt>({ state: "loading" });
  const [checking, setChecking] = useState(false);
  const current = useRef<ImportJobStatus | null>(null);
  const generation = useRef(0),
    receiptEpoch = useRef(0);
  const invalidate = useCallback(() => {
    generation.current++;
  }, []);
  const apply = useCallback((job: ImportJobStatus) => {
    const previous = current.current;
    if (previous?.jobId === job.jobId && (previous.revision ?? 0) > (job.revision ?? 0)) return;
    if (previous?.jobId !== job.jobId && (previous?.startedAt ?? 0) > (job.startedAt ?? 0)) return;
    receiptEpoch.current++;
    current.current = job;
    setReceipt({ state: "ready", job });
  }, []);
  const read = useCallback(
    async (attempt: number) => {
      const previousEpoch = receiptEpoch.current;
      setChecking(true);
      try {
        const result = await call("import.status", {});
        if (generation.current === attempt) apply(ImportJobStatusSchema.parse(result));
      } catch (error) {
        if (generation.current === attempt && receiptEpoch.current === previousEpoch) {
          // A not_found response means no receipt. Disconnection or malformed data does not.
          const absent =
            !current.current &&
            error !== null &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "not_found";
          setReceipt({ state: absent ? "none" : "unavailable" });
        }
      } finally {
        if (generation.current === attempt) setChecking(false);
      }
    },
    [apply],
  );
  useEffect(() => {
    const attempt = ++generation.current;
    if (!connected) return;
    void read(attempt);
    const off = bridge.onEvent((event: AuxEvent) => {
      if (event.type !== "import.progress") return;
      const parsed = ImportJobStatusSchema.safeParse(event.payload);
      if (parsed.success) apply(parsed.data);
    });
    return () => {
      invalidate();
      off();
    };
  }, [connected, read, apply, invalidate]);
  const summary = receipt.state === "ready" ? importReviewSummary(receipt.job) : null;
  const provider = ModelProviderSchema.safeParse(settings.modelProvider);
  return (
    <section className="onboarding-review" aria-label="Review your setup">
      <h2>Review your setup</h2>
      <div>
        <h3>Latest browser import</h3>
        {receipt.state === "loading" && <p>Checking the saved import receipt…</p>}
        {receipt.state === "none" && (
          <p>
            No browser import recorded in this Profile. You can browse and start a chat without importing.
          </p>
        )}
        {receipt.state === "unavailable" && (
          <p role="alert">
            Import progress is unavailable. Nothing was retried; review the saved receipt before assuming an
            import finished.
          </p>
        )}
        {summary && (
          <>
            <p>
              Counts cover confirmed writes from the most recent import. Earlier imports and later edits can
              change your current library.
            </p>
            <p>
              {summary.status}
              {summary.sources.length ? ` · ${summary.sources.join(", ")}` : ""}
            </p>
            {/* chrome:// web UI fatals when a term or definition is named from its text. */}
            <ul className="import-counts">
              {(Object.keys(categories) as (keyof typeof categories)[]).map((key) => (
                <li key={key}>
                  <span>{categories[key]}</span>
                  <span>{summary.counts[key].toLocaleString()} confirmed</span>
                </li>
              ))}
            </ul>
            {summary.skipped > 0 && (
              <p>
                {summary.skipped.toLocaleString()} skipped. Skips may include duplicates or unavailable items;
                review the import details.
              </p>
            )}
            {summary.needsReview && (
              <p>
                Confirmed items remain available. Return to Import for a fresh source review before retrying.
              </p>
            )}
            {summary.running && <p>Starting a chat does not wait for or cancel this import.</p>}
          </>
        )}
        <div className="row">
          <button {...smallGhostButtonProps} disabled={!connected} onClick={() => onVisit("import")}>
            Review browser import
          </button>
          <button
            {...smallGhostButtonProps}
            disabled={!connected || checking}
            onClick={() => void read(++generation.current)}
          >
            {checking ? "Checking receipt…" : "Refresh import receipt"}
          </button>
        </div>
      </div>
      <div>
        <h3>Model and source</h3>
        <p>
          {settings.modelConfigured === true
            ? `Model connection ready${provider.success ? ` · ${MODEL_PROVIDER_NAMES[provider.data]}` : ""}.`
            : "No model connection is ready."}
        </p>
        <p>
          {state.disclosureVersion === ONBOARDING_DISCLOSURE_VERSION
            ? "You reviewed model data use. Your selected page and question are sent only when you start the chat."
            : "Review model data use before starting a chat."}
        </p>
        <p>{source ? `Reviewed page: ${source.url}` : "No page has been reviewed for this chat."}</p>
        <p>
          The task opens a separate temporary page with the same URL. Cookies, saved passwords and account
          access are not copied. A sign-in page may therefore need a separate sign-in.
        </p>
        <button {...smallGhostButtonProps} disabled={!connected} onClick={() => onVisit("model")}>
          Review model setup
        </button>
      </div>
      <div>
        <h3>Keychain and recovery</h3>
        <p>
          Browser-data import does not request your browser’s Keychain passwords. Aux may ask macOS to unlock
          its own protected Profile or save a model key. Check the app and purpose in that system prompt;
          cancelling is allowed.
        </p>
        <p>
          A recovery package and its phrase are separate from Keychain. Recovery is reviewed, authenticated
          and applied to a new empty Profile on restart; credentials and browser cookies are excluded. Keep
          copied packages and their phrases under your control: copies outside Aux cannot be revoked after
          Forget.
        </p>
        <p>
          {recovery === "ready"
            ? "No recovery is staged."
            : recovery === "pending"
              ? "Recovery is staged. Restart Aux before starting a chat."
              : recovery === "checking"
                ? "Checking recovery readiness…"
                : "Recovery readiness is unavailable. Check again before starting a chat."}
        </p>
        <div className="row">
          <button {...smallGhostButtonProps} disabled={!connected} onClick={() => onVisit("welcome")}>
            Review recovery options
          </button>
          {recovery === "unavailable" && (
            <button {...smallGhostButtonProps} disabled={!connected} onClick={onCheckRecovery}>
              Check recovery readiness
            </button>
          )}
        </div>
      </div>
      <p>
        Setup does not import credentials, enable Memory or grant service/folder access.{" "}
        <button {...smallGhostButtonProps} disabled={!connected} onClick={() => onVisit("permissions")}>
          Review permissions
        </button>
      </p>
    </section>
  );
}
