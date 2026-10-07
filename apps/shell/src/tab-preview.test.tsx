// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { bridge } from "./bridge";
import { TabPreview, useSidebarTabPreview } from "./components/TabPreview";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
(globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= class {
  observe() {}
  disconnect() {}
};

const page = {
  pageId: "preview",
  title: "Previewed page",
  url: "https://example.com/preview",
  viewStatus: "visible",
} as PageTarget;
const host = document.createElement("div");
document.body.append(host);
let root: ReturnType<typeof createRoot>;

function PreviewHarness() {
  const preview = useSidebarTabPreview();
  return (
    <>
      <button onMouseEnter={(event) => preview.show(event.currentTarget)} onMouseLeave={preview.hide}>
        Tab
      </button>
      {preview.position && <TabPreview page={page} {...preview.position} />}
    </>
  );
}

afterEach(async () => {
  await act(async () => root.unmount());
  host.replaceChildren();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it("shows a native thumbnail after tab hover and dismisses it on leave", async () => {
  vi.useFakeTimers();
  const thumbnail = "data:image/png;base64,aGVsbG8=";
  vi.spyOn(bridge, "preview").mockResolvedValue(thumbnail);
  root = createRoot(host);
  await act(async () => root.render(<PreviewHarness />));
  const tab = host.querySelector("button")!;
  await act(async () => tab.dispatchEvent(new MouseEvent("mouseover", { bubbles: true })));
  expect(document.querySelector(".tab-preview")).toBeNull();
  await act(async () => vi.advanceTimersByTime(450));
  expect(document.querySelector<HTMLImageElement>(".tab-preview img")?.src).toBe(thumbnail);
  await act(async () => tab.dispatchEvent(new MouseEvent("mouseout", { bubbles: true })));
  expect(document.querySelector(".tab-preview")).toBeNull();
});

it.each(["about:blank", "chrome://newtab/", "chrome://new-tab-page/"])(
  "shows a caption without a blank screenshot for %s",
  async (url) => {
    const preview = vi.spyOn(bridge, "preview");
    root = createRoot(host);
    await act(async () => root.render(<TabPreview page={{ ...page, url }} x={20} y={20} />));
    expect(document.querySelector(".tab-preview-image")).toBeNull();
    expect(document.querySelector(".tab-preview")?.textContent).toContain("New Tab");
    expect(preview).not.toHaveBeenCalled();
  },
);
