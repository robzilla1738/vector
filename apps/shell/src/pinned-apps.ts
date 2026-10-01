import type { PageTarget } from "@aux/contracts";
import { flushLayout, useStore } from "./store";
import { persistLayout } from "./store/persistence";
import type { Pin } from "./workspace";

export function pinnedPage(pin: Pin, pages: readonly PageTarget[]) {
  return pin.pageId ? pages.find(page => page.pageId === pin.pageId && !page.ownedByRuntime && !page.anchor) : undefined;
}

export { boundPin } from "./pin-layout";

export async function updatePin(spaceId: string, url: string, patch: Partial<Pick<Pin, "pageId" | "keepAwake">>) {
  const state = useStore.getState();
  if (!state.layout.pins[spaceId]?.some(pin => pin.url === url)) throw new Error("This pinned app is no longer in this Space.");
  const layout = { ...state.layout, pins: { ...state.layout.pins, [spaceId]: state.layout.pins[spaceId]!.map(pin => pin.url === url ? { ...pin, ...patch } : pin) } };
  useStore.setState({ layout }); persistLayout(layout); await flushLayout();
}

export async function openPinnedApp(pin: Pin, spaceId: string) {
  const current = pinnedPage(pin, useStore.getState().pages);
  if (current) return useStore.getState().activate(current.pageId);
  // Reuse the binding when a discarded pin needs materializing after a restart.
  const page = await useStore.getState().openBackgroundTab(pin.url, spaceId, false, pin.pageId);
  const pageId = typeof page === "string" ? page : page?.pageId;
  if (!pageId) throw new Error("The pinned app did not open.");
  await updatePin(spaceId, pin.url, { pageId });
  await useStore.getState().activate(pageId);
}

export async function resetPinnedApp(pin: Pin) {
  const page = pinnedPage(pin, useStore.getState().pages);
  if (!page) throw new Error("Open this pinned app before resetting it.");
  await useStore.getState().navigatePage(page.pageId, pin.url);
}

