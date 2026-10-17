import { staticFieldProps } from "../../ui/class-props";
import { staticHintProps } from "../../ui/class-props";
import { smallButtonProps } from "../../ui/button-props";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_NIGHT_SHIFT, NightShiftSettingsSchema } from "@aux/contracts";
import { useStore } from "../../store";
import { bridge } from "../../bridge";
import { executeCommand } from "../../commands";
import { guardCommandCompletion, reportCommandCompletionFailure } from "../../command-completion";
import { registerScopedControl } from "../../scoped-control-commands";
import {
  nativeCheckboxTypeProps,
  nativeNumberTypeProps,
  nativeAlertRoleProps,
} from "../../ui/native-attribute-props";
type Draft = ReturnType<typeof NightShiftSettingsSchema.parse>;
type Command = "save-night-shift-draft" | "toggle-night-shift-enabled" | "toggle-night-shift-ac";
class NightOwner {
  #live = true;
  #pending = false;
  constructor(readonly identity: string) {}
  current() {
    const [privateMode, windowId, windowKind, saved] = JSON.parse(this.identity);
    return (
      this.#live &&
      !privateMode &&
      windowKind === "normal" &&
      !bridge.privateMode &&
      bridge.windowKind === "normal" &&
      bridge.windowId === windowId &&
      JSON.stringify(useStore.getState().settings.nightShift ?? DEFAULT_NIGHT_SHIFT) === saved
    );
  }
  retire() {
    this.#live = false;
  }
  begin() {
    if (!this.current() || this.#pending) return false;
    this.#pending = true;
    return true;
  }
  finish() {
    this.#pending = false;
  }
}
function NightControl({
  command,
  scopeId,
  invoke,
  disabled,
  checked,
  children,
}: {
  command: Command;
  scopeId: string;
  invoke(): unknown;
  disabled: boolean;
  checked?: boolean;
  children: string;
}) {
  const element = useRef<HTMLInputElement | HTMLButtonElement>(null);
  useLayoutEffect(
    () => (element.current ? registerScopedControl(element.current, command, scopeId, invoke) : undefined),
    [command, scopeId, invoke],
  );
  const run = (event: Event) => {
    const completion = executeCommand(command, { payload: { scopeId }, nativeInputEvent: event });
    void completion.catch((reason) => reportCommandCompletionFailure(completion, reason, () => {}));
  };
  return checked === undefined ? (
    <button
      ref={(node) => {
        element.current = node;
      }}
      {...smallButtonProps}
      data-command-id={command}
      disabled={disabled}
      onClick={(event) => run(event.nativeEvent)}
    >
      {children}
    </button>
  ) : (
    <label>
      <input
        ref={(node) => {
          element.current = node;
        }}
        data-command-id={command}
        disabled={disabled}
        {...nativeCheckboxTypeProps}
        checked={checked}
        onChange={(event) => run(event.nativeEvent)}
      />
      {children}
    </label>
  );
}
export function NightSettings() {
  const saved = useStore((state) => state.settings.nightShift);
  const scopeId = useId();
  const identity = String(
    JSON.stringify([
      bridge.privateMode,
      bridge.windowId,
      bridge.windowKind,
      JSON.stringify(saved ?? DEFAULT_NIGHT_SHIFT),
    ]),
  );
  const owner = useMemo(() => new NightOwner(identity), [identity]);
  useLayoutEffect(() => () => owner.retire(), [owner]);
  const [edited, setEdited] = useState<{ owner: NightOwner; value: Draft } | null>(null);
  const draft =
    edited?.owner === owner ? edited.value : NightShiftSettingsSchema.parse(saved ?? DEFAULT_NIGHT_SHIFT);
  const [failure, setFailure] = useState<{ owner: NightOwner; message: string } | null>(null);
  const [pending, setPending] = useState<NightOwner | null>(null);
  const busy = pending === owner;
  const error = failure?.owner === owner ? failure.message : "";
  function edit(next: Draft) {
    if (!owner.current() || busy) throw new Error("Choose the current night shift settings.");
    setEdited({ owner, value: next });
  }
  function save(): Promise<unknown> {
    if (!owner.begin()) return Promise.reject(new Error("Choose the current night shift settings."));
    const parsed = NightShiftSettingsSchema.safeParse(draft);
    if (!parsed.success) {
      owner.finish();
      const reason = new Error(parsed.error.issues[0]?.message ?? "Review these settings.");
      setFailure({ owner, message: reason.message });
      return guardCommandCompletion(Promise.reject(reason), () => owner.current());
    }
    setFailure(null);
    setPending(owner);
    const original = executeCommand("configure-night-shift", { payload: { nightShift: parsed.data } })
      .catch((reason) => {
        if (owner.current())
          setFailure({
            owner,
            message: `Night shift settings could not be saved. ${reason instanceof Error ? reason.message : "Try again."}`,
          });
        throw reason;
      })
      .finally(() => {
        owner.finish();
        if (owner.current()) setPending(null);
      });
    return guardCommandCompletion(original, () => owner.current());
  }
  if (bridge.privateMode || bridge.windowKind !== "normal") return null;
  return (
    <section {...staticFieldProps} aria-label="Night shift settings">
      <p {...staticHintProps}>
        Aux works within this local time window while your Mac is awake. Only work you queue can run. Actions
        that need your approval wait for morning.
      </p>
      <NightControl
        command="toggle-night-shift-enabled"
        scopeId={scopeId}
        disabled={busy}
        checked={draft.enabled}
        invoke={() => edit({ ...draft, enabled: !draft.enabled })}
      >
        Enable overnight work
      </NightControl>
      <label>
        Start
        <input
          disabled={busy}
          type="time"
          value={draft.start}
          onChange={(event) => edit({ ...draft, start: event.target.value })}
        />
      </label>
      <label>
        End
        <input
          disabled={busy}
          type="time"
          value={draft.end}
          onChange={(event) => edit({ ...draft, end: event.target.value })}
        />
      </label>
      <label>
        Nightly limit ($)
        <input
          disabled={busy}
          {...nativeNumberTypeProps}
          min="0.01"
          step="0.01"
          value={draft.nightlyUsd}
          onChange={(event) => edit({ ...draft, nightlyUsd: event.target.valueAsNumber })}
        />
      </label>
      <label>
        Per-task limit ($)
        <input
          disabled={busy}
          {...nativeNumberTypeProps}
          min="0.01"
          step="0.01"
          value={draft.perTaskUsd}
          onChange={(event) => edit({ ...draft, perTaskUsd: event.target.valueAsNumber })}
        />
      </label>
      <NightControl
        command="toggle-night-shift-ac"
        scopeId={scopeId}
        disabled={busy}
        checked={draft.requireAC}
        invoke={() => edit({ ...draft, requireAC: !draft.requireAC })}
      >
        Require AC power
      </NightControl>
      <p {...staticHintProps}>
        Allow Aux to continue in the background in Profile settings. Aux does not schedule a wake or change
        your Mac’s power settings.
      </p>
      <NightControl command="save-night-shift-draft" scopeId={scopeId} disabled={busy} invoke={save}>
        {busy ? "Saving…" : "Save night shift settings"}
      </NightControl>
      {error && <p {...nativeAlertRoleProps}>{error}</p>}
    </section>
  );
}
