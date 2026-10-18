import { staticFieldErrorProps, staticHintProps, staticMenuItemProps } from "../../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import { useMemo, useRef, useState } from "react";
import { bridge, inMock, inNativeHost } from "../../bridge";
import { useNativePreference, NativePreferenceRetry } from "./use-native-preference";
import { PreferenceAction, usePreferenceCommand } from "./preference-command";
import { nativeAlertRoleProps } from "../../ui/native-attribute-props";
import { shellIconClose, shellIconMore, shellIconPlusSm, shellIconUp, shellIconDown } from "../../ui/icons";
import "./Languages.css";
import { LANGUAGE_CODES } from "./language-catalog";
import { Popover } from "../../ui/popover";
import { moveListFocus } from "../../keyboard-list";
const read = () => bridge.languagePreferences();
const write = (selected: string[]) =>
  bridge.languagePreferences(selected).then((value) => ({ ack: value, value }));
function languageName(code: string, display: Intl.DisplayNames) {
  try {
    return display.of(code) || code;
  } catch {
    return code;
  }
}
function LanguageSelect({
  code,
  options,
  disabled,
  scopeId,
  change,
  name,
}: {
  code: string;
  options: string[];
  disabled: boolean;
  scopeId: string;
  change(code: string): void;
  name(code: string): string;
}) {
  const [ref, run] = usePreferenceCommand<HTMLSelectElement>("set-site-language", scopeId, (control) =>
    change(control.value),
  );
  return (
    <select ref={ref} aria-label={`Language ${code}`} disabled={disabled} value={code} onChange={run}>
      {options.map((item) => (
        <option key={item} value={item}>
          {name(item)}
        </option>
      ))}
    </select>
  );
}
function AddLanguage({
  options,
  disabled,
  scopeId,
  name,
  add,
  current,
  custom,
}: {
  options: string[];
  disabled: boolean;
  scopeId: string;
  name(code: string): string;
  add(code: string): void;
  current(): boolean;
  custom(): void;
}) {
  const activate = useRef<(() => void) | null>(null);
  const [ref, run] = usePreferenceCommand<HTMLButtonElement>("add-site-language", scopeId, () => {
    if (!current() || !activate.current) throw new Error("Choose the current languages preference.");
    activate.current();
  });
  return (
    <Popover
      label="Add a language"
      className="language-add"
      disabled={disabled}
      trigger={<>{shellIconPlusSm} Add</>}
      triggerControl={(node, toggle) => {
        activate.current = toggle;
        ref(node);
      }}
      onTrigger={run}
    >
      {(close) => (
        <div
          className="language-add-menu"
          onKeyDown={(event) => moveListFocus(event, "button:not(:disabled)")}
        >
          {options.map((code) => (
            <PreferenceAction
              key={code}
              {...staticMenuItemProps}
              command="add-site-language"
              scopeId={scopeId}
              aria-label={`Add ${name(code)}`}
              invoke={() => {
                add(code);
                close();
              }}
            >
              {name(code)}
            </PreferenceAction>
          ))}
          <hr className="menu-sep" />
          <button
            {...staticMenuItemProps}
            type="button"
            onClick={() => {
              if (!current()) return;
              custom();
              close();
            }}
          >
            Use a language code…
          </button>
        </div>
      )}
    </Popover>
  );
}
export function LanguagesSetting({ active, onClose }: { active: boolean; onClose?: () => void }) {
  const displayNames = useMemo(
    () => new Intl.DisplayNames([navigator.language], { type: "language", languageDisplay: "standard" }),
    [navigator.language],
  );
  const name = (code: string) => languageName(code, displayNames);
  const catalog = useMemo(
    () =>
      [...LANGUAGE_CODES].sort((left, right) =>
        languageName(left, displayNames).localeCompare(languageName(right, displayNames), navigator.language),
      ),
    [displayNames],
  );
  const available = inNativeHost || inMock;
  const { owner, scopeId, value, busy, error, perform, refresh } = useNativePreference({
    active,
    available,
    read,
    write,
    formatReadError: String,
  });
  const [draft, setDraft] = useState<{ owner: typeof owner; selected: string[] } | null>(null);
  const draftRef = useRef(draft);
  const [invalid, setInvalid] = useState<{ owner: typeof owner; message: string } | null>(null);
  const [customDraft, setCustomDraft] = useState<{ owner: typeof owner; text: string } | null>(null);
  const customCode = customDraft?.owner === owner ? customDraft.text : "";
  const setCustomCode = (text: string) => setCustomDraft({ owner, text });
  const customInput = useRef<HTMLInputElement>(null);
  const [customOwner, setCustomOwner] = useState<typeof owner | null>(null);
  const drag = useRef<{ owner: typeof owner; code: string } | null>(null);
  const selected = draft?.owner === owner ? draft.selected : (value?.selected ?? []);
  const current = () => value && owner.owns(value) && !busy && !value.managed;
  function edit(next: string[]) {
    if (!current()) throw new Error("Choose the current languages preference.");
    if (
      !next.length ||
      next.length > 20 ||
      new Set(next.map((code) => code.toLowerCase())).size !== next.length
    )
      throw new Error("Choose between one and 20 different languages.");
    const nextDraft = { owner, selected: next };
    draftRef.current = nextDraft;
    setDraft(nextDraft);
    setInvalid(null);
  }
  function move(code: string, target: number) {
    const index = selected.indexOf(code);
    if (index < 0 || target < 0 || target >= selected.length)
      throw new Error("Choose a current language row.");
    const next = [...selected];
    next.splice(index, 1);
    next.splice(target, 0, code);
    edit(next);
  }
  const [addRef, add] = usePreferenceCommand<HTMLFormElement>("add-site-language", scopeId, () => {
    if (!current()) throw new Error("Choose the current languages preference.");
    const code = customInput.current?.value.trim() ?? "";
    const message = !/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(code)
      ? "Enter a language code such as es-ES."
      : selected.some((item) => item.toLowerCase() === code.toLowerCase())
        ? "That language is already listed."
        : selected.length >= 20
          ? "Languages are limited to 20."
          : "";
    if (message) {
      setInvalid({ owner, message });
      throw new Error(message);
    }
    edit([...selected, code]);
    setCustomCode("");
  });
  const changed = !!value && JSON.stringify(selected) !== JSON.stringify(value.selected);
  const save = () => {
    if (!current() || !changed || draftRef.current !== draft)
      throw new Error("Choose the current language draft.");
    const original = owner;
    const completion = perform([...selected], value!);
    return completion.then((ack) => {
      if (original.current() && draftRef.current === draft) onClose?.();
      return ack;
    });
  };
  if (bridge.privateMode)
    return (
      <span {...staticHintProps}>
        Languages follow the regular Profile and cannot be changed in Private mode.
      </span>
    );
  if (!available) return <span {...staticHintProps}>Available in the Aux desktop app.</span>;
  if (!active || bridge.windowKind !== "normal") return null;
  const message = invalid?.owner === owner ? invalid.message : error;
  const retry = (
    <NativePreferenceRetry
      command="retry-language-preferences"
      scopeId={scopeId}
      disabled={busy}
      read={() => {
        setInvalid(null);
        return refresh();
      }}
    />
  );
  if (!value)
    return (
      <span {...staticHintProps}>
        {message || "Reading languages…"} {message && retry}
      </span>
    );
  const editable = !busy && !value.managed;
  const options = [...new Set([...catalog, ...selected])];
  return (
    <div className="language-editor">
      <p className="hint">Websites use the first matching language in this list when available.</p>
      {value.managed && <p className="hint">Managed by your organization</p>}
      {value.forced.length > 0 && (
        <p className="hint">Required by policy: {value.forced.map(name).join(", ")}</p>
      )}
      <ol className="language-list">
        {selected.map((code, index) => (
          <li
            key={code}
            onDragOver={(event) => {
              if (editable && drag.current?.owner === owner) event.preventDefault();
            }}
            onDrop={(event) => {
              event.preventDefault();
              const source = drag.current;
              drag.current = null;
              if (source?.owner === owner && owner.current() && editable) move(source.code, index);
            }}
          >
            <button
              type="button"
              className="language-drag"
              aria-label={`Reorder ${code}`}
              title="Drag to reorder, or use Arrow Up and Arrow Down"
              disabled={!editable}
              draggable={editable}
              onDragStart={(event) => {
                if (!current()) {
                  event.preventDefault();
                  return;
                }
                drag.current = { owner, code };
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", code);
              }}
              onDragEnd={() => {
                drag.current = null;
              }}
              onKeyDown={(event) => {
                if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                event.preventDefault();
                if (!current()) return;
                const target = index + (event.key === "ArrowUp" ? -1 : 1);
                if (target >= 0 && target < selected.length) move(code, target);
              }}
            >
              {shellIconMore}
            </button>
            <span className="language-rank" aria-hidden>
              {index + 1}
            </span>
            <LanguageSelect
              name={name}
              code={code}
              options={options.filter(
                (item) =>
                  item === code || !selected.some((used) => used.toLowerCase() === item.toLowerCase()),
              )}
              disabled={!editable}
              scopeId={scopeId}
              change={(next) => {
                if (!options.includes(next)) throw new Error("Choose a listed language.");
                edit(selected.map((item) => (item === code ? next : item)));
              }}
            />
            <span className="language-row-actions">
              <PreferenceAction
                command="move-site-language-up"
                scopeId={scopeId}
                aria-label={`Move ${code} up`}
                disabled={!editable || index === 0}
                invoke={() => move(code, index - 1)}
              >
                {shellIconUp}
              </PreferenceAction>
              <PreferenceAction
                command="move-site-language-down"
                scopeId={scopeId}
                aria-label={`Move ${code} down`}
                disabled={!editable || index === selected.length - 1}
                invoke={() => move(code, index + 1)}
              >
                {shellIconDown}
              </PreferenceAction>
            </span>
            <PreferenceAction
              command="remove-site-language"
              scopeId={scopeId}
              aria-label={`Remove ${code}`}
              disabled={!editable || selected.length === 1}
              invoke={() => edit(selected.filter((item) => item !== code))}
            >
              {shellIconClose}
            </PreferenceAction>
          </li>
        ))}
      </ol>
      <AddLanguage
        scopeId={scopeId}
        name={name}
        disabled={!editable || selected.length >= 20}
        options={catalog.filter(
          (code) => !selected.some((item) => item.toLowerCase() === code.toLowerCase()),
        )}
        custom={() => setCustomOwner(owner)}
        current={() => !!current()}
        add={(code) => edit([...selected, code])}
      />
      {customOwner === owner && (
        <div className="language-custom">
          <form
            ref={addRef}
            onSubmit={(event) => {
              event.preventDefault();
              add(event);
            }}
          >
            <input
              ref={customInput}
              aria-label="Language code"
              placeholder="e.g. es-ES"
              value={customCode}
              disabled={!editable}
              onChange={(event) => setCustomCode(event.target.value)}
            />
            <button {...smallButtonProps} type="submit" disabled={!editable || !customCode.trim()}>
              Add language
            </button>
          </form>
        </div>
      )}
      {message && (
        <p {...nativeAlertRoleProps} {...staticFieldErrorProps}>
          {message} {retry}
        </p>
      )}
      <footer className="language-actions">
        <button
          {...smallGhostButtonProps}
          type="button"
          onClick={() => {
            draftRef.current = null;
            setDraft(null);
            setCustomCode("");
            setCustomOwner(null);
            setInvalid(null);
            onClose?.();
          }}
        >
          Cancel
        </button>
        <PreferenceAction
          command="save-site-languages"
          scopeId={scopeId}
          {...smallButtonProps}
          disabled={!editable || !changed}
          invoke={save}
        >
          {busy ? "Saving…" : "Save"}
        </PreferenceAction>
      </footer>
    </div>
  );
}
