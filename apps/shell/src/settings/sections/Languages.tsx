import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import { useRef, useState } from "react";
import { bridge, inMock, inNativeHost } from "../../bridge";
import { useNativePreference, NativePreferenceRetry } from "./use-native-preference";
import { PreferenceAction, usePreferenceCommand } from "./preference-command";
const read = () => bridge.languagePreferences();
const write = (selected: string[]) =>
  bridge.languagePreferences(selected).then((value) => ({ ack: value, value }));
const COMMON = [
  "en-US",
  "en-GB",
  "es-ES",
  "fr",
  "de",
  "it",
  "pt-BR",
  "ja",
  "ko",
  "zh-CN",
  "zh-TW",
  "hi",
  "ar",
];

function name(code: string) {
  try {
    const display = new Intl.DisplayNames([navigator.language], { type: "language" }).of(code);
    return display && display !== code ? `${display} (${code})` : code;
  } catch {
    return code;
  }
}

export function LanguagesSetting({ active }: { active: boolean }) {
  const available = inNativeHost || inMock;
  const { owner, scopeId, value, busy, error, perform, refresh } = useNativePreference({
    active,
    available,
    read,
    write,
    formatReadError: String,
  });
  const [draft, setDraft] = useState<{ owner: typeof owner; text: string } | null>(null);
  const draftRef = useRef<typeof draft>(null);
  const [invalid, setInvalid] = useState<{ owner: typeof owner; message: string } | null>(null);
  const input = draft?.owner === owner ? draft.text : "";
  const inputRef = useRef<HTMLInputElement>(null);
  const current = () => value && owner.owns(value) && !busy && !value.managed;
  const save = (selected: string[]) => {
    if (!current() || !selected.length || selected.length > 20)
      return Promise.reject(new Error("Choose the current languages preference."));
    setInvalid(null);
    const completion = perform(selected, value!);
    void completion.then(
      () => {
        if (owner.current() && draftRef.current === draft && inputRef.current?.value === input) {
          const cleared = { owner, text: "" };
          draftRef.current = cleared;
          setDraft(cleared);
        }
      },
      () => {},
    );
    return completion;
  };
  const [addRef, add] = usePreferenceCommand<HTMLFormElement>("add-site-language", scopeId, () => {
    if (!current() || draftRef.current !== draft || inputRef.current?.value !== input)
      return Promise.reject(new Error("Choose the current language draft."));
    const code = input.trim();
    const message = !/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(code)
      ? "Enter a language code such as es-ES."
      : value!.selected.some((item) => item.toLowerCase() === code.toLowerCase())
        ? "That language is already listed."
        : value!.selected.length >= 20
          ? "Languages are limited to 20."
          : "";
    if (message) {
      setInvalid({ owner, message });
      return Promise.reject(new Error(message));
    }
    return save([...value!.selected, code]);
  });
  if (bridge.privateMode)
    return (
      <span className="hint">
        Languages follow the regular Profile and cannot be changed in Private mode.
      </span>
    );
  if (!available) return <span className="hint">Available in the Aux desktop app.</span>;
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
      <span className="hint">
        {message || "Reading languages…"} {message && retry}
      </span>
    );
  const editable = !busy && !value.managed;
  return (
    <div className="settings-startup">
      {value.managed && <span className="hint">Managed by your organization</span>}
      {value.forced.length > 0 && (
        <span className="hint">Required by policy: {value.forced.map(name).join(", ")}</span>
      )}
      <div className="settings-startup-pages">
        {value.selected.map((code, index) => (
          <div className="row" key={code}>
            <span className="hint grow">{name(code)}</span>
            <PreferenceAction
              command="move-site-language-up"
              scopeId={scopeId}
              {...smallGhostButtonProps}
              aria-label={`Move ${code} up`}
              disabled={!editable || index === 0}
              invoke={() => {
                if (index === 0) return Promise.reject(new Error("Choose a language with a previous row."));
                const next = [...value.selected];
                const previous = next[index - 1]!;
                next[index - 1] = next[index]!;
                next[index] = previous;
                return save(next);
              }}
            >
              ↑
            </PreferenceAction>
            <PreferenceAction
              command="move-site-language-down"
              scopeId={scopeId}
              {...smallGhostButtonProps}
              aria-label={`Move ${code} down`}
              disabled={!editable || index === value.selected.length - 1}
              invoke={() => {
                if (index === value.selected.length - 1)
                  return Promise.reject(new Error("Choose a language with a following row."));
                const next = [...value.selected];
                const following = next[index + 1]!;
                next[index + 1] = next[index]!;
                next[index] = following;
                return save(next);
              }}
            >
              ↓
            </PreferenceAction>
            <PreferenceAction
              command="remove-site-language"
              scopeId={scopeId}
              {...smallGhostButtonProps}
              aria-label={`Remove ${code}`}
              disabled={!editable || value.selected.length === 1}
              invoke={() => save(value.selected.filter((item) => item !== code))}
            >
              Remove
            </PreferenceAction>
          </div>
        ))}
        <form
          ref={addRef}
          className="row"

          onSubmit={(event) => {
            event.preventDefault();
            add(event);
          }}
        >
          <input
            ref={inputRef}
            className="field-input grow"
            aria-label="Language code"
            list="aux-common-languages"
            placeholder="Add a language, e.g. es-ES"
            value={input}
            disabled={!editable}
            onChange={(event) => {
              const next = { owner, text: event.target.value };
              draftRef.current = next;
              setDraft(next);
            }}
          />
          <datalist id="aux-common-languages">
            {COMMON.map((code) => (
              <option value={code} key={code}>
                {name(code)}
              </option>
            ))}
          </datalist>
          <button
            {...smallButtonProps}
            type="submit"
            data-command-id="add-site-language"
            disabled={!editable || !input.trim()}
          >
            Add
          </button>
        </form>
      </div>
      {message && (
        <span role="alert" className="field-error">
          {message} {retry}
        </span>
      )}
    </div>
  );
}
