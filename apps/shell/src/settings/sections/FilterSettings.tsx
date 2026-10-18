import { useEffect, useRef, useState } from "react";
import { BUNDLED_FILTER_SOURCES } from "@aux/contracts/filter-defaults.generated";
import { FilterListManager, type FilterSourceDraft } from "../../components/FilterListManager";
import { Dialog, Menu } from "../../ui/dialog";
import {
  shellIconDown,
  shellIconPlusSm,
  shellIconSearch,
  shellIconReloadSm,
  shellIconFilter,
} from "../../ui/icons";
import { useFilterLists } from "../../components/use-filter-lists";
import "./FilterSettings.css";

export function FilterSettings({ active }: { active: boolean }) {
  const trigger = useRef<HTMLButtonElement>(null);
  const actionTrigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState<"catalog" | "actions" | null>(null);
  const [actionsAtEnd, setActionsAtEnd] = useState(false);
  const [query, setQuery] = useState("");
  const lists = useFilterLists(active);
  const { status, busy, error, notice } = lists;
  const [editor, setEditor] = useState<{ id?: string; source?: FilterSourceDraft } | null>(null);
  useEffect(() => {
    if (!active) {
      setOpen(null);
      if (!busy) setEditor(null);
    }
  }, [active, busy]);
  const matches = (name: string) => name.toLowerCase().includes(query.trim().toLowerCase());
  const configured = status?.sources.filter((source) => matches(source.name)) ?? [];
  const recommended = BUNDLED_FILTER_SOURCES.filter(
    (source) => !status?.sources.some((saved) => saved.url === source.url) && matches(source.name),
  );
  function openCatalog() {
    if (!active || busy) return;
    setQuery("");
    void lists.refresh();
    setOpen("catalog");
  }
  function edit(value: NonNullable<typeof editor>) {
    setOpen(null);
    setEditor(value);
  }
  function closeEditor() {
    if (busy) return;
    setEditor(null);
    void lists.refresh();
  }
  return (
    <>
      <div className="filter-configure-control">
        <div className="filter-configure-group" role="group" aria-label="Filter configuration">
          <button
            type="button"
            ref={trigger}
            className="btn filter-configure"
            disabled={!active || busy}
            aria-label="Configure filters"
            aria-haspopup="menu"
            aria-expanded={open === "catalog"}
            onClick={openCatalog}
            onKeyDown={(event) => {
              if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
              event.preventDefault();
              openCatalog();
            }}
          >
            {shellIconFilter} Configure
          </button>
          <button
            type="button"
            ref={actionTrigger}
            className="btn filter-actions-trigger"
            aria-label="Filter actions"
            aria-haspopup="menu"
            aria-expanded={open === "actions"}
            disabled={!active}
            aria-busy={busy || undefined}
            onClick={() => {
              setActionsAtEnd(false);
              setOpen("actions");
            }}
            onKeyDown={(event) => {
              if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
              event.preventDefault();
              setActionsAtEnd(event.key === "ArrowUp");
              setOpen("actions");
            }}
          >
            {shellIconDown}
          </button>
        </div>
        {!editor && (
          <>
            {busy && <output className="hint">Applying filter changes…</output>}
            {error && (
              <p className="hint" role="alert">
                {error}
              </p>
            )}
            {notice && <output className="hint">{notice}</output>}
            {!!notice && status?.sources.some((source) => source.meta?.error) && (
              <output className="hint">
                Some lists could not update. Open Configure to review their source errors.
              </output>
            )}
            {!!notice && !!status?.compilationWarnings.length && (
              <output className="hint">
                Some rules were rejected. Open Configure to review compilation warnings.
              </output>
            )}
          </>
        )}
      </div>
      {open === "actions" && (
        <Menu
          label="Filter actions"
          anchor={actionTrigger}
          returnFocus={actionTrigger}
          atEnd={actionsAtEnd}
          className="ctx-menu filter-actions-menu"
          onClose={() => setOpen(null)}
        >
          <button
            type="button"
            className="menu-item"
            role="menuitem"
            disabled={!active || busy || !status?.sources.length || status.backend === "unavailable"}
            onClick={() => {
              setOpen(null);
              void lists.update();
            }}
          >
            {shellIconReloadSm} Update
          </button>
        </Menu>
      )}
      {open === "catalog" && (
        <Menu
          label="Configure filters"
          anchor={trigger}
          returnFocus={trigger}
          initialFocusRef={search}
          className="filter-settings-menu"
          onClose={() => setOpen(null)}
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
                <button className="menu-item" role="menuitem" onClick={() => void lists.refresh()}>
                  Retry
                </button>
              </div>
            )}
            {status?.backend === "unavailable" && <p className="hint">Native filtering unavailable.</p>}
            {!!configured.length && <p className="menu-label">Configured</p>}
            {configured.map((source) => (
              <button
                className="menu-item"
                key={source.id}
                role="menuitem"
                onClick={() => edit({ id: source.id })}
              >
                <span>{source.name}</span>
                <small>{source.meta?.error ? "Update failed" : source.enabled ? "Enabled" : "Paused"}</small>
              </button>
            ))}
            {!!recommended.length && <p className="menu-label">Recommended</p>}
            {recommended.map((source) => (
              <button
                key={source.id}
                className="menu-item"
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
          <hr className="menu-sep" />
          <button className="menu-item" role="menuitem" onClick={() => edit({})}>
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
          <FilterListManager controller={lists} initialSelectedId={editor.id} initialSource={editor.source} />
          <button className="btn" disabled={busy} onClick={closeEditor}>
            Done
          </button>
        </Dialog>
      )}
    </>
  );
}
