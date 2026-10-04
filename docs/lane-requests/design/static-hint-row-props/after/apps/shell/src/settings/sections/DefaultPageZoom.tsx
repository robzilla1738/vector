import { staticHintProps, staticRowProps } from "../../ui/class-props";
import { bridge, inMock, inNativeHost } from "../../bridge";
import { useNativePreference, NativePreferenceRetry } from "./use-native-preference";
import { usePreferenceCommand } from "./preference-command";
type Preference = Awaited<ReturnType<typeof bridge.defaultPageZoom>>;
const CHOICES = [50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200];
const availableNow = () => inNativeHost || inMock;
const read = () => bridge.defaultPageZoom();
const write = (percentage: number) =>
  bridge.defaultPageZoom(percentage).then((value) => ({ ack: value, value }));
export function DefaultPageZoomSetting({ active }: { active: boolean }) {
  const available = inNativeHost || inMock;
  const { owner, scopeId, value, busy, error, perform, refresh } = useNativePreference<Preference, number>({
    active,
    available,
    availableNow,
    read,
    write,
    formatReadError: String,
    refusal: "Choose the current default page zoom control.",
  });
  const [controlRef, run] = usePreferenceCommand<HTMLSelectElement>(
    "set-default-page-zoom",
    scopeId,
    (original) => {
      if (!owner.current() || !value || !owner.owns(value) || value.managed || busy)
        return Promise.reject(new Error("Choose the current unmanaged default page zoom."));
      const percentage = Number(original.value);
      if (!CHOICES.includes(percentage) && percentage !== value.percentage)
        return Promise.reject(new Error("Choose an available default page zoom."));
      return perform(percentage, value);
    },
  );
  if (bridge.privateMode)
    return (
      <span {...staticHintProps}>
        Default page zoom follows the regular Profile and cannot be changed in Private mode.
      </span>
    );
  if (!available) return <span {...staticHintProps}>Available in the Aux desktop app.</span>;
  if (!active || bridge.windowKind !== "normal") return null;
  if (!value)
    return (
      <span {...staticHintProps}>
        {error || "Reading default page zoom…"}{" "}
        {error && (
          <NativePreferenceRetry
            command="retry-default-page-zoom"
            scopeId={scopeId}
            disabled={busy}
            read={refresh}
          />
        )}
      </span>
    );
  return (
    <div {...staticRowProps}>
      <select
        ref={controlRef}
        data-command-id="set-default-page-zoom"
        aria-label="Default page zoom"
        value={value.percentage}
        disabled={busy || value.managed}
        onChange={run}
      >
        {CHOICES.map((percentage) => (
          <option key={percentage} value={percentage}>
            {percentage}%
          </option>
        ))}
        {!CHOICES.includes(value.percentage) && <option value={value.percentage}>{value.percentage}%</option>}
      </select>
      {value.managed && <span {...staticHintProps}>Managed by your organization</span>}
      {error && (
        <span role="alert" className="field-error">
          {error}{" "}
          <NativePreferenceRetry
            command="retry-default-page-zoom"
            scopeId={scopeId}
            disabled={busy}
            read={refresh}
          />
        </span>
      )}
    </div>
  );
}
