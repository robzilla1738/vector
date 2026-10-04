import { useSettingsSaveOwner } from "../settings/sections/use-settings-save-owner";
import { useScopedCommandControls } from "../scoped-command-controls";
/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Preserve the original Search engine group and its existing Settings layout. */
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_SEARCH_ENGINE,
  isSearchEngineTemplate,
  SEARCH_ENGINE_TEMPLATE_ERROR,
} from "@aux/contracts/search-engine";
import { bridge } from "../bridge";
const ENGINES = [
  { name: "DuckDuckGo", url: DEFAULT_SEARCH_ENGINE },
  { name: "Google", url: "https://www.google.com/search?q=%s" },
  { name: "Bing", url: "https://www.bing.com/search?q=%s" },
];
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
  const initial = { identity, draft: value, custom: !ENGINES.some((engine) => engine.url === value) };
  const [editing, setEditing] = useState(initial);
  const { draft, custom } = editing.identity === identity ? editing : initial;
  const edit = useCallback(
    (change: Partial<Pick<typeof initial, "draft" | "custom">> | ((active: typeof initial) => Partial<Pick<typeof initial, "draft" | "custom">>)) =>
      setEditing((previous) => {
        const active = previous.identity === identity
          ? previous
          : { identity, draft: value, custom: !ENGINES.some((engine) => engine.url === value) };
        return { ...active, ...(typeof change === "function" ? change(active) : change) };
      }),
    [identity, value],
  );
  const draftRef = useRef(draft);
  useLayoutEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  const [getOwner,current,busy,error,fail,clearFailure,perform] = useSettingsSaveOwner(identity,windowId,privateMode);
  const save = useCallback(
    (next: string) => {
      const original = getOwner(),
        savedDraft = draftRef.current;
      if (!current(original) || original.pending)
        throw new Error("Choose the current search engine control.");
      const template = next.trim();
      if (!isSearchEngineTemplate(template)) {
        fail(original, SEARCH_ENGINE_TEMPLATE_ERROR);
        return false;
      }
      return perform(original, savedDraft, draftRef, () => onSave(template), () => {
        edit({ draft: template, custom: !ENGINES.some((engine) => engine.url === template) });
      }, "The search engine wasn’t saved. Try again.");
    },
    [getOwner, current, onSave, edit, fail, perform],
  );
  const [publish, run] = useScopedCommandControls(`${windowId}:search-engine`, () => {
    const original = getOwner();
    return current(original) ? () => current(original) : undefined;
  });
  function changeDraft(next: string) {
    if (!current(getOwner()) || getOwner().pending) return;
    draftRef.current = next;
    edit({ draft: next });
    clearFailure();
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
              if (!current(getOwner()) || getOwner().pending)
                throw new Error("Choose the current search engine control.");
              edit((active) => ({ custom: !active.custom }));
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
