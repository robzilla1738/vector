import "./FilterListManager.css";
import { useEffect, useState } from "react";
import { filterSourceUrl } from "@aux/contracts";
import { bridge, type FilterListStatus } from "../bridge";

const messageOf = (reason: unknown) => (reason instanceof Error ? reason.message : String(reason));

/** User-selected hosts lists. Mock preview never claims to block network requests. */
export function FilterListManager() {
  const [status, setStatus] = useState<FilterListStatus | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [review, setReview] = useState<{ name: string; url: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const selected = status?.sources.find((source) => source.id === selectedId);
  const preview = status?.backend === "preview";

  const refresh = async () => {
    const next = await bridge.filterLists();
    setStatus(next);
    setSelectedId((current) =>
      next.sources.some((source) => source.id === current) ? current : (next.sources[0]?.id ?? ""),
    );
    return next;
  };
  useEffect(() => {
    void refresh().catch((reason) => setError(messageOf(reason)));
  }, []);

  const action = async (work: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await work();
    } catch (reason) {
      setError(messageOf(reason));
    } finally {
      setBusy(false);
    }
  };

  const inspect = () => {
    try {
      const normalized = filterSourceUrl(url.trim());
      const label = name.trim().slice(0, 120) || new URL(normalized).hostname;
      setReview({ name: label, url: normalized });
      setError("");
    } catch (reason) {
      setError(messageOf(reason));
    }
  };

  return (
    <section className="filter-manager" aria-label="Filter lists">
      <div className="drawer-section">Filter lists</div>
      <p className="hint">
        Choose HTTPS hosts lists you trust. Downloads update in Aux while it is open. The built-in protection
        works without a download.
      </p>
      {status && (
        <p className="hint">
          {status.builtinHosts.toLocaleString()} built-in domains · {status.hosts.toLocaleString()} enabled
          list entries
          {preview && " · Browser preview only; no requests are blocked here."}
        </p>
      )}
      <div className="filter-manager-layout">
        <aside className="filter-manager-list" aria-label="Selected filter lists">
          {status?.sources.map((source) => (
            <button
              key={source.id}
              type="button"
              aria-current={selectedId === source.id ? "true" : undefined}
              onClick={() => setSelectedId(source.id)}
            >
              <strong>{source.name}</strong>
              <span>
                {source.enabled ? "Enabled" : "Paused"} · {source.meta?.hosts?.toLocaleString() ?? 0} domains
              </span>
            </button>
          ))}
          {status && !status.sources.length && <p className="hint">No downloaded lists selected.</p>}
        </aside>
        <div className="filter-manager-detail">
          {!status && <p className="hint">Loading filter lists…</p>}
          {status && !selected && <p className="hint">Choose a list to review its source and status.</p>}
          {selected && (
            <>
              <strong>{selected.name}</strong>
              <span className="hint filter-manager-url">{selected.url}</span>
              <span className="hint">
                {selected.meta?.fetchedAt
                  ? `Last checked ${new Date(selected.meta.fetchedAt).toLocaleString()}`
                  : "No downloaded copy yet."}
              </span>
              {selected.meta?.error && (
                <p className="field-error" role="status">
                  Last update: {selected.meta.error}. The previous copy remains available.
                </p>
              )}
              <div className="row">
                <button
                  className="btn sm"
                  disabled={busy || preview}
                  onClick={() =>
                    void action(async () => {
                      await bridge.setFilterSourceEnabled(selected.id, !selected.enabled);
                      await refresh();
                      setNotice(
                        selected.enabled
                          ? "List paused. Its rules are no longer used."
                          : "List enabled. Check its update status above.",
                      );
                    })
                  }
                >
                  {selected.enabled ? "Pause list" : "Enable list"}
                </button>
                <button
                  className="btn sm ghost"
                  disabled={busy || preview}
                  onClick={() =>
                    void action(async () => {
                      await bridge.removeFilterSource(selected.id);
                      await refresh();
                      setNotice("List removed from this browser.");
                    })
                  }
                >
                  Remove list
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="filter-manager-add">
        <label>
          List name
          <input
            aria-label="Filter list name"
            value={name}
            maxLength={120}
            disabled={busy || preview}
            onChange={(event) => {
              setName(event.target.value);
              setReview(null);
            }}
          />
        </label>
        <label>
          HTTPS hosts list URL
          <input
            aria-label="Filter list URL"
            value={url}
            maxLength={2048}
            placeholder="https://example.com/hosts.txt"
            disabled={busy || preview}
            onChange={(event) => {
              setUrl(event.target.value);
              setReview(null);
            }}
          />
        </label>
        <div className="row">
          <button className="btn sm" disabled={busy || preview || !url.trim()} onClick={inspect}>
            Review list
          </button>
          <button
            className="btn sm ghost"
            disabled={busy || preview || !status?.sources.length}
            onClick={() =>
              void action(async () => {
                const next = await bridge.updateFilters();
                setStatus(next);
                setNotice("Enabled lists checked. Review any source errors above.");
              })
            }
          >
            Update enabled lists
          </button>
        </div>
        {review && (
          <div className="filter-manager-confirm" role="group" aria-label="Review filter source">
            <strong>Download this list?</strong>
            <p>
              {review.name} · {review.url}
            </p>
            <p className="hint">
              Aux will fetch this source and use validated host entries for subresource blocking. The source
              sees this browser's network address.
            </p>
            <div className="row">
              <button
                className="btn sm"
                disabled={busy}
                onClick={() =>
                  void action(async () => {
                    await bridge.addFilterSource(review.name, review.url);
                    const next = await refresh();
                    setSelectedId(next.sources.find((source) => source.url === review.url)?.id ?? "");
                    setReview(null);
                    setName("");
                    setUrl("");
                    setNotice("List added. Review its download status above.");
                  })
                }
              >
                Add selected list
              </button>
              <button className="btn sm ghost" disabled={busy} onClick={() => setReview(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <output className="hint" data-block>
          {notice}
        </output>
      )}
    </section>
  );
}
