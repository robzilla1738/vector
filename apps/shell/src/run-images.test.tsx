// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { RunImages } from "./components/RunImages";
import { bridge } from "./bridge";
import { useStore } from "./store";
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
it("defers image reads until expansion and keeps usable images when another read fails", async () => {
  const artifacts = ["good", "missing"].map((artifactId, index) => ({
    artifactId,
    mediaType: "image/png",
    status: "complete",
    size: 100,
    createdAt: index,
    path: "unused",
  }));
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
    if (method === "artifacts.list") return artifacts;
    if (method === "artifacts.read") {
      if ((params as { artifactId: string }).artifactId === "missing") throw new Error("Image unavailable");
      return { artifact: artifacts[0], dataBase64: "c3ludGhldGlj" };
    }
    throw new Error(method);
  });
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<RunImages runId="run" />));
    expect(invoke.mock.calls.filter(([method]) => method === "artifacts.read")).toHaveLength(0);
    const gallery = host.querySelector("details")!;
    await act(async () => {
      gallery.open = true;
      gallery.dispatchEvent(new Event("toggle"));
    });
    expect(invoke.mock.calls.filter(([method]) => method === "artifacts.read")).toHaveLength(2);
    expect(host.querySelectorAll("img")).toHaveLength(1);
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Image unavailable");
    expect(host.querySelector("button")?.textContent).toBe("Retry image");
  } finally {
    await act(async () => root.unmount());
    vi.restoreAllMocks();
  }
});

it("exports an oversized original without reading its bytes or publishing a retired turn's save", async () => {
  const initial = useStore.getState();
  useStore.setState({ toasts: [] });
  const artifact = {
    artifactId: "large-original",
    mediaType: "image/png",
    status: "complete",
    size: 20_000_000,
    createdAt: 1,
    path: "/owned/full-resolution.png",
  };
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "artifacts.list") return [artifact];
    throw new Error(`Unexpected inline read: ${method}`);
  });
  let saved!: (path: string | null) => void;
  const save = vi.spyOn(bridge, "saveStoredArtifact").mockImplementation(
    () =>
      new Promise((resolve) => {
        saved = resolve;
      }),
  );
  const host = document.createElement("div"),
    root = createRoot(host);
  try {
    await act(async () => root.render(<RunImages runId="original" />));
    const gallery = host.querySelector("details")!;
    await act(async () => {
      gallery.open = true;
      gallery.dispatchEvent(new Event("toggle"));
    });
    expect(host.querySelectorAll("figure")).toHaveLength(1);
    expect(host.textContent).toContain("20.0 MB");
    expect(host.textContent).toContain("too large for inline preview");
    await act(async () => {
      host.querySelector("button")!.click();
      host.querySelector("button")!.click();
    });
    expect(save).toHaveBeenCalledExactlyOnceWith("large-original", "full-resolution.png");
    await act(async () => root.render(<RunImages runId="replacement" />));
    await act(async () => saved("/chosen/full-resolution.png"));
    expect(invoke.mock.calls.some(([method]) => method === "artifacts.read")).toBe(false);
    expect(useStore.getState().toasts).toEqual([]);
  } finally {
    await act(async () => root.unmount());
    useStore.setState(initial, true);
    vi.restoreAllMocks();
  }
});
