import { useEffect, useId, useState } from "react";
import {
  sameCapturedSource,
  type CapturedSource,
  type CapturedSourceSelection,
  type MethodResult,
} from "@aux/contracts";
import { bridge } from "../bridge";
import { call } from "../store";
import { Checkbox } from "../ui";
import { Popover } from "../ui/popover";
import { SourceCollection } from "./SourceCollection";
import { smallGhostButtonProps } from "../ui/button-props";
import "./ContextPicker.css";

type Catalog = MethodResult<"workspaces.contentMemory.list">;
type Props = {
  workspaceId?: string;
  selection?: CapturedSourceSelection;
  disabled: boolean;
  onChange(selection: CapturedSourceSelection | null): void;
};
export function CapturedSourcePicker(props: Props) {
  if (bridge.privateMode || (!props.workspaceId && !props.selection?.sources.length)) return null;
  const count = props.selection?.sources.length ?? 0;
  return (
    <Popover
      label="Saved article sources"
      disabled={props.disabled}
      trigger={<span>Saved articles{count ? ` · ${count}` : ""}</span>}
    >
      {() => <CapturedSourceOptions {...props} />}
    </Popover>
  );
}
function CapturedSourceOptions({ workspaceId, selection, disabled, onChange }: Props) {
  const catalogId = useId();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState<Catalog["nextCursor"]>(null);
  const [revision, setRevision] = useState(0);
  const sources = selection?.sources ?? [];
  const owner = selection?.workspaceId ?? workspaceId;
  const selectedIds = JSON.stringify(sources.map((source) => source.memoryId));
  const scope = JSON.stringify([
    owner,
    workspaceId,
    query,
    cursor,
    revision,
    selectedIds,
    bridge.privateMode,
  ]);
  const [loaded, setLoaded] = useState<{ scope: string; value?: Catalog; error?: string }>();
  const catalog = loaded?.scope === scope ? loaded.value : undefined;
  const error = loaded?.scope === scope ? loaded.error : undefined;
  const wrongSpace = !!owner && owner !== workspaceId;
  useEffect(
    () =>
      bridge.onEvent((event) => {
        if (event.type === "workspace.contentMemory.updated" && event.payload.workspaceId === owner)
          setRevision((value) => value + 1);
      }),
    [owner],
  );
  useEffect(() => {
    if (!owner || bridge.privateMode || wrongSpace) return;
    let current = true;
    const timer = setTimeout(
      () => {
        void call("workspaces.contentMemory.list", {
          workspaceId: owner,
          query,
          ...(cursor ? { cursor } : {}),
          selectedIds: JSON.parse(selectedIds),
        })
          .then((value) => {
            if (current) setLoaded({ scope, value });
          })
          .catch((reason) => {
            if (current) setLoaded({ scope, error: String(reason) });
          });
      },
      query ? 150 : 0,
    );
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [owner, wrongSpace, query, cursor, selectedIds, scope]);
  if (bridge.privateMode || (!owner && !sources.length)) return null;
  const remove = (source: CapturedSource) => {
    const remaining = sources.filter((item) => item.memoryId !== source.memoryId);
    onChange(remaining.length && owner ? { workspaceId: owner, sources: remaining } : null);
  };
  return (
    <>
      <header>Captured articles · this Space</header>
      <p className="hint">
        Saved copies, not live pages. Aux fits relevant excerpts into each answer; every selected source stays
        in your collection.
      </p>
      {wrongSpace && (
        <p role="alert">
          These captures belong to another Space. Return to that Space or remove them to choose new sources.
        </p>
      )}
      {!!sources.length && (
        <section className="context-picker-group" aria-label="Selected captured articles">
          <SourceCollection items={sources} label="Selected captured article pages">
            {(visible) =>
              visible.map((source) => {
                const current = catalog?.selected.find((item) => item.memoryId === source.memoryId);
                const state =
                  wrongSpace || error || (catalog && !current)
                    ? "Unavailable"
                    : !catalog
                      ? "Checking…"
                      : current && sameCapturedSource(source, current)
                        ? "Captured"
                        : "Changed";
                return (
                  <div className="context-choice" key={source.memoryId}>
                    <span title={source.url}>
                      <strong>{source.title || source.url}</strong>
                      <small>
                        {state} · {new Date(source.capturedAt).toLocaleString()}
                      </small>
                    </span>
                    <button
                      type="button"
                      {...smallGhostButtonProps}
                      disabled={disabled}
                      aria-label={`Remove saved ${source.title || source.url}`}
                      onClick={() => remove(source)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })
            }
          </SourceCollection>
        </section>
      )}
      {!wrongSpace && (
        <>
          <input
            type="search"
            aria-label="Find saved article sources"
            placeholder="Find a saved title or URL…"
            maxLength={200}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCursor(null);
            }}
          />
          {error && <p role="alert">Saved articles couldn’t be loaded. {error}</p>}
          {!error && !catalog && <output>Loading saved articles…</output>}
          <section className="context-picker-group" aria-label="Available captured articles">
            {catalog?.items.map((source) => {
              const selected = sources.some((item) => item.memoryId === source.memoryId);
              return (
                <label
                  className="context-choice"
                  key={source.memoryId}
                  htmlFor={`${catalogId}-${source.memoryId}`}
                >
                  <Checkbox
                    id={`${catalogId}-${source.memoryId}`}
                    checked={selected}
                    disabled={disabled}
                    onChange={() => {
                      if (selected) remove(source);
                      else if (owner && owner === workspaceId)
                        onChange({ workspaceId: owner, sources: [...sources, source] });
                    }}
                  />
                  <span title={source.url}>
                    <strong>{source.title || source.url}</strong>
                    <small>
                      Captured {new Date(source.capturedAt).toLocaleDateString()} ·{" "}
                      {new URL(source.url).hostname}
                    </small>
                  </span>
                </label>
              );
            })}
            {catalog && !catalog.items.length && <p>No available saved articles match this title or URL.</p>}
          </section>
          {(cursor || catalog?.nextCursor) && (
            <nav className="source-collection-pages" aria-label="Saved article pages">
              <button
                type="button"
                {...smallGhostButtonProps}
                disabled={!cursor}
                onClick={() => setCursor(null)}
              >
                First page
              </button>
              <button
                type="button"
                {...smallGhostButtonProps}
                disabled={!catalog?.nextCursor}
                onClick={() => setCursor(catalog?.nextCursor ?? null)}
              >
                Next page
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
