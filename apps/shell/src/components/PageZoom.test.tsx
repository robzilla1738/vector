// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { useStore } from "../store";
import { PageZoom } from "./PageZoom";

it("can reset a 100% site override to a different Profile default", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const previous = useStore.getState();
  const zoomPage = vi.fn(async (_pageId: string, options?: { reset?: boolean }) => {
    if (options?.reset) useStore.setState({ zoomLevels: { site: Math.log(5) / Math.log(1.2) } });
  });
  useStore.setState({ zoomLevels: { site: 0 }, zoomPage });
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<PageZoom pageId="site" />));
    const reset = [...host.querySelectorAll("button")].find((button) => button.textContent === "Reset")!;
    expect(reset.disabled).toBe(false);
    await act(async () => reset.click());
    expect(zoomPage).toHaveBeenCalledWith("site", { reset: true });
    expect(host.querySelector("output")?.textContent).toBe("500%");
  } finally {
    await act(async () => root.unmount());
    useStore.setState(previous, true);
    vi.unstubAllGlobals();
  }
});
