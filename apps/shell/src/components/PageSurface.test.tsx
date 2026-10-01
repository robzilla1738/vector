// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import type { PageTarget } from "@aux/contracts";
import { afterEach, expect, it, vi } from "vitest";

const { surfaceContentId } = vi.hoisted(() => ({ surfaceContentId: vi.fn() }));
vi.mock("../bridge", () => ({
  inNativeHost: true,
  inMock: false,
  bridge: { windowId: "main", surfaceContentId },
}));
vi.mock("./surfaces", () => ({ MockPage: () => null }));

import { PageSurface } from "./PageSurface";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((accept) => {
    resolve = accept;
  });
  return { promise, resolve };
}

afterEach(() => {
  surfaceContentId.mockReset();
  vi.unstubAllGlobals();
});

it("embeds only an opaque content ID for the current document and discards a stale reply", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const first = deferred<string | null>();
  const second = deferred<string | null>();
  surfaceContentId.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
  const node = document.createElement("div");
  document.body.append(node);
  const root = createRoot(node);
  const page = { pageId: "page-1", documentEpoch: 1, title: "Example" } as PageTarget;

  try {
    await act(async () => root.render(<PageSurface page={page} />));
    await act(async () => root.render(<PageSurface page={{ ...page, documentEpoch: 2 }} />));
    await act(async () => first.resolve("stale-id"));
    expect(node.querySelector("embed")).toBeNull();
    await act(async () => second.resolve("opaque-content-id"));
    const embed = node.querySelector("embed");
    expect(embed?.getAttribute("type")).toBe("application/x-chromium-surface-embed");
    expect(embed?.getAttribute("data-content-id")).toBe("opaque-content-id");
    expect(embed?.getAttribute("aria-label")).toBe("Example");
  } finally {
    await act(async () => root.unmount());
    node.remove();
  }
});

it("shows an attach failure with retry instead of mounting an invalid embed", async () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  surfaceContentId.mockResolvedValueOnce(null).mockResolvedValueOnce("attached-id");
  const node = document.createElement("div");
  document.body.append(node);
  const root = createRoot(node);
  const page = { pageId: "page-2", documentEpoch: 0, title: "Unavailable" } as PageTarget;

  try {
    await act(async () => root.render(<PageSurface page={page} />));
    expect(node.querySelector("embed")).toBeNull();
    expect(node.textContent).toContain("not available");
    await act(async () => (node.querySelector("button") as HTMLButtonElement).click());
    expect(node.querySelector("embed")?.getAttribute("data-content-id")).toBe("attached-id");
  } finally {
    await act(async () => root.unmount());
    node.remove();
  }
});
