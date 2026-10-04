import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import { useRef, useState } from "react";
import { bridge, inMock, inNativeHost } from "../../bridge";
import { useNativePreference, NativePreferenceRetry } from "./use-native-preference";
import { PreferenceAction, usePreferenceCommand } from "./preference-command";
type Startup = Awaited<ReturnType<typeof bridge.startupPreferences>>;
type Mode = Startup["mode"];
const MODES: Mode[] = ["new-tab", "continue", "pages", "continue-and-pages"];
const PAGE_MODES: Mode[] = ["pages", "continue-and-pages"];
const read = () => bridge.startupPreferences();
const write = (next: Pick<Startup, "mode" | "urls">) =>
  bridge.startupPreferences(next).then((value) => ({ ack: value, value }));
export function ordinaryWebUrl(value: string): string | null {
  const input = value.trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(input) && !/^https?:\/\//i.test(input)) return null;
  if (input.startsWith("//")) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.href.length > 2048)
      return null;
    return url.href;
  } catch {
    return null;
  }
}

export function StartupSetting({ active }: { active: boolean }) {
  const available = inNativeHost || inMock;
  const { owner, scopeId, value, busy, error, perform, refresh } = useNativePreference({
    active,
    available,
    read,
    write,
  });
  const [draft, setDraft] = useState<{ owner: typeof owner; text: string } | null>(null);
  const draftRef = useRef<typeof draft>(null);
  const [invalid, setInvalid] = useState<{ owner: typeof owner; message: string } | null>(null);
  const input = draft?.owner === owner ? draft.text : "";
  const inputRef = useRef<HTMLInputElement>(null);
  const current = () => value && owner.owns(value) && !busy && !value.managed;
  const save = (next: Pick<Startup, "mode" | "urls">) => {
    if (!current()) return Promise.reject(new Error("Choose the current startup preference."));
    setInvalid(null);
    return perform(next, value!);
  };
  const [modeRef, changeMode] = usePreferenceCommand<HTMLSelectElement>(
    "set-startup-mode",
    scopeId,
    (original) => {
      if (!current()) return Promise.reject(new Error("Choose the current startup preference."));
      const mode = original.value as Mode;
      if (!MODES.includes(mode) || (PAGE_MODES.includes(mode) && !value?.urls.length))
        return Promise.reject(new Error("Choose a current startup mode."));
      return save({ mode, urls: value!.urls });
    },
  );
  const [addRef, add] = usePreferenceCommand<HTMLFormElement>("add-startup-page", scopeId, () => {
    if (!current() || draftRef.current !== draft || inputRef.current?.value !== input)
      return Promise.reject(new Error("Choose the current startup page draft."));
    const url = ordinaryWebUrl(input);
    const message = !url
      ? "Enter an ordinary http or https page URL."
      : value!.urls.includes(url)
        ? "That startup page is already listed."
        : value!.urls.length >= 20
          ? "Startup pages are limited to 20."
          : "";
    if (message) {
      setInvalid({ owner, message });
      return Promise.reject(new Error(message));
    }
    const completion = save({
      mode: PAGE_MODES.includes(value!.mode) ? value!.mode : "pages",
      urls: [...value!.urls, url!],
    });
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
  });
  if (bridge.privateMode)
    return (
      <span className="hint">Startup uses your regular Profile and cannot be changed in Private mode.</span>
    );
  if (!available) return <span className="hint">Available in the Aux desktop app.</span>;
  if (!active || bridge.windowKind !== "normal") return null;
  const message = invalid?.owner === owner ? invalid.message : error;
  const retry = (
    <NativePreferenceRetry
      command="retry-startup-preferences"
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
        {message || "Reading startup preference…"} {message && retry}
      </span>
    );
  const editable = !busy && !value.managed;
  return (
    <div className="settings-startup">
      <select
        ref={modeRef}
        data-command-id="set-startup-mode"
        aria-label="On startup"
        value={value.mode}
        disabled={!editable}
        onChange={changeMode}
      >
        <option value="new-tab">Open a new tab</option>
        <option value="continue">Continue where you left off</option>
        <option value="pages" disabled={!value.urls.length}>
          Open specific pages
        </option>
        <option value="continue-and-pages" disabled={!value.urls.length}>
          Continue and open specific pages
        </option>
      </select>
      {value.managed && <span className="hint">Managed by your organization</span>}
      <div className="settings-startup-pages">
        {value.urls.map((url) => (
          <div className="row" key={url}>
            <span className="hint mono selectable grow">{url}</span>
            <PreferenceAction
              command="remove-startup-page"
              scopeId={scopeId}
              {...smallGhostButtonProps}
              aria-label={`Remove startup page ${url}`}
              disabled={!editable}
              invoke={() => {
                const urls = value.urls.filter((item) => item !== url);
                const mode =
                  !urls.length && PAGE_MODES.includes(value.mode)
                    ? value.mode === "pages"
                      ? "new-tab"
                      : "continue"
                    : value.mode;
                return save({ mode, urls });
              }}
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
            aria-label="Startup page URL"
            type="text"
            inputMode="url"
            placeholder="https://example.com"
            value={input}
            disabled={!editable}
            onChange={(event) => {
              const next = { owner, text: event.target.value };
              draftRef.current = next;
              setDraft(next);
            }}
          />
          <button
            {...smallButtonProps}
            type="submit"
            data-command-id="add-startup-page"
            disabled={!editable || !input.trim()}
          >
            Add page
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
