import type { FeatureMount, CommandInvocation } from "../registry";
import { useStore, flushLayout, toast } from "../../store";
import { persistLayout } from "../../store/persistence";
import { assignFolder } from "../../workspace";
import { boundPin, openPinnedApp, resetPinnedApp, updatePin } from "../../pinned-apps";

function pinFor(invocation: CommandInvocation) {
  const payload = invocation.payload;
  if (payload && "pinUrl" in payload) {
    const pin = useStore.getState().layout.pins[payload.spaceId]?.find(pin => pin.url === payload.pinUrl);
    if (pin) return { pin, spaceId: payload.spaceId };
  }
  const activeId = useStore.getState().activePageId;
  const binding = activeId && boundPin(useStore.getState().layout, activeId);
  if (!binding) throw new Error("Choose a pinned app first.");
  return binding;
}

export const mount: FeatureMount = {
  feature: "pinnedApps",
  commands: {
    "pin-open-new-tab": (state, invocation) => state.newTab(pinFor(invocation).pin.url),
    "pin-open-background": (state, invocation) => { const { pin, spaceId } = pinFor(invocation); return state.openBackgroundTab(pin.url, spaceId, false); },
    "pin-copy-url": async (_state, invocation) => { await navigator.clipboard.writeText(pinFor(invocation).pin.url); toast("URL copied"); },
    "pin-unpin": async (state, invocation) => { const { pin, spaceId } = pinFor(invocation); state.togglePin(pin, spaceId); await flushLayout(); toast("Unpinned"); },
    "pin-reorder": async (state, invocation) => {
      const { pin, spaceId } = pinFor(invocation);
      const payload = invocation.payload;
      if (!payload || !("beforePinUrl" in payload)) throw new Error("Choose a position for this pinned app.");
      state.reorderPin(spaceId, pin.url, payload.beforePinUrl ?? null); await flushLayout();
    },
    "pin-tab": async state => {
      const page = state.pages.find(page => page.pageId === state.activePageId);
      if (!page || !/^https?:\/\//.test(page.url) || page.ownedByRuntime || page.anchor || page.controller !== "none") throw new Error("Take control of a web tab before pinning it.");
      const existing = boundPin(state.layout, page.pageId);
      state.togglePin(existing?.pin ?? { url: page.url, title: page.title, pageId: page.pageId }, existing?.spaceId ?? state.layout.activeSpaceId);
      if (!existing) {
        const layout = assignFolder(useStore.getState().layout, page.pageId, null);
        useStore.setState({ layout }); persistLayout(layout);
      }
      await flushLayout();
    },
    "reset-pinned-app": (_state, invocation) => resetPinnedApp(pinFor(invocation).pin),
    "toggle-pin-keep-awake": async (_state, invocation) => {
      const { pin, spaceId } = pinFor(invocation);
      await updatePin(spaceId, pin.url, { keepAwake: !pin.keepAwake });
    },
    "open-pinned-app": (_state, invocation) => { const { pin, spaceId } = pinFor(invocation); return openPinnedApp(pin, spaceId); },
  },
};
