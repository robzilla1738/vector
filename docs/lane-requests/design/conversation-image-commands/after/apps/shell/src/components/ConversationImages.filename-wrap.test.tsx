// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ConversationImages } from "./ConversationImages";
import { bridge } from "../bridge";
import { useStore } from "../store";
const initial = useStore.getState();
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
const filename = `${"OriginalUploadedImage".repeat(8)}.png`;
const image = {
  imageId: "original-image",
  artifactId: "original-image-artifact",
  chatId: "original-chat",
  filename,
  width: 800,
  height: 600,
  createdAt: 1,
  included: true,
  byteLength: 15,
  mediaType: "image/png" as const,
};
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, style: HTMLStyleElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 100 }] as unknown as DOMRectList);
  HTMLElement.prototype.scrollIntoView = vi.fn();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  style = document.createElement("style");
  const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../styles/workspace.css"), "utf8");
  style.textContent = css.match(/^\.conversation-document b \{[^}]+\}/m)![0];
  document.head.append(style);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  style.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});
it("keeps the original full image filename wrapped and its explicit inclusion, Preview and Remove actions", async () => {
  const changed = vi.fn(),
    busy = vi.fn(),
    documentAction = vi.fn();
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "conversations.images.toggle")
      return { chatId: image.chatId, images: [{ ...image, included: false }] };
    if (method === "conversations.images.read") return { image, dataUrl: "data:image/png;base64,AA==" };
    if (method === "conversations.images.remove") return { chatId: image.chatId, images: [] };
    throw new Error(`Unexpected original image action: ${method}`);
  });
  await act(async () =>
    root.render(
      <ConversationImages
        chatId={image.chatId}
        images={[image]}
        disabled={false}
        ensureChatId={() => image.chatId}
        onChange={changed}
        onBusy={busy}
        onDocument={documentAction}
      />,
    ),
  );
  const name = host.querySelector<HTMLElement>(".conversation-document b")!;
  expect(name.textContent).toBe(filename);
  // Actual source/component rule; native narrow pixels are still required.
  expect(getComputedStyle(name).overflowWrap).toBe("anywhere");
  expect(getComputedStyle(name).fontSize).not.toBe("0px");
  expect(host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.checked).toBe(true);
  await act(async () => host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
  expect(invoke).toHaveBeenCalledWith("conversations.images.toggle", {
    chatId: image.chatId,
    imageId: image.imageId,
    included: false,
  });
  expect(changed).toHaveBeenLastCalledWith(image.chatId, [{ ...image, included: false }]);
  const preview = [...host.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent === "Preview",
  )!;
  preview.focus();
  expect(document.activeElement).toBe(preview);
  await act(async () => preview.click());
  expect(invoke).toHaveBeenCalledWith("conversations.images.read", {
    chatId: image.chatId,
    imageId: image.imageId,
  });
  expect(host.querySelector("img")?.getAttribute("alt")).toBe(filename);
  await act(async () => host.querySelector<HTMLButtonElement>(`[aria-label="Remove ${filename}"]`)!.click());
  expect(invoke).toHaveBeenCalledWith("conversations.images.remove", {
    chatId: image.chatId,
    imageId: image.imageId,
  });
  expect(changed).toHaveBeenLastCalledWith(image.chatId, []);
  expect(documentAction).not.toHaveBeenCalled();
  expect(invoke.mock.calls.map(([method]) => method)).toEqual([
    "conversations.images.toggle",
    "conversations.images.read",
    "conversations.images.remove",
  ]);
  expect(busy).toHaveBeenLastCalledWith(false);
});
