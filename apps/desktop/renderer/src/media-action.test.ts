// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { mediaActionScript } from "../../main/media-action";

afterEach(() => { document.body.replaceChildren(); });
it("changes only uniquely matched media, including open shadow roots", async () => {
  const root = document.createElement("div");
  document.body.append(root);
  const shadow = root.attachShadow({mode: "open"});
  const video = document.createElement("video"); video.src = "https://example.com/video.mp4"; shadow.append(video);
  const other = document.createElement("video"); other.src = "https://example.com/other.mp4"; document.body.append(other);
  await window.eval(mediaActionScript("video", video.src, "loop"));
  expect(video.loop).toBe(true); expect(other.loop).toBe(false);
  await window.eval(mediaActionScript("video", video.src, "controls"));
  expect(video.controls).toBe(true);
});
it("refuses duplicate sources and never interpolates the source as code", async () => {
  const source = "https://example.com/video.mp4?x=';throw new Error('injected');//";
  const one = document.createElement("video"); one.src = source; document.body.append(one);
  await window.eval(mediaActionScript("video", one.src, "mute"));
  expect(one.muted).toBe(true);
  const two = one.cloneNode() as HTMLVideoElement; document.body.append(two);
  await expect(window.eval(mediaActionScript("video", one.src, "unmute"))).rejects.toThrow("uniquely identifiable");
  expect(one.muted).toBe(true);
});
