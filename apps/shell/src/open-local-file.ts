import { bridge } from "./bridge";
import { localFileUrl } from "./local-file-url";
import { useStore } from "./store";

let pending = false;

/** Open a native selection without replacing an existing document or newer work. */
export async function openLocalFile(): Promise<void> {
  if (pending) return;
  pending = true;
  const origin = useStore.getState();
  const document = origin.pages.byId[origin.activePageId ?? ""];
  const unchanged = () => {
    const state = useStore.getState();
    const page = state.pages.byId[origin.activePageId ?? ""];
    return (
      state.activePageId === origin.activePageId &&
      state.mode === origin.mode &&
      state.overlay === origin.overlay &&
      state.conversationId === origin.conversationId &&
      state.layout.activeSpaceId === origin.layout.activeSpaceId &&
      page?.url === document?.url &&
      page?.documentEpoch === document?.documentEpoch
    );
  };
  try {
    const path = await bridge.openFile();
    if (!path) return;
    const state = useStore.getState();
    const spaceId = state.layout.spaces.some((space) => space.id === origin.layout.activeSpaceId)
      ? origin.layout.activeSpaceId
      : state.layout.activeSpaceId;
    const page = await state.openBackgroundTab(localFileUrl(path), spaceId, false);
    if (unchanged() && !!useStore.getState().pages.byId[page.pageId ?? ""])
      await useStore.getState().activate(page.pageId);
    else useStore.getState().toast("File opened in a background tab.");
  } finally {
    pending = false;
  }
}
