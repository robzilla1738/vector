import { useScopedCommandControls } from "../scoped-command-controls";
/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Preserve the original Search engine group and its existing Settings layout. */
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_SEARCH_ENGINE,
  isSearchEngineTemplate,
  SEARCH_ENGINE_TEMPLATE_ERROR,
} from "@aux/contracts/search-engine";
import { bridge } from "../bridge";
import { guardCommandCompletion } from "../command-completion";
const ENGINES = [
  { name: "DuckDuckGo", url: DEFAULT_SEARCH_ENGINE },
  { name: "Google", url: "https://www.google.com/search?q=%s" },
  { name: "Bing", url: "https://www.bing.com/search?q=%s" },
];
type Owner = { active: boolean; identity: object; pending: boolean };
export function SearchEngineSetting({
  value,
  onSave,
}: {
  value: string;
  onSave: (value: string) => Promise<boolean>;
}) {
  const windowId = bridge.windowId,
    privateMode = bridge.privateMode;
  const identity = useMemo(() => ({ value, windowId, privateMode }), [value, windowId, privateMode]);
  const owner = useRef<Owner>({ active: false, identity, pending: false });
  const initial = { identity, draft: value, custom: !ENGINES.some((engine) => engine.url === value) };
  const [editing, setEditing] = useState(initial);
  const { draft, custom } = editing.identity === identity ? editing : initial;
  const setDraft = useCallback(
    (draft: string) =>
      setEditing((previous) => ({
        ...(previous.identity === identity
          ? previous
          : { identity, draft: value, custom: !ENGINES.some((engine) => engine.url === value) }),
        draft,
      })),
    [identity, value],
  );
  const setCustom = useCallback(
    (next: boolean | ((previous: boolean) => boolean)) =>
      setEditing((previous) => {
        const active =
          previous.identity === identity
            ? previous
            : { identity, draft: value, custom: !ENGINES.some((engine) => engine.url === value) };
        return { ...active, custom: typeof next === "function" ? next(active.custom) : next };
      }),
    [identity, value],
  );
  const draftRef = useRef(draft);
  useLayoutEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  const [busyOwner, setBusyOwner] = useState<Owner | null>(null),
    [failure, setFailure] = useState<{ owner: Owner; message: string } | null>(null);
  useLayoutEffect(() => {
    const current = { active: true, identity, pending: false };
    owner.current = current;
    return () => {
      current.active = false;
    };
  }, [identity, value]);
  const current = useCallback(
    (original: Owner) =>
      original.active &&
      owner.current === original &&
      original.identity === identity &&
      bridge.windowId === windowId &&
      bridge.privateMode === privateMode,
    [identity, windowId, privateMode],
  );
  const busy = !!busyOwner && busyOwner.active && busyOwner.identity === identity;
  const error = failure?.owner.active && failure.owner.identity === identity ? failure.message : "";
  const save = useCallback(
    (next: string) => {
      const original = owner.current,
        savedDraft = draftRef.current;
      if (!current(original) || original.pending)
        throw new Error("Choose the current search engine control.");
      const template = next.trim();
      if (!isSearchEngineTemplate(template)) {
        setFailure({ owner: original, message: SEARCH_ENGINE_TEMPLATE_ERROR });
        return false;
      }
      original.pending = true;
      setBusyOwner(original);
      setFailure(null);
      const delivering = () => current(original) && draftRef.current === savedDraft;
      const completion = (async () => {
        try {
          const saved = await onSave(template);
          if (delivering()) {
            if (!saved)
              setFailure({ owner: original, message: "The search engine wasn’t saved. Try again." });
            else {
              setDraft(template);
              setCustom(!ENGINES.some((engine) => engine.url === template));
            }
          }
          return saved;
        } catch (reason) {
          if (delivering())
            setFailure({ owner: original, message: "The search engine wasn’t saved. Try again." });
          throw reason;
        } finally {
          original.pending = false;
          setBusyOwner((active) => (active === original ? null : active));
        }
      })();
      return guardCommandCompletion(completion, delivering);
    },
    [current, onSave, setDraft, setCustom],
  );
  const [publish, run] = useScopedCommandControls(`${windowId}:search-engine`, () => {
    const original = owner.current;
    return current(original) ? () => current(original) : undefined;
  });
  function changeDraft(next: string) {
    if (!current(owner.current) || owner.current.pending) return;
    draftRef.current = next;
    setDraft(next);
    setFailure(null);
  }
  return (
    <div className="search-engine-setting">
      <div className="search-engine-choices" role="group" aria-label="Search engine">
        {ENGINES.map((engine) => (
          <button
            ref={(element) => publish(engine.name, "select-search-engine", element, () => save(engine.url))}
            key={engine.name}
            className="btn sm"
            disabled={busy}
            aria-pressed={value === engine.url}
            onClick={(event) => run("select-search-engine", event)}
          >
            {engine.name}
          </button>
        ))}
        <button
          ref={(element) =>
            publish("custom", "toggle-custom-search-engine", element, () => {
              if (!current(owner.current) || owner.current.pending)
                throw new Error("Choose the current search engine control.");
              setCustom((active) => !active);
            })
          }
          className="btn sm ghost"
          disabled={busy}
          aria-expanded={custom}
          onClick={(event) => run("toggle-custom-search-engine", event)}
        >
          Custom…
        </button>
      </div>
      {custom && (
        <div className="search-engine-custom">
          <label htmlFor="search-engine-template">Search URL</label>
          <div className="row">
            <input
              ref={(element) => publish("input", "save-search-engine", element, () => save(draftRef.current))}
              id="search-engine-template"
              aria-describedby="search-engine-help"
              value={draft}
              disabled={busy}
              onChange={(event) => changeDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  run("save-search-engine", event);
                }
              }}
            />
            <button
              ref={(element) => publish("save", "save-search-engine", element, () => save(draftRef.current))}
              className="btn sm"
              disabled={busy || draft.trim() === value}
              onClick={(event) => run("save-search-engine", event)}
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
          <p id="search-engine-help" className="hint">
            Use %s where the search terms belong.
          </p>
        </div>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
