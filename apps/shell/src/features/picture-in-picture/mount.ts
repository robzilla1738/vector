import { PictureInPictureMedia } from "../../components/PictureInPictureMedia";
import type { FeatureMount } from "../registry";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { togglePictureInPicture } from "../surfaces/split-actions";
export const mount: FeatureMount = {
  feature: "pictureInPicture",
  privateWindows: true,
  sidebarItems: [PictureInPictureMedia],
  boot: () => bridge.onPictureInPicture(event => {
    useStore.setState(state => ({ tabAudio: { ...state.tabAudio, [event.pageId]: { ...state.tabAudio[event.pageId], muted: state.tabAudio[event.pageId]?.muted ?? false, audible: state.tabAudio[event.pageId]?.audible ?? false, pip: event.active } } }));
  }),
  commands: { "picture-in-picture": (state, invocation) => {
    const pageId = invocation.payload && "pageId" in invocation.payload ? invocation.payload.pageId : state.activePageId;
    if (pageId) return togglePictureInPicture(pageId);
  } },
};
