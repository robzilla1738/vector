import { normalizePages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ConversationImages } from "./ConversationImages";
import { bridge } from "../bridge";
import { executeCommand } from "../commands";
import { COMMANDS } from "@aux/contracts";
import { makePage } from "../mock/fixtures";
import { useStore } from "../store";
const initial = useStore.getState();
const originalKind = bridge.windowKind;
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const image = (chatId: string) => ({
  imageId: `image-${chatId}`,
  artifactId: `artifact-${chatId}`,
  chatId,
  filename: `${chatId}.png`,
  width: 16,
  height: 16,
  createdAt: 1,
  included: true,
  byteLength: 15,
  mediaType: "image/png" as const,
});
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  HTMLElement.prototype.scrollIntoView = vi.fn();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  bridge.windowKind = originalKind;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});
function button(name: string) {
  return [...host.querySelectorAll<HTMLButtonElement>("button")].find((item) => item.textContent === name)!;
}

function mount(extra: Partial<Parameters<typeof ConversationImages>[0]> = {}) {
  return act(async () =>
    root.render(
      <ConversationImages
        chatId="a"
        images={[]}
        disabled={false}
        ensureChatId={() => "a"}
        onChange={vi.fn()}
        onBusy={vi.fn()}
        onDocument={vi.fn()}
        {...extra}
      />,
    ),
  );
}
it.each(["normal", "quick-ask"] as const)(
  "routes original focused image picking and cancellation without granting page context (%s)",
  async (kind) => {
    bridge.windowKind = kind;
    const picker = vi
      .spyOn(bridge, "pickEvidenceImage")
      .mockResolvedValue({ filename: "Original.png", dataUrl: "data:image/png;base64,AA==" });
    const native = vi.spyOn(bridge, "invoke");
    await mount();
    button("Image").focus();
    await act(async () => {
      await executeCommand("choose-conversation-image");
    });
    expect(picker).toHaveBeenCalledOnce();
    expect(host.querySelector(".capture-editor img")?.getAttribute("alt")).toBe(
      "Capture to review before attaching",
    );
    button("Cancel").focus();
    await act(async () => {
      await executeCommand("cancel-conversation-image");
    });
    expect(host.querySelector(".capture-editor")).toBeNull();
    expect(native).not.toHaveBeenCalled();
  },
);
it("uses the original checkbox state for remapped inclusion and the original image ID for removal", async () => {
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue({ images: [] });
  const changed = vi.fn();
  await mount({ images: [image("a")], onChange: changed });
  const choice = host.querySelector<HTMLInputElement>("input")!;
  choice.focus();
  const key = new KeyboardEvent("keydown", { key: "i", bubbles: true });
  choice.dispatchEvent(key);
  await act(async () => {
    await executeCommand("toggle-conversation-image", { nativeInputEvent: key });
  });
  expect(invoke).toHaveBeenCalledWith("conversations.images.toggle", {
    chatId: "a",
    imageId: "image-a",
    included: false,
  });
  expect(changed).toHaveBeenCalledWith("a", []);
  host.querySelector<HTMLButtonElement>('[aria-label="Remove a.png"]')!.focus();
  await act(async () => {
    await executeCommand("remove-conversation-image");
  });
  expect(invoke).toHaveBeenLastCalledWith("conversations.images.remove", { chatId: "a", imageId: "image-a" });
});
it.each(["normal", "quick-ask"] as const)(
  "opens and closes the exact read-only image preview through its own mounted controls (%s)",
  async (kind) => {
    bridge.windowKind = kind;
    const invoke = vi
      .spyOn(bridge, "invoke")
      .mockResolvedValue({ image: image("a"), dataUrl: "data:image/png;base64,AA==" });
    await mount({ images: [image("a")] });
    button("Preview").focus();
    await act(async () => {
      await executeCommand("preview-conversation-image");
    });
    expect(host.querySelector("img")?.getAttribute("alt")).toBe("a.png");
    host.querySelector<HTMLButtonElement>('[aria-label="Close image preview"]')!.focus();
    await act(async () => {
      await executeCommand("cancel-conversation-image");
    });
    expect(host.querySelector(".viewer-frame")).toBeNull();
    expect(invoke).toHaveBeenCalledTimes(1);
  },
);
it.each(["normal", "quick-ask"] as const)(
  "keeps selection keyboard input and registered whole-image reset before actual attach ACK (%s)",
  async (kind) => {
    bridge.windowKind = kind;
    vi.stubGlobal(
      "Image",
      class {
        naturalWidth = 16;
        naturalHeight = 16;
        src = "";
        async decode() {}
      },
    );
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage: vi.fn() } as never);
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue("data:image/png;base64,AA==");
    vi.spyOn(bridge, "pickEvidenceImage").mockResolvedValue({
      filename: "Original.png",
      dataUrl: "data:image/png;base64,AA==",
    });
    const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue({ images: [image("a")] }),
      changed = vi.fn();
    await mount({ onChange: changed });
    await act(async () => button("Image").click());
    await act(async () =>
      host
        .querySelector(".capture-canvas")!
        .dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true })),
    );
    expect(host.querySelector(".capture-region")).toBeTruthy();
    button("Use whole image").focus();
    await act(async () => {
      await executeCommand("use-whole-conversation-image");
    });
    expect(host.querySelector(".capture-region")).toBeNull();
    button("Attach image").focus();
    await act(async () => {
      await executeCommand("attach-conversation-image");
    });
    expect(invoke).toHaveBeenCalledWith("conversations.images.add", {
      chatId: "a",
      filename: "Original.png",
      dataUrl: "data:image/png;base64,AA==",
      sourceUrl: undefined,
      sourcePage: undefined,
    });
    expect(changed).toHaveBeenCalledWith("a", [image("a")]);
  },
);
it("refuses capture when original target ownership changes while the actual native reply is held", async () => {
  const page = makePage(0, { pageId: "original", url: "https://loopback.invalid/owned", documentEpoch: 3 });
  useStore.setState({ pages: normalizePages([page]) });
  let complete!: (value: unknown) => void;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(
    () =>
      new Promise((done) => {
        complete = done;
      }),
  );
  await mount({ page });
  await act(async () => button("Capture").click());
  expect(invoke).toHaveBeenCalledWith("pages.capture", {
    pageId: page.pageId,
    format: "dataUrl",
    fullPage: false,
    expectedDocumentEpoch: 3,
  });
  useStore.setState({ pages: normalizePages([{ ...page, targetId: "foreign-original-target" }]) });
  await act(async () => complete({ dataUrl: "data:image/png;base64,AA==" }));
  expect(host.querySelector(".capture-editor")).toBeNull();
  expect(host.querySelector('[role="alert"]')?.textContent).toContain("page changed during capture");
});
it("refuses foreign focus and native-window changes before invoking the original picker", async () => {
  const picker = vi.spyOn(bridge, "pickEvidenceImage");
  await mount();
  const foreign = document.createElement("button");
  document.body.append(foreign);
  foreign.focus();
  await expect(executeCommand("choose-conversation-image")).rejects.toThrow("original focused");
  foreign.remove();
  button("Image").focus();
  const originalWindow = bridge.windowId;
  bridge.windowId = "foreign";
  await expect(executeCommand("choose-conversation-image")).rejects.toThrow("current image control");
  bridge.windowId = originalWindow;
  expect(picker).not.toHaveBeenCalled();
});
it("admits supported Quick Ask image/document controls while keeping page lasso in browser windows", () => {
  for (const id of [
    "choose-conversation-image",
    "capture-conversation-page",
    "select-conversation-image-region",
    "attach-conversation-image",
    "cancel-conversation-image",
    "use-whole-conversation-image",
    "toggle-conversation-image",
    "remove-conversation-image",
    "preview-conversation-image",
    "attach-conversation-document",
  ]) {
    expect(COMMANDS.find((command) => command.id === id)).toMatchObject({
      handler: "shell",
      dispatch: "scoped",
      windows:
        id === "select-conversation-image-region"
          ? ["normal", "private"]
          : ["normal", "private", "quick-ask"],
      palette: false,
      intercept: true,
      bindings: [],
    });
  }
});

it("retains the new same-chat image snapshot when a held original preview completes", async () => {
  let complete!: (value: unknown) => void;
  vi.spyOn(bridge, "invoke").mockImplementation(
    () =>
      new Promise((done) => {
        complete = done;
      }),
  );
  await mount({ images: [image("a")] });
  await act(async () => button("Preview").click());
  await mount({ images: [{ ...image("a"), filename: "Fresh snapshot.png" }] });
  await act(async () => complete({ image: image("a"), dataUrl: "data:image/png;base64,AA==" }));
  expect(host.querySelector(".viewer-frame")).toBeNull();
  expect(host.textContent).toContain("Fresh snapshot.png");
  expect(button("Preview").disabled).toBe(false);
});
