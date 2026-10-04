import { staticMenuItemProps } from "../ui/class-props";
import { useRef } from "react";
import { Menu } from "../ui";
import { useStore } from "../store";
import { executeCommand } from "../commands";
import { pinnedPage } from "../pinned-apps";
import { useFeature } from "../use-feature";
import type { Pin } from "../workspace";

export function PinMenu({ pin, spaceId, x, y, onClose: finishClose }: {
  pin: Pin; spaceId: string; x: number; y: number; onClose: () => void;
}) {
  const pinnedApps = useFeature("pinnedApps");
  const page = useStore(state => pinnedPage(pin, state.pages));
  const pins = useStore(state => state.layout.pins[spaceId]);
  const index = pins?.findIndex(item => item.url === pin.url) ?? -1;
  const trigger = useRef(document.activeElement as HTMLElement | null);
  function command(id: "pin-open-new-tab" | "pin-open-background" | "pin-copy-url" | "pin-reorder" | "pin-unpin" | "reset-pinned-app" | "toggle-pin-keep-awake", beforePinUrl?: string | null) {
    finishClose();
    void executeCommand(id, { payload: { spaceId, pinUrl: pin.url, ...(beforePinUrl !== undefined ? { beforePinUrl } : {}) } }).catch(() => undefined);
  }
  return <Menu label="Pinned site" point={{ x, y }} onClose={finishClose} returnFocus={trigger} className="menu ctx-menu">
    <button {...staticMenuItemProps} role="menuitem" onClick={() => command("pin-open-new-tab")}>Open in new tab</button>
    <button {...staticMenuItemProps} role="menuitem" onClick={() => command("pin-open-background")}>Open in background tab</button>
    <button {...staticMenuItemProps} role="menuitem" onClick={() => command("pin-copy-url")}>Copy URL</button>
    {pinnedApps && page && page.url !== pin.url && <button {...staticMenuItemProps} role="menuitem" onClick={() => command("reset-pinned-app")}>↺ Reset to pinned URL</button>}
    {pinnedApps && <button {...staticMenuItemProps} role="menuitemcheckbox" aria-checked={!!pin.keepAwake} onClick={() => command("toggle-pin-keep-awake")}>Keep awake{pin.keepAwake ? " ✓" : ""}</button>}
    <hr className="menu-sep" />
    {index > 0 && <button {...staticMenuItemProps} role="menuitem" onClick={() => command("pin-reorder", pins![0]!.url)}>Move to front</button>}
    {index > 0 && <button {...staticMenuItemProps} role="menuitem" onClick={() => command("pin-reorder", pins![index - 1]!.url)}>Move earlier</button>}
    {index >= 0 && index < (pins?.length ?? 0) - 1 && <button {...staticMenuItemProps} role="menuitem" onClick={() => command("pin-reorder", pins?.[index + 2]?.url ?? null)}>Move later</button>}

    <button {...staticMenuItemProps} role="menuitem" onClick={() => command("pin-unpin")}>Unpin from this Space</button>
  </Menu>;
}
