import { useMemo, useState } from "react";
import { useStore, call } from "../store";
import { bridge, inElectron } from "../bridge";
import type { ResultRecord } from "@vector/contracts";

function toCsv(results: ResultRecord[], keys: string[]): string {
  const esc = (v: unknown) => {
    const s = v === undefined || v === null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = ["status", "sourceUrl", ...keys, "observedAt"];
  const lines = [head.join(",")];
  for (const r of results) {
    lines.push([r.status, r.sourceUrl, ...keys.map((k) => r.values[k]), new Date(r.observedAt).toISOString()].map(esc).join(","));
  }
  return lines.join("\n");
}

async function exportFile(name: string, content: string, type: string) {
  if (inElectron) {
    await bridge.saveFile(name, content); // native save dialog; null = cancelled
    return;
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

export function ResultsTable() {
  const results = useStore((s) => s.results);
  const sets = useStore((s) => s.sets);
  const activeSetId = useStore((s) => s.activeSetId);
  const set = sets.find((s) => s.setId === activeSetId);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [asc, setAsc] = useState(true);
  const [filter, setFilter] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const keys = useMemo(() => {
    const k = new Set<string>();
    for (const r of results) for (const key of Object.keys(r.values)) k.add(key);
    return [...k].slice(0, 8);
  }, [results]);

  const rows = useMemo(() => {
    let out = results;
    const f = filter.trim().toLowerCase();
    if (f) {
      out = out.filter((r) =>
        r.sourceUrl.toLowerCase().includes(f) ||
        r.status.includes(f) ||
        keys.some((k) => String(r.values[k] ?? "").toLowerCase().includes(f)),
      );
    }
    if (!sortKey) return out;
    const get = (r: (typeof results)[number]) =>
      sortKey === "status" ? r.status : sortKey === "sourceUrl" ? r.sourceUrl : String(r.values[sortKey] ?? "");
    return [...out].sort((a, b) => String(get(a)).localeCompare(String(get(b))) * (asc ? 1 : -1));
  }, [results, sortKey, asc, filter, keys]);

  const head = (label: string, key: string) => (
    <th
      onClick={() => {
        if (sortKey === key) setAsc(!asc);
        else {
          setSortKey(key);
          setAsc(true);
        }
      }}
      style={{ cursor: "pointer" }}
    >
      {label} {sortKey === key ? (asc ? "▲" : "▼") : ""}
    </th>
  );

  const openSource = (r: ResultRecord) => {
    const existing = useStore.getState().pages.find((p) => p.url === r.sourceUrl);
    if (existing) void useStore.getState().activate(existing.pageId);
    else void call("pages.open", { url: r.sourceUrl, backend: "vector", activate: true });
  };

  const copyRow = async (r: ResultRecord) => {
    await navigator.clipboard.writeText(JSON.stringify({ source: r.sourceUrl, status: r.status, ...r.values }, null, 2));
    setCopied(r.resultId);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <div className="results-wrap fade-in">
      <div className="results-head">
        <h2>{set ? set.name : "Set results"}</h2>
        <span className="count">{rows.length}{filter ? `/${results.length}` : ""} rows</span>
        <span className="sp" style={{ flex: 1 }} />
        {results.length > 0 && (
          <>
            <input
              className="rt-filter"
              placeholder="Filter rows…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            <button className="btn sm"
              onClick={() => void exportFile(`${set?.name ?? "results"}.csv`, toCsv(rows, keys), "text/csv")}>
              CSV
            </button>
            <button className="btn sm"
              onClick={() => void exportFile(`${set?.name ?? "results"}.json`, JSON.stringify(rows, null, 2), "application/json")}>
              JSON
            </button>
          </>
        )}
      </div>
      {results.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 48 }}>
          <h2>No extracted records</h2>
          <p>Collect open tabs into a set, or run a page set. Each row stays tied to its source page.</p>
          <button className="btn primary" onClick={() => useStore.getState().setOverlay("palette")}>
            Collect tabs…
          </button>
        </div>
      ) : (
        <table className="rt">
          <thead>
            <tr>
              {head("st", "status")}
              {head("source", "sourceUrl")}
              {keys.map((k) => head(k, k))}
              {head("observed", "observedAt")}
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.resultId}>
                <td><span className={`st ${r.status}`}>{r.status}</span></td>
                <td>
                  <span className="mono rt-src" title={`${r.sourceUrl} — click to open`} onClick={() => openSource(r)}>
                    {r.sourceUrl.slice(0, 64)}
                  </span>
                </td>
                {keys.map((k) => {
                  const v = r.values[k];
                  return (
                    <td key={k}>
                      <span className="mono">{v === undefined || v === null ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                    </td>
                  );
                })}
                <td><span className="mono">{new Date(r.observedAt).toLocaleTimeString([], { hour12: false })}</span></td>
                <td>
                  <button className="dl-act" onClick={() => void copyRow(r)}>{copied === r.resultId ? "copied" : "copy"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
