import { useStore } from "./store";

/** Answer and article links never execute shell URLs or carry embedded credentials. */
export function browserLinkUrl(value: string): string {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password ? url.href : "";
  } catch { return ""; }
}
export function backgroundLink(event: {metaKey: boolean; ctrlKey: boolean; button: number}) {
  return event.metaKey || event.ctrlKey || event.button === 1;
}
export async function openBrowserLink(value: string, background = false) {
  const url = browserLinkUrl(value);
  if (!url) return;
  const state = useStore.getState();
  if (background) await state.openBackgroundTab(url, state.layout.activeSpaceId, false);
  else await state.newTab(url);
}
