import { useShallow } from "zustand/react/shallow";
import { useStore } from "../store";
import { runCommand } from "../commands";
import { localSplitPage } from "../features/surfaces/split-actions";
import { FavIcon } from "./SiteTile";
import { shellIconPip } from "./icons";
import "./PictureInPictureMedia.css";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";
import { staticExtraSmallIconButtonProps as auxClassExtraSmallIconButtonProps } from "../ui/class-props";

export function PictureInPictureMedia() {
  const audio = useStore((state) => state.tabAudio);
  const videos = useStore(
    useShallow((state) =>
      state.pages.allIds.flatMap((id) => {
        const page = state.pages.byId[id]!;
        return state.tabAudio[id]?.video && localSplitPage(id) ? [page] : [];
      }),
    ),
  );
  if (!videos.length) return null;
  return (
    <section className="sidebar-media" aria-label="Media">
      {videos.map((page) => {
        const label = audio[page.pageId]?.pip ? "Exit picture in picture" : "Picture in picture";
        return (
          <div className="sidebar-media-row" key={page.pageId}>
            <FavIcon url={page.url} src={page.favicon} size="sm" />
            <span title={page.title}>{page.title || "Video"}</span>
            <button
              {...auxNativeButtonTypeProps}
              {...auxClassExtraSmallIconButtonProps}
              data-command-id="picture-in-picture"
              aria-label={`${label}: ${page.title || "Video"}`}
              title={label}
              onClick={() => runCommand("picture-in-picture", { payload: { pageId: page.pageId } })}
            >
              {shellIconPip}
            </button>
          </div>
        );
      })}
    </section>
  );
}
