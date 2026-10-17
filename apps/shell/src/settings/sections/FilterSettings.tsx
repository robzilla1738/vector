import { useEffect, useRef, useState } from "react";
import { BUNDLED_FILTER_SOURCES } from "@aux/contracts/filter-defaults.generated";
import { bridge, type FilterListStatus } from "../../bridge";
import { errorMessage } from "../../error-message";
import { FilterListManager, type FilterSourceDraft } from "../../components/FilterListManager";
import { Dialog, Menu } from "../../ui/dialog";
import { shellIconDown, shellIconPlusSm, shellIconSearch } from "../../ui/icons";
import "./FilterSettings.css";

export function FilterSettings({ active }: { active: boolean }) {
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<FilterListStatus | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [editor, setEditor] = useState<{ id?: string; source?: FilterSourceDraft } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!active) {
      setOpen(false);
      if (!busy) setEditor(null);
    }
  }, [active, busy]);
  useEffect(() => {
    if (!active) return;
    let current = true;
    void bridge
      .filterLists()
      .then((next) => {
        if (current) {
          setStatus(next);
          setError("");
        }
      })
      .catch((reason) => {
        if (current) setError(errorMessage(reason));
      });
    return () => {
      current = false;
    };
  }, [active, open, retry]);
  const matches = (name: string) => name.toLowerCase().includes(query.trim().toLowerCase());
  const configured = status?.sources.filter((source) => matches(source.name)) ?? [];
  const recommended = BUNDLED_FILTER_SOURCES.filter(
    (source) => !status?.sources.some((saved) => saved.url === source.url) && matches(source.name),
  );
  function edit(value: NonNullable<typeof editor>) {
    setOpen(false);
    setEditor(value);
  }
  function closeEditor() {
    if (busy) return;
    setEditor(null);
    setRetry((value) => value + 1);
  }
  return (
    <>
      <button
        ref={trigger}
        className="btn filter-configure"
        disabled={!active}
        aria-label="Configure filters"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setQuery("");
          setOpen(true);
        }}
      >
        Configure {shellIconDown}
      </button>
      {open && (
        <Menu
          label="Configure filters"
          anchor={trigger}
          returnFocus={trigger}
          initialFocusRef={search}
          className="filter-settings-menu"
          onClose={() => setOpen(false)}
        >
          <label data-input-surface className="filter-settings-search">
            {shellIconSearch}
            <input
              ref={search}
              aria-label="Search filters"
              placeholder="Search filters"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
                const items = event.currentTarget
                  .closest("dialog")
                  ?.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]:not(:disabled)');
                const target = event.key === "ArrowDown" ? items?.[0] : items?.[items.length - 1];
                if (target) {
                  event.preventDefault();
                  target.focus();
                }
              }}
            />
          </label>
          <div className="filter-settings-options">
            {!status && !error && <p className="hint">Loading filters…</p>}
            {error && (
              <div role="alert">
                <p>{error}</p>
                <button role="menuitem" onClick={() => setRetry((value) => value + 1)}>
                  Retry
                </button>
              </div>
            )}
            {status?.backend === "unavailable" && <p className="hint">Native filtering unavailable.</p>}
            {!!configured.length && <p className="hint">Configured</p>}
            {configured.map((source) => (
              <button key={source.id} role="menuitem" onClick={() => edit({ id: source.id })}>
                <span>{source.name}</span>
                <small>{source.enabled ? "Enabled" : "Paused"}</small>
              </button>
            ))}
            {!!recommended.length && <p className="hint">Recommended</p>}
            {recommended.map((source) => (
              <button
                key={source.id}
                role="menuitem"
                disabled={!status || status.backend === "unavailable"}
                onClick={() => edit({ source: { name: source.name, url: source.url, kind: source.kind } })}
              >
                {source.name}
              </button>
            ))}
            {status && !configured.length && !recommended.length && (
              <p className="hint">No matching filters.</p>
            )}
          </div>
          <button role="menuitem" className="filter-settings-add" onClick={() => edit({})}>
            {shellIconPlusSm} Add filter
          </button>
        </Menu>
      )}
      {editor && (
        <Dialog
          label="Manage filters"
          returnFocus={trigger}
          onClose={closeEditor}
          className="filter-settings-dialog"
        >
          <h3>Manage filters</h3>
          <FilterListManager
            initialSelectedId={editor.id}
            initialSource={editor.source}
            onBusyChange={setBusy}
          />
          <button className="btn" disabled={busy} onClick={closeEditor}>
            Done
          </button>
        </Dialog>
      )}
    </>
  );
}
