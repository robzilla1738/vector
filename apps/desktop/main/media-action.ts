/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
export type MediaAction = "play" | "pause" | "mute" | "unmute" | "loop" | "unloop" | "controls" | "hide-controls" | "picture-in-picture" | "exit-picture-in-picture";

/** Runs only in the frame that produced the menu. Refuse ambiguous or replaced media. */
export function mediaActionScript(type: "video" | "audio", source: string, action: MediaAction) {
  return `(${performMediaAction.toString()})(${JSON.stringify(type)},${JSON.stringify(source)},${JSON.stringify(action)})`;
}

async function performMediaAction(type: "video" | "audio", source: string, action: MediaAction) {
  const candidates: HTMLMediaElement[] = [];
  function visit(root: Document | ShadowRoot) {
    for (const element of root.querySelectorAll("*")) {
      if (element.localName === type) {
        const media = element as HTMLMediaElement;
        if ((media.currentSrc || media.src) === source) candidates.push(media);
      }
      if (element.shadowRoot) visit(element.shadowRoot);
    }
  }
  visit(document);
  if (candidates.length !== 1) throw new Error("This media changed or is no longer uniquely identifiable. Open its menu again.");
  const media = candidates[0]!;
  switch (action) {
    case "play": await media.play(); break;
    case "pause": media.pause(); break;
    case "mute": media.muted = true; break;
    case "unmute": media.muted = false; break;
    case "loop": media.loop = true; break;
    case "unloop": media.loop = false; break;
    case "controls": media.controls = true; break;
    case "hide-controls": media.controls = false; break;
    case "picture-in-picture":
      if (!(media instanceof HTMLVideoElement) || !document.pictureInPictureEnabled || media.disablePictureInPicture) throw new Error("Picture-in-picture is unavailable for this video.");
      await media.requestPictureInPicture(); break;
    case "exit-picture-in-picture":
      if (document.pictureInPictureElement === media) await document.exitPictureInPicture();
      break;
  }
}
