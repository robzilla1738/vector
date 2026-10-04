import { useStore } from "../store";
import { runCommand } from "../commands";
import { localSplitPage } from "../features/surfaces/split-actions";
import { FavIcon } from "./SiteTile";
import { shellIconPip } from "./icons";
import "./PictureInPictureMedia.css";

export function PictureInPictureMedia() {
  const pages = useStore(state => state.pages), audio = useStore(state => state.tabAudio);
  const videos = pages.filter(page => audio[page.pageId]?.video && localSplitPage(page.pageId));
  if (!videos.length) return null;
  return <section className="sidebar-media" aria-label="Media">
    {videos.map(page => {
      const label = audio[page.pageId]?.pip ? "Exit picture in picture" : "Picture in picture";
      return <div className="sidebar-media-row" key={page.pageId}>
        <FavIcon url={page.url} src={page.favicon} size="sm" />
        <span title={page.title}>{page.title || "Video"}</span>
        <button type="button" className="icon-btn xs" data-command-id="picture-in-picture" aria-label={`${label}: ${page.title || "Video"}`} title={label} onClick={() => runCommand("picture-in-picture", { payload: { pageId: page.pageId } })}>{shellIconPip}</button>
      </div>;
    })}
  </section>;
}
