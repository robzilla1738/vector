import { openNativeLibrary } from "./native-library";
import { orderedPages } from "./store/pages";
import { bridge, inNativeHost } from "./bridge";
import { call, useStore } from "./store";
import { isTab } from "./workspace";
import { openCommandSurface } from "./command-surface-state";

function personPage(webOnly = false) {
  const state = useStore.getState();
  const page = state.pages.byId[state.activePageId ?? ""];
  if (!page || !isTab(page) || (webOnly && !/^https?:\/\//.test(page.url)))
    throw new Error("Open an available web page first.");
  return page;
}
async function nativeFieldAction(method: "autofill" | "vaultFill") {
  if (bridge.privateMode) throw new Error("Saved personal information is unavailable in Private windows.");
  const page = personPage(true);
  if (page.backend !== "aux") throw new Error("This action requires an Aux page.");
  const capabilities = inNativeHost ? await bridge.capabilities() : null;
  if (capabilities && !capabilities.methods.includes(method))
    throw new Error("This native action is unavailable.");
  const current = personPage(true);
  if (
    current.pageId !== page.pageId ||
    current.url !== page.url ||
    current.documentEpoch !== page.documentEpoch ||
    current.sessionId !== page.sessionId
  )
    throw new Error("The page changed. Choose the action again.");
  return method === "autofill" ? bridge.autofill(page.pageId) : bridge.vaultFill(page.pageId);
}

/** Actual legacy palette actions enter exclusively through the shared registry
 * dispatcher; these functions contain no bindings or secondary registry. */
export const COMMAND_SURFACE_ACTIONS = {
  "command-tabs": () => openCommandSurface({ mode: "new-tab", presentation: "tab-search" }),
  "command-observe": () => {
    useStore.setState({ inspectorObs: null });
    useStore.getState().setOverlay("observe");
  },
  "command-inline-assist": () => {
    if (bridge.privateMode || personPage(true).backend !== "aux")
      throw new Error("Writing assistance requires an Aux page outside Private mode.");
    useStore.getState().setOverlay("inline-assist");
  },
  "command-collect-tabs": async () => {
    const pages = orderedPages(useStore.getState().pages).filter(isTab);
    if (!pages.length) throw new Error("No open tabs to collect.");
    return call("sets.create", {
      name: `Tabs ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      source: "tabs",
      pageIds: pages.map((page) => page.pageId),
    });
  },
  "command-reading-list": () => {
    const page = personPage(true);
    return useStore.getState().toggleReadingList(page.url, page.title);
  },
  "command-autofill": () => nativeFieldAction("autofill"),
  "command-vault-fill": () => nativeFieldAction("vaultFill"),
  "command-translate": async () => {
    const page = personPage(true);
    if (page.backend !== "aux") throw new Error("Translation requires an Aux page.");
    useStore.getState().setTranslationPending(page.pageId);
    try {
      return await bridge.translatePage(page.pageId);
    } finally {
      if (useStore.getState().translationPending === page.pageId)
        useStore.getState().setTranslationPending(null);
    }
  },
  "command-show-original": () => {
    const page = personPage(true);
    if (page.backend !== "aux") throw new Error("Translation requires an Aux page.");
    return bridge.showOriginal(page.pageId);
  },
  "command-bookmarks": () => openNativeLibrary("bookmarks"),
  "command-saved-pages": () => useStore.getState().setOverlay("saved-pages"),
  "command-open-live-chrome": () => {
    const page = personPage();
    if (page.backend !== "chrome") throw new Error("Choose an attached Chrome page.");
    return call("pages.openLive", { pageId: page.pageId });
  },
  "command-new-space": () => {
    const state = useStore.getState();
    return state.addSpace(`Space ${state.layout.spaces.length + 1}`);
  },
};
