import { staticHintProps, staticRowProps } from "../../ui/class-props";
import { usePreferenceCommand } from "./preference-command";
import type { ReactNode } from "react";
import { bridge } from "../../bridge";
import { Switch } from "../../ui";
import { useNativePreference, NativePreferenceRetry } from "./use-native-preference";
type Preference = { enabled: boolean; managed: boolean };
/** Fixed native preference producers share original-window and ACK delivery rules. */
export function NativePreferenceControl<T extends Preference>({
  active,
  available,
  kind,
  label,
  reading,
  privateHint,
  read,
  write,
  writable,
  hint,
}: {
  active: boolean;
  available: boolean;
  kind: "spell-check" | "https-first";
  label: string;
  reading: string;
  privateHint: string;
  read(): Promise<T>;
  write(enabled: boolean, current: () => boolean): Promise<{ ack: unknown; value?: T }>;
  writable(value: T): boolean;
  hint(value: T): ReactNode;
}) {
  const { owner, scopeId, value, busy, error, perform, refresh } = useNativePreference({
    active,
    available,
    read,
    write,
  });
  const command = `toggle-${kind}`, retry = `retry-${kind}`;
  const [controlRef, run] = usePreferenceCommand<HTMLInputElement>(command, scopeId, () => {
    if (!value || !owner.owns(value) || value.managed || !writable(value) || busy)
      return Promise.reject(new Error("Choose the current unmanaged preference control."));
    return perform(!value.enabled, value);
  });
  if (bridge.privateMode) return <span {...staticHintProps}>{privateHint}</span>;
  if (!available) return <span {...staticHintProps}>Available in the Aux desktop app.</span>;
  if (!active || bridge.windowKind !== "normal") return null;
  return (
    <div {...staticRowProps}>
      {value ? (
        <Switch
          controlRef={controlRef}
          data-command-id={command}
          aria-label={label}
          checked={value.enabled}
          disabled={busy || value.managed || !writable(value)}
          onChange={run}
        />
      ) : (
        <span {...staticHintProps}>{reading}</span>
      )}
      {value && hint(value)}
      {error && (
        <span role="alert" className="field-error">
          {error} <NativePreferenceRetry command={retry} scopeId={scopeId} disabled={busy} read={refresh} />
        </span>
      )}
    </div>
  );
}
