// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ConversationImages } from "./ConversationImages";
import { bridge } from "../bridge";
import { useStore } from "../store";
const initial = useStore.getState();
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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});
function button(name: string) {
  return [...host.querySelectorAll<HTMLButtonElement>("button")].find((item) => item.textContent === name)!;
}
it.each(["success", "rejection"])(
  "retired A preview cannot hold or clear fresh B input debt (%s)",
  async (outcome) => {
    const pending: { resolve(value: unknown): void; reject(reason: Error): void }[] = [];
    const invoke = vi.spyOn(bridge, "invoke").mockImplementation((method) => {
      if (method !== "conversations.images.read") throw new Error(`Unexpected action: ${method}`);
      return new Promise((resolve, reject) => pending.push({ resolve, reject }));
    });
    const change = vi.fn(),
      busy = vi.fn();
    const mount = async (chatId: string) =>
      act(async () =>
        root.render(
          <ConversationImages
            chatId={chatId}
            images={[image(chatId)]}
            disabled={false}
            ensureChatId={() => chatId}
            onChange={change}
            onBusy={busy}
            onDocument={vi.fn()}
          />,
        ),
      );
    await mount("A");
    await act(async () => {
      button("Preview").click();
      button("Preview").click();
    });
    expect(invoke).toHaveBeenCalledTimes(1);
    await mount("B");
    expect(button("Preview").disabled).toBe(false);
    expect(busy.mock.calls).toEqual([[true], [false]]);
    await act(async () => button("Preview").click());
    expect(invoke).toHaveBeenCalledTimes(2);
    await act(async () =>
      outcome === "success"
        ? pending[0]!.resolve({ image: image("A"), dataUrl: "data:image/png;base64,AA==" })
        : pending[0]!.reject(new Error("Original A-only read failure")),
    );
    expect(button("Preview").disabled).toBe(true);
    expect(busy.mock.calls).toEqual([[true], [false], [true]]);
    expect(host.querySelector("img")).toBeNull();
    expect(host.querySelector('[role="alert"]')).toBeNull();
    expect(change).not.toHaveBeenCalled();
    await act(async () => pending[1]!.resolve({ image: image("B"), dataUrl: "data:image/png;base64,BB==" }));
    expect(host.querySelector("img")?.getAttribute("alt")).toBe("B.png");
    expect(button("Preview").disabled).toBe(false);
    expect(busy.mock.calls).toEqual([[true], [false], [true], [false]]);
  },
);
it("keeps exact image toggle ACK onChange scoped to the original current chat", async () => {
  const pending: ((value: unknown) => void)[] = [];
  vi.spyOn(bridge, "invoke").mockImplementation(() => new Promise((resolve) => pending.push(resolve)));
  const change = vi.fn(),
    busy = vi.fn();
  const mount = async (chatId: string) =>
    act(async () =>
      root.render(
        <ConversationImages
          chatId={chatId}
          images={[image(chatId)]}
          disabled={false}
          ensureChatId={() => chatId}
          onChange={change}
          onBusy={busy}
          onDocument={vi.fn()}
        />,
      ),
    );
  await mount("A");
  await act(async () => host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
  await mount("B");
  await mount("A");
  await act(async () => host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
  await act(async () => pending[0]!({ chatId: "A", images: [{ ...image("A"), included: false }] }));
  expect(change).not.toHaveBeenCalled();
  expect(host.querySelector<HTMLInputElement>('input[type="checkbox"]')!.disabled).toBe(true);
  const result = { chatId: "A", images: [{ ...image("A"), included: false }] };
  await act(async () => pending[1]!(result));
  expect(change).toHaveBeenCalledExactlyOnceWith("A", result.images);
  expect(busy.mock.calls).toEqual([[true], [false], [true], [false]]);
});
it("preserves the original authorized new-chat image save across its created chat prop", async () => {
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
    filename: "owned.png",
    dataUrl: "data:image/png;base64,AA==",
  });
  let finish!: (value: unknown) => void;
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation((method) => {
    if (method !== "conversations.images.add") throw new Error(method);
    return new Promise((resolve) => {
      finish = resolve;
    });
  });
  const change = vi.fn(),
    busy = vi.fn(),
    ensure = vi.fn(() => "created");
  const mount = async (chatId: string | null) =>
    act(async () =>
      root.render(
        <ConversationImages
          chatId={chatId}
          images={[]}
          disabled={false}
          ensureChatId={ensure}
          onChange={change}
          onBusy={busy}
          onDocument={vi.fn()}
        />,
      ),
    );
  await mount(null);
  await act(async () => button("Image").click());
  await act(async () => button("Attach image").click());
  expect(ensure).toHaveBeenCalledOnce();
  await mount("created");
  const result = { chatId: "created", images: [image("created")] };
  await act(async () => finish(result));
  expect(change).toHaveBeenCalledExactlyOnceWith("created", result.images);
  expect(invoke).toHaveBeenCalledTimes(1);
  expect(busy.mock.calls).toEqual([[true], [false], [true], [false]]);
});
