import { usePreferenceCommand } from "./preference-command";
import { bridge, inMock, inNativeHost } from "../../bridge";
import { Switch } from "../../ui";
import { useNativePreference, NativePreferenceRetry } from "./use-native-preference";
const read = () => bridge.keepRuntimeInBackground();
const write = (enabled: boolean) =>
  bridge.keepRuntimeInBackground(enabled).then((value) => ({ ack: value, value }));
export function BackgroundRuntimeSetting({ active }: { active: boolean }) {
  const available = inNativeHost || inMock;
  const { owner, scopeId, value, busy, error, perform, refresh } = useNativePreference({
    active,
    available,
    read,
    write,
    formatReadError: String,
  });
  const [controlRef, run] = usePreferenceCommand<HTMLInputElement>("toggle-background-runtime", scopeId, () => {
      if (
        !value ||
        !owner.owns(value) ||
        value.managed ||
        !value.available ||
        busy
      )
        return Promise.reject(new Error("Choose the current available background runtime control."));
      return perform(!value.enabled, value);
  });
  if (bridge.privateMode)
    return (
      <span className="hint">
        Background runtime follows the regular Profile and cannot be changed in Private mode.
      </span>
    );
  if (!available) return <span className="hint">Available in the Aux desktop app.</span>;
  if (!active || bridge.windowKind !== "normal") return null;
  if (!value)
    return (
      <span className="hint">
        {error || "Reading background runtime setting…"}{" "}
        {error && (
          <NativePreferenceRetry
            command="retry-background-runtime"
            scopeId={scopeId}
            disabled={busy}
            read={refresh}
          />
        )}
      </span>
    );
  return (
    <div className="row">
      <Switch
        controlRef={controlRef}
        data-command-id="toggle-background-runtime"
        aria-label="Keep Aux running after closing all windows"
        checked={value.enabled}
        disabled={busy || value.managed || !value.available}
        onChange={run}
      />
      {value.managed && <span className="hint">Managed by your organization</span>}
      {!value.available && <span className="hint">Browser background mode is disabled.</span>}
      {error && (
        <span role="alert" className="field-error">
          {error}{" "}
          <NativePreferenceRetry
            command="retry-background-runtime"
            scopeId={scopeId}
            disabled={busy}
            read={refresh}
          />
        </span>
      )}
    </div>
  );
}
