import { staticFieldErrorProps } from "../../ui/class-props";
import { staticHintProps, staticRowProps } from "../../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import { bridge, inMock, inNativeHost } from "../../bridge";

import { useNativePreference, NativePreferenceRetry } from "./use-native-preference";
import { PreferenceAction } from "./preference-command";
type Folder = { path: string; custom: boolean; error?: string };
const availableNow = () => inNativeHost || inMock;
const read = () => bridge.downloadFolder();
const write = (reset: boolean) => bridge.chooseDownloadFolder(reset).then((value) => ({ ack: value, value }));
export function DownloadFolderSetting({ active }: { active: boolean }) {
  const available = inNativeHost || inMock;
  const {
    owner,
    scopeId,
    value: folder,
    busy,
    error,
    perform: change,
    refresh,
  } = useNativePreference<Folder, boolean>({
    active,
    available,
    availableNow,
    read,
    write,
    refusal: "Choose the current download folder control.",
    writePendingRefusal: "The download folder operation is still pending.",
  });
  function perform(reset: boolean): Promise<unknown> {
    if (!owner.current() || busy || !folder)
      return Promise.reject(new Error("Choose the current download folder control."));
    return change(reset, folder);
  }
  if (bridge.privateMode)
    return <span {...staticHintProps}>Choose a save location for each Private download.</span>;
  if (!available) return <span {...staticHintProps}>Available in the Aux desktop app.</span>;
  if (!active || bridge.windowKind !== "normal") return null;
  return (
    <div aria-busy={busy}>
      {busy && !folder && (
        <output {...staticHintProps} data-block>
          Loading download folder…
        </output>
      )}
      {folder && (
        <div {...staticRowProps}>
          <span className="hint mono selectable grow">{folder.path}</span>
          <PreferenceAction
            {...smallButtonProps}
            command="choose-download-folder"
            scopeId={scopeId}
            disabled={busy}
            invoke={() => perform(false)}
          >
            Change folder…
          </PreferenceAction>
          {(folder.custom || folder.error) && (
            <PreferenceAction
              {...smallGhostButtonProps}
              command="reset-download-folder"
              scopeId={scopeId}
              disabled={busy}
              invoke={() => perform(true)}
            >
              Use default
            </PreferenceAction>
          )}
        </div>
      )}
      {(error || folder?.error) && (
        <p role="alert" {...staticFieldErrorProps}>
          {error || folder?.error}{" "}
          <NativePreferenceRetry
            command="retry-download-folder"
            scopeId={scopeId}
            disabled={busy}
            read={refresh}
          />
        </p>
      )}
    </div>
  );
}
