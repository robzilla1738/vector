import { staticFieldErrorProps } from "../ui/class-props";
import { staticRowProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useState } from "react";
import { bridge } from "../bridge";
import { call, toast } from "../store";

const ranges = [
  { value: "hour", label: "Last hour", duration: 60 * 60 * 1000 },
  { value: "day", label: "Last 24 hours", duration: 24 * 60 * 60 * 1000 },
  { value: "week", label: "Last 7 days", duration: 7 * 24 * 60 * 60 * 1000 },
  { value: "all", label: "All time", duration: undefined },
] as const;

type Preview = { visits: number; cookies: number; cacheBytes: number; cacheEstimate: boolean };
type Selection = { history: boolean; cookies: boolean; cache: boolean };

function cacheSize(bytes: number, estimate: boolean) {
  if (bytes === 0) return "0 bytes";
  const unit = bytes >= 1024 * 1024 ? "MB" : "KB";
  const size = bytes / (unit === "MB" ? 1024 * 1024 : 1024);
  return `${estimate ? "up to " : ""}${size < 10 ? size.toFixed(1) : Math.round(size)} ${unit}`;
}

export function ClearBrowsingData({ active }: { active: boolean }) {
  const [cutoff, setCutoff] = useState<number | null>(null);
  const [range, setRange] = useState<(typeof ranges)[number]["value"]>("hour");
  const [selected, setSelected] = useState<Selection>({ history: true, cookies: false, cache: false });
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const period = ranges.find(item => item.value === range)!;
  const since = cutoff === null || period.duration === undefined ? 0 : Math.max(0, cutoff - period.duration);
  const historyRange = cutoff === null ? null : { before: cutoff, ...(since ? { since } : {}) };

  useEffect(() => {
    if (!active || cutoff === null) return;
    let live = true;
    setPreview(null);
    setError("");
    const history = { before: cutoff, ...(since ? { since } : {}) };
    void Promise.all([call("history.count", history), bridge.browsingDataPreview(since, cutoff)])
      .then(([visits, browser]) => {
        if (live) setPreview({ visits: visits.count, ...browser });
      })
      .catch(reason => { if (live) setError(errorMessage(reason)); });
    return () => { live = false; };
  }, [active, cutoff, since]);

  const clear = async () => {
    if (cutoff === null || !preview || !historyRange || busy) return;
    setBusy(true);
    setError("");
    let browserCleared = false;
    try {
      const [currentHistory, currentBrowser] = await Promise.all([
        call("history.count", historyRange),
        bridge.browsingDataPreview(since, cutoff),
      ]);
      const changed = (selected.history && currentHistory.count !== preview.visits) ||
        (selected.cookies && currentBrowser.cookies !== preview.cookies) ||
        (selected.cache && currentBrowser.cacheBytes !== preview.cacheBytes);
      if (changed) {
        setPreview({ visits: currentHistory.count, ...currentBrowser });
        setError("The amount of selected data changed. Review the new counts before clearing.");
        return;
      }
      if (selected.cookies || selected.cache) {
        if (!await bridge.clearBrowsingData(since, cutoff, { cookies: selected.cookies, cache: selected.cache }))
          throw new Error("Chromium did not confirm browsing-data removal.");
        browserCleared = true;
      }
      if (selected.history) await call("history.clear", historyRange);
      setCutoff(null);
      setPreview(null);
      toast("Selected browsing data cleared");
    } catch (reason) {
      const detail = errorMessage(reason);
      setError(browserCleared ? `Cookies or cached files were cleared, but history may remain. ${detail}` : detail);
      setPreview(null);
    } finally {
      setBusy(false);
    }
  };

  if (cutoff === null) return <button {...smallGhostButtonProps} onClick={() => setCutoff(Date.now())}>Clear browsing data…</button>;
  const amount = (selected.history ? preview?.visits ?? 0 : 0) +
    (selected.cookies ? preview?.cookies ?? 0 : 0) +
    (selected.cache ? preview?.cacheBytes ?? 0 : 0);
  const historyLabel = `Browsing history — ${preview ? `${preview.visits} ${preview.visits === 1 ? "visit" : "visits"}` : "counting…"}`;
  const cookiesLabel = `Cookies — ${preview ? `${preview.cookies} ${preview.cookies === 1 ? "cookie" : "cookies"}` : "counting…"}`;
  const cacheLabel = `Cached files — ${preview ? cacheSize(preview.cacheBytes, preview.cacheEstimate) : "counting…"}`;
  return <div className="clear-history" role="group" aria-label="Clear browsing data">
    <p>Choose a period and data types. The period ends when this panel opened; newer data stays. This cannot be undone.</p>
    <div className="clear-history-ranges" role="group" aria-label="Browsing data time range">
      {ranges.map(item => <button key={item.value} {...smallGhostButtonProps} aria-pressed={range === item.value} disabled={busy}
        onClick={() => { setRange(item.value); setError(""); }}>{item.label}</button>)}
    </div>
    <label><input type="checkbox" aria-label={historyLabel} checked={selected.history} disabled={busy} onChange={event => setSelected(value => ({ ...value, history: event.target.checked }))} /> {historyLabel}</label>
    <label><input type="checkbox" aria-label={cookiesLabel} checked={selected.cookies} disabled={busy} onChange={event => setSelected(value => ({ ...value, cookies: event.target.checked }))} /> {cookiesLabel}</label>
    <label><input type="checkbox" aria-label={cacheLabel} checked={selected.cache} disabled={busy} onChange={event => setSelected(value => ({ ...value, cache: event.target.checked }))} /> {cacheLabel}</label>
    <p>Clearing cookies can sign you out. Bookmarks, downloads, saved work and Aux memory stay in place.</p>
    {error && <p {...staticFieldErrorProps} role="alert">{error}</p>}
    <div {...staticRowProps}>
      <button {...smallButtonProps} disabled={busy} onClick={() => { setCutoff(null); setPreview(null); setError(""); }}>Cancel</button>
      <button className="btn sm danger" disabled={busy || !preview || !amount} onClick={() => void clear()}>{busy ? "Clearing…" : "Clear selected data"}</button>
    </div>
  </div>;
}
