import { bridge, inMock, inNativeHost } from "../../bridge";
import { MemorySaverMinutesSchema, type MemorySaverSettings } from "@aux/contracts/memory-saver";
import { useNativePreference } from "./use-native-preference";
import { smallGhostButtonProps } from "../../ui/button-props";
import { nativeAlertRoleProps } from "../../ui/native-attribute-props";

const read = () => bridge.memorySaverGet();
const write = (minutes: MemorySaverSettings["minutes"]) =>
  bridge.memorySaverSet(minutes).then((value) => ({ ack: value, value }));

export function MemorySaverSetting({ active }: { active: boolean }) {
  const available = inNativeHost || inMock;
  const { value, busy, error, perform, refresh } = useNativePreference({ active, available, read, write });
  if (!available) return <span>Available in the Aux desktop app.</span>;
  return (
    <>
      {value ? (
        <select
          aria-label="Memory saver"
          value={String(value.minutes)}
          disabled={busy || value.managed}
          onChange={(event) => {
            const minutes = MemorySaverMinutesSchema.parse(Number(event.target.value));
            void perform(minutes, value).catch(() => {});
          }}
        >
          <option value="0">Off</option>
          <option value="1">After 1 minute</option>
          <option value="15">After 15 minutes</option>
          <option value="30">After 30 minutes</option>
          <option value="60">After 1 hour</option>
        </select>
      ) : (
        !error && <span>Reading memory saver…</span>
      )}
      {value?.managed && <small>Managed by your organization</small>}
      {error && (
        <span {...nativeAlertRoleProps}>
          {error}{" "}
          <button {...smallGhostButtonProps} disabled={busy} onClick={() => void refresh()}>
            Retry
          </button>
        </span>
      )}
    </>
  );
}
