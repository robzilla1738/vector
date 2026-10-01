import { runCommand } from "../commands";
import { memo, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "../store";
import { bridge, inNativeHost } from "../bridge";
import { hostOf } from "../workspace";
import type { ResultRecord } from "@aux/contracts";
import { I } from "./icons";

function toCsv(results: ResultRecord[], keys: string[]): string {
  const esc = (v: unknown) => {
    const s = v === undefined || v === null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = ["status", "sourceUrl", ...keys, "observedAt"];
  const lines = [head.join(",")];
  for (const r of results) lines.push([r.status, r.sourceUrl, ...keys.map((k) => r.values[k]), new Date(r.observedAt).toISOString()].map(esc).join(","));
  return lines.join("\n");
}

async function exportFile(name: string, content: string, type: string) {
  if (inNativeHost) {
    await bridge.saveFile(name, content);
    return;
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function resultKeys(results: ResultRecord[]): string[] {
  const keys = new Set<string>();
  for (const result of results) for (const key of Object.keys(result.values)) keys.add(key);
  return [...keys].slice(0, 8);
}

function visibleResults(results: ResultRecord[], filter: string, sortKey: string | null, asc: boolean, keys: string[]): ResultRecord[] {
  const term = filter.trim().toLowerCase();
  const matching = term ? results.filter(result => result.sourceUrl.toLowerCase().includes(term) || result.status.includes(term)
    || keys.some(key => String(result.values[key] ?? "").toLowerCase().includes(term))) : results;
  if (!sortKey) return matching;
  const value = (result: ResultRecord) => sortKey === "status" ? result.status : sortKey === "sourceUrl" ? result.sourceUrl
    : sortKey === "observedAt" ? String(result.observedAt) : String(result.values[sortKey] ?? "");
  return [...matching].sort((a, b) => String(value(a)).localeCompare(String(value(b)), undefined, { numeric: true }) * (asc ? 1 : -1));
}

const ResultRow = memo(function ResultRow({ id, keys }: { id: string; keys: string[] }) {
  const result = useStore(state => state.results.find(item => item.resultId === id));
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  if (!result) return null;
  const openSource = () => {
    const state = useStore.getState();
    const existing = state.pages.find(page => page.url === result.sourceUrl);
    if (existing) void state.activate(existing.pageId);
    else void state.newTab(result.sourceUrl);
  };
  const copy = async () => {
    await navigator.clipboard.writeText(JSON.stringify({ source: result.sourceUrl, status: result.status, ...result.values }, null, 2));
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1200);
  };
  return <tr>
    <td><span className={`st ${result.status}`}>{result.status}</span></td>
    <td><button className="rt-src" title={`${result.sourceUrl} — open`} aria-label={`Open ${result.sourceUrl}`} onClick={openSource}>
      <span>{hostOf(result.sourceUrl)}</span><span className="path">{result.sourceUrl.replace(/^https?:\/\/[^/]+/, "")}</span>
    </button></td>
    {keys.map(key => {
      const value = result.values[key];
      return <td key={key} className="selectable">{value === undefined || value === null ? <span className="muted">—</span>
        : typeof value === "object" ? <code>{JSON.stringify(value)}</code> : String(value)}</td>;
    })}
    <td className="nums muted">{new Date(result.observedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
    <td><button className="btn sm ghost" onClick={() => void copy()}>{copied ? "Copied" : "Copy"}</button></td>
  </tr>;
});

export function ResultsTable() {
  const activeSetId = useStore((s) => s.activeSetId);
  const setMode = useStore((s) => s.setMode);
  const setName = useStore(state => state.sets.find(set => set.setId === activeSetId)?.name);
  const resultCount = useStore(state => state.results.length);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [asc, setAsc] = useState(true);
  const [filter, setFilter] = useState("");
  const keys = useStore(useShallow(state => resultKeys(state.results)));
  const rowIds = useStore(useShallow(state => visibleResults(state.results, filter, sortKey, asc, keys).map(result => result.resultId)));
  const exportRows = () => visibleResults(useStore.getState().results, filter, sortKey, asc, keys);

  const head = (label: string, key: string) => {
    const on = sortKey === key;
    return (
      <th key={key} aria-sort={on ? (asc ? "ascending" : "descending") : "none"}>
        <button
          className={`th-btn ${on ? "on" : ""}`}
          onClick={() => {
            if (on) setAsc(!asc);
            else {
              setSortKey(key);
              setAsc(true);
            }
          }}
        >
          {label}
          <span className="sort-ico">{on ? (asc ? I.up : I.down) : null}</span>
        </button>
      </th>
    );
  };

  return (
    <div className="results-wrap fade-in">
      <div className="results-head">
        <button className="icon-btn" title="Back to page" aria-label="Back to page" onClick={() => setMode("focus")}>{I.back}</button>
        <h2>{setName ?? "Set results"}</h2>
        <span className="count nums">{rowIds.length}{filter ? ` of ${resultCount}` : ""} rows</span>
        <span className="sp" />
        {resultCount > 0 && (
          <>
            <div className="rail-search compact">
              {I.search}
              <input placeholder="Filter rows" aria-label="Filter rows" value={filter} onChange={(e) => setFilter(e.target.value)} />
            </div>
            <button className="btn sm" onClick={() => void exportFile(`${setName ?? "results"}.csv`, toCsv(exportRows(), keys), "text/csv")}>CSV</button>
            <button className="btn sm" onClick={() => void exportFile(`${setName ?? "results"}.json`, JSON.stringify(exportRows(), null, 2), "application/json")}>JSON</button>
          </>
        )}
      </div>
      {resultCount === 0 ? (
        <div className="stage-message">
          <div className="empty-state">
            <span className="empty-ico">{I.layers}</span>
            <h2>No extracted records</h2>
            <p>Collect open tabs into a set, or run a page set. Each row stays tied to its source page.</p>
            <div className="empty-actions">
              <button className="btn primary" data-command-id="palette" onClick={() => runCommand("palette")}>Collect tabs…</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rt-scroll">
          <table className="rt">
            <thead>
              <tr>
                {head("Status", "status")}
                {head("Source", "sourceUrl")}
                {keys.map((k) => head(k.replace(/_/g, " "), k))}
                {head("Observed", "observedAt")}
                <th aria-label="Row actions" />
              </tr>
            </thead>
            <tbody>
              {rowIds.map(id => <ResultRow key={id} id={id} keys={keys} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
