import { staticFieldErrorProps } from "../../ui/class-props";
import { staticHintProps, staticRowProps } from "../../ui/class-props";
import { usePreferenceCommand } from "./preference-command";
import { bridge, inMock, inNativeHost } from "../../bridge";
import { useNativePreference, NativePreferenceRetry } from "./use-native-preference";
type Preference = Awaited<ReturnType<typeof bridge.automaticPictureInPicture>>;
const read = () => bridge.automaticPictureInPicture();
const write = (mode: Preference["mode"]) =>
  bridge.automaticPictureInPicture(mode).then((value) => ({ ack: value, value }));
const MODES = ["ask", "block", "allow"] as const;
export function PictureInPictureSetting({ active }: { active: boolean }) {
  const available = inNativeHost || inMock;
  const { owner, scopeId, value, busy, error, perform, refresh } = useNativePreference({
    active,
    available,
    read,
    write,
    formatReadError: String,
  });
  const [controlRef, run] = usePreferenceCommand<HTMLSelectElement>("set-auto-picture-in-picture", scopeId, (original) => {
      if (!value || !owner.owns(value) || value.managed || busy)
        return Promise.reject(new Error("Choose the current unmanaged picture in picture control."));
      const mode = original.value;
      if (!MODES.some((candidate) => candidate === mode))
        return Promise.reject(new Error("Choose an available picture in picture mode."));
      return perform(mode as Preference["mode"], value);
  });
  if (bridge.privateMode)
    return (
      <span {...staticHintProps}>
        Automatic picture in picture follows the regular Profile and cannot be changed in Private mode.
      </span>
    );
  if (!available) return <span {...staticHintProps}>Available in the Aux desktop app.</span>;
  if (!active || bridge.windowKind !== "normal") return null;
  if (!value)
    return (
      <span {...staticHintProps}>
        {error || "Reading picture-in-picture setting…"}{" "}
        {error && (
          <NativePreferenceRetry
            command="retry-auto-picture-in-picture"
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
        data-command-id="set-auto-picture-in-picture"
        aria-label="Automatic picture in picture"
        value={value.mode}
        disabled={busy || value.managed}
        onChange={run}
      >
        <option value="ask">Ask each site</option>
        <option value="block">Block automatic picture in picture</option>
        <option value="allow">Allow on all sites</option>
      </select>
      {value.managed && <span {...staticHintProps}>Managed by your organization</span>}
      {error && (
        <span role="alert" {...staticFieldErrorProps}>
          {error}{" "}
          <NativePreferenceRetry
            command="retry-auto-picture-in-picture"
            scopeId={scopeId}
            disabled={busy}
            read={refresh}
          />
        </span>
      )}
    </div>
  );
}
