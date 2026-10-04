import { useSettingsSaveOwner } from "../settings/sections/use-settings-save-owner";
import { useScopedCommandControls } from "../scoped-command-controls";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { isSearchEngineTemplate, SEARCH_ENGINE_TEMPLATE_ERROR } from "@aux/contracts/search-engine";
import { bridge } from "../bridge";
export interface EngineRow {
  keyword: string;
  name: string;
  template: string;
}
type Draft = { keyword: string; name: string; template: string };
const emptyDraft = (): Draft => ({ keyword: "", name: "", template: "" });
/** Keyword engines merge over built-ins; saving an existing keyword replaces it. */
export function SearchEnginesSetting({
  value,
  onSave,
}: {
  value: EngineRow[];
  onSave: (value: EngineRow[]) => Promise<boolean>;
}) {
  const windowId = bridge.windowId,
    privateMode = bridge.privateMode,
    snapshot = JSON.stringify(value);
  const identity = useMemo(() => ([snapshot, windowId, privateMode]), [snapshot, windowId, privateMode]);
  const draftIdentity = useMemo(() => ([windowId, privateMode]), [windowId, privateMode]);
  const [getOwner,current,busy,error,fail,clearFailure,perform] = useSettingsSaveOwner(identity,windowId,privateMode);
  const [editing, setEditing] = useState({ identity: draftIdentity, draft: emptyDraft() });
  const draft = editing.identity === draftIdentity ? editing.draft : emptyDraft();
  const draftRef = useRef(draft);
  useLayoutEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  const save = useCallback(
    (next: EngineRow[], clearDraft = false) => {
      const original = getOwner(),
        savedDraft = draftRef.current;
      if (!current(original) || original.pending)
        throw new Error("Choose the current keyword engine control.");
      return perform(original, savedDraft, draftRef, () => onSave(next), () => {
        if (clearDraft) {
          const fresh = emptyDraft();
          draftRef.current = fresh;
          setEditing({ identity: draftIdentity, draft: fresh });
        }
      }, "The engines weren’t saved. Try again.");
    },
    [getOwner, current, onSave, draftIdentity, perform],
  );
  function add() {
    const original = getOwner();
    if (!current(original) || original.pending) throw new Error("Choose the current keyword engine control.");
    const { keyword, name, template } = draftRef.current,
      kw = keyword.trim().toLowerCase();
    const invalid = !/^[a-z][a-z0-9_-]{0,15}$/.test(kw)
      ? "Keywords start with a letter — letters, digits, _ or - up to 16 characters."
      : !name.trim()
        ? "Name the engine (shown beside the address chip)."
        : !isSearchEngineTemplate(template.trim())
          ? SEARCH_ENGINE_TEMPLATE_ERROR
          : "";
    if (invalid) {
      fail(original, invalid);
      return false;
    }
    return save(
      [
        ...value.filter((engine) => engine.keyword !== kw),
        { keyword: kw, name: name.trim().slice(0, 60), template: template.trim() },
      ],
      true,
    );
  }
  const [publish, run] = useScopedCommandControls(`${windowId}:keyword-engines`, () => {
    const original = getOwner();
    return current(original) ? () => current(original) : undefined;
  });
  function change(field: keyof Draft, text: string) {
    if (!current(getOwner()) || getOwner().pending) return;
    const next = { ...draftRef.current, [field]: text };
    draftRef.current = next;
    setEditing({ identity: draftIdentity, draft: next });
    clearFailure();
  }
  return (
    <div className="search-engines-setting">
      {value.length > 0 && (
        <ul className="engine-list">
          {value.map((engine) => (
            <li key={engine.keyword} className="engine-row">
              <code className="engine-kw">{engine.keyword}</code>
              <span className="engine-name">{engine.name}</span>
              <span className="engine-url hint">{engine.template}</span>
              <button
                ref={(element) =>
                  publish(`remove:${engine.keyword}`, "remove-keyword-search-engine", element, () =>
                    save(value.filter((item) => item.keyword !== engine.keyword)),
                  )
                }
                className="btn sm ghost"
                disabled={busy}
                aria-label={`Remove ${engine.keyword} engine`}
                onClick={(event) => run("remove-keyword-search-engine", event)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="engine-add">
        <div className="row">
          <input
            aria-label="Keyword"
            placeholder="kw"
            value={draft.keyword}
            disabled={busy}
            onChange={(event) => change("keyword", event.target.value)}
            style={{ width: 72 }}
          />
          <input
            aria-label="Engine name"
            placeholder="Name"
            value={draft.name}
            disabled={busy}
            onChange={(event) => change("name", event.target.value)}
            style={{ width: 140 }}
          />
          <input
            ref={(element) => publish("input", "add-keyword-search-engine", element, add)}
            className="grow"
            aria-label="Search URL"
            placeholder="https://example.com/search?q=%s"
            value={draft.template}
            disabled={busy}
            onChange={(event) => change("template", event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                event.preventDefault();
                run("add-keyword-search-engine", event);
              }
            }}
          />
          <button
            ref={(element) => publish("add", "add-keyword-search-engine", element, add)}
            className="btn sm"
            disabled={busy || !draft.keyword.trim() || !draft.name.trim() || !draft.template.trim()}
            onClick={(event) => run("add-keyword-search-engine", event)}
          >
            Add
          </button>
        </div>
        <p className="hint">
          Type <code>keyword terms</code> in the address bar — e.g. <code>gh aux browser</code>. Built-ins
          (ddg, g, gh, mdn, npm, yt, wiki, so, maps) merge unless you override the keyword.
        </p>
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
