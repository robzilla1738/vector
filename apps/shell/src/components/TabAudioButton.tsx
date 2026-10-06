import { useStore } from "../store";
import { runCommand } from "../commands";
import { useFeature } from "../use-feature";
import { shellIconPip, shellIconVolume, shellIconVolumeOff } from "./icons";
import { staticTextProps as auxClassTextProps } from "../ui/class-props";

export function TabAudioButton({
  pageId,
  title,
  menu = false,
  onDone,
}: {
  pageId: string;
  title: string;
  menu?: boolean;
  onDone?: () => void;
}) {
  const audio = useStore((state) => state.tabAudio[pageId]);
  const pipAvailable = useFeature("pictureInPicture");
  if (!audio) return null;
  const muteVisible = menu || audio.muted || audio.audible;
  const pipVisible = pipAvailable && audio.video;
  if (!muteVisible && !pipVisible) return null;
  const label = audio.muted ? "Unmute tab" : "Mute tab";
  return (
    <>
      {muteVisible && (
        <button
          className={menu ? "menu-item" : "icon-btn xs tab-audio"}
          role={menu ? "menuitem" : undefined}
          aria-label={menu ? label : `${label}: ${title}`}
          title={audio.muted ? "Tab muted" : audio.audible ? `Playing audio · ${label}` : label}
          data-command-id="mute-tab"
          onKeyDown={(event) => {
            if (!menu) event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
            runCommand("mute-tab", { payload: { pageId } });
            onDone?.();
          }}
        >
          {audio.muted ? shellIconVolumeOff : shellIconVolume}
          {menu && <span {...auxClassTextProps}>{label}</span>}
        </button>
      )}
      {pipVisible && (
        <button
          className={menu ? "menu-item" : "icon-btn xs tab-pip"}
          role={menu ? "menuitem" : undefined}
          data-command-id="picture-in-picture"
          aria-label={audio.pip ? "Exit picture in picture" : "Picture in picture"}
          onClick={(event) => {
            event.stopPropagation();
            runCommand("picture-in-picture", { payload: { pageId } });
            onDone?.();
          }}
        >
          {shellIconPip}
          {menu && (
            <span {...auxClassTextProps}>{audio.pip ? "Exit picture in picture" : "Picture in picture"}</span>
          )}
        </button>
      )}
    </>
  );
}
