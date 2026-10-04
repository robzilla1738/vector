import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useState } from "react";
import { call, toast } from "../store";

const ranges = [
  { value: "hour", label: "Last hour", duration: 60 * 60 * 1000 },
  { value: "day", label: "Last 24 hours", duration: 24 * 60 * 60 * 1000 },
  { value: "week", label: "Last 7 days", duration: 7 * 24 * 60 * 60 * 1000 },
  { value: "all", label: "All time", duration: undefined },
] as const;

export function ClearHistory({ initiallyOpen = false }: { initiallyOpen?: boolean }) {
  const [cutoff, setCutoff] = useState<number | null>(() => initiallyOpen ? Date.now() : null);
  const [range, setRange] = useState<string>("hour");
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selected = ranges.find(item => item.value === range)!;
  const rangeParams = cutoff === null ? null : { before: cutoff, ...(selected.duration === undefined ? {} : { since: Math.max(0, cutoff - selected.duration) }) };
  useEffect(() => {
    if (cutoff === null) return;
    let current = true;
    const duration = ranges.find(item => item.value === range)!.duration;
    void call("history.count", { before: cutoff, ...(duration === undefined ? {} : { since: Math.max(0, cutoff - duration) }) })
      .then(result => { if (current) setCount(result.count); })
      .catch(reason => { if (current) setError(errorMessage(reason)); });
    return () => { current = false; };
  }, [cutoff, range]);
  if (cutoff === null) return <button {...smallGhostButtonProps} onClick={() => { setCount(null); setCutoff(Date.now()); setError(""); }}>Clear history…</button>;
  return <div className="clear-history" role="group" aria-label="Clear browsing history">
    <div><strong>Clear browsing history</strong><p>Remove visits from a period ending when you opened this panel. Newer visits are kept.</p></div>
    <div className="clear-history-ranges" role="group" aria-label="History time range">
      {ranges.map(item => <button key={item.value} {...smallGhostButtonProps} aria-pressed={range === item.value} disabled={busy} onClick={() => { setCount(null); setError(""); setRange(item.value); }}>{item.label}</button>)}
    </div>
    <p>This cannot be undone. Cookies, bookmarks, downloads, saved work and Aux memory are kept.</p>
    <output>{count === null ? "Counting visits…" : `${count} ${count === 1 ? "visit" : "visits"} in this period`}</output>
    {error && <p className="field-error" role="alert">{error}</p>}
    <div className="row"><button {...smallButtonProps} disabled={busy} onClick={() => { setCutoff(null); setError(""); }}>Cancel</button>
      <button className="btn sm danger" disabled={busy || count === null || count === 0} onClick={() => {
        setBusy(true); setError("");
        void call("history.count", rangeParams!)
          .then(result => {
            if (result.count !== count) {
              setCount(result.count);
              setError("The visit count changed. Review it before clearing.");
              return null;
            }
            return call("history.clear", rangeParams!);
          })
          .then(result => { if (result) { setCutoff(null); toast(result.removed ? `${result.removed} ${result.removed === 1 ? "visit" : "visits"} removed` : "No visits in this period"); } })
          .catch(reason => { setCount(null); setError(errorMessage(reason)); }).finally(() => setBusy(false));
      }}>{busy ? "Clearing…" : range === "all" ? "Clear all history" : `Clear ${selected.label.toLowerCase()}`}</button></div>
  </div>;
}
