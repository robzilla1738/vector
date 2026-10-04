import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  bridge,
  inMock,
  inNativeHost,
  emptyBrowserHealthSummary,
  type BrowserHealthSummary,
} from "../../bridge";
import { errToast } from "../../store";
import { guardCommandCompletion } from "../../command-completion";
import { SettingsField as IndexedField } from "../primitives";
import { PreferenceAction, usePreferenceCommand } from "./preference-command";
type Action = "reveal" | "clear" | "report";
class DiagnosticsOwner {
  #live = true;
  #pending = new Set<Action>();
  #healthSequence = 0;
  constructor(
    readonly snapshot: {
      active: boolean;
      available: boolean;
      privateMode: boolean;
      windowId: string;
      kind: typeof bridge.windowKind;
      refreshVersion: number;
    },
  ) {}
  current() {
    const original = this.snapshot;
    return (
      this.#live &&
      original.active &&
      original.available &&
      (inNativeHost || inMock) &&
      (original.kind === "normal" || original.kind === "private") &&
      bridge.windowKind === original.kind &&
      bridge.windowId === original.windowId &&
      bridge.privateMode === original.privateMode
    );
  }
  retire() {
    this.#live = false;
  }
  begin(action: Action) {
    if (!this.current() || this.#pending.has(action)) return false;
    this.#pending.add(action);
    return true;
  }
  finish(action: Action) {
    this.#pending.delete(action);
  }
  actions() {
    return new Set(this.#pending);
  }
  nextHealth() {
    return ++this.#healthSequence;
  }
  currentHealth(sequence: number) {
    return this.current() && sequence === this.#healthSequence;
  }
}
export function DiagnosticsStorage({
  active,
  refreshVersion,
  onIndexChange,
}: {
  active: boolean;
  refreshVersion: number;
  onIndexChange: Dispatch<SetStateAction<number>>;
}) {
  const available = inNativeHost || inMock,
    privateMode = bridge.privateMode,
    windowId = bridge.windowId,
    kind = bridge.windowKind;
  const owner = useMemo(
    () => new DiagnosticsOwner({ active, available, privateMode, windowId, kind, refreshVersion }),
    [active, available, privateMode, windowId, kind, refreshVersion],
  );
  useLayoutEffect(() => () => owner.retire(), [owner]);
  const current = useCallback(() => owner.current(), [owner]);
  const scopeId = useId(),
    details = useRef<HTMLDetailsElement>(null);
  useLayoutEffect(() => {
    if (!active && details.current) details.current.open = false;
  }, [active]);
  const [loaded, setLoaded] = useState<{
    owner: typeof owner;
    dataDir: string;
    health: BrowserHealthSummary;
  } | null>(null);
  const [pending, setPending] = useState<{ owner: typeof owner; actions: Set<Action> } | null>(null);
  const [message, setMessage] = useState<{ owner: typeof owner; action: Action; text: string } | null>(null);
  const dataDir = loaded?.owner === owner ? loaded.dataDir : "",
    health = loaded?.owner === owner ? loaded.health : emptyBrowserHealthSummary();
  const busy = (action: Action) => pending?.owner === owner && pending.actions.has(action);
  const text = (action: Action) =>
    message?.owner === owner && message.action === action ? message.text : "";
  useEffect(() => {
    void Promise.resolve().then(() => {
      if (!current()) return;
      const sequence = owner.nextHealth();
      const read = async () => {
        if (!privateMode && kind !== "private")
          try {
            const path = await bridge.dataDir();
            if (current())
              setLoaded((value) => ({
                owner,
                dataDir: path,
                health: value?.owner === owner ? value.health : emptyBrowserHealthSummary(),
              }));
          } catch (reason) {
            if (current()) errToast(reason);
          }
      };
      void read();
      void (async () => {
        try {
          const value = await bridge.healthSummary();
          if (owner.currentHealth(sequence))
            setLoaded((previous) => ({
              owner,
              dataDir: previous?.owner === owner ? previous.dataDir : "",
              health: value,
            }));
        } catch {
          /* Existing passive health read is optional. */
        }
      })();
    });
  }, [owner, current, privateMode, kind]);
  useEffect(() => {
    onIndexChange((value) => value + 1);
  }, [dataDir, loaded, onIndexChange]);
  function run<T>(action: Action, producer: () => Promise<T>, publish: (value: T) => void): Promise<T> {
    if (!owner.begin(action)) return Promise.reject(new Error("Choose the current diagnostics control."));
    setPending({ owner, actions: owner.actions() });
    setMessage(null);
    let native: Promise<T>;
    try {
      native = producer();
    } catch (reason) {
      native = Promise.reject(reason);
    }
    const completion = native
      .then((value) => {
        if (current()) publish(value);
        return value;
      })
      .catch((reason) => {
        if (current())
          setMessage({ owner, action, text: reason instanceof Error ? reason.message : String(reason) });
        throw reason;
      })
      .finally(() => {
        owner.finish(action);
        if (current()) setPending({ owner, actions: owner.actions() });
      });
    return guardCommandCompletion(completion, current);
  }
  const [summaryRef, toggle] = usePreferenceCommand<HTMLElement>(
    "toggle-diagnostics-storage",
    scopeId,
    () => {
      if (!current() || !details.current)
        return Promise.reject(new Error("Choose the current diagnostics disclosure."));
      details.current.open = !details.current.open;
    },
  );
  const clear = () => {
    if (!health.samples || loaded?.owner !== owner)
      return Promise.reject(new Error("Choose the current measured browser health."));
    owner.nextHealth();
    return run(
      "clear",
      () => bridge.clearHealth(),
      (value) =>
        setLoaded((previous) => ({
          owner,
          dataDir: previous?.owner === owner ? previous.dataDir : "",
          health: value,
        })),
    );
  };
  return (
    <details ref={details} className="settings-advanced">
      <summary
        ref={summaryRef}
        data-command-id="toggle-diagnostics-storage"
        onClick={(event) => {
          event.preventDefault();
          toggle(event);
        }}
      >
        Diagnostics &amp; storage
      </summary>
      {dataDir && (
        <IndexedField label="Data directory">
          <div className="row">
            <span className="hint mono selectable grow">{dataDir}</span>
            <PreferenceAction
              command="reveal-runtime-data-directory"
              scopeId={scopeId}
              className="btn sm"
              disabled={!current() || busy("reveal")}
              invoke={() => {
                if (privateMode || kind === "private" || loaded?.owner !== owner || !dataDir)
                  return Promise.reject(new Error("Choose the current regular Profile data directory."));
                return run(
                  "reveal",
                  () => bridge.revealPath(dataDir),
                  (ok) => {
                    if (!ok)
                      throw new Error(
                        "The data directory is unavailable. Try again after the runtime starts.",
                      );
                  },
                );
              }}
            >
              Reveal
            </PreferenceAction>
            {text("reveal") && <output className="hint">{text("reveal")}</output>}
          </div>
        </IndexedField>
      )}
      <IndexedField
        label="Browser health"
        hint={
          health.samples
            ? `${health.sevenDaySpan ? "Seven-day span recorded" : `${health.spanDays.toFixed(1)} of 7 days recorded`} · ${Math.round(health.observedMinutes / 60)} hours while Aux was open · ${health.sessions} sessions · browser process memory p95 ${Math.round(health.memoryMb.p95)} MB · CPU p95 ${health.cpuPercent.p95.toFixed(1)}% · UI scheduling delay p95 ${Math.round(health.eventLoopLagMs.p95)} ms · since last Clear: ${health.pageCrashes} page crashes, ${health.pageUnresponsive} page hangs · up to ${health.maxPages} tabs. Samples and counts stay on this device and contain no URLs or page content.`
            : "Aux records local browser process CPU and memory, UI scheduling delay, window and tab counts, and page crashes and hangs while open. It never records URLs or page content."
        }
      >
        <div className="row">
          <span className="hint grow">
            {health.samples
              ? `${health.samples.toLocaleString()} private samples${health.startupMs != null ? ` · typical startup ${health.startupMs} ms` : ""}`
              : "Recording begins during this session."}
          </span>
          <PreferenceAction
            command="clear-browser-health"
            scopeId={scopeId}
            className="btn sm ghost danger"
            disabled={!current() || busy("clear") || !health.samples}
            invoke={clear}
          >
            {busy("clear") ? "Clearing…" : "Clear"}
          </PreferenceAction>
          {text("clear") && <output className="hint">{text("clear")}</output>}
        </div>
      </IndexedField>
      <IndexedField
        label="Support report"
        hint="Exports the browser build, available host method count, aggregate browser health, nonsecret modes, and known limits. It excludes credentials, URLs, browsing history, task text, account identity, local paths, and content."
      >
        <div className="row">
          <PreferenceAction
            command="export-support-report"
            scopeId={scopeId}
            className="btn sm"
            disabled={!current() || busy("report")}
            invoke={() =>
              run(
                "report",
                () => bridge.exportDiagnostics(),
                (path) =>
                  setMessage({
                    owner,
                    action: "report",
                    text: path ? "Support report saved." : "Export cancelled.",
                  }),
              )
            }
          >
            {busy("report") ? "Preparing…" : "Export support report…"}
          </PreferenceAction>
          {text("report") && <output className="hint">{text("report")}</output>}
        </div>
      </IndexedField>
    </details>
  );
}
