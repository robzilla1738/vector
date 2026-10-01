import { createStore } from "zustand/vanilla";
import { bridge, type BrowserExtension } from "../../bridge";

export const extensionInventory = createStore<{
  items: BrowserExtension[];
  loading: boolean;
  busy: boolean;
  error: string;
  message: string;
}>(() => ({ items: [], loading: true, busy: false, error: "", message: "" }));
let generation = 0;
export async function refreshExtensions() {
  const request = ++generation;
  try {
    const items = await bridge.extensions();
    if (request === generation) extensionInventory.setState({ items, loading: false, error: "" });
  } catch (reason) {
    if (request === generation)
      extensionInventory.setState({
        loading: false,
        error: reason instanceof Error ? reason.message : String(reason),
      });
  }
}
export async function extensionOperation(work: () => Promise<unknown>, message: string) {
  if (extensionInventory.getState().busy) throw new Error("Another extension operation is still running.");
  ++generation;
  extensionInventory.setState({ busy: true, loading: false, message: "", error: "" });
  try {
    const result = await work();
    if (result === false) throw new Error("Chromium could not complete this extension operation.");
    if (result !== null) extensionInventory.setState({ message });
    return result;
  } finally {
    await refreshExtensions();
    extensionInventory.setState({ busy: false });
  }
}
