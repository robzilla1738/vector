import { createStore } from "zustand/vanilla";
import type { HostMethodResult } from "@aux/contracts";
import { bridge } from "../../bridge";
import { useStore } from "../../store";

export const extensionPanel = createStore<{ panel: HostMethodResult<"extensionSidePanel"> }>(() => ({
  panel: null,
}));
let revision = 0;
extensionPanel.subscribe(() => {
  ++revision;
});
export async function closeExtensionPanel() {
  const request = revision;
  await bridge.extensionSidePanel("close");
  if (request === revision) extensionPanel.setState({ panel: null });
}
export function installExtensionPanel() {
  if (bridge.privateMode || bridge.windowKind !== "normal") return;
  let current = true;
  let generation = 0;
  let closing: Promise<unknown> | null = null;
  const accept = (panel: HostMethodResult<"extensionSidePanel">) => {
    const local = panel?.windowId === bridge.windowId && panel.open && panel.contentId ? panel : null;
    extensionPanel.setState({ panel: local });
    if (local) useStore.setState({ railOpen: true });
  };
  const stopEvents = bridge.onSidePanel((panel) => {
    if (!current || panel.windowId !== bridge.windowId) return;
    ++generation;
    accept(panel);
  });
  const reconcile = () => {
    const request = ++generation;
    void bridge.extensionSidePanel("describe").then(
      (panel) => {
        if (current && request === generation) accept(panel);
      },
      (reason) => {
        if (current && request === generation) useStore.getState().toast(String(reason), "error");
      },
    );
  };
  const stopStore = useStore.subscribe((state, previous) => {
    if (
      !extensionPanel.getState().panel ||
      closing ||
      (state.railOpen && state.railView === previous.railView)
    )
      return;
    closing = closeExtensionPanel()
      .catch((reason) => {
        if (!current) return;
        useStore.getState().toast(String(reason), "error");
        reconcile();
      })
      .finally(() => {
        closing = null;
      });
  });
  window.addEventListener("focus", reconcile);
  reconcile();
  return () => {
    current = false;
    stopEvents();
    stopStore();
    window.removeEventListener("focus", reconcile);
    extensionPanel.setState({ panel: null });
  };
}
