import { useState } from "react";
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (cutoff === null) return <button className="btn sm ghost" onClick={() => { setCutoff(Date.now()); setError(""); }}>Clear history…</button>;
  const selected = ranges.find(item => item.value === range)!;
  return <div className="clear-history" role="group" aria-label="Clear browsing history">
    <div><strong>Clear browsing history</strong><p>Remove visits from a period ending when you opened this panel. Newer visits are kept.</p></div>
    <div className="clear-history-ranges" role="group" aria-label="History time range">
      {ranges.map(item => <button key={item.value} className="btn sm ghost" aria-pressed={range === item.value} disabled={busy} onClick={() => setRange(item.value)}>{item.label}</button>)}
    </div>
    <p>This cannot be undone. Cookies, bookmarks, downloads, saved work and Aux memory are kept.</p>
    {error && <p className="field-error" role="alert">{error}</p>}
    <div className="row"><button className="btn sm" disabled={busy} onClick={() => { setCutoff(null); setError(""); }}>Cancel</button>
      <button className="btn sm danger" disabled={busy} onClick={() => {
        setBusy(true); setError("");
        void call("history.clear", { before: cutoff, ...(selected.duration === undefined ? {} : { since: Math.max(0, cutoff - selected.duration) }) })
          .then(result => { setCutoff(null); toast(result.removed ? `${result.removed} ${result.removed === 1 ? "visit" : "visits"} removed` : "No visits in this period"); })
          .catch(reason => setError(reason instanceof Error ? reason.message : String(reason))).finally(() => setBusy(false));
      }}>{busy ? "Clearing…" : range === "all" ? "Clear all history" : `Clear ${selected.label.toLowerCase()}`}</button></div>
  </div>;
}
