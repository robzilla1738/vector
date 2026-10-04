// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { ImagePreview } from "./ImageSnapshot";
import { executeCommand } from "../commands";
import { UI_FONT_SIZES } from "../ui-font-size";

let root: ReturnType<typeof createRoot>, host: HTMLDivElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const original = {
  dataUrl: "data:image/png;base64,AA==",
  image: {
    imageId: "original-image",
    chatId: "original-chat",
    artifactId: "original-artifact",
    filename: "A full retained filename with narrow-layout context.png",
    width: 800,
    height: 400,
    byteLength: 1,
    mediaType: "image/png" as const,
    createdAt: 1,
    included: false,
    sourcePage: {
      pageId: "original-source-page",
      documentEpoch: 7,
      url: "https://example.test/a/long/source/address",
      selectedAt: 2,
    },
  },
};
it("retains the original focused registered disclosure and full source metadata through open/close and owner refusal", async () => {
  let current = true;
  await act(async () =>
    root.render(<ImagePreview snapshot={original} current={() => current} onClose={() => {}} />),
  );
  const summary = host.querySelector<HTMLElement>("summary")!,
    details = host.querySelector("details")!;
  summary.focus();
  await act(async () => {
    await executeCommand("toggle-conversation-image-details");
  });
  expect(details.open).toBe(true);
  expect(document.activeElement).toBe(summary);
  expect(host.textContent).toContain(original.image.filename);
  expect(details.textContent).toContain(original.image.sourcePage.url);
  expect(details.textContent).toContain("This image remains a snapshot if the tab changes.");
  expect(host.textContent).toContain("Excluded from new replies");
  await act(async () => {
    await executeCommand("toggle-conversation-image-details");
  });
  expect(details.open).toBe(false);
  expect(document.activeElement).toBe(summary);
  current = false;
  await expect(executeCommand("toggle-conversation-image-details")).rejects.toThrow("current image details");
  expect(details.open).toBe(false);
  expect(host.querySelector("img")?.src).toBe(original.dataUrl);
});
it("keeps the disclosure's source layout target at the original Aux hit minimum for every supported type scale", () => {
  const css = readFileSync("apps/shell/src/components/ImageViewer.css", "utf8");
  const tokens = readFileSync("apps/shell/src/tokens.css", "utf8");
  const rule = css.match(/\.image-viewer-metadata summary\s*\{([^}]+)\}/)![1]!;
  const hit = Number(tokens.match(/--hit:\s*(\d+)px/)![1]);
  const lineHeight = Number(tokens.match(/--lh-normal:\s*([\d.]+)/)![1]);
  const fontOffset = Number(tokens.match(/--fs-xs:\s*calc\(var\(--ui-font-size\)\s*-\s*(\d+)px\)/)![1]);
  const padding = Number(rule.match(/padding:\s*(\d+)px\s+0/)![1]);
  // This is a source layout model, not a DOM/pixel measurement in jsdom.
  const minimum = rule.includes("min-height:var(--hit)") ? hit : 0;
  expect(
    UI_FONT_SIZES.map((size) => Math.max(minimum, (size - fontOffset) * lineHeight + 2 * padding)),
  ).toEqual(UI_FONT_SIZES.map(() => hit));
  expect(rule).toContain("cursor:pointer");
});
